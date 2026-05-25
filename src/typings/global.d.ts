import { VPNDetail } from "@/components/VPNList.tsx"
import { VpnCreate, VpnUpdate } from "@/api/vpn.ts"
import { Adapter } from "@/api/connections.ts"

export interface IDb {
    vpn: IVpn
}

export interface IConnections {
    connect: (id: string) => Promise
    disconnect: (id: string) => Promise
    status: (id: string) => Promise<Status>
    logs: (id: string) => Promise<string[]>
    installTap: () => Promise<string>
    showAdapters: () => Promise<Adapter[]>
}

export interface IVpn {
    all: () => Promise<VPNDetail[]>
    get: (id: string) => Promise<VPNDetail>
    create: (params: VpnCreate) => Promise<VPNDetail>
    update: (id: string, params: VpnUpdate) => Promise<VPNDetail>
    delete: (id: string) => Promise<boolean>
}

export interface IElectronAPI {
    db: IDb
    connections: IConnections
    receive: (channel: string, func: (...args) => void) => Promise<void>
    removeAllListeners: (channel: string) => Promise<void>
}

declare global {
    interface Window {
        require: (package_name: string) => any
        electronAPI: IElectronAPI
    }
}
