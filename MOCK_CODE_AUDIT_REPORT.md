# Mock Code & Placeholder Implementation Audit Report
**Generated:** January 18, 2026

---

## Executive Summary
Found **78 total matches** across service files containing mock data, placeholders, TODOs, FIXMEs, and fallback implementations. **9 services** require significant refactoring to replace mock implementations with real database queries and API integrations.

---

## Priority Rankings (By Frequency of Issues)

### 🔴 CRITICAL PRIORITY - Implement Real APIs/Database Calls

#### 1. **courier.service.ts** - 14 Issues
**Status:** Heavily relies on mock responses and hardcoded data

| Line | Issue | Type | Description |
|------|-------|------|-------------|
| 147 | `// TODO: Implement actual JNE API call using fetch` | TODO | JNE API integration not implemented |
| 148-159 | Mock JNE response object | MOCK | Returns hardcoded mock response instead of real JNE API call |
| 161 | `// Parse JNE response (mock response uses camelCase)` | MOCK | Comment acknowledges mock usage |
| 176 | `// Fallback to mock if API fails (for development)` | FALLBACK | Falls back to mock in development |
| 178 | `logger.warn('Using mock JNE response due to API error')` | MOCK | Logs mock response usage |
| 184 | `cost: request.weight * 5000, // Mock cost` | MOCK | Hardcoded mock cost calculation |
| 237 | `// TODO: Implement actual J&T API call using fetch` | TODO | J&T API integration not implemented |
| 238-249 | Mock J&T response object | MOCK | Returns hardcoded mock response for J&T |
| 251 | `// Parse J&T response (mock response uses camelCase)` | MOCK | Another mock acknowledgment |
| 267 | `logger.warn('Using mock J&T response due to API error')` | MOCK | Logs mock J&T usage |
| 297 | `// Mock response for now` | MOCK | Shipment query returns mock |
| 342 | `// Mock response` | MOCK | Another hardcoded mock response |
| 377 | `// Mock response` | MOCK | Shipping rate estimation is mocked |
| 406 | `// Mock response` | MOCK | Tracking status is mocked |

**Fix Required:** 
- Integrate real JNE API endpoints
- Integrate real J&T API endpoints  
- Replace all mock responses with actual API calls
- Implement proper error handling beyond mock fallbacks

---

#### 2. **push-notification.service.ts** - 10 Issues
**Status:** Mock provider implemented, placeholder database integration

| Line | Issue | Type | Description |
|------|-------|------|-------------|
| 9 | `provider: 'FIREBASE' \| 'ONESIGNAL' \| 'MOCK'` | MOCK | MOCK provider type defined |
| 38 | `provider: (process.env.PUSH_PROVIDER as ...) \|\| 'MOCK'` | MOCK | Defaults to MOCK provider |
| 57 | `case 'MOCK':` | MOCK | Switch case for MOCK provider |
| 59 | `return await this.sendViaMock(input);` | MOCK | Routes to mock implementation |
| 204-214 | `sendViaMock()` method | MOCK | Mock push notification implementation |
| 207 | `logger.info(\`[MOCK PUSH]...\`)` | MOCK | Logs mock push sent |
| 214 | `messageId: \`mock-push-${Date.now()}\`` | MOCK | Mock message ID generation |
| 229 | `// For now, this is a placeholder structure` | PLACEHOLDER | Device token retrieval is placeholder |
| 233 | `// TODO: Fetch device tokens from database` | TODO | Database integration missing |
| 239 | `// Mock device tokens for now` | MOCK | Empty mock device token array |

**Fix Required:**
- Remove MOCK provider option (for production)
- Implement database query to fetch device tokens from `deviceToken` table
- Connect to real FIREBASE or ONESIGNAL APIs
- Test multi-user push notification delivery

---

#### 3. **sms-gateway.service.ts** - 9 Issues
**Status:** MOCK SMS provider fully functional but needs production API

