"""Legacy demo entry point.

The reviewed example JSON is the canonical authoring source. Delegate to the
same runner as `npm run demo` so rerunning this helper cannot overwrite edits.
"""
import pathlib
import subprocess

root = pathlib.Path(__file__).resolve().parent.parent
subprocess.run(['node', '--import', 'tsx', 'scripts/demo.ts'], cwd=root, check=True)
