#!/usr/bin/env python3
"""
Fix SAP-C02 HTML files:
  1. patterns/sap_c02_patterns_v2.html  — convert '• item<br>' in blocks to <ul><li>
  2. questions/scenarios_*.html          — convert markdown to HTML, add doctype wrapper
"""

import re
import os

BASE = '/home/vk/personal/vkk/sap-c02'


# ─────────────────────────────────────────────────────────────
#  PATTERNS FILE  —  convert bullet lines inside blocks
# ─────────────────────────────────────────────────────────────

def bulletize_block_content(content):
    """
    '• item1<br>• item2<br>• item3'  →  '<ul><li>item1</li>…</ul>'
    Only transforms when '•' is present and multiple items exist.
    """
    content = re.sub(r'^•\s*', '', content.strip())
    if '•' not in content and '<br>' not in content:
        return content
    parts = re.split(r'<br>\s*•?\s*', content)
    parts = [p.strip() for p in parts if p.strip()]
    if len(parts) <= 1:
        return content
    return '<ul>' + ''.join(f'<li>{p}</li>' for p in parts) + '</ul>'


def fix_patterns_file(path):
    with open(path, encoding='utf-8') as f:
        html = f.read()

    block_list_css = """\
/* ─────────────────────────────────────────
   BLOCK  LIST  ITEMS  (NEVER / THEN bullets)
   ───────────────────────────────────────── */
.if-block ul, .then-block ul, .not-block ul, .why-block ul {
  list-style: disc;
  padding-left: 18px;
  margin: 4px 0 2px;
}
.if-block ul li, .then-block ul li, .not-block ul li, .why-block ul li {
  display: list-item;
  margin-bottom: 5px;
  padding: 0;
  background: none;
  border: none;
}
"""
    html = html.replace('</style>\n</head>', block_list_css + '</style>\n</head>', 1)

    def fix_block(m):
        open_tag   = m.group(1)
        label_div  = m.group(2)
        body       = m.group(3)
        new_body   = bulletize_block_content(body)
        return f'{open_tag}{label_div}{new_body}</div>'

    pattern = (
        r'(<div class="(?:if|then|not|why)-block">)'
        r'(<div class="block-label">.*?</div>)'
        r'((?:(?!</div>)[\s\S])*?)'
        r'</div>'
    )
    html = re.sub(pattern, fix_block, html)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'  Patterns fixed: {os.path.basename(path)}')


# ─────────────────────────────────────────────────────────────
#  QUESTION FILES  —  markdown → HTML
# ─────────────────────────────────────────────────────────────

# Known domain name endings (longest first to avoid partial matches)
_DOMAIN_ALT = (
    r'Design Solutions for Organizational Complexity'
    r'|Continuous Improvement for Existing Solutions'
    r'|Design for New Solutions'
    r'|Migration Planning'
    r'|Cost Control'
)

def apply_inline(text, dotall=False):
    """Inline code then bold. Use dotall=True for multi-line content."""
    text = re.sub(r'`([^`\n]+)`', r'<code>\1</code>', text)
    flags = re.DOTALL if dotall else 0
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text, flags=flags)
    return text


