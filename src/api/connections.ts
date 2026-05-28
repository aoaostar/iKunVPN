import { VPNDetail } from "@/api/vpn.ts"
import type { Adapter } from "@/types/adapter"

export enum Status {
    Success = "Success",
    Error = "Error",
    Connecting = "Connecting",
    Stop = "Stop",
}

export type StatusNotification = {
    status: Status
    current: VPNDetail
}

export type StatusResponse = {
    status: Status
    message: string
}

export const Connections = {
    connect: async (id: string): Promise<StatusResponse> => {
        return await window.electronAPI.connections.connect(id)
    },
    disconnect: async (id: string): Promise<StatusResponse> => {
        return await window.electronAPI.connections.disconnect(id)
    },
    status: async (id: string): Promise<Status> => {
        return await window.electronAPI.connections.status(id)
    },
    logs: async (id: string): Promise<string[]> => {
        return await window.electronAPI.connections.logs(id)
    },
    installTap: async (): Promise<string> => {
        return await window.electronAPI.connections.installTap()
    },
    checkTapInstalled: async (): Promise<boolean> => {
        return await window.electronAPI.connections.checkTapInstalled()
    },
    uninstallTap: async (): Promise<void> => {
        return await window.electronAPI.connections.uninstallTap()
    },
    listTaps: async (): Promise<Adapter[]> => {
        return await window.electronAPI.connections.listTaps()
    },
    createTap: async (name: string): Promise<Adapter> => {
        return await window.electronAPI.connections.createTap(name)
    },
    deleteTap: async (guidOrName: string): Promise<void> => {
        return await window.electronAPI.connections.deleteTap(guidOrName)
    },
    receive: (func: (data: StatusNotification) => void) => {
        return window.electronAPI.receive("client/connections/status", (...args: unknown[]) => func(args[0] as StatusNotification))
    },
    removeAllListeners: async () => {
        // 不再使用全局移除，由各组件自行管理监听器生命周期
    },
}
export default Connections
