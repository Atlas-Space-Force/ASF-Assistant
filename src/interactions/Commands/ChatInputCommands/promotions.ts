import {
  ActionRowBuilder,
  ApplicationCommandType,
  ContextMenuCommandInteraction,
  MessageFlags,
  SelectMenuComponentOptionData,
  StringSelectMenuBuilder,
  UserApplicationCommandData
} from 'discord.js'

import { getDummyStringSelectMenu } from '../../../utils/discord'

import { allGuildsParsedRanks } from '../../../utils/promote'
export default {
  dmPermission: false,
  name: 'Promote',
  nameLocalizations: { fr: 'Promotion' },
  guilds: ['689127742104797250'],
  defaultMemberPermissions: ['Administrator'],

  async execute (interaction: ContextMenuCommandInteraction): Promise<any> {
    if (!interaction.guildId || !interaction.guild) {
      return interaction.reply({
        content: 'You must be in a guild to use that command',
        flags: MessageFlags.Ephemeral
      })
    }

    if (!interaction.isUserContextMenuCommand()) {
      return interaction.reply({
        content:
          'This command is intended to be used as a UserContextMenu command',
        flags: MessageFlags.Ephemeral
      })
    }
    
    const options: SelectMenuComponentOptionData[] = []
    await interaction.client.application.emojis.fetch()
    
    const { value: ranks } = allGuildsParsedRanks
    const guildRanks = ranks[interaction.guildId]
    for (const key of Object.keys(guildRanks)) {
      let emoji = await interaction.client.application.emojis.cache.find(
        e => e.name === key.replace(/[^0-9A-Za-z]/g, '')
      )
      options.push({
        label: key,
        value: key,
        emoji: emoji?.id ?? undefined
      })
    }

    const unitSelectMenuBuilder = new StringSelectMenuBuilder()
      .setCustomId(`promote-select-${interaction.targetId}-unit`)
      .setOptions(options)
      .setMaxValues(1)
      .setMinValues(1)

    const dummyMenuBuilder_1 = getDummyStringSelectMenu()
    const dummyMenuBuilder_2 = getDummyStringSelectMenu()

    const components = [
      unitSelectMenuBuilder,
      dummyMenuBuilder_1,
      dummyMenuBuilder_2
    ].map(menu => {
      let actRowBld = new ActionRowBuilder<StringSelectMenuBuilder>()
      actRowBld.addComponents(menu)
      return actRowBld
    })

    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      components
    })
  },
  type: ApplicationCommandType.User
} as UserApplicationCommandData
