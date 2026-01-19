# 🔍 PHASE 35: EXECUTABLE SEARCH COMMANDS (Copy-Paste Ready)

**Purpose**: Find all dummy data, mock API calls, and unimplemented features  
**Execute In**: PowerShell or Git Bash (Windows)  
**Time**: ~15 minutes for all searches  
**Output**: Lists to review + classify  

---

## SECTION 1: Frontend Dummy Data Searches

### Search 1.1: Find Dummy/Mock/Test Data Patterns
```bash
# Change to project root
cd "f:\Backup W11\Project\New-Warungin"

# Find all "mock", "dummy", "test data" in views
echo "=== DUMMY DATA PATTERNS ===" > phase35_search_results.txt
Write-Host "Searching for dummy data..." -ForegroundColor Green

Get-ChildItem -Path "client/src/views" -Include "*.vue" -Recurse | ForEach-Object {
  $content = Get-Content $_.FullName | Select-String -Pattern "dummy|mock|test.data|fake|HARDCODE" -CaseSensitive
  if ($content) { $_.FullName + " :: " + $content | Add-Content phase35_search_results.txt }
}

Get-Content phase35_search_results.txt | Select-Object -First 50
```

### Search 1.2: Find Hardcoded Arrays in Views
```bash
# Find const arrays that might be dummy data
Write-Host "Searching for hardcoded data arrays..." -ForegroundColor Green

Get-ChildItem -Path "client/src/views" -Include "*.vue" -Recurse | ForEach-Object {
  $lines = Get-Content $_.FullName
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "const.*=.*\[.*{.*:.*" -and $lines[$i] -notmatch "import") {
      "Line $($i+1): $($lines[$i])" | Add-Content phase35_search_results.txt
    }
  }
}

Get-Content phase35_search_results.txt | Tail -30
```

### Search 1.3: Find Hardcoded Numbers (Revenue, Orders, Stock)
```bash
# Find suspicious hardcoded numbers
Write-Host "Searching for hardcoded numbers..." -ForegroundColor Green

Get-ChildItem -Path "client/src/views" -Include "*.vue", "*.ts" -Recurse | ForEach-Object {
  $content = Get-Content $_.FullName | Select-String -Pattern ":\s*(100000|50000|1234|999|123456)" 
  if ($content) { 
    $_.FullName + " :: " + $content | Add-Content phase35_search_results.txt 
  }
}

Get-Content phase35_search_results.txt | Tail -20
```

### Search 1.4: Find API Calls to Undefined Endpoints
```bash
# Find all fetch/axios calls
Write-Host "Searching for API calls..." -ForegroundColor Green

$apiCalls = @()
Get-ChildItem -Path "client/src" -Include "*.vue", "*.ts" -Recurse | ForEach-Object {
  $content = Get-Content $_.FullName
  $matches = [regex]::Matches($content, "api\.get|api\.post|fetch\(['\"](/api/[^'\"]*)['\"]|axios\.(get|post)\(['\"](/api/[^'\"]*)['\"]")
  if ($matches) {
    foreach ($match in $matches) {
      $apiCalls += $match.Groups[0].Value
    }
  }
}

"API Calls found: " + $apiCalls.Count | Add-Content phase35_search_results.txt
$apiCalls | Sort-Object -Unique | Add-Content phase35_search_results.txt

Get-Content phase35_search_results.txt | Tail -30
```

---

## SECTION 2: Backend API Endpoint Searches

### Search 2.1: Find All Defined Backend Endpoints
```bash
# List all defined routes
Write-Host "Listing backend endpoints..." -ForegroundColor Green

$endpoints = @()
Get-ChildItem -Path "src/routes" -Include "*.ts" -Recurse | ForEach-Object {
  $content = Get-Content $_.FullName
  $matches = [regex]::Matches($content, "(router\.(get|post|put|delete|patch))\(['\"](/[^'\"]*)['\"]")
  foreach ($match in $matches) {
    $endpoints += $match.Groups[0].Value
  }
}

echo "=== BACKEND ENDPOINTS ===" | Add-Content phase35_search_results.txt
$endpoints | Sort-Object -Unique | Add-Content phase35_search_results.txt

Write-Host "Found $($endpoints.Count) endpoints" -ForegroundColor Green
Get-Content phase35_search_results.txt | Tail -30
```

