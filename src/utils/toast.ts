import { createStandaloneToast } from "@chakra-ui/react"

const { toast } = createStandaloneToast({
    defaultOptions: {
        position: "top-right",
        duration: 2000,
        isClosable: true,
    },
})

const Toast = {
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
}
export default Toast
