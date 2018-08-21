const pty = require('node-pty');
const Terminal = require('xterm').Terminal;
const fit = require('xterm/lib/addons/fit/fit');
const remote = require('electron').remote;

function resize() {
    // Resize xterm.
    xterm.fit();

    // Resize the forked shell based on the new size of xterm.
    const charElem = document.querySelector('.xterm-char-measure-element');
    const charRect = charElem.getBoundingClientRect();

    const canvasElem = document.querySelector('.xterm .xterm-screen canvas');
    const canvasRect = canvasElem.getBoundingClientRect();

    const cols = Math.floor(canvasRect.width / Math.floor(charRect.width));
    const rows = Math.floor(canvasRect.height / Math.floor(charRect.height));
    ptyProcess.resize(cols, rows);
}

// Build commandline arguments to pass in to the PowerShell process.
function getPowerShellArguments() {
    const scripts = document.getElementsByTagName('script');
    var path = decodeURI(scripts[scripts.length - 1].src);
    path = path.substring(8, path.lastIndexOf('/'));
    path = "'" + path + "/../powershell/startup.ps1'";
    return '-nologo -noexit -command ". ' + path + '"';
}

const ptyProcessOptions = {
    name: 'xterm-color',
    cwd: process.cwd(),
    env: process.env
};

// Initialize node-pty with PowerShell.
const ptyProcess = pty.spawn(
    'pwsh.exe',
    getPowerShellArguments(),
    ptyProcessOptions);

// If node-pty exits, also close the application.
ptyProcess.on('exit', remote.getCurrentWindow().close);

const terminalOptions = {
    fontFamily: 'Consolas',
    fontSize: 10,
    cursorBlink: true,
    theme: { cursor: 'orange', foreground: 'lightgray' }
};

// Initialize xterm.js and attach it to the DOM.
const xterm = new Terminal(terminalOptions);
xterm.open(document.getElementById('terminal-container'));

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
xterm.on('data', data => ptyProcess.write(data));
ptyProcess.on('data', data => xterm.write(data));

xterm.focus();
