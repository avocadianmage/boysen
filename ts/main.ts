import * as electron from 'electron';
import * as path from 'path';
import * as url from 'url';

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 700, height: 500,
        minWidth: 400, minHeight: 100,
        autoHideMenuBar: true,
        icon: 'assets/favicon.ico'
    });

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../index.html'),
        protocol: 'file:',
        slashes: true
    }));
    
    // Dereference the window object, usually you would store windows in an
    // array if your app supports multi windows, this is the time when you
    // should delete the corresponding element.
    mainWindow.on('closed', () => mainWindow = null);
}

// This method will be called when Electron has finished initialization and is
// ready to create browser windows. Some APIs can only be used after this event 
// occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', app.quit);
