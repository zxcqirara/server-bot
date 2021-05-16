import {Client, Guild, GuildChannel, GuildMember, MessageEmbed, WebhookClient} from 'discord.js'
import { answer } from '../utils'

const config = require('../config.json')

export const json =
{
	name: 'news',
	description: 'Отправка новости',
	options: [
		{
			name: 'title',
			description: 'Заголовок новости',
			type: 3,
			required: true
		},
		{
			name: 'text',
			description: 'Текст новости',
			type: 3,
			required: true
		}
	]
}

export async function run(client: Client, interact: any, args: Array<any>, guild: Guild, sender: GuildMember, channel: GuildChannel)
{
	const title = args.find(e => e.name == 'title').value
	const text = args.find(e => e.name == 'text').value

	if (sender.roles.highest.id != config.admin_role && sender.id != guild.ownerID) {
		answer(interact.id, interact.token, `Вы не можете отправлять новости!`)
		return
	}

	const hook = new WebhookClient(config.newsWebhook.id, config.newsWebhook.token)

	const embed = new MessageEmbed({
		title: title,
		description: text,
		color: 0x7289da
	})

	await hook.send(embed)

	answer(interact.id, interact.token, `Новость отправлена!`)
}