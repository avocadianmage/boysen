import * as TabGroup from 'electron-tabs';
import * as dragula from 'dragula';
import { remote } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import * as fii from 'file-icon-info';

export class TabManager {
    private readonly _tabGroup = new TabGroup({
        newTab: { 
            title: 'Initializing…',
            src: 'terminal.html',
            active: true,
            webviewAttributes: {
                nodeintegration: true
            },
            ready: (tab) => this.hookSingleTabEvents(tab)
        }
    });

    private _newTabButtonWidth: number = 0;
    private get newTabButtonWidth() {
        if (!this._newTabButtonWidth) {
            this._newTabButtonWidth 
                = document.querySelector('.etabs-tab-button-new')!.clientWidth;
        }
        return this._newTabButtonWidth;
    }

    constructor() {
        this.hookFocusEvents();
        this.hookDragging();
        this.hookCustomKeyEvents();
        this.hookTabAddRemoveEvents();

        // Create tab for initial terminal instance.
        window.onload = () => this._tabGroup.addTab();
    }

    private hookSingleTabEvents(tab: TabGroup.Tab) {
        this.setTabIconFromShell(tab, "powershell");
        
        // Retrieve HTML element for the tab.
        const htmlTabCollection = this._tabGroup.tabContainer.children;
        const htmlTab = htmlTabCollection[htmlTabCollection.length - 1];
        
        // When tab if closed, if it was the last one, close the window.
        tab.on('close', () => {
            if (this._tabGroup.getTabs().length > 0) return;
            remote.getCurrentWindow().close();
        });
        
        // Update tab title based on the current working directory of the 
        // terminal.
        tab.webview.addEventListener('page-title-updated', ev => {
            tab.setTitle(ev.title);
            htmlTab.setAttribute('title', ev.title);
        });

        // Close the tab if the terminal has exited.
        tab.webview.addEventListener('close', () => {
            this._tabGroup.getActiveTab()!.close();
        });

        // Ensure the webview contents of the active tab are properly focused
        // when the tab is clicked. Note that we can't simply hook into the
        // 'active' event of the tab due to it firing during mousedown. If we
        // try to focus the webview at that point, the tab will end up stealing
        // focus since it goes through its focus event after mousedown.
        htmlTab.addEventListener('mouseup', () => this.focusTerminal());
    }

    // Ensure the terminal in the active tab ends up with focus. We blur first 
    // in case the web view is already getting focused (i.e. user clicks in the 
    // terminal area).
    private focusTerminal() {
        const webview = this._tabGroup.getActiveTab()!.webview;
        webview.blur();
        webview.focus();
    }
    
    private hookDragging() {
        const drake = dragula([ this._tabGroup.tabContainer ], { 
            direction: "horizontal" 
        });
        drake.on('dragend', () => this.focusTerminal());
    }

    private hookFocusEvents() {
        // Focus terminal of active tab when window receives focus.
        remote.getCurrentWindow().on('focus', () => this.focusTerminal());
    
        // Refocus terminal of active tab if user clicks on the tab container.
        this._tabGroup.tabContainer.addEventListener('mouseup', () => {
            this.focusTerminal();
        });
    }
    
    // Bind keyboard events for tab manipulation.
    private hookCustomKeyEvents() {
        window.addEventListener('keydown', (ev) => {
    
            // Ctrl+T: add new tab.
            if (ev.ctrlKey && ev.key === 't') this._tabGroup.addTab();
    
            // Ctrl+W: close active tab.
            else if (ev.ctrlKey && ev.key === 'w') {
                // Stop default which closes the entire browser.
                ev.preventDefault(); 
                this._tabGroup.getActiveTab()!.close();
            }
    
            // Ctrl+Tab, Ctrl+Shift+Tab: cycle through tabs.
            else if (ev.ctrlKey && ev.key === 'Tab')
            {
                const tab = this.getAdjacentTab(ev.shiftKey);
                if (tab) tab.activate();
            }
        });
    }

    // Resize the widths of all tabs.
    private resizeTabs() {
        const htmlTabCollection = this._tabGroup.tabContainer.children;
        const tabCount = htmlTabCollection.length;
        const tabWidth = (window.innerWidth - this.newTabButtonWidth) 
            / tabCount;
        const tabWidthCSS = `${tabWidth}px`;
        for (var i = 0; i < tabCount; i++) {
            (htmlTabCollection[i] as HTMLElement).style.width = tabWidthCSS;
        }
    }

    private hookTabAddRemoveEvents() {
        this._tabGroup.on('tab-added', () => this.resizeTabs());
        this._tabGroup.on('tab-removed', () => this.resizeTabs());
        window.onresize = () => this.resizeTabs();
    }

    private getAdjacentTab(toTheLeft: boolean) {
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
        const iconPath = path.join(
            process.env.APPDATA!, 
            'boysen', 
            'Cache', 
            'shell-icons',
            `${exeName}.ico`
        );

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
