import path from "path"
import {  USER_DATA_PATH } from "../const"
import { JSONFile } from "lowdb/node"
import { Low } from "lowdb"
import lodash from "lodash"
import { DatabaseSchema } from "./schemas"

const dbPath = path.join(USER_DATA_PATH, "db.json")

console.log("dbPath: ", dbPath)

class LowWithLodash<T> extends Low<T> {
    chain: lodash.ExpChain<this["data"]> = lodash.chain(this).get("data")
}

const defaultData: DatabaseSchema = {
    vpn: [],
}
const adapter = new JSONFile<DatabaseSchema>(dbPath)

const Db = new LowWithLodash(adapter, defaultData)

export const setup_db = async ()=>{
    await Db.read()
}
export default Db
