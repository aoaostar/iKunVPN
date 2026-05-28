import { useNavigate, useParams } from "react-router-dom"
import { useCallback, useEffect } from "react"
import { useImmer } from "use-immer"
import Vpn, { VPNDetail } from "@/api/vpn.ts"
import type { FormValues } from "@/components/VPNForm.tsx"
import Toast from "@/utils/toast.ts"
import VPNForm from "@/components/VPNForm.tsx"

export default function Detail() {
    const [data, updateData] = useImmer<VPNDetail>({
        id: "",
        mark: "",
        otp_config: {
            secret: "",
            step: 120,
        },
        config: {
            executable: "",
            adapter: "",
        },
        ovpn: "",
        password: "",
        username: "",
    })

    const navigate = useNavigate()

    const handleSave = useCallback(
        (item: FormValues) => {
            Vpn.update((item as VPNDetail).id, item as VPNDetail)
                .then(() => {
                    Toast.success("保存成功")
                    navigate("/")
                })
                .catch((e: unknown) => {
                    Toast.error("保存失败", e instanceof Error ? e.message : String(e))
                })
        },
        [navigate]
    )

    const handleCancel = useCallback(() => {
        navigate("/")
    }, [navigate])

    const { id } = useParams<{ id: string }>()
    useEffect(() => {
        if (typeof id === "string") {
            Vpn.get(id).then((resp) => {
                updateData(resp)
            })
        }
    }, [id, updateData])

    if (!id) {
        return <div>id 不得为空</div>
    }

    return (
        <VPNForm
            title="修改"
            data={data}
            updateData={updateData as import("use-immer").Updater<FormValues>}
            handleSave={(item: FormValues) => handleSave(item)}
            handleCancel={handleCancel}
        />
    )
}
