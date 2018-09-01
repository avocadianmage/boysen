import * as TabGroup from 'electron-tabs';
import * as dragula from 'dragula';
import { ipcRenderer, remote } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import * as fii from 'file-icon-info';

class TabManager {
    private readonly _tabGroup = new TabGroup({
        ready: (tabGroup) => {
            this.hookFocusEvents(tabGroup);
            this.hookDragging(tabGroup);
            this.hookCustomKeyEvents(tabGroup);

            // Create tab for initial terminal instance.
            window.onload = () => this.newTab(tabGroup);
        }
    });

    constructor() {
        // Update tab title based on the current working directory of the 
        // terminal.
        ipcRenderer.on(
            'terminal-title-changed', (_: Event, title: string) => {
                this._tabGroup.getActiveTab()!.setTitle(title);
            }
        );

        // Close the tab if the terminal has exited.
        ipcRenderer.on('terminal-exited', () => {
            this._tabGroup.getActiveTab()!.close();
        });
    }

    // Ensure the terminal in the active tab ends up with focus. We blur first 
    // in case the web view is already getting focused (i.e. user clicks in the 
    // terminal area).
    private focusTerminal() {
        const webview = this._tabGroup.getActiveTab()!.webview;
        webview.blur();
        webview.focus();
    }
    
    private hookDragging(tabGroup: TabGroup) {
        const drake = dragula([ tabGroup.tabContainer ], { 
            direction: "horizontal" 
        });
        drake.on('dragend', () => this.focusTerminal());
    }

    private hookFocusEvents(tabGroup: TabGroup) {
        // Focus terminal of active tab when window receives focus.
        remote.getCurrentWindow().on('focus', () => this.focusTerminal());
    
        // Refocus terminal of active tab if user clicks on the tab container.
        tabGroup.tabContainer.addEventListener('mouseup', () => {
            this.focusTerminal();
        });
    }
    
    // Bind keyboard events for tab manipulation.
    private hookCustomKeyEvents(tabGroup: TabGroup)
    {
        window.addEventListener('keydown', (ev) => {
    
            // Ctrl+T: add new tab.
            if (ev.ctrlKey && ev.key === 't') this.newTab(tabGroup);
    
            // Ctrl+W: close active tab.
            else if (ev.ctrlKey && ev.key === 'w') {
                // Stop default which closes the entire browser.
                ev.preventDefault(); 
                tabGroup.getActiveTab()!.close();
            }
    
            // Ctrl+Tab, Ctrl+Shift+Tab: cycle through tabs.
            else if (ev.ctrlKey && ev.key === 'Tab')
            {
                const tab = this.getAdjacentTab(ev.shiftKey);
                if (tab) tab.activate();
            }
        });
    }

    private newTab(tabGroup: TabGroup)
    {
        const tab = tabGroup.addTab({ 
            title: 'Initializing…',
            src: 'terminal.html',
            active: true,
            webviewAttributes: {
                nodeintegration: true
            }
        });

        this.setTabIconFromShell(tab, "powershell");
        
        // When tab if closed, if it was the last one, close the window.
        tab.on('close', () => {
            if (tabGroup.getTabs().length > 0) return;
            remote.getCurrentWindow().close();
        });

        // Ensure the webview contents of the active tab are properly focused when 
        // the tab is clicked. Note that we can't simply hook into the 'active' 
        // event of the tab due to it firing during mousedown. If we try to focus 
        // the webview at that point, the tab will end up stealing focus since it 
        // goes through its focus event after mousedown.
        const htmlTabCollection = tabGroup.tabContainer.children;
        const htmlTab = htmlTabCollection[htmlTabCollection.length - 1];
        htmlTab.addEventListener('mouseup', () => this.focusTerminal());
    }

    private getAdjacentTab(toTheLeft: boolean)
    {
        // Quit if there is only a single tab.
        const tabCount = this._tabGroup.getTabs().length;
        if (tabCount === 1) return null;
        
        // Find adjacent tab.
        let nextTab = this._tabGroup.getTabByRelPosition(toTheLeft ? -1 : 1);
        
        // Reset back to the beginning/end if one isn't found.
        if (!nextTab) {
            nextTab = this._tabGroup.getTabByPosition(toTheLeft ? tabCount : 1);
        }

        return nextTab;
    }

    private setTabIconFromShell(tab: TabGroup.Tab, exeName: string) {
        const appDataPath = process.env.APPDATA;
        const appName = require(__dirname + '/../package.json').name;
        const iconPath 
            = `${appDataPath}/${appName}/Cache/shell-icons/${exeName}.ico`;

        // If icon file is already cached, use it.
        if (fs.existsSync(iconPath)) tab.setIcon(iconPath);

        // Find the full file path of the shell executable and extract its icon.
        else exec('where ' + exeName, (err, stdout, stderr) => {
            if (err) console.log(stderr);
            else fii.getIcon(stdout.trim(), data => {
                // When an icon has been extracted, save it to file and then use
                // it.
                this.createNeededDirectories(iconPath);
                fs.writeFile(iconPath, data, 'base64', err => {
                    if (err) console.log(err);
                    else tab.setIcon(iconPath);
                });
            });
        });
    }

    // Create any needed directories to ensure the specified file path can
    // exist.
    private createNeededDirectories(filePath: string) {
        const dirname = path.dirname(filePath);
        if (fs.existsSync(dirname)) return;
        this.createNeededDirectories(dirname);
        fs.mkdirSync(dirname);
    }
}

new TabManager();
