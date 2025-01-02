import { Client, GuildMember } from 'discord.js'
import { GenerateMemberJoinImage } from '../utils/customImages'
import { readFileSync } from 'fs'

export default async (
  client: Client,
  newMember: GuildMember,
  override: boolean = false
) => {
  try {
    const welcomeChannel = await newMember.guild.channels.fetch(
      override ? '1092895528871796736' : client.config.NEW_MEMBER_CHANNEL_ID
    )
    const welcomeImagePath = await GenerateMemberJoinImage(newMember)
    const welcomeImage = readFileSync(welcomeImagePath)
    if (welcomeChannel!.isSendable()) {
      welcomeChannel.send({
        files: [welcomeImage],
        content: `Bienvenue sur le discord de l'ASF ${newMember.toString()}`
      })
    } else {
      console.error(`Can't send message in channel ${welcomeChannel}`)
    }
  } catch ({ name }: any) {}
}
