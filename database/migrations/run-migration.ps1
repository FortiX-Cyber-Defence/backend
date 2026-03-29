# PowerShell script to run database migrations
# Usage: .\run-migration.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "FortiX Database Migration Runner" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "✓ Environment variables loaded" -ForegroundColor Green
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    exit 1
}

$MYSQL_USER = $env:MYSQL_USER
$MYSQL_PASSWORD = $env:MYSQL_PASSWORD
$MYSQL_DATABASE = $env:MYSQL_DATABASE
$MYSQL_HOST = $env:MYSQL_HOST

Write-Host ""
Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $MYSQL_HOST"
Write-Host "  User: $MYSQL_USER"
Write-Host "  Database: $MYSQL_DATABASE"
Write-Host ""

# Check if MySQL is accessible
Write-Host "Checking MySQL connection..." -ForegroundColor Yellow
$testConnection = "mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD -e 'SELECT 1;' 2>&1"
$result = Invoke-Expression $testConnection

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Cannot connect to MySQL!" -ForegroundColor Red
    Write-Host "  Please check your credentials in .env file" -ForegroundColor Red
    exit 1
}

Write-Host "✓ MySQL connection successful" -ForegroundColor Green
Write-Host ""

# Run migrations
Write-Host "Running migrations..." -ForegroundColor Yellow
Write-Host ""

$migrations = Get-ChildItem -Path "migrations" -Filter "*.sql" | Sort-Object Name

foreach ($migration in $migrations) {
    Write-Host "  → Running: $($migration.Name)" -ForegroundColor Cyan
    
    $command = "mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < migrations\$($migration.Name) 2>&1"
    $output = Invoke-Expression $command
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ Success" -ForegroundColor Green
    } else {
        Write-Host "    ✗ Failed" -ForegroundColor Red
        Write-Host "    Error: $output" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Migration Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start the server: npm run dev"
Write-Host "  2. Test the API endpoints"
Write-Host "  3. Check email configuration"
Write-Host ""
