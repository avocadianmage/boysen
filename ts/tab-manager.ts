import * as TabGroup from 'electron-tabs';
import { ipcRenderer, remote } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

main();

function main() {
    const tabGroup = new TabGroup();

    // Update tab title based on the current working directory of the terminal.
    ipcRenderer.on('terminal-title-changed', (event: Event, title: string) => {
        tabGroup.getActiveTab()!.setTitle(truncateTitle(title));
    });

    // Close the tab if the terminal has exited.
    ipcRenderer.on('terminal-exited', () => tabGroup.getActiveTab()!.close());

    // Bind keyboard events for tab manipulation.
    hookCustomKeyEvents(tabGroup);

    // Ensure the terminal in the active tab ends up with focus if the window is 
    // re-focused. We blur first in case the web view is already getting focused
    // (i.e. user clicks in the terminal area).
    remote.getCurrentWindow().on('focus', () => {
        tabGroup.getActiveTab()!.webview.blur();
        tabGroup.getActiveTab()!.webview.focus();
    });

    // Create tab for initial terminal instance.
    window.onload = () => newTab(tabGroup);
}

function hookCustomKeyEvents(tabGroup: TabGroup)
{
    window.addEventListener('keydown', (ev) => {

        // Ctrl+T: add new tab.
        if (ev.ctrlKey && ev.key === 't') newTab(tabGroup);

        // Ctrl+W: close active tab.
        else if (ev.ctrlKey && ev.key === 'w') {
            // Stop default which closes the entire browser.
            ev.preventDefault(); 
            tabGroup.getActiveTab()!.close();
        }

        // Ctrl+Tab, Ctrl+Shift+Tab: cycle through tabs.
        else if (ev.ctrlKey && ev.key === 'Tab')
        {
            const tab = getAdjacentTab(tabGroup, ev.shiftKey);
            if (tab) tab.activate();
        }
    });
}

function newTab(tabGroup: TabGroup)
{
    const tab = tabGroup.addTab({ 
        title: 'Initializing…',
        src: 'terminal.html',
        active: true,
        webviewAttributes: {
            nodeintegration: true
        }
    });

    setTabIconFromShell(tab, "powershell");
    
    // When tab if closed, if it was the last one, close the window.
    tab.on('close', () => {
        if (tabGroup.getTabs().length > 0) return;
        remote.getCurrentWindow().close();
    });

    // Ensure the webview contents of the active tab are properly focused
    // when the tab is clicked. Note that we can't simply hook into the 'active'
    // event of the tab due to it firing during mousedown. If we try to focus 
    // the webview at that point, the tab will end up stealing focus since it 
    // goes through its focus event after mousedown.
    const htmlTabs = tabGroup.tabContainer.children;
    htmlTabs[htmlTabs.length - 1].addEventListener(
        'mouseup', () => tab.webview.focus()
    );
}

function getAdjacentTab(tabGroup: TabGroup, toTheLeft: boolean)
{
    // Quit if there is only a single tab.
    const tabCount = tabGroup.getTabs().length;
    if (tabCount === 1) return null;
    
    // Find adjacent tab.
    let nextTab = tabGroup.getTabByRelPosition(toTheLeft ? -1 : 1);
    
    // Reset back to the beginning/end if one isn't found.
    if (!nextTab) nextTab = tabGroup.getTabByPosition(toTheLeft ? tabCount : 1);

    return nextTab;
}

// Right-truncate title text if it exceeds a max limit.
function truncateTitle(title: string) {
    const maxLength = 32;
    if (title.length > maxLength) {
        title = "…" + title.substring(title.length - maxLength + 1);
    }
    return title;
}

function setTabIconFromShell(tab: TabGroup.Tab, exeName: string) {
    const appDataPath = process.env.APPDATA;
    const appName = require(__dirname + '/../package.json').name;
    const iconPath 
        = `${appDataPath}/${appName}/Cache/shell-icons/${exeName}.ico`;

    // If icon file is already cached, use it.
    if (fs.existsSync(iconPath)) 
    {
        tab.setIcon(iconPath);
        return;
    }

    // When an icon has been extracted, save it to file and then use it.
    const iconExtractor = require('icon-extractor');
    iconExtractor.emitter.on('icon', (data: any) => {
        createNeededDirectories(iconPath);
        fs.writeFile(iconPath, data.Base64ImageData, 'base64', err => {
            if (err) console.log(err);
            else tab.setIcon(iconPath);
        });
    });

    // Find the full file path of the shell executable and extract its icon.
    exec('where ' + exeName, (err, stdout, stderr) => {
        if (err) console.log(stderr);
        else iconExtractor.getIcon(null, stdout.trim());
    });
}

// Create any needed directories to ensure the specified file path can exist.
function createNeededDirectories(filePath: string) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) return;
    createNeededDirectories(dirname);
    fs.mkdirSync(dirname);
}
