#!/bin/sh
# Renders src/assets/og.svg to public/og.png in headless Chrome, which loads the page's font
# from node_modules. A throwaway profile keeps it apart from any Chrome already running.
set -eu
cd "$(dirname "$0")/.."
profile=$(mktemp -d)
trap 'rm -rf "$profile"' EXIT
google-chrome --headless=new --user-data-dir="$profile" --allow-file-access-from-files --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=5000 \
  --screenshot=public/og.png "file://$PWD/src/assets/og.svg"
