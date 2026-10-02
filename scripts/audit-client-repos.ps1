param(
  [string]$RootPath = ".",
  [switch]$RunValidate,
  [switch]$RunBuild
)

$ErrorActionPreference = "Stop"

if ($RunBuild -and -not $RunValidate) {
  Write-Host "[audit] RunBuild implique RunValidate. Activation automatique de RunValidate."
  $RunValidate = $true
}

$root = Resolve-Path $RootPath
Write-Host "[audit] Scan des repos dans $root"

$repos = Get-ChildItem -Path $root -Directory | Where-Object {
  (Test-Path (Join-Path $_.FullName "package.json")) -and
  (Test-Path (Join-Path $_.FullName "src/data/client.json"))
}

if (-not $repos) {
  Write-Host "[audit] Aucun repo client detecte."
  exit 0
}

$results = @()

foreach ($repo in $repos) {
  $repoPath = $repo.FullName
  $clientPath = Join-Path $repoPath "src/data/client.json"

  $schemaVersion = ""
  $validateStatus = "skipped"
  $buildStatus = "skipped"
  $errorMessage = ""

  try {
    $client = Get-Content -Raw -Path $clientPath | ConvertFrom-Json
    $schemaVersion = [string]$client.schemaVersion

    if ($RunValidate) {
      & npm run validate:client --prefix $repoPath | Out-Host
      $validateStatus = if ($LASTEXITCODE -eq 0) { "ok" } else { "failed" }
      if ($validateStatus -eq "failed") {
        throw "validate:client failed"
      }
    }

    if ($RunBuild) {
      & npm run build --prefix $repoPath | Out-Host
      $buildStatus = if ($LASTEXITCODE -eq 0) { "ok" } else { "failed" }
      if ($buildStatus -eq "failed") {
        throw "build failed"
      }
    }
  } catch {
    if ($validateStatus -eq "skipped" -and $RunValidate) {
      $validateStatus = "failed"
    }
    if ($buildStatus -eq "skipped" -and $RunBuild) {
      $buildStatus = "failed"
    }
    $errorMessage = $_.Exception.Message
  }

  $results += [PSCustomObject]@{
    repo            = $repo.Name
    schemaVersion   = $schemaVersion
    validate        = $validateStatus
    build           = $buildStatus
    error           = $errorMessage
  }
}

Write-Host ""
Write-Host "[audit] Resume"
$results | Sort-Object repo | Format-Table -AutoSize

$failed = $results | Where-Object {
  $_.validate -eq "failed" -or $_.build -eq "failed" -or $_.error
}

if ($failed) {
  exit 1
}
