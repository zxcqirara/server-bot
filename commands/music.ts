import { Client, Guild, GuildChannel, GuildMember, StreamDispatcher, VoiceConnection } from 'discord.js'
import { answer, changeAnswer, emblog, log } from '../utils'
import * as ytdl from 'ytdl-core'
import * as ytsr from "ytsr";

const config = require('../config.json')

export const json =
{
	name: 'music',
	description: 'Управление музыкой',
	options: [
		{
			name: 'play',
			description: 'Начать воспроизведение',
			type: 2,
			options: [
				{
					name: 'youtube',
					description: 'Начать воспроизведение из ютуба',
					type: 1,
					options: [
						{
							name: 'data',
							description: 'Ссылка/название видео',
							type: 3,
							required: true
						}
					]
				}
			]
		},
		{
			name: 'pause',
			description: 'Приостановить воспроизведение',
			type: 1
		},
		{
			name: 'resume',
			description: 'Продолжить воспроизведение',
			type: 1
		},
		{
			name: 'stop',
			description: 'Остановить воспроизведение',
			type: 1
		},
		{
			name: 'loop',
			description: 'Переключить циклирование трека',
			type: 1
		},
		{
			name: 'info',
			description: 'Информация о воспроизведении',
			type: 1
		}
	]
}

let dispatcher: StreamDispatcher
let connection: VoiceConnection
let info =
{
	name: null,
	channel: "0",
	user: "0",
	looped: true,
	status: 0 // 0 - Остановлено, 1 - Пауза, 2 - Воспроизведение
}

async function ply(second, interact, sender) {
	switch (second.name) {
		case 'youtube':
		{
			info.name = second.options.find(e => e.name == 'data').value

			if (sender.voice.channel) {
				connection = await sender.voice.channel.join()
			} else {
				answer(interact.id, interact.token, `Вы должны находиться в голосовом канале!`)
				return
			}

			dispatcher = connection.play(ytdl(info.name, { filter: 'audioonly' }))

			const regEx = /htt(p|ps):\/\/(www\.youtube\.com\/watch\?v=[A-z0-9]+|youtu\.be\/[A-z0-9]+)/g

			if (!regEx.test(info.name))
			{
				dispatcher = connection.play(ytdl(info.name, { filter: 'audioonly' }))
			}
			else
			{
				answer(interact.id, interact.token, `Введите **ссылку**!`)

				break
			}

			answer(interact.id, interact.token, `Начато воспроизведение **${info.name}**`)

			break
		}
		case 'vk':
		{
			answer(interact.id, interact.token, `В разработке! [IN DEV]`)

			break
		}
	}

	dispatcher.on('finish', async () => {
		if (info.looped) { await ply(second, interact, sender)} 

		info.status = 0

		changeAnswer(interact.id, interact.token, `Воспроизведение закончено`)
	})
}

export async function run(client: Client, interact: any, args: Object, guild: Guild, sender: GuildMember, channel: GuildChannel)
{
	if (config.blacklist.includes(sender.id))
	{
		answer(interact.id, interact.token, `Фейспалм чел ты в блек-листе`)

		return
	}
	
	const first = args[0]

	switch (first.name)
	{
		case 'play':
		{
			const second = first.options[0]

			switch (second.name)
			{
				case 'youtube':
				{
					info.name = second.options.find(e => e.name == 'data').value

					break
				}
			}

			await ply(second, interact, sender)
			
			info.user = sender.id
			info.status = 2
			info.channel = sender.voice.channel.id

			await emblog(client, 'Воспроизведение начато', config.logs_colors.info, [
				{
					name: 'Канал',
					value: `<#${info.channel}>`,
					inline: true,
				},
				{
					name: 'Диджей',
					value: `<@${info.user}>`,
					inline: true,
				},
				{
					name: 'Песня',
					value: info.name,
					inline: true,
				}
			])

			log(`${sender.user.tag} начал воспроизведение ${info.name}`)

			break
		}
		case 'pause':
		{
			if (dispatcher)
			{
				dispatcher.pause()
			}
			else
			{
				answer(interact.id, interact.token, `Приостанавливать нечего`)

				return
			}

			answer(interact.id, interact.token, `Воспроизведение приостановленно`)

			info.status = 1

			await emblog(client, 'Воспроизведение приостановленно', config.logs_colors.info, [
				{
					name: 'Канал',
					value: `<#${info.channel}>`,
					inline: true,
				},
				{
					name: 'Диджей',
					value: `<@${info.user}>`,
					inline: true,
				},
				{
					name: 'Песня',
					value: info.name,
					inline: true,
				}
			])

			log(`${sender.user.tag} приостановил воспроизведение`)

			break
		}
		case 'resume':
		{
			if (dispatcher)
			{
				dispatcher.resume()
			}
			else
			{
				answer(interact.id, interact.token, `Воспроизводить нечего`)

				return
			}

			answer(interact.id, interact.token, `Воспроизведение возобновлено`)

			info.status = 0

			await emblog(client, 'Воспроизведение возобновлено', config.logs_colors.info, [
				{
					name: 'Канал',
					value: `<#${info.channel}>`,
					inline: true,
				},
				{
					name: 'Диджей',
					value: `<@${info.user}>`,
					inline: true,
				},
				{
					name: 'Песня',
					value: info.name,
					inline: true,
				}
			])

			log(`${sender.user.tag} возобновил воспроизведение`)

			break
		}
		case 'stop':
		{
			if (dispatcher && connection)
			{
				dispatcher.destroy()
				connection.disconnect()
			}
			else if (dispatcher)
			{
				dispatcher.destroy()
			}
			else if (connection)
			{
				connection.disconnect()
			}
			else
			{
				answer(interact.id, interact.token, `Останавливать нечего`)
				
				return
			}

			answer(interact.id, interact.token, `Воспроизведение остановленно`)

			info.status = 0

			await emblog(client, 'Воспроизведение остановленно', config.logs_colors.info, [
				{
					name: 'Канал',
					value: `<#${info.channel}>`,
					inline: true,
				},
				{
					name: 'Диджей',
					value: `<@${sender.user.id}>`,
					inline: true,
				},
				{
					name: 'Песня',
					value: info.name,
					inline: true,
				}
			])

			log(`${sender.user.tag} остановил воспроизведение`)

			break
		}
		case 'loop':
		{
			info.looped = !info.looped

			answer(interact.id, interact.token, `Зацикливание: **${info.looped}**`)

			break
		}
		case 'info':
		{
			let st = 'Остановлено ❌'

			switch(info.status)
			{
				case 0:
				{
					st = 'Остановлено ❌'

					break
				}
				case 1:
				{
					st = 'Пауза ⏸'

					break
				}
				case 2:
				{
					st = 'Проигрывается 🎶'

					break
				}
			}

			answer(interact.id, interact.token, `Статус: **${st}**\n` +
																					`Название: **${info.name}**\n` +
																					`Канал: <#${info.channel}>\n` +
																					`Диджей: <@${info.user}>\n` +
																					`Зацикливание: **${info.looped}**`)
			
			break
		}
	}
}