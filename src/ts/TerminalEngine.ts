import * as pty from 'node-pty';
import { Terminal } from 'xterm';
import { fit } from 'xterm/lib/addons/fit/fit';
import * as path from 'path';

export class TerminalEngine {
    private readonly _ptyFork = this.createPtyFork();
    private readonly _xterm = this.createTerminal();

    constructor() {
        this.hookCustomKeyEvents();

        // Size xterm and the forked shell appropriately, and ensure resizing
        // later will do the same.
        this.hookResize();

        // Set up communication between xterm and node-pty.
        this.openCommunication();

        // Broadcast that the console title has changed.
        this._xterm.on('title', title => document.title = title!);

        // Broadcast that node-pty exited.
        this._ptyFork.on('exit', () => window.close());

        // Terminal now is ready for input, so focus it.
        this._xterm.focus();
    }

    private createPtyFork()
    {
        return pty.spawn('powershell.exe', this.getPowerShellArguments(), {
            name: 'xterm-color',
            cwd: process.cwd(),
            env: process.env as any
        });
    }

    // Build commandline arguments to pass in to the PowerShell process.
    private getPowerShellArguments() {
        const startupCommand 
            = "Set-ExecutionPolicy Bypass -Scope Process -Force;"
            + `. '${path.join(process.cwd(), "powershell/startup-main.ps1")}';`
            + "Set-ExecutionPolicy Undefined -Scope Process -Force";
        return '-nologo -noexit -command "' + startupCommand + '"';
    }

    private createTerminal()
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
        terminal.open(this.getTerminalParentElement());
        return terminal;
    }

    private getTerminalParentElement() {
        return document.getElementById('terminal-container')!;
    }

    private hookCustomKeyEvents()
    {
        this._xterm.attachCustomKeyEventHandler(ev => {

            // If text is selcted, allow Ctrl+C for copy. Otherwise, it is used
            // by the terminal to break execution.
            if (ev.ctrlKey && ev.key === 'c') {
                return !this._xterm.hasSelection();
            }
        
            // Shortcuts that should skip the terminal and be handled by the system.
            if (ev.altKey && ev.key === 'F4' && !ev.ctrlKey) return false;
            if (ev.ctrlKey && ev.key === 'v') return false;
            if (ev.ctrlKey && ev.key === 't') return false;
            if (ev.ctrlKey && ev.key === 'w') return false;
        
            return true;
        });
    }

    private hookResize()
    {
        window.onresize = () => this.resize();
        this.resize();
    }

    private resize() {
        // Resize xterm.
        fit(this._xterm);
    
        // Resize the forked shell based on the new size of xterm.
        const charEl = document.querySelector('.xterm-char-measure-element');
        const charRect = charEl!.getBoundingClientRect();
    
        const canvasEl = document.querySelector('.xterm .xterm-screen canvas');
        const canvasRect = canvasEl!.getBoundingClientRect();
    
        const cols = Math.floor(
            canvasRect.width / Math.floor(charRect.width)
        );
        const rows = Math.floor(
            canvasRect.height / Math.floor(charRect.height)
        );
        this._ptyFork.resize(cols, rows);
    }

    private openCommunication() {
        this._xterm.on('data', data => this._ptyFork.write(data));
        this._ptyFork.on('data', data => this._xterm.write(data));
    }
}
