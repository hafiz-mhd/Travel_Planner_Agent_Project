Set-Location "E:\My Files\Travel Planner Agent"
Write-Host "=== Step 1: Running DB migration ===" -ForegroundColor Cyan
.\venv\Scripts\python.exe migrate_db.py
Write-Host ""
Write-Host "=== Step 2: Installing missing pip packages ===" -ForegroundColor Cyan
.\venv\Scripts\pip.exe install aiosqlite==0.20.0 "passlib[bcrypt]==1.7.4" "bcrypt==4.0.1" --quiet
Write-Host "Packages installed."
Write-Host ""
Write-Host "=== Step 3: Verifying imports ===" -ForegroundColor Cyan
.\venv\Scripts\python.exe -c "import aiosqlite; import passlib; print('aiosqlite:', aiosqlite.__version__); print('passlib OK')"
Write-Host ""
Write-Host "=== All done! ===" -ForegroundColor Green
