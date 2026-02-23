param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$ExpectedAppName = "warungin-backend",
    [string]$ExpectedApiPrefix = "/api",
    [switch]$Strict
)

$ErrorActionPreference = "Stop"

function Fail($message) {
    Write-Host "[FAIL] $message" -ForegroundColor Red
    exit 1
}

try {
    $healthUrl = "$BaseUrl/health"
    Write-Host "Checking runtime identity at: $healthUrl"
    $response = Invoke-RestMethod -Method Get -Uri $healthUrl -TimeoutSec 15
}
catch {
    Fail "Unable to reach health endpoint: $($_.Exception.Message)"
}

if (-not $response -or -not $response.data) {
    Fail "Health response does not include expected payload format"
}

$identity = $response.data.identity
if (-not $identity) {
    Fail "Health response missing identity block"
}

Write-Host "App Name   : $($identity.appName)"
Write-Host "Version    : $($identity.appVersion)"
Write-Host "Commit SHA : $($identity.appCommitSha)"
Write-Host "API Prefix : $($identity.apiPrefix)"
Write-Host "DB Status  : $($response.data.services.database)"

if ($identity.appName -ne $ExpectedAppName) {
    Fail "Unexpected appName '$($identity.appName)'. Expected '$ExpectedAppName'"
}

if ($identity.apiPrefix -ne $ExpectedApiPrefix) {
    Fail "Unexpected apiPrefix '$($identity.apiPrefix)'. Expected '$ExpectedApiPrefix'"
}

if ($Strict -and ($identity.appCommitSha -eq "unknown" -or [string]::IsNullOrWhiteSpace($identity.appCommitSha))) {
    Fail "Strict mode requires APP_COMMIT_SHA to be set"
}

Write-Host "[PASS] Runtime identity is valid" -ForegroundColor Green
