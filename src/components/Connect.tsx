import {
    Box,
    BoxProps,
    Button,
    Card,
    CardBody,
    Flex,
    Progress,
    Tag,
    Text,
} from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"
import { Connect as ConnectApi, Status, StatusResponse } from "@/api/connect.ts"
import Toast from "@/utils/toast.ts"

export default function Connect(props: BoxProps) {
    const [data, setData] = useState<StatusResponse>({
        status: Status.error,
        current: {
            id: 0,
            mark: "",
            username: "",
            password: "",
            ovpn: "",
            otp_config: {
                secret: "",
                step: 0,
            },
        },
    })

    const [serverIp, setServerIp] = useState("")

    useEffect(() => {
        ConnectApi.status().then((r) => {
            setData(r)
        })
    }, [])

    useEffect(() => {
        const regExp = new RegExp(/remote (\b(?:\d{1,3}\.){3}\d{1,3}\b) /g)
        const regExpExecArray = regExp.exec(data.current.ovpn)
        if (regExpExecArray && regExpExecArray.length > 1) {
            setServerIp(regExpExecArray[1])
        }
    }, [data])
    let isDisconnect = false

    useEffect(() => {
        const func = (r: StatusResponse) => {
            r.status === Status.success && Toast.success("连接成功")

            r.status === Status.error &&
                !isDisconnect &&
                Toast.error("连接已断开")
            setData(r)
            console.log(r)
        }
        ConnectApi.receive(func).then()
        return () => {
            ConnectApi.removeAllListeners().then()
        }
    }, [])

    const handleStop = useCallback(() => {
        isDisconnect = true
        ConnectApi.stop()
            .catch((e) => {
                Toast.error("操作失败", e.message)
            })
            .finally(() => (isDisconnect = false))
    }, [])
    const handleConnect = useCallback((id: number) => {
        if (!id) {
            Toast.warning("连接失败", "请选择连接")
            return
        }
        ConnectApi.start(id).catch((e) => {
            Toast.error("操作失败", e.message)
        })
    }, [])
    return (
        <Box {...props}>
            <Card>
                {data.status == Status.connecting && (
                    <Progress size="xs" isIndeterminate />
                )}

                <CardBody>
                    <Flex alignItems="center" gap=".5rem">
                        {data.status == Status.success && (
                            <>
                                <Tag variant="solid" colorScheme="teal">
                                    {serverIp}
                                </Tag>
                                <Tag variant="solid" colorScheme="teal">
                                    已连接
                                </Tag>
                                <Button onClick={handleStop}>
                                    <Text fontSize="xs">断开</Text>
                                </Button>
                            </>
                        )}
                        {data.status == Status.error && (
                            <>
                                <Tag variant="solid" colorScheme="teal">
                                    未连接
                                </Tag>
                                <Button
                                    onClick={() =>
                                        handleConnect(data.current.id)
                                    }
                                >
                                    <Text fontSize="xs">连接</Text>
                                </Button>
                            </>
                        )}
                        {data.status == Status.connecting && (
                            <>
                                <Tag variant="solid" colorScheme="teal">
                                    连接中
                                </Tag>
                                <Button onClick={handleStop}>
                                    <Text fontSize="xs">断开</Text>
                                </Button>
                            </>
                        )}
                    </Flex>
                </CardBody>
            </Card>
        </Box>
    )
}
