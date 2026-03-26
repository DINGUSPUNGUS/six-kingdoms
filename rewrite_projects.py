src = open('projects.html', encoding='utf-8').read()
s = src.find('<section class="projects-archive">')
e = src.find('<section class="cta-strip">')
print(f'start={s} end={e}')

new_section = '''    <section class="projects-archive">
        <div class="container">
            <p class="section-intro">A mix of what we do &mdash; pools, land, food gardens, and a couple of workshops that turned into something bigger.</p>

            <!-- Tier: EcoPools -->
            <div class="projects-tier">
                <h2 class="projects-tier-heading">EcoPools</h2>
                <div class="projects-grid">
                    <div class="project-card" id="sine">
                        <div class="project-image"><img src="images/sines-back-yard-dipping-pool.jpg" alt="Natural dipping pool, Knysna Garden Route" loading="lazy" width="600" height="260"></div>
                        <div class="project-content">
                            <span class="project-tag">EcoPools</span>
                            <h3>Sine&#39;s Back Yard Natural Pool</h3>
                            <p>A back yard natural dipping pool in Knysna &mdash; no chemicals, just plants doing the work. Biology moved in within the first season.</p>
                            <a href="ecopools.html" class="project-link">About EcoPools &rarr;</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tier: Ecological Design -->
            <div class="projects-tier">
                <h2 class="projects-tier-heading">Ecological Design</h2>
                <div class="projects-grid">
                    <div class="project-card" id="fynbos">
                        <div class="project-image"><img src="images/fynbos-restoration-and-rain-garden-design.jpg" alt="Fynbos restoration and rain garden design, Plettenberg Bay, Garden Route" loading="lazy" width="600" height="260"></div>
                        <div class="project-content">
                            <span class="project-tag">Ecological Design</span>
                            <h3>Fynbos Restoration &amp; Rain Garden Design</h3>
                            <p>A unique site near Plettenberg Bay &mdash; restoring fynbos and integrating rain garden design into a living, working landscape.</p>
                            <a href="project-fynbos-restoration.html" class="project-link">Read the project &rarr;</a>
                        </div>
                    </div>

                    <div class="project-card" id="ecosunergy">
                        <div class="project-image"><img src="images/a-practical-sustainability-workshop-with-ecosunergy.jpg" alt="Practical sustainability workshop with Ecosunergy, Garden Route" loading="lazy" width="600" height="260"></div>
                        <div class="project-content">
                            <span class="project-tag">Ecological Design</span>
                            <h3>Practical Sustainability with Ecosunergy</h3>
                            <p>A day at a beautiful flower farm &mdash; covering solar, biogas, and invasive plant management with hands-on practical systems.</p>
                            <a href="project-ecosunergy-workshop.html" class="project-link">Read the project &rarr;</a>
                        </div>
                    </div>

                    <div class="project-card">
                        <div class="project-image"><img src="images/clayton-and-lisas-permaculture-orchard.jpg" alt="Clayton and Lisa&#39;s food forest, Garden Route" loading="lazy" width="600" height="260"></div>
                        <div class="project-content">
                            <span class="project-tag">Ecological Design</span>
                            <h3>Clayton &amp; Lisa&#39;s Food Forest Orchard</h3>
                            <p>A small food forest orchard on a Garden Route property &mdash; fruiting trees, supporting plants, medicinal herbs, and edible berries, installed in 2019.</p>
                            <a href="contact.html" class="project-link">Enquire about a design &rarr;</a>
                        </div>
                    </div>

                    <div class="project-card">
                        <div class="project-image"><img src="images/wilderness-biodiversity-corridor.jpg" alt="Wilderness biodiversity corridor habitat restoration, Garden Route" loading="lazy" width="600" height="260"></div>
                        <div class="project-content">
                            <span class="project-tag">Ecological Design</span>
                            <h3>Wilderness Biodiversity Corridor</h3>
                            <p>A landscape-scale ecological design project connecting fragmented habitat patches along the Garden Route &mdash; enabling wildlife movement and native plant regeneration.</p>
                            <a href="contact.html" class="project-link">Enquire about a design &rarr;</a>
                        </div>
                    </div>

                    <div class="project-card">
                        <div class="project-image"><img src="images/edible-food-forest-workshop.jpg" alt="Edible food forest design workshop, Garden Route" loading="lazy" width="600" height="260"></div>
                        <div class="project-content">
                            <span class="project-tag">Ecological Design</span>
                            <h3>Edible Food Forest Workshop</h3>
                            <p>A hands-on workshop introducing participants to food forest design &mdash; layering edible trees, shrubs, herbs, and ground covers into a productive, low-maintenance system.</p>
                            <a href="contact.html" class="project-link">Enquire about a workshop &rarr;</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tier: Land Management -->
            <div class="projects-tier">
                <h2 class="projects-tier-heading">Land Management</h2>
                <div class="projects-grid">
                    <div class="project-card" id="vision">
                        <div class="project-image"><img src="images/creating-a-vision-for-holistic-land-management.jpg" alt="Creating a holistic land management vision, Garden Route" loading="lazy" width="600" height="260"></div>
                        <div class="project-content">
                            <span class="project-tag">Land Management</span>
                            <h3>A Vision for Holistic Land Management</h3>
                            <p>A walk through the land management process in practice &mdash; how we read a site with a client and build a realistic plan around what&#39;s actually there.</p>
                            <a href="project-holistic-land-management.html" class="project-link">Read the project &rarr;</a>
                        </div>
                    </div>

                    <div class="project-card">
                        <div class="project-image"><img src="images/greenpops-forests-for-life-program.jpg" alt="Greenpop Forests For Life, Garden Route" loading="lazy" width="600" height="260"></div>
                        <div class="project-content">
                            <span class="project-tag">Land Management</span>
                            <h3>Greenpop&#39;s Forests For Life</h3>
                            <p>A collaborative reforestation and stewardship project enabling land restoration and alternative livelihoods across sub-Saharan Africa.</p>
                            <a href="land-management.html" class="project-link">About land management &rarr;</a>
                        </div>
                    </div>

                    <div class="project-card">
                        <div class="project-image"><img src="images/salt-river-invasive-plant-clearing.jpg" alt="Salt River invasive alien plant clearing, Cape Town" loading="lazy" width="600" height="260"></div>
                        <div class="project-content">
                            <span class="project-tag">Land Management</span>
                            <h3>Salt River Invasive Plant Clearing</h3>
                            <p>A month-long Invasive Alien Plant clearing project in one of Cape Town&#39;s most ecologically significant rivers &mdash; the Salt River. Partnered with BioWise.</p>
                            <a href="land-management.html" class="project-link">About land management &rarr;</a>
                        </div>
                    </div>

                    <div class="project-card">
                        <div class="project-image"><img src="images/diepklowe-regenerative-farm.jpg" alt="Diepklowe regenerative farm" loading="lazy" width="600" height="260"></div>
                        <div class="project-content">
                            <span class="project-tag">Land Management</span>
                            <h3>Diepklowe Regenerative Farm</h3>
                            <p>Degraded farmland on the Garden Route restored using regenerative agriculture principles &mdash; compacted soils, invasive clearing, and building productive food systems back from the ground up.</p>
                            <a href="land-management.html" class="project-link">About land management &rarr;</a>
                        </div>
                    </div>

                    <div class="project-card">
                        <div class="project-image"><img src="images/alien clearing.jpg" alt="Alien invasive plant clearing operation, Garden Route" loading="lazy" width="600" height="260"></div>
                        <div class="project-content">
                            <span class="project-tag">Invasive Clearing</span>
                            <h3>Alien Clearing</h3>
                            <p>Systematic removal of invasive alien plants to restore indigenous biodiversity and give fynbos the space it needs to recover and thrive.</p>
                            <a href="land-management.html" class="project-link">Land management &rarr;</a>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>

'''

new_content = src[:s] + new_section + src[e:]
open('projects.html', 'w', encoding='utf-8').write(new_content)
print('Done. File written.')
