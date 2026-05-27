import { useCallback, useEffect, useRef, useState } from "react"
import { Updater } from "use-immer"
import { VpnCreate } from "@/api/vpn.ts"
import {
    Card,
    Form,
    Input,
    Button,
    Select,
    Space,
    InputNumber,
    TextArea,
} from '@douyinfe/semi-ui';
import { useFormik } from "formik"
import Connections from "@/api/connections.ts"
import type { Adapter } from "@/types/adapter.ts"
import Toast from "@/utils/toast.ts"

type Props<T extends VpnCreate> = {
    title: string
    data: T
    updateData: Updater<T>
    handleSave: (item: T) => void
    handleCancel: () => void
}

export default function VPNForm<T extends VpnCreate>({
    title,
    data,
    updateData,
    handleSave,
    handleCancel,
}: Props<T>) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [ovpnFilename, setOvpnFilename] = useState("")
    const [tapList, setTapList] = useState<Adapter[]>([])

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

    const FormItem = Form as any

    const formik = useFormik({
        initialValues: data,
        onSubmit: (values: T) => {
            handleSave(values)
        },
    })

    useEffect(() => {
        formik.setValues(data)
    }, [data, formik.setValues])

    return (
        <Card style={{ marginBottom: 16 }} title={title}>
            <Form onSubmit={() => formik.handleSubmit()} layout="vertical">
                <FormItem label="备注" required field="mark">
                    <Input
                        placeholder="备注"
                        defaultValue={formik.values.mark}
                        onChange={(val: string) => updateData((draft) => { (draft as any).mark = val })}
                    />
                    {formik.touched.mark && formik.errors.mark && (
                        <Form.ErrorMessage error={formik.errors.mark as string} />
                    )}
                </FormItem>
                <FormItem label="用户名" required field="username">
                    <Input
                        placeholder="用户名"
                        defaultValue={formik.values.username}
                        onChange={(val: string) => updateData((draft) => { (draft as any).username = val })}
                    />
                    {formik.touched.username && formik.errors.username && (
                        <Form.ErrorMessage error={formik.errors.username as string} />
                    )}
                </FormItem>
                <FormItem label="密码" required field="password">
                    <Input
                        type="password"
                        placeholder="密码"
                        style={{ width: '100%' }}
                        defaultValue={formik.values.password}
                        onChange={(val: string) => updateData((draft) => { (draft as any).password = val })}
                    />
                    {formik.touched.password && formik.errors.password && (
                        <Form.ErrorMessage error={formik.errors.password as string} />
                    )}
                </FormItem>
                <FormItem label=".ovpn文件">
                    <Space vertical style={{ width: '100%' }}>
                        <Space>
                            <Button type="secondary" theme="outline" onClick={() => fileInputRef.current?.click()}>
                                选择文件
                            </Button>
                            <span>{ovpnFilename}</span>
                        </Space>
                        <input
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            type="file"
                            accept=".ovpn"
                            name="file"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0]
                                    file.text().then((r) => {
                                        const filename: string = "path" in file ? (file as any).path : file.name
                                        setOvpnFilename(filename)
                                        updateData((draft) => { (draft as any).ovpn = r })
                                    })
                                }
                            }}
                        />
                        <TextArea
                            placeholder="OpenVPN配置"
                            style={{ width: '100%' }}
                            autosize
                            defaultValue={formik.values.ovpn}
                            rows={8}
                            onChange={(val: string) => updateData((draft) => { (draft as any).ovpn = val })}
                        />
                    </Space>
                </FormItem>
                <FormItem label="OTP Secret" field="otp_secret">
                    <Input
                        placeholder="OTP Secret"
                        style={{ width: '100%' }}
                        defaultValue={formik.values.otp_config.secret}
                        onChange={(val: string) => updateData((draft) => { (draft as any).otp_config.secret = val })}
                    />
                </FormItem>
                <FormItem label="OTP Step" field="otp_step">
                    <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        defaultValue={formik.values.otp_config.step}
                        onChange={(val: any) => updateData((draft) => { (draft as any).otp_config.step = Number(val) })}
                    />
                </FormItem>
                <FormItem label="OpenVPN执行文件" field="exec">
                    <Input
                        placeholder="留空使用自带的openvpn"
                        style={{ width: '100%' }}
                        defaultValue={formik.values.config.executable}
                        onChange={(val: string) => updateData((draft) => { (draft as any).config.executable = val })}
                    />
                </FormItem>
                <FormItem label="网卡" field="adapter">
                    <Select
                        placeholder="留空使用默认"
                        style={{ width: '100%' }}
                        defaultValue={formik.values.config.adapter}
                        onChange={(val: any) => updateData((draft) => { (draft as any).config.adapter = val })}
                    >
                        {tapList.map((tap) => (
                            <Select.Option key={tap.guid} value={tap.name}>{tap.name}</Select.Option>
                        ))}
                    </Select>
                </FormItem>
                <FormItem>
                    <Space>
                        <Button type="primary" htmlType="submit">保存</Button>
                        <Button onClick={handleCancel}>取消</Button>
                    </Space>
                </FormItem>
            </Form>
        </Card>
    )
}
