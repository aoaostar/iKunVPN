import { useCallback, useEffect, useState } from "react"

import {
    Button,
    Card,
    Checkbox,
    Input,
    Layout,
    Modal,
    Space,
    Table,
    Tabs,
    Tag,
    Typography,
} from "@douyinfe/semi-ui"
import { Vpn, VPNDetail } from "@/api/vpn.ts"
import HomeVpnTable from "@/components/HomeVpnTable.tsx"
import { useNavigate } from "react-router-dom"
import Connections from "@/api/connections.ts"
import type { Adapter } from "@/types/adapter.ts"
import Toast from "@/utils/toast.ts"

const { Content } = Layout
const { Text } = Typography

export default function Home() {
    const [vpnData, setVpnData] = useState<VPNDetail[]>([])
    const [autoReconnect, setAutoReconnect] = useState(false)
    const [installingTap, setInstallingTap] = useState(false)
    const [tapList, setTapList] = useState<Adapter[]>([])
    const [showTapModal, setShowTapModal] = useState(false)
    const [newTapName, setNewTapName] = useState("")
    const [refreshing, setRefreshing] = useState(false)

    const navigate = useNavigate()

    const loadTapList = useCallback(async () => {
        try {
            const list = await Connections.listTaps()
            setTapList(list)
        } catch (e: any) {
            Toast.error("获取网卡列表失败", e.message || e)
        }
    }, [])

    useEffect(() => {
        Vpn.all().then((data) => {
            setVpnData(data)
        })
    }, [])

    useEffect(() => {
        loadTapList()
    }, [loadTapList])

    const handleInstallTap = useCallback(async () => {
        setInstallingTap(true)
        try {
            await Connections.installTap()
            Toast.success("TAP 驱动安装成功")
            loadTapList()
        } catch (e: any) {
            Toast.error("TAP 驱动安装失败", e.message || e)
        } finally {
            setInstallingTap(false)
        }
    }, [loadTapList])

    const handleCreateTap = useCallback(async () => {
        if (!newTapName.trim()) {
            Toast.error("请输入网卡名称")
            return
        }
        const toastId = Toast.loading("正在创建虚拟网卡...")
        try {
            await Connections.createTap(newTapName.trim())
            Toast.success("网卡创建成功")
            setNewTapName("")
            setShowTapModal(false)
            loadTapList()
        } catch (e: any) {
            Toast.error("网卡创建失败", e.message || e)
        } finally {
            Toast.close(toastId)
        }
    }, [newTapName, loadTapList])

    const handleDeleteTap = useCallback(
        async (guid: string) => {
            const toastId = Toast.loading("正在删除虚拟网卡...")
            try {
                await Connections.deleteTap(guid)
                Toast.success("网卡已删除")
                loadTapList()
            } catch (e: any) {
                Toast.error("网卡删除失败", e.message || e)
            } finally {
                Toast.close(toastId)
            }
        },
        [loadTapList]
    )

    const handleRefreshTapList = useCallback(async () => {
        setRefreshing(true)
        try {
            await loadTapList()
            Toast.success("刷新成功")
        } catch (e: any) {
            Toast.error("刷新失败", e.message || e)
        } finally {
            setRefreshing(false)
        }
    }, [loadTapList])

    const handleDelete = useCallback(
        (vpnDetail: VPNDetail) => {
            setVpnData(vpnData.filter((v) => v.id !== vpnDetail.id))
        },
        [vpnData]
    )

    const tapColumns = [
        {
            title: "名称",
            dataIndex: "name",
            key: "name",
            render: (name: string) => <Tag color="teal">{name}</Tag>,
        },
        {
            title: "GUID",
            dataIndex: "guid",
            key: "guid",
            render: (guid: string) => (
                <Text style={{ fontSize: 12, color: "#999" }}>{guid}</Text>
            ),
        },
        {
            title: "操作",
            key: "action",
            render: (_: any, record: Adapter) => (
                <Button
                    type="secondary"
                    size="small"
                    danger
                    onClick={() => handleDeleteTap(record.guid!)}
                >
                    删除
                </Button>
            ),
        },
    ]

    return (
        <Layout>
            <Layout.Header
                style={{
                    background: "#fff",
                    padding: "12px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #ebe0eb",
                    marginBottom: 0,
                }}
            >
                <Typography.Title heading={4} style={{ margin: 0 }}>
                    iKunVPN
                </Typography.Title>
            </Layout.Header>

            {/* 主内容区 */}
            <Content style={{ padding: 24, background: "#fff" }}>
                <Card style={{ marginBottom: 16 }}>
                    <Tabs defaultActiveKey="0" type="card">
                        <Tabs.TabPane tab="虚拟网卡" itemKey="0">
                            <Space
                                style={{
                                    margin: "1rem 0",
                                }}
                            >
                                <Button
                                    loading={installingTap}
                                    size="small"
                                    onClick={handleInstallTap}
                                    theme="outline"
                                >
                                    安装TAP
                                </Button>
                                <Button
                                    size="small"
                                    loading={refreshing}
                                    onClick={handleRefreshTapList}
                                    theme="outline"
                                >
                                    刷新
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => setShowTapModal(true)}
                                >
                                    新建网卡
                                </Button>
                            </Space>
                            {tapList.length === 0 ? (
                                <Typography.Text
                                    type="tertiary"
                                    style={{
                                        display: "block",
                                        textAlign: "center",
                                        padding: "40px 0",
                                    }}
                                >
                                    暂无网卡，请先安装TAP驱动
                                </Typography.Text>
                            ) : (
                                <Table
                                    columns={tapColumns}
                                    dataSource={tapList}
                                    rowKey="guid"
                                    bordered
                                />
                            )}
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="服务器列表" itemKey="1">
                            <Space
                                style={{
                                    margin: "1rem 0",
                                }}
                            >
                                <Checkbox
                                    checked={autoReconnect}
                                    onChange={() =>
                                        setAutoReconnect(!autoReconnect)
                                    }
                                >
                                    自动重连
                                </Checkbox>
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={() => navigate("/create")}
                                >
                                    + 新增
                                </Button>
                            </Space>
                            <HomeVpnTable
                                data={vpnData}
                                onDelete={handleDelete}
                                autoReconnect={autoReconnect}
                            />
                        </Tabs.TabPane>
                    </Tabs>
                </Card>
            </Content>

            <Modal
                visible={showTapModal}
                onCancel={() => setShowTapModal(false)}
                onOk={handleCreateTap}
                title="创建虚拟网卡"
                okText="创建"
                cancelText="取消"
            >
                <Input
                    placeholder="网卡名称（英文）"
                    value={newTapName}
                    onChange={(val) => setNewTapName(val)}
                />
            </Modal>
        </Layout>
    )
}
