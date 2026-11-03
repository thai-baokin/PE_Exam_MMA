param (
    [string]$StudentCode = "QE200012"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$ProjectDir = "d:\Source\PE_Exam"
$SubmissionDir = Join-Path $ProjectDir "submission\$StudentCode"
$TempDir = Join-Path $ProjectDir "temp_pack"
$ZipPath = Join-Path $SubmissionDir "$StudentCode.zip"

Write-Host "Bat dau dong goi bai nop cho sinh vien: $StudentCode..." -ForegroundColor Cyan

# 1. Ensure submission dir exists
if (-not (Test-Path $SubmissionDir)) {
    New-Item -ItemType Directory -Path $SubmissionDir -Force | Out-Null
}

# 2. Clean temp pack dir
if (Test-Path $TempDir) {
    Remove-Item -Path $TempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

# 3. Copy only required folders and files
$FoldersToCopy = @("app", "components", "config", "constants", "context", "hooks", "types", "utils", "assets")
$FilesToCopy = @("package.json", "app.json", "babel.config.js", "tsconfig.json", "firestore.rules", ".env.example")

# Copy folders
foreach ($folder in $FoldersToCopy) {
    $src = Join-Path $ProjectDir $folder
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination (Join-Path $TempDir $folder) -Recurse -Force
    }
}

# Copy files
foreach ($file in $FilesToCopy) {
    $src = Join-Path $ProjectDir $file
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $TempDir -Force
    }
}

# Copy lockfile
if (Test-Path (Join-Path $ProjectDir "package-lock.json")) {
    Copy-Item -Path (Join-Path $ProjectDir "package-lock.json") -Destination $TempDir -Force
} elseif (Test-Path (Join-Path $ProjectDir "pnpm-lock.yaml")) {
    Copy-Item -Path (Join-Path $ProjectDir "pnpm-lock.yaml") -Destination $TempDir -Force
}

# 4. Safety verification: Make sure NO sensitive or heavy files were copied
$ForbiddenPaths = @(".env", "node_modules", ".expo", ".git")
foreach ($forbidden in $ForbiddenPaths) {
    $bad = Join-Path $TempDir $forbidden
    if (Test-Path $bad) {
        Remove-Item -Path $bad -Recurse -Force
    }
}

# 5. Remove existing zip if any
if (Test-Path $ZipPath) {
    Remove-Item -Path $ZipPath -Force
}

# 6. Compress files directly from $TempDir so package.json is at the top level
Write-Host "Dang nen file zip..." -ForegroundColor Cyan
Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipPath -Force

# 7. Clean temp folder
Remove-Item -Path $TempDir -Recurse -Force

# 8. Check result
$DocxPath = Join-Path $SubmissionDir "$StudentCode.docx"
Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "DONG GOI BAI NOP HOAN TAT!" -ForegroundColor Green
Write-Host "Thu muc nop bai: $SubmissionDir" -ForegroundColor White
Write-Host "1. File Zip : $ZipPath" -ForegroundColor White
if (Test-Path $DocxPath) {
    Write-Host "2. File Word: $DocxPath" -ForegroundColor White
} else {
    Write-Host "2. File Word: [Chua co - Chay script generate_docx.js]" -ForegroundColor Yellow
}
Write-Host "========================================================`n" -ForegroundColor Green
