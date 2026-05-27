import { ConfigProvider } from "@douyinfe/semi-ui"
import { RouterProvider } from "react-router-dom"
import { globalRouters } from "./router"
import "@douyinfe/semi-ui/react19-adapter"

function App() {
    return (
        <ConfigProvider>
            <RouterProvider router={globalRouters} />
        </ConfigProvider>
    )
}

export default App
