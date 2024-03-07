import Db from "./db.ts"

export default class Vpn {
    static async all() {
        const data: any = await Db.all("select * from vpn")
        for (const d of data) {
            try {
                d.otp_config = JSON.parse(d.otp_config)
            } catch (e) {}
        }
        return data
    }

    static async get(id: number) {
        const data: any = await Db.get("select * from vpn where id = ?", [id])
        try {
            data.otp_config = JSON.parse(data.otp_config)
        } catch (e) {
            data.otp_config = {
                secret: "",
                step: 0,
            }
        }
        return data
    }

    static async create(params: any): Promise<any> {
        return await Db.execute(
            `
                insert into vpn (mark, username, password, ovpn, otp_config)
                values (?, ?, ?, ?, ?)
            `,
            [
                params.mark,
                params.username,
                params.password,
                params.ovpn,
                JSON.stringify(params.otp_config),
            ]
        )
    }

    static async update(id: number, params: any) {
        const data = await Db.execute(
            `
                update vpn
                set mark       = ?,
                    username   = ?,
                    password   = ?,
                    ovpn       = ?,
                    otp_config = ?
                where id = ?
            `,
            [
                params.mark,
                params.username,
                params.password,
                params.ovpn,
                JSON.stringify(params.otp_config),
                id,
            ]
        )
        return data
    }

    static async delete(id: number) {
        return await Db.delete(
            `
                delete
                from vpn
                where id = ?
            `,
            [id]
        )
    }
}
