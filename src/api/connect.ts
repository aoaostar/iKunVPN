import { VPNDetail } from "@/api/vpn.ts"

export enum Status {
    success = "success",
    error = "error",
    connecting = "connecting",
}

export type StatusResponse = {
    status: Status
    current: VPNDetail
}
export const Connect = {
    start: async (id: number): Promise<void> => {
        return await window.electronAPI.connect.start(id)
    },
    stop: async (): Promise<void> => {
        return await window.electronAPI.connect.stop()
    },
    status: async (): Promise<StatusResponse> => {
        return await window.electronAPI.connect.status()
    },
    logs: async (): Promise<string[]> => {
        return window.electronAPI.connect.logs()
    },
    receive: async (func: (data: StatusResponse) => void) => {
        return await window.electronAPI.receive("client/connect/status", func)
    },
    removeAllListeners: async () => {
        return await window.electronAPI.removeAllListeners(
            "client/connect/status"
        )
    },
}
export default Connect
