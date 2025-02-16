import {
  ActionRowBuilder,
  ComponentType,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuComponentData
} from 'discord.js'
import { allGuildsParsedRanks } from '../../../utils/promote'
import { getDummyStringSelectMenu } from '../../../utils/discord'
import { generateStringFromRegex } from '../../../utils/utils'

export default {
  customId: 'promote-select',
  regexValidator: /promote-select-(\d+)-([a-zA-Z ]+)(?:-([a-zA-Z ]+)(?:-([a-zA-Z ]+))?)?/,
  type: ComponentType.StringSelect,
  disabled: false,
  options: [],
  async execute (interaction, regexResult, ...args) {
    if (
      !interaction.guildId ||
      regexResult.length < 3 ||
      !interaction.isMessageComponent()
    )
      return
    if (!interaction.isAnySelectMenu())
      return (
        interaction.isRepliable() &&
        interaction.reply({
          content: 'Err : Not a select menu',
          flags: MessageFlags.Ephemeral
        })
      )

    const [_, targetUserId, triggeredMenuType, selectedUnit, selectedCategory] = regexResult
    const selectMenus = interaction.message.components.map(
      actRow => actRow.components[0]
    )

    const { value: ranks } = allGuildsParsedRanks
    const guildRanks = ranks[interaction.guildId]

    let unitSelectMenu: StringSelectMenuBuilder | undefined = undefined
    let categorySelectMenu: StringSelectMenuBuilder | undefined = undefined
    let choiceSelectMenu: StringSelectMenuBuilder | undefined = undefined

    switch (triggeredMenuType) {
      case 'unit': {
        unitSelectMenu = StringSelectMenuBuilder.from(
          interaction.component as any
        )
        unitSelectMenu.setCustomId(
          generateStringFromRegex(
            this.regexValidator!,
            targetUserId,
            'unit',
            interaction.values[0]
          )
        )
        unitSelectMenu.options.map(opt => (opt.data.default = false && opt))
        unitSelectMenu.options
          .find(opt => opt.data.value === interaction.values[0])
          ?.setDefault(true)

        const unit = guildRanks[interaction.values[0]]
        const unitCategoriesName = Object.keys(unit)
        const unitCategories = interaction.client.config[
          interaction.guildId
        ].RANKS.filter(r => unitCategoriesName.includes(r.roleName))

        if (unitCategoriesName.length < 0) {
          throw new Error(
            `Can't display Unit ranks as it seems that none are available`
          )
        } else if (unitCategoriesName.length == 1) {
          categorySelectMenu = getDummyStringSelectMenu()
          choiceSelectMenu = new StringSelectMenuBuilder()
            .setCustomId(
              generateStringFromRegex(
                this.regexValidator!,
                targetUserId,
                'choice',
                interaction.values[0]
              )
            )
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(
              unit[unitCategoriesName[0]].map(rank => {
                return {
                  label: rank.roleName,
                  value: rank.roleId
                }
              })
            )
        } else if (unitCategoriesName.length >= 2) {
          choiceSelectMenu = getDummyStringSelectMenu()
          categorySelectMenu = new StringSelectMenuBuilder()
            .setCustomId(
              generateStringFromRegex(
                this.regexValidator!,
                targetUserId,
                'category',
                interaction.values[0]
              )
            )
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(
              unitCategoriesName.map(category => {
                return {
                  label: category,
                  value: category
                }
              })
            )
        }

        break
      }
      case 'category': {
        unitSelectMenu = StringSelectMenuBuilder.from(selectMenus[0] as any)

        const unit = guildRanks[selectedUnit]

        categorySelectMenu = StringSelectMenuBuilder.from(interaction.component as any);
        categorySelectMenu.options.map(opt => (opt.data.default = false && opt))
        categorySelectMenu.options
          .find(opt => opt.data.value === interaction.values[0])
          ?.setDefault(true)

        choiceSelectMenu = new StringSelectMenuBuilder()
          .setCustomId(
            generateStringFromRegex(
              this.regexValidator!,
              targetUserId,
              'choice',
              selectedUnit,
              interaction.values[0]
            )
          )
          .setMinValues(1)
          .setMaxValues(1)
          .setOptions(
            unit[interaction.values[0]].map(rank => {
              return {
                label: rank.roleName,
                value: rank.roleId,
              }
            })
          )

        break
      }
      case 'choice': {
        break
      }
      default: {
        throw new Error(
          `Select menu type ${triggeredMenuType} not recognized for promote interaction manager`
        )
      }
    }

    const components = [unitSelectMenu, categorySelectMenu, choiceSelectMenu]
      .filter(c => !!c)
      .map(c =>
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(c)
      )

    return interaction.update({
      components
    })
  }
} as StringSelectMenuComponentData
