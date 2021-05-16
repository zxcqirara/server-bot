import { EmbedFieldData, MessageEmbed, TextChannel, Client, GuildMember, Permissions, Guild } from 'discord.js'
import { appendFileSync } from 'fs'
import { post, patch } from 'request'

const config = require('./config.json')

export function log(...args: any[])
{
	const d = new Date()
	const logTime = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
	const logDate = `${d.getUTCFullYear()}.${d.getUTCMonth()}.${d.getUTCDay()}`

	const a = args.map(v => typeof v === "string" ? v : JSON.stringify(v)).join(' ')

	console.log(`[${logTime}]\t${a}`)
	appendFileSync(`./logs/${logDate}.log`, `[${logTime}]\t${a}\n`)
}

export function answer(id: number, token: string, content: string) {
	const url = `https://discord.com/api/v8/interactions/${id}/${token}/callback`

	const headers = {
		"Authorization": `Bot ${config.token}`
	}

	const json = {
		"type": 3,
		"data": {
			"content": content,
			"flags": 64
		}
	}

	return post(url, { headers: headers, json: json })
}

export function changeAnswer(id: number, token: string, content: string) {
	const url = `https://discord.com/api/v8/webhooks/${config.appid}/${token}/messages/@original`

	const headers = {
		"Authorization": `Bot ${config.token}`
	}

	const json = {
		"type": 3,
		"data": {
			"content": content,
			"flags": 64
		}
	}

	return patch(url, { headers: headers, json: json })
}

export async function emblog(client: Client, title: string, color: string, fields: EmbedFieldData[], description?: string) {
	const emb = new MessageEmbed({
		title: title,
		description: description,
		color: color,
		fields: fields,
		timestamp: Date.now(),
	})

	await ((await client.guilds.fetch(config.guildid)).channels.resolve(config.logs_channel) as TextChannel).send(emb)
}

export async function hasPerm(admin: GuildMember, permission?: number, user?: GuildMember, guild?: Guild)
{
	// разрешение | порядок ролей | владелец сервера
	if (!admin.hasPermission(Permissions.FLAGS[permission]) || !admin.roles.highest.comparePositionTo(user.roles.highest) || !(admin.id == guild.ownerID)){
		return false
	} else {
		return true
	}
}