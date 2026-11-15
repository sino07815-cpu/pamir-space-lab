$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $project
$repository = 'sino07815-cpu/pamir-space-lab'
$env:GIT_TERMINAL_PROMPT = '0'
git -c "safe.directory=$($project.Replace('\','/'))" -c credential.interactive=false push -u origin main
if ($LASTEXITCODE -ne 0) { throw 'GitHub push failed. Complete Git Credential Manager authentication first.' }

# Obtain the authorized credential in memory only. Never print or save its value.
$credentialLines = "protocol=https`nhost=github.com`nusername=sino07815-cpu`n`n" | git -c credential.interactive=false credential fill
if ($LASTEXITCODE -ne 0) { throw 'No GitHub credential is available.' }
$credential = @{}
foreach ($line in $credentialLines) {
  $pair = $line.Split('=', 2)
  if ($pair.Length -eq 2) { $credential[$pair[0]] = $pair[1] }
}
if (-not $credential.password) { throw 'GitHub credential missing.' }
$headers = @{ Authorization = "Bearer $($credential.password)"; Accept = 'application/vnd.github+json'; 'X-GitHub-Api-Version' = '2022-11-28'; 'User-Agent' = 'PamirSpaceLabPublisher' }
$endpoint = "https://api.github.com/repos/$repository"
try {
  $pages = Invoke-RestMethod -Uri "$endpoint/pages" -Headers $headers
  if ($pages.build_type -ne 'workflow') {
    Invoke-RestMethod -Method Put -Uri "$endpoint/pages" -Headers $headers -ContentType 'application/json' -Body '{"build_type":"workflow"}' | Out-Null
  }
} catch {
  if ([int]$_.Exception.Response.StatusCode -ne 404) { throw 'GitHub Pages configuration failed. Check repository permissions.' }
  Invoke-RestMethod -Method Post -Uri "$endpoint/pages" -Headers $headers -ContentType 'application/json' -Body '{"build_type":"workflow"}' | Out-Null
}
Invoke-RestMethod -Method Patch -Uri $endpoint -Headers $headers -ContentType 'application/json' -Body '{"homepage":"https://sino07815-cpu.github.io/pamir-space-lab/","description":"PAMIR SPACE LAB: BEYOND EARTH — playable 3D educational space exploration game"}' | Out-Null
Invoke-RestMethod -Method Post -Uri "$endpoint/actions/workflows/pages.yml/dispatches" -Headers $headers -ContentType 'application/json' -Body '{"ref":"main"}' | Out-Null
$credential.Clear()
$headers.Clear()
$credentialLines = $null
Write-Output 'Code uploaded; GitHub Pages deployment requested.'
Write-Output 'Game: https://sino07815-cpu.github.io/pamir-space-lab/'
Write-Output 'Check the Publish playable demo workflow before sharing the game link.'
