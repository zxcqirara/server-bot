import { Client, Guild, GuildChannel, GuildMember } from 'discord.js'
import { answer } from '../utils'

export const json =
{
	name: 'report',
	description: 'Отправить жалобу [IN DEV]',
	options: [
		{
			name: 'reason',
			description: 'Причина',
			type: 3,
			required: true
		},
		{
			name: 'user',
			description: 'Пользователь',
			type: 6,
			required: false
		}
	]
}

export async function run(client: Client, interact: any, args: Object, guild: Guild, sender: GuildMember, channel: GuildChannel)
{
	answer(interact.id, interact.token, `В разработке! [IN DEV]`)
}