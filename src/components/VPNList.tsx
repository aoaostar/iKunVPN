import {
    Box,
    BoxProps,
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Stack,
    StackDivider,
    Tag,
    Text,
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { VPNDetail } from "../api/vpn.ts"
import { useCallback } from "react"
import Connect from "@/api/connect.ts"
import Toast from "@/utils/toast.ts"

type VPNListProps = {
    data: VPNDetail[]
    handleDelete: (item: VPNDetail) => void
}

export default function VPNList(props: VPNListProps & BoxProps) {
    const { data, handleDelete, ...restProps } = props
    const navigate = useNavigate()
    const handleConnect = useCallback((id: number) => {
        Connect.start(id)
            .then(() => {
                // Toast.success("连接成功")
            })
            .catch((e) => {
                Toast.error("连接失败", e.message)
            })
    }, [])

    return (
        <Box {...restProps}>
            <Card>
                <CardHeader>
                    <Box>服务器列表</Box>
                </CardHeader>

                <CardBody>
                    <Stack divider={<StackDivider />} spacing="4">
                        {data.map((value) => {
                            return (
                                <Flex justify={"space-between"} key={value.id}>
                                    <Box>
                                        <Tag variant="solid" colorScheme="teal">
                                            {value.mark}
                                        </Tag>
                                        <Tag>{value.username}</Tag>
                                    </Box>
                                    <ButtonGroup>
                                        <Button
                                            onClick={() =>
                                                handleConnect(value.id)
                                            }
                                        >
                                            <Text fontSize="xs">连接</Text>
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                navigate(`/detail/${value.id}`)
                                            }}
                                        >
                                            <Text fontSize="xs">修改</Text>
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                handleDelete(value)
                                            }}
                                        >
                                            <Text fontSize="xs">删除</Text>
                                        </Button>
                                    </ButtonGroup>
                                </Flex>
                            )
                        })}
                    </Stack>
                </CardBody>
            </Card>
        </Box>
    )
}
