export interface IPresenceService {
  subscribePresence(jid: string): Promise<void>;
  sendPresence(
    jid: string,
    type: 'unavailable' | 'available' | 'composing' | 'recording' | 'paused'
  ): Promise<void>;
}
