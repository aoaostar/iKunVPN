import path from "path"
import { verbose } from "sqlite3"
import { RESOURCE_PATH } from "../const.ts"

const sqlite3 = verbose()
console.log(
    'path.join(RESOURCE_PATH, "extra/database.db")',
    path.join(RESOURCE_PATH, "extra/database.db")
)
const db = new sqlite3.Database(path.join(RESOURCE_PATH, "extra/database.db"))

export default class Db {
    static async all(sql: string, params = []) {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err)
                }
                resolve(rows)
            })
        })
    }

    static async get(sql: string, params: number[] = []) {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, rows) => {
                if (err) {
                    reject(err)
                }
                resolve(rows)
            })
        })
    }

    static async execute(sql: string, params: any = []) {
        return new Promise((resolve, reject) => {
            db.run(sql, params, (err: any, rows: any) => {
                if (err) {
                    reject(err)
                }
                resolve(rows)
            })
        })
    }

    static async delete(sql: string, params: number[] = []) {
        return await Db.execute(sql, params)
    }
}
