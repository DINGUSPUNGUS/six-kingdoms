$src = [System.IO.File]::ReadAllText("projects.html", [System.Text.Encoding]::UTF8)

$oldBlock = @'
<section class="projects-archive">
        <div class="container">
            <p class="section-intro">A mix of what we do &mdash; pools, land, food gardens, and a couple of workshops that turned into something bigger.</p>

            <div class="project-filters" role="group" aria-label="Filter projects by category">
                <button class="filter-btn active" data-filter="all">All Projects</button>
                <button class="filter-btn" data-filter="EcoPools">EcoPools</button>
                <button class="filter-btn" data-filter="Ecological Design">Ecological Design</button>
                <button class="filter-btn" data-filter="Land Management">Land Management</button>
            </div>
'@

$newBlock = @'
<section class="projects-archive">
        <div class="container">
            <p class="section-intro">A mix of what we do &mdash; pools, land, food gardens, and a couple of workshops that turned into something bigger.</p>

'@

if ($src.Contains($oldBlock.Trim())) {
    Write-Output "Found old block"
    $newSrc = $src.Replace($oldBlock.Trim(), $newBlock.Trim())
    [System.IO.File]::WriteAllText("projects.html", $newSrc, [System.Text.Encoding]::UTF8)
    Write-Output "Replaced"
} else {
    Write-Output "NOT found"
    # Print location check
    $i = $src.IndexOf("project-filters")
    Write-Output "project-filters at: $i"
}
