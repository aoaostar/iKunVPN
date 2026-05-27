import { VPNSchema } from "./db/schemas"
import OTP from "otp"
import path from "path"
import { promises as fsPromises } from "fs"
import { RESOURCE_PATH, RUNTIME_PATH } from "./const"
import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import Store from "./store"
import log from "electron-log/main"
import { MainLogger } from "electron-log"
import * as fs from "node:fs"

export enum Status {
    Success = "Success",
    Error = "Error",
    Connecting = "Connecting",
    Stop = "Stop",
}

export type StatusResponse = {
    status: Status
    message: string
}
export default class Connection {
    private vpnSchema: VPNSchema
    private process: ChildProcessWithoutNullStreams | undefined
    private __status: Status = Status.Stop
    private executable: string
    private log: MainLogger

    constructor(vpnSchema: VPNSchema) {
        this.vpnSchema = vpnSchema

        if (this.vpnSchema.config.executable) {
            this.executable = this.vpnSchema.config.executable
        } else {
            this.executable = path.resolve(
                RESOURCE_PATH,
                "extra/openvpn/openvpn.exe"
            )
        }
        this.log = log.create({
            logId: `${vpnSchema.id}_${vpnSchema.mark}`,
        })

        this.log.transports.file.fileName = `${this.log.logId}.log`

        this.log.transports.console.level = "info"
        this.log.transports.console.format =
            "[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}"
        this.log.transports.file.level = "info"
        this.log.transports.file.format =
            "[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}"
    }

    get ovpn_file(): string {
        return path.resolve(RUNTIME_PATH, `${this.vpnSchema.id}/client.ovpn`)
    }

    get credentials_file(): string {
        return path.resolve(RUNTIME_PATH, `${this.vpnSchema.id}/credentials`)
    }

    get cwd_path(): string {
        return RUNTIME_PATH
    }

    get status(): Status {
        return this.__status
    }

    get logs(): string[] {
        const data = fs.readFileSync(
            this.log.transports.file.getFile().path,
            "utf8"
        )
        return data.split("\n")
    }

    private sendStatus(status: Status): void {
        console.log("status: " + status)
        this.__status = status

        Store.MainWindow.webContents.send("client/connections/status", {
            status: this.status,
            current: this.vpnSchema,
        })
    }

