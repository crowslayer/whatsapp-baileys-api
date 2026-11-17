# WhatsApp Multi-Instance API with Baileys

WhatsApp Multi-Instance REST API
Built with Baileys, TypeScript, Clean Architecture & DDD

👉 Spanish version: README.es.md

A professional REST API for interacting with WhatsApp using the Baileys library, built with Node.js, TypeScript, and following Hexagonal Architecture, DDD, CQRS, and enterprise design patterns.

- **Releases (tags)**: `v1.0.1`, `v1.1.0`, `v1.3.0`
- **Current version**: 1.7.2
- **Tags**: use `v1.1.0` format for publishing releases
- **Changelog**: see `CHANGELOG.md`

## 🚀 Features

- ✅ **Multi-instance**: Support for multiple simultaneous WhatsApp sessions
- ✅ **Flexible connection**: Sync via QR code or pairing code
- ✅ **QR in browser**: `GET .../qr/view` route renders an HTML page with the QR code (useful outside production; in production the app does not mount EJS views)
- ✅ **Chat queries**: List conversations/chats associated with a connected instance
- ✅ **Group queries**: List WhatsApp groups from the account linked to the instance
- ✅ **Full multimedia support**: Images, documents, audio, video, locations, vCard contacts, and WebP stickers
- ✅ **Emoji reactions**: Reply to messages with emojis
- ✅ **Voice notes**: PTT (Push To Talk) message support
- ✅ **Baileys 7 (RC)**: `@whiskeysockets/baileys` on the 7.x branch (e.g. `7.0.0-rc.x`)
- ✅ **Message retries**: Internal cache (`node-cache`) integrated with Baileys for the message retry flow
- ✅ **ES Modules**: Modern ESM architecture
- ✅ **Hexagonal Architecture**: Clear separation between domain, application, and infrastructure
- ✅ **Dependency injection**: Container with `node-dependency-injection` and YAML-declared services
- ✅ **DDD**: Entities, Value Objects, Aggregates, and Domain Events
- ✅ **CQRS**: Separation between commands and queries
- ✅ **MongoDB**: Instance and session persistence
- ✅ **Full auditing**: Tracking of all operations
- ✅ **Robust logging**: Log system with Pino
- ✅ **Error handling**: Centralized and typed error management
- ✅ **Standardized ResponseHandler**: Consistent responses across the entire API
- ✅ **Validation**: Data validation with express-validator
- ✅ **HTTP Security**: Helmet with strict CSP, configurable CORS, and optional global rate limiting (`ENABLED_RATE_LIMITS=true`)
- ✅ **Health check**: `GET /health` for monitoring (status, timestamp, uptime)
- ✅ **Strict TypeScript**: Strong typing throughout the project
- 🚀 **Campaigns management**: Support for creating, scheduling, and monitoring message campaigns. Includes a CampaignAggregate domain with CQRS-based orchestration (CampaignDispatcher, CampaignProcessor, CampaignScheduler, and CampaignRetryWorker) plus read/write campaign repositories.
- 🔄 **Campaign infrastructure**: Campaign services (CampaignService) and Mongo repositories (MongoCampaignReadRepository, MongoCampaignRepository) along with HTTP controllers and routes for managing campaigns via the API.
- 🧭 **Campaign domain**: New aggregates and value objects for campaign flows (FlowDefinitionAggregate, FlowId, CampaignAggregate, etc.).
- 🧩 **Future extensibility**: Structure ready for adding metrics, progress status, and campaign reports.

## 📋 Prerequisites

- Node.js >= 20.x (recommended for ESM)
- MongoDB >= 6.x
- **pnpm 9.12.3** (declared in `package.json`)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd whatsapp-baileys-api
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

The project loads variables from `.env` (via `dotenv`). You can start from the template:

```bash
# Linux / macOS / Git Bash
cp .env.example .env
# Windows (PowerShell)
# Copy-Item .env.example .env
```

Adjust the values; minimum reference configuration:

```env
# Runtime
NODE_ENV=development
PORT=3333
API_PATH=api
API_VERSION=v1
APP_URL=http://localhost:3333

# Database (MongoDB via mongoose)
DB_TYPE=mongoose
DB_ENABLED=true
DB_URI=mongodb://localhost:27017/whatsapp-api

# Security
SECURITY_TYPE=jwt
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-chars
JWT_EXPIRES=1d
JWT_REFRESH_EXPIRES=7d

# CORS (comma-separated). Required in production.
ACCEPTED_ORIGINS=http://localhost:3000,http://localhost:4200

# Optional (booleans as strings)
PROTECT_ROUTES=false
ENABLED_RATE_LIMITS=false
```

