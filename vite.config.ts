import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import * as path from "path"
import electron from "vite-plugin-electron/simple"

const isProduction = !Boolean(process.env.VITE_DEV_SERVER_URL)

export default defineConfig({
    plugins: [
        react(),

        electron({
            main: {
                entry: "app/main/main.ts",
                vite: {
                    plugins: [],
                    build: {
                        outDir: "build/electron",
                        minify: isProduction,
                        rollupOptions: {
                            external: ["sqlite3"],
                        },
                    },
                },
            },
            preload: {
                input: "app/preload/preload.ts",
                vite: {
                    build: {
                        outDir: "build/electron",
                        minify: isProduction,
                    },
                },
            },
        }),
    ],
    base: "./",
    build: {
        outDir: "build/vite",
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
})
