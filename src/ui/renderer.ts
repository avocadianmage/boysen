//import * as pty from 'node-pty';
import {Terminal, ITerminalOptions} from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import { remote } from 'electron';

var tinyWorker = require('tiny-worker'); //todo

function resize() {
    // Resize xterm.
    (xterm as any).fit();

    // Resize the forked shell based on the new size of xterm.
    const charElem = document.querySelector('.xterm-char-measure-element');
    const charRect = charElem!.getBoundingClientRect();

    const canvasElem = document.querySelector('.xterm .xterm-screen canvas');
    const canvasRect = canvasElem!.getBoundingClientRect();

    const cols = Math.floor(canvasRect.width / Math.floor(charRect.width));
    const rows = Math.floor(canvasRect.height / Math.floor(charRect.height));
    //ptyProcess.resize(cols, rows);
    worker.postMessage({ action: "resize", cols: cols, rows: rows });

}

const worker = new tinyWorker("ts-build/pty-process.js");

const scripts = document.getElementsByTagName('script');
const jsPath = decodeURI(scripts[scripts.length - 1].src);
worker.postMessage({ action: "init", jsPath: jsPath });

// // Build commandline arguments to pass in to the PowerShell process.
// function getPowerShellArguments() {
//     const scripts = document.getElementsByTagName('script');
//     var path = decodeURI(scripts[scripts.length - 1].src);
//     path = path.substring(8, path.lastIndexOf('/'));
//     path = "'" + path + "/../powershell/startup.ps1'";
//     return '-nologo -noexit -command ". ' + path + '"';
// }

// const ptyProcessOptions: pty.IPtyForkOptions = {
//     name: 'xterm-color',
//     cwd: process.cwd(),
//     env: process.env as any
// };

// // Initialize node-pty with PowerShell.
// const ptyProcess = pty.spawn(
//     'pwsh.exe',
//     getPowerShellArguments(),
//     ptyProcessOptions);

// // If node-pty exits, also close the application.
//ptyProcess.on('exit', remote.getCurrentWindow().close);

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

    // Allow Ctrl+V for paste.
    if (ev.ctrlKey && ev.key === 'v') return false;

    // Alt+F4 should skip the terminal and be handled by the system.
    if (ev.altKey && ev.key === 'F4' && !ev.ctrlKey) return false;

    return true;
});

// Size xterm and the forked shell appropriately, and ensure resizing later will
// do the same.
Terminal.applyAddon(fit);
window.onresize = resize;
resize();

// Set up communication between xterm and node-pty.
//xterm.on('data', data => ptyProcess.write(data));
xterm.on('data', data => worker.postMessage({ action: "receive", data: data }));
//ptyProcess.on('data', data => xterm.write(data));

worker.onmessage = (e: any) => { //todo
    switch (e.data.action)
    {
        case 'send':
            xterm.write(e.data.data);
            break;
        
        case 'close':
            remote.getCurrentWindow().close();
            break;
    }
};

xterm.focus();
