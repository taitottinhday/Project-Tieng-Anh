param(
  [string]$CatalogPath = "src/data/dictationCatalog.json",
  [string]$OutputDir = "public/uploads/dictation",
  [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-FullPath {
  param([string]$PathValue)

  if ([System.IO.Path]::IsPathRooted($PathValue)) {
    return $PathValue
  }

  return [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\\$PathValue"))
}

$catalogFullPath = Resolve-FullPath -PathValue $CatalogPath
$outputFullPath = Resolve-FullPath -PathValue $OutputDir

if (-not (Test-Path $catalogFullPath)) {
  throw "Catalog file not found: $catalogFullPath"
}

if (-not (Test-Path $outputFullPath)) {
  New-Item -ItemType Directory -Path $outputFullPath -Force | Out-Null
}

$catalog = Get-Content $catalogFullPath -Raw | ConvertFrom-Json

$voice = New-Object -ComObject SAPI.SpVoice
$stream = New-Object -ComObject SAPI.SpFileStream

try {
  $englishVoice = $voice.GetVoices() | Where-Object { $_.GetDescription() -match "English" } | Select-Object -First 1
  if ($englishVoice) {
    $voice.Voice = $englishVoice
  }

  $voice.Rate = -1
  $voice.Volume = 100

  $generated = 0
  $skipped = 0

  foreach ($topic in $catalog.topics) {
    foreach ($lesson in $topic.lessons) {
      foreach ($entry in $lesson.entries) {
        $targetPath = Join-Path $outputFullPath $entry.audioFile

        $shouldRegenerate = $false

        if (Test-Path $targetPath) {
          $existingFile = Get-Item $targetPath
          if ($existingFile.Length -lt 1024) {
            $shouldRegenerate = $true
          }
        }

        if ((Test-Path $targetPath) -and (-not $Force.IsPresent) -and (-not $shouldRegenerate)) {
          $skipped += 1
          continue
        }

        if (Test-Path $targetPath) {
          Remove-Item $targetPath -Force
        }

        $stream.Open($targetPath, 3, $false)
        try {
          $voice.AudioOutputStream = $stream
          [void]$voice.Speak([string]$entry.transcript)
        } finally {
          $voice.AudioOutputStream = $null
          $stream.Close()
        }

        $generated += 1
      }
    }
  }

  Write-Output ("Generated: {0}" -f $generated)
  Write-Output ("Skipped: {0}" -f $skipped)
  Write-Output ("Output: {0}" -f $outputFullPath)
} finally {
  if ($null -ne $voice) {
    try { $voice.AudioOutputStream = $null } catch {}
  }
}
