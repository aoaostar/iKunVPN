export function bytesToSize(bytes: number) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

    if (bytes === 0) return "0 Byte"

    const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))))

    return Math.round(100 * (bytes / Math.pow(1024, i))) / 100 + " " + sizes[i]
}
