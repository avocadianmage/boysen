import * as pty from 'node-pty';
import {Terminal, ITerminalOptions} from 'xterm';
import { fit } from 'xterm/lib/addons/fit/fit';
import { remote } from 'electron';

function resize() {
    // Resize xterm.
    fit(xterm);

    // Resize the forked shell based on the new size of xterm.
    const charElem = document.querySelector('.xterm-char-measure-element');
    const charRect = charElem!.getBoundingClientRect();

    const canvasElem = document.querySelector('.xterm .xterm-screen canvas');
    const canvasRect = canvasElem!.getBoundingClientRect();

    const cols = Math.floor(canvasRect.width / Math.floor(charRect.width));
    const rows = Math.floor(canvasRect.height / Math.floor(charRect.height));
    ptyProcess.resize(cols, rows);
}

// Build commandline arguments to pass in to the PowerShell process.
function getPowerShellArguments() {
    var path = decodeURI(document.baseURI!);
    path = path.substring(8, path.lastIndexOf('/'));
    path = "'" + path + "/powershell/startup.ps1'";
    return '-nologo -noexit -command ". ' + path + '"';
}

const ptyProcessOptions: pty.IPtyForkOptions = {
    name: 'xterm-color',
    cwd: process.cwd(),
    env: process.env as any
};

// Initialize node-pty with PowerShell.
const ptyProcess = pty.spawn(
    'powershell.exe',
    getPowerShellArguments(),
    ptyProcessOptions);

const terminalOptions: ITerminalOptions = {
    fontFamily: 'Consolas',
    fontSize: 10,
    cursorBlink: true,
    theme: { cursor: 'orange', foreground: 'lightgray' }
};

// Initialize xterm.js and attach it to the DOM.
const xterm = new Terminal(terminalOptions);
xterm.open(document.getElementById('terminal-container')!);

// Declare custom keystroke handling.
xterm.attachCustomKeyEventHandler(ev => {

    // If text is selcted, allow Ctrl+C for copy. Otherwise, it is used by the
    // terminal to break execution.
    if (ev.ctrlKey && ev.key === 'c') return !xterm.hasSelection();

    // Shortcuts that should skip the terminal and be handled by the system.
    if (ev.altKey && ev.key === 'F4' && !ev.ctrlKey) return false;
    if (ev.ctrlKey && ev.key === 'v') return false;
    if (ev.ctrlKey && ev.key === 't') return false;
    if (ev.ctrlKey && ev.key === 'w') return false;

    return true;
});

// Size xterm and the forked shell appropriately, and ensure resizing later will
// do the same.
window.onresize = resize;
resize();

// Set up communication between xterm and node-pty.
xterm.on('data', data => ptyProcess.write(data));
ptyProcess.on('data', data => xterm.write(data));

// Broadcast that the console title has changed.
xterm.on('title', title => {
    remote.getCurrentWindow().webContents.send('terminal-title-changed', title);
});

// Broadcast that node-pty exited.
ptyProcess.on('exit', () => {
    remote.getCurrentWindow().webContents.send('terminal-exited');
});

xterm.textarea.focus();
