$src = [System.IO.File]::ReadAllText("projects.html", [System.Text.Encoding]::UTF8)

# Find exact positions
$filterStart = $src.IndexOf('            <div class="project-filters"')
$gridEnd_marker = '            </div>' + "`r`n" + '        </div>' + "`r`n" + '    </section>'
$gridEnd_marker2 = '            </div>' + "`n" + '        </div>' + "`n" + '    </section>'

$cta_pos = $src.IndexOf('<section class="cta-strip">')

Write-Host "filter at $filterStart, cta at $cta_pos"

# Find the </section> that ends the projects-archive section
# It is the first </section> before cta-strip
$sectionClose = $src.LastIndexOf('    </section>', $cta_pos - 1)
Write-Host "section close at $sectionClose"
Write-Host "Text: '$($src.Substring($sectionClose, 14))'"
