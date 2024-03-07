import { Box, BoxProps } from "@chakra-ui/react"
import { useEffect, useRef } from "react"

type ConsoleProps = BoxProps & {
    logs: string[]
}
export default function Console(props: ConsoleProps) {
    const { logs, ...restProps } = props

    const messagesRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const messagesElement = messagesRef.current
        if (messagesElement) {
            messagesElement.scrollTop = messagesElement.scrollHeight
        }
    })
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
