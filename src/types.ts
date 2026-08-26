export type EffortLevel = 'Extra' | 'High' | 'Normal' | 'Low'
export type AzuremindVersion = '1.0' | '1.1' | '1.2' | '2.0' | 'dev'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  createdAt: string
}

export type AttachmentPayload = {
  name: string
  type: string
  contents?: string
  dataUrl?: string
}

export type Conversation = {
  id: string
  title: string
  updatedAt: string
  messages: Message[]
}