    // public async connect(): Promise<StatusResponse> {
    //     return new Promise(
    //         async (
    //             resolve: (value: StatusResponse) => void,
    //             reject: (value: StatusResponse) => void
    //         ) => {
    //             let password = this.vpnSchema.password
    //             if (this.vpnSchema.otp_config.secret) {
    //                 const otp = new OTP({
    //                     secret: this.vpnSchema.otp_config.secret,
    //                     timeSlice: this.vpnSchema.otp_config.step,
    //                     keySize: 6,
    //                 })
    //                 password += otp.totp(Date.now())
    //             }
    //             const directoryPath = path.dirname(this.ovpn_file)
    //             await this.kill()
    //
    //             this.sendStatus(Status.Connecting)
    //
    //             try {
    //                 await fsPromises.access(directoryPath)
    //             } catch (err: any) {
    //                 if (err.code === "ENOENT") {
    //                     await fsPromises.mkdir(directoryPath, {
    //                         recursive: true,
    //                     })
    //                 }
    //             }
    //             await fsPromises.writeFile(this.ovpn_file, this.vpnSchema.ovpn)
    //             await fsPromises.writeFile(
    //                 this.credentials_file,
    //                 `${this.vpnSchema.username}\n${password}`
    //             )
    //             try {
    //                 const command_args = [
    //                     "--config",
    //                     path.relative(this.cwd_path, this.ovpn_file),
    //                     "--auth-user-pass",
    //                     path.relative(this.cwd_path, this.credentials_file),
    //                     "--auth-nocache",
    //                     "--ping",
    //                     "10",
    //                     "--ping-exit",
    //                     "120",
    //                     "--remap-usr1",
    //                     "SIGTERM",
    //                     "--auth-retry",
    //                     "nointeract",
    //                     ...(this.vpnSchema.config.adapter
    //                         ? ["--dev-node", this.vpnSchema.config.adapter]
    //                         : []),
    //                 ]
    //
    //                 this.log.info(
    //                     `启动连接: ${this.executable} ${command_args.join(" ")}`
    //                 )
    //                 this.process = spawn(this.executable, command_args, {
    //                     cwd: this.cwd_path,
    //                 })
    //             } catch (e) {
    //                 this.log.info(`启动失败: ${e}`)
    //                 this.sendStatus(Status.Stop)
    //                 reject({
    //                     status: Status.Stop,
    //                     message: "连接失败",
    //                 })
    //                 return
    //             }
    //
    //             this.process.stdout.on("data", (message: Buffer) => {
    //                 const messageStr = message.toString()
    //                 this.log.info(messageStr)
    //                 if (
    //                     messageStr.includes(
    //                         "Initialization Sequence Completed With Errors"
    //                     )
    //                 ) {
    //                     this.kill()
    //                     reject({
    //                         status: Status.Stop,
    //                         message: "连接失败",
    //                     })
    //                     return
    //                 }
    //                 if (
    //                     messageStr.includes("Initialization Sequence Completed")
    //                 ) {
    //                     this.sendStatus(Status.Success)
    //                     resolve({
    //                         status: Status.Success,
    //                         message: "连接成功",
    //                     })
    //                 }
    //                 for (const message of ["TLS: soft reset"]) {
    //                     if (messageStr.includes(message)) {
    //                         this.kill()
    //                         return
    //                     }
    //                 }
    //             })
    //
    //             this.process.stderr.on("data", (message: Buffer) => {
    //                 this.log.error(message.toString())
    //             })
    //
    //             this.process.on("exit", (code, signal) => {
    //                 this.log.warn(`进程退出，退出码: ${code} signal: ${signal}`)
    //                 if (this.__status !== Status.Stop) {
    //                     this.sendStatus(Status.Error)
    //                 }
    //                 reject({
    //                     status: Status.Error,
    //                     message: "连接已断开",
    //                 })
    //             })
    //             this.process.on("error", (err) => {
    //                 this.log.error(`子进程出错: ${err}`)
    //                 this.sendStatus(Status.Error)
    //                 reject({
    //                     status: Status.Error,
    //                     message: "连接已断开",
    //                 })
    //             })
    //         }
    //     )
    // }
    public async connect(): Promise<StatusResponse> {
        let password = this.vpnSchema.password

        if (this.vpnSchema.otp_config.secret) {
            const otp = new OTP({
                secret: this.vpnSchema.otp_config.secret,
                timeSlice: this.vpnSchema.otp_config.step,
                keySize: 6,
            })
            password += otp.totp(Date.now())
        }

        const directoryPath = path.dirname(this.ovpn_file)

        await this.kill()
        this.sendStatus(Status.Connecting)

        try {
            await fsPromises.access(directoryPath)
        } catch (err: any) {
            if (err.code === "ENOENT") {
                await fsPromises.mkdir(directoryPath, { recursive: true })
            }
        }

        await fsPromises.writeFile(this.ovpn_file, this.vpnSchema.ovpn)
        await fsPromises.writeFile(
            this.credentials_file,
            `${this.vpnSchema.username}\n${password}`
        )

        return new Promise((resolve, reject) => {
            try {
                const command_args = [
                    "--config",
                    path.relative(this.cwd_path, this.ovpn_file),
                    "--auth-user-pass",
                    path.relative(this.cwd_path, this.credentials_file),
                    "--auth-nocache",
                    "--ping",
                    "10",
                    "--ping-exit",
                    "120",
                    "--remap-usr1",
                    "SIGTERM",
                    "--auth-retry",
                    "nointeract",
                    ...(this.vpnSchema.config.adapter
                        ? ["--dev-node", this.vpnSchema.config.adapter]
                        : []),
                ]

                this.log.info(
                    `启动连接: ${this.executable} ${command_args.join(" ")}`
                )

                this.process = spawn(this.executable, command_args, {
                    cwd: this.cwd_path,
                })
            } catch (e) {
                this.log.info(`启动失败: ${e}`)
                this.sendStatus(Status.Stop)
                reject({
                    status: Status.Stop,
                    message: "连接失败",
                })
                return
            }

            this.process.stdout.on("data", (message: Buffer) => {
                const messageStr = message.toString()
                this.log.info(messageStr)

                if (
                    messageStr.includes(
                        "Initialization Sequence Completed With Errors"
                    )
                ) {
                    this.kill()
                    reject({
                        status: Status.Stop,
                        message: "连接失败",
                    })
                    return
                }

                if (messageStr.includes("Initialization Sequence Completed")) {
                    this.sendStatus(Status.Success)
                    resolve({
                        status: Status.Success,
                        message: "连接成功",
                    })
                }

                if (messageStr.includes("TLS: soft reset")) {
                    this.kill()
                }
            })

            this.process.stderr.on("data", (message: Buffer) => {
                this.log.error(message.toString())
            })

            this.process.on("exit", (code, signal) => {
                this.log.warn(`进程退出，退出码: ${code} signal: ${signal}`)

                if (this.__status !== Status.Stop) {
                    this.sendStatus(Status.Error)
                }

                reject({
                    status: Status.Error,
                    message: "连接已断开",
                })
            })

            this.process.on("error", (err) => {
                this.log.error(`子进程出错: ${err}`)
                this.sendStatus(Status.Error)

                reject({
                    status: Status.Error,
                    message: "连接已断开",
                })
            })
        })
    }
    public async disconnect(): Promise<void> {
        await this.kill()
        this.sendStatus(Status.Stop)
    }

    private async kill(): Promise<void> {
        if (this.process) {
            this.process.kill()
        }
    }
}
