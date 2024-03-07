import { autoUpdater } from 'electron-updater'
import { app, dialog } from 'electron'
import Store from './store'
import { ProgramInfo } from './const'
import { ProgressInfo } from 'builder-util-runtime'
import { bytesToSize } from './utils'

export default function initUpdate() {
    //检测更新
    autoUpdater.checkForUpdates()

    //监听'error'事件
    autoUpdater.on("error", (err) => {
        console.log(err)
    })

    //监听'update-available'事件，发现有新版本时触发
    autoUpdater.on("update-available", () => {
        console.log("found new version")
        dialog
            .showMessageBox({
                type: "info",
                title: "应用更新",
                message: "发现新版本，是否下载更新？",
                buttons: ["是", "否"],
            })
            .then(async (buttonIndex) => {
                if (buttonIndex.response === 0) {
                    await autoUpdater.downloadUpdate()
                }
            })
    })

    //默认会自动下载新版本，如果不想自动下载，设置autoUpdater.autoDownload = false
    autoUpdater.autoDownload = false

    //监听'update-downloaded'事件，新版本下载完成时触发
    autoUpdater.on("update-downloaded", () => {
        dialog
            .showMessageBox({
                type: "info",
                title: "应用更新",
                message: "新版本已下载完成，是否更新？",
                buttons: ["是", "否"],
            })
            .then((buttonIndex) => {
                if (buttonIndex.response === 0) {
                    //选择是，则退出程序，安装新版本
                    autoUpdater.quitAndInstall()
                    app.quit()
                } else {
                    Store.MainWindow.title = ProgramInfo.title
                }
            })
    })
    //监听'update-downloaded'事件，新版本下载完成时触发
    autoUpdater.on("download-progress", (progressInfo: ProgressInfo) => {
        Store.MainWindow.title = `${ProgramInfo.title} 正在下载更新包 ${bytesToSize(progressInfo.bytesPerSecond)}/s | ${progressInfo.percent.toFixed(2)}% `
    })
}
