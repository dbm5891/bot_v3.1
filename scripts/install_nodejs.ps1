# Script to download and install Node.js on Windows
# Created: May 3, 2025

$nodeVersion = "18.17.1" # LTS version
$nodeUrl = "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-x64.msi"
$nodeInstallerPath = "$env:TEMP\node-installer.msi"

Write-Host "Downloading Node.js v$nodeVersion..."
Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstallerPath

Write-Host "Installing Node.js and npm..."
Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $nodeInstallerPath, "/quiet", "/norestart" -Wait

# Clean up the installer
Remove-Item $nodeInstallerPath

# Verify installation
Write-Host "`nVerifying installation..."
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

try {
    $nodeVersionOutput = node --version
    $npmVersionOutput = npm --version
    
    Write-Host "Node.js installation successful!"
    Write-Host "Node.js version: $nodeVersionOutput"
    Write-Host "npm version: $npmVersionOutput"
    
    Write-Host "`nInstallation complete. You may need to restart your terminal or VS Code to use Node.js and npm."
} catch {
    Write-Host "Installation verification failed. Please try restarting your terminal or computer."
}