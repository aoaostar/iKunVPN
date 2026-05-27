import { createHashRouter } from "react-router-dom"
import Home from "@/pages/Home.tsx"
import Detail from "@/pages/Detail.tsx"
import Create from "@/pages/Create.tsx"
import { Layout } from "@/components/Layout.tsx"
import KeepAlive from "keepalive-for-react"

export const globalRouters = createHashRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: (
                    <KeepAlive activeCacheKey={"Home"}>
                        <Home />
                    </KeepAlive>
                ),
            },
            {
                path: "/detail/:id",
                element: <Detail />,
            },
            {
                path: "/create",
                element: <Create />,
            },
        ],
    },
])
