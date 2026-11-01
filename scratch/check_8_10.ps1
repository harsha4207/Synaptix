$lines = (Get-Content 'scripts\render_group_a_figures.ps1')[384..530] -join "`n"
$tokens = $null; $errs = $null
[System.Management.Automation.Language.Parser]::ParseInput($lines, [ref]$tokens, [ref]$errs)
Write-Host "Errors: $($errs.Count)"
foreach ($e in $errs) { Write-Host "$($e.Extent.StartLineNumber): $($e.Message) - $($e.Extent.Text)" }

