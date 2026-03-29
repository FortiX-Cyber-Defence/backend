# View Resumes in Database
# This script displays resume information from the database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resume Database Viewer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
$envPath = "FXCD/server/.env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

$dbHost = $env:MYSQL_HOST
$dbUser = $env:MYSQL_USER
$dbPassword = $env:MYSQL_PASSWORD
$dbName = $env:MYSQL_DATABASE

Write-Host "Database: $dbName" -ForegroundColor Yellow
Write-Host "Host: $dbHost" -ForegroundColor Yellow
Write-Host ""

# Run SQL query
Write-Host "Fetching resume data..." -ForegroundColor Yellow
Write-Host ""

$query = @"
SELECT 
  id,
  job_title,
  CONCAT(first_name, ' ', last_name) as full_name,
  email,
  resume_file_name,
  resume_file_size,
  resume_file_type,
  CASE 
    WHEN resume_content IS NOT NULL THEN 'YES'
    ELSE 'NO'
  END as has_resume,
  LENGTH(resume_content) as content_bytes,
  created_at
FROM job_applications
ORDER BY created_at DESC;
"@

# Execute query using mysql command
$mysqlCmd = "mysql -h $dbHost -u $dbUser -p$dbPassword $dbName -e `"$query`""

try {
    Invoke-Expression $mysqlCmd
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Resume Statistics" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    $statsQuery = @"
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN resume_content IS NOT NULL THEN 1 ELSE 0 END) as with_resume,
  SUM(CASE WHEN resume_content IS NULL THEN 1 ELSE 0 END) as without_resume
FROM job_applications;
"@
    
    $statsMysqlCmd = "mysql -h $dbHost -u $dbUser -p$dbPassword $dbName -e `"$statsQuery`""
    Invoke-Expression $statsMysqlCmd
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "To view full SQL queries, see: view-resumes.sql" -ForegroundColor Yellow
Write-Host ""
