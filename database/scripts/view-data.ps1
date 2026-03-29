# FortiX Cyber Defence - Quick Database Viewer
# View MySQL data directly from PowerShell

Write-Host "`n╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║           FortiX Cyber Defence - Database Quick Viewer                    ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Magenta

# Read database credentials from .env file
$envFile = Get-Content "server\.env"
$dbHost = ($envFile | Select-String "MYSQL_HOST=").ToString().Split("=")[1]
$dbUser = ($envFile | Select-String "MYSQL_USER=").ToString().Split("=")[1]
$dbPass = ($envFile | Select-String "MYSQL_PASSWORD=").ToString().Split("=")[1]
$dbName = ($envFile | Select-String "MYSQL_DATABASE=").ToString().Split("=")[1]

Write-Host "Database Configuration:" -ForegroundColor Cyan
Write-Host "  Host: $dbHost" -ForegroundColor Gray
Write-Host "  User: $dbUser" -ForegroundColor Gray
Write-Host "  Database: $dbName`n" -ForegroundColor Gray

# Function to execute MySQL query
function Invoke-MySQLQuery {
    param (
        [string]$Query,
        [string]$Title
    )
    
    Write-Host "`n$('=' * 80)" -ForegroundColor Cyan
    Write-Host "$Title" -ForegroundColor Cyan -NoNewline
    Write-Host "`n$('=' * 80)`n" -ForegroundColor Cyan
    
    $result = mysql -h $dbHost -u $dbUser -p$dbPass -D $dbName -e $Query 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host $result -ForegroundColor White
    } else {
        Write-Host "Error executing query" -ForegroundColor Red
        Write-Host $result -ForegroundColor Yellow
    }
}

# Check if mysql command is available
$mysqlExists = Get-Command mysql -ErrorAction SilentlyContinue

if (-not $mysqlExists) {
    Write-Host "❌ MySQL command line tool not found!" -ForegroundColor Red
    Write-Host "`nPlease use one of these alternatives:" -ForegroundColor Yellow
    Write-Host "1. Run: node view-data.js" -ForegroundColor Green
    Write-Host "2. Open MySQL Workbench" -ForegroundColor Green
    Write-Host "3. Install MySQL CLI tools`n" -ForegroundColor Green
    exit 1
}

# Show table counts
Invoke-MySQLQuery -Query "
SELECT 'Users' as TableName, COUNT(*) as Records FROM Users
UNION ALL SELECT 'Services', COUNT(*) FROM Services
UNION ALL SELECT 'Industries', COUNT(*) FROM Industries
UNION ALL SELECT 'BlogPosts', COUNT(*) FROM BlogPosts
UNION ALL SELECT 'JobApplications', COUNT(*) FROM JobApplications
UNION ALL SELECT 'ServiceRequests', COUNT(*) FROM ServiceRequests
UNION ALL SELECT 'demo_requests', COUNT(*) FROM demo_requests
UNION ALL SELECT 'Contacts', COUNT(*) FROM Contacts
UNION ALL SELECT 'ActivityLogs', COUNT(*) FROM ActivityLogs;
" -Title "DATABASE SUMMARY"

# Show recent users
Invoke-MySQLQuery -Query "
SELECT id, name, email, role, isActive, DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i') as created 
FROM Users 
ORDER BY createdAt DESC 
LIMIT 10;
" -Title "RECENT USERS (Latest 10)"

# Show recent demo requests
Invoke-MySQLQuery -Query "
SELECT id, name, email, status, DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i') as created 
FROM demo_requests 
ORDER BY createdAt DESC 
LIMIT 10;
" -Title "RECENT DEMO REQUESTS (Latest 10)"

# Show recent contacts
Invoke-MySQLQuery -Query "
SELECT id, name, email, subject, status, DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i') as created 
FROM Contacts 
ORDER BY createdAt DESC 
LIMIT 10;
" -Title "RECENT CONTACTS (Latest 10)"

Write-Host "`n✓ Data retrieval complete!`n" -ForegroundColor Green
Write-Host "To view more data:" -ForegroundColor Yellow
Write-Host "  • Run: node view-data.js (detailed view)" -ForegroundColor Gray
Write-Host "  • Open MySQL Workbench (GUI)" -ForegroundColor Gray
Write-Host "  • Use: mysql -u $dbUser -p$dbPass -D $dbName`n" -ForegroundColor Gray
