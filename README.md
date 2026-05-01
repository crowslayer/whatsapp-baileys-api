# WhatsApp Multi-Instance API con Baileys

API REST profesional para interactuar con WhatsApp usando la librería Baileys, construida con Node.js, TypeScript y siguiendo principios de arquitectura hexagonal, DDD, CQRS y patrones de diseño empresariales.

## 📌 Versionado y cambios

- **Releases (tags)**: `v1.0.1`, `v1.1.0`
- **Historial de cambios**: ver `CHANGELOG.md`

## 🚀 Características

- ✅ **Multi-instancia**: Soporte para múltiples sesiones de WhatsApp simultáneas
- ✅ **Conexión flexible**: Sincronización mediante QR o código de emparejamiento
- ✅ **QR en navegador**: Ruta `GET .../qr/view` que renderiza una página HTML con el código (útil fuera de producción; en producción la app no monta vistas EJS)
- ✅ **Consulta de chats**: Listado de conversaciones/chats asociados a una instancia conectada
- ✅ **Consulta de grupos**: Listado de grupos de WhatsApp de la cuenta vinculada a la instancia
- ✅ **Multimedia completo**: Imágenes, documentos, audio, video, ubicaciones, contactos vCard y stickers WebP
- ✅ **Reacciones con emojis**: Responder mensajes con emojis
- ✅ **Notas de voz**: Soporte para mensajes PTT (Push To Talk)
- ✅ **Baileys 7 (RC)**: `@whiskeysockets/baileys` en rama 7.x (p. ej. `7.0.0-rc.x`)
- ✅ **Reintentos de mensajes**: Caché interna (`node-cache`) integrada con Baileys para el flujo de reintentos de mensajes
- ✅ **ES Modules**: Arquitectura moderna con ESM
- ✅ **Arquitectura hexagonal**: Separación clara entre dominio, aplicación e infraestructura
- ✅ **Inyección de dependencias**: Contenedor con `node-dependency-injection` y servicios declarados en YAML
- ✅ **DDD**: Entidades, Value Objects, Aggregates y Domain Events
- ✅ **CQRS**: Separación entre comandos y consultas
- ✅ **MongoDB**: Persistencia de instancias y sesiones
- ✅ **Auditoría completa**: Tracking de todas las operaciones
- ✅ **Logging robusto**: Sistema de logs con Pino
- ✅ **Manejo de errores**: Gestión centralizada y tipada de errores
- ✅ **ResponseHandler homologado**: Respuestas consistentes en toda la API
- ✅ **Validación**: Validación de datos con express-validator
- ✅ **Seguridad HTTP**: Helmet con CSP estricta, CORS configurable y rate limiting global opcional (`ENABLED_RATE_LIMITS=true`)
- ✅ **Health check**: `GET /health` para supervisión (estado, timestamp, uptime)
- ✅ **TypeScript estricto**: Tipado fuerte en todo el proyecto
- 🚀 **Campaigns management**: Soporte para crear, planificar y monitorizar campañas de mensajes. Incluye un dominio CampaignAggregate con orchestración basada en CQRS (CampaignDispatcher, CampaignProcessor, CampaignScheduler y CampaignRetryWorker) y repositorios para lectura/escritura de campañas.
- 🔄 **Sprint/campaigns infra**: Servicios de campaña (CampaignService) y repositorios Mongo (MongoCampaignReadRepository, MongoCampaignRepository) acompañados de controladores y rutas HTTP para gestionar campañas desde la API.
- 🧭 **Dominio de campañas**: Nuevos aggregates y value objects para flujos de campañas (FlowDefinitionAggregate, FlowId, CampaignAggregate, etc.).
- 🧩 **Extensibilidad futura**: Estructura preparada para añadir métricas, estado de progreso y reportes de campañas.

## 📋 Requisitos Previos

