// import {
//     Box,
//     BoxProps,
//     Button,
//     Card,
//     CardBody,
//     Flex,
//     Progress,
//     Tag,
//     Text,
// } from "@chakra-ui/react"
// import { useCallback, useEffect, useState } from "react"
// import { Connections as ConnectApi, Status, StatusResponse } from "@/api/connections.ts"
// import Toast from "@/utils/toast.ts"
//
// export default function Connect(props: BoxProps) {
//     const [data, setData] = useState<StatusResponse>({
//         status: Status.Stop,
//         current: {
//             id: "",
//             mark: "",
//             username: "",
//             password: "",
//             ovpn: "",
//             otp_config: {
//                 secret: "",
//                 step: 0,
//             },
//         },
//     })
//
//     const [serverIp, setServerIp] = useState("")
//
//     useEffect(() => {
//         ConnectApi.status().then((r) => {
//             setData(r)
//         })
//     }, [])
//
//     useEffect(() => {
//         const regExp = new RegExp(/remote (\b(?:\d{1,3}\.){3}\d{1,3}\b) /g)
//         const regExpExecArray = regExp.exec(data.current.ovpn)
//         if (regExpExecArray && regExpExecArray.length > 1) {
//             setServerIp(regExpExecArray[1])
//         }
//     }, [data])
//     let isDisconnect = false
//
//     useEffect(() => {
//         const func = (r: StatusResponse) => {
//             r.status === Status.Success && Toast.success("连接成功")
//
//             r.status === Status.Error &&
//                 !isDisconnect &&
//                 Toast.error("连接已断开")
//             setData(r)
//             console.log(r)
//         }
//         ConnectApi.receive(func).then()
//         return () => {
//             ConnectApi.removeAllListeners().then()
//         }
//     }, [])
//
//     const handleStop = useCallback(() => {
//         isDisconnect = true
//         ConnectApi.stop()
//             .catch((e) => {
//                 Toast.error("操作失败", e.message)
//             })
//             .finally(() => (isDisconnect = false))
//     }, [])
//     const handleConnect = useCallback((id: string) => {
//         if (!id) {
//             Toast.warning("连接失败", "请选择连接")
//             return
//         }
//         ConnectApi.start(id).catch((e) => {
//             Toast.error("操作失败", e.message)
//         })
//     }, [])
//     return (
//         <Box {...props}>
//             <Card>
//                 {data.status == Status.Connecting && (
//                     <Progress size="xs" isIndeterminate />
//                 )}
//
//                 <CardBody>
//                     <Flex alignItems="center" gap=".5rem">
//                         {data.status == Status.Success && (
//                             <>
//                                 <Tag variant="solid" colorScheme="teal">
//                                     {serverIp}
//                                 </Tag>
//                                 <Tag variant="solid" colorScheme="teal">
//                                     已连接
//                                 </Tag>
//                                 <Button onClick={handleStop}>
//                                     <Text fontSize="xs">断开</Text>
//                                 </Button>
//                             </>
//                         )}
//                         {[Status.Error, Status.Stop].includes(data.status) && (
//                             <>
//                                 <Tag variant="solid" colorScheme="teal">
//                                     未连接
//                                 </Tag>
//                                 <Button
//                                     onClick={() =>
//                                         handleConnect(data.current.id)
//                                     }
//                                 >
//                                     <Text fontSize="xs">连接</Text>
//                                 </Button>
//                             </>
//                         )}
//                         {data.status == Status.Connecting && (
//                             <>
//                                 <Tag variant="solid" colorScheme="teal">
//                                     连接中
//                                 </Tag>
//                                 <Button onClick={handleStop}>
//                                     <Text fontSize="xs">断开</Text>
//                                 </Button>
//                             </>
//                         )}
//                     </Flex>
//                 </CardBody>
//             </Card>
//         </Box>
//     )
// }