| Line | Issue | Type | Description |
|------|-------|------|-------------|
| 9 | `provider: 'TWILIO' \| 'ZENZIVA' \| 'MOCK'` | MOCK | MOCK provider type defined |
| 36 | `provider: (process.env.SMS_PROVIDER...) \|\| 'MOCK'` | MOCK | Defaults to MOCK provider (2 matches) |
| 55 | `case 'MOCK':` | MOCK | Switch case for MOCK provider |
| 57 | `return await this.sendViaMock(input);` | MOCK | Routes to mock SMS implementation |
| 158 | `* Mock SMS sending (for development/testing)` | MOCK | Mock documentation |
| 160 | `private async sendViaMock(input: SendSMSInput)` | MOCK | Mock SMS method |
| 161 | `logger.info(\`[MOCK SMS]...\`)` | MOCK | Logs mock SMS sent |
| 168 | `messageId: \`mock-${Date.now()}\`` | MOCK | Mock message ID generation |

**Fix Required:**
- Ensure TWILIO or ZENZIVA is configured in production
- Remove MOCK provider or gate it to development only
- Verify API credentials in environment variables
- Test SMS delivery with real phone numbers

---

#### 4. **whatsapp.service.ts** - 8 Issues
**Status:** MOCK WhatsApp provider implemented

| Line | Issue | Type | Description |
|------|-------|------|-------------|
| 10 | `provider: 'TWILIO' \| 'WABA' \| 'FONNTE' \| 'MOCK'` | MOCK | MOCK provider type defined |
| 42 | `provider: (process.env.WHATSAPP_PROVIDER...) \|\| 'MOCK'` | MOCK | Defaults to MOCK provider (2 matches) |
| 64 | `case 'MOCK':` | MOCK | Switch case for MOCK provider |
| 65 | `return await this.sendViaMock(input);` | MOCK | Routes to mock WhatsApp implementation |
| 199 | `* Mock send for testing` | MOCK | Mock documentation |
| 201 | `private async sendViaMock(input: SendWhatsAppInput)` | MOCK | Mock WhatsApp method |
| 202 | `logger.info(\`[MOCK] WhatsApp message...\`)` | MOCK | Logs mock WhatsApp sent |
| 206 | `messageId: \`mock_${Date.now()}\`` | MOCK | Mock message ID generation |

**Fix Required:**
- Ensure TWILIO, WABA, or FONNTE is configured in production
- Remove MOCK provider or gate it to development only
- Test WhatsApp delivery with real phone numbers

---

### 🟠 HIGH PRIORITY - Implement Database Integration

#### 5. **marketing.service.ts** - 5 Issues
**Status:** Campaign sending has placeholder/mock structure for push notifications

| Line | Issue | Type | Description |
|------|-------|------|-------------|
| 211 | `// For now, this is a placeholder structure` | PLACEHOLDER | SMS campaign structure is placeholder |
| 276 | `// For now, this is a placeholder structure` | PLACEHOLDER | Push notification campaign is placeholder |
| 279 | `// Mock push notification sending` | MOCK | Push campaign uses mock sending |

**Fix Required:**
- Implement actual SMS campaign delivery via smsGatewayService
- Implement actual push notification delivery via pushNotificationService  
- Add campaign delivery tracking and reporting
- Store campaign performance metrics

---

#### 6. **subscription.service.ts** - 5 Issues
**Status:** Multiple fallback scenarios indicate incomplete data handling

| Line | Issue | Type | Description |
|------|-------|------|-------------|
| 791 | `// This is a fallback if we can't find history or previous subscription` | FALLBACK | Missing subscription history data |
| 848 | `// Fallback: if we can't find originalSubscriptionEnd, use current time` | FALLBACK | Missing originalSubscriptionEnd in data model |
| 1053 | `// But we don't have that info, so we'll use a fallback` | FALLBACK | Upgrade calculation missing data |
| 1054 | `logger.warn(\`Could not find originalSubscriptionEnd for tenant...\`)` | FALLBACK | Warns about missing data |
| 1105 | `// Fallback: if we can't find originalSubscriptionEnd, use current time` | FALLBACK | Another fallback for missing data |

**Fix Required:**
- Ensure subscription history is properly tracked in database
- Add originalSubscriptionEnd field to subscription model if missing
- Migrate existing data to populate missing fields
- Remove fallback scenarios once data is complete

---

#### 7. **finance.service.ts** - 1 Critical Issue
**Status:** Liabilities calculation completely mocked

| Line | Issue | Type | Description |
|------|-------|------|-------------|
| 220 | `// Liabilities (mock - in production, you'd have a liabilities table)` | MOCK | Entire liabilities calculation mocked |

**Fix Required:**
- Create liabilities table in database
- Integrate liabilities data into balance sheet calculations
- Implement accounts payable tracking

