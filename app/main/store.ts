import { BrowserWindow } from "electron"

type StoreType = {
    MainWindow: BrowserWindow
}
const Store: StoreType = {
    MainWindow: null as unknown as BrowserWindow,
}

export default Store
