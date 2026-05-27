import { useCallback, useEffect, useRef, useState } from "react"
import { Updater } from "use-immer"
import { VpnCreate, VPNDetail } from "@/api/vpn.ts"
import {
    Card,
    Input,
    Button,
    Select,
    InputNumber,
    TextArea,
    Typography,
    Space,
} from "@douyinfe/semi-ui"
import Connections from "@/api/connections.ts"
import type { Adapter } from "@/types/adapter.ts"
import Toast from "@/utils/toast.ts"

const { Text, Title } = Typography

type Props = {
    title: string
    data: VPNDetail | VpnCreate
    updateData: Updater<VPNDetail | VpnCreate>
    handleSave: (item: VPNDetail | VpnCreate) => void
    handleCancel: () => void
}

export default function VPNForm({
    title,
    data,
    updateData,
    handleSave,
    handleCancel,
}: Props) {
    const [ovpnFilename, setOvpnFilename] = useState("")
    const [tapList, setTapList] = useState<Adapter[]>([])
    const [formValues, setFormValues] = useState(data)
    const [executablePath, setExecutablePath] = useState((data as any).config?.executable || "")
    const contentRef = useRef<HTMLDivElement>(null)

    const loadTapList = useCallback(async () => {
        try {
            const list = await Connections.listTaps()
            setTapList(list)
        } catch (e: any) {
            Toast.error("获取网卡列表失败", e.message || e)
        }
    }, [])

    useEffect(() => {
        loadTapList()
    }, [loadTapList])

    useEffect(() => {
        setFormValues(data)
        if ((data as VPNDetail).id) {
            setOvpnFilename("")
        }
        setExecutablePath((data as any).config?.executable || "")
    }, [data])

    const updateField = <K extends keyof (VPNDetail | VpnCreate)>(key: K, value: (VPNDetail | VpnCreate)[K]) => {
        updateData((draft) => {
            ;(draft as any)[key] = value
        })
        setFormValues((draft) => {
            return { ...draft, [key]: value } as VPNDetail | VpnCreate
        })
    }

    const updateNested = <K extends keyof (VPNDetail | VpnCreate), PK extends keyof (VPNDetail | VpnCreate)[K]>(parent: K, child: PK, value: any) => {
        updateData((draft) => {
            ;(draft as any)[parent][child] = value
        })
        setFormValues((draft) => {
            return {
                ...draft,
                [(parent as string)]: {
                    ...((draft as any)[parent]),
                    [(child as string)]: value,
                },
            } as VPNDetail | VpnCreate
        })
    }

    const handleSelectExecutable = async () => {
        try {
            const filePath = await window.electronAPI.dialog.showOpenDialog()
            if (filePath) {
                setExecutablePath(filePath)
                updateNested("config", "executable", filePath)
            }
        } catch (e: any) {
            Toast.error("选择文件失败", e.message || e)
        }
    }

    return (
        <div style={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
            <Card style={{ flex: 1, marginBottom: 0, borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', display: 'flex', flexDirection: 'column' }} title={title} bodyStyle={{ padding: '16px 24px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div
                    ref={contentRef}
                    style={{ flex: 1, overflowY: 'auto' }}
                >
                    {/* 基本信息 */}
                    <Title heading={5} type="primary" style={{ marginTop: 0, marginBottom: 16 }}>基本信息</Title>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>备注 <span style={{ color: "red" }}>*</span></div>
                        <Input
                            placeholder="请输入备注"
                            value={(formValues as any).mark}
                            onChange={(val: string) => updateField("mark", val)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>用户名 <span style={{ color: "red" }}>*</span></div>
                        <Input
                            placeholder="请输入用户名"
                            value={(formValues as any).username}
                            onChange={(val: string) => updateField("username", val)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>密码 <span style={{ color: "red" }}>*</span></div>
                        <Input
                            type="password"
                            placeholder="请输入密码"
                            value={(formValues as any).password}
                            onChange={(val: string) => updateField("password", val)}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ height: 16 }} />

                    {/* 配置文件 */}
                    <Title heading={5} type="primary" style={{ marginBottom: 16 }}>配置文件</Title>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>.ovpn文件</div>
                        <Space vertical align="start" style={{ width: '100%' }}>
                            <Space>
                                <Button type="secondary" theme="outline" onClick={() => {
                                    const input = document.createElement('input')
                                    input.type = 'file'
                                    input.accept = '.ovpn'
                                    input.onchange = (e: any) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0]
                                            file.text().then((r: string) => {
                                                const filename: string = "path" in file ? (file as any).path : file.name
                                                setOvpnFilename(filename)
                                                updateField("ovpn", r)
                                            })
                                        }
                                    }
                                    input.click()
                                }}>选择文件</Button>
                                <Text type="tertiary">{ovpnFilename}</Text>
                            </Space>
                            <TextArea
                                placeholder="粘贴OpenVPN配置内容"
                                rows={10}
                                value={(formValues as any).ovpn}
                                onChange={(val: string) => updateField("ovpn", val)}
                            />
                        </Space>
                    </div>

                    <div style={{ height: 16 }} />

                    {/* OTP设置 */}
                    <Title heading={5} type="primary" style={{ marginBottom: 16 }}>OTP设置（可选）</Title>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>OTP Secret</div>
                        <Input
                            placeholder="动态口令密钥"
                            value={(formValues as any).otp_config?.secret}
                            onChange={(val: string) => updateNested("otp_config", "secret", val)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>OTP Step</div>
                        <InputNumber
                            min={0}
                            value={(formValues as any).otp_config?.step}
                            onChange={(val: any) => updateNested("otp_config", "step", Number(val))}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ height: 16 }} />

                    {/* 高级设置 */}
                    <Title heading={5} type="primary" style={{ marginBottom: 16 }}>高级设置</Title>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>OpenVPN执行文件</div>
                        <Space>
                            <Input
                                placeholder="留空使用内置openvpn"
                                value={executablePath}
                                onChange={(val: string) => {
                                    setExecutablePath(val)
                                    updateNested("config", "executable", val)
                                }}
                                style={{ width: 300 }}
                            />
                            <Button type="secondary" theme="outline" onClick={handleSelectExecutable}>选择文件</Button>
                        </Space>
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>网卡</div>
                        <Select
                            value={(formValues as any).config?.adapter || "本地连接"}
                            onChange={(val: any) => updateNested("config", "adapter", val)}
                            style={{ width: '100%' }}
                        >
                            {tapList.map((tap) => (
                                <Select.Option key={tap.guid} value={tap.name}>{tap.name}</Select.Option>
                            ))}
                        </Select>
                    </div>
                </div>
            </Card>

            {/* 固定底部按钮 */}
            <div style={{ padding: '12px 24px', borderTop: '1px solid #e0e0e0', background: '#fff', textAlign: 'right' }}>
                <Space>
                    <Button size="large" onClick={handleCancel}>取消</Button>
                    <Button type="primary" size="large" onClick={() => handleSave(formValues)}>保存</Button>
                </Space>
            </div>
        </div>
    )
}