Notes:

- **`NODE_ENV` is required** and only accepts: `development | production | test | staging`.
- In **production**, **`APP_URL`** and **`ACCEPTED_ORIGINS`** are required; if using JWT, **`JWT_SECRET`** must be at least **32 characters**.
- For the database, `DB_TYPE` supports `mongoose | typeorm | sequelize` (the main flow is tested with **mongoose**; other adapters require `DB_HOST`, `DB_PORT`, etc., per `FactoryConfig.ts`).
- **`SECURITY_TYPE`**: `jwt` (default in examples) or **`oauth2`**, which requires `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, and `OAUTH_AUTH_SERVER`.
- **`PROTECT_ROUTES`**: read in configuration, but currently **no auth middleware is applied to routes**; treat it as reserved for future evolution.

### Useful scripts (`package.json`)

| Script                             | Description                                              |
| ---------------------------------- | -------------------------------------------------------- |
| `pnpm run dev`                     | Hot-reload server with `tsx watch`                       |
| `pnpm run build`                   | Compiles TypeScript, resolves aliases, and copies assets |
| `pnpm start`                       | Runs `dist/apps/backend/index.js` after a build          |
| `pnpm run type-check`              | Runs `tsc --noEmit`                                      |
| `pnpm run lint` / `lint:fix`       | Runs ESLint                                              |
| `pnpm run format` / `format:check` | Runs Prettier on `src/**`                                |
| `pnpm run validate`                | Runs type-check, lint, and format checks                 |
| `pnpm run clean`                   | Removes the generated `dist/` directory                  |

### 4. Compile TypeScript

```bash
pnpm run build
```

The build script compiles TypeScript, resolves aliases with `tsc-alias`, and copies assets to `dist/`.

### 5. Start the application

**Development:**

```bash
pnpm run dev
```

**Production:**

```bash
pnpm start
```

## 🔌 API Endpoints

The base API URL is `http://localhost:{PORT}/{API_PATH}/{API_VERSION}` (defaults: `PORT=3333`, `API_PATH=api`, `API_VERSION=v1` → `http://localhost:3333/api/v1`).

### Service health

```http
GET /health
```

Returns a JSON response with `status`, `timestamp`, and process `uptime`.

### Instances

#### Create a new instance

```http
POST /api/v1/instances
Content-Type: application/json

{
  "name": "My First Instance",
  "webhookUrl": "https://my-webhook.com/whatsapp",
  "usePairingCode": false
}
```

**With pairing code:**

```json
{
  "name": "Instance with Code",
  "usePairingCode": true,
  "phoneNumber": "5215512345678"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Instance created successfully",
  "data": {
    "instanceId": "uuid-instance-id",
    "name": "My First Instance",
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

#### List instances

```http
GET /api/v1/instances
```

#### Get instance by ID

```http
GET /api/v1/instances/:instanceId
```

#### Get QR Code

```http
GET /api/v1/instances/:instanceId/qr
```

#### Get QR / connection status

```http
GET /api/v1/instances/:instanceId/qr/status
```

#### HTML QR view (browser)

```http
GET /api/v1/instances/:instanceId/qr/view
```

Available when the app is **not** in `production` mode (EJS views are not registered in that environment).

#### Disconnect instance

```http
POST /api/v1/instances/:instanceId/disconnect
```

#### Delete instance

```http
DELETE /api/v1/instances/:instanceId
```

### Chats

#### List instance chats

```http
GET /api/v1/instances/:instanceId/chats
```

Requires the instance to be connected to WhatsApp.

### Messages

#### Send a message

```http
POST /api/v1/messages/:instanceId/send
Content-Type: application/json

{
  "to": "5215512345678@s.whatsapp.net",
  "message": "Hello from the API!"
}
```

### Multimedia

#### Send image

```bash
curl -X POST http://localhost:3333/api/v1/multimedia/:instanceId/send/image \
  -F "image=@image.jpg" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "caption=Check out this image! 📸"
```

#### Send document (PDF, Word, Excel, etc.)

```bash
curl -X POST http://localhost:3333/api/v1/multimedia/:instanceId/send/document \
  -F "document=@document.pdf" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "caption=Attached document"
```

#### Send audio / voice note

```bash
# Normal audio
curl -X POST http://localhost:3333/api/v1/multimedia/:instanceId/send/audio \
  -F "audio=@audio.mp3" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "ptt=false"

# Voice note (PTT)
curl -X POST http://localhost:3333/api/v1/multimedia/:instanceId/send/audio \
  -F "audio=@voice.ogg" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "ptt=true"
```

#### Send video / GIF

```bash
# Normal video
curl -X POST http://localhost:3333/api/v1/multimedia/:instanceId/send/video \
  -F "video=@video.mp4" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "caption=Watch this! 🎥"

# Animated GIF
curl -X POST http://localhost:3333/api/v1/multimedia/:instanceId/send/video \
  -F "video=@animation.mp4" \
  -F "to=5215512345678@s.whatsapp.net" \
  -F "gifPlayback=true"
```

#### Send location

```http
POST /api/v1/multimedia/:instanceId/send/location
Content-Type: application/json

{
  "to": "5215512345678@s.whatsapp.net",
  "latitude": 20.9674,
  "longitude": -89.6243,
  "name": "Merida, Yucatan",
  "address": "Historic Center"
}
```

#### Send reaction (emoji)

```http
POST /api/v1/multimedia/:instanceId/send/reaction
Content-Type: application/json

{
  "chatId": "5215512345678@s.whatsapp.net",
  "messageId": "MESSAGE_ID",
  "emoji": "❤️"
}
```

#### Send contact(s)

```http
POST /api/v1/multimedia/:instanceId/send/contact
Content-Type: application/json

{
  "to": "5215512345678@s.whatsapp.net",
  "contacts": [
    {
      "displayName": "John Doe",
      "vcard": "BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL;type=CELL:+5215512345678\nEND:VCARD"
    }
  ]
}
```

#### Send sticker (WebP)

```bash
curl -X POST http://localhost:3333/api/v1/multimedia/:instanceId/send/sticker \
  -F "sticker=@sticker.webp" \
  -F "to=5215512345678@s.whatsapp.net"
```

### Groups

Group routes live under the instance prefix: `/api/v1/instances/:instanceId/groups`.

#### List groups

```http
GET /api/v1/instances/:instanceId/groups
```

#### Create group

```http
POST /api/v1/instances/:instanceId/groups
Content-Type: application/json

{
  "name": "My Group",
  "participants": [
    "5215512345678@s.whatsapp.net",
    "5215587654321@s.whatsapp.net"
  ]
}
```

#### Add participants

```http
POST /api/v1/instances/:instanceId/groups/:groupId/participants/add
Content-Type: application/json

{
  "participants": [
    "5215511111111@s.whatsapp.net"
  ]
}
```

#### Remove participants

```http
POST /api/v1/instances/:instanceId/groups/:groupId/participants/remove
Content-Type: application/json

{
  "participants": [
    "5215511111111@s.whatsapp.net"
  ]
}
```

## 🏗️ Architecture

### Source layout

```text
src/
  apps/backend/                 # HTTP delivery, application startup, and dependency wiring
  context/
    modules/<module>/           # Business modules, each organized by layer
      domain/
      application/
      infrastructure/
    shared/                     # Contracts and adapters shared across modules
      domain/
      application/
      infrastructure/
tests/                          # Mirrors the source hierarchy
  context/
    modules/<module>/...        # For example: tests/context/modules/messages/application/...
    shared/...                  # For example: tests/context/shared/infrastructure/...
```

The TypeScript aliases are `@apps/*` → `src/apps/*`, `@modules/*` → `src/context/modules/*`, and `@shared/*` → `src/context/shared/*`. Unit tests use the same relative layout under `tests/` and are named `*.test.ts`.

### Hexagonal Architecture (Ports & Adapters)

The project follows hexagonal architecture with three main layers:

1. **Domain (Core)**: Pure business logic, independent of frameworks
2. **Application**: Use cases and orchestration
3. **Infrastructure**: Adapters for specific technologies (MongoDB, Express, Baileys)

### Domain-Driven Design (DDD)

- **Entities**: `WhatsAppInstance`, `Message`, `Group`
- **Value Objects**: `InstanceId`, `PhoneNumber`, `ConnectionStatus`
- **Aggregates**: `WhatsAppInstanceAggregate` as the aggregate root
- **Domain Events**: `InstanceConnectedEvent`, `MessageReceivedEvent`, etc.
- **Repositories**: Interfaces for persistence

### CQRS Pattern

Clear separation between:

- **Commands**: Operations that modify state (CreateInstance, SendMessage)
- **Queries**: Read-only operations (GetInstance, ListInstances)
- **Handlers**: Specific processors for each command/query

### Aggregate Root Pattern

`WhatsAppInstanceAggregate` acts as the aggregate root:

```typescript
const instance = WhatsAppInstanceAggregate.create('My Instance');
instance.connect('5215512345678');
instance.generateQRCode('qr-code-data');

// Domain events are generated automatically
const events = instance.domainEvents;
```

## 🔍 Technical Features

### Standardized ResponseHandler

All HTTP responses follow a consistent format:

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

### Auditing

Each operation includes audit data:

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

Structured logging system with Pino:

```typescript
logger.info('Instance created', { instanceId, name });
logger.error('Connection failed', { error, instanceId });
```

### Error Handling

Typed and hierarchical errors:

- `DomainError`: Domain errors
- `ValidationError`: Validation errors
- `NotFoundError`: Resource not found
- `ConflictError`: Resource conflicts
- `InfrastructureError`: Infrastructure errors
- `WhatsAppConnectionError`: WhatsApp-specific errors

## 🔐 Security

- Data validation with `express-validator`
- Input sanitization
- **Helmet** with header policies (strict CSP, HSTS in production behind HTTPS, COOP/COEP/CORP policies as configured)
- **CORS** with allowed origins via `ACCEPTED_ORIGINS` (required in production)
- **Rate limiting** optional on routes under `/api/` when `ENABLED_RATE_LIMITS=true`
- Secure WhatsApp session management
- Encrypted credential storage (recommended for production)

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

## 🚦 Connection States

- `disconnected`: No connection
- `connecting`: Connecting
- `connected`: Connected and ready
- `qr_ready`: QR generated, waiting for scan
- `pairing_code_ready`: Pairing code generated
- `error`: Connection error

## 🧪 Tests

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm run test:unit

# Run integration tests only
pnpm run test:integration

# Run tests with coverage
pnpm run test:coverage
```

The project uses **Vitest**. Test files live under `tests/` and mirror their source paths. For example, `src/context/modules/messages/application/text/TextMessageSender.ts` is tested in `tests/context/modules/messages/application/text/TextMessageSender.test.ts`.

## 📝 Complete Usage Example

```typescript
// 1. Create instance
POST /api/v1/instances
{
  "name": "Sales",
  "usePairingCode": false
}

// 2. Get QR (JSON) or open the HTML view in a browser
GET /api/v1/instances/{instanceId}/qr
GET /api/v1/instances/{instanceId}/qr/view

// 3. Wait for connection (webhook or polling)

// 4. List chats or groups (connected instance)
GET /api/v1/instances/{instanceId}/chats
GET /api/v1/instances/{instanceId}/groups

// 5. Send message
POST /api/v1/messages/{instanceId}/send
{
  "to": "5215512345678@s.whatsapp.net",
  "message": "Hello!"
}

// 6. Create group
POST /api/v1/instances/{instanceId}/groups
{
  "name": "Sales Team",
  "participants": ["5215512345678@s.whatsapp.net"]
}
```

## 🔧 Advanced Configuration

### Configure session path

By default, Baileys credentials are saved to the filesystem under `{cwd}/sessions/{instanceId}` (see `BaileysAdapter.ts`). The project also includes MongoDB-oriented auth utilities (`useMongoAuthState`); to persist in the database only, integrate that flow into the adapter.

### Configure automatic reconnection

`BaileysAdapter` handles automatic reconnections. Customize the behavior in the `setupEventHandlers` method.

### Webhooks

Configure webhooks when creating instances to receive real-time events:

```json
{
  "name": "My Instance",
  "webhookUrl": "https://my-server.com/webhook"
}
```

## 🤝 Contributing

Contributions are welcome. Please:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp library
- [Express](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [TypeScript](https://www.typescriptlang.org/) - JavaScript superset

## 📞 Support

For questions or issues, please open an issue in the repository.
