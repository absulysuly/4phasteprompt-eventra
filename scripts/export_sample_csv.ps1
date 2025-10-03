# Iraq Discovery — JSON to CSV Export Script
# Converts sample JSON data files to CSV format for spreadsheet analysis

# Configuration
$ScriptRoot = Split-Path -Parent $PSScriptRoot
$JsonDir = Join-Path $ScriptRoot "mock-api\categories"
$CsvDir = Join-Path $ScriptRoot "data\csv"

# Ensure CSV output directory exists
if (-Not (Test-Path $CsvDir)) {
    New-Item -ItemType Directory -Path $CsvDir | Out-Null
    Write-Host "Created CSV output directory: $CsvDir" -ForegroundColor Green
}

# Helper function to flatten nested objects for CSV
function Flatten-Object {
    param($Object, $Prefix = "")
    
    $result = @{}
    foreach ($prop in $Object.PSObject.Properties) {
        $key = if ($Prefix) { "${Prefix}_${($prop.Name)}" } else { $prop.Name }
        
        if ($prop.Value -is [PSCustomObject] -or $prop.Value -is [Hashtable]) {
            # Recursively flatten nested objects
            $nested = Flatten-Object -Object $prop.Value -Prefix $key
            foreach ($nestedKey in $nested.Keys) {
                $result[$nestedKey] = $nested[$nestedKey]
            }
        }
        elseif ($prop.Value -is [Array]) {
            # Convert arrays to pipe-separated strings
            $result[$key] = ($prop.Value -join " | ")
        }
        else {
            $result[$key] = $prop.Value
        }
    }
    return $result
}

# Process accommodation.json
Write-Host "`nProcessing accommodation.json..." -ForegroundColor Cyan
$accommodationPath = Join-Path $JsonDir "accommodation.json"
if (Test-Path $accommodationPath) {
    $json = Get-Content $accommodationPath -Raw | ConvertFrom-Json
    $flattened = @()
    
    foreach ($record in $json.data) {
        $flat = Flatten-Object -Object $record
        $flattened += [PSCustomObject]$flat
    }
    
    $csvPath = Join-Path $CsvDir "accommodation.csv"
    $flattened | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
    Write-Host "✓ Exported $($json.data.Count) accommodation records to $csvPath" -ForegroundColor Green
} else {
    Write-Host "✗ accommodation.json not found" -ForegroundColor Yellow
}

# Process cafes-restaurants.json
Write-Host "`nProcessing cafes-restaurants.json..." -ForegroundColor Cyan
$cafesPath = Join-Path $JsonDir "cafes-restaurants.json"
if (Test-Path $cafesPath) {
    $json = Get-Content $cafesPath -Raw | ConvertFrom-Json
    $flattened = @()
    
    foreach ($record in $json.data) {
        $flat = Flatten-Object -Object $record
        $flattened += [PSCustomObject]$flat
    }
    
    $csvPath = Join-Path $CsvDir "cafes-restaurants.csv"
    $flattened | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
    Write-Host "✓ Exported $($json.data.Count) cafe/restaurant records to $csvPath" -ForegroundColor Green
} else {
    Write-Host "✗ cafes-restaurants.json not found" -ForegroundColor Yellow
}

# Process consolidated _all_categories_sample.json
Write-Host "`nProcessing _all_categories_sample.json..." -ForegroundColor Cyan
$allCategoriesPath = Join-Path $JsonDir "_all_categories_sample.json"
if (Test-Path $allCategoriesPath) {
    $json = Get-Content $allCategoriesPath -Raw | ConvertFrom-Json
    
    foreach ($categoryName in $json.PSObject.Properties.Name) {
        $category = $json.$categoryName
        $flattened = @()
        
        foreach ($record in $category.data) {
            $flat = Flatten-Object -Object $record
            $flattened += [PSCustomObject]$flat
        }
        
        $safeName = $categoryName -replace '\s+', '-' -replace '[&]', 'and'
        $csvPath = Join-Path $CsvDir "$safeName.csv"
        $flattened | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
        Write-Host "✓ Exported $($category.data.Count) $categoryName records to $csvPath" -ForegroundColor Green
    }
} else {
    Write-Host "✗ _all_categories_sample.json not found" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CSV export complete!" -ForegroundColor Green
Write-Host "Output directory: $CsvDir" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

# Optional: Open CSV directory in Explorer
$openDir = Read-Host "Open CSV directory in Explorer? (y/n)"
if ($openDir -eq 'y') {
    explorer $CsvDir
}
