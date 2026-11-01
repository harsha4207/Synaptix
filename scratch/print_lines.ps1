$lines12 = (Get-Content 'scripts\render_group_a_figures.ps1')[598..677]
for ($i = 0; $i -lt $lines12.Count; $i++) {
    Write-Host "$($i+1): $($lines12[$i])"
}