- Node.js >= 20.x (recomendado para ESM)
- MongoDB >= 6.x
- npm >= 9.x
- **pnpm** (recomendado): el script `npm run build` ejecuta internamente `pnpm run build:di`; `npm run validate` también usa pnpm. Con Node 16+ puedes activar Corepack: `corepack enable` y luego `corepack prepare pnpm@latest --activate`

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd whatsapp-baileys-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

El proyecto carga variables desde `.env` (vía `dotenv`). Puedes partir de la plantilla del repositorio:

```bash
# Linux / macOS / Git Bash
cp .env.example .env
# Windows (PowerShell)
# Copy-Item .env.example .env
```

Ajusta los valores; configuración mínima de referencia:

```env
# Runtime
NODE_ENV=development
PORT=3333
API_PATH=api
API_VERSION=v1
APP_URL=http://localhost:3333

# Database (MongoDB vía mongoose)
DB_TYPE=mongoose
DB_ENABLED=true
DB_URI=mongodb://localhost:27017/whatsapp-api

# Security
SECURITY_TYPE=jwt
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-chars
JWT_EXPIRES=1d
JWT_REFRESH_EXPIRES=7d

# CORS (coma-separado). En production es obligatorio.
ACCEPTED_ORIGINS=http://localhost:3000,http://localhost:4200

# Opcionales (booleanos como string)
PROTECT_ROUTES=false
ENABLED_RATE_LIMITS=false
```

Notas:

- **`NODE_ENV` es obligatorio** y solo admite: `development | production | test | staging`.
- En **production** se requieren **`APP_URL`** y **`ACCEPTED_ORIGINS`**; y si usas JWT, **`JWT_SECRET`** debe tener **mínimo 32 caracteres**.
- Para base de datos, `DB_TYPE` soporta `mongoose | typeorm | sequelize` (en este repo el flujo principal está probado con **mongoose**; otros adaptadores exigen variables `DB_HOST`, `DB_PORT`, etc., según `FactoryConfig.ts`).
- **`SECURITY_TYPE`**: `jwt` (por defecto en los ejemplos) u **`oauth2`**, que requiere `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET` y `OAUTH_AUTH_SERVER`.
- **`PROTECT_ROUTES`**: se lee en la configuración, pero **en el código actual no hay middleware de autenticación aplicado a las rutas**; trátalo como reservado para evolución futura.

### Scripts útiles (`package.json`)

| Script                            | Descripción                                                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Servidor en caliente con `tsx watch`                                                                                  |
| `npm run build`                   | Compila TypeScript, `tsc-alias` y copia assets (`build:di` vía pnpm)                                                  |
| `npm start`                       | Ejecuta `dist/index.js` (tras `build`)                                                                                |
| `npm run type-check`              | `tsc --noEmit`                                                                                                        |
| `npm run lint` / `lint:fix`       | ESLint                                                                                                                |
| `npm run format` / `format:check` | Prettier sobre `src/**`                                                                                               |
| `npm run validate`                | `type-check` + `lint` + `format:check` (usa pnpm)                                                                     |
| `npm run clean`                   | Borra `dist/` con `rm -rf` (en Windows, si falla, elimina la carpeta `dist` manualmente o usa un shell tipo Git Bash) |

### 4. Compilar TypeScript

```bash
npm run build
```

El script de compilación ejecuta TypeScript, resuelve alias (`tsc-alias`), copia assets al `dist/` y requiere **`pnpm`** para el paso `build:di`. Si falla por falta de `pnpm`, instálalo globalmente o usa `corepack enable` según tu entorno.

### 5. Iniciar la aplicación

**Desarrollo:**

```bash
npm run dev
```

**Producción:**

```bash
npm start
```

## 🔌 API Endpoints

La URL base de la API es `http://localhost:{PORT}/{API_PATH}/{API_VERSION}` (por defecto `PORT=3333`, `API_PATH=api`, `API_VERSION=v1` → `http://localhost:3333/api/v1`).

### Salud del servicio

```http
GET /health
```

