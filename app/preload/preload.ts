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
const connect = {
    start(id: number) {
        return ipcRenderer.invoke("connect/start", id)
    },
    stop() {
        return ipcRenderer.invoke("connect/stop")
    },
    status() {
        return ipcRenderer.invoke("connect/status")
    },
    logs() {
        return ipcRenderer.invoke("connect/logs")
    },
}
contextBridge.exposeInMainWorld("electronAPI", {
    db: db,
    connect: connect,
    receive(channel: string, func: any) {
        let validChannels = ["client/connect/status"]
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (_, ...args) => func(...args))
        }
    },
    removeAllListeners(channel: string) {
        let validChannels = ["client/connect/status"]
        if (validChannels.includes(channel)) {
            ipcRenderer.removeAllListeners(channel)
        }
    },
})
