import type { VPNDetail } from "@/components/VPNList.tsx"
import type { VpnCreate, VpnUpdate } from "@/api/vpn.ts"
import type { Adapter } from "@/types/adapter"

export interface IDb {
    vpn: IVpn
}

export interface IConnections {
    connect: (id: string) => Promise
    disconnect: (id: string) => Promise
    status: (id: string) => Promise<Status>
    logs: (id: string) => Promise<string[]>
    installTap: () => Promise<string>
    checkTapInstalled: () => Promise<boolean>
    uninstallTap: () => Promise<void>
    listTaps: () => Promise<Adapter[]>
    createTap: (name: string) => Promise<Adapter>
    deleteTap: (guidOrName: string) => Promise<void>
}

export interface IDialog {
    showOpenDialog: (options?: any) => Promise<string>
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
    dialog: IDialog
    receive: (channel: string, func: (...args) => void) => Promise<void>
    removeAllListeners: (channel: string) => Promise<void>
}

declare global {
    interface Window {
        require: (package_name: string) => any
        electronAPI: IElectronAPI
    }
}
