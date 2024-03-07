import { createHashRouter } from "react-router-dom"
import Home from "../pages/Home.tsx"
import Detail from "../pages/Detail.tsx"
import Create from "../pages/Create.tsx"

export const globalRouters = createHashRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/detail/:id",
        element: <Detail />,
    },
    {
        path: "/create",
        element: <Create />,
    },
])
