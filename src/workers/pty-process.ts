import * as pty from 'node-pty';

let ptyProcess: pty.IPty;

onmessage = (e) => {
    switch (e.data.action) {

        case 'init':
            init(e.data.jsPath);
            break;

        case 'receive':
            ptyProcess.write(e.data.data);
            break;

        case 'resize':
            ptyProcess.resize(e.data.cols, e.data.rows)
            break;
    }
};

// Build commandline arguments to pass in to the PowerShell process.
function getPowerShellArguments(jsPath: string) {
    var psPath = jsPath.substring(8, jsPath.lastIndexOf('/'));
    psPath = "'" + psPath + "/../powershell/startup.ps1'";
    return '-nologo -noexit -command ". ' + psPath + '"';
}

function init(jsPath: string) {
    const ptyProcessOptions: pty.IPtyForkOptions = {
        name: 'xterm-color',
        cwd: process.cwd(),
        env: process.env as any
    };
    
    // Initialize node-pty with PowerShell.
    ptyProcess = pty.spawn(
        'pwsh.exe',
        getPowerShellArguments(jsPath),
        ptyProcessOptions);
    
    // If node-pty exits, also close the application.
    ptyProcess.on('exit', () => postMessage({ action: 'close' }));

    // Communicate to xterm.
    ptyProcess.on('data', data => postMessage({ action: 'send', data: data }));
}
