import {
    Card,
    List,
} from '@douyinfe/semi-ui';
import { VPNDetail } from "@/api/vpn.ts"
import VpnListItem from "@/components/VpnListItem.tsx"

type VPNListProps = {
    data: VPNDetail[]
    handleDelete: (vpnDetail: VPNDetail) => void
    autoReconnect: boolean
}

export default function VPNList(props: VPNListProps) {
    const { data, handleDelete, autoReconnect } = props

    return (
        <Card title="服务器列表" style={{ marginBottom: 16 }}>
            <List
                dataSource={data}
                renderItem={(item: VPNDetail) => (
                    <List.Item>
                        <VpnListItem vpnDetail={item} handleDelete={handleDelete} autoReconnect={autoReconnect} />
                    </List.Item>
                )}
            />
        </Card>
    )
}
