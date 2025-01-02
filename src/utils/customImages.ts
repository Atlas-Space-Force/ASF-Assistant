import { Client, GuildMember } from 'discord.js'
import { createReadStream, createWriteStream } from 'fs'
import * as PImage from 'pureimage'
import { downloadGuildMemberProfilePicture } from './discord.js'

function applyCircularMask(ctx : PImage.Context, imageBitmap: PImage.Bitmap) : PImage.Context {
       
    // Dessiner l'image originale sur le canvas
    ctx.drawImage(imageBitmap, 0, 0);
    
    // Créer un masque circulaire
    const maskCanvas = PImage.make(imageBitmap.width, imageBitmap.height);
    const maskCtx = maskCanvas.getContext('2d');
    
    // Remplir le masque en noir
    maskCtx.fillStyle = '#000000';
    maskCtx.fillRect(0, 0, imageBitmap.width, imageBitmap.height);
    
    // Dessiner un cercle blanc (la partie visible)
    maskCtx.fillStyle = '#ffffff';
    maskCtx.beginPath();
    maskCtx.arc(imageBitmap.width / 2, imageBitmap.height / 2, Math.min(imageBitmap.width, imageBitmap.height) / 2, 0, 2 * Math.PI);
    maskCtx.fill();
    
    // Appliquer le masque
    const imageData = ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
    const maskData = maskCtx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
        // Utiliser la valeur du masque (noir ou blanc) comme alpha
        imageData.data[i + 3] = maskData.data[i]; // Le canal rouge du masque comme alpha
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Sauvegarder le résultat
    return ctx
}

export async function GenerateMemberJoinImage (member: GuildMember) {
  const canvas = PImage.make(1000, 300)
  const c = canvas.getContext('2d')
  c.clearRect(0, 0, canvas.width, canvas.height)

  const backgroundReadStream = createReadStream(
    `assets/images/welcome_background.png`
  )
  const backgroundImage = await PImage.decodePNGFromStream(backgroundReadStream)
  backgroundReadStream.close()

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

  // Temporary hack, seems to fix image bugs
  // await c.drawImage(backgroundImage, 0, 0)
  c.drawImage(
    backgroundImage,
    -1,
    -1,
    backgroundImage.width + 1,
    backgroundImage.height + 1
  )

  const maskCanvas = PImage.make(memberProfilePicture.width, memberProfilePicture.height);
  applyCircularMask(maskCanvas.getContext('2d'), memberProfilePicture);

  await c.drawImage(
    maskCanvas,
    0,
    0,
    maskCanvas.width,
    maskCanvas.height,
    33,
    22,
    256,
    256
  )

  const imageName = `./assets/images/tmp/welcome-${member.id}-${member.guild.id}.png`
  await PImage.encodePNGToStream(canvas, createWriteStream(imageName))

  return imageName
}
