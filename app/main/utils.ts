import { exec, ExecOptions } from "child_process"

export function bytesToSize(bytes: number) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

    if (bytes === 0) return "0 Byte"

    const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))))

    return Math.round(100 * (bytes / Math.pow(1024, i))) / 100 + " " + sizes[i]
}

export function executeCommand(
    command: string,
    options: ExecOptions = {}
): Promise<string> {
    console.log(`Executing command: ${command}`)
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout, stderr) => {
            console.log(`Command executed: ${command}, stdout: ${stdout}, stderr: ${stderr}, error: ${error}`)
            if (error) {
                reject(error.toString())
            }
            if (stderr) {
                reject(stderr.toString())
            }
            resolve(stdout.toString())
        })
    })
}
