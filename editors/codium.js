import fs from 'fs';
import path from 'path';

export function getCodiumWorkspaces(name, configPath, command) {
    try {
        return fs.readdirSync(configPath)
            .map(workspace => {
                const jsonPath = path.join(configPath, workspace, 'workspace.json');
                if (!fs.existsSync(jsonPath)) return null;

                try {
                    const { folder } = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                    if (!folder) return null;

                    const folderPath = folder.replace('file://', '');
                    const projectName = path.basename(folderPath);
                    const mtime = new Date(fs.statSync(path.join(configPath, workspace)).mtime).toISOString();

                    return `${projectName}|${folderPath}|${mtime}|${name}|${command}`;
                } catch {
                    return null;
                }
            })
            .filter(Boolean);
    } catch {
        return [];
    }
}

