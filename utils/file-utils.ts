import * as fs from 'fs';
import * as path from 'path';

export function writeResultsToJson(filename: string, data: any): string {
    const resultsDir = path.join(process.cwd(), 'results');
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const fullFilename = `${filename}-${timestamp}.json`;
    const filePath = path.join(resultsDir, fullFilename);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return filePath;
}

export function clearResultsFolder() {
    const resultsDir = path.join(process.cwd(), 'results');

    // Check if directory exists before attempting to clear it
    if (fs.existsSync(resultsDir)) {
        // Read all files in the directory
        const files = fs.readdirSync(resultsDir);

        // Delete each file
        for (const file of files) {
            const filePath = path.join(resultsDir, file);

            // Check if it's a file (not a subdirectory)
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            }
        }

        console.log(`Cleared ${files.length} files from results folder`);
    }
}
