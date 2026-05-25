import path from "path"
import { app } from "electron"

export const IS_PRODUCTION = !Boolean(process.env.VITE_DEV_SERVER_URL)
export const ROOT_PATH = IS_PRODUCTION
    ? path.dirname(path.dirname(app.getAppPath()))
    : app.getAppPath()
export const RESOURCE_PATH = IS_PRODUCTION
    ? path.dirname(app.getAppPath())
    : ROOT_PATH

export const ProgramInfo = {
    title: "iKunVPN",
}
export const USER_DATA_PATH = app.getPath("userData")
export const RUNTIME_PATH = path.resolve(USER_DATA_PATH, `runtime`)