---

### 🟡 MEDIUM PRIORITY - Code Cleanup & Fallback Optimization

#### 8. **payment.service.ts** - 2 Issues
**Status:** Fallback logic for tenant/order identification

| Line | Issue | Type | Description |
|------|-------|------|-------------|
| 232 | `// Fallback: Try to parse from orderId (old format)` | FALLBACK | Old format fallback for parsing |
| 256 | `// Fallback: Get tenant from email` | FALLBACK | Email-based tenant lookup fallback |

**Fix Required:**
- Verify order format migration is complete
- Test tenant resolution logic with current data format
- Consider deprecation timeline for old format support

---

#### 9. **report.service.ts** - 3 Issues  
**Status:** Excel export fallbacks to CSV

| Line | Issue | Type | Description |
|------|-------|------|-------------|
| 480 | `// exceljs not installed, will use CSV fallback` | FALLBACK | Missing Excel library dependency |
| 485 | `// Fallback: return CSV as Excel-compatible format` | FALLBACK | CSV fallback for Excel export |
| 534 | `// Fallback to CSV` | FALLBACK | Another CSV fallback |

**Fix Required:**
- Verify exceljs package is installed or install it
- Implement proper Excel (.xlsx) export
- Keep CSV export as secondary option, not primary fallback

---

### 🟢 LOW PRIORITY - Optimization & Best Practices

#### 10. **Other Services with Minor Issues (3-5 Fallbacks Each)**

**courier.service.ts, advanced-reporting.service.ts, tenant.service.ts, user-status.service.ts, 2fa.service.ts**
- Fallback scenarios that are reasonable but could be optimized
- Most are error recovery mechanisms, not mock data
- Review for clarity and performance optimization

---

## Summary Table: Services by Issue Count

| Rank | Service | Mock Issues | TODO Issues | Fallback Issues | Total | Priority |
|------|---------|------------|-------------|-----------------|-------|----------|
| 1 | courier.service.ts | 11 | 2 | 1 | 14 | 🔴 CRITICAL |
| 2 | push-notification.service.ts | 8 | 1 | 1 | 10 | 🔴 CRITICAL |
| 3 | sms-gateway.service.ts | 8 | 0 | 0 | 8 | 🔴 CRITICAL |
| 4 | whatsapp.service.ts | 8 | 0 | 0 | 8 | 🔴 CRITICAL |
| 5 | marketing.service.ts | 2 | 0 | 2 | 4 | 🟠 HIGH |
| 6 | subscription.service.ts | 0 | 0 | 5 | 5 | 🟠 HIGH |
| 7 | finance.service.ts | 1 | 0 | 0 | 1 | 🟠 HIGH |
| 8 | payment.service.ts | 0 | 0 | 2 | 2 | 🟡 MEDIUM |
| 9 | report.service.ts | 0 | 0 | 3 | 3 | 🟡 MEDIUM |
| 10 | Multiple Others | 12 | 0 | 8 | 20 | 🟢 LOW |
| **TOTALS** | **9 Services** | **50** | **3** | **22** | **78** | |

---

## Implementation Roadmap

### Phase 1 (CRITICAL - Week 1)
1. **courier.service.ts**: Implement JNE and J&T real API calls
2. **sms-gateway.service.ts**: Verify TWILIO/ZENZIVA production configuration
3. **whatsapp.service.ts**: Verify TWILIO/WABA/FONNTE production configuration
4. **push-notification.service.ts**: Implement device token database fetching

### Phase 2 (HIGH - Week 2-3)
5. **subscription.service.ts**: Ensure subscription history completeness
6. **finance.service.ts**: Implement liabilities table and integration
7. **marketing.service.ts**: Connect real API calls to campaign sending

### Phase 3 (MEDIUM - Week 4)
8. **payment.service.ts**: Finalize order format migration
9. **report.service.ts**: Implement proper Excel export

### Phase 4 (LOW - Week 5)
10. Code cleanup, fallback optimization, and performance tuning

---

## Notes
- Many "fallback" implementations are reasonable error recovery mechanisms
- Mock providers in SMS, WhatsApp, and Push services are good for development but must be disabled in production
- Most critical issue is **courier.service.ts** with TODO comments for core APIs
- Subscription service needs data model audit to verify all fields exist
- Finance service requires new database table for liabilities tracking
