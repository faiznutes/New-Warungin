param(
    [string]$OutputRoot = "audit/reports/baseline"
)

$ErrorActionPreference = "Continue"

$repoRoot = (Get-Location).Path
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outDir = Join-Path $repoRoot (Join-Path $OutputRoot $timestamp)
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

function Save-CommandOutput {
    param(
        [string]$Name,
        [string]$Command,
        [string]$WorkDir = "."
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

Save-CommandOutput -Name "git-status" -Command "git status -sb"
Save-CommandOutput -Name "git-branch" -Command "git branch --show-current"
Save-CommandOutput -Name "git-remotes" -Command "git remote -v"
Save-CommandOutput -Name "node-version" -Command "node -v"
Save-CommandOutput -Name "npm-version" -Command "npm -v"
Save-CommandOutput -Name "docker-version" -Command "docker --version"
Save-CommandOutput -Name "docker-compose-version" -Command "docker compose version"
Save-CommandOutput -Name "docker-compose-ps" -Command "docker compose ps"
Save-CommandOutput -Name "docker-ps" -Command "docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"

Save-CommandOutput -Name "client-deps" -Command "npm ls --depth=0" -WorkDir "client"
Save-CommandOutput -Name "nest-deps" -Command "npm ls --depth=0" -WorkDir "nest"

Write-Host "Baseline snapshot created in: $outDir"
