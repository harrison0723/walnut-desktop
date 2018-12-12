/* 
    Steps to release a new version:
    1. Add GitHub token from your command line with: `export GH_TOKEN=SOMETHING`
    2. Change version number in package.json
    3. Deploy with `yarn deploy`
*/

const { app, shell, dialog, Menu, BrowserWindow } = require('electron')
const { autoUpdater } = require("electron-updater")
const windowStateKeeper = require('electron-window-state')
const isOnline = require('is-online')
const isDev = process.env.ELECTRON_ENV === 'development'

let mainWindow

function createWindow() {
    let mainWindowState = windowStateKeeper({
        defaultWidth: 1200,
        defaultHeight: 680
    })

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 860,
        minHeight: 600,
        show: false,
        backgroundColor: '#fff5ee',
        title: 'Walnut',
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
    })

    mainWindowState.manage(mainWindow)

    if (process.platform === 'win32') mainWindow.setMenu(null)
    const template = [
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'pasteandmatchstyle' },
                { role: 'delete' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            role: 'window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click() { require('electron').shell.openExternal('https://heywalnut.com') }
                }
            ]
        }
    ]

    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services', submenu: [] },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        })
        template[1].submenu.push(
            { type: 'separator' },
            {
                label: 'Speech',
                submenu: [
                    { role: 'startspeaking' },
                    { role: 'stopspeaking' }
                ]
            }
        )
        template[3].submenu = [
            { role: 'close' },
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' }
        ]
    }
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    mainWindow.loadURL(isDev ? 'http://localhost:3000' : 'https://heywalnut.com')

    mainWindow.webContents.on('new-window', function (event, url) {
        event.preventDefault()
        shell.openExternal(url)
    })

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.on('close', (event) => {
        if (app.quitting) {
            mainWindow.webContents.session.clearCache(() => { })
            mainWindow = null
        } else {
            event.preventDefault()
            mainWindow.hide()
        }
    })
}

app.on('ready', async () => {
    const online = await isOnline()

    if (!online) return dialog.showMessageBox({
        message: 'No internet connection', 
        detail: 'Walnut currently does not work offline.'
    }, () => {
        app.quit()
        return
    })

    createWindow()
    autoUpdater.checkForUpdatesAndNotify()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (!mainWindow) return
    else mainWindow.show()
})

app.on('before-quit', () => {
    app.quitting = true
})