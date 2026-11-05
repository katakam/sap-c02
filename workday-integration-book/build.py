#!/usr/bin/env python3
"""Builds dist/workday-integration-book.html (one file, works offline) and dist/artifact-fragment.html."""
import re, pathlib
root = pathlib.Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "assets/style.css").read_text(encoding="utf-8")
scripts = re.findall(r'<script src="([^"]+)"></script>', html)
js = "\n".join("/* ---- %s ---- */\n%s" % (s, (root / s).read_text(encoding="utf-8").replace("</script", "<\\/script")) for s in scripts)
fonts = re.search(r'<link rel="stylesheet" href="(https://fonts[^"]+)">', html).group(1)
body = re.search(r"<body>(.*?)<script src=", html, re.S).group(1)
desc = re.search(r'<meta name="description" content="([^"]+)"', html).group(1)
out = root / "dist"; out.mkdir(exist_ok=True)
full = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  '<title>Workday Integration Book</title>\n<meta name="description" content="%s">\n'
  '<link rel="stylesheet" href="%s">\n<style>\n%s\n</style>\n</head>\n<body>%s<script>\n%s\n</script>\n</body>\n</html>\n') % (desc, fonts, css, body, js)
(out / "workday-integration-book.html").write_text(full, encoding="utf-8")
frag = ('<title>Workday Integration Book</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
  '<link rel="stylesheet" href="%s">\n<style>\n%s\n</style>\n%s<script>\n%s\n</script>\n') % (fonts, css, body, js)
(out / "artifact-fragment.html").write_text(frag, encoding="utf-8")
print("built", len(full)//1024, "KB single file;", len(frag)//1024, "KB fragment")
