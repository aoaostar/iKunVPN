

export type DatabaseSchema = {
    vpn: VPNSchema[]
}

export type OptConfigSchema = {
    secret: string
    step: number
}

export type VpnConfigSchema = {
    executable: string
    adapter: string
}

export type VPNSchema = {
    id: string
    mark: string
    username: string
    password: string
    ovpn: string
    otp_config: OptConfigSchema
    config: VpnConfigSchema
}