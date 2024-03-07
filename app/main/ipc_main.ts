import Vpn from "./db/vpn"
import Connect from "./connect"
import { ipcMain } from "electron"

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

    ipcMain.handle("db/vpn/delete", async (_, id) => {
        return await Vpn.delete(id)
    })

    ipcMain.handle("connect/start", async (_, id) => {
        return await Connect.start(id)
    })

    ipcMain.handle("connect/stop", async (_) => {
        return await Connect.stop()
    })

    ipcMain.handle("connect/status", async (_) => {
        return await Connect.status()
    })
    ipcMain.handle("connect/logs", (_) => {
        return Connect.logs()
    })
}
