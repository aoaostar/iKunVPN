import {
    Box,
    BoxProps,
    Button,
    ButtonGroup,
    CircularProgress,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Tag,
    Text,
    useDisclosure,
} from "@chakra-ui/react"
import { Vpn, VPNDetail } from "@/api/vpn.ts"
import { useCallback, useEffect, useState } from "react"
import Connections, { Status, StatusNotification } from "@/api/connections.ts"
import Toast from "@/utils/toast.ts"
import { useNavigate } from "react-router-dom"
import Console from "@/components/Console.tsx"

type Props = BoxProps & {
    vpnDetail: VPNDetail
    handleDelete: (vpnDetail: VPNDetail) => void
}

export default function VpnListItem({
    vpnDetail,
    handleDelete: ParentHandleDelete,
}: Props) {
    const [status, setStatus] = useState(Status.Stop)
    const [serverIp, setServerIp] = useState("")

    const navigate = useNavigate()

    const { isOpen, onOpen, onClose } = useDisclosure()

    const handleConnect = useCallback(async () => {
        if (status === Status.Connecting) {
            return
        }
        setStatus(Status.Connecting)
        const toastId = Toast.loading("正在连接")

        try {
            const r = await Connections.connect(vpnDetail.id)
            setStatus(r.status)
            Toast.success("连接成功")
        } catch (e: any) {
            Toast.error("连接失败", e.message)
        } finally {
            Toast.close(toastId)
        }
    }, [])

    const handleDisConnect = useCallback(async () => {
        try {
            const r = await Connections.disconnect(vpnDetail.id)
            setStatus(r.status)
            Toast.success("操作成功")
        } catch (e: any) {
            Toast.error("操作失败", e.message)
        }
    }, [])

    const handleDelete = useCallback(() => {
        Vpn.delete(vpnDetail.id)
            .then((_: any) => {
                ParentHandleDelete(vpnDetail)
                Toast.success("删除成功", "")
            })
            .catch((e: any) => {
                Toast.error("删除失败", e.message)
            })
    }, [])

    useEffect(() => {
        const func = (r: StatusNotification) => {
            if (r.current.id !== vpnDetail.id) {
                return
            }
            setStatus(r.status)

            switch (r.status) {
                case Status.Error:
                    Toast.error("连接已断开")
                    break
            }
        }
        Connections.receive(func).then()
        return () => {
            Connections.removeAllListeners().then()
        }
    }, [])

    useEffect(() => {
        const regExp = new RegExp(/remote (\b(?:\d{1,3}\.){3}\d{1,3}\b) /g)
        const regExpExecArray = regExp.exec(vpnDetail.ovpn)
        if (regExpExecArray && regExpExecArray.length > 1) {
            setServerIp(regExpExecArray[1])
        }
    }, [])

    useEffect(() => {
        Connections.status(vpnDetail.id).then((r: Status) => {
            setStatus(r)
        })
    }, [])

    useEffect(() => {
        const interval = setInterval(async () => {
            if (status === Status.Error) {
                await handleConnect()
            }
        }, 5 * 1000)
        return () => {
            clearInterval(interval)
        }
    }, [status])

    return (
        <Flex justify={"space-between"} key={vpnDetail.id}>
            <Box>
                <Tag variant="solid" colorScheme="teal">
                    {vpnDetail.mark}
                </Tag>
                <Tag>{vpnDetail.username}</Tag>
                {serverIp && (
                    <Tag
                        variant="solid"
                        colorScheme="teal"
                        ml="0.8rem"
                        mr="0.8rem"
                    >
                        {serverIp}
                    </Tag>
                )}

                {[Status.Error, Status.Stop].includes(status) && <></>}
                {status == Status.Connecting && (
                    <>
                        <CircularProgress
                            isIndeterminate
                            color="teal.400"
                            size="2rem"
                        />
                    </>
                )}
            </Box>
            <ButtonGroup>
                <Flex alignItems="center" gap=".5rem">
                    {status == Status.Success && (
                        <>
                            <Tag variant="solid" colorScheme="teal">
                                已连接
                            </Tag>
                            <Button
                                onClick={handleDisConnect}
                                colorScheme="teal"
                                variant="outline"
                            >
                                <Text fontSize="xs">断开</Text>
                            </Button>
                        </>
                    )}
                    {[Status.Error, Status.Stop].includes(status) && (
                        <>
                            <Tag variant="solid" colorScheme="gray">
                                未连接
                            </Tag>
                            <Button onClick={handleConnect}>
                                <Text fontSize="xs">连接</Text>
                            </Button>
                        </>
                    )}
                    {status == Status.Connecting && (
                        <>
                            <Tag variant="solid" colorScheme="blue">
                                连接中
                            </Tag>
                            <Button
                                onClick={handleDisConnect}
                                colorScheme="teal"
                                variant="outline"
                            >
                                <Text fontSize="xs">断开</Text>
                            </Button>
                        </>
                    )}
                </Flex>
                <Button onClick={() => navigate(`/detail/${vpnDetail.id}`)}>
                    <Text fontSize="xs">修改</Text>
                </Button>
                <Button onClick={onOpen}>
                    <Text fontSize="xs">日志</Text>
                </Button>
                <Button onClick={handleDelete}>
                    <Text fontSize="xs">删除</Text>
                </Button>
            </ButtonGroup>

            <Modal isOpen={isOpen} onClose={onClose} size="4xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>日志</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Console vpnId={vpnDetail.id}></Console>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Flex>
    )
}
