import { WASocket } from '@whiskeysockets/baileys';

import { WhatsAppInstanceAggregate } from '@domain/aggregates/WhatsAppInstanceAggregate';

export class BaileysEventRouter {
  constructor(
    private readonly socket: WASocket,
    private readonly instance: WhatsAppInstanceAggregate
  ) {}

  bind(): void {
    this.socket.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        if (!msg.key.fromMe && msg.message) {
          // aquí podrías disparar domain event
          console.log('Incoming message', msg.key.remoteJid);
        }
      }
    });
  }
}
