export type OtpDetail = {
    secret: string
    step: number
}
export type ConfigDetail = {
    executable: string
    adapter: string
}

export type VPNDetail = {
    id: string
    mark: string
    username: string
    password: string
    ovpn: string
    otp_config: OtpDetail
    config: ConfigDetail
}

export type VpnCreate = Omit<VPNDetail, "id">
export type VpnUpdate = Omit<VPNDetail, "id">

export const Vpn = {
    all: async (): Promise<VPNDetail[]> => {
        return await window.electronAPI.db.vpn.all()
    },
    get: async (id: string): Promise<VPNDetail> => {
        return await window.electronAPI.db.vpn.get(id)
    },
    create: async (params: VpnCreate): Promise<VPNDetail> => {
        return await window.electronAPI.db.vpn.create(params)
    },
    update: async (id: string, params: VpnUpdate): Promise<VPNDetail> => {
        return await window.electronAPI.db.vpn.update(id, params)
    },
    delete: async (id: string): Promise<boolean> => {
        return await window.electronAPI.db.vpn.delete(id)
    },
}
export default Vpn
