param(
    [string]$OutputRoot = "audit/reports/static"
)

$ErrorActionPreference = "Continue"

$repoRoot = (Get-Location).Path
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outDir = Join-Path $repoRoot (Join-Path $OutputRoot $timestamp)
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

function Save-Step {
    param(
        [string]$Name,
        [string]$Command,
        [string]$WorkDir
    )

    $file = Join-Path $outDir "$Name.txt"
    "# Command: $Command" | Out-File -FilePath $file -Encoding utf8
    "# WorkDir: $WorkDir" | Out-File -FilePath $file -Encoding utf8 -Append
    "" | Out-File -FilePath $file -Encoding utf8 -Append

    Push-Location $WorkDir
    try {
        Invoke-Expression $Command 2>&1 | Out-File -FilePath $file -Encoding utf8 -Append
    }
    catch {
        "ERROR: $($_.Exception.Message)" | Out-File -FilePath $file -Encoding utf8 -Append
    }
    finally {
        Pop-Location
    }
}

Save-Step -Name "client-install" -Command "npm ci" -WorkDir "client"
Save-Step -Name "client-type-check" -Command "npm run type-check" -WorkDir "client"
Save-Step -Name "client-lint" -Command "npm run lint" -WorkDir "client"
Save-Step -Name "client-build" -Command "npm run build" -WorkDir "client"

Save-Step -Name "nest-install" -Command "npm ci" -WorkDir "nest"
Save-Step -Name "nest-build" -Command "npm run build" -WorkDir "nest"

Write-Host "Static audit outputs created in: $outDir"
