# 🔧 FIX 502 ERROR - UPDATE CLOUDFLARE TUNNEL ROUTES

**Problem**: Tunnel routing still pointing to `http://nginx:80` instead of the services

**Root Cause**: CloudFlare tunnel dashboard has OLD routing config. When tunnel authenticates with token, it downloads the config from CloudFlare backend (which has wrong routes).

---

## ✅ SOLUTION: Update Tunnel Routes in CloudFlare Dashboard

### STEP 1: Go to CloudFlare Dashboard
1. **URL**: https://dash.cloudflare.com/
2. **Navigate**: Zero Trust → Tunnels
3. **Find Tunnel**: `warungin-pos` (ID: bbf00287-7974-46ea-b0fa-095ba6973892)

### STEP 2: Configure Public Hostnames
1. Click: Tunnel name `warungin-pos`
2. Go to: **Public Hostnames** tab
3. Click: **Add public hostname** (or edit existing)

### STEP 3: Add/Update Hostname Routes

**Delete old route**:
- Hostname: `pos.faiznute.site` 
- Service: `http://nginx:80`
- ❌ DELETE THIS

**Add 3 new routes**:

#### Route 1: Main Website
- **Domain**: `pos.faiznute.site`
- **Service**: `http://warungin-frontend:80`
- **Additional settings**: Leave default

#### Route 2: API
- **Domain**: `api.pos.faiznute.site`
- **Service**: `http://warungin-backend:3000`
- **Additional settings**: Leave default

#### Route 3: Monitoring
- **Domain**: `monitoring.pos.faiznute.site`
- **Service**: `http://warungin-grafana:3000`
- **Additional settings**: Leave default

### STEP 4: Save & Wait
- Click: Save
- Wait 30 seconds for tunnel to reload config

### STEP 5: Verify
1. Check tunnel logs:
```bash
docker logs warungin-cloudflared | grep "Updated to new configuration"
```

Should now show:
```
"ingress":[{"hostname":"pos.faiznute.site", "service":"http://warungin-frontend:80"}]
```

---

## 📊 Expected Ingress Config (After Update)

Tunnel logs should show:
```json
{
  "ingress": [
    {
      "hostname": "pos.faiznute.site",
      "service": "http://warungin-frontend:80"
    },
    {
      "hostname": "api.pos.faiznute.site",
      "service": "http://warungin-backend:3000"
    },
    {
      "hostname": "monitoring.pos.faiznute.site",
      "service": "http://warungin-grafana:3000"
    },
    {
      "service": "http_status:404"
    }
  ]
}
```

---

## 🌐 CNAME Records (After Routes Updated)

In CloudFlare DNS tab, add:

| Type | Name | Target | Notes |
|------|------|--------|-------|
| CNAME | pos | bbf00287-7974-46ea-b0fa-095ba6973892.cfargotunnel.com | Proxied (orange) |
| CNAME | api | bbf00287-7974-46ea-b0fa-095ba6973892.cfargotunnel.com | Proxied (orange) |
| CNAME | monitoring | bbf00287-7974-46ea-b0fa-095ba6973892.cfargotunnel.com | Proxied (orange) |

---

## ✨ After All Steps Complete

**Test in browser:**
```
https://pos.faiznute.site/           → Should show website
https://api.pos.faiznute.site/       → Should show API (or 404 if no /api route)
https://monitoring.pos.faiznute.site/  → Should show Grafana login
```

**502 error should be gone** ✅

---

## 📝 SUMMARY

1. ✅ Docker tunnel configured correctly
2. ✅ Services running (frontend, backend, grafana)
3. ⏳ **CloudFlare tunnel routes NOT updated** ← This is causing 502
4. ⏳ DNS CNAME records NOT set up yet

**Next Action**: Update tunnel routes in CloudFlare dashboard (steps 1-3 above)

Once routes are updated in CloudFlare → tunnel will reload config → 502 error fixed → test external access ✅

---

**Time to fix**: 5-10 minutes  
**Difficulty**: Easy (UI clicks only)
