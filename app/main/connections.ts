import Vpn from "./db/vpn"
import Connection, { Status, StatusResponse } from "./connection"
import path from "path"
import { RESOURCE_PATH } from "./const"
import log from "electron-log/main"
import { executeCommand } from "./utils"

export type Adapter = {
    name: string
    type: string
    guid: string
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

        let connection: Connection
        if (id in this.connections) {
            connection = this.connections[id]
        } else {
            connection = new Connection(vpnSchema)
            this.connections[vpnSchema.id] = connection
        }
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

    static async listTaps(): Promise<Adapter[]> {
        const stdout = await executeCommand(`openvpn.exe --show-adapters`, {
            cwd: this.cwd,
        })

        log.debug(`listTaps: ${stdout}`)
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
                guid: id,
            })
        }
        return adapters
    }

    static async createTap(name: string): Promise<Adapter> {
        await executeCommand(
            `tapctl.exe create --name "${name}" --hwid tap0901`,
            { cwd: this.cwd }
        )
        const taps = await this.listTaps()
        const tap = taps.find((t) => t.name === name)
        if (!tap) {
            throw new Error("TAP adapter created but not found")
        }
        return tap
    }

    static async deleteTap(guidOrName: string): Promise<void> {
        await executeCommand(`tapctl.exe delete "${guidOrName}"`, {
            cwd: this.cwd,
        })
    }

    static async checkTapInstalled(): Promise<boolean> {
        try {
            const stdout = await executeCommand(`tapinstall.exe find tap0901`, {
                cwd: this.cwd,
            })
            return !stdout.includes("No matching devices found.")
        } catch {
            return false
        }
    }

    static async uninstallTap() {
        await executeCommand(`tapinstall.exe remove tap0901`, {
            cwd: this.cwd,
        })
    }

    static async installTap() {
        await executeCommand(`tapinstall.exe remove tap0901`, {
            cwd: this.cwd,
        }).catch(() => {
            /* ignore */
        })
        return await executeCommand(
            `tapinstall.exe install "tap0901.inf" tap0901`,
            { cwd: this.cwd }
        )
    }
}
