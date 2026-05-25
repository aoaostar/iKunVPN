import { Box, BoxProps } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import Connections from "@/api/connections.ts"

type ConsoleProps = BoxProps & {
    vpnId: string
}

export default function Console(props: ConsoleProps) {
    const { vpnId, ...restProps } = props

    const messagesRef = useRef<HTMLElement>(null)

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
        const intervalId = setInterval(async () => {
            const logs = await Connections.logs(vpnId)
            setLogs(logs)
        }, 1000)
        return () => {
            clearInterval(intervalId)
        }
    }, [])

    return logs.length > 0 ? (
        <Box
            ref={messagesRef}
            {...restProps}
            style={{
                whiteSpace: "pre",
                backgroundColor: "#333",
                overflow: "scroll",
                color: "#e0e0e0",
                maxHeight: "60vh",
                minHeight: "40vh",
            }}
        >
            {logs.join("\n")}
        </Box>
    ) : (
        <Box minHeight="40vh">当前无日志</Box>
    )
}
