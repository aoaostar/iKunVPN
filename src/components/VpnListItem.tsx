import {
    Tag,
    Button,
    Space,
    Spin,
    Modal,
} from '@douyinfe/semi-ui';
import { Vpn, VPNDetail } from "@/api/vpn.ts"
import { useCallback, useEffect, useRef, useState } from "react"
import Connections, { Status, StatusNotification } from "@/api/connections.ts"
import Toast from "@/utils/toast.ts"
import { useNavigate } from "react-router-dom"
import Console from "@/components/Console.tsx"

export default function VpnListItem({
    vpnDetail,
    handleDelete: ParentHandleDelete,
    autoReconnect,
}: {
    vpnDetail: VPNDetail
    handleDelete: (vpnDetail: VPNDetail) => void
    autoReconnect: boolean
}) {
    const [status, setStatus] = useState<Status>(Status.Stop)
    const [serverIp, setServerIp] = useState("")
    const statusRef = useRef<Status>(Status.Stop)

    // 保持 statusRef 与 status 状态同步
    useEffect(() => {
        statusRef.current = status
    }, [status])

    const navigate = useNavigate()
    const [modalVisible, setModalVisible] = useState(false)

    const handleConnect = useCallback(async () => {
        if (statusRef.current === Status.Connecting) {
            return
        }
        statusRef.current = Status.Connecting
        setStatus(Status.Connecting)

        try {
            const r = await Connections.connect(vpnDetail.id)
            if (r.status === Status.Success) {
                statusRef.current = Status.Success
                setStatus(Status.Success)
                Toast.success("连接成功")
            }
        } catch (e: unknown) {
            statusRef.current = Status.Error
            setStatus(Status.Error)
            Toast.error("连接失败", e instanceof Error ? e.message : String(e))
        }
    }, [vpnDetail.id])

    const handleDisConnect = useCallback(async () => {
        statusRef.current = Status.Connecting
        setStatus(Status.Connecting)
        try {
            await Connections.disconnect(vpnDetail.id)
            statusRef.current = Status.Stop
            setStatus(Status.Stop)
            Toast.success("操作成功")
        } catch (e: unknown) {
            statusRef.current = Status.Error
            setStatus(Status.Error)
            Toast.error("操作失败", e instanceof Error ? e.message : String(e))
        }
    }, [vpnDetail.id])

    const handleDelete = useCallback(() => {
        Vpn.delete(vpnDetail.id)
            .then((_ : unknown) => {
                ParentHandleDelete(vpnDetail)
                Toast.success("删除成功", "")
            })
            .catch((e: unknown) => {
                Toast.error("删除失败", e instanceof Error ? e.message : String(e))
            })
    }, [vpnDetail.id, ParentHandleDelete])

    useEffect(() => {
        const func = (r: StatusNotification) => {
            if (r.current.id !== vpnDetail.id) {
                return
            }
            const newStatus = r.status
            statusRef.current = newStatus
            setStatus(newStatus)

            switch (r.status) {
                case Status.Error:
                    Toast.error("连接已断开")
                    break
            }
        }
        const cleanup = Connections.receive(func)
        return () => cleanup?.()
    }, [vpnDetail.id])

    useEffect(() => {
        const regExp = new RegExp(/remote (\b(?:\d{1,3}\.){3}\d{1,3}\b) /g)
        const regExpExecArray = regExp.exec(vpnDetail.ovpn)
        if (regExpExecArray && regExpExecArray.length > 1) {
            setServerIp(regExpExecArray[1])
        }
    }, [vpnDetail.ovpn])

    useEffect(() => {
        Connections.status(vpnDetail.id).then((r: Status) => {
            statusRef.current = r
            setStatus(r)
        })
    }, [vpnDetail.id])

    useEffect(() => {
        const interval = setInterval(async () => {
            if (autoReconnect && statusRef.current === Status.Error) {
                await handleConnect()
            }
        }, 5 * 1000)
        return () => {
            clearInterval(interval)
        }
    }, [autoReconnect, handleConnect])

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
                    padding: "12px 0",
                    borderBottom: "1px solid #f0f0f0",
                }}
            >
                {/* 左侧：信息区 */}
                <Space>
                    <Tag color="teal" style={{ fontSize: 13 }}>
                        {vpnDetail.mark}
                    </Tag>
                    <span style={{ color: "#666" }}>{vpnDetail.username}</span>
                    {serverIp && (
                        <Tag color="teal" style={{ fontSize: 12 }}>
                            {serverIp}
                        </Tag>
                    )}
                    {status === Status.Connecting && <Spin size="small" />}
                </Space>

                {/* 右侧：状态 & 操作区 */}
                <Space >
                    {/* 状态标签 */}
                    <span style={{ minWidth: 60, textAlign: "center" }}>
                        {getStatusTag()}
                    </span>

                    {/* 连接/断开按钮 */}
                    {status === Status.Success && (
                        <Button
                            size="small"
                            onClick={handleDisConnect}
                            theme="outline"
                        >
                            断开
                        </Button>
                    )}
                    {[Status.Error, Status.Stop].includes(status) && (
                        <Button
                            size="small"
                            type="primary"
                            onClick={handleConnect}
                        >
                            连接
                        </Button>
                    )}
                    {status === Status.Connecting && (
                        <Button
                            size="small"
                            theme="outline"
                            onClick={handleDisConnect}
                        >
                            取消
                        </Button>
                    )}

                    {/* 工具按钮 */}
                    <Button
                        size="small"
                        onClick={() => navigate(`/detail/${vpnDetail.id}`)}
                    >
                        修改
                    </Button>
                    <Button size="small" onClick={() => setModalVisible(true)}>
                        日志
                    </Button>
                    <Button size="small" type="danger" onClick={handleDelete}>
                        删除
                    </Button>
                </Space>
            </div>

            <Modal
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => setModalVisible(false)}
                footer={null}
                title="日志"
                size="large"
                modalRender={(node) => (
                    <div style={{ maxWidth: '90vw' }}>
                        {node}
                    </div>
                )}
            >
                <Console vpnId={vpnDetail.id} visible={modalVisible}></Console>
            </Modal>
        </>
    )
}
