import { useEffect, useRef, useState } from "react"
import Connections from "@/api/connections.ts"

type ConsoleProps = {
    vpnId: string
    visible?: boolean
}

export default function Console(props: ConsoleProps) {
    const { vpnId, visible = true } = props

    const messagesRef = useRef<HTMLDivElement>(null)

    const last_scroll_top = useRef(0)
    useEffect(() => {
        const messagesElement = messagesRef.current
        if (
            messagesElement &&
            messagesElement.scrollTop >= last_scroll_top.current - 30
        ) {
            messagesElement.scrollTop = messagesElement.scrollHeight
            last_scroll_top.current = messagesElement.scrollTop
        }
    })

    const [logs, setLogs] = useState<string[]>([])

    useEffect(() => {
        if (!visible) return

        const intervalId = setInterval(async () => {
            const logs = await Connections.logs(vpnId)
            setLogs(logs)
        }, 1000)
        return () => {
            clearInterval(intervalId)
        }
    }, [vpnId, visible])

    return logs.length > 0 ? (
        <div
            ref={messagesRef}
            style={{
                whiteSpace: "pre",
                backgroundColor: "#333",
                overflow: "auto",
                color: "#e0e0e0",
                maxHeight: "60vh",
                minHeight: "40vh",
            }}
        >
            {logs.join("\n")}
        </div>
    ) : (
        <div style={{ minHeight: "40vh" }}>当前无日志</div>
    )
}
