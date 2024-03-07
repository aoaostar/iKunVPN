import { VPNDetail } from "../components/VPNList.tsx"
import { VpnCreate, VpnUpdate } from "../api/vpn.ts"
import { StatusResponse } from "@/api/connect.ts"

export interface IDb {
    vpn: IVpn
}

export interface IConnect {
    start: (id: number) => Promise
    status: () => Promise<StatusResponse>
    stop: () => Promise
    logs: () => Promise<string[]>
}

export interface IVpn {
    all: () => Promise<VPNDetail[]>
    get: (id: number) => Promise<VPNDetail>
    create: (params: VpnCreate) => Promise<VPNDetail>
    update: (id: number, params: VpnUpdate) => Promise<VPNDetail>
    delete: (id: number) => Promise<boolean>
}

export interface IElectronAPI {
    db: IDb
    connect: IConnect
    receive: (channel: string, func: (...args) => void) => Promise<void>
    removeAllListeners: (channel: string) => Promise<void>
}

declare global {
    interface Window {
        require: (package_name: string) => any
        electronAPI: IElectronAPI
    }
}
