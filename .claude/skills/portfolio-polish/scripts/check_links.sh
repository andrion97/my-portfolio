#!/usr/bin/env bash
# Check every local href/src in the site's HTML files: files exist, #anchors match an id,
# and external target="_blank" links carry rel="noopener".
# Usage: check_links.sh <project_dir>
set -uo pipefail

[ $# -ge 1 ] || { echo "usage: $0 <project_dir>" >&2; exit 1; }
cd "$1" || exit 1
problems=0

has_id() { grep -q "id=\"$2\"" "$1"; }

for page in *.html; do
  while IFS= read -r ref; do
    case "$ref" in
      http://*|https://*|mailto:*|tel:*|data:*|"") continue ;;
      \#)  continue ;;
      \#*) has_id "$page" "${ref#\#}" || { echo "BROKEN ANCHOR  $page -> $ref"; problems=$((problems+1)); } ;;
      *)
        file=${ref%%#*}
        if [ ! -e "$file" ]; then
          echo "MISSING FILE   $page -> $ref"; problems=$((problems+1))
        elif [ "$file" != "$ref" ] && ! has_id "$file" "${ref#*#}"; then
          echo "BROKEN ANCHOR  $page -> $ref"; problems=$((problems+1))
        fi ;;
    esac
  done < <(grep -oE '(href|src)="[^"]*"' "$page" | sed -E 's/^(href|src)="//; s/"$//' | sort -u)

  while IFS= read -r tag; do
    echo "$tag" | grep -q 'rel="[^"]*noopener' || { echo "NO NOOPENER    $page: $(echo "$tag" | grep -oE 'href="[^"]*"')"; problems=$((problems+1)); }
  done < <(grep -oE '<a [^>]*target="_blank"[^>]*>' "$page")
done

if [ "$problems" -eq 0 ]; then echo "OK: all links, anchors and assets resolve"; else echo "$problems problem(s) found"; fi
