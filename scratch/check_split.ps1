$script = Get-Content -Raw 'scripts\render_group_a_figures.ps1'
# Test lines 1 to 598
$lines = (Get-Content 'scripts\render_group_a_figures.ps1')[0..597] -join "`n"
$tokens = $null; $errs = $null
[System.Management.Automation.Language.Parser]::ParseInput($lines, [ref]$tokens, [ref]$errs)
Write-Host "Lines 1-598 errors: $($errs.Count)"
foreach ($e in $errs) { Write-Host "$($e.Extent.StartLineNumber): $($e.Message)" }

# Test lines 599 to end
$lines12 = (Get-Content 'scripts\render_group_a_figures.ps1')[598..677] -join "`n"
$tokens12 = $null; $errs12 = $null
[System.Management.Automation.Language.Parser]::ParseInput($lines12, [ref]$tokens12, [ref]$errs12)
Write-Host "Lines 599-678 errors: $($errs12.Count)"
foreach ($e in $errs12) { Write-Host "$($e.Extent.StartLineNumber): $($e.Message)" }

