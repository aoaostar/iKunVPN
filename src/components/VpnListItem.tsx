import {
    Tag,
    Button,
    Space,
    Spin,
    Modal,
} from '@douyinfe/semi-ui';
import { Vpn, VPNDetail } from "@/api/vpn.ts"
import { useCallback, useEffect, useState } from "react"
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
    const [status, setStatus] = useState(Status.Stop)
    const [serverIp, setServerIp] = useState("")

    const navigate = useNavigate()
    const [modalVisible, setModalVisible] = useState(false)

    const handleConnect = useCallback(async () => {
        if (status === Status.Connecting) {
            return
        }
        setStatus(Status.Connecting)

        try {
            const r = await Connections.connect(vpnDetail.id)
            setStatus(r.status)
            Toast.success("连接成功")
        } catch (e: any) {
            Toast.error("连接失败", e.message)
        }
    }, [status, vpnDetail.id])

    const handleDisConnect = useCallback(async () => {
        try {
            const r = await Connections.disconnect(vpnDetail.id)
            setStatus(r.status)
            Toast.success("操作成功")
        } catch (e: any) {
            Toast.error("操作失败", e.message)
        }
    }, [vpnDetail.id])

    const handleDelete = useCallback(() => {
        Vpn.delete(vpnDetail.id)
            .then((_ : any) => {
                ParentHandleDelete(vpnDetail)
                Toast.success("删除成功", "")
            })
            .catch((e: any) => {
                Toast.error("删除失败", e.message)
            })
    }, [vpnDetail.id, ParentHandleDelete])

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
            setStatus(r)
        })
    }, [vpnDetail.id])

    useEffect(() => {
        const interval = setInterval(async () => {
            if (autoReconnect && status === Status.Error) {
                await handleConnect()
            }
        }, 5 * 1000)
        return () => {
            clearInterval(interval)
        }
    }, [status, autoReconnect, handleConnect])

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
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid #f0f0f0',
            }}>
                {/* 左侧：信息区 */}
                <Space size="medium">
                    <Tag color="teal" style={{ fontSize: 13 }}>{vpnDetail.mark}</Tag>
                    <span style={{ color: '#666' }}>{vpnDetail.username}</span>
                    {serverIp && (
                        <Tag color="teal" style={{ fontSize: 12 }}>{serverIp}</Tag>
                    )}
                    {status === Status.Connecting && (
                        <Spin size="small" />
                    )}
                </Space>

                {/* 右侧：状态 & 操作区 */}
                <Space size="small">
                    {/* 状态标签 */}
                    <span style={{ minWidth: 60, textAlign: 'center' }}>
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
                    <Button size="small" onClick={() => navigate(`/detail/${vpnDetail.id}`)}>
                        修改
                    </Button>
                    <Button size="small" onClick={() => setModalVisible(true)}>
                        日志
                    </Button>
                    <Button size="small" danger onClick={handleDelete}>
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
                <Console vpnId={vpnDetail.id}></Console>
            </Modal>
        </>
    )
}
