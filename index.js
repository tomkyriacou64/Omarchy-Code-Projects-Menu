import fs from 'fs';
import { stdout } from 'process';
import { execSync } from 'child_process';
import { getCodiumWorkspaces } from './editors/codium.js';
import { isZedInstalled, getZedWorkspaces } from './editors/zed.js';

const editors = [
    {
        name: 'Cursor',
        configPath: `${process.env.HOME}/.config/Cursor/User/workspaceStorage/`,
        command: 'cursor',
        isInstalled: (path) => fs.existsSync(path),
        getWorkspaces: (name, path, cmd) => getCodiumWorkspaces(name, path, cmd)
    },
    {
        name: 'VS Code',
        configPath: `${process.env.HOME}/.config/Code/User/workspaceStorage/`,
        command: 'code',
        isInstalled: (path) => fs.existsSync(path),
        getWorkspaces: (name, path, cmd) => getCodiumWorkspaces(name, path, cmd)
    },
    {
        name: 'VS Code OSS',
        configPath: `${process.env.HOME}/.config/Code - OSS/User/workspaceStorage/`,
        command: 'code',
        isInstalled: (path) => fs.existsSync(path),
        getWorkspaces: (name, path, cmd) => getCodiumWorkspaces(name, path, cmd)
    },
    {
        name: 'VSCodium',
        configPath: `${process.env.HOME}/.config/VSCodium/User/workspaceStorage/`,
        command: 'codium',
        isInstalled: (path) => fs.existsSync(path),
        getWorkspaces: (name, path, cmd) => getCodiumWorkspaces(name, path, cmd)
    },
    {
        name: 'Zed',
        configPath: `${process.env.HOME}/.local/share/zed/db`,
        command: 'zeditor',
        isInstalled: (path) => isZedInstalled(path),
        getWorkspaces: (name, path, cmd) => getZedWorkspaces(path)
    }
];

const mode = process.argv[2];
const editorFilter = mode === 'list' ? process.argv[3]?.toLowerCase() : mode?.toLowerCase();

function hasCommand(cmd) {
    try {
        execSync(`command -v ${cmd}`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function getInstalledEditors() {
    return editors.filter(editor => {
        if (!hasCommand(editor.command)) return false;
        return editor.isInstalled(editor.configPath);
    });
}

function getWorkspaces(editor) {
    return editor.getWorkspaces(editor.name, editor.configPath, editor.command);
}

if (mode === 'tabs') {
    const installed = getInstalledEditors();
    const editorWorkspaces = installed.map(editor => ({
        name: editor.name,
        workspaces: getWorkspaces(editor)
    }));
    
    const allCount = editorWorkspaces.reduce((sum, { workspaces }) => sum + workspaces.length, 0);
    const available = editorWorkspaces.map(({ name, workspaces }) => 
        `${name} (${workspaces.length})|${name}`
    );

    stdout.write(`All (${allCount})|all\n${available.join('\n')}`);
    process.exit(0);
}

const installed = getInstalledEditors();
const workspaces = installed
    .filter(e => {
        if (!editorFilter || editorFilter === 'all') return true;
        const f = editorFilter.toLowerCase();
        return e.name.toLowerCase().includes(f) || e.command.toLowerCase().includes(f);
    })
    .flatMap(getWorkspaces)
    .sort((a, b) => {
        const [, , aTime] = a.split('|');
        const [, , bTime] = b.split('|');
        return new Date(bTime) - new Date(aTime);
    })
    .map(line => {
        const [name, folder, , editor, cmd] = line.split('|');
        const showEditor = editorFilter === 'all' ? ` (${editor})` : '';
        return `${name}${showEditor}|${folder}|${editor}|${cmd}`;
    });

stdout.write(workspaces.join('\n'));

