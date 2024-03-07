import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    Flex,
    Heading,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure,
} from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"
import { Vpn, VPNDetail } from "@/api/vpn.ts"
import { Connect as ConnectApi } from "@/api/connect.ts"
import VPNList from "@/components/VPNList.tsx"
import { useNavigate } from "react-router-dom"
import Toast from "@/utils/toast.ts"
import Connect from "@/components/Connect.tsx"
import Console from "@/components/Console.tsx"

export default function Home() {
    const [vpnData, setVpnData] = useState<VPNDetail[]>([])

    const [logs, setLogs] = useState<string[]>([])

    const navigate = useNavigate()

    const { isOpen, onOpen, onClose } = useDisclosure()
    useEffect(() => {
        Vpn.all().then((data) => {
            setVpnData(data)
        })
    }, [])

    useEffect(() => {
        setInterval(() => {
            if (!isOpen) {
                return
            }
            ConnectApi.logs().then((r: any) => {
                setLogs(r)
            })
        }, 1000)
    }, [isOpen])

    const handleDelete = useCallback(
        (item: VPNDetail) => {
            Vpn.delete(item.id)
                .then((_: any) => {
                    Toast.success("删除成功", "")
                    vpnData.splice(vpnData.indexOf(item), 1)
                    setVpnData([...vpnData])
                })
                .catch((e: any) => {
                    Toast.error("删除失败", e.message)
                })
        },
        [vpnData]
    )

    return (
        <>
            <Card mt=".5rem">
                <CardBody>
                    <Flex justify="space-between">
                        <Heading size="md">iKunVPN</Heading>
                        <ButtonGroup>
                            <Button
                                onClick={() => {
                                    navigate("/create")
                                }}
                            >
                                <Text fontSize="xs">新增</Text>
                            </Button>

                            <Button onClick={onOpen}>
                                <Text fontSize="xs">日志</Text>
                            </Button>

                            <Modal isOpen={isOpen} onClose={onClose} size="4xl">
                                <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader>日志</ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>
                                        <Console logs={logs}></Console>
                                    </ModalBody>
                                </ModalContent>
                            </Modal>
                        </ButtonGroup>
                    </Flex>
                </CardBody>
            </Card>
            <Connect mt=".5rem"></Connect>
            <VPNList
                mt=".5rem"
                data={vpnData}
                handleDelete={handleDelete}
            ></VPNList>
        </>
    )
}