### Search 2.2: Find Mock Response Objects
```bash
# Find responses that might be mock data
Write-Host "Searching for mock responses..." -ForegroundColor Green

Get-ChildItem -Path "src/routes" -Include "*.ts" -Recurse | ForEach-Object {
  $content = Get-Content $_.FullName | Select-String -Pattern "res\.json|res\.send" -Context 2, 0
  if ($content) { $_.FullName + " :: " + $content | Add-Content phase35_search_results.txt }
}

Get-Content phase35_search_results.txt | Tail -20
```

### Search 2.3: Find Services Without Database Calls
```bash
# Find service functions that might not hit database
Write-Host "Searching for services..." -ForegroundColor Green

Get-ChildItem -Path "src/services" -Include "*.ts" -Recurse | ForEach-Object {
  $lines = Get-Content $_.FullName
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "async\s+\w+\s*\(" -and $lines[$i+5] -notmatch "prisma|database|db\.") {
      "Line $($i+1) - Possible non-DB function: $($lines[$i])" | Add-Content phase35_search_results.txt
    }
  }
}

Get-Content phase35_search_results.txt | Tail -20
```

---

## SECTION 3: Database & Query Searches

### Search 3.1: Find All Prisma Queries
```bash
# List all database operations
Write-Host "Listing database queries..." -ForegroundColor Green

$queries = @()
Get-ChildItem -Path "src" -Include "*.ts" -Recurse | ForEach-Object {
  $content = Get-Content $_.FullName
  $matches = [regex]::Matches($content, "prisma\.\w+\.\w+")
  foreach ($match in $matches) {
    $queries += $match.Groups[0].Value
  }
}

echo "=== DATABASE OPERATIONS ===" | Add-Content phase35_search_results.txt
$queries | Sort-Object -Unique | Add-Content phase35_search_results.txt

Write-Host "Found $($queries.Count) unique database operations" -ForegroundColor Green
Get-Content phase35_search_results.txt | Tail -20
```

### Search 3.2: Find Missing tenant_id Filters
```bash
# Find queries that might not filter by tenant_id
Write-Host "Searching for queries without tenant filter..." -ForegroundColor Green

Get-ChildItem -Path "src/services" -Include "*.ts" -Recurse | ForEach-Object {
  $content = Get-Content $_.FullName | Select-String -Pattern "prisma\." | Select-String -NotMatch "tenant_id|tenantId"
  if ($content) { $_.FullName + " :: " + $content | Add-Content phase35_search_results.txt }
}

Get-Content phase35_search_results.txt | Tail -30
```

---

## SECTION 4: Code Quality Searches

### Search 4.1: Find All Console Logs
```bash
# Find all console.log statements (should be 0 in production)
Write-Host "Searching for console logs..." -ForegroundColor Yellow

$consoleLogs = 0
Get-ChildItem -Path "src", "client/src" -Include "*.ts", "*.vue", "*.js" -Recurse | ForEach-Object {
  $content = Get-Content $_.FullName | Select-String -Pattern "console\.log|console\.error|console\.warn"
  if ($content) { 
    $_.FullName + " :: " + $content | Add-Content phase35_search_results.txt
    $consoleLogs++
  }
}

echo "Found $consoleLogs files with console output" | Add-Content phase35_search_results.txt
Get-Content phase35_search_results.txt | Tail -20
```

### Search 4.2: Find TODO and FIXME Comments
```bash
# Find unfinished work
Write-Host "Searching for TODO/FIXME..." -ForegroundColor Yellow

Get-ChildItem -Path "src", "client/src" -Include "*.ts", "*.vue", "*.js" -Recurse | ForEach-Object {
  $content = Get-Content $_.FullName | Select-String -Pattern "TODO|FIXME|XXX|HACK|BUG"
  if ($content) { $_.FullName + " :: " + $content | Add-Content phase35_search_results.txt }
}

Get-Content phase35_search_results.txt | Tail -20
```

