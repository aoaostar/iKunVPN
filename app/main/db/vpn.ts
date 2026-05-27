import Db from "./db.ts"
import { VPNSchema } from "./schemas"
import { nanoid } from "nanoid"

export default class Vpn {
    static async all() {
        return Db.data.vpn
    }

    static async get(id: string) {
        return Db.data.vpn.find((v) => v.id === id)
    }

    static async create(item: Omit<VPNSchema, "id">): Promise<VPNSchema> {
        const newItem = {
            ...item,
            id: nanoid(),
        }
        Db.data.vpn.push(newItem)
        await Db.write()
        return newItem
    }

    static async update(id: string, item: Omit<VPNSchema, "id">) {
        console.log("update",item)
        Db.data.vpn = Db.data.vpn.map((v) => (v.id === id ? { ...v, ...item } : v))
        await Db.write()
    }

    static async delete(id: string) {
        Db.data.vpn = Db.data.vpn.filter((obj) => obj.id !== id)
        await Db.write()
    }
}
