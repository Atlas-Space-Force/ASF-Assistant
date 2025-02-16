import { GuildMember, StringSelectMenuBuilder } from 'discord.js'
import { writeFileSync } from 'fs'
import { sleep } from './utils'

export async function downloadGuildMemberProfilePicture (member: GuildMember) {
  const ppHash = member.displayAvatarURL({
    extension: 'png',
    size: 256,
    forceStatic: true
  })

  const res = await fetch(ppHash)

  const picturePath = `./assets/images/tmp/${member.id}.png`
  await res.arrayBuffer().then(async buffer => {
    await writeFileSync(picturePath, Buffer.from(buffer))
  })
  await sleep(100)
  return picturePath
}

export function getDummyStringSelectMenu () {
  return new StringSelectMenuBuilder()
    .setCustomId(`dummy-${Math.random() * Date.now()}`)
    .setDisabled(true)
    .setOptions({ label: '❌', value: '❌' })
}
