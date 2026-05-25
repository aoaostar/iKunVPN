import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    Checkbox,
    Flex,
    Heading,
    Text,
} from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"
import { Vpn, VPNDetail } from "@/api/vpn.ts"
import VPNList from "@/components/VPNList.tsx"
import { useNavigate } from "react-router-dom"
import Connections from "@/api/connections.ts"
import Toast from "@/utils/toast.ts"

export default function Home() {
    const [vpnData, setVpnData] = useState<VPNDetail[]>([])
    const [autoReconnect, setAutoReconnect] = useState(false)
    const [installingTap, setInstallingTap] = useState(false)

    const navigate = useNavigate()

    const handleInstallTap = useCallback(async () => {
        setInstallingTap(true)
        try {
            await Connections.installTap()
            Toast.success("TAP 驱动安装成功")
        } catch (e: any) {
            Toast.error("TAP 驱动安装失败", e.message || e)
        } finally {
            setInstallingTap(false)
        }
    }, [])

    useEffect(() => {
        Vpn.all().then((data) => {
            setVpnData(data)
        })
    }, [])

    const handleDelete = useCallback(
        (vpnDetail: VPNDetail) => {
            setVpnData(vpnData.filter((v) => v.id !== vpnDetail.id))
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
                                onClick={handleInstallTap}
                                isLoading={installingTap}
                            >
                                <Text fontSize="xs">安装TAP</Text>
                            </Button>
                            <Checkbox
                                isChecked={autoReconnect}
                                onChange={(e) => setAutoReconnect(e.target.checked)}
                            >
                                <Text fontSize="xs">自动重连</Text>
                            </Checkbox>
                            <Button
                                onClick={() => {
                                    navigate("/create")
                                }}
                            >
                                <Text fontSize="xs">新增</Text>
                            </Button>
                        </ButtonGroup>
                    </Flex>
                </CardBody>
            </Card>
            <VPNList
                mt=".5rem"
                data={vpnData}
                handleDelete={handleDelete}
                autoReconnect={autoReconnect}
            ></VPNList>
        </>
    )
}
