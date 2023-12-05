const { app, Menu, Tray, shell } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

const { menubar } = require('menubar');

const iconPath = path.join(__dirname, 'assets', 'IconEnergyTemplate.png');

app.on('ready', () => {
    const tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open Visual Studio Code', click: openVSCodeNewWindow },
        { label: 'Open Firefox', click: () => exec('open -n -a "Firefox"') },
        { label: 'Open Home Directory', click: openFinderAtHome },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' }
    ]);
    tray.setContextMenu(contextMenu);

    const mb = menubar({
        tray,
    });

    mb.on('ready', () => {
        console.log('Menubar app is ready.');
        // your app code here
        tray.removeAllListeners();
    });
});

function openFinderAtHome() {
  const homeDir = os.homedir();
  const script = `osascript -e 'tell application "Finder" to make new Finder window to POSIX file "${homeDir}"'`;
  exec(script, (err) => {
      if (err) {
          console.error('Error opening new Finder window:', err);
      }
  });
}

function openVSCodeNewWindow() {
    const script = `osascript -e 'tell application "Visual Studio Code" to activate' -e 'tell application "System Events" to keystroke "n" using {shift down, command down}'`;
    exec(script, (err) => {
        if (err) {
            console.error('Error opening new VS Code window:', err);
        }
    });
}
