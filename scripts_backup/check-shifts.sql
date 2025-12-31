-- Check for open shifts that might be stuck
SELECT 
    id,
    "tenantId",
    "kasirId",
    status,
    "shiftStart",
    "shiftEnd",
    "modalAwal",
    created_at
FROM "CashShift"
WHERE status = 'open'
ORDER BY "shiftStart" DESC;

-- Check for open store shifts
SELECT 
    id,
    "tenantId",
    "outletId",
    status,
    "shiftType",
    "openedAt",
    "closedAt",
    created_at
FROM "StoreShift"
WHERE status = 'open'
ORDER BY "openedAt" DESC;

