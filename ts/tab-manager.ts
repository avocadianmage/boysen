import * as TabGroup from 'electron-tabs';
import { ipcRenderer, remote } from 'electron';

const tabGroup = new TabGroup();

// Update tab title based on the current working directory of the terminal.
ipcRenderer.on('terminal-title-changed', (event: Event, title: string) => {
    tabGroup.getActiveTab()!.setTitle(truncateTitle(title));
});

// Close the tab if the terminal has exited.
ipcRenderer.on('terminal-exited', () => tabGroup.getActiveTab()!.close());

// Bind keyboard events for tab manipulation.
window.addEventListener('keydown', (ev) => {

    // Ctrl+T: add new tab.
    if (ev.ctrlKey && ev.key === 't') newTab();

    // Ctrl+W: close active tab.
    if (ev.ctrlKey && ev.key === 'w') {
        // Stop default which closes the entire browser.
        ev.preventDefault(); 
        tabGroup.getActiveTab()!.close();
    }

    // Ctrl+Tab, Ctrl+Shift+Tab: cycle through tabs.
    if (ev.ctrlKey && ev.key === 'Tab')
    {
        const tab = getAdjacentTab(ev.shiftKey);
        if (tab) tab.activate();
    }
});

// Create tab for initial terminal instance.
window.onload = newTab;

function newTab()
{
    const tab = tabGroup.addTab({ 
        title: 'Initializing…',
        src: 'terminal.html',
        active: true,
        iconURL: 'assets/terminal.ico',
        webviewAttributes: {
            nodeintegration: true
        }
    });
    
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

function getAdjacentTab(toTheLeft: boolean)
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
