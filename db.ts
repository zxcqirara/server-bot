import * as sqlite3 from "sqlite3"
import { open } from 'sqlite'

export const makeGet = (db) => {
	return (
		async (id) => {
			const find = await db.get('SELECT cs_code FROM profiles WHERE _id=?', [id])
			return find?.cs_code || null
		}
	)
}

async function openDb () {
	return await open({
		filename: 'data.db',
		driver: sqlite3.Database
	})
}

/*
(async () => {
	const get = makeGet(openDb())

	get(427104626756812800)
})()
 */