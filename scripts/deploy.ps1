# Eventra Deployment Script for Windows PowerShell
# This script automates the deployment process for the Eventra application

param(
    [switch]$SkipTests,
    [switch]$SkipLint,
    [switch]$Docker,
    [switch]$Help
)

# Configuration
$ProjectName = "Eventra"
$BuildDir = "dist"
$BackupDir = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Functions
function Write-Header {
    Write-Host "==============================================" -ForegroundColor Blue
    Write-Host "   🚀 $ProjectName Deployment Script" -ForegroundColor Blue
    Write-Host "==============================================" -ForegroundColor Blue
}

function Write-Step {
    param($Message)
    Write-Host "► $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Test-Dependencies {
    Write-Step "Checking dependencies..."
    
    try {
        $nodeVersion = node --version
        $npmVersion = npm --version
        Write-Success "Node.js: $nodeVersion, npm: $npmVersion"
    }
    catch {
        Write-Error "Node.js or npm is not installed or not in PATH"
        exit 1
    }
}

function Invoke-Tests {
    if ($SkipTests) {
        Write-Warning "Skipping tests..."
        return
    }
    
    Write-Step "Running tests..."
    
    $result = npm run test:run
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Tests failed!"
        exit 1
    }
    
    Write-Success "All tests passed"
}

function Invoke-Linting {
    if ($SkipLint) {
        Write-Warning "Skipping linting..."
        return
    }
    
    Write-Step "Running linting..."
    
    $result = npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Linting failed!"
        exit 1
    }
    
    Write-Success "Linting passed"
}

function Invoke-TypeCheck {
    Write-Step "Running type check..."
    
    $result = npm run type-check
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Type check failed!"
        exit 1
    }
    
    Write-Success "Type check passed"
}

function Build-Application {
    Write-Step "Building application..."
    
    # Clean previous build
    if (Test-Path $BuildDir) {
        Remove-Item -Recurse -Force $BuildDir
    }
    
    $result = npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed!"
        exit 1
    }
    
    Write-Success "Build completed successfully"
}

function Backup-Previous {
    if (Test-Path "production") {
        Write-Step "Backing up previous deployment..."
        Copy-Item -Recurse production $BackupDir
        Write-Success "Backup created: $BackupDir"
    }
}

function Deploy-Static {
    Write-Step "Preparing static deployment..."
    
    # Create production directory
    if (!(Test-Path "production")) {
        New-Item -ItemType Directory -Path "production" | Out-Null
    }
    
    # Copy built files
    Copy-Item -Recurse "$BuildDir\*" "production\" -Force
    
    Write-Success "Static files ready for deployment"
}

function Deploy-Docker {
    Write-Step "Building Docker image..."
    
    try {
        $dockerVersion = docker --version
        Write-Host "Docker version: $dockerVersion"
    }
    catch {
        Write-Warning "Docker not found, skipping Docker deployment"
        return
    }
    
    # Build Docker image
    $result = docker build -t eventra:latest .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker build failed!"
        return
    }
    
    Write-Success "Docker image built successfully"
    
    # Optionally start container
    $startContainer = Read-Host "Do you want to start the Docker container? (y/n)"
    if ($startContainer -eq "y") {
        docker stop eventra 2>$null
        docker rm eventra 2>$null
        docker run -d -p 80:80 --name eventra eventra:latest
        Write-Success "Docker container started on port 80"
    }
}

function Show-DeploymentInfo {
    Write-Host "==============================================" -ForegroundColor Blue
    Write-Host "   🎉 Deployment Complete!" -ForegroundColor Blue
    Write-Host "==============================================" -ForegroundColor Blue
    
    Write-Host "📊 Build Statistics:"
    if (Test-Path $BuildDir) {
        $size = (Get-ChildItem $BuildDir -Recurse | Measure-Object -Property Length -Sum).Sum
        Write-Host "Build size: $([math]::Round($size / 1MB, 2)) MB"
        Get-ChildItem $BuildDir | Format-Table Name, Length, LastWriteTime
    }
    
    Write-Host ""
    Write-Host "🔗 Deployment Options:" -ForegroundColor Cyan
    Write-Host "  • Static files: ./production/"
    Write-Host "  • GitHub Pages: Push to main branch"
    Write-Host "  • Vercel: Connect your repository"
    Write-Host "  • Netlify: Drag & drop ./production/ folder"
    Write-Host "  • Docker: Use 'eventra:latest' image"
    
    if (Test-Path $BackupDir) {
        Write-Host "  • Backup: $BackupDir"
    }
    
    Write-Host ""
    Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Test your deployment locally: npm run preview"
    Write-Host "  2. Upload to your hosting provider"
    Write-Host "  3. Configure environment variables"
    Write-Host "  4. Set up monitoring and analytics"
}

function Show-Help {
    Write-Host "Usage: .\deploy.ps1 [OPTIONS]"
    Write-Host "Options:"
    Write-Host "  -SkipTests    Skip running tests"
    Write-Host "  -SkipLint     Skip linting"
    Write-Host "  -Docker       Build Docker image"
    Write-Host "  -Help         Show this help message"
}

# Main deployment flow
function Main {
    if ($Help) {
        Show-Help
        exit 0
    }
    
    Write-Header
    
    # Set error action preference
    $ErrorActionPreference = "Stop"
    
    try {
        # Run deployment steps
        Test-Dependencies
        Invoke-Linting
        Invoke-TypeCheck
        Invoke-Tests
        Backup-Previous
        Build-Application
        
        if ($Docker) {
            Deploy-Docker
        } else {
            Deploy-Static
        }
        
        Show-DeploymentInfo
        Write-Success "Deployment script completed successfully! 🎉"
    }
    catch {
        Write-Error "Deployment failed: $_"
        exit 1
    }
}

# Run main function
Main