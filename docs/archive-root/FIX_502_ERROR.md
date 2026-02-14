# 🔧 TUNNEL 502 ERROR - ROOT CAUSE & SOLUTION

**Error**: `dial tcp: lookup nginx on 127.0.0.11:53: no such host`  
**Time**: 2026-01-21 15:33:35 UTC

---

## 🔍 ROOT CAUSE

1. **Nginx service crashing**: Nginx config references non-existent upstreams (`warungin-grafana:3000`)
2. **Tunnel routing broken**: Tunnel trying to reach `http://nginx:80` but Nginx is in restart loop
3. **DNS resolution failed**: Tunnel container cannot resolve hostname in Docker network

---

## ✅ FIX APPLIED

### STEP 1: Bypass Nginx - Direct routing ✅
**Created**: `/root/New-Warungin/tunnel-config.yml`

```yaml
tunnel: bbf00287-7974-46ea-b0fa-095ba6973892
credentials-file: /root/New-Warungin/credentials/bbf00287-7974-46ea-b0fa-095ba6973892.json

ingress:
  - hostname: pos.faiznute.site
    service: http://warungin-frontend:80          # Direct to frontend
  - hostname: api.pos.faiznute.site
    service: http://warungin-backend:3000         # Direct to backend
  - hostname: monitoring.pos.faiznute.site
    service: http://warungin-grafana:3000         # Direct to Grafana
  - service: http_status:404                      # Default 404
```

### STEP 2: Updated docker-compose ✅
**Changed**:
- From: `command: tunnel --no-autoupdate --protocol tcp run`
- To: `command: tunnel --no-autoupdate --config /etc/cloudflared/config.yml run`

Added volumes:
```yaml
volumes:
  - ./tunnel-config.yml:/etc/cloudflared/config.yml:ro
  - ./credentials/bbf00287-7974-46ea-b0fa-095ba6973892.json:/etc/cloudflared/creds.json:ro
```

### STEP 3: Fixed dependencies ✅
**Changed**:
- From: `depends_on: nginx (service_started)`
- To: `depends_on: frontend, backend, grafana (service_healthy)`

---

## 📊 CURRENT STATUS

**Tunnel**: Started with 4 connections registered ✅

But **config not updated yet** because:
- Credentials file still has OLD tunnel embedded config
- Need REAL credentials JSON for new tunnel: `bbf00287-7974-46ea-b0fa-095ba6973892`

---

## 🎯 WHAT'S NEEDED

### **User Action Required:**

1. **Download credentials untuk new tunnel:**
   - Go to: https://dash.cloudflare.com/
   - Zero Trust → Tunnels → warungin-pos
   - Find tunnel ID: `bbf00287-7974-46ea-b0fa-095ba6973892`
   - Click: "Configure" → Show token / Download

2. **Provide the JSON credentials content** (or full token string)

3. Once provided, I will:
   - Update credentials file with real content
   - Tunnel will load correct routing config
   - 502 error will be fixed ✅

---

## 🌐 EXPECTED ROUTES (After fix)

```
pos.faiznute.site              → warungin-frontend:80   (Website)
api.pos.faiznute.site          → warungin-backend:3000  (API)
monitoring.pos.faiznute.site   → warungin-grafana:3000  (Monitoring)
```

---

## 📋 STEP-BY-STEP TO FIX

### Step 1: Get credentials from CloudFlare ⏳

```
Tunnel: warungin-pos
ID: bbf00287-7974-46ea-b0fa-095ba6973892
```

Download JSON or copy token

### Step 2: Provide to me

### Step 3: I update credentials file

### Step 4: Tunnel reloads config

### Step 5: Test: `https://pos.faiznute.site/` → No more 502 ✅

---

## 🔗 CNAME SETUP (For reference)

Once tunnel is working, setup DNS:

**In CloudFlare DNS tab:**
| Type | Name | Target |
|------|------|--------|
| CNAME | pos | bbf00287-7974-46ea-b0fa-095ba6973892.cfargotunnel.com |
| CNAME | api | bbf00287-7974-46ea-b0fa-095ba6973892.cfargotunnel.com |
| CNAME | monitoring | bbf00287-7974-46ea-b0fa-095ba6973892.cfargotunnel.com |

---

## 📁 FILES READY

✅ `/root/New-Warungin/tunnel-config.yml` - Config with 3 routes  
✅ `/root/New-Warungin/docker-compose.yml` - Updated with config file mount  
⏳ `/root/New-Warungin/credentials/bbf00287-7974-46ea-b0fa-095ba6973892.json` - Needs REAL credentials

---

**Next**: Provide credentials JSON for new tunnel → 502 fixed
