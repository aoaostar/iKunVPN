import Vpn from "./db/vpn"
import Connection, { Status, StatusResponse } from "./connection"
import path from "path"
import { RESOURCE_PATH } from "./const"
import log from "electron-log/main"
import { executeCommand } from "./utils"

export type Adapter = {
    name: string
    id: string
    type: string
}

export default class Connections {
    private static connections: { [key: string]: Connection } = {}

    private static cwd = path.resolve(RESOURCE_PATH, "extra/openvpn")

    static async connect(id: string) {
        const vpnSchema = await Vpn.get(id)
        if (!vpnSchema) {
            throw new Error("VPN not found")
        }

        if (![Status.Stop, Status.Error].includes(await this.status(id))) {
            throw new Error("VPN is connecting")
        }
        const connection = new Connection(vpnSchema)
        this.connections[vpnSchema.id] = connection
        return await connection.connect()
    }

    static async status(id: string) {
        if (!(id in this.connections)) {
            return Status.Stop
        }
        return this.connections[id].status
    }

    static async logs(id: string) {
        if (!(id in this.connections)) {
            return []
        }
        return this.connections[id].logs
    }

    static async disconnect(id: string): Promise<StatusResponse> {
        if (!(id in this.connections)) {
            return {
                status: Status.Stop,
                message: "VPN不存在",
            }
        }
        await this.connections[id].disconnect()
        delete this.connections[id]
        return {
            status: Status.Stop,
            message: "VPN已断开",
        }
    }

    static async showAdapters(): Promise<Adapter[]> {
        const stdout = await executeCommand(`openvpn.exe  --show-adapters`, {
            cwd: this.cwd,
        })

        log.debug(`showAdapters: ${stdout}`)
        const strings = stdout.split("\n")
        const adapters_str = strings.length > 0 ? strings.slice(1) : []
        const adapters: Adapter[] = []

        for (const adapter_str of adapters_str) {
            const adapter_trim_str = adapter_str.trim()
            if (!adapter_trim_str) {
                continue
            }
            const [name, id, type] = adapter_trim_str.split(" ")
            adapters.push({
                name: name.slice(1, -1),
                id,
                type,
            })
        }
        return adapters
    }

    static async installTap() {
        await executeCommand(`tapinstall.exe remove tap0901`, {
            cwd: this.cwd,
        }).catch(() => {
            /* ignore */
        })
        return await executeCommand(
            `tapinstall.exe install "tap0901.inf" tap0901`,
            {
                cwd: this.cwd,
            }
        )
    }

    static async createAdapter(name: string, hwid: string = "tap0901") {
        return await executeCommand(
            `tapctl.exe create --name "${name}" --hwid ${hwid}`
        )
    }

    static async deleteAdapter(guid_or_name: string) {
        return await executeCommand(`tapctl.exe delete "${guid_or_name}"`)
    }
    static async deleteAllAdapter(hwid: string) {
        return await executeCommand(`tapinstall.exe remove ${hwid}"`)
    }
}

Connections.showAdapters().then((r) => {
    console.log(r)
})
