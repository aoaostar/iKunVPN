export type OtpDetail = {
    secret: string
    step: number
}
export type VpnCreate = {
    mark: string
    username: string
    password: string
    ovpn: string
    otp_config: OtpDetail
}
export type VpnUpdate = VpnCreate

export type VPNDetail = VpnCreate & {
    id: number
}

export const Vpn = {
    all: async (): Promise<VPNDetail[]> => {
        return await window.electronAPI.db.vpn.all()
    },
    get: async (id: number): Promise<VPNDetail> => {
        return await window.electronAPI.db.vpn.get(id)
    },
    create: async (params: VpnCreate): Promise<VPNDetail> => {
        return await window.electronAPI.db.vpn.create(params)
    },
    update: async (id: number, params: VpnUpdate): Promise<VPNDetail> => {
        return await window.electronAPI.db.vpn.update(id, params)
    },
    delete: async (id: number): Promise<boolean> => {
        return await window.electronAPI.db.vpn.delete(id)
    },
}
export default Vpn
