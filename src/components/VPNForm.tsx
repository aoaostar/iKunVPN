import { useEffect, useRef, useState } from "react"
import { Updater } from "use-immer"
import { VpnCreate } from "@/api/vpn.ts"
import {
    Box,
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    Center,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Text,
} from "@chakra-ui/react"
import { useFormik } from "formik"

type Props<T extends VpnCreate> = {
    title: string
    data: T
    updateData: Updater<T>
    handleSave: (item: T) => void
    handleCancel: () => void
}

export default function VPNForm<T extends VpnCreate>({
    title,
    data,
    updateData,
    handleSave,
    handleCancel,
}: Props<T>) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [ovpnFilename, setOvpnFilename] = useState("")

    const formik = useFormik({
        initialValues: data,

        onSubmit: (values, _) => {
            handleSave(values)
        },
    })

    useEffect(() => {
        formik.setValues(data)
    }, [data, formik.setValues])

    return (
        <>
            <Card>
                <CardHeader>
                    <Box>{title}</Box>
                </CardHeader>

                <CardBody>
                    <form onSubmit={formik.handleSubmit}>
                        <FormControl isRequired>
                            <FormLabel>备注</FormLabel>
                            <Input
                                placeholder="备注"
                                value={formik.values.mark}
                                onChange={(e) => {
                                    updateData((draft) => {
                                        draft.mark = e.target.value
                                    })
                                }}
                            />
                            {formik.touched.mark && formik.errors.mark && (
                                <FormErrorMessage>
                                    {formik.errors.mark as string}
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl isRequired mt="1rem">
                            <FormLabel>用户名</FormLabel>
                            <Input
                                placeholder="用户名"
                                value={formik.values.username}
                                onChange={(e) => {
                                    updateData((draft) => {
                                        draft.username = e.target.value
                                    })
                                }}
                            />
                            {formik.touched.username &&
                                formik.errors.username && (
                                    <FormErrorMessage>
                                        {formik.errors.username as string}
                                    </FormErrorMessage>
                                )}
                        </FormControl>
                        <FormControl isRequired mt="1rem">
                            <FormLabel>密码</FormLabel>
                            <Input
                                type="password"
                                placeholder="密码"
                                value={formik.values.password}
                                onChange={(e) => {
                                    updateData((draft) => {
                                        draft.password = e.target.value
                                    })
                                }}
                            />
                            {formik.touched.password &&
                                formik.errors.password && (
                                    <FormErrorMessage>
                                        {formik.errors.password as string}
                                    </FormErrorMessage>
                                )}
                        </FormControl>
                        <FormControl mt="1rem">
                            <FormLabel>.ovpn文件</FormLabel>
                            <Flex>
                                <Button
                                    colorScheme="teal"
                                    variant="outline"
                                    onClick={() => {
                                        fileInputRef.current?.click()
                                    }}
                                >
                                    <Text fontSize="1rem">选择文件</Text>
                                </Button>
                                <Center marginLeft="1rem">
                                    {ovpnFilename}
                                </Center>
                            </Flex>
                            <Input
                                ref={fileInputRef}
                                style={{
                                    display: "none",
                                }}
                                type="file"
                                accept=".ovpn"
                                name="file"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0]
                                        file.text().then((r) => {
                                            const filename: string =
                                                "path" in file
                                                    ? file.path as string
                                                    : file.name
                                            setOvpnFilename(filename)
                                            updateData((draft) => {
                                                draft.ovpn = r
                                            })
                                        })
                                    }
                                }}
                            />
                        </FormControl>
                        <FormControl mt="1rem">
                            <FormLabel>OTP Secret</FormLabel>
                            <Input
                                placeholder="密码"
                                value={formik.values.otp_config.secret}
                                onChange={(e) => {
                                    updateData((draft) => {
                                        draft.otp_config.secret = e.target.value
                                    })
                                }}
                            />
                        </FormControl>
                        <FormControl mt="1rem">
                            <FormLabel>OTP Step</FormLabel>
                            <NumberInput
                                min={0}
                                value={formik.values.otp_config.step}
                                onChange={(value) => {
                                    updateData((draft) => {
                                        draft.otp_config.step = Number(value)
                                    })
                                }}
                            >
                                <NumberInputField placeholder="OTP Step" />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>
                        <ButtonGroup mt="1rem">
                            <Button colorScheme="teal" type="submit">
                                保存
                            </Button>
                            <Button onClick={handleCancel}>取消</Button>
                        </ButtonGroup>
                    </form>
                </CardBody>
            </Card>
        </>
    )
}
