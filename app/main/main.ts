import { app, BrowserWindow, Menu, shell, Tray } from "electron"

import path from "path"

import Store from "./store.ts"
import { IS_PRODUCTION, ProgramInfo } from "./const.ts"
import initIpcMain from "./ipc_main"
import initUpdate from "./autoupdater"
import { autoUpdater } from "electron-updater"

const appPath = app.getAppPath()

const createWindow = () => {
    const logo = path.join(appPath, "build/vite/logo.png")
    Store.MainWindow = new BrowserWindow({
        title: ProgramInfo.title,
        center: true,
        autoHideMenuBar: IS_PRODUCTION,
        width: 1000,
        height: 600,
        icon: logo,
        webPreferences: {
            preload: path.resolve(__dirname, "preload.js"),
        },
    })

    if (IS_PRODUCTION) {
        Store.MainWindow.loadURL(path.resolve(appPath, "build/vite/index.html"))
    } else {
        Store.MainWindow.loadURL("http://localhost:5173/")
        Store.MainWindow.webContents.openDevTools()
    }

    // 创建托盘图标
    const tray = new Tray(logo)

    // 创建托盘菜单
    const contextMenu = Menu.buildFromTemplate([
        { label: "显示应用", click: () => Store.MainWindow.show() },
        {
            label: "Github主页",
            click: () => {
                shell.openExternal("https://www.github.com/aoaostar/iKunVPN")
            },
        },
        {
            label: "检测更新",
            click: async () => {
                await autoUpdater.checkForUpdates()
            },
        },
        { label: "退出", click: () => app.exit() },
    ])

    tray.setContextMenu(contextMenu)

    tray.on("click", () => {
        Store.MainWindow.isVisible()
            ? Store.MainWindow.hide()
            : Store.MainWindow.show()
    })

    IS_PRODUCTION &&
        Store.MainWindow.on("close", (event) => {
            event.preventDefault()
            // 隐藏窗口而不关闭
            Store.MainWindow.hide()
        })

    // 监听窗口最小化事件
    Store.MainWindow.on("minimize", () => {})
}

const singleInstanceLock = app.requestSingleInstanceLock()

if (!singleInstanceLock) {
    app.quit()
}

app.whenReady().then(() => {
    initUpdate()
    createWindow()

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

initIpcMain()