### Search 4.3: Find Unused Imports
```bash
# Find imports that might not be used
Write-Host "Searching for potential unused imports..." -ForegroundColor Yellow

Get-ChildItem -Path "src", "client/src" -Include "*.ts", "*.vue" -Recurse | ForEach-Object {
  $lines = Get-Content $_.FullName
  $importLines = $lines | Select-String -Pattern "^import"
  
  foreach ($importLine in $importLines) {
    # Extract import name
    $match = [regex]::Match($importLine, "import\s+{?\s*(\w+)")
    if ($match.Success) {
      $importName = $match.Groups[1].Value
      # Check if used later
      $used = $lines | Select-String -Pattern "\b$importName\b" | Where-Object { $_ -notmatch "import" }
      if (-not $used) {
        $_.FullName + " :: Unused import: $importName" | Add-Content phase35_search_results.txt
      }
    }
  }
}

Get-Content phase35_search_results.txt | Tail -20
```

---

## SECTION 5: Dashboard & Metrics Searches

### Search 5.1: Find All Dashboard Metrics
```bash
# Find dashboard component and its data sources
Write-Host "Searching for dashboard metrics..." -ForegroundColor Cyan

Get-ChildItem -Path "client/src/views" -Include "*[Dd]ashboard*.vue" -Recurse | ForEach-Object {
  echo "=== DASHBOARD FILE: $($_.Name) ===" | Add-Content phase35_search_results.txt
  $content = Get-Content $_.FullName | Select-String -Pattern "data:|computed:|metric|Revenue|Orders|Sales"
  $content | Add-Content phase35_search_results.txt
}

Get-Content phase35_search_results.txt | Tail -40
```

### Search 5.2: Find Hardcoded Dashboard Numbers
```bash
# Find numeric values in dashboard
Write-Host "Searching for dashboard hardcoded values..." -ForegroundColor Cyan

Get-ChildItem -Path "client/src/views" -Include "*[Dd]ashboard*.vue" -Recurse | ForEach-Object {
  $content = Get-Content $_.FullName | Select-String -Pattern ":\s*\d{4,}|total:\s*\d+|count:\s*\d+"
  if ($content) { $_.FullName + " :: " + $content | Add-Content phase35_search_results.txt }
}

Get-Content phase35_search_results.txt | Tail -20
```

---

## SECTION 6: Shift Lock Verification

### Search 6.1: Find Shift-Related Code
```bash
# Find all shift-related files and functions
Write-Host "Searching for shift lock implementation..." -ForegroundColor Magenta

$shiftFiles = Get-ChildItem -Path "src", "client/src" -Include "*shift*.ts", "*shift*.vue" -Recurse
echo "=== SHIFT RELATED FILES ===" | Add-Content phase35_search_results.txt
foreach ($file in $shiftFiles) {
  echo "  - $($file.FullName)" | Add-Content phase35_search_results.txt
}

$shiftFiles | ForEach-Object {
  echo "" | Add-Content phase35_search_results.txt
  echo "=== CONTENT: $($_.Name) ===" | Add-Content phase35_search_results.txt
  Get-Content $_.FullName | Select-String -Pattern "export|function|const" | Add-Content phase35_search_results.txt
}

Get-Content phase35_search_results.txt | Tail -50
```

### Search 6.2: Find Guard Implementation
```bash
# Find route guards
Write-Host "Searching for route guards..." -ForegroundColor Magenta

Get-ChildItem -Path "client/src" -Include "*guard*.ts" -Recurse | ForEach-Object {
  echo "=== GUARD: $($_.Name) ===" | Add-Content phase35_search_results.txt
  Get-Content $_.FullName | Add-Content phase35_search_results.txt
}

Get-Content phase35_search_results.txt | Tail -50
```

---

## SECTION 7: Role-Based Access Control

