# Phase 30 - Comprehensive Monitoring Setup

## Overview

Phase 30 establishes a complete monitoring infrastructure for the Warungin application using:
- **Prometheus** for metrics collection and storage
- **Grafana** for visualization and dashboards
- **AlertManager** for alert routing and notifications
- **Custom metrics** from the Phase 28 features (bulk ops, search, import/export)

## Architecture

```
Backend (Port 3000)
    ↓
Metrics Endpoint (/metrics)
    ↓
Prometheus (Port 9090)
    ↓ Scrapes every 15s
Metrics Database
    ↓
Grafana (Port 3000)
    ↓
Dashboards & Visualization
    ↓
AlertManager (Port 9093)
    ↓
Slack / Email Notifications
```

## Components

### 1. Prometheus Configuration
**File**: `monitoring/prometheus/prometheus.yml`

Key features:
- 15-second scrape interval for real-time metrics
- Scrapes backend metrics endpoint (`/metrics`)
- Evaluates alert rules every 30 seconds
- 15-day default retention period

Scrape jobs configured:
- **backend**: Node.js metrics from `/metrics` endpoint
- **prometheus**: Self-monitoring
- **docker**: Container metrics (optional)
- **postgres**: Database metrics (if postgres_exporter available)
- **redis**: Cache metrics (if redis_exporter available)

### 2. Alert Rules
**File**: `monitoring/prometheus/alert-rules.yml`

#### API Performance Alerts
- **HighErrorRate**: > 5% 5xx errors in 5m window
- **SlowAPIResponse**: P95 response time > 1 second
- **ServiceDown**: Backend service unreachable for > 1 minute

#### Resource Utilization Alerts
- **HighMemoryUsage**: > 500MB resident memory
- **HighCPUUsage**: > 80% CPU utilization
- **HighDatabaseConnections**: > 50 active connections

#### Business Metrics Alerts
- **LowOutletAvailability**: < 95% outlets active
- **BulkOperationFailures**: > 10% bulk operation failure rate
- **ExportQueueBacklog**: > 100 pending exports

#### Infrastructure Alerts
- **LowDiskSpace**: < 10% disk available
- **HighNetworkErrors**: > 10 errors/second

### 3. AlertManager Configuration
**File**: `monitoring/alertmanager/alertmanager.yml`

Features:
- **Routing**: Different channels for critical vs warning alerts
- **Grouping**: Aggregates similar alerts by alertname and instance
- **Deduplication**: Prevents duplicate alerts
- **Inhibition**: Suppresses warnings when critical alert is firing

