import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export function isZedInstalled(configPath) {
    try {
        const files = fs.readdirSync(configPath);
        return files.some(f => f.startsWith('0-') && f !== '0-global' && 
            fs.statSync(path.join(configPath, f)).isDirectory());
    } catch {
        return false;
    }
}

export function getZedWorkspaces(configPath) {
    if (!hasCommand('sqlite3')) return [];

    try {
        const dbFiles = fs.readdirSync(configPath)
            .filter(f => f.startsWith('0-') && f !== '0-global')
            .map(f => path.join(configPath, f, 'db.sqlite'))
            .filter(fs.existsSync);

        const workspaces = [];
        for (const dbPath of dbFiles) {
            const result = queryWorkspaces(dbPath);
            if (result) workspaces.push(...result);
        }
        return workspaces;
    } catch {
        return [];
    }
}

function hasCommand(cmd) {
    try {
        execSync(`command -v ${cmd}`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function queryWorkspaces(dbPath) {
    try {
        const query = "SELECT paths, timestamp FROM workspaces WHERE paths IS NOT NULL AND paths != '' ORDER BY timestamp DESC;";
        const result = execSync(`sqlite3 "${dbPath}" "${query}"`, { encoding: 'utf8' });
        if (!result.trim()) return null;

        return result.trim().split('\n')
            .map(parseWorkspace)
            .filter(Boolean);
    } catch {
        return null;
    }
}

function parseWorkspace(line) {
    const [pathsStr, mtime] = line.split('|');
    if (!pathsStr) return null;

    const folderPath = parsePath(pathsStr);
    if (!folderPath || !fs.existsSync(folderPath)) return null;

    const name = path.basename(folderPath);
    const timestamp = mtime ? new Date(mtime).toISOString() : new Date().toISOString();
    return `${name}|${folderPath}|${timestamp}|Zed|zeditor`;
}

function parsePath(pathsStr) {
    try {
        const parsed = JSON.parse(pathsStr);
        return Array.isArray(parsed) ? parsed[0] : parsed;
    } catch {
        return pathsStr;
    }
}
