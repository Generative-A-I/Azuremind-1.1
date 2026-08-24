export type EffortLevel = 'Extra' | 'High' | 'Normal' | 'Low'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  createdAt: string
}

export type Conversation = {
  id: string
  title: string
  updatedAt: string
  messages: Message[]
}
