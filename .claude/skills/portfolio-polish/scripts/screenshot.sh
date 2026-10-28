#!/usr/bin/env bash
# Render each page of a static site at desktop + phone widths, light + dark themes.
# Usage: screenshot.sh <project_dir> <out_dir> [page.html ...]
# Output: <out_dir>/<page>-<desktop|phone>-<light|dark>.png
#   desktop = 1280x900 (above the fold) plus a 1280x3200 full-page shot (-full)
#   phone   = 375px-wide iframe on an 800px canvas (grey area on the right is canvas)
set -euo pipefail

[ $# -ge 2 ] || { echo "usage: $0 <project_dir> <out_dir> [page.html ...]" >&2; exit 1; }
PROJ=$(cd "$1" && pwd)
OUT=$2
shift 2
mkdir -p "$OUT"
OUT=$(cd "$OUT" && pwd)

if [ $# -gt 0 ]; then PAGES=("$@"); else PAGES=(); while IFS= read -r p; do PAGES+=("$p"); done < <(cd "$PROJ" && ls *.html); fi

CHROME=""
for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
         "/Applications/Chromium.app/Contents/MacOS/Chromium" \
         "$(command -v google-chrome 2>/dev/null || true)" "$(command -v chromium 2>/dev/null || true)"; do
  [ -n "$c" ] && [ -x "$c" ] && CHROME=$c && break
done
[ -n "$CHROME" ] || { echo "Chrome/Chromium not found — cannot take screenshots" >&2; exit 1; }

shot() { # url width,height outfile
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
    --virtual-time-budget=4000 --window-size="$2" --screenshot="$3" "$1" >/dev/null 2>&1
}

for page in "${PAGES[@]}"; do
  name=${page%.html}
  for theme in light dark; do
    test_page="$OUT/_${name}-${theme}.html"
    # <base> makes relative assets resolve to the project; force theme and reveal-on-scroll content visible
    sed -e "s|<head>|<head><base href=\"file://$PROJ/\"><style>.reveal{opacity:1!important;transform:none!important}</style>|" \
        -e "s|<html lang=\"en\">|<html lang=\"en\" data-theme=\"$theme\">|" \
        "$PROJ/$page" > "$test_page"

    shot "file://$test_page" 1280,900  "$OUT/${name}-desktop-${theme}.png"

    # Tall window would stretch the 100vh hero to fill the shot; pin it to a 900px-screen height
    full_page="$OUT/_${name}-${theme}-full.html"
    sed -e 's|</style>|.hero{min-height:820px!important}</style>|' "$test_page" > "$full_page"
    shot "file://$full_page" 1280,3200 "$OUT/${name}-desktop-${theme}-full.png"

    frame="$OUT/_${name}-${theme}-frame.html"
    printf '<!doctype html><body style="margin:0;background:#888"><iframe src="file://%s" style="width:375px;height:3200px;border:0"></iframe></body>\n' "$test_page" > "$frame"
    shot "file://$frame" 800,3200 "$OUT/${name}-phone-${theme}.png"
  done
done

ls -1 "$OUT"/*.png
