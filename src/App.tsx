import { ChakraProvider, Container } from "@chakra-ui/react"
import { RouterProvider } from "react-router-dom"
import { globalRouters } from "./router"

function App() {
    return (
        <ChakraProvider>
            <Container maxW="container.xl">
                <RouterProvider router={globalRouters}></RouterProvider>
            </Container>
        </ChakraProvider>
    )
}

export default App
