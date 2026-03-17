# WhatsApp Multi-Instance API con Baileys

API REST profesional para interactuar con WhatsApp usando la librería Baileys, construida con Node.js, TypeScript y siguiendo principios de arquitectura hexagonal, DDD, CQRS y patrones de diseño empresariales.

## 🚀 Características

- ✅ **Multi-instancia**: Soporte para múltiples sesiones de WhatsApp simultáneas
- ✅ **Conexión flexible**: Sincronización mediante QR o código de emparejamiento
- ✅ **Multimedia completo**: Imágenes, documentos, audio, video, ubicaciones
- ✅ **Reacciones con emojis**: Responder mensajes con emojis
- ✅ **Notas de voz**: Soporte para mensajes PTT (Push To Talk)
- ✅ **Baileys v7**: Última versión con mejores características y rendimiento
- ✅ **ES Modules**: Arquitectura moderna con ESM
- ✅ **Arquitectura hexagonal**: Separación clara entre dominio, aplicación e infraestructura
- ✅ **DDD**: Entidades, Value Objects, Aggregates y Domain Events
- ✅ **CQRS**: Separación entre comandos y consultas
- ✅ **MongoDB**: Persistencia de instancias y sesiones
- ✅ **Auditoría completa**: Tracking de todas las operaciones
- ✅ **Logging robusto**: Sistema de logs con Pino
- ✅ **Manejo de errores**: Gestión centralizada y tipada de errores
- ✅ **ResponseHandler homologado**: Respuestas consistentes en toda la API
- ✅ **Validación**: Validación de datos con express-validator
- ✅ **TypeScript estricto**: Tipado fuerte en todo el proyecto

## 📋 Requisitos Previos

- Node.js >= 20.x (recomendado para ESM)
- MongoDB >= 6.x
- npm >= 9.x o yarn

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

Este proyecto carga variables desde un archivo `.env` (vía `dotenv`). Actualmente el repo **no incluye** `.env.example`, así que crea un `.env` en la raíz con una configuración mínima como esta:

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
- Para base de datos, `DB_TYPE` soporta `mongoose | typeorm | sequelize` (en este repo se usa típicamente `mongoose`).

### 4. Compilar TypeScript

```bash
npm run build
```

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

#### Desconectar instancia

```http
POST /api/v1/instances/:instanceId/disconnect
```

#### Eliminar instancia

```http
DELETE /api/v1/instances/:instanceId
```

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
curl -X POST http://localhost:3000/api/v1/multimedia/:instanceId/send/image \
  -F "image=@imagen.jpg" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "caption=¡Mira esta imagen! 📸"
```

#### Enviar documento (PDF, Word, Excel, etc.)

```bash
curl -X POST http://localhost:3000/api/v1/multimedia/:instanceId/send/document \
  -F "document=@documento.pdf" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "caption=Documento adjunto"
```

#### Enviar audio / nota de voz

```bash
# Audio normal
curl -X POST http://localhost:3000/api/v1/multimedia/:instanceId/send/audio \
  -F "audio=@audio.mp3" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "ptt=false"

# Nota de voz (PTT)
curl -X POST http://localhost:3000/api/v1/multimedia/:instanceId/send/audio \
  -F "audio=@voz.ogg" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "ptt=true"
```

#### Enviar video / GIF

```bash
# Video normal
curl -X POST http://localhost:3000/api/v1/multimedia/:instanceId/send/video \
  -F "video=@video.mp4" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "caption=¡Mira esto! 🎥"

# GIF animado
curl -X POST http://localhost:3000/api/v1/multimedia/:instanceId/send/video \
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
curl -X POST http://localhost:3000/api/v1/multimedia/:instanceId/send/sticker \
  -F "sticker=@sticker.webp" \
  -F "to=5215512345678@s.whatsapp.net"
```

### Grupos

#### Crear grupo

```http
POST /api/v1/groups/:instanceId/groups
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
POST /api/v1/groups/:instanceId/groups/:groupId/participants/add
Content-Type: application/json

{
  "participants": [
    "5215511111111@s.whatsapp.net"
  ]
}
```

#### Eliminar participantes

```http
POST /api/v1/groups/:instanceId/groups/:groupId/participants/remove
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

## 🧪 Testing (Recomendado)

```bash
# Instalar dependencias de testing
npm install --save-dev jest @types/jest ts-jest

# Ejecutar tests
npm test
```

## 📝 Ejemplo de Uso Completo

```typescript
// 1. Crear instancia
POST /api/v1/instances
{
  "name": "Ventas",
  "usePairingCode": false
}

// 2. Obtener QR para escanear
GET /api/v1/instances/{instanceId}/qr

// 3. Esperar conexión (webhook o polling)

// 4. Enviar mensaje
POST /api/v1/messages/{instanceId}/send
{
  "to": "5215512345678@s.whatsapp.net",
  "message": "¡Hola!"
}

// 5. Crear grupo
POST /api/v1/groups/{instanceId}/groups
{
  "name": "Equipo Ventas",
  "participants": ["5215512345678@s.whatsapp.net"]
}
```

## 🔧 Configuración Avanzada

### Configurar path de sesiones

Por defecto, las sesiones se guardan en `./sessions/{instanceId}`. Puedes modificar esto en `BaileysAdapter.ts`.

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
