import { useNavigate } from "react-router-dom"
import { useCallback } from "react"
import { useImmer } from "use-immer"
import Vpn, { VpnCreate } from "../api/vpn.ts"
import Toast from "../utils/toast.ts"
import VPNForm from "@/components/VPNForm.tsx"

export default function Create() {
    const [data, updateData] = useImmer<VpnCreate>({
        mark: "",
        otp_config: {
            secret: "",
            step: 30,
        },
        ovpn: "",
        password: "",
        username: "",
    })
    const navigate = useNavigate()

    const handleSave = useCallback((item: VpnCreate) => {
        Vpn.create(item)
            .then(() => {
                Toast.success("成功", "新增成功")
                navigate("/")
            })
            .catch((e) => {
                Toast.error("创建失败", e.message)
            })
    }, [])
    const handleCancel = useCallback(() => {
        navigate("/")
    }, [])

    return (
        <>
            <VPNForm
                title="新增"
                data={data}
                updateData={updateData}
                handleSave={handleSave}
                handleCancel={handleCancel}
            ></VPNForm>
        </>
    )
}
