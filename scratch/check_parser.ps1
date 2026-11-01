$script = Get-Content -Raw 'scripts\render_group_a_figures.ps1'
$tokens = $null
$errs = $null
[System.Management.Automation.Language.Parser]::ParseInput($script, [ref]$tokens, [ref]$errs)
foreach ($e in $errs) {
    Write-Host "$($e.Extent.StartLineNumber): $($e.Message)"
}

