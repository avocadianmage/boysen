import * as pty from 'node-pty';
import {Terminal } from 'xterm';
import { fit } from 'xterm/lib/addons/fit/fit';
import { remote } from 'electron';

main();

function main() {
    // Initialize node-pty with PowerShell.
    const ptyProcess = createPtyFork();

    // Initialize xterm.js and attach it to the DOM.
    const xterm = createTerminal(
        document.getElementById('terminal-container')!);
        
    hookCustomKeyEvents(xterm);

    // Size xterm and the forked shell appropriately, and ensure resizing later
    // will do the same.
    hookResize(xterm, ptyProcess);

    // Set up communication between xterm and node-pty.
    openCommunication(xterm, ptyProcess);

    // Broadcast that the console title has changed.
    xterm.on('title', title => {
        remote.getCurrentWindow().webContents.send(
            'terminal-title-changed', title);
    });

    // Broadcast that node-pty exited.
    ptyProcess.on('exit', () => {
        remote.getCurrentWindow().webContents.send('terminal-exited');
    });

    // Terminal now is ready for input, so focus it.
    xterm.textarea.focus();
}

// Build commandline arguments to pass in to the PowerShell process.
function getPowerShellArguments() {
    const path = "'" + __dirname + "/../powershell/startup.ps1'";
    return '-nologo -noexit -command ". ' + path + '"';
}

function createPtyFork()
{
    return pty.spawn('powershell.exe', getPowerShellArguments(), {
        name: 'xterm-color',
        cwd: process.cwd(),
        env: process.env as any
    });
}

function createTerminal(parentElement: HTMLElement)
{
    const terminal = new Terminal({
        fontFamily: 'Consolas',
        fontSize: 10,
        theme: { 
            cursor: 'orange', 
            foreground: 'lightgray', 
            background: '#1e1e1e' 
        }
    });
    terminal.open(parentElement);
    return terminal;
}

function hookCustomKeyEvents(terminal: Terminal)
{
    terminal.attachCustomKeyEventHandler(ev => {

        // If text is selcted, allow Ctrl+C for copy. Otherwise, it is used by 
        // the terminal to break execution.
        if (ev.ctrlKey && ev.key === 'c') return !terminal.hasSelection();
    
        // Shortcuts that should skip the terminal and be handled by the system.
        if (ev.altKey && ev.key === 'F4' && !ev.ctrlKey) return false;
        if (ev.ctrlKey && ev.key === 'v') return false;
        if (ev.ctrlKey && ev.key === 't') return false;
        if (ev.ctrlKey && ev.key === 'w') return false;
    
        return true;
    });
}

function resize(terminal: Terminal, ptyFork: pty.IPty) {
    // Resize xterm.
    fit(terminal);

    // Resize the forked shell based on the new size of xterm.
    const charElem = document.querySelector('.xterm-char-measure-element');
    const charRect = charElem!.getBoundingClientRect();

    const canvasElem = document.querySelector('.xterm .xterm-screen canvas');
    const canvasRect = canvasElem!.getBoundingClientRect();

    const cols = Math.floor(canvasRect.width / Math.floor(charRect.width));
    const rows = Math.floor(canvasRect.height / Math.floor(charRect.height));
    ptyFork.resize(cols, rows);
}

function hookResize(terminal: Terminal, ptyFork: pty.IPty)
{
    const resizeFunc = () => resize(terminal, ptyFork);
    window.onresize = resizeFunc;
    resizeFunc();
}

function openCommunication(terminal: Terminal, ptyFork: pty.IPty) {
    terminal.on('data', data => ptyFork.write(data));
    ptyFork.on('data', data => terminal.write(data));
}
