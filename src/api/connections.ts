import { VPNDetail } from "@/api/vpn.ts"

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
    receive: async (func: (data: StatusNotification) => void) => {
        return await window.electronAPI.receive("client/connections/status", func)
    },
    removeAllListeners: async () => {
        return await window.electronAPI.removeAllListeners(
            "client/connections/status"
        )
    },
}
export default Connections
