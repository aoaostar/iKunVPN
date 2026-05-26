import {
    Badge,
    Box,
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    Checkbox,
    Flex,
    Heading,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Text,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
} from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"
import { Vpn, VPNDetail } from "@/api/vpn.ts"
import VPNList from "@/components/VPNList.tsx"
import { useNavigate } from "react-router-dom"
import Connections from "@/api/connections.ts"
import type { Adapter } from "@/types/adapter"
import Toast from "@/utils/toast.ts"
import { executeCommand } from "../../app/main/utils.ts"

export default function Home() {
    const [vpnData, setVpnData] = useState<VPNDetail[]>([])
    const [autoReconnect, setAutoReconnect] = useState(false)
    const [installingTap, setInstallingTap] = useState(false)
    const [tapList, setTapList] = useState<Adapter[]>([])
    const [showTapModal, setShowTapModal] = useState(false)
    const [newTapName, setNewTapName] = useState("")
    const [refreshing, setRefreshing] = useState(false)

    const navigate = useNavigate()

    const loadTapList = useCallback(async () => {
        try {
            const list = await Connections.listTaps()
            setTapList(list)
        } catch (e: any) {
            Toast.error("获取网卡列表失败", e.message || e)
        }
    }, [])

    const handleInstallTap = useCallback(async () => {
        setInstallingTap(true)
        try {
            await Connections.installTap()
            Toast.success("TAP 驱动安装成功")
            loadTapList()
        } catch (e: any) {
            Toast.error("TAP 驱动安装失败", e.message || e)
        } finally {
            setInstallingTap(false)
        }
    }, [loadTapList])

    const handleCreateTap = useCallback(async () => {
        if (!newTapName.trim()) {
            Toast.error("请输入网卡名称")
            return
        }
        const toastId = Toast.loading("正在创建虚拟网卡...")
        try {
            await Connections.createTap(newTapName.trim())
            Toast.success("网卡创建成功")
            setNewTapName("")
            setShowTapModal(false)
            loadTapList()
        } catch (e: any) {
            Toast.error("网卡创建失败", e.message || e)
        }finally {
            Toast.close(toastId)
        }
    }, [newTapName, loadTapList])

    const handleDeleteTap = useCallback(async (guid: string) => {
        const toastId = Toast.loading("正在删除虚拟网卡...")
        try {
            await Connections.deleteTap(guid)
            Toast.success("网卡已删除")
            loadTapList()
        } catch (e: any) {
            Toast.error("网卡删除失败", e.message || e)
        }finally {
            Toast.close(toastId)
        }
    }, [loadTapList])

    const handleRefreshTapList = useCallback(async () => {
        setRefreshing(true)
        try {
            await loadTapList()
            Toast.success("刷新成功")
        } catch (e: any) {
            Toast.error("刷新失败", e.message || e)
        } finally {
            setRefreshing(false)
        }
    }, [loadTapList])

    useEffect(() => {
        Vpn.all().then((data) => {
            setVpnData(data)
        })
    }, [])

    useEffect(() => {
        loadTapList()
    }, [loadTapList])

    const handleDelete = useCallback(
        (vpnDetail: VPNDetail) => {
            setVpnData(vpnData.filter((v) => v.id !== vpnDetail.id))
        },
        [vpnData]
    )

        return (
            <>
                <Card mt=".5rem">
                    <CardBody>
                        <Flex justify="space-between">
                            <Heading size="md">iKunVPN</Heading>
                            <ButtonGroup>
                                <Checkbox
                                    isChecked={autoReconnect}
                                    onChange={(e) =>
                                        setAutoReconnect(e.target.checked)
                                    }
                                >
                                    <Text fontSize="xs">自动重连</Text>
                                </Checkbox>
                                <Button
                                    onClick={handleInstallTap}
                                    isLoading={installingTap}
                                >
                                    <Text fontSize="xs">安装TAP</Text>
                                </Button>
                                <Button
                                    onClick={() => {
                                        navigate("/create")
                                    }}
                                >
                                    <Text fontSize="xs">新增</Text>
                                </Button>
                            </ButtonGroup>
                        </Flex>
                    </CardBody>
                </Card>

                <Card mt=".5rem">
                    <Tabs>
                        <TabList>
                            <Tab>虚拟网卡</Tab>
                            <Tab>服务器列表</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <Flex justify="space-between" mb={2}>
                                    <Box>虚拟网卡</Box>
                                    <ButtonGroup size="xs">
                                        <Button
                                            size="xs"
                                            onClick={handleRefreshTapList}
                                            isLoading={refreshing}
                                        >
                                            刷新
                                        </Button>
                                        <Button
                                            size="xs"
                                            onClick={() =>
                                                setShowTapModal(true)
                                            }
                                        >
                                            新建
                                        </Button>
                                    </ButtonGroup>
                                </Flex>
                                {tapList.length === 0 ? (
                                    <Text color="gray.500">
                                        暂无网卡，请先安装TAP驱动
                                    </Text>
                                ) : (
                                    <Table size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th>名称</Th>
                                                <Th>GUID</Th>
                                                <Th>操作</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {tapList.map((tap) => (
                                                <Tr key={tap.guid}>
                                                    <Td>
                                                        <Badge colorScheme="teal">
                                                            {tap.name}
                                                        </Badge>
                                                    </Td>
                                                    <Td
                                                        fontSize="xs"
                                                        color="gray.500"
                                                    >
                                                        {tap.guid}
                                                    </Td>
                                                    <Td>
                                                        <Button
                                                            size="xs"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleDeleteTap(
                                                                    tap.guid!
                                                                )
                                                            }
                                                        >
                                                            删除
                                                        </Button>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                )}
                            </TabPanel>

                            <TabPanel p={0}>
                                <VPNList
                                    data={vpnData}
                                    handleDelete={handleDelete}
                                    autoReconnect={autoReconnect}
                                ></VPNList>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Card>

                <Modal
                    isOpen={showTapModal}
                    onClose={() => setShowTapModal(false)}
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>创建虚拟网卡</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Input
                                placeholder="网卡名称（英文）"
                                value={newTapName}
                                onChange={(e) => setNewTapName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleCreateTap()
                                    }
                                }}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                colorScheme="teal"
                                onClick={handleCreateTap}
                                mr={3}
                            >
                                创建
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setShowTapModal(false)}
                            >
                                取消
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </>
        )
}
