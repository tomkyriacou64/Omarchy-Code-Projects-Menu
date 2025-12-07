# Cursor Projects Menu

A lightweight launcher to quickly open recent Cursor IDE projects using a dmenu-style menu.

## Features

- Lists all your Cursor workspaces sorted by **most recently used**
- Fuzzy search through project names
- One-click launch into Cursor

## Requirements

- [Node.js](https://nodejs.org/)
- [Walker](https://github.com/abenz1267/walker) (or any dmenu-compatible launcher)
- [Cursor](https://cursor.sh/)

## Installation

To install the script run:

```bash
git clone https://github.com/Airbus6804/Omarchy-Cursor-Projects-Menu.git 
cd ./cursor-projects-menu
npm i
chmod +x ./cursor-projects-menu.sh
```

Move it to the config folder

```
mkdir ~/.config/hypr/scripts
mv cursor-projects-menu ~/.config/hypr/scripts
```
Add the bind in your config

```
bindd = SUPER SHIFT, C, Cursor History, exec, ~/.config/hypr/scripts/latest-cursor-projects-menu.sh/cursor-projects-menu.sh
```

## How It Works

1. `index.js` reads Cursor's workspace storage at `~/.config/Cursor/User/workspaceStorage/`
2. Extracts project paths and sorts them by modification time (newest first)
3. `cursor-projects-menu.sh` pipes the list to Walker for selection
4. Opens the selected project in Cursor
