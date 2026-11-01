Add-Type -AssemblyName System.Drawing
$files = Get-ChildItem docs\figures\*.png
Write-Host "Total PNG Figures: $($files.Count)"
foreach ($f in $files) {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    Write-Host "$($f.Name) : $($img.Width)x$($img.Height) ($($f.Length) bytes) - OK"
    $img.Dispose()
}

