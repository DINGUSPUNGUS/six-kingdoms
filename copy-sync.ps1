# copy-sync.ps1 — Six Kingdoms website copy watcher
#
# Usage: Right-click → "Run with PowerShell"
#        Or from VS Code terminal: .\copy-sync.ps1
#
# Watches website-copy.md for changes and updates HTML files automatically.
# Stop with Ctrl+C.

$Root     = $PSScriptRoot
$CopyFile = Join-Path $Root "website-copy.md"

$HtmlFiles = @(
    "index.html",
    "ecopools.html",
    "land-management.html",
    "contact.html",
    "living-water-future-of-swimming.html",
    "fynbos-restoration-reading-landscape.html",
    "knowing-your-land-stewardship.html"
)

# ── HTML entity decoder (so plain markdown text matches HTML anchor content) ──
function Decode-Html($str) {
    $str = $str -replace '&mdash;',  '—'
    $str = $str -replace '&ndash;',  '–'
    $str = $str -replace '&middot;', '·'
    $str = $str -replace '&rarr;',   '→'
    $str = $str -replace '&larr;',   '←'
    $str = $str -replace '&amp;',    '&'
    $str = $str -replace '&lt;',     '<'
    $str = $str -replace '&gt;',     '>'
    $str = $str -replace '&quot;',   '"'
    $str = $str -replace '&rsquo;',  [char]0x2019
    $str = $str -replace '&lsquo;',  [char]0x2018
    $str = $str -replace '&rdquo;',  [char]0x201D
    $str = $str -replace '&ldquo;',  [char]0x201C
    $str = $str -replace '&nbsp;',   ' '
    return $str.Trim()
}

# ── Parse website-copy.md → hashtable {label → value} ──────────────────────
function Parse-Copy($content) {
    $map    = @{}
    $blocks = [regex]::Split($content, '(?m)^(?=## )')

    foreach ($block in $blocks) {
        $lines = $block -split "`n"
        if (-not $lines[0].StartsWith('## ')) { continue }

        $label = $lines[0].Substring(3).Trim()
        $rest  = @($lines[1..($lines.Length - 1)] |
                   Where-Object { $_ -notmatch '^#{1,2} ' -and $_.Trim() -ne '---' })

        while ($rest.Count -gt 0 -and -not $rest[0].Trim())     { $rest = @($rest[1..($rest.Length - 1)]) }
        while ($rest.Count -gt 0 -and -not $rest[-1].Trim())    { $rest = @($rest[0..($rest.Length - 2)]) }

        if ($label -and $rest.Count -gt 0) {
            $map[$label] = ($rest -join "`n")
        }
    }

    return $map
}

# ── Apply copy values to all HTML files ─────────────────────────────────────
function Sync-Copy {
    if (-not (Test-Path $CopyFile)) { Write-Host "website-copy.md not found."; return }

    $copy    = Parse-Copy (Get-Content $CopyFile -Raw -Encoding UTF8)
    $time    = Get-Date -Format "HH:mm:ss"
    $changed = 0

    $pattern = [regex]'<!-- \[\[([^\]]+)\]\] -->([\s\S]*?)<!-- \[\[/\]\] -->'

    foreach ($file in $HtmlFiles) {
        $fp = Join-Path $Root $file
        if (-not (Test-Path $fp)) { continue }

        $html     = [System.IO.File]::ReadAllText($fp, [System.Text.Encoding]::UTF8)
        $original = $html

        $html = $pattern.Replace($html, {
            param($m)
            $label   = $m.Groups[1].Value.Trim()
            $current = $m.Groups[2].Value

            if (-not $copy.ContainsKey($label)) { return $m.Value }

            $next            = $copy[$label]
            $currentDecoded  = Decode-Html $current

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
        Write-Host "[$time] $($script:changed) section(s) updated — pushing to GitHub..." -ForegroundColor Yellow

        Push-Location $Root
        git add -A 2>&1 | Out-Null
        git commit -m "Copy update from website-copy.md" 2>&1 | Out-Null
        $pushResult = git push origin master 2>&1
        Pop-Location

        if ($LASTEXITCODE -eq 0) {
            Write-Host "[$time] Live on website.`n" -ForegroundColor Green
        } else {
            Write-Host "[$time] Push failed: $pushResult`n" -ForegroundColor Red
        }
    } else {
        Write-Host "[$time] No changes detected.`n"
    }
}

# ── Main ─────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  Six Kingdoms — Copy Sync" -ForegroundColor Cyan
Write-Host "  Watching website-copy.md  (Ctrl+C to stop)" -ForegroundColor Cyan
Write-Host ""

$script:changed = 0
Sync-Copy

$lastWrite = (Get-Item $CopyFile).LastWriteTime

while ($true) {
    Start-Sleep -Milliseconds 400
    $currentWrite = (Get-Item $CopyFile).LastWriteTime
    if ($currentWrite -ne $lastWrite) {
        $lastWrite       = $currentWrite
        $script:changed  = 0
        Sync-Copy
    }
}