Respuesta JSON con `status`, `timestamp` y `uptime` del proceso.

### Instancias

#### Crear nueva instancia

```http
POST /api/v1/instances
Content-Type: application/json

{
  "name": "Mi Primera Instancia",
  "webhookUrl": "https://mi-webhook.com/whatsapp",
  "usePairingCode": false
}
```

**Con código de emparejamiento:**

```json
{
  "name": "Instancia con Código",
  "usePairingCode": true,
  "phoneNumber": "5215512345678"
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Instance created successfully",
  "data": {
    "instanceId": "uuid-instance-id",
    "name": "Mi Primera Instancia",
    "status": "connecting",
    "qrCode": "data:image/png;base64,...",
    "createdAt": "2025-01-25T10:00:00.000Z"
  },
  "metadata": {
    "timestamp": "2025-01-25T10:00:00.000Z",
    "requestId": "req_123456",
    "audit": {
      "action": "CREATE",
      "resource": "INSTANCE",
      "ipAddress": "192.168.1.1"
    }
  }
}
```

#### Listar instancias

```http
GET /api/v1/instances
```

#### Obtener instancia por ID

```http
GET /api/v1/instances/:instanceId
```

#### Obtener QR Code

```http
GET /api/v1/instances/:instanceId/qr
```

#### Obtener status del QR / conexión

```http
GET /api/v1/instances/:instanceId/qr/status
```

#### Vista HTML del QR (navegador)

```http
GET /api/v1/instances/:instanceId/qr/view
```

Disponible cuando la app **no** está en modo `production` (en ese entorno no se registran vistas EJS).

#### Desconectar instancia

```http
POST /api/v1/instances/:instanceId/disconnect
```

#### Eliminar instancia

```http
DELETE /api/v1/instances/:instanceId
```

### Chats

#### Listar chats de la instancia

```http
GET /api/v1/instances/:instanceId/chats
```

Requiere que la instancia esté conectada a WhatsApp.

### Mensajes

#### Enviar mensaje

```http
POST /api/v1/messages/:instanceId/send
Content-Type: application/json

{
  "to": "5215512345678@s.whatsapp.net",
  "message": "Hola desde la API!"
}
```

### Multimedia

#### Enviar imagen

```bash
curl -X POST http://localhost:3333/api/v1/multimedia/:instanceId/send/image \
  -F "image=@imagen.jpg" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "caption=¡Mira esta imagen! 📸"
```

#### Enviar documento (PDF, Word, Excel, etc.)

```bash
curl -X POST http://localhost:3333/api/v1/multimedia/:instanceId/send/document \
  -F "document=@documento.pdf" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "caption=Documento adjunto"
```

#### Enviar audio / nota de voz

```bash
# Audio normal
curl -X POST http://localhost:3333/api/v1/multimedia/:instanceId/send/audio \
  -F "audio=@audio.mp3" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "ptt=false"

# Nota de voz (PTT)
curl -X POST http://localhost:3333/api/v1/multimedia/:instanceId/send/audio \
  -F "audio=@voz.ogg" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "ptt=true"
```

#### Enviar video / GIF

```bash
# Video normal
curl -X POST http://localhost:3333/api/v1/multimedia/:instanceId/send/video \
  -F "video=@video.mp4" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "caption=¡Mira esto! 🎥"

# GIF animado
curl -X POST http://localhost:3333/api/v1/multimedia/:instanceId/send/video \
  -F "video=@animacion.mp4" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "gifPlayback=true"
```

#### Enviar ubicación

```http
POST /api/v1/multimedia/:instanceId/send/location
Content-Type: application/json

{
  "to": "5215512345678@s.whatsapp.net",
  "latitude": 20.9674,
  "longitude": -89.6243,
  "name": "Mérida, Yucatán",
  "address": "Centro Histórico"
}
```

#### Enviar reacción (emoji)

