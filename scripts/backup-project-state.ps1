$ErrorActionPreference = "Stop"

# Detect Active Project Root and Name
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = (Get-Item $ScriptDir).Parent.FullName
if (-not $ProjectRoot) { $ProjectRoot = $pwd.FullName }
$ProjectName = (Get-Item $ProjectRoot).Name

# Timestamp for Archive
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# Define Backup Destination Directory Structure
$BackupBaseDir = Join-Path "D:\Akella Sir\Website Anti Gravity Backup" $ProjectName
$ChatStateBackupDir = Join-Path $BackupBaseDir "Antigravity_Chat_State"
$CodeZipFileName = ($ProjectName + "_code_" + $Timestamp + ".zip")
$CodeZipPath = Join-Path $BackupBaseDir $CodeZipFileName

Write-Host "=========================================================="
Write-Host "Starting Dedicated Backup for Project: $ProjectName"
Write-Host "Destination: $BackupBaseDir"
Write-Host "=========================================================="

# Ensure target directories exist
if (-not (Test-Path $BackupBaseDir)) {
    New-Item -ItemType Directory -Path $BackupBaseDir -Force | Out-Null
}
if (-not (Test-Path $ChatStateBackupDir)) {
    New-Item -ItemType Directory -Path $ChatStateBackupDir -Force | Out-Null
}

# Step 1: Archive Repository Source Code
Write-Host "Step 1/2: Archiving Source Code to ZIP..."
$GitExe = "C:\Users\bhanu\MinGit\cmd\git.exe"

if (Test-Path $GitExe) {
    Set-Location $ProjectRoot
    & $GitExe archive -o $CodeZipPath HEAD
    Write-Host "  Success: Source Code Archived via Git to $CodeZipPath"
} else {
    $SourceFiles = Get-ChildItem -Path $ProjectRoot -Exclude "node_modules", "dist", ".git", "project-full-backup-present.zip"
    Compress-Archive -Path $SourceFiles -DestinationPath $CodeZipPath -Force
    Write-Host "  Success: Source Code Archived via Zip to $CodeZipPath"
}

# Step 2: Copy Antigravity Chat Database, History & State
Write-Host "Step 2/2: Backing Up Antigravity Chat Database & State..."
$AntigravityAppData = "C:\Users\bhanu\.gemini\antigravity"
$ConversationId = "113a656c-ee5f-45f4-b667-b4a7a32283c4"

if (Test-Path $AntigravityAppData) {
    # A. Copy Conversation Database Files
    $ConversationsDir = Join-Path $AntigravityAppData "conversations"
    $TargetConvDir = Join-Path $ChatStateBackupDir "conversations"
    if (-not (Test-Path $TargetConvDir)) { New-Item -ItemType Directory -Path $TargetConvDir -Force | Out-Null }
    
    $MatchingDbs = Get-ChildItem -Path $ConversationsDir -Filter ($ConversationId + "*") -ErrorAction SilentlyContinue
    foreach ($dbFile in $MatchingDbs) {
        Copy-Item -Path $dbFile.FullName -Destination $TargetConvDir -Force
        Write-Host ("  Copied Conversation Database: " + $dbFile.Name)
    }

    # B. Copy Brain Artifacts & System Logs
    $BrainDir = Join-Path $AntigravityAppData ("brain\" + $ConversationId)
    $TargetBrainDir = Join-Path $ChatStateBackupDir ("brain\" + $ConversationId)
    if (Test-Path $BrainDir) {
        if (-not (Test-Path $TargetBrainDir)) { New-Item -ItemType Directory -Path $TargetBrainDir -Force | Out-Null }
        Copy-Item -Path ($BrainDir + "\*") -Destination $TargetBrainDir -Recurse -Force
        Write-Host ("  Copied Antigravity Brain State & Artifacts for: " + $ConversationId)
    }

    # C. Copy Root State Files & Annotations
    $RootFiles = @("antigravity_state.pbtxt", "agyhub_summaries_proto.pb", "installation_id")
    foreach ($file in $RootFiles) {
        $StateFile = Join-Path $AntigravityAppData $file
        if (Test-Path $StateFile) {
            Copy-Item -Path $StateFile -Destination $ChatStateBackupDir -Force
            Write-Host ("  Copied Config File: " + $file)
        }
    }

    $AnnotationsDir = Join-Path $AntigravityAppData "annotations"
    if (Test-Path $AnnotationsDir) {
        Copy-Item -Path $AnnotationsDir -Destination $ChatStateBackupDir -Recurse -Force
        Write-Host "  Copied Annotations Directory"
    }
} else {
    Write-Host ("  Warning: Antigravity AppData folder not found at " + $AntigravityAppData)
}

Write-Host "=========================================================="
Write-Host "Backup Complete! All files backed up to: $BackupBaseDir"
Write-Host "=========================================================="
