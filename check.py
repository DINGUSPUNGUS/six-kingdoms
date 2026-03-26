lines = open('projects.html', encoding='utf-8').readlines()
for i, l in enumerate(lines):
    if any(x in l for x in ['projects-tier', 'project-filters', 'projects-grid']):
        print(i+1, l.rstrip())
