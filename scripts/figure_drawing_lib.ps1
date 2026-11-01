# ==============================================================================
# SYNAPTIX COMMAND - Figure Drawing & Layout Library
# ==============================================================================
# Provides high-resolution GDI+ primitives for rendering enterprise technical diagrams,
# application interfaces, and live execution outputs.
# ==============================================================================

Add-Type -AssemblyName System.Drawing

# Color Palette Constants
$global:COL_NAVY = [System.Drawing.ColorTranslator]::FromHtml("#0B1F3A")
$global:COL_NAVY_DARK = [System.Drawing.ColorTranslator]::FromHtml("#061120")
$global:COL_NAVY_LIGHT = [System.Drawing.ColorTranslator]::FromHtml("#162D4D")
$global:COL_BLUE = [System.Drawing.ColorTranslator]::FromHtml("#1769E0")
$global:COL_BLUE_LIGHT = [System.Drawing.ColorTranslator]::FromHtml("#EFF6FF")
$global:COL_BLUE_ACCENT = [System.Drawing.ColorTranslator]::FromHtml("#2496FF")
$global:COL_BG = [System.Drawing.ColorTranslator]::FromHtml("#F8FAFC")
$global:COL_SURFACE = [System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")
$global:COL_TEXT_PRIMARY = [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
$global:COL_TEXT_SECONDARY = [System.Drawing.ColorTranslator]::FromHtml("#64748B")
$global:COL_TEXT_MUTED = [System.Drawing.ColorTranslator]::FromHtml("#94A3B8")
$global:COL_BORDER = [System.Drawing.ColorTranslator]::FromHtml("#E2E8F0")
$global:COL_BORDER_LIGHT = [System.Drawing.ColorTranslator]::FromHtml("#F1F5F9")
$global:COL_GREEN = [System.Drawing.ColorTranslator]::FromHtml("#16A34A")
$global:COL_GREEN_BG = [System.Drawing.ColorTranslator]::FromHtml("#F0FDF4")
$global:COL_AMBER = [System.Drawing.ColorTranslator]::FromHtml("#D97706")
$global:COL_AMBER_BG = [System.Drawing.ColorTranslator]::FromHtml("#FFFBEB")
$global:COL_RED = [System.Drawing.ColorTranslator]::FromHtml("#DC2626")
$global:COL_RED_BG = [System.Drawing.ColorTranslator]::FromHtml("#FEF2F2")
$global:COL_PURPLE = [System.Drawing.ColorTranslator]::FromHtml("#8B5CF6")
$global:COL_PURPLE_BG = [System.Drawing.ColorTranslator]::FromHtml("#F5F3FF")
$global:COL_WHITE = [System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")

function New-Canvas([int]$width = 1600, [int]$height = 1000, [string]$bgHex = "#F8FAFC") {
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    $bgCol = [System.Drawing.ColorTranslator]::FromHtml($bgHex)
    $brush = New-Object System.Drawing.SolidBrush $bgCol
    $g.FillRectangle($brush, 0, 0, $width, $height)
    $brush.Dispose()
    
    return @{ Bitmap = $bmp; Graphics = $g; Width = $width; Height = $height }
}

function Save-Canvas($canvas, [string]$path) {
    $dir = [System.IO.Path]::GetDirectoryName($path)
    if (-not [System.IO.Directory]::Exists($dir)) {
        [System.IO.Directory]::CreateDirectory($dir) | Out-Null
    }
    $canvas.Graphics.Dispose()
    $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Bitmap.Dispose()
    Write-Host "Saved: $path"
}

function Create-RoundedPath([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius = 8.0) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    if ($radius -le 0) {
        $path.AddRectangle((New-Object System.Drawing.RectangleF $x, $y, $width, $height))
        return $path
    }
    $diameter = $radius * 2.0
    
    # Top-Left
    $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
    # Top-Right
    $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
    # Bottom-Right
    $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
    # Bottom-Left
    $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    
    return $path
}

function Draw-Card($canvas, [float]$x, [float]$y, [float]$w, [float]$h, [System.Drawing.Color]$bgCol, [System.Drawing.Color]$borderCol, [float]$radius = 8.0, [float]$borderWidth = 1.0) {
    $g = $canvas.Graphics
    $path = Create-RoundedPath $x $y $w $h $radius
    
    $brush = New-Object System.Drawing.SolidBrush $bgCol
    $g.FillPath($brush, $path)
    $brush.Dispose()
    
    if ($borderWidth -gt 0) {
        $pen = New-Object System.Drawing.Pen $borderCol, $borderWidth
        $g.DrawPath($pen, $path)
        $pen.Dispose()
    }
    $path.Dispose()
}

function Draw-Badge($canvas, [float]$x, [float]$y, [string]$text, [System.Drawing.Color]$bgCol, [System.Drawing.Color]$textCol, [float]$fontSize = 9.0) {
    $g = $canvas.Graphics
    $font = New-Object System.Drawing.Font ("Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold)
    $size = $g.MeasureString($text, $font)
    $padX = 8.0
    $padY = 4.0
    $w = $size.Width + ($padX * 2.0)
    $h = $size.Height + ($padY * 2.0)
    
    $path = Create-RoundedPath $x $y $w $h 5.0
    $brushBg = New-Object System.Drawing.SolidBrush $bgCol
    $g.FillPath($brushBg, $path)
    $brushBg.Dispose()
    
    $brushText = New-Object System.Drawing.SolidBrush $textCol
    $g.DrawString($text, $font, $brushText, ($x + $padX), ($y + $padY))
    $brushText.Dispose()
    
    $font.Dispose()
    $path.Dispose()
}

function Draw-Button($canvas, [float]$x, [float]$y, [float]$w, [float]$h, [string]$label, [System.Drawing.Color]$btnBg) {
    $borderCol = if ($btnBg -eq $global:COL_SURFACE) { $global:COL_BORDER } else { $btnBg }
    Draw-Card $canvas $x $y $w $h $btnBg $borderCol 6.0 1.0
    $fontBtn = New-Object System.Drawing.Font "Segoe UI", 9.5, ([System.Drawing.FontStyle]::Bold)
    $textCol = if ($btnBg -eq $global:COL_SURFACE) { $global:COL_NAVY } else { $global:COL_WHITE }
    $size = $canvas.Graphics.MeasureString($label, $fontBtn)
    $tx = $x + (($w - $size.Width) / 2.0)
    $ty = $y + (($h - $size.Height) / 2.0)
    Draw-Text $canvas $label $fontBtn $textCol $tx $ty
    $fontBtn.Dispose()
}

function Draw-HeaderBlock($c, [string]$figNum, [string]$title, [string]$subtitle) {
    $fontFig = New-Object System.Drawing.Font "Segoe UI", 11.0, ([System.Drawing.FontStyle]::Bold)
    $fontTitle = New-Object System.Drawing.Font "Segoe UI", 18.0, ([System.Drawing.FontStyle]::Bold)
    $fontSub = New-Object System.Drawing.Font "Segoe UI", 10.5, ([System.Drawing.FontStyle]::Regular)
    
    Draw-Text $c $figNum.ToUpper() $fontFig $global:COL_BLUE 50.0 30.0
    Draw-Text $c $title $fontTitle $global:COL_NAVY 50.0 52.0
    Draw-Text $c $subtitle $fontSub $global:COL_TEXT_SECONDARY 50.0 90.0
    
    $pen = New-Object System.Drawing.Pen $global:COL_BORDER, 1.0
    $c.Graphics.DrawLine($pen, 50, 120, ($c.Width - 50), 120)
    $pen.Dispose()
    
    $fontFig.Dispose(); $fontTitle.Dispose(); $fontSub.Dispose()
}

function Draw-Arrow($canvas, [float]$x1, [float]$y1, [float]$x2, [float]$y2, [System.Drawing.Color]$color, [string]$label = "", [float]$lineWidth = 2.0) {
    $g = $canvas.Graphics
    $pen = New-Object System.Drawing.Pen $color, $lineWidth
    $pen.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap 5, 5
    $g.DrawLine($pen, $x1, $y1, $x2, $y2)
    $pen.Dispose()
    
    if ($label -ne "") {
        $font = New-Object System.Drawing.Font ("Segoe UI", 9.0, [System.Drawing.FontStyle]::Bold)
        $size = $g.MeasureString($label, $font)
        $midX = ($x1 + $x2) / 2.0 - ($size.Width / 2.0)
        $midY = ($y1 + $y2) / 2.0 - ($size.Height / 2.0) - 10.0
        
        $brushBg = New-Object System.Drawing.SolidBrush $global:COL_SURFACE
        $g.FillRectangle($brushBg, $midX - 3, $midY - 2, $size.Width + 6, $size.Height + 4)
        $brushBg.Dispose()
        
        $brushText = New-Object System.Drawing.SolidBrush $color
        $g.DrawString($label, $font, $brushText, $midX, $midY)
        $brushText.Dispose()
        $font.Dispose()
    }
}

function Draw-AppHeader($canvas, [string]$activeWorkspace = "Finance", [string]$userRole = "Enterprise Specialist") {
    $g = $canvas.Graphics
    $w = $canvas.Width
    
    # Top bar background
    $brushNavy = New-Object System.Drawing.SolidBrush $global:COL_NAVY
    $g.FillRectangle($brushNavy, 0, 0, $w, 56)
    $brushNavy.Dispose()
    
    # Brand logo text
    $fontBrand = New-Object System.Drawing.Font ("Segoe UI", 13.0, [System.Drawing.FontStyle]::Bold)
    $brushWhite = New-Object System.Drawing.SolidBrush ($global:COL_WHITE)
    $g.DrawString("SYNAPTIX", $fontBrand, $brushWhite, 24.0, 16.0)
    
    $brushBlue = New-Object System.Drawing.SolidBrush $global:COL_BLUE_ACCENT
    $g.DrawString("COMMAND", $fontBrand, $brushBlue, 106.0, 16.0)
    $brushBlue.Dispose()
    
    # Workspace Pill
    Draw-Card $canvas 210.0 12.0 160.0 32.0 $global:COL_NAVY_LIGHT $global:COL_BLUE 16.0 1.0
    $fontWs = New-Object System.Drawing.Font ("Segoe UI", 9.0, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("Workspace: $activeWorkspace", $fontWs, $brushWhite, 222.0, 18.0)
    $fontWs.Dispose()
    
    # Global search box
    Draw-Card $canvas 400.0 12.0 420.0 32.0 $global:COL_NAVY_LIGHT ([System.Drawing.Color]::FromArgb(40, 255, 255, 255)) 16.0 1.0
    $fontSearch = New-Object System.Drawing.Font ("Segoe UI", 9.0, [System.Drawing.FontStyle]::Regular)
    $brushMuted = New-Object System.Drawing.SolidBrush $global:COL_TEXT_MUTED
    $g.DrawString("Search indexed documents, actions, entities... (Ctrl + K)", $fontSearch, $brushMuted, 420.0, 18.0)
    $fontSearch.Dispose()
    $brushMuted.Dispose()
    
    # Right status badges & User Avatar
    Draw-Badge $canvas ($w - 380.0) 16.0 "Online (Gemini 2.5 Flash)" $global:COL_GREEN_BG $global:COL_GREEN 8.5
    Draw-Badge $canvas ($w - 220.0) 16.0 "SOC2 Audit Active" $global:COL_BLUE_LIGHT $global:COL_BLUE 8.5
    
    # User Profile Avatar circle
    $brushAvatar = New-Object System.Drawing.SolidBrush $global:COL_BLUE
    $g.FillEllipse($brushAvatar, ($w - 60.0), 12.0, 32.0, 32.0)
    $brushAvatar.Dispose()
    
    $fontAvatar = New-Object System.Drawing.Font ("Segoe UI", 10.0, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("SV", $fontAvatar, $brushWhite, ($w - 53.0), 17.0)
    $fontAvatar.Dispose()
    
    $brushWhite.Dispose()
    $fontBrand.Dispose()
}

function Draw-Sidebar($canvas, [string]$activeItem = "Dashboard") {
    $g = $canvas.Graphics
    $h = $canvas.Height
    
    # Sidebar container
    $brushBg = New-Object System.Drawing.SolidBrush $global:COL_SURFACE
    $g.FillRectangle($brushBg, 0, 56, 220, ($h - 56))
    $brushBg.Dispose()
    
    $penBorder = New-Object System.Drawing.Pen $global:COL_BORDER, 1.0
    $g.DrawLine($penBorder, 220, 56, 220, $h)
    $penBorder.Dispose()
    
    $items = @(
        @{ Label = "Command Center"; Icon = "[CMD]"; Y = 80 },
        @{ Label = "Uploads & Data"; Icon = "[DOC]"; Y = 125 },
        @{ Label = "Dashboard"; Icon = "[DSH]"; Y = 170 },
        @{ Label = "Agent Workflows"; Icon = "[WKF]"; Y = 215 },
        @{ Label = "Evidence Explorer"; Icon = "[EVD]"; Y = 260 },
        @{ Label = "Governed Actions"; Icon = "[ACT]"; Y = 305 },
        @{ Label = "Knowledge Graph"; Icon = "[KNG]"; Y = 350 },
        @{ Label = "Audit Trail"; Icon = "[AUD]"; Y = 395 },
        @{ Label = "Settings"; Icon = "[SET]"; Y = 440 }
    )
    
    $fontItem = New-Object System.Drawing.Font ("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)
    $fontActive = New-Object System.Drawing.Font ("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
    
    foreach ($it in $items) {
        $isActive = ($it.Label -eq $activeItem)
        if ($isActive) {
            Draw-Card $canvas 12.0 ($it.Y - 4) 196.0 36.0 $global:COL_BLUE_LIGHT $global:COL_BLUE 6.0 1.0
            $brushText = New-Object System.Drawing.SolidBrush $global:COL_BLUE
            $g.DrawString("$($it.Icon) $($it.Label)", $fontActive, $brushText, 24.0, $it.Y)
            $brushText.Dispose()
        } else {
            $brushText = New-Object System.Drawing.SolidBrush $global:COL_TEXT_SECONDARY
            $g.DrawString("$($it.Icon) $($it.Label)", $fontItem, $brushText, 24.0, $it.Y)
            $brushText.Dispose()
        }
    }
    
    $fontItem.Dispose()
    $fontActive.Dispose()
}

function Draw-Text($canvas, [string]$text, [System.Drawing.Font]$font, [System.Drawing.Color]$col, [float]$x, [float]$y) {
    $g = $canvas.Graphics
    $brush = New-Object System.Drawing.SolidBrush $col
    $g.DrawString($text, $font, $brush, $x, $y)
    $brush.Dispose()
}

function Draw-TextBox($canvas, [string]$text, [System.Drawing.Font]$font, [System.Drawing.Color]$col, [float]$x, [float]$y, [float]$w, [float]$h) {
    $g = $canvas.Graphics
    $brush = New-Object System.Drawing.SolidBrush $col
    $rect = New-Object System.Drawing.RectangleF $x, $y, $w, $h
    $g.DrawString($text, $font, $brush, $rect)
    $brush.Dispose()
}

Write-Host "Drawing Library loaded successfully."
