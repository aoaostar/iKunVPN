import KeepAliveRouteOutlet from "keepalive-for-react-router"

export function Layout() {
    return (
        <div className="layout">
            <KeepAliveRouteOutlet />
        </div>
    )
}
