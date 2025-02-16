import { Client, Guild } from 'discord.js'
import { lazy } from './utils'
import { client } from '../index'

export type GuildParsedRanks = {
  [unit: string]: { [category: string]: Rank[] }
}
export type AllGuildsParsedRanks = {
  [guildId: typeof Guild.prototype.id]: GuildParsedRanks
}

function parseGuildRanks (ranks: Rank[]): GuildParsedRanks {
  if (!ranks) throw new Error(`Can't parse ranks as it is ${ranks}`)
  function getDependencies (rank: Rank): Rank[] {
    let dependencies: Rank[] = []

    function iterateOverDependencies (currentRank: Rank) {
      if (currentRank.dependencies) {
        for (const dependenciesId of currentRank.dependencies) {
          const dependency = ranks.find(r => r.roleId === dependenciesId)
          if (!dependency) continue
          dependencies.push(dependency)
          iterateOverDependencies(dependency) // Recursively collect dependencies
        }
      }
    }

    iterateOverDependencies(rank)
    return dependencies
  }

  const dict: { [key: string]: { [key: string]: Rank[] } } = {}

  for (const givableRole of ranks.filter(r => r.givable)) {
    const dependencies = getDependencies(givableRole).map(dep => dep.roleName)
    if (dependencies.length < 3) dependencies.unshift('SANS UNITE')
    if (dependencies.length < 4) dependencies.splice(1, 0, '')

    dict[dependencies[0]] ??= {}
    dict[dependencies[0]][dependencies[1]] ??= []
    dict[dependencies[0]][dependencies[1]].push(givableRole)
  }

  for (const topLevelCategory of Object.keys(dict)) {
    if (
      Object.values(dict[topLevelCategory]).length > 1 &&
      '' in dict[topLevelCategory]
    ) {
      let backup = JSON.parse(JSON.stringify(dict[topLevelCategory]['']))
      delete dict[topLevelCategory]['']
      dict[topLevelCategory]['HOMME DU RANG'] = backup
    }
  }

  return dict
}

export const allGuildsParsedRanks = lazy<AllGuildsParsedRanks>(
  (client: Client) => {
    const guildParsedRanks: AllGuildsParsedRanks = {}
    for (const guildId in client.config) {
      if(client.config[guildId]?.RANKS?.length >= 1){
        guildParsedRanks[guildId] = parseGuildRanks(client.config[guildId].RANKS)
      }
    }

    return guildParsedRanks
  }
)(client)
