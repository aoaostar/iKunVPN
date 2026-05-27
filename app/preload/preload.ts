import { contextBridge, ipcRenderer } from "electron"

const db = {
    vpn: {
        all() {
            return ipcRenderer.invoke("db/vpn/all")
        },
        get(id: number) {
            return ipcRenderer.invoke("db/vpn/get", id)
        },
        create(params: any) {
            return ipcRenderer.invoke("db/vpn/create", params)
        },
        update(id: number, params: any) {
            return ipcRenderer.invoke("db/vpn/update", id, params)
        },
        delete(id: number) {
            return ipcRenderer.invoke("db/vpn/delete", id)
        },
    },
}
const connections = {
    connect(id: string) {
        return ipcRenderer.invoke("connections/connect", id)
    },
    disconnect(id: string) {
        return ipcRenderer.invoke("connections/disconnect", id)
    },
    status(id: string) {
        return ipcRenderer.invoke("connections/status", id)
    },
    logs(id: string) {
        return ipcRenderer.invoke("connections/logs", id)
    },
    installTap() {
        return ipcRenderer.invoke("connections/installTap")
    },
    checkTapInstalled() {
        return ipcRenderer.invoke("connections/checkTapInstalled")
    },
    uninstallTap() {
        return ipcRenderer.invoke("connections/uninstallTap")
    },
    listTaps() {
        return ipcRenderer.invoke("connections/listTaps")
    },
    createTap(name: string) {
        return ipcRenderer.invoke("connections/createTap", name)
    },
    deleteTap(guidOrName: string) {
        return ipcRenderer.invoke("connections/deleteTap", guidOrName)
    },
}
const dialogApi = {
    showOpenDialog(options?: unknown) {
        return ipcRenderer.invoke("dialog/showOpenDialog", options)
    },
}
contextBridge.exposeInMainWorld("electronAPI", {
    db: db,
    connections: connections,
    dialog: dialogApi,
    receive(channel: string, func: any) {
        const validChannels = ["client/connections/status"]
        if (validChannels.includes(channel)) {
            const handler = (_: never, ...args: never[]) => func(...args)
            ipcRenderer.on(channel, handler)
            return () => {
                ipcRenderer.removeListener(channel, handler )
            }
        }
    },
    removeAllListeners(channel: string) {
        // 不再使用 removeAllListeners，改用 removeListener 移除特定监听器
        // 调用 receive 返回的 cleanup 函数即可
    },
})
