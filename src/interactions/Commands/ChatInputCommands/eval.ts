import {
  ChatInputApplicationCommandData,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  AttachmentBuilder,
  ApplicationCommandOptionType
} from 'discord.js'

function clean(text: String) {
	return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
}

export default {
  dmPermission: false,
  description: 'Eval',
  name: 'eval',
  guilds: ['689127742104797250'],
  options: [
    {
      name: 'content',
      type: ApplicationCommandOptionType.String,
      required: true,
      description: 'contenu à évaluer'
    }
  ],
  defaultMemberPermissions: ['Administrator'],
  async execute (interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.user.id !== '396233379890200579') {
      interaction.isRepliable() &&
        !interaction.replied &&
        interaction.reply("⚠ Vous n'avez pas les permissions nécéssaires")
    } else {
      await interaction.deferReply({ ephemeral: true })
      let content = interaction.options.getString("content", true)
      console.log(content)
      try {
        const evaled = new String(await eval(content))
        const cleanCode = clean(evaled)
        let file = new AttachmentBuilder(Buffer.from(cleanCode), {
          name: 'eval.txt'
        })
        interaction.editReply({
          files: [file],
          allowedMentions: { repliedUser: false }
        })
      } catch (err) {
        if (err instanceof Error) {
          let file = new AttachmentBuilder(
            Buffer.from(err.stack ?? err.message),
            { name: 'eval.txt' }
          )
          interaction.editReply({
            files: [file],
            allowedMentions: { repliedUser: false }
          })
        } else {
          console.error(err)
          interaction.editReply({
            content: 'Error !',
            allowedMentions: { repliedUser: false }
          })
        }
      }
    }
  },
  type: ApplicationCommandType.ChatInput
} as ChatInputApplicationCommandData
