# copy-sync.ps1 -- Six Kingdoms website copy watcher
#
# Usage: Right-click -> "Run with PowerShell"
#        Or from VS Code terminal: .\copy-sync.ps1
#
# Watches website-copy.md for changes and updates HTML files automatically.
# Stop with Ctrl+C.

$Root     = $PSScriptRoot
$CopyFile = Join-Path $Root "website-copy.md"

$HtmlFiles = @(
    "index.html",
    "ecopools.html",
    "ecological-design.html",
    "land-management.html",
    "contact.html"
)

# HTML entity decoder (so plain markdown text matches HTML anchor content)
function Decode-Html($str) {
    $str = $str -replace '&mdash;',  [char]0x2014    # em-dash
    $str = $str -replace '&ndash;',  [char]0x2013    # en-dash
    $str = $str -replace '&middot;', [char]0x00B7
    $str = $str -replace '&rarr;',   [char]0x2192    # right arrow
    $str = $str -replace '&larr;',   [char]0x2190    # left arrow
    $str = $str -replace '&amp;',    "&"
    $str = $str -replace '&lt;',     "<"
    $str = $str -replace '&gt;',     ">"
    $str = $str -replace '&quot;',   [char]34        # quote
    $str = $str -replace '&rsquo;',  [char]0x2019
    $str = $str -replace '&lsquo;',  [char]0x2018
    $str = $str -replace '&rdquo;',  [char]0x201D
    $str = $str -replace '&ldquo;',  [char]0x201C
    $str = $str -replace '&nbsp;',   ' '
    $str = $str -replace '&copy;',   [char]0x00A9
    $str = $str -replace '&reg;',    [char]0x00AE
    $str = $str -replace '&deg;',    [char]0x00B0
    $str = $str -replace '&times;',  [char]0x00D7
    $str = $str -replace '&divide;', [char]0x00F7
    $str = $str -replace '&euro;',   [char]0x20AC
    $str = $str -replace '&sect;',   [char]0x00A7
    $str = $str -replace '&curren;', [char]0x00A4
    return $str.Trim()
}

# Validate labels between markdown map and HTML anchors.
function Validate-CopyAnchors($copyMap) {
    $pattern = [regex]'<!-- \[\[([^\]]+)\]\] -->'
    foreach ($file in $HtmlFiles) {
        $fp = Join-Path $Root $file
        if (-not (Test-Path $fp)) {
            Write-Host "  [WARN] Missing target file: $file" -ForegroundColor Red
            continue
        }

        $html = [System.IO.File]::ReadAllText($fp, [System.Text.Encoding]::UTF8)
        $anchors = [System.Collections.Generic.HashSet[string]]::new()
        foreach ($m in $pattern.Matches($html)) {
            $label = $m.Groups[1].Value.Trim()
            if ($label -eq '/') { continue }
            [void]$anchors.Add($label)
        }

        $missing = @()
        foreach ($anchor in $anchors) {
            if (-not $copyMap.ContainsKey($anchor)) {
                $missing += $anchor
            }
        }

        if ($missing.Count -gt 0) {
            Write-Host "  [WARN] $file has anchor labels missing in website-copy.md:" -ForegroundColor Yellow
            foreach ($label in $missing) {
                Write-Host "    - $label" -ForegroundColor Yellow
            }
        }
    }
}

# Parse website-copy.md -> hashtable {label -> value}
function Parse-Copy($content) {
    $map    = @{}
    $blocks = [regex]::Split($content, '(?m)^(?=## )')

    foreach ($block in $blocks) {
        $lines = $block -split "`n"
        if (-not $lines[0].StartsWith('## ')) { continue }

        $label = $lines[0].Substring(3).Trim()
        $rest  = @($lines[1..($lines.Length - 1)] |
                   Where-Object { $_ -notmatch '^#{1,2} ' -and $_.Trim() -ne '---' })

        while ($rest.Count -gt 0 -and -not $rest[0].Trim())  { $rest = @($rest[1..($rest.Length - 1)]) }
        while ($rest.Count -gt 0 -and -not $rest[-1].Trim()) { $rest = @($rest[0..($rest.Length - 2)]) }

        if ($label -and $rest.Count -gt 0) {
            $map[$label] = ($rest -join "`n")
        }
    }

    return $map
}

# Apply copy values to all HTML files
function Sync-Copy {
    if (-not (Test-Path $CopyFile)) { Write-Host "website-copy.md not found."; return }

    $copy    = Parse-Copy (Get-Content $CopyFile -Raw -Encoding UTF8)
    $time    = Get-Date -Format "HH:mm:ss"
    $changed = 0

    Validate-CopyAnchors $copy

    $pattern = [regex]'<!-- \[\[([^\]]+)\]\] -->([\s\S]*?)<!-- \[\[/\]\] -->'

    foreach ($file in $HtmlFiles) {
        $fp = Join-Path $Root $file
        if (-not (Test-Path $fp)) {
            Write-Host "  [WARN] File not found: $file" -ForegroundColor Red
            continue
        }

        $html     = [System.IO.File]::ReadAllText($fp, [System.Text.Encoding]::UTF8)
        $original = $html

        $html = $pattern.Replace($html, {
            param($m)
            $label   = $m.Groups[1].Value.Trim()
            $current = $m.Groups[2].Value

            if (-not $copy.ContainsKey($label)) { return $m.Value }

            $next           = $copy[$label]
            $currentDecoded = Decode-Html $current

            if ($next -eq $currentDecoded) { return $m.Value }

            $script:changed++
            Write-Host "  [$file] `"$label`""
            return "<!-- [[$($m.Groups[1].Value)]] -->$next<!-- [[/]] -->"
        })

        if ($html -ne $original) {
            [System.IO.File]::WriteAllText($fp, $html, [System.Text.Encoding]::UTF8)
        }
    }

    if ($script:changed -gt 0) {
        Write-Host "[$time] $($script:changed) section(s) updated locally. Commit/push manually when ready.`n" -ForegroundColor Green
    } else {
        Write-Host "[$time] No changes detected.`n"
    }
}

# Main
Write-Host ""
Write-Host "  Six Kingdoms -- Copy Sync" -ForegroundColor Cyan
Write-Host "  Watching website-copy.md  (Ctrl+C to stop)" -ForegroundColor Cyan
Write-Host ""

$script:changed = 0
Sync-Copy

$lastWrite = (Get-Item $CopyFile).LastWriteTime

while ($true) {
    Start-Sleep -Milliseconds 400
    $currentWrite = (Get-Item $CopyFile).LastWriteTime
    if ($currentWrite -ne $lastWrite) {
        $lastWrite      = $currentWrite
        $script:changed = 0
        Sync-Copy
    }
}
