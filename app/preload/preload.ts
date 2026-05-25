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
}
contextBridge.exposeInMainWorld("electronAPI", {
    db: db,
    connections: connections,
    receive(channel: string, func: any) {
        let validChannels = ["client/connections/status"]
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (_, ...args) => func(...args))
        }
    },
    removeAllListeners(channel: string) {
        const validChannels = ["client/connections/status"]
        if (validChannels.includes(channel)) {
            ipcRenderer.removeAllListeners(channel)
        }
    },
})
