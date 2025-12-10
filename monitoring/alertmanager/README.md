# Alertmanager Configuration

Alertmanager handles alert routing and notifications for Prometheus alerts.

## Configuration

### Environment Variables

Set these environment variables in your `.env` file or `docker-compose.monitoring.yml`:

#### Slack Configuration (Optional)
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_CHANNEL=alerts
SLACK_CHANNEL_CRITICAL=alerts-critical
```

#### Email Configuration (Optional)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_FROM=alerts@warungin.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ALERT_EMAIL_TO=admin@warungin.com
```

## Setup Instructions

### 1. Slack Setup

1. Go to https://api.slack.com/apps
2. Create a new app or select existing app
3. Go to "Incoming Webhooks"
4. Activate Incoming Webhooks
5. Add New Webhook to Workspace
6. Select channel (e.g., #alerts)
7. Copy webhook URL
8. Set `SLACK_WEBHOOK_URL` in environment variables

### 2. Email Setup (Gmail Example)

1. Enable 2-Factor Authentication on Gmail
2. Generate App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Copy the 16-character password
3. Set environment variables:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_FROM=your-email@gmail.com
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   ALERT_EMAIL_TO=admin@warungin.com
   ```

### 3. Other Email Providers

#### Outlook/Office365
```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_FROM=your-email@outlook.com
SMTP_USERNAME=your-email@outlook.com
SMTP_PASSWORD=your-password
```

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_FROM=alerts@warungin.com
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

#### AWS SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_FROM=alerts@warungin.com
SMTP_USERNAME=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

## Alert Routing

### Critical Alerts
- **Severity**: `critical`
- **Channels**: Slack (#alerts-critical) + Email
- **Repeat Interval**: 1 hour
- **Group Wait**: 5 seconds

### Warning Alerts
- **Severity**: `warning`
- **Channels**: Slack (#alerts) + Email
- **Repeat Interval**: 6 hours
- **Group Wait**: 30 seconds

## Testing

### Test Alertmanager Configuration
```bash
docker exec warungin-alertmanager amtool check-config /etc/alertmanager/alertmanager.yml
```

### Test Slack Notification
```bash
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {
      "alertname": "TestAlert",
      "severity": "critical"
    },
    "annotations": {
      "summary": "Test Alert",
      "description": "This is a test alert"
    }
  }]'
```

### Test Email Notification
Same as above - Alertmanager will send to configured email.

## Access Alertmanager UI

- **URL**: http://localhost:9093
- **Features**:
  - View active alerts
  - View alert history
  - Silence alerts
  - Test notifications

## Troubleshooting

### Alerts not being sent
1. Check Alertmanager logs: `docker logs warungin-alertmanager`
2. Verify environment variables are set
3. Check Alertmanager UI: http://localhost:9093
4. Verify Prometheus is sending alerts: Check Prometheus UI → Alerts

### Email not working
1. Verify SMTP credentials
2. Check firewall/network restrictions
3. For Gmail: Ensure App Password is used (not regular password)
4. Check Alertmanager logs for SMTP errors

### Slack not working
1. Verify webhook URL is correct
2. Check Slack channel exists
3. Verify webhook is active in Slack
4. Check Alertmanager logs for Slack errors

## Files

- `alertmanager.yml` - Main configuration
- `templates/slack.tmpl` - Slack notification templates
- `templates/email.tmpl` - Email notification templates

## Notes

- Both Slack and Email are optional - you can use one or both
- If environment variables are not set, Alertmanager will start but notifications won't work
- Critical alerts are sent more frequently than warnings
- Alerts are grouped by `alertname`, `severity`, and `cluster` to reduce noise

