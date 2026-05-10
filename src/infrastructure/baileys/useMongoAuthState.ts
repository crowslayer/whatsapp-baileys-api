import {
  AuthenticationCreds,
  AuthenticationState,
  BufferJSON,
  SignalDataTypeMap,
  initAuthCreds,
  proto,
} from '@whiskeysockets/baileys';
import { Collection } from 'mongoose';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface IMongoAuthDocument {
  _id: string;
  [key: string]: unknown;
}

export interface IMongoAuthStateResult {
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
}

// ─── Implementación ───────────────────────────────────────────────────────────

/**
 * Implementación de AuthState de Baileys que persiste las credenciales
 * y signal keys en MongoDB en lugar del filesystem.
 *
 * Cuándo usarlo:
 *   - Múltiples instancias en servidores distintos (necesitas estado compartido)
 *   - Entornos sin filesystem persistente (containers efímeros, serverless)
 *
 * Cuándo NO usarlo:
 *   - Servidor único → useMultiFileAuthState es más rápido (sin latencia de red)
 *   - Las signal keys se actualizan en cada mensaje — muchas escrituras a Mongo
 *
 * @param collection Colección de Mongoose tipada para el almacenamiento de auth
 */
export async function useMongoAuthState(
  collection: Collection<IMongoAuthDocument>
): Promise<IMongoAuthStateResult> {
  // ── Helpers de persistencia ─────────────────────────────────────────────────

  const writeData = async (data: unknown, id: string): Promise<void> => {
    const serialized = JSON.parse(JSON.stringify(data, BufferJSON.replacer));
    await collection.replaceOne({ _id: id } as any, { _id: id, ...serialized }, { upsert: true });
  };

  const readData = async (id: string): Promise<unknown | null> => {
    try {
      const doc = await collection.findOne({ _id: id } as any);
      if (!doc) return null;
      const serialized = JSON.stringify(doc);
      return JSON.parse(serialized, BufferJSON.reviver);
    } catch {
      return null;
    }
  };

  const removeData = async (id: string): Promise<void> => {
    try {
      await collection.deleteOne({ _id: id } as any);
    } catch {
      // Silencioso — si no existe, no es un error
    }
  };

  // ── Credenciales ─────────────────────────────────────────────────────────────
  // Carga las creds existentes o genera unas nuevas si es la primera vez

  const creds: AuthenticationCreds =
    ((await readData('creds')) as AuthenticationCreds) ?? initAuthCreds();

  // ── Estado de autenticación ───────────────────────────────────────────────────

  const state: AuthenticationState = {
    creds,
    keys: {
      /**
       * Lee un lote de signal keys del tipo especificado.
       * Baileys llama a este método antes de procesar/enviar mensajes cifrados.
       */
      get: async <T extends keyof SignalDataTypeMap>(
        type: T,
        ids: string[]
      ): Promise<{ [id: string]: SignalDataTypeMap[T] }> => {
        const result: { [id: string]: SignalDataTypeMap[T] } = {};

        await Promise.all(
          ids.map(async (id) => {
            let value = (await readData(`${type}-${id}`)) as SignalDataTypeMap[T];

            // Las app-state-sync-key deben deserializarse con el proto de Baileys.
            // El doble cast (unknown → T) es necesario porque TypeScript no puede
            // verificar en compilación que AppStateSyncKeyData sea asignable al
            // union type SignalDataTypeMap[T] — en runtime siempre es correcto
            // porque este bloque solo ejecuta cuando type === 'app-state-sync-key'.
            if (type === 'app-state-sync-key' && value) {
              value = proto.Message.AppStateSyncKeyData.fromObject(
                value as unknown as { [k: string]: unknown }
              ) as unknown as SignalDataTypeMap[T];
            }

            result[id] = value;
          })
        );

        return result;
      },

      /**
       * Escribe un lote de signal keys.
       * Baileys llama a este método tras cada intercambio de mensajes.
       * Un valor null/undefined indica que la key debe eliminarse.
       */
      set: async (data: { [category: string]: { [id: string]: unknown } }): Promise<void> => {
        const tasks: Promise<void>[] = [];

        for (const category of Object.keys(data)) {
          for (const id of Object.keys(data[category])) {
            const value = data[category][id];
            const key = `${category}-${id}`;

            tasks.push(value ? writeData(value, key) : removeData(key));
          }
        }

        await Promise.all(tasks);
      },
    },
  };

  return {
    state,
    saveCreds: () => writeData(creds, 'creds'),
  };
}
