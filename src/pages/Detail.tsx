import { useNavigate, useParams } from "react-router-dom"
import { useCallback, useEffect } from "react"
import { useImmer } from "use-immer"
import Vpn, { VPNDetail } from "../api/vpn.ts"
import Toast from "../utils/toast.ts"
import VPNForm from "@/components/VPNForm.tsx"

export default function Detail() {
    const [data, updateData] = useImmer<VPNDetail>({
        id: 0,
        mark: "",
        otp_config: {
            secret: "",
            step: 30,
        },
        ovpn: "",
        password: "",
        username: "",
    })

    const { id } = useParams<{ id: string }>()
    if (!id) {
        return <div>id 不得为空</div>
    }
    useEffect(() => {
        Vpn.get(+id).then((resp) => {
            updateData(resp)
        })
    }, [])
    const navigate = useNavigate()

    const handleSave = useCallback((item: VPNDetail) => {
        console.log(item)
        Vpn.update(item.id, item)
            .then(() => {
                Toast.success("保存成功")
                navigate("/")
            })
            .catch((e) => {
                Toast.error("保存失败", e.message)
            })
    }, [])

    const handleCancel = useCallback(() => {
        navigate("/")
    }, [])

    return (
        <>
            <VPNForm
                title="修改"
                data={data}
                updateData={updateData}
                handleSave={handleSave}
                handleCancel={handleCancel}
            ></VPNForm>
        </>
    )
}
