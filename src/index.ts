import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { get, Agent } from 'https';
import { createWriteStream, existsSync, mkdirSync } from 'fs';

const VERSION_URL = '';
const DLL_URL = '';

const PLUGINS_FOLDER = "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Gorilla Tag\\BepInEx\\plugins";

const agent = new Agent({ rejectUnauthorized: false });

let mainWindow: BrowserWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 250,
        resizable: false,
        frame: false,
        titleBarStyle: 'hidden',
        transparent: true,
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            devTools: false,
        },
    });

    mainWindow.loadFile(join(__dirname, '../public/index.html')).catch((err) => {
        console.error('❌ ERROR: Failed to load UI', err);
    });

    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
            event.preventDefault();
        }
    });
});

ipcMain.handle('fetch-version', async () => {
    return new Promise((resolve, reject) => {
        get(VERSION_URL, { agent }, (response) => {
            let data = '';
            response.on('data', (chunk) => (data += chunk));
            response.on('end', () => {
                console.log("Raw response data:", data);
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed.version) {
                        resolve(parsed.version);
                    } else {
                        reject('Invalid version data');
                    }
                } catch (error) {
                    console.error("Failed to parse version:", error);
                    reject('Failed to parse version');
                }
            });
        }).on('error', (err) => {
            console.error("Request error:", err);
            reject('Failed to fetch version');
        });
    });
});

ipcMain.handle('download-dll', async () => {
    return new Promise((resolve, reject) => {
        if (!existsSync(PLUGINS_FOLDER)) {
            mkdirSync(PLUGINS_FOLDER, { recursive: true });
        }

        const filePath = join(PLUGINS_FOLDER, '**.dll');

        get(DLL_URL, { agent }, (response) => {
            if (response.statusCode !== 200) {
                reject('Failed to download DLL');
                return;
            }

            const fileStream = createWriteStream(filePath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve(`✅ DLL saved to: ${filePath}`);
            });

            fileStream.on('error', (err) => {
                reject(`Failed to save DLL: ${err.message}`);
            });
        }).on('error', reject);
    });
});
