"""
Update all page footers:
1. Add WhatsApp number to the footer-contact column
2. Remove the footer-social div (4th column)

Run from the six-kingdoms directory.
"""
import os, re

WA_SVG_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'


def find_div_end(content, start):
    """Given index of '<div class="...">', find the index just after its matching '</div>'."""
    depth = 0
    i = start
    while i < len(content):
        if content[i:i+4] == '<div':
            depth += 1
        elif content[i:i+6] == '</div>':
            depth -= 1
            if depth == 0:
                return i + 6
        i += 1
    return -1  # not found


def process_file(path):
    try:
        content = open(path, encoding='utf-8').read()
    except UnicodeDecodeError:
        content = open(path, encoding='cp1252').read()
    original = content
    
    footer_start = content.find('<footer ')
    if footer_start < 0:
        print(f'  SKIP: no <footer> in {path}')
        return
    footer_section = content[footer_start:]
    wa_already_present = 'wa.me/27766189722' in footer_section

    # ── 2. Add WA item to footer-contact ───────────────────────────────────────
    if wa_already_present:
        print(f'  WA already in footer, skipping add')
    else:
        fc_marker = '<div class="footer-contact">'
        fc_start = content.find(fc_marker, footer_start)
        if fc_start >= 0:
            fc_end = find_div_end(content, fc_start)
            if fc_end > 0:
                inner_close = content.rfind('</div>', fc_start, fc_end)
                line_start = content.rfind('\n', fc_start, inner_close)
                item_indent = ''
                for ch in content[line_start + 1:inner_close]:
                    if ch in (' ', '\t'):
                        item_indent += ch
                    else:
                        break
                wa_block = (
                    f'\n{item_indent}<div class="footer-contact-item">\n'
                    f'{item_indent}    <svg class="footer-icon" viewBox="0 0 24 24" fill="currentColor">\n'
                    f'{item_indent}        <path d="{WA_SVG_PATH}"/>\n'
                    f'{item_indent}    </svg>\n'
                    f'{item_indent}    <a href="https://wa.me/27766189722" target="_blank" rel="noopener noreferrer">076 618 9722</a>\n'
                    f'{item_indent}</div>'
                )
                fc_close_tag_pos = fc_end - 6
                content = content[:fc_close_tag_pos] + wa_block + '\n' + content[fc_close_tag_pos:]
                print(f'  Added WA contact item')
        else:
            print(f'  WARNING: no footer-contact found in {path}')

    # ── 3. Remove footer-social div ────────────────────────────────────────────
    fs_marker = '<div class="footer-social">'
    fs_start = content.find(fs_marker, footer_start)
    if fs_start >= 0:
        fs_end = find_div_end(content, fs_start)
        if fs_end > 0:
            # Also eat the preceding whitespace/newline
            line_start = content.rfind('\n', 0, fs_start)
            content = content[:line_start] + content[fs_end:]
            print(f'  Removed footer-social')
    else:
        print(f'  No footer-social found (may be 3-col already)')

    # ── 4. Save if changed ─────────────────────────────────────────────────────
    if content != original:
        open(path, 'w', encoding='utf-8').write(content)
        print(f'  Saved: {path}')
    else:
        print(f'  No changes: {path}')


files = [
    'index.html',
    'ecopools.html',
    'projects.html',
    'land-management.html',
    'blog.html',
    'contact.html',
    'plan.html',
    'privacy.html',
    '404.html',
    'living-water-future-of-swimming.html',
    'fynbos-restoration-reading-landscape.html',
    'knowing-your-land-stewardship.html',
    'fynbos-restoration-reading-a-landscape.html',
    'knowing-your-land-foundation-of-stewardship.html',
    'project-fynbos-restoration.html',
    'project-holistic-land-management.html',
    'project-ecosunergy-workshop.html',
]

for fname in files:
    print(f'\n{fname}:')
    if not os.path.exists(fname):
        print(f'  SKIP: file not found')
        continue
    process_file(fname)

print('\nDone.')

