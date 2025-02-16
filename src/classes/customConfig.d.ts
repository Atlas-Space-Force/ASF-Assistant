type CustomConfig = {
  NEW_MEMBER_CHANNEL_ID: string
  NEW_MEMBER_WELCOME_MESSAGE: string
  VOICE_CHANNEL_GENERATORS?: VoiceChannelGenerator[]
  RANKS: Rank[]
  ACRONYMS: { [key: string]: string }
}

type VoiceChannelGenerator = {
  generatorId: string
  nameTemplate: string
  childs: boolean[]
}

type Rank = {
  roleAbr?: string
  roleId: string
  roleName: string
  dependencies?: string[]
  givable: boolean
}
