#!/bin/bash

SCRIPT_DIR="$(dirname "$(realpath "$0")")"
EDITOR_FILTER="$1"

if [[ -z "$EDITOR_FILTER" ]]; then
    tabs=$(node "$SCRIPT_DIR/index.js" tabs)
    tab_count=$(echo "$tabs" | wc -l)
    
    if [[ $tab_count -eq 2 ]]; then
        EDITOR_FILTER=$(echo "$tabs" | tail -n 1 | awk -F'|' '{print $2}')
    elif [[ $tab_count -eq 1 ]]; then
        EDITOR_FILTER="all"
    else
        selected_tab=$(echo "$tabs" | cut -d'|' -f1 | walker --dmenu -p "Select IDE…")
        [[ -z "$selected_tab" ]] && exit 0
        EDITOR_FILTER=$(echo "$tabs" | awk -F'|' -v sel="$selected_tab" '$1 == sel {print $2; exit}')
        [[ -z "$EDITOR_FILTER" ]] && exit 0
    fi
fi

projects=$(node "$SCRIPT_DIR/index.js" list "$EDITOR_FILTER")
[[ -z "$projects" ]] && exit 0

case "$EDITOR_FILTER" in
    all) prompt="All Projects…" ;;
    Cursor) prompt="Cursor Projects…" ;;
    "VS Code"|"VS Code OSS") prompt="VS Code Projects…" ;;
    VSCodium) prompt="VSCodium Projects…" ;;
    Zed) prompt="Zed Projects…" ;;
    *) prompt="Projects…" ;;
esac

selected=$(echo "$projects" | cut -d'|' -f1 | walker --dmenu -p "$prompt")
[[ -z "$selected" ]] && exit 0

project_line=$(echo "$projects" | awk -F'|' -v sel="$selected" '$1 == sel')
[[ -z "$project_line" ]] && exit 0

folder=$(echo "$project_line" | cut -d'|' -f2)
cmd=$(echo "$project_line" | cut -d'|' -f4)
$cmd "$folder"