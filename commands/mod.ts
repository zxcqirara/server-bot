import { Client, Guild, GuildChannel, GuildMember, Permissions, TextChannel } from 'discord.js'
import { log, answer, emblog } from '../utils'

const config = require('../config.json')
const ms = require('ms')

export const json =
{
	name: 'mod',
	description: 'Команды модерации',
	options: [
		{
			name: 'clear',
			description: 'Отчистка чата',
			type: 1,
			options: [
				{
					name: 'limit',
					description: 'Предел сообщений',
					type: 4,
					required: false
				}
			]
		},
		{
			name: 'mute',
			description: 'Замьютить пользователя',
			type: 1,
			options: [
				{
					name: 'user',
					description: 'Пользователь',
					type: 6,
					required: true
				},
				{
					name: 'reason',
					description: 'Причина',
					type: 3,
					required: true
				},
				{
					name: 'time',
					description: 'Время',
					type: 3,
					required: true
				}
			]
		},
		{
			name: 'unmute',
			description: 'Размьютить пользователя',
			type: 1,
			options: [
				{
					name: 'user',
					description: 'Пользователь',
					type: 6,
					required: true
				},
				{
					name: 'reason',
					description: 'Причина',
					type: 3,
					required: true
				}
			]
		},
		{
			name: 'moveall',
			description: 'Переместить всех пользователей в дргуой ГК',
			type: 1,
			options: [
				{
					name: 'channel',
					description: 'Канал',
					type: 7,
					required: true
				}
			]
		}
	]
}

export async function run(client: Client, interact: any, args: Object, guild: Guild, sender: GuildMember, channel: GuildChannel)
{
	const subcommand = args[0].name

	switch (subcommand) {
		case 'clear':
		{
			let limit = args[0]?.options?.find(e => e.name == 'limit').value
			if (!limit) limit = 100

			if (!sender.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES) && sender.id != guild.ownerID) {
				answer(interact.id, interact.token, `У вас не достаточно прав!`)
				break
			}

			if (limit > 100) {
				answer(interact.id, interact.token, `Нельзя указывать больше, чем **100**! (${limit})`)
				break
			}

			await(channel as TextChannel).bulkDelete(limit)

			answer(interact.id, interact.token, `Отчищено **${limit}** сообщений`)

			await emblog(client, 'ОТЧИСТКА', config.logs_colors.admin, [
				{
					name: 'Канал',
					value: `<#${channel.id}>`,
					inline: true,
				},
				{
					name: 'Кол-во',
					value: limit,
					inline: true,
				},
				{
					name: 'Админ',
					value: `<@${sender.user.id}>`,
					inline: true,
				}
			])

			log(`${sender.user.tag} отчистил ${limit} сообщений в ${channel.name}`)

			break
		}
		case 'mute':
		{
			const user = await guild.members.fetch(args[0].options.find(e => e.name == 'user').value)
			const reason = await args[0].options.find(e => e.name == 'reason').value
			const time = await args[0].options.find(e => e.name == 'time').value

			if (sender == user) {
				answer(interact.id, interact.token, `Вы не можете замьютить сами себя!`)
				break
			}

			if (!sender.hasPermission(Permissions.FLAGS.MUTE_MEMBERS) && !sender.roles.highest.comparePositionTo(user.roles.highest) && sender.id != guild.ownerID) {
				answer(interact.id, interact.token, `У Вас не достаточно прав!`)
				break
			}

			await user.roles.add(config.mute_role, reason)

			setTimeout(() => {
				user.roles.remove(config.mute_role, 'Окончание мьюта')
			}, ms(time))

			answer(interact.id, interact.token, `Вы замьютили <@${user.id}>\n` +
				`Причина: **${reason}**\n` +
				`Вермя: **${time}**`)

			await emblog(client, 'МЬЮТ', config.logs_colors.admin, [
				{
					name: 'Пользователь',
					value: `<@${user.id}>`,
					inline: true,
				},
				{
					name: 'Причина',
					value: reason,
					inline: true,
				},
				{
					name: 'Время',
					value: time,
					inline: true,
				},
				{
					name: 'Админ',
					value: `<@${sender.user.id}>`,
					inline: true,
				}
			])

			log(`${sender.user.tag} замьютил ${user.user.tag} на ${time} по причине: ${reason}`)

			break
		}
		case 'unmute':
		{
			const user = await guild.members.fetch(args[0].options.find(e => e.name == 'user').value)
			const reason = await args[0].options.find(e => e.name == 'reason').value

			if (sender == user) {
				answer(interact.id, interact.token, `Вы не можете размьютить сами себя!`)
				break
			}

			if (!(sender.hasPermission(Permissions.FLAGS.MUTE_MEMBERS) && sender.roles.highest.comparePositionTo(user.roles.highest)) && sender.id != guild.ownerID) {
				answer(interact.id, interact.token, `У вас не достаточно прав!`)
				break
			}

			await user.roles.remove(config.mute_role, reason)

			answer(interact.id, interact.token, `Вы размьютили <@${user.id}>\n` +
				`Причина: **${reason}**`)

			await emblog(client, 'РАЗМЬЮТ', config.logs_colors.admin, [
				{
					name: 'Пользователь',
					value: `<@${user.id}>`,
					inline: true,
				},
				{
					name: 'Причина',
					value: reason,
					inline: true,
				},
				{
					name: 'Админ',
					value: `<@${sender.user.id}>`,
					inline: true,
				}
			])

			log(`${sender.user.tag} размьютил ${user.user.tag} по причине: ${reason}`)

			break
		}
		case 'moveall':
		{
			const channel = await guild.channels.resolve(args[0].options.find(e => e.name == 'channel').value)

			if (sender.hasPermission(Permissions.FLAGS.MOVE_MEMBERS) && sender.id != guild.ownerID) {
				answer(interact.id, interact.token, `У вас не достаточно прав!`)
				break
			}

			if (channel.type != 'voice') {
				answer(interact.id, interact.token, `Выберите **голосовой** канал!`)
				break
			}

			if (!sender.voice.channel) {
				answer(interact.id, interact.token, `Вы должны находиться в голосовом канале!`)
				return
			}

			sender.voice.channel.members.forEach((member) => {
				member.voice.setChannel(channel)
			})

			answer(interact.id, interact.token, `Вы переместили всех в <#${channel.id}>`)

			await emblog(client, 'Перемещение', config.logs_colors.admin, [
				{
					name: 'Канал',
					value: `<#${channel.id}>`,
					inline: true,
				},
				{
					name: 'Админ',
					value: `<@${sender.user.id}>`,
					inline: true,
				}
			])

			log(`${sender.user.tag} переместил всех в ${channel.name}`)

			break
		}
	}
}