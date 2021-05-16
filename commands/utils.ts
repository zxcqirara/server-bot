import { Client, Guild, GuildChannel, GuildMember } from 'discord.js';
import { answer } from '../utils';

export const json =
{
	name: 'utils',
	description: 'Различные утилиты',
	options: [
		{
			name: 'random',
			description: 'Рандомное число',
			type: 1,
			options: [
				{
					name: 'max',
					description: 'Максимальное число',
					type: 4,
					required: false
				},
				{
					name: 'min',
					description: 'Минимальное число',
					type: 4,
					required: false
				},
				{
					name: 'round',
					description: 'Округлять-ди число до целого?',
					type: 5,
					required: false
				}
			]
		}
	]
}

export async function run(client: Client, interact: any, args: Object, guild: Guild, sender: GuildMember, channel: GuildChannel)
{
	const subcommand = args[0].name

	switch (subcommand)
	{
		case 'random':
		{
			const min = args[0]?.options?.find(e => e.name == 'min').value | 1
			const max = args[0]?.options?.find(e => e.name == 'max').value | 100
			const round = args[0]?.options?.find(e => e.name == 'round').value | true as any

			if (min > max)
				answer(interact.id, interact.token, 'Минимальное число не может быть больше максимального')
			
			let rand: number
			let mark: string

			if (round)
			{
				rand = Math.round( Math.random() * (max - min + 1) + min )
				mark = '✅'
			}
			else
			{
				rand = Math.random() * (max - min + 1) + min
				mark = '❎'
			}

			answer(interact.id, interact.token, `Ваше число \`\`\`${rand}\`\`\`\n\n\`${min}\`-\`${max}\` Округление: ${mark}`)

			break
		}
	}
}