def fix_reformatted_lines(content):
    """
    Handle reformatted (reflowed-onto-single-lines) content in scenarios_41_55.
    1. Strip excessively-indented lines (≥8 leading spaces from the reflow).
    2. Insert newlines before block-level markers that appear mid-line.
    3. Join split headings; split headings where body leaked in.
    """
    # Strip ≥8 leading spaces (artifact of heavy reflow in scenarios_41_55)
    content = re.sub(r'^[ \t]{8,}', '', content, flags=re.MULTILINE)

    # Insert newline before ### or ## that appear mid-line.
    # Use (?<=[^\n#]) for ## so we don't split ### into # + ##.
    content = re.sub(r'(?<=[^\n])(###\s)', r'\n\1', content)
    content = re.sub(r'(?<=[^\n#])(##\s)',  r'\n\1', content)

    # Insert newline before option / bullet markers that appear mid-line
    content = re.sub(r'(?<=[^\n])(- \[ \] )',      r'\n\1', content)
    content = re.sub(r'(?<=[^\n])(\* \*\*[A-D]\))', r'\n\1', content)

    # ── Heading reconstruction (reformatted files only) ──────────────────────

    # Join a heading split across two lines: "### Scenario N: Domain X —\nMigration Planning …"
    # → "### Scenario N: Domain X — Migration Planning …"
    content = re.sub(
        r'(### Scenario \d+:[^\n]*?) —\n[ \t]*(' + _DOMAIN_ALT + r'\b)',
        r'\1 — \2',
        content
    )

    # Join a heading that has NO domain info on the same line:
    # "### Scenario 54:\nDomain 4 — Cost Control …" → "### Scenario 54: Domain 4 — Cost Control …"
    content = re.sub(
        r'(### Scenario \d+:)\n[ \t]*(Domain \d+[^\n]*?(?:' + _DOMAIN_ALT + r')\b)',
        r'\1 \2',
        content
    )

    # Split body text that leaked into a heading line after the domain name.
    # "### Scenario 55: … Existing Solutions A telecom…" → split before the body sentence.
    content = re.sub(
        r'(### Scenario \d+:[^#\n]*?(?:' + _DOMAIN_ALT + r')) +(?=[A-Z])',
        r'\1\n',
        content
    )

    return content


def preprocess(content):
    """Strip artifacts, then fix reformatted lines."""
    # Jekyll front matter
    content = re.sub(r'^\s*---\s*\n.*?\n---\s*\n', '', content, flags=re.DOTALL)
    # Markdown H1 artifact
    content = re.sub(r'^#\s+aws_learning\s*\n?', '', content, flags=re.MULTILINE)
    # Apply reformatting fixes
    content = fix_reformatted_lines(content)
    return content


