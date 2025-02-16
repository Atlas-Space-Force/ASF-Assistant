import { Client, GuildMember } from 'discord.js'
import { createReadStream, createWriteStream, existsSync } from 'fs'
import * as PImage from 'pureimage'
import { downloadGuildMemberProfilePicture } from './discord.js'

export async function GenerateMemberJoinImage (member: GuildMember) {
  const canvas = PImage.make(1000, 300)
  const c = canvas.getContext('2d')
  c.clearRect(0, 0, canvas.width, canvas.height)

  const backgroundImagePath = `assets/images/welcome_backgrounds/${member.guild.id}.png`
  if(!existsSync(backgroundImagePath)) throw new Error(`Image doesn't exists for guild '${member.guild.name}' (${member.guild.id})`)
  const backgroundReadStream = createReadStream(backgroundImagePath)
  const backgroundImage = await PImage.decodePNGFromStream(backgroundReadStream)
  backgroundReadStream.close()

  const backgroundImageFillColor = backgroundImage.getPixelRGBA(10,10);
  console.log(backgroundImageFillColor)


  const memberProfilePicturePath = await downloadGuildMemberProfilePicture(
    member
  )
  console.log(memberProfilePicturePath)
  const memberProfilePictureReadStream = createReadStream(
    memberProfilePicturePath
  )
  const memberProfilePicture = await PImage.decodePNGFromStream(
    memberProfilePictureReadStream
  )
  memberProfilePictureReadStream.close()

  c.fillStyle = `#${backgroundImageFillColor.toString(16)}`
  await c.fillRect(0,0,backgroundImage.width, backgroundImage.height)

  await c.drawImage(
    memberProfilePicture,
    0,
    0,
    memberProfilePicture.width,
    memberProfilePicture.height,
    35,
    22,
    256,
    256
  )

  // Temporary hack, seems to fix image bugs
  // await c.drawImage(backgroundImage, 0, 0)
  c.drawImage(
    backgroundImage,
    -1,
    -1,
    backgroundImage.width + 1,
    backgroundImage.height + 1
  )

  const imageName = `./assets/images/tmp/welcome-${member.id}-${member.guild.id}.png`
  await PImage.encodePNGToStream(canvas, createWriteStream(imageName))

  return imageName
}
