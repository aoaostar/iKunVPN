import {
    Button,
    Modal,
    Space,
    Spin,
    Table,
    Tag,
    Typography,
} from "@douyinfe/semi-ui"
import { Vpn, VPNDetail } from "@/api/vpn.ts"
import { useCallback, useEffect, useState } from "react"
import Connections, { Status, StatusNotification } from "@/api/connections.ts"
import Toast from "@/utils/toast.ts"
import { useNavigate } from "react-router-dom"
import Console from "@/components/Console.tsx"

function ActionCell({
    record,
    onDelete,
    autoReconnect,
}: {
    record: VPNDetail
    onDelete: (vpnDetail: VPNDetail) => void
    autoReconnect: boolean
}) {
    const [status, setStatus] = useState(Status.Stop)
    const [modalVisible, setModalVisible] = useState(false)
    const navigate = useNavigate()

    const doConnect = useCallback(async () => {
        if (status === Status.Connecting) return
        setStatus(Status.Connecting)
        try {
            const r = await Connections.connect(record.id)
            setStatus(r.status)
            Toast.success("连接成功")
        } catch (e: any) {
            Toast.error("连接失败", e.message)
        }
    }, [status, record.id])

    const doDisconnect = useCallback(async () => {
        try {
            const r = await Connections.disconnect(record.id)
            setStatus(r.status)
            Toast.success("操作成功")
        } catch (e: any) {
            Toast.error("操作失败", e.message)
        }
    }, [record.id])

    const doDelete = useCallback(() => {
        Vpn.delete(record.id)
            .then(() => {
                onDelete(record)
                Toast.success("删除成功")
            })
            .catch((e: any) => {
                Toast.error("删除失败", e.message)
            })
    }, [record.id, onDelete])

    useEffect(() => {
        const func = (r: StatusNotification) => {
            if (r.current.id !== record.id) return
            setStatus(r.status)
            if (r.status === Status.Error) {
                Toast.error("连接已断开")
            }
        }
        Connections.receive(func).then()
        return () => {
            Connections.removeAllListeners().then()
        }
    }, [record.id])

    useEffect(() => {
        Connections.status(record.id).then((r: Status) => setStatus(r))
    }, [record.id])

    useEffect(() => {
        const interval = setInterval(async () => {
            if (autoReconnect && status === Status.Error) {
                await doConnect()
            }
        }, 5 * 1000)
        return () => clearInterval(interval)
    }, [status, autoReconnect, doConnect])

    const getStatusTag = () => {
        switch (status) {
            case Status.Success:
                return <Tag color="green">已连接</Tag>
            case Status.Connecting:
                return <Tag color="blue">连接中</Tag>
            default:
                return <Tag>未连接</Tag>
        }
    }

    return (
        <>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {/* 左侧：状态 */}
                <Space align="center" style={{ minWidth: 120 }}>
                    {getStatusTag()}
                    {status === Status.Connecting && <Spin size="small" />}
                </Space>

                {/* 右侧：操作按钮 */}
                <Space size="small">
                    {status === Status.Success && (
                        <Button
                            size="small"
                            theme="outline"
                            onClick={doDisconnect}
                        >
                            断开
                        </Button>
                    )}
                    {[Status.Error, Status.Stop].includes(status) && (
                        <Button size="small" type="primary" onClick={doConnect}>
                            连接
                        </Button>
                    )}
                    {status === Status.Connecting && (
                        <Button
                            size="small"
                            theme="outline"
                            onClick={doDisconnect}
                        >
                            取消
                        </Button>
                    )}
                    <Button
                        size="small"
                        onClick={() => navigate(`/detail/${record.id}`)}
                    >
                        修改
                    </Button>
                    <Button size="small" onClick={() => setModalVisible(true)}>
                        日志
                    </Button>
                    <Button size="small" danger onClick={doDelete}>
                        删除
                    </Button>
                </Space>
            </div>

            <Modal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                footer={null}
                title="日志"
                size="large"
            >
                <Console vpnId={record.id} />
            </Modal>
        </>
    )
}

export default function HomeVpnTable({
    data,
    onDelete,
    autoReconnect,
}: {
    data: VPNDetail[]
    onDelete: (vpnDetail: VPNDetail) => void
    autoReconnect: boolean
}) {
    const columns = [
        {
            title: "备注",
            dataIndex: "mark",
            key: "mark",
            width: 100,
            render: (mark: string) => <Tag color="teal">{mark}</Tag>,
        },
        {
            title: "用户名",
            dataIndex: "username",
            key: "username",
            width: 120,
        },
        {
            title: "服务器IP",
            dataIndex: "ovpn",
            key: "ovpn",
            width: 150,
            render: (ovpn: string) => {
                const regExp = new RegExp(
                    /remote (\b(?:\d{1,3}\.){3}\d{1,3}\b) /g
                )
                const match = regExp.exec(ovpn)
                return match && match.length > 1 ? (
                    <Tag color="teal">{match[1]}</Tag>
                ) : (
                    <Typography.Text type="tertiary">-</Typography.Text>
                )
            },
        },
        {
            title: "状态 & 操作",
            key: "action",
            minWidth: 400,
            render: (_: undefined, record: VPNDetail) => (
                <ActionCell
                    record={record}
                    onDelete={onDelete}
                    autoReconnect={autoReconnect}
                />
            ),
        },
    ]

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            bordered
            size="middle"
        />
    )
}
