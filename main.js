const { app, Menu, Tray, shell, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');
const { menubar } = require('menubar');
const Store = require('electron-store');

// Initialize electron-store
const store = new Store();

const iconPath = path.join(__dirname, 'assets', 'IconEnergyTemplate.png');

app.on('ready', () => {
    const tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Browser',
            submenu: [
                { label: 'Firefox', accelerator: 'Command+F', click: () => exec('open -n -a "Firefox"') },
                { label: 'Librewolf', accelerator: 'Command+L', click: () => exec('open -n -a "Librewolf"') },
                { label: 'Brave Browser', accelerator: 'Command+B', click: () => exec('open -n -a "Brave Browser"') },
                { label: 'Google Chrome', accelerator: 'Command+G', click: () => exec('open -n -a "Google Chrome"') },
                { label: 'Microsoft Edge', accelerator: 'Command+M', click: () => exec('open -n -a "Microsoft Edge"') }
            ]
        },
        { label: 'Open Visual Studio Code', accelerator: 'Command+V', click: openVSCodeNewWindow },
        { label: 'Open Home Directory', accelerator: 'Command+H', click: openFinderAtHome },
        { type: 'separator' },
        { label: 'GitHub', accelerator: 'Command+,?', click: () => shell.openExternal('https://github.com/sebfried/menubarmaid') },
        { label: 'Settings...', accelerator: 'Command+,', click: openSettingsWindow },
        { type: 'separator' },
        {
            label: '⏻ Quit Menu Barmaid',
            accelerator: 'Command+Q',
            role: 'quit'
        }
    ]);
    tray.setContextMenu(contextMenu);

    const mb = menubar({
        tray,
    });

    mb.on('ready', () => {
        console.log('Menubar app is ready.');
        tray.removeAllListeners();
    });
});

let settingsWindow = null;

function openSettingsWindow() {
    if (!settingsWindow) {
        const savedBounds = store.get('settingsWindowBounds', {
            width: 670,
            height: 670,
            x: undefined,
            y: undefined
        });

        settingsWindow = new BrowserWindow({
            ...savedBounds,
            minWidth: 570,
            minHeight: 570,
            maxWidth: 770,
            maxHeight: 770,
            frame: false,
            titleBarStyle: 'hidden',
            show: false,
            fullscreenable: false,
            resizable: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
            },
        });

        settingsWindow.loadFile('views/settings.html');
        settingsWindow.once('ready-to-show', () => {
            setTimeout(() => {
                settingsWindow.show();
            }, 240);
        });

        settingsWindow.on('close', () => {
            // Save the current window position before the window is closed
            if (!settingsWindow.isDestroyed()) {
                store.set('settingsWindowBounds', settingsWindow.getBounds());
            }
        });

        settingsWindow.on('closed', () => {
            // Reset the settingsWindow reference when it's closed
            settingsWindow = null;
        });
    } else {
        // Re-show the existing settings window if it already exists
        if (!settingsWindow.isDestroyed()) {
            settingsWindow.show();
        }
    }
}

// Handle the 'window-all-closed' event to prevent the app from quitting when a window is closed
app.on('window-all-closed', () => {
    console.log('All windows were closed.');
});

function openVSCodeNewWindow() {
    const script = `osascript -e 'tell application "Visual Studio Code" to activate' -e 'tell application "System Events" to keystroke "n" using {shift down, command down}'`;
    exec(script, (err) => {
        if (err) {
            console.error('Error opening new VS Code window:', err);
        }
    });
}

function openFinderAtHome() {
    const homeDir = os.homedir();
    const script = `osascript -e 'tell application "Finder" to make new Finder window to POSIX file "${homeDir}"'`;
    exec(script, (err) => {
        if (err) {
            console.error('Error opening new Finder window:', err);
        }
    });
}
