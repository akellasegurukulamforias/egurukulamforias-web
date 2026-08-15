# ==============================================================================
# 5-MINUTE AUTOMATED BACKGROUND BACKUP DAEMON
# e-Gurukulam for IAS & Multi-Project Safety Suite
# ==============================================================================

$ErrorActionPreference = "SilentlyContinue"

# 1. Detect Active Project Root and Dynamic Project Name
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = (Get-Item $ScriptDir).Parent.FullName
if (-not $ProjectRoot) { $ProjectRoot = $pwd.FullName }
$ProjectName = (Get-Item $ProjectRoot).Name

# 2. Target Directory Hierarchy on D: Drive
$BaseBackupDir = "D:\Akella Sir\Website Anti Gravity Backup"
$ProjectBackupDir = Join-Path $BaseBackupDir $ProjectName
$ChatStateBackupDir = Join-Path $ProjectBackupDir "Antigravity_Chat_State"
$SyncZipPath = Join-Path $ProjectBackupDir "latest_project_sync.zip"
$GitExe = "C:\Users\bhanu\MinGit\cmd\git.exe"

# Antigravity AppData & Active Conversation Metadata
$AntigravityAppData = "C:\Users\bhanu\.gemini\antigravity"
$ConversationId = "113a656c-ee5f-45f4-b667-b4a7a32283c4"

# Ensure destination folders exist
if (-not (Test-Path $ProjectBackupDir)) {
    New-Item -ItemType Directory -Path $ProjectBackupDir -Force | Out-Null
}
if (-not (Test-Path $ChatStateBackupDir)) {
    New-Item -ItemType Directory -Path $ChatStateBackupDir -Force | Out-Null
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Starting 5-Minute Automated Backup Daemon for: $ProjectName" -ForegroundColor Yellow
Write-Host "Routing Backups to: $ProjectBackupDir" -ForegroundColor Yellow
Write-Host "Press Ctrl+C at any time to stop the daemon." -ForegroundColor Gray
Write-Host "======================================================================" -ForegroundColor Cyan

# Continuous 5-Minute Watcher Loop
while ($true) {
    $TimeStamp = Get-Date -Format "HH:mm:ss"

    # Step A: Archive Latest Project Source Files
    if (Test-Path $GitExe) {
        Set-Location $ProjectRoot
        & $GitExe archive -o $SyncZipPath HEAD 2>$null
    } else {
        $SourceFiles = Get-ChildItem -Path $ProjectRoot -Exclude "node_modules", "dist", ".git", "*.zip"
        Compress-Archive -Path $SourceFiles -DestinationPath $SyncZipPath -Force
    }

    # Step B: Mirror Antigravity Chat Database & State Files
    if (Test-Path $AntigravityAppData) {
        # 1. Conversations DB
        $ConversationsDir = Join-Path $AntigravityAppData "conversations"
        $TargetConvDir = Join-Path $ChatStateBackupDir "conversations"
        if (-not (Test-Path $TargetConvDir)) { New-Item -ItemType Directory -Path $TargetConvDir -Force | Out-Null }
        
        $MatchingDbs = Get-ChildItem -Path $ConversationsDir -Filter ($ConversationId + "*") -ErrorAction SilentlyContinue
        foreach ($db in $MatchingDbs) {
            Copy-Item -Path $db.FullName -Destination $TargetConvDir -Force
        }

        # 2. Brain State & Artifacts
        $BrainDir = Join-Path $AntigravityAppData ("brain\" + $ConversationId)
        $TargetBrainDir = Join-Path $ChatStateBackupDir ("brain\" + $ConversationId)
        if (Test-Path $BrainDir) {
            if (-not (Test-Path $TargetBrainDir)) { New-Item -ItemType Directory -Path $TargetBrainDir -Force | Out-Null }
            Copy-Item -Path ($BrainDir + "\*") -Destination $TargetBrainDir -Recurse -Force
        }

        # 3. Root State Configs
        $RootFiles = @("antigravity_state.pbtxt", "agyhub_summaries_proto.pb", "installation_id")
        foreach ($f in $RootFiles) {
            $sf = Join-Path $AntigravityAppData $f
            if (Test-Path $sf) {
                Copy-Item -Path $sf -Destination $ChatStateBackupDir -Force
            }
        }

        # 4. Annotations Directory
        $AnnotationsDir = Join-Path $AntigravityAppData "annotations"
        if (Test-Path $AnnotationsDir) {
            Copy-Item -Path $AnnotationsDir -Destination $ChatStateBackupDir -Recurse -Force
        }
    }

    # Step C: Print Sync Confirmation Log
    Write-Host "[$TimeStamp] Synced to D: drive ($ProjectBackupDir)" -ForegroundColor Green

    # Wait 300 seconds (5 minutes) before next sync
    Start-Sleep -Seconds 300
}