Notification channels:
- **Slack** (#alerts, #critical-alerts, #warnings)
- **Email** for critical alerts only
- Configurable group wait (0s for critical, 30s for warning)

### 4. Grafana Dashboard
**File**: `monitoring/grafana/dashboards/outlet-metrics.json`

**Panels**:

1. **Request Rate (5m)** - Requests per second over time
   - Threshold: None (informational)
   - Helps identify traffic patterns

2. **API Response Time P95** - 95th percentile response time
   - Yellow: 500ms
   - Red: 1000ms
   - Critical for user experience

3. **Error Rate (5xx)** - Percentage of failed requests
   - Red: > 5%
   - Indicates system health

4. **Memory Usage (%)** - Process memory consumption
   - Yellow: 70%
   - Red: 90% (of 256MB limit)

5. **CPU Usage** - Accumulated CPU seconds
   - Yellow: 60%
   - Red: 80%

6. **Total Requests** - Cumulative request count
   - Useful for capacity planning

**Refresh Rate**: 10 seconds
**Time Range**: Last 1 hour

## Deployment Steps

### Step 1: Verify Backend Metrics Endpoint

```bash
curl http://localhost:3000/metrics
```

Expected response: Prometheus-formatted metrics

### Step 2: Update docker-compose.yml

Add monitoring services:
```yaml
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus:/etc/prometheus
    - prometheus_data:/prometheus
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
    - '--storage.tsdb.path=/prometheus'

grafana:
  image: grafana/grafana:latest
  ports:
    - "3001:3000"  # Use 3001 to avoid backend conflict
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
    - GF_USERS_ALLOW_SIGN_UP=false
  volumes:
    - ./monitoring/grafana:/etc/grafana/provisioning
    - grafana_data:/var/lib/grafana

alertmanager:
  image: prom/alertmanager:latest
  ports:
    - "9093:9093"
  volumes:
    - ./monitoring/alertmanager:/etc/alertmanager
```

### Step 3: Deploy Services

```bash
cd /root/New-Warungin
docker compose up -d prometheus grafana alertmanager
```

### Step 4: Verify Services

```bash
# Check Prometheus
curl http://localhost:9090/api/v1/targets

# Check Grafana (default: admin/admin)
curl http://localhost:3001/api/health

# Check AlertManager
curl http://localhost:9093/api/v1/alerts
```

### Step 5: Configure Grafana

1. Open browser: `http://192.168.1.101:3001`
2. Login: admin / admin
3. Add Prometheus datasource:
   - URL: `http://prometheus:9090`
   - Save & Test
4. Import dashboard from `outlet-metrics.json`

### Step 6: Configure Notifications

Edit `monitoring/alertmanager/alertmanager.yml`:

```yaml
global:
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
```

Obtain Slack webhook:
1. Go to Slack workspace settings
2. Create incoming webhook
3. Paste URL into alertmanager config
4. Restart alertmanager: `docker compose restart alertmanager`

## Monitoring Outlet Features (Phase 28)

### Custom Metrics Exported

The backend exports these custom metrics:

```
# Bulk Operations
bulk_operations_total{endpoint} - Total bulk operations
bulk_operations_failed_total{endpoint} - Failed operations
bulk_operations_duration_seconds{endpoint} - Operation duration

# Search Operations
search_requests_total{type} - Advanced search requests
search_duration_seconds{type} - Search response time
search_results_returned{type} - Results per search

# Import/Export
import_requests_total - Import attempts
import_rows_processed_total - Rows imported
import_errors_total - Import errors
export_requests_total - Export attempts
export_queue_pending - Pending exports
export_duration_seconds - Export time

# Outlet Metrics
outlet_total - Total outlets
outlet_active - Active outlets
outlet_updated_total - Total updates
outlet_search_hits_total - Search hits
```

### Alert Rules for Phase 28 Features

1. **Bulk Operations**
   - Failure rate > 10% → Warning
   - Average duration > 5s → Warning

2. **Advanced Search**
   - P95 response time > 500ms → Warning
   - Error rate > 5% → Warning

3. **Import/Export**
   - Queue backlog > 100 items → Warning
   - Import error rate > 5% → Warning

## Metrics Collection Flow

```
Backend Application
├── Increments counters (operations, errors)
├── Records histograms (response times)
└── Updates gauges (active connections, memory)
        ↓
    /metrics endpoint
        ↓
    Prometheus scrapes (every 15s)
        ↓
    Time-series database
        ↓
    Alert evaluation (every 30s)
        ↓
    Alert rules matched
        ↓
    AlertManager routing
        ↓
    Slack/Email notifications
        ↓
    Grafana queries metrics
        ↓
    Dashboard displays
```

## Dashboarding Best Practices

### For Developers
- Watch Request Rate and Error Rate
- Monitor Response Time P95 for performance regressions
- Check for memory leaks (rising memory baseline)

### For Operations
- Monitor CPU and Memory for capacity planning
- Watch disk space for storage issues
- Track network errors for infrastructure problems

### For Business
- Outlet availability percentage
- Bulk operation success rate
- Search performance and usage
- Export/import job queue health

## Troubleshooting

### Prometheus not scraping metrics

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check target status
docker compose logs prometheus | grep "error"
```

### Alerts not firing

```bash
# Verify alert rules loaded
curl http://localhost:9090/api/v1/rules

# Check AlertManager alerts
curl http://localhost:9093/api/v1/alerts
```

### Grafana dashboard shows no data

1. Check Prometheus datasource connection
2. Verify query syntax (test in Prometheus UI)
3. Check metrics are being exported (`/metrics` endpoint)
4. Verify scrape_interval matches dashboard time range

### High false positives

Adjust alert thresholds in `alert-rules.yml`:
- Increase `for:` duration (e.g., from 5m to 10m)
- Raise value thresholds based on actual baselines
- Add inhibition rules to prevent cascading alerts

## Production Considerations

### Prometheus Retention
- Default: 15 days
- For long-term: Consider Prometheus remote storage (e.g., S3)
- Adjust in prometheus.yml: `--storage.tsdb.retention.time=30d`

### Grafana High Availability
- Deploy multiple Grafana instances with shared PostgreSQL backend
- Configure session store for load balancer distribution
- Use reverse proxy (nginx) for failover

### AlertManager Clustering
- Deploy multiple AlertManager instances
- Use `--cluster.listen-address=` flag
- Configure peer discovery for synchronization

### Backup
- Backup Grafana dashboards regularly
- Export alerts from Prometheus
- Version control monitoring configs

## Phase 30 Metrics Summary

| Metric | Type | Purpose |
|--------|------|---------|
| http_requests_total | Counter | Track total requests |
| http_request_duration_seconds | Histogram | Measure response times |
| process_resident_memory_bytes | Gauge | Monitor memory usage |
| process_cpu_seconds_total | Counter | Track CPU consumption |
| bulk_operations_total | Counter | Count bulk operations |
| search_duration_seconds | Histogram | Search performance |
| import_queue_pending | Gauge | Import backlog |
| outlet_active | Gauge | Current outlet status |

## Next Steps (Phase 31)

- Security audit of monitoring stack
- Add custom security metrics
- Implement rate limiting alerts
- Create security dashboard