```http
POST /api/v1/multimedia/:instanceId/send/reaction
Content-Type: application/json

{
  "chatId": "5215512345678@s.whatsapp.net",
  "messageId": "MESSAGE_ID",
  "emoji": "❤️"
}
```

#### Enviar contacto(s)

```http
POST /api/v1/multimedia/:instanceId/send/contact
Content-Type: application/json

{
  "to": "5215512345678@s.whatsapp.net",
  "contacts": [
    {
      "displayName": "Juan Pérez",
      "vcard": "BEGIN:VCARD\nVERSION:3.0\nFN:Juan Pérez\nTEL;type=CELL:+5215512345678\nEND:VCARD"
    }
  ]
}
```

#### Enviar sticker (WebP)

```bash
curl -X POST http://localhost:3333/api/v1/multimedia/:instanceId/send/sticker \
  -F "sticker=@sticker.webp" \
  -F "to=5215512345678@s.whatsapp.net"
```

### Grupos

Las rutas de grupos viven bajo el prefijo de instancias: `/api/v1/instances/:instanceId/groups`.

#### Listar grupos

```http
GET /api/v1/instances/:instanceId/groups
```

#### Crear grupo

```http
POST /api/v1/instances/:instanceId/groups
Content-Type: application/json

{
  "name": "Mi Grupo",
  "participants": [
    "5215512345678@s.whatsapp.net",
    "5215587654321@s.whatsapp.net"
  ]
}
```

#### Agregar participantes

```http
POST /api/v1/instances/:instanceId/groups/:groupId/participants/add
Content-Type: application/json

{
  "participants": [
    "5215511111111@s.whatsapp.net"
  ]
}
```

#### Eliminar participantes

```http
POST /api/v1/instances/:instanceId/groups/:groupId/participants/remove
Content-Type: application/json

{
  "participants": [
    "5215511111111@s.whatsapp.net"
  ]
}
```

## 🏗️ Arquitectura

### Hexagonal Architecture (Ports & Adapters)

El proyecto sigue arquitectura hexagonal con tres capas principales:

1. **Domain (Núcleo)**: Lógica de negocio pura, independiente de frameworks
2. **Application**: Casos de uso y orquestación
3. **Infrastructure**: Adaptadores para tecnologías específicas (MongoDB, Express, Baileys)

### Domain-Driven Design (DDD)

- **Entities**: `WhatsAppInstance`, `Message`, `Group`
- **Value Objects**: `InstanceId`, `PhoneNumber`, `ConnectionStatus`
- **Aggregates**: `WhatsAppInstanceAggregate` como raíz de agregado
- **Domain Events**: `InstanceConnectedEvent`, `MessageReceivedEvent`, etc.
- **Repositories**: Interfaces para persistencia

### CQRS Pattern

Separación clara entre:

- **Commands**: Operaciones que modifican el estado (CreateInstance, SendMessage)
- **Queries**: Operaciones de solo lectura (GetInstance, ListInstances)
- **Handlers**: Procesadores específicos para cada comando/query

### Aggregate Root Pattern

`WhatsAppInstanceAggregate` actúa como raíz de agregado:

```typescript
const instance = WhatsAppInstanceAggregate.create('Mi Instancia');
instance.connect('5215512345678');
instance.generateQRCode('qr-code-data');

// Los eventos de dominio se generan automáticamente
const events = instance.domainEvents;
```

## 🔍 Características Técnicas

### ResponseHandler Homologado

