import fs from 'fs';
import { stdout } from 'process';

const workspacesPath = `${process.env.HOME}/.config/Cursor/User/workspaceStorage/`;

const folders = fs.readdirSync(workspacesPath);

const lines = folders
    .map(workspace => {
        const folderPath = `${workspacesPath}${workspace}/workspace.json`;

        try {
            const { folder: folderProtocol } = JSON.parse(fs.readFileSync(folderPath, 'utf8'));
            
            if (!folderProtocol) return null;

            const folder = folderProtocol.replace('file://', '');
            const name = folder.split('/').at(-1);

            return `${name}|${folder}|${new Date(fs.statSync(`${workspacesPath}${workspace}`).mtime).toISOString()}`;
        } catch {
            return null;
        }
    })
    .sort((a, b) => {
        const aDate = new Date(a.split('|')[2]);
        const bDate = new Date(b.split('|')[2]);
        return bDate.getTime() - aDate.getTime();
    })
    .map(line => line.split('|').filter((_,index) => index < 2).join('|'))
    .filter(Boolean);

stdout.write(lines.join('\n'));

