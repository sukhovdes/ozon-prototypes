"""Rebase static URLs to the actual GitHub Pages project path."""
from pathlib import Path
import os
import re
import shutil

source = Path(__file__).resolve().parent / 'site'
target = source.parent / '_site'
base = os.environ.get('PAGES_BASE_PATH', '').rstrip('/')
if base and not re.fullmatch(r'/[A-Za-z0-9_.-]+', base):
    raise ValueError('Unexpected Pages base path')
if target.exists():
    shutil.rmtree(target)
shutil.copytree(source, target)
for file in target.rglob('*'):
    if file.is_file() and file.suffix in {'.html', '.css', '.js', '.json', '.svg'}:
        text = file.read_text()
        for directory in ('product-picker', 'rate-exploration'):
            text = text.replace('/' + directory + '/', base + '/' + directory + '/')
        file.write_text(text)
(target / '.nojekyll').touch()
print('Pages output:', target, 'base:', base or '/')