Todas las respuestas HTTP siguen un formato consistente:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    timestamp: Date;
    requestId: string;
    audit?: AuditData;
  };
}
```

### Auditoría

Cada operación incluye datos de auditoría:

```typescript
interface AuditData {
  userId?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  details?: Record<string, any>;
}
```

### Logging

Sistema de logging estructurado con Pino:

```typescript
logger.info('Instance created', { instanceId, name });
logger.error('Connection failed', { error, instanceId });
```

### Manejo de Errores

Errores tipados y jerárquicos:

- `DomainError`: Errores del dominio
- `ValidationError`: Errores de validación
- `NotFoundError`: Recurso no encontrado
- `ConflictError`: Conflicto de recursos
- `InfrastructureError`: Errores de infraestructura
- `WhatsAppConnectionError`: Errores específicos de WhatsApp

## 🔐 Seguridad

- Validación de datos con `express-validator`
- Sanitización de inputs
- **Helmet** con políticas de cabeceras (CSP restrictiva, HSTS en producción detrás de HTTPS, políticas COOP/COEP/CORP según configuración)
- **CORS** con orígenes permitidos vía `ACCEPTED_ORIGINS` (obligatorio en producción)
- **Rate limiting** opcional en rutas bajo `/api/` cuando `ENABLED_RATE_LIMITS=true`
- Gestión segura de sesiones de WhatsApp
- Almacenamiento cifrado de credenciales (recomendado para producción)

## 📊 MongoDB Schema

```javascript
{
  instanceId: String (unique, indexed),
  name: String (required, unique),
  status: String (enum),
  phoneNumber: String (indexed),
  qrCode: String,
  pairingCode: String,
  webhookUrl: String,
  sessionData: Mixed,
  lastConnectedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚦 Estados de Conexión

- `disconnected`: Sin conexión
- `connecting`: Conectando
- `connected`: Conectado y listo
- `qr_ready`: QR generado, esperando escaneo
- `pairing_code_ready`: Código de emparejamiento generado
- `error`: Error en la conexión

## 🧪 Tests

En el estado actual del repositorio **no hay suite de tests configurada** en `package.json` (no existe script `test` ni dependencias Jest/Vitest). Si quieres añadir tests, configura el runner que prefieras e incorpora el script correspondiente.

## 📝 Ejemplo de Uso Completo

```typescript
// 1. Crear instancia
POST /api/v1/instances
{
  "name": "Ventas",
  "usePairingCode": false
}

// 2. Obtener QR (JSON) o abrir en navegador la vista HTML
GET /api/v1/instances/{instanceId}/qr
GET /api/v1/instances/{instanceId}/qr/view

// 3. Esperar conexión (webhook o polling)

// 4. Listar chats o grupos (instancia conectada)
GET /api/v1/instances/{instanceId}/chats
GET /api/v1/instances/{instanceId}/groups

// 5. Enviar mensaje
POST /api/v1/messages/{instanceId}/send
{
  "to": "5215512345678@s.whatsapp.net",
  "message": "¡Hola!"
}

// 6. Crear grupo
POST /api/v1/instances/{instanceId}/groups
{
  "name": "Equipo Ventas",
  "participants": ["5215512345678@s.whatsapp.net"]
}
```

## 🔧 Configuración Avanzada

### Configurar path de sesiones

Por defecto, las credenciales de Baileys se guardan en el sistema de archivos bajo `{cwd}/sessions/{instanceId}` (ver `BaileysAdapter.ts`). El proyecto también incluye utilidades de auth orientadas a MongoDB (`useMongoAuthState`); si quieres persistir solo en BD, habría que integrar ese flujo en el adaptador.

### Configurar reconexión automática

El `BaileysAdapter` maneja reconexiones automáticas. Personaliza el comportamiento en el método `setupEventHandlers`.

### Webhooks

Configura webhooks al crear instancias para recibir eventos en tiempo real:

```json
{
  "name": "Mi Instancia",
  "webhookUrl": "https://mi-servidor.com/webhook"
}
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🙏 Agradecimientos

- [Baileys](https://github.com/WhiskeySockets/Baileys) - Librería de WhatsApp
- [Express](https://expressjs.com/) - Framework web
- [MongoDB](https://www.mongodb.com/) - Base de datos
- [TypeScript](https://www.typescriptlang.org/) - Superset de JavaScript

## 📞 Soporte

Para preguntas o issues, por favor abre un issue en el repositorio.
