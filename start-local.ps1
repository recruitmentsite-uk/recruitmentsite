# Recruitment Site local dev — http://localhost:3003
# Port 3000 is reserved for BindingSignature

Set-Location $PSScriptRoot
if (-not (Test-Path "apps/web/.env.local")) {
  Copy-Item "apps/web/.env.example" "apps/web/.env.local"
  Write-Host "Created apps/web/.env.local from .env.example"
}
Write-Host "Starting Recruitment Site on http://localhost:3003 ..."
pnpm dev
