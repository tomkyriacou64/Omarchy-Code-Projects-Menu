#!/bin/bash

SCRIPT_DIR="$(dirname "$(realpath "$0")")"

# Salva l'output completo (nome|path)
projects=$(node "$SCRIPT_DIR/index.js")

# Mostra solo i nomi a Walker
selected=$(echo "$projects" | cut -d'|' -f1 | walker --dmenu -p "Cursor Projects…")

if [[ -n "$selected" ]]; then
    # Trova il path corrispondente al nome selezionato
    folder=$(echo "$projects" | grep "^${selected}|" | cut -d'|' -f2)
    cursor "$folder"
fi

