import { ChannelType, Client } from "discord.js";
import { Loader } from "../loaders/CommandsLoader";
import { InteractionHandler } from "../handlers/InteractionHandler";
import {readFileSync, readdirSync} from "fs"
import { romanToInt } from "../utils/utils";

export default async (client: Client) => {
	client.config ??= {}
	const guildConfigsFilePath = `assets/configs`
	const configFiles = readdirSync(guildConfigsFilePath)
	for(const file of configFiles.filter(file => file.endsWith(".json"))){
		try{
			const guildId = file.split(".")[0];
			client.config[guildId] = JSON.parse(readFileSync(`${guildConfigsFilePath}/${file}`, "utf-8"))
		}catch {
			console.error(`Failed parsing of config ${file}`)
		}
	}
	
	client.user?.setPresence({ activities: [], status: "online" });
	console.log(`Logged in as ${client?.user?.tag} !`);
	await Loader.loadCommands({ deleteUnknownCommands: true }).catch(console.error);
	await Loader.loadComponents().catch(console.error);
	InteractionHandler.start();

	//Réinitialisation du suivi des nombres pour les clients vocaux
	const clientGuilds = await client.guilds.cache
	for await(const [, guild] of clientGuilds){
		const guildVoiceChannels = (await guild.channels.fetch()).filter(
			channel => channel?.type === ChannelType.GuildVoice
		)

		for (const voiceChannelGenerator of client.config[guild.id].VOICE_CHANNEL_GENERATORS ?? []) {
			const generatorChannel = guild.channels.resolve(
				voiceChannelGenerator.generatorId
			)
			if (!generatorChannel) {
				console.error(
					`VoiceChannelGenerator ${voiceChannelGenerator.generatorId} n'est pas disponible sur le serveur ${guild.id}`
				)
				continue
			}

			const templateNameRegex = new RegExp(
				voiceChannelGenerator.nameTemplate.replace(
					'{{number}}',
					'(?<number>[\ud835\udc0c\udc02\udc03\udc17\udc0b\udc08\udc15]+)'
				)
			)

			const generatorAlreadyExistingChannel = guildVoiceChannels
				.values()
				.filter(chan => !!chan.name.match(templateNameRegex) && chan.members.size > 0)

			for (const emptyChannel of generatorAlreadyExistingChannel) {
				//More verifications to be sure to not delete wrong channels
				const existingChannelRomanText = templateNameRegex.exec(
					emptyChannel.name
				)?.groups?.number
				if (!!existingChannelRomanText) {
					const existingChannelRomanNumber = romanToInt(existingChannelRomanText)
					voiceChannelGenerator.childs ??= [true]
					voiceChannelGenerator.childs[existingChannelRomanNumber] = true
				}
			}
		}
	}
};
