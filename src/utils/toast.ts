import { createStandaloneToast, ToastId } from "@chakra-ui/react"

const { toast } = createStandaloneToast({
    defaultOptions: {
        position: "top-right",
        duration: 2000,
        isClosable: true,
    },
})

const Toast = {
    toast: toast,
    success(title: string, message: string = "") {
        return toast({
            title: title,
            description: message,
            status: "success",
        })
    },
    error(title: string, message: string = "") {
        return toast({
            title: title,
            description: message,
            status: "error",
        })
    },
    warning(title: string, message: string = "") {
        return toast({
            title: title,
            description: message,
            status: "warning",
        })
    },
    info(title: string, message: string = "") {
        return toast({
            title: title,
            description: message,
            status: "info",
        })
    },
    loading(title: string, message: string = "") {
        return toast({
            title: title,
            description: message,
            status: "loading",
            duration: null,
        })
    },
    close(id: ToastId) {
        return toast.close(id)
    },
}
export default Toast