def convert_question_file(src_path, title):
    with open(src_path, encoding='utf-8') as f:
        raw = f.read()

    raw = preprocess(raw)

    # Apply inline markdown globally BEFORE line-by-line processing so that
    # **bold** spanning multiple lines is handled correctly.
    raw = apply_inline(raw, dotall=True)

    # Extract <style> block(s) — take the first one (the main Pearson VUE style)
    style_m = re.search(r'(<style[\s\S]*?</style>)', raw)
    style_html = style_m.group(1) if style_m else ''
    if style_m:
        raw = raw.replace(style_m.group(1), '', 1)

    # Extract <nav> block
    nav_m = re.search(r'(<nav[\s\S]*?</nav>)', raw)
    nav_html = nav_m.group(1) if nav_m else ''
    if nav_m:
        raw = raw.replace(nav_m.group(1), '', 1)

    lines = raw.split('\n')
    out = []
    i = 0
    in_ul = False      # inside options <ul>
    details_depth = 0  # nesting level inside <details>

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Track <details> depth
        details_depth += stripped.count('<details') - stripped.count('</details')
        if details_depth < 0:
            details_depth = 0

        # ── Option checkbox item:  - [ ] **A)** ... ──────────────────────────
        opt_m = re.match(r'^- \[ \] (.+)$', line)
        if opt_m:
            if not in_ul:
                out.append('<ul class="options">')
                in_ul = True
            content = opt_m.group(1)
            i += 1
            # Accept any continuation that isn't a blank line, HTML tag,
            # another option, a bullet, or a heading.
            while i < len(lines):
                nl = lines[i]
                nl_s = nl.strip()
                if (not nl_s
                        or nl_s.startswith('<')
                        or re.match(r'^- \[ \]', nl)
                        or re.match(r'^\*\s', nl)
                        or re.match(r'^  \*\s', nl)
                        or re.match(r'^#{2,}\s', nl)):
                    break
                content += ' ' + nl_s
                i += 1
            out.append(f'<li><input type="checkbox"> {apply_inline(content)}</li>')
            continue

        # Close options <ul> on any non-blank non-option line
        if in_ul and stripped and not re.match(r'^- \[ \]', stripped):
            out.append('</ul>')
            in_ul = False

        # ── H3 ───────────────────────────────────────────────────────────────
        h3_m = re.match(r'^#{3}\s+(.+)$', line)
        if h3_m:
            out.append(f'<h3>{apply_inline(h3_m.group(1))}</h3>')
            i += 1
            continue

        # ── H2 ───────────────────────────────────────────────────────────────
        h2_m = re.match(r'^#{2}\s+(.+)$', line)
        if h2_m:
            out.append(f'<h2>{apply_inline(h2_m.group(1))}</h2>')
            i += 1
            continue

        # ── Answer option without checkbox:  * **A)** …  (outside <details>) ─
        # After global apply_inline, **A)** becomes <strong>A)</strong>
        opt2_m = re.match(r'^\* (<strong>[A-D]\)</strong>.+)$', line)
        if opt2_m and details_depth == 0:
            if not in_ul:
                out.append('<ul class="options">')
                in_ul = True
            content = opt2_m.group(1)
            i += 1
            while i < len(lines):
                nl = lines[i]
                nl_s = nl.strip()
                if (not nl_s
                        or nl_s.startswith('<')
                        or re.match(r'^\*\s', nl)
                        or re.match(r'^#{2,}\s', nl)):
                    break
                content += ' ' + nl_s
                i += 1
            out.append(f'<li><input type="checkbox"> {apply_inline(content)}</li>')
            continue

        # ── Explanation top-level bullet:  '* text' or '  * text'  (inside <details>) ──
        # (0-indent and 2-space-indent asterisk bullets are top-level explanation items)
        bul_m = re.match(r'^ {0,2}\* (.+)$', line)
        if bul_m and details_depth > 0:
            content = bul_m.group(1)
            i += 1
            # Collect continuation: 2-space indent, not another bullet/HTML
            while i < len(lines):
                nl = lines[i]
                if (re.match(r'^  \S', nl)
                        and not re.match(r'^  [*-] ', nl)
                        and not nl.strip().startswith('<')):
                    content += ' ' + nl.strip()
                    i += 1
                else:
                    break
            out.append(f'<p class="expl-item">{apply_inline(content)}</p>')
            continue

        # ── Sub-alternative bullet:  '  - text' or '    - text'  (inside <details>) ────
        sub_m = re.match(r'^  {1,4}- (.+)$', line)
        if sub_m and details_depth > 0:
            content = sub_m.group(1)
            i += 1
            # Collect continuation: accept any 2+ leading spaces, stop at bullets/HTML
            while i < len(lines):
                nl = lines[i]
                if (re.match(r'^  ', nl)
                        and not re.match(r'^  [*-] ', nl)
                        and not nl.strip().startswith('<')):
                    content += ' ' + nl.strip()
                    i += 1
                else:
                    break
            out.append(f'<p class="expl-sub">– {apply_inline(content)}</p>')
            continue

        # ── Everything else: apply inline markdown ───────────────────────────
        out.append(apply_inline(line))
        i += 1

    if in_ul:
        out.append('</ul>')

    body_content = '\n'.join(out)

    extra_css = """
<style>
.expl-item { margin: 10px 0 4px; font-weight: normal; }
.expl-sub  { margin: 4px 0 4px 20px; }
ul.options { list-style: none; padding: 0; margin: 20px 0; }
ul.options li { display: flex; align-items: flex-start; margin-bottom: 14px; }
ul.options input[type=checkbox] { margin-right: 12px; margin-top: 3px; flex-shrink: 0; }
</style>"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
{style_html}
{extra_css}
</head>
<body>
{nav_html}
{body_content}
</body>
</html>"""

    with open(src_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'  Questions fixed: {os.path.basename(src_path)}')


# ─────────────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────────────

print('Fixing patterns file…')
fix_patterns_file(os.path.join(BASE, 'patterns/sap_c02_patterns_v2.html'))

print('Fixing question files…')
q_files = [
    ('questions/scenarios_1_40.html',  'SAP-C02 Scenarios 1–40'),
    ('questions/scenarios_41_55.html', 'SAP-C02 Scenarios 41–55'),
    ('questions/scenarios_56_70.html', 'SAP-C02 Scenarios 56–70'),
]
for rel, title in q_files:
    convert_question_file(os.path.join(BASE, rel), title)

print('Done.')
