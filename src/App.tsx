import { ConfigProvider } from "@douyinfe/semi-ui"
import { RouterProvider } from "react-router-dom"
import { globalRouters } from "./router"

function App() {
    return (
        <ConfigProvider>
            <RouterProvider router={globalRouters} />
        </ConfigProvider>
    )
}

export default App
