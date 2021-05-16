import {
	Client,
	Guild,
	GuildMember,
	GuildChannel
} from 'discord.js'
import * as fs from 'fs'
import {emblog, log} from './utils'
import { init } from './slash-commands'

const client = new Client()
const config = require('./config.json')

client.on('ready', async () => {
	fs.readdir('./commands', (_, files) => {
		files.forEach(file => {
			init(file)
			log(`Инициализированна слеш-команда ${file}`)
		})
	})

	await client.user.setPresence({
		activity: {
			name: 'за сервером :)',
			type: 'WATCHING',
		}
	})

	log(`${client.user.tag} готов`)
})

// client.on('ready', () => {
// 	const guild = client.guilds.fetch(config.guild_id)

// 	for (const webhook in webhooks) {
// 		const hook = new WebhookClient(webhooks[webhook]['id'], webhooks[webhook]['token'])

// 		for (const id in config.wh_channels) {
// 			guild.then(guild => {
// 				const channel = guild.channels.resolve(config.wh_channels[id]) as TextChannel

// 				channel.bulkDelete(10)
// 			})
// 		}

// 		hook.send(webhooks[webhook]['content'])
// 	}
// })

// process.on("unhandledRejection", error => {
// 	console.error("Unhandled promise rejection:", error)
// })

// @ts-expect-error
client.ws.on('INTERACTION_CREATE', async (interact: any) =>
{
	const command: string = interact.data.name.toLowerCase()
	const args: Object = interact.data.options
	const guild: Guild = await client.guilds.fetch(interact.guild_id)
	const sender: GuildMember = await guild.members.fetch(interact.member.user.id)
	const channel: GuildChannel = guild.channels.resolve(interact.channel_id)

	await require(`./commands/${command}.ts`).run(client, interact, args, guild, sender, channel)
})

client.on('messageDelete', async (message) =>
{
	if (message.author == client.user) return

	await emblog(client, 'Удаление сообщения', config.logs_colors.warn, [
		{
			name: 'Пользователь',
			value: `<@${message.author.id}>`,
			inline: true,
		},
		{
			name: 'Канал',
			value: `<#${message.channel.id}>`,
			inline: true,
		}
	],
	message.content)

	log(`${message.author.tag} удалил сообщение в канале ${(message.channel as GuildChannel).name}\nСодержимое сообщения:\n${message.content}`)
})

client.login(config.token).then()