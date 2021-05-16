import { Client, Guild, GuildChannel, GuildMember } from 'discord.js'
import { answer } from '../utils'
import {open} from "sqlite";
import * as sqlite3 from "sqlite3";

const profileSets =
[
	{
		name: "Код КС:ГО",
		value: "csgo_code"
	}
]

export const json =
{
	name: 'profile',
	description: 'Команды профиля',
	options: [
		{
			name: 'set',
			description: 'Настройки данных',
			type: 1,
			options: [
				{
					name: 'setting',
					description: 'Настройка',
					type: 3,
					required: true,
					choices: profileSets
				},
				{
					name: 'value',
					description: 'Значение',
					type: 3,
					required: true
				}
			]
		},
		{
			name: 'view',
			description: 'Получить данные',
			type: 1,
			options: [
				{
					name: 'user',
					description: 'Настройка',
					type: 6,
					required: true
				}
			]
		}
	]
}

export async function run(client: Client, interact: any, args: Object, guild: Guild, sender: GuildMember, channel: GuildChannel)
{
	const db = await open({
		filename: 'data.db',
		driver: sqlite3.Database
	})

	const subcommand = args[0].name

	switch (subcommand) {
		case 'set':
		{
			const setting = args[0]?.options?.find(e => e.name == 'setting').value
			const value = args[0]?.options?.find(e => e.name == 'value').value

			switch (setting) {
				case 'csgo_code':
				{
					const regEx = /.{5}-.{4}/g

					if (!regEx.test(value)) {
						answer(interact.id, interact.token, `Укажите код в верной форме! Например: \`A1B2C-3D4E\` (регистр не важен!)`)
						break
					}

					await db.run('INSERT OR REPLACE INTO profiles VALUES (?, ?)', [sender.id, value]).then(() => {
						answer(interact.id, interact.token, `Вы изменили свой код на **${value}**`)
					})
				}
			}

			break
		}
		case 'view':
		{
			const user = await guild.members.fetch(args[0].options.find(e => e.name == 'user').value)

			let data = await db.get('SELECT * FROM profiles WHERE _id = ?', [user.id])
			if(!data) data = {}

			answer(interact.id, interact.token, `
			Профиль: **${user.displayName}**
			====================
			Код CS:GO : \`${!data.csgo_code ? '?' : data.csgo_code}\`
			`)

			break
		}
	}
}