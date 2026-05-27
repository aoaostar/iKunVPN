import { Toast } from "@douyinfe/semi-ui"

const ToastUtil = {
    success(content: string, description: string = "") {
        if (description) {
            Toast.success(`${content}: ${description}`)
        } else {
            Toast.success(content)
        }
    },
    error(content: string, description: string = "") {
        if (description) {
            Toast.error(`${content}: ${description}`)
        } else {
            Toast.error(content)
        }
    },
    warning(content: string, description: string = "") {
        if (description) {
            Toast.warning(`${content}: ${description}`)
        } else {
            Toast.warning(content)
        }
    },
    info(content: string, description: string = "") {
        if (description) {
            Toast.info(`${content}: ${description}`)
        } else {
            Toast.info(content)
        }
    },
    loading(content: string, _description: string = "") {
        return Toast.info({
            content,
            duration: 0,
        })
    },
    close(id: string) {
        Toast.close(id)
    },
}
export default ToastUtil
