import {
    Button,
    Card,
    CardBody,
    Checkbox,
    Flex,
    Heading, HStack,
    Text,
} from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"
import { Vpn, VPNDetail } from "@/api/vpn.ts"
import VPNList from "@/components/VPNList.tsx"
import { useNavigate } from "react-router-dom"

export default function Home() {
    const [vpnData, setVpnData] = useState<VPNDetail[]>([])
    const [autoReconnect, setAutoReconnect] = useState(false)

    const navigate = useNavigate()

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
                        <HStack spacing="1rem">
                            <Checkbox
                                isChecked={autoReconnect}
                                onChange={(e) =>
                                    setAutoReconnect(e.target.checked)
                                }
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
                        </HStack>
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
