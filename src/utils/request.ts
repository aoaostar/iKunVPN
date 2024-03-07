import axios from "axios"
import Toast from "./toast.ts"

const request = axios.create({
    baseURL: "/",
    timeout: 1000,
})

request.interceptors.response.use(
    function (response) {
        let data = response.data

        if (data.status !== "ok") {
            Toast.success("成功", data.message)
        }
        return data.data
    },
    function (error) {
        Toast.error("失败", error.message)
        return Promise.reject(error)
    }
)

export default request
