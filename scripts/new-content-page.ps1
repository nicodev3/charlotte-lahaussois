param(
  [Parameter(Mandatory = $true)]
  [string]$Title,
  [string]$Slug
)

$safeSlug = if ($Slug) {
  $Slug.ToLower()
} else {
  ($Title.ToLower() -replace "[^a-z0-9\\s-]", "" -replace "\\s+", "-" -replace "-{2,}", "-").Trim("-")
}

if ([string]::IsNullOrWhiteSpace($safeSlug)) {
  throw "Impossible de generer un slug valide."
}

$targetDir = Join-Path $PSScriptRoot "..\\src\\content\\pages"
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

$targetFile = Join-Path $targetDir "$safeSlug.md"
if (Test-Path $targetFile) {
  throw "La page existe deja: $targetFile"
}

$today = (Get-Date).ToString("yyyy-MM-dd")
$content = @"
---
title: "$Title"
description: "Description courte de la page"
draft: false
updatedAt: "$today"
---

## Introduction

Contenu a completer.
"@

Set-Content -Path $targetFile -Value $content -Encoding UTF8
Write-Output "Page creee: $targetFile"

