import { Client, Guild, GuildChannel, GuildMember } from 'discord.js'
import { answer, emblog, log } from '../utils'

const config = require('../config.json')

export const json =
{
	name: 'invite',
	description: 'Управление приглашением на сервер',
	options: [
		{
			name: 'create',
			description: 'Создать приглашение',
			type: 1,
			options: [
				{
					name: 'expires',
					description: 'Время действия',
					type: 3,
					required: false,
					choices: [
						{
							name: '30 минут',
							value: '30m'
						},
						{
							name: '1 час',
							value: '1h'
						},
						{
							name: '6 часов',
							value: '6h'
						},
						{
							name: '12 часов',
							value: '12h'
						},
						{
							name: '1 день',
							value: '1d'
						},
						{
							name: '7 дней',
							value: '7d'
						}
					]
				}
			]
		},
		{
			name: 'clean',
			description: 'Удалить все приглашения',
			type: 1
		}
	]
}

export async function run(client: Client, interact: any, args: Object, guild: Guild, sender: GuildMember, channel: GuildChannel)
{
	const subcommand = args[0].name

	switch (subcommand) {
		case 'create':
		{
			const expires = args[0]?.options?.find(e => e.name == 'expires').value || 0
			let age: number

			switch (expires) {
				case '30m':
				{
					age = 60 * 30

					break
				}
				case '1h':
				{
					age = 60 * 60

					break
				}
				case '6h':
				{
					age = 60 * 60 * 6

					break
				}
				case '12h':
				{
					age = 60 * 60 * 12

					break
				}
				case '1d':
				{
					age = 60 * 60 * 24

					break
				}
				case '7d':
				{
					age = 60 * 60 * 24 * 7

					break
				}
				default:
				{
					age = 0

					break
				}
			}

			const invite = channel.createInvite({
				maxUses: 1,
				maxAge: age
			})

				answer(interact.id, interact.token, `Ваше приглашение: **${(await invite).code}** или [ссылка](https://discord.gg/${(await invite).code})`)

			await emblog(client, 'Генерация приглашения', config.logs_colors.info, [
				{
					name: 'Пользователь',
					value: `<@${sender.id}>`,
					inline: true,
				},
				{
					name: 'Код',
					value: (await invite).code,
					inline: true,
				}
			])

			log(`${sender.user.tag} сгенерировал приглашение. Код: ${(await invite).code}`)
		}
		case 'clean':
		{
		}
	}
}