import * as request from 'request'
const config = require('./config.json')

const params =
{
	url: `https://discord.com/api/v8/applications/${config.app_id}/guilds/${config.guild_id}/commands`,
	auth: `Bot ${config.token}`,
}

export function delRequest()
{
	const options = {
		'method': 'GET',
		'url': params.url,
		'headers':
		{
			'Authorization': params.auth
		}
	}

	request(options, function (error, response) {
		if (error) throw new Error(error)
		return response.body
	})
}

export function init (mod_name: string)
{
	const json = require(`./commands/${mod_name}`).json

	const options = {
		method: 'POST',
		url: params.url,
		headers:
			{
				'Authorization': params.auth
			},
		json: json
	}

	request(options, function (error, response) {
		if (error) throw new Error(error)
		return response.body
	})
}