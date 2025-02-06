type CustomConfig = {
  NEW_MEMBER_CHANNEL_ID: string
  NEW_MEMBER_WELCOME_MESSAGE: string
  VOICE_CHANNEL_GENERATORS?: VoiceChannelGenerator[]
}

type VoiceChannelGenerator = {
  generatorId: string
  nameTemplate: string
  childs: boolean[]
}
