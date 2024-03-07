import Vpn from "./db/vpn.ts"
import { spawn } from "child_process"
import path from "path"
import { promises as fsPromises } from "fs"
import OTP from "otp"
import Store from "./store.ts"
import { RESOURCE_PATH } from "./const.ts"

const Status = {
    success: "success",
    error: "error",
    connecting: "connecting",
}

export default class Connect {
    static __current_vpn = {}
    static __status = Status.error
    static __output: string[] = []
    static __ovpn_file = path.resolve(
        RESOURCE_PATH,
        "extra/runtime/__client.ovpn"
    )
    static __credentials_file = path.resolve(
        RESOURCE_PATH,
        "extra/runtime/__credentials"
    )
    static __process: any = null

    static add_output(message: Object) {
        this.__output.push(message.toString())
        if (this.__output.length > 1000) {
            this.__output.splice(0, 500)
        }
    }

    static logs() {
        return this.__output
    }

    static async start(id: number) {
        const data = await Vpn.get(id)
        let password = data.password
        if (data.otp_config.secret) {
            const otp = new OTP({
                secret: data.otp_config.secret,
                timeSlice: data.otp_config.step,
                keySize: 6,
            })
            password += otp.totp(Date.now())
        }
        const directoryPath = path.dirname(this.__ovpn_file)
        await this.stop()
        try {
            await fsPromises.access(directoryPath)
        } catch (err: any) {
            if (err.code === "ENOENT") {
                await fsPromises.mkdir(directoryPath, { recursive: true })
            }
        }
        await fsPromises.writeFile(this.__ovpn_file, data.ovpn)
        await fsPromises.writeFile(
            this.__credentials_file,
            `${data.username}\n${password}`
        )
        try {
            const executable = path.resolve(
                RESOURCE_PATH,
                "extra/openvpn/openvpn.exe"
            )
            this.__process = spawn(
                path.relative(RESOURCE_PATH, executable),
                [
                    "--config",
                    path.relative(RESOURCE_PATH, this.__ovpn_file),
                    "--auth-user-pass",
                    path.relative(RESOURCE_PATH, this.__credentials_file),
                    "--auth-nocache",
                ],
                {
                    cwd: RESOURCE_PATH,
                }
            )
        } catch (e) {
            this.__status = Status.error
        }

        this.__status = Status.connecting

        this.__current_vpn = data
        Store.MainWindow.webContents.send(
            "client/connect/status",
            await this.status()
        )
        // this.__process = spawn("ping", ["baidu.com", "-t"])

        this.add_output("启动连接")
        // 监听进程的标准输出
        this.__process.stdout.on("data", (message: Buffer) => {
            if (
                message.toString().includes("Initialization Sequence Completed")
            ) {
                this.__status = Status.success
                this.__current_vpn = data
                this.status().then((r) => {
                    Store.MainWindow.webContents.send(
                        "client/connect/status",
                        r
                    )
                })
            }
            this.add_output(message)
        })

        // 监听进程的标准错误
        this.__process.stderr.on("data", (message: Buffer) => {
            this.add_output(message)
        })

        // 监听进程的退出事件
        this.__process.on("close", (code: Buffer) => {
            this.add_output(`进程退出，退出码：${code}`)
            this.__status = Status.error
            new Promise(async () => {
                Store.MainWindow.webContents.send(
                    "client/connect/status",
                    await this.status()
                )
            })
        })
    }

    static async status() {
        console.info("Status Connect")
        return {
            status: this.__status,
            current: this.__current_vpn,
        }
    }

    static async stop() {
        console.info("Stop Connect")
        if (this.__process) {
            this.__process.kill()
            this.__status = Status.error
            this.__process = null
        }
    }
}

module.exports = Connect
