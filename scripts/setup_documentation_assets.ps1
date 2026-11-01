# Script to setup documentation_assets/synaptix_figures and verify all 27 figures

Add-Type -AssemblyName System.Drawing

$baseDir = "documentation_assets\synaptix_figures"
$chap3Dir = Join-Path $baseDir "chapter_3_architecture"
$chap4Dir = Join-Path $baseDir "chapter_4_interfaces"
$chap5Dir = Join-Path $baseDir "chapter_5_outputs"
$chap7Dir = Join-Path $baseDir "chapter_7_supporting"

$dirs = @($chap3Dir, $chap4Dir, $chap5Dir, $chap7Dir)
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
    }
}

# Copy Chapter 3 files (Figures 3.1 to 3.12)
Get-ChildItem -Path "docs\figures" -Filter "figure-3-*.png" | Copy-Item -Destination $chap3Dir -Force

# Copy Chapter 4 files (Figures 4.1 to 4.7)
Get-ChildItem -Path "docs\figures" -Filter "figure-4-*.png" | Copy-Item -Destination $chap4Dir -Force

# Copy Chapter 5 files (Figures 5.1 to 5.7)
Get-ChildItem -Path "docs\figures" -Filter "figure-5-*.png" | Copy-Item -Destination $chap5Dir -Force

# Copy Chapter 7 files (Figure 7.1)
Get-ChildItem -Path "docs\figures" -Filter "figure-7-*.png" | Copy-Item -Destination $chap7Dir -Force

Write-Host "Verification of copied figures:"
$allValid = $true
$totalCount = 0

foreach ($d in $dirs) {
    $files = Get-ChildItem -Path $d -Filter "*.png" | Sort-Object Name
    Write-Host "`nDirectory: $d (Count: $($files.Count))"
    foreach ($f in $files) {
        $totalCount++
        $img = [System.Drawing.Image]::FromFile($f.FullName)
        $w = $img.Width
        $h = $img.Height
        $sizeKB = [math]::Round($f.Length / 1KB, 1)
        $img.Dispose()
        if ($w -ne 1600 -or $h -ne 1000 -or $f.Length -eq 0) {
            Write-Host "  [FAIL] $($f.Name): ${w}x${h}, ${sizeKB} KB" -ForegroundColor Red
            $allValid = $false
        } else {
            Write-Host "  [OK] $($f.Name): ${w}x${h}, ${sizeKB} KB" -ForegroundColor Green
        }
    }
}

Write-Host "`nTotal Figures Processed: $totalCount"
if ($allValid -and $totalCount -eq 27) {
    Write-Host "ALL 27 FIGURES VERIFIED SUCCESSFULLY (1600x1000, valid PNG, non-empty)!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Verification failed!" -ForegroundColor Red
}

