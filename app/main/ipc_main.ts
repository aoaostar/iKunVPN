import Vpn from "./db/vpn"
import Connections from "./connections"
import { ipcMain, dialog } from "electron"

export default function initIpcMain() {
    ipcMain.handle("db/vpn/all", async () => {
        return await Vpn.all()
    })

    ipcMain.handle("db/vpn/get", async (_, args) => {
        return await Vpn.get(args)
    })

    ipcMain.handle("db/vpn/create", async (_, params) => {
        return await Vpn.create(params)
    })

    ipcMain.handle("db/vpn/update", async (_, id, params) => {
        return await Vpn.update(id, params)
    })

    ipcMain.handle("db/vpn/delete", async (_, id: string) => {
        return await Vpn.delete(id)
    })

    ipcMain.handle("connections/connect", async (_, id: string) => {
        return await Connections.connect(id)
    })

    ipcMain.handle("connections/disconnect", async (_, id: string) => {
        return await Connections.disconnect(id)
    })

    ipcMain.handle("connections/status", async (_, id: string) => {
        return await Connections.status(id)
    })
    ipcMain.handle("connections/logs", async (_, id: string) => {
        return await Connections.logs(id)
    })
    ipcMain.handle("connections/installTap", async (_) => {
        return await Connections.installTap()
    })
    ipcMain.handle("connections/checkTapInstalled", async (_) => {
        return await Connections.checkTapInstalled()
    })
    ipcMain.handle("connections/uninstallTap", async (_) => {
        return await Connections.uninstallTap()
    })
    ipcMain.handle("connections/listTaps", async (_) => {
        return await Connections.listTaps()
    })
    ipcMain.handle("connections/createTap", async (_, name: string) => {
        return await Connections.createTap(name)
    })
    ipcMain.handle("connections/deleteTap", async (_, guidOrName: string) => {
        return await Connections.deleteTap(guidOrName)
    })
    ipcMain.handle("dialog/showOpenDialog", async (_, options?: any) => {
        const result = await dialog.showOpenDialog({
            properties: ["openFile"],
            filters: [{ name: "Executable", extensions: ["exe"] }],
            ...options,
        })
        if (result.canceled) return ""
        return result.filePaths[0] || ""
    })
}