### Search 7.1: Find All Roles in Code
```bash
# Find role definitions and checks
Write-Host "Searching for role-based access..." -ForegroundColor Blue

Get-ChildItem -Path "src", "client/src" -Include "*.ts", "*.vue" -Recurse | ForEach-Object {
  $content = Get-Content $_.FullName | Select-String -Pattern "SUPER_ADMIN|ADMIN_TENANT|SUPERVISOR|CASHIER|KITCHEN|role ==|role ===|role ==="
  if ($content) { $_.FullName + " :: " + $content | Add-Content phase35_search_results.txt }
}

Get-Content phase35_search_results.txt | Tail -30
```

### Search 7.2: Find Permission Checks
```bash
# Find permission/role verification
Write-Host "Searching for permission checks..." -ForegroundColor Blue

Get-ChildItem -Path "src", "client/src" -Include "*.ts", "*.vue" -Recurse | ForEach-Object {
  $content = Get-Content $_.FullName | Select-String -Pattern "permission|authorize|access|allowed|can\w+|hasRole"
  if ($content) { $_.FullName + " :: " + $content | Add-Content phase35_search_results.txt }
}

Get-Content phase35_search_results.txt | Tail -30
```

---

## 📋 REVIEW CHECKLIST

After running all searches:

- [ ] Review DUMMY_DATA_INVENTORY.md results
  - Count total dummy data instances: ____
  - Priority 1 (Critical): ____ instances
  - Priority 2 (High): ____ instances
  - Priority 3 (Medium): ____ instances

- [ ] Review MISSING_APIS.md results
  - Count undefined APIs: ____
  - Count missing backends: ____
  - Count "not implemented yet": ____

- [ ] Review DATABASE_QUERIES.md results
  - Count queries without tenant_id: ____
  - Count queries from views (should be 0): ____
  - Count direct db calls (should be in services only): ____

- [ ] Review CODE_QUALITY.md results
  - Count console.log statements: ____
  - Count TODO/FIXME comments: ____
  - Count potentially unused imports: ____

- [ ] Review DASHBOARD_METRICS.md results
  - Dashboard files found: ____
  - Metrics using hardcoded data: ____
  - Metrics connected to API: ____

- [ ] Review SHIFT_LOCK_IMPLEMENTATION.md results
  - Guard file exists: [ ] Yes [ ] No
  - Store implementation exists: [ ] Yes [ ] No
  - Components exist: [ ] Yes [ ] No
  - Routes configured: [ ] Yes [ ] No

- [ ] Review RBAC_FINDINGS.md results
  - Roles properly separated: [ ] Yes [ ] No
  - All queries filter by tenant_id: [ ] Yes [ ] No
  - Permission checks in place: [ ] Yes [ ] No

---

## 🚀 QUICK START

**Right now, run this simple version:**

```bash
cd "f:\Backup W11\Project\New-Warungin"

# 1. Find all "mock" and "dummy" references
echo "=== SEARCHING FOR DUMMY DATA ===" 
Get-ChildItem -Path "client/src/views" -Include "*.vue" -Recurse | 
  ForEach-Object { Get-Content $_.FullName } | 
  Select-String -Pattern "mock|dummy|fake" | 
  Out-File dummy_data_found.txt

# 2. Find all API endpoints
echo "=== LISTING API ENDPOINTS ===" 
Get-ChildItem -Path "src/routes" -Include "*.ts" -Recurse | 
  ForEach-Object { Get-Content $_.FullName } | 
  Select-String -Pattern "router\.(get|post)" | 
  Out-File api_endpoints.txt

# 3. Find console logs
echo "=== FINDING CONSOLE LOGS ===" 
Get-ChildItem -Path "src", "client/src" -Include "*.ts", "*.vue" -Recurse | 
  ForEach-Object { Get-Content $_.FullName } | 
  Select-String -Pattern "console\." | 
  Out-File console_logs_found.txt

echo "Results saved to:"
echo "  - dummy_data_found.txt"
echo "  - api_endpoints.txt"  
echo "  - console_logs_found.txt"
```

---

**Status**: 🟢 Ready to execute  
**Time needed**: 15-30 minutes for all searches  
**Output**: 3 text files with findings to review

