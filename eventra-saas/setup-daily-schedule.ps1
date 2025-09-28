# 🕒 SETUP AUTOMATIC DAILY IRAQ EVENT COLLECTION
# This script creates a Windows Task Scheduler task to run daily

param(
    [string]$Time = "08:00",  # Default: 8 AM every day
    [string]$TaskName = "Iraq-Event-Collector-Daily"
)

Write-Host "🕒 SETTING UP DAILY IRAQ EVENT COLLECTION" -ForegroundColor Green -BackgroundColor Black
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "📅 Schedule: Every day at $Time" -ForegroundColor Cyan
Write-Host "🎯 Task: Collect Iraq event data automatically" -ForegroundColor Cyan
Write-Host "📁 Location: $PWD" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Yellow

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (!$isAdmin) {
    Write-Host "⚠️  Administrator privileges required for Task Scheduler" -ForegroundColor Yellow
    Write-Host "💡 Right-click PowerShell and 'Run as Administrator', then run this script again" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 MANUAL SETUP INSTRUCTIONS:" -ForegroundColor Yellow
    Write-Host "1. Open Task Scheduler (Win+R, type: taskschd.msc)" -ForegroundColor White
    Write-Host "2. Click 'Create Basic Task'" -ForegroundColor White
    Write-Host "3. Name: '$TaskName'" -ForegroundColor White
    Write-Host "4. Trigger: Daily at $Time" -ForegroundColor White
    Write-Host "5. Action: Start a program" -ForegroundColor White
    Write-Host "6. Program: powershell.exe" -ForegroundColor White
    Write-Host "7. Arguments: -ExecutionPolicy Bypass -File `"$PWD\daily-iraq-events.ps1`"" -ForegroundColor White
    Write-Host "8. Start in: $PWD" -ForegroundColor White
    pause
    return
}

try {
    # Create the scheduled task
    Write-Host "🔧 Creating Windows Task Scheduler task..." -ForegroundColor Yellow
    
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$PWD\daily-iraq-events.ps1`"" -WorkingDirectory $PWD
    $trigger = New-ScheduledTaskTrigger -Daily -At $Time
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive
    
    # Register the task
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "Automated daily collection of Iraq event data using k6 load testing" -Force
    
    Write-Host "✅ SUCCESS! Scheduled task created!" -ForegroundColor Green
    Write-Host "📅 Task Name: $TaskName" -ForegroundColor Cyan
    Write-Host "⏰ Runs: Daily at $Time" -ForegroundColor Cyan
    Write-Host "🎯 Collects: Iraq event data from all cities" -ForegroundColor Cyan
    
    # Test if task was created
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($task) {
        Write-Host "🔍 Task verification: PASSED" -ForegroundColor Green
        Write-Host "📊 Next run: $(Get-Date $Time)" -ForegroundColor Cyan
        
        Write-Host ""
        Write-Host "🎉 AUTOMATED IRAQ EVENT COLLECTION IS NOW ACTIVE!" -ForegroundColor Green -BackgroundColor Black
        Write-Host "=================================================" -ForegroundColor Yellow
        Write-Host "✅ Every day at $Time, your computer will:" -ForegroundColor Green
        Write-Host "   • Automatically collect Iraq event data" -ForegroundColor White
        Write-Host "   • Monitor all Iraqi cities (Baghdad, Erbil, etc.)" -ForegroundColor White
        Write-Host "   • Save detailed reports" -ForegroundColor White
        Write-Host "   • Alert you if there are problems" -ForegroundColor White
        Write-Host "=================================================" -ForegroundColor Yellow
        
    } else {
        Write-Host "❌ Task creation verification failed" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error creating scheduled task: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 MANUAL SETUP ALTERNATIVE:" -ForegroundColor Yellow
    Write-Host "1. Run this command daily: .\daily-iraq-events.ps1" -ForegroundColor White
    Write-Host "2. Or use Windows Task Scheduler manually (instructions above)" -ForegroundColor White
}

Write-Host ""
Write-Host "🛠️  MANAGEMENT COMMANDS:" -ForegroundColor Magenta
Write-Host "View task:   Get-ScheduledTask -TaskName '$TaskName'" -ForegroundColor White
Write-Host "Run now:     Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor White
Write-Host "Disable:     Disable-ScheduledTask -TaskName '$TaskName'" -ForegroundColor White
Write-Host "Remove:      Unregister-ScheduledTask -TaskName '$TaskName'" -ForegroundColor White