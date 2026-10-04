# Run health checks for the project (Windows PowerShell)

Write-Host "Installing dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
  Write-Error "npm install failed with exit code $LASTEXITCODE"
  exit $LASTEXITCODE
}

Write-Host "Building production bundle..."
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Error "Build failed with exit code $LASTEXITCODE"
  exit $LASTEXITCODE
}

Write-Host "Running linter..."
npm run lint
if ($LASTEXITCODE -ne 0) {
  Write-Warning "Lint reported issues (exit code $LASTEXITCODE). Review output."
}

Write-Host "Starting dev server..."
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run dev"
Write-Host "Dev server started. Open http://localhost:5173 in your browser (or the URL shown in terminal)."
