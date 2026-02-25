Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$logoPath = Join-Path $root "Logos\NPCE no background.png"
$sidebarOut = Join-Path $PSScriptRoot "installerSidebar.bmp"
$uninstallOut = Join-Path $PSScriptRoot "uninstallerSidebar.bmp"
$headerOut = Join-Path $PSScriptRoot "installerHeader.bmp"

function New-Brush([string]$hex) {
  return [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function New-Sidebar([string]$path, [System.Drawing.Image]$logo) {
  $bmp = [System.Drawing.Bitmap]::new(164, 314, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

      $bg = New-Brush "#F2F4F7"
      $line = New-Brush "#D5DAE3"
      $title = New-Brush "#0F2E5B"
      $brand = New-Brush "#34527A"
      try {
        $graphics.FillRectangle($bg, 0, 0, 164, 314)
        $graphics.DrawImage($logo, [System.Drawing.Rectangle]::new(12, 18, 140, 37))
        $graphics.FillRectangle($line, 10, 85, 144, 1)

        $titleFont = [System.Drawing.Font]::new("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
        $smallFont = [System.Drawing.Font]::new("Segoe UI", 9, [System.Drawing.FontStyle]::Regular)
        try {
          $graphics.DrawString("Network PC Engineering", $titleFont, $title, 12, 96)
          $graphics.DrawString("(NPCE)", $titleFont, $title, 12, 116)
          $graphics.DrawString("AuctionTracker Setup", $smallFont, $brand, 12, 288)
        }
        finally {
          $titleFont.Dispose()
          $smallFont.Dispose()
        }
      }
      finally {
        $bg.Dispose()
        $line.Dispose()
        $title.Dispose()
        $brand.Dispose()
      }
    }
    finally {
      $graphics.Dispose()
    }
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Bmp)
  }
  finally {
    $bmp.Dispose()
  }
}

function New-Header([string]$path, [System.Drawing.Image]$logo) {
  $bmp = [System.Drawing.Bitmap]::new(150, 57, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

      $bg = New-Brush "#F2F4F7"
      try {
        $graphics.FillRectangle($bg, 0, 0, 150, 57)
      }
      finally {
        $bg.Dispose()
      }

      $graphics.DrawImage($logo, [System.Drawing.Rectangle]::new(50, 6, 92, 24))
    }
    finally {
      $graphics.Dispose()
    }
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Bmp)
  }
  finally {
    $bmp.Dispose()
  }
}

$logo = [System.Drawing.Image]::FromFile($logoPath)
try {
  New-Sidebar -path $sidebarOut -logo $logo
  New-Sidebar -path $uninstallOut -logo $logo
  New-Header -path $headerOut -logo $logo
}
finally {
  $logo.Dispose()
}
