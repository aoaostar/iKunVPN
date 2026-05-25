import {
    Box,
    BoxProps,
    Card,
    CardBody,
    CardHeader,
    Stack,
    StackDivider,
} from "@chakra-ui/react"
import { VPNDetail } from "@/api/vpn.ts"
import VpnListItem from "@/components/VpnListItem.tsx"

type VPNListProps = {
    data: VPNDetail[]
    handleDelete: (vpnDetail: VPNDetail) => void
    autoReconnect: boolean
}

export default function VPNList(props: VPNListProps & BoxProps) {
    const { data, handleDelete, autoReconnect, ...restProps } = props

    return (
        <Box {...restProps}>
            <Card>
                <CardHeader>
                    <Box>服务器列表</Box>
                </CardHeader>

                <CardBody>
                    <Stack divider={<StackDivider />} spacing="4">
                        {data.map((value) => {
                            return <VpnListItem vpnDetail={value} handleDelete={handleDelete} autoReconnect={autoReconnect} key={value.id}></VpnListItem>
                        })}
                    </Stack>
                </CardBody>
            </Card>
        </Box>
    )
}
