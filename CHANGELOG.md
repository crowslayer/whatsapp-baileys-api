## [1.4.0](https://github.com/crowslayer/whatsapp-baileys-api/compare/v1.3.0...v1.4.0) (2026-10-03)

### New Features

* add AuthMiddleware for token authentication ([1918396](https://github.com/crowslayer/whatsapp-baileys-api/commit/1918396002cfbd1dd1c6f37077ae8cb68a09155c))
* add BaileysMessageMapper for incoming message transformation ([7fa1d9e](https://github.com/crowslayer/whatsapp-baileys-api/commit/7fa1d9eef14b2d270ce8b7b90b428af2a6cf9f8f))
* add CampaignInitializeEvent class for campaign initialization ([d81ca22](https://github.com/crowslayer/whatsapp-baileys-api/commit/d81ca22bbf931955af7140ae76e44b838fdeb247))
* add connect route to instance router for handling connection requests ([4579168](https://github.com/crowslayer/whatsapp-baileys-api/commit/4579168a65cafacdf8c666cf5d75a1eafc177b14))
* add connection event subscriber and connect instance controller service ([82074ab](https://github.com/crowslayer/whatsapp-baileys-api/commit/82074ab2b4cf40e2013ef8006793724684dd654a))
* add DatabaseConfigBuilder for dynamic database configuration ([9b6da29](https://github.com/crowslayer/whatsapp-baileys-api/commit/9b6da29d96dc71ba92b98383bacc398f95175e41))
* add environment variable parsing utilities ([20d8095](https://github.com/crowslayer/whatsapp-baileys-api/commit/20d80954bced8ebb8079389baac562d05261fe1d))
* add IMessageReadRepository interface for message retrieval operations ([841d20b](https://github.com/crowslayer/whatsapp-baileys-api/commit/841d20b4a8966059a76875637198d9e073fd81bd))
* add jsonwebtoken and @types/jsonwebtoken dependencies ([231b00c](https://github.com/crowslayer/whatsapp-baileys-api/commit/231b00c667380be9bc5b5130784596294dfc7f7a))
* add MessagePayload type for structured message handling ([fb96350](https://github.com/crowslayer/whatsapp-baileys-api/commit/fb9635008474de9eefc87925db792683323b7d24))
* add MongoMessageRepository and MongoMessageReadRepository for message handling ([b49dc79](https://github.com/crowslayer/whatsapp-baileys-api/commit/b49dc79a5718ddd45d63fdda886e2906b54a1dcf))
* add NetworkUrlValidator for comprehensive URL validation ([428e3e5](https://github.com/crowslayer/whatsapp-baileys-api/commit/428e3e53f14085672e1d88d799bb2f5630daddc2))
* add parseEnvironment function for environment validation ([701ebbf](https://github.com/crowslayer/whatsapp-baileys-api/commit/701ebbf7f648469a432d104dc20b945e8d7f334f))
* add token validation interfaces for user authentication ([1943bcb](https://github.com/crowslayer/whatsapp-baileys-api/commit/1943bcb841c3fe95fdc6cc65c088060055cb27ca))
* add TokenVerifierFactory for token verification logic ([882cdaf](https://github.com/crowslayer/whatsapp-baileys-api/commit/882cdafa999eaf76b2958df1f90d25a26d34dced))
* add utility functions for environment variable handling ([7ca7833](https://github.com/crowslayer/whatsapp-baileys-api/commit/7ca783339196003592b06313fd16d88af1a9eee3))
* **controller:** add validation for messageId and emoji in SendReactionController to ensure required fields are present ([cb80073](https://github.com/crowslayer/whatsapp-baileys-api/commit/cb80073593c61542087f0dbaac44da87e4912fb4))
* **controller:** add validation for participants in AddParticipantsController and RemoveParticipantsController to ensure a non-empty array is provided ([da95b34](https://github.com/crowslayer/whatsapp-baileys-api/commit/da95b345514f671d8412ac929a385da57646e51c))
* **DomainEventDeserializer:** implement DomainEventDeserializer for event deserialization ([12623c2](https://github.com/crowslayer/whatsapp-baileys-api/commit/12623c2beef0f92cb72ffe076c0f851844369f6d))
* **DomainEventJsonSerializer:** add DomainEventJsonSerializer for event serialization ([0f7f80f](https://github.com/crowslayer/whatsapp-baileys-api/commit/0f7f80fc3112c59e506fc092c4e1d2a9a5791660))
* **DomainEventSubscribers:** implement DomainEventSubscribers class for managing event subscribers ([edae52f](https://github.com/crowslayer/whatsapp-baileys-api/commit/edae52f69ef796fea7cbac22cf69632720df3828))
* enhance BaileysConnection configuration for improved connection handling ([cd7252d](https://github.com/crowslayer/whatsapp-baileys-api/commit/cd7252d161d3ee2b99db592914cb42cc715683eb))
* enhance JWT and OAuth2 security configurations ([43a40db](https://github.com/crowslayer/whatsapp-baileys-api/commit/43a40dbe7a2c4542ed8f75a9f727f70da7ba3e71))
* enhance server configuration and error handling in application bootstrap ([a42f4ad](https://github.com/crowslayer/whatsapp-baileys-api/commit/a42f4addfac3fdad18b44351030afb47c4003d08))
* enhance SocketGateway with authentication and CORS support ([778f871](https://github.com/crowslayer/whatsapp-baileys-api/commit/778f8719c435621ceefc0cc8645485c65c355067))
* **EventId:** implement EventId value object for unique event identification ([5b8de28](https://github.com/crowslayer/whatsapp-baileys-api/commit/5b8de28e368abd2bd3280e56a0f5a71ed474bf25))
* **EventSubscribers:** add new event subscribers for QR code generation and message reception ([115fa79](https://github.com/crowslayer/whatsapp-baileys-api/commit/115fa79fb11135029c387bd9fc04ac98051e156d))
* **IDomainEventSubscriber:** add IDomainEventSubscriber interface for event subscription management ([8bd365c](https://github.com/crowslayer/whatsapp-baileys-api/commit/8bd365ca7a6ceeaf7f5ea7bc0aaaa6cef305d4dc))
* **IEventBus:** introduce IEventBus interface for event publishing and subscriber management ([f90c50a](https://github.com/crowslayer/whatsapp-baileys-api/commit/f90c50afedc30ed429c73c120dd2ff967d65f610))
* implement CampaignRetryer class for campaign retry functionality ([9c9d28c](https://github.com/crowslayer/whatsapp-baileys-api/commit/9c9d28c22f8f54113ada1c737905802b8f88fe4e))
* implement CampaignRunnerSubscriber for handling campaign initialization events ([853819d](https://github.com/crowslayer/whatsapp-baileys-api/commit/853819dcc6ee7479400f835cfbee5b871940e06e))
* implement ConnectionEventsSubscriber and InstanceConnectedSubscriber for event handling ([1e1a6be](https://github.com/crowslayer/whatsapp-baileys-api/commit/1e1a6be2109477309f066d9d644729ed395255e2))
* implement JwtAdapter for token generation and verification ([6e9055b](https://github.com/crowslayer/whatsapp-baileys-api/commit/6e9055b8cdef4dd995d2df8f04556c98798f261f))
* implement MessageModel for structured message storage ([412673e](https://github.com/crowslayer/whatsapp-baileys-api/commit/412673e2f2f456c0be76044fc5d0b58abc00adb1))
* implement MongoMessageReadRepository for message retrieval in MongoDB ([647a13b](https://github.com/crowslayer/whatsapp-baileys-api/commit/647a13b5ae5d66b2eb864e4ef03d0863295557de))
* implement MongoMessageRepository for MongoDB message persistence ([8402f1b](https://github.com/crowslayer/whatsapp-baileys-api/commit/8402f1bf6ae9d3e4d3fe26705c7e99d33ffdfeda))
* implement RealtimeAuthorization for instance and campaign access control ([f5ae887](https://github.com/crowslayer/whatsapp-baileys-api/commit/f5ae8877fcea4a4dbdc6396487614ae464be3db0))
* implement SecurityConfigBuilder for dynamic security configuration ([ba2a19b](https://github.com/crowslayer/whatsapp-baileys-api/commit/ba2a19b7a83f8a9f51bcb96624c96ff7acf3331f))
* implement SocketAuthenticator for token-based user authentication ([af62559](https://github.com/crowslayer/whatsapp-baileys-api/commit/af6255973aaae10ed48c9a82d778395e3340f249))
* implement WebhookConfigBuilder for dynamic webhook configuration ([aa90e6d](https://github.com/crowslayer/whatsapp-baileys-api/commit/aa90e6d56da3ab190125008bba3d8a7556d1a9fb))
* **InMemoryEventBus:** implement InMemoryEventBus for event publishing and subscriber management ([4e41e42](https://github.com/crowslayer/whatsapp-baileys-api/commit/4e41e427f7cbad79ae9b863aed58f54e2e46e892))
* **InstanceConnectedEvent:** add eventName property to InstanceConnectedEvent class ([32a69ae](https://github.com/crowslayer/whatsapp-baileys-api/commit/32a69ae318aa05a30edc6a46f0d16a3fc5f68be9))
* integrate token verification into ExpressApp and update infrastructure configuration ([7794450](https://github.com/crowslayer/whatsapp-baileys-api/commit/779445079f100ab4908976e2f05981a01672e3ff))
* integrate webhook configuration and service handling ([555d7c2](https://github.com/crowslayer/whatsapp-baileys-api/commit/555d7c279dd06aeecc7502f8f2d7f7a7a90219a0))
* introduce CampaignRunner class for executing campaign processes ([bf63737](https://github.com/crowslayer/whatsapp-baileys-api/commit/bf63737b12be979f19382f7e660ba75951f2e43d))
* **logger:** enhance PinoLogger with return types and add BootstrapConsole class ([12004f2](https://github.com/crowslayer/whatsapp-baileys-api/commit/12004f256824bf08379284306baa9ccaed63f9e8))
* **MessageReceivedSubscriber:** implement subscriber for handling MessageReceivedEvent ([1d126c6](https://github.com/crowslayer/whatsapp-baileys-api/commit/1d126c6ef35e6eb7c6ed9aad50364910e7bf7c4c))
* **MockPhoneNormalizer:** add mock implementation for phone normalization ([4e56885](https://github.com/crowslayer/whatsapp-baileys-api/commit/4e56885c31bce1daca7e63ad6ef5620a08faed9c))
* **NotifyInstanceConnected:** implement subscriber for InstanceConnectedEvent ([73d69e0](https://github.com/crowslayer/whatsapp-baileys-api/commit/73d69e09f571f8d1b31548590f0a63959a7e9400))
* **QRCodePersist:** add QRCodePersist service for QR code storage and update event subscriber ([c5902d8](https://github.com/crowslayer/whatsapp-baileys-api/commit/c5902d8985f4dabdc20ab5b0e37f7999ad290419))
* **QRCodePersist:** implement QRCodePersist class for event publishing ([c191657](https://github.com/crowslayer/whatsapp-baileys-api/commit/c191657e139ae0f93d6356599551560f0cfa19f2))
* refactor message handling to use structured types and improve clarity ([a649c2f](https://github.com/crowslayer/whatsapp-baileys-api/commit/a649c2f6df156cf451f3863518d1784a3ab41415))
* **StoreQRCodeGenerated:** implement subscriber for QRCodeGeneratedEvent ([292c67f](https://github.com/crowslayer/whatsapp-baileys-api/commit/292c67f58f029d3313254353f6ec5e9187ff882b))
* **tests:** add comprehensive state transition tests for FlowAggregate ([dbb69b3](https://github.com/crowslayer/whatsapp-baileys-api/commit/dbb69b36a72a65c4a59ce0bf3bdb6289ed0c1ecc))
* **tests:** add comprehensive test suite for flows, including unit, integration, and E2E tests, and implement CI workflow for automated testing ([e436e93](https://github.com/crowslayer/whatsapp-baileys-api/commit/e436e93c0da84e02682e4782b888c6af713416bc))
* **tests:** add comprehensive tests for BotService, FlowEngine, and FlowMapper ([98201f5](https://github.com/crowslayer/whatsapp-baileys-api/commit/98201f52dd792e089c611373b6a550ca29eed8c1))
* **tests:** add unit tests for AggregateRoot, Entity, ValueObject, CommandNotRegisteredError, and QueryNotRegisteredError ([3a92d4b](https://github.com/crowslayer/whatsapp-baileys-api/commit/3a92d4b7091042e6f4f6c7156eaf4f05ecc2e6e5))
* **tests:** add unit tests for campaign and flow controllers ([d9e1bf4](https://github.com/crowslayer/whatsapp-baileys-api/commit/d9e1bf49296a0ba49715da9f6265282cdff05262))
* **tests:** add unit tests for CampaignByIdQueryHandler and CampaignFinderById ([cd89458](https://github.com/crowslayer/whatsapp-baileys-api/commit/cd89458bc032413df2747a7d5d0a97b0b1c22b27))
* **tests:** add unit tests for CampaignEraser to validate delete functionality ([db5b28b](https://github.com/crowslayer/whatsapp-baileys-api/commit/db5b28bbdbaf9ef66a27f8ccc5487c9a578deb47))
* **tests:** add unit tests for CampaignResponse and CampaignsResponse classes ([229fdb2](https://github.com/crowslayer/whatsapp-baileys-api/commit/229fdb214adfdd2f75f2513af260ad1bc603f6ec))
* **tests:** add unit tests for CampaignUpdater to validate update functionality ([50b455f](https://github.com/crowslayer/whatsapp-baileys-api/commit/50b455fa6e52818a7a568b0f5e6336124218557b))
* **tests:** add unit tests for ChatAggregate to validate creation and updates ([fd42055](https://github.com/crowslayer/whatsapp-baileys-api/commit/fd42055fa39d04dbd1c20efe08a8a969996ad12c))
* **tests:** add unit tests for ChatId value object ([efca404](https://github.com/crowslayer/whatsapp-baileys-api/commit/efca404f2bda8b704eb7e116f12f779077227f3b))
* **tests:** add unit tests for ChatType value object ([dd15eb5](https://github.com/crowslayer/whatsapp-baileys-api/commit/dd15eb568ea13187f026196263f779ccf916286b))
* **tests:** add unit tests for command handlers to validate flow and node operations ([9d4c0c5](https://github.com/crowslayer/whatsapp-baileys-api/commit/9d4c0c559bfd5fc8cf3df553430f44bfa974570f))
* **tests:** add unit tests for ConnectionStatus value object ([1c11d70](https://github.com/crowslayer/whatsapp-baileys-api/commit/1c11d70643a4571d5e783f8c82c47ac47fceaa7a))
* **tests:** add unit tests for FindInstance to validate instance retrieval and error handling ([f4f61f5](https://github.com/crowslayer/whatsapp-baileys-api/commit/f4f61f563d6688dd49fc73301c3d4c8b3d7a6518))
* **tests:** add unit tests for FlowEraser to validate deactivation functionality ([c9b4a31](https://github.com/crowslayer/whatsapp-baileys-api/commit/c9b4a31a2e4fbd1570631740f7774cd2345fa935))
* **tests:** add unit tests for FlowUpdater to validate flow update functionality ([d7f6469](https://github.com/crowslayer/whatsapp-baileys-api/commit/d7f6469fd30350bffa8b902730480aa7ec2c3393))
* **tests:** add unit tests for group command handlers to validate group management functionalities ([75f0c8a](https://github.com/crowslayer/whatsapp-baileys-api/commit/75f0c8a805b8307c76565709abab9bb08832bd9a))
* **tests:** add unit tests for group management controllers ([fb76123](https://github.com/crowslayer/whatsapp-baileys-api/commit/fb7612375200d5be58be9f0903d9217e38745cac))
* **tests:** add unit tests for GroupInviteAccepted to validate invite acceptance functionality ([c6c33c9](https://github.com/crowslayer/whatsapp-baileys-api/commit/c6c33c973e0fd520f36ae1a42354d55ba8dd88db))
* **tests:** add unit tests for GroupLeaver to validate group leaving functionality ([bc95ad3](https://github.com/crowslayer/whatsapp-baileys-api/commit/bc95ad3e78241b69a6c5b48de7e475fc00cc7870))
* **tests:** add unit tests for GroupsFinder to validate group retrieval and synchronization ([953dfc5](https://github.com/crowslayer/whatsapp-baileys-api/commit/953dfc595684b09cdaeb8a0c016e60676b4fb206))
* **tests:** add unit tests for instance controllers ([ea2c7bc](https://github.com/crowslayer/whatsapp-baileys-api/commit/ea2c7bc12dbb69ace7a61abfa3dab7f7ba9d0a1d))
* **tests:** add unit tests for instance response and command handlers ([00394aa](https://github.com/crowslayer/whatsapp-baileys-api/commit/00394aaf089585d0ad7d96c4690df978b302a5b8))
* **tests:** add unit tests for InstancesConnect to validate instance connection functionality ([4eda17e](https://github.com/crowslayer/whatsapp-baileys-api/commit/4eda17e567e9e0c3cfb7dde548bf73ee409cb4d6))
* **tests:** add unit tests for InstancesDisconnect to validate instance disconnection functionality ([88bb279](https://github.com/crowslayer/whatsapp-baileys-api/commit/88bb279f84a1338ab9ef2ed2418a71896824998a))
* **tests:** add unit tests for InstancesEraser to validate instance deletion functionality ([3b65290](https://github.com/crowslayer/whatsapp-baileys-api/commit/3b6529065636afd881110e91d6349c42cbfd5c22))
* **tests:** add unit tests for InstancesSearcher to validate instance retrieval ([98801fc](https://github.com/crowslayer/whatsapp-baileys-api/commit/98801fc6c0a946949252cb90e9ccb196698b4129))
* **tests:** add unit tests for LinkGroupGetter to validate invite link retrieval ([802abd9](https://github.com/crowslayer/whatsapp-baileys-api/commit/802abd95b9e8ddba83e81b6fadc560155b8a21b6))
* **tests:** add unit tests for LinkGroupRevoker to validate invite link revocation ([ae3f74d](https://github.com/crowslayer/whatsapp-baileys-api/commit/ae3f74d04da5067526ed50bf8da419ecb6613fd9))
* **tests:** add unit tests for MessageReceivedEvent, PairingCodeGeneratedEvent, and QRCodeGeneratedEvent ([d9bb045](https://github.com/crowslayer/whatsapp-baileys-api/commit/d9bb0450d42086c6fb777a77715ae7c562428e1d))
* **tests:** add unit tests for NodeEventBus functionality ([ef6d7c4](https://github.com/crowslayer/whatsapp-baileys-api/commit/ef6d7c4b3b9e41f770444fcfd868ed75fa507bfc))
* **tests:** add unit tests for NodesCreator to validate node updates and error handling ([3686ae1](https://github.com/crowslayer/whatsapp-baileys-api/commit/3686ae19f6ea3c767914e847d7c593cae32a1a13))
* **tests:** add unit tests for NodesEraser to validate node reset functionality ([1e235b4](https://github.com/crowslayer/whatsapp-baileys-api/commit/1e235b4a0860dc69d38cde3c01112e584704320d))
* **tests:** add unit tests for normalizeBulk and PhoneNormalizer utilities ([77e5ef7](https://github.com/crowslayer/whatsapp-baileys-api/commit/77e5ef7c11385539ca7b9358c02ccd9702380a36))
* **tests:** add unit tests for ParticipantsDemoter to validate participant demotion functionality ([61537af](https://github.com/crowslayer/whatsapp-baileys-api/commit/61537af5e71d1257d24793b1dba4c195673fd43c))
* **tests:** add unit tests for PhoneNumber value object ([a512d25](https://github.com/crowslayer/whatsapp-baileys-api/commit/a512d25d7e22571d80121951989b153f57dd66c3))
* **tests:** add unit tests for QRCodeSearcher to validate QR code retrieval and status handling ([d83ddc9](https://github.com/crowslayer/whatsapp-baileys-api/commit/d83ddc975d4dd86112f67ddcf12cd6eab9cb6e34))
* **tests:** add unit tests for QRCodeStatus to validate connection state and error handling ([de756ae](https://github.com/crowslayer/whatsapp-baileys-api/commit/de756aefd770c0357793146056e5964822741d56))
* **tests:** add unit tests for SendAudio, SendContact, SendDocument, SendImage, SendLocation, SendReaction, SendSticker, SendText, and SendVideo controllers ([e99cd71](https://github.com/crowslayer/whatsapp-baileys-api/commit/e99cd71370282ec8a9ab9eb402e1247c9d5a1c94))
* **tests:** add unit tests for various error classes ([d5c305b](https://github.com/crowslayer/whatsapp-baileys-api/commit/d5c305bcf4abcb33c4c2128cee2fe4d8c04bbca3))
* **tests:** add unit tests for various message senders and command handlers ([fa1ba01](https://github.com/crowslayer/whatsapp-baileys-api/commit/fa1ba01fa288a7d89d3aa96700bf95e49a1bd8da))
* **tests:** add unit tests for WhatsAppInstanceAggregate to validate connection and disconnection behaviors ([f2fed83](https://github.com/crowslayer/whatsapp-baileys-api/commit/f2fed83277f83caae5846b1087240ea0ccbf8e75))
* **WhatsAppInstanceRuntime:** integrate domain event bus for QR code generation events ([fdd9737](https://github.com/crowslayer/whatsapp-baileys-api/commit/fdd9737a38df638f8f91a66f4264862617889b53))

### Correction of Errors

* **CampaignId:** update validation error message to reflect correct field name ([d981ae3](https://github.com/crowslayer/whatsapp-baileys-api/commit/d981ae393a60f0fb5e58ad6ff75e5c326aa1ff7c))
* **ci:** rename directories to lowercase for case-sensitive Linux FS ([215dad6](https://github.com/crowslayer/whatsapp-baileys-api/commit/215dad6890ba8f37a274c74e1e737dbc622529ee))
* **ci:** scope test:unit to exclude integration tests ([69cf53d](https://github.com/crowslayer/whatsapp-baileys-api/commit/69cf53d89f9d966d682df175ff1955103a98fcce))
* **ci:** use pnpm install without frozen-lockfile for cross-platform native bindings ([722505d](https://github.com/crowslayer/whatsapp-baileys-api/commit/722505d485c0018d4d30df203499dedfb9ef8601))
* **ConnectInstanceController:** update success message for instance connection ([ff05993](https://github.com/crowslayer/whatsapp-baileys-api/commit/ff05993676d84a838e077a1d14aca24d0eec2c8c))
* **controller:** correct method name from 'handlet' to 'handle' in DeleteNodesController for proper functionality ([2a2566b](https://github.com/crowslayer/whatsapp-baileys-api/commit/2a2566bb6e1343e98a6c7ed7f542d88b2d8d0df2))
* **EventId:** update validation error message to reflect correct field name ([7a7b0ef](https://github.com/crowslayer/whatsapp-baileys-api/commit/7a7b0ef336241a95e3c65b05884aa7d569f70d68))
* **flow:** handle empty nodes in FlowMapper and improve validation in FlowAggregate ([4bda9c1](https://github.com/crowslayer/whatsapp-baileys-api/commit/4bda9c13b71f6e55c9c42b1c999cdaeda6953cf7))
* **FlowId:** update validation error message to reflect correct field name ([3334b61](https://github.com/crowslayer/whatsapp-baileys-api/commit/3334b6123032eaee4d34b171e16559c5eff4cb80))
* improve documentation for setDisappearingMessages method ([3143afe](https://github.com/crowslayer/whatsapp-baileys-api/commit/3143afeaf7dd5682813839d38100c811f6693a00))
* **MongoCampaignRepository:** enhance error handling and improve clarity in campaign retrieval methods ([d009afa](https://github.com/crowslayer/whatsapp-baileys-api/commit/d009afae63974c76e27e07c13d0edeaca7c2fa29))
* **Name.test:** correct expected output for name creation tests and ensure consistent formatting ([f449434](https://github.com/crowslayer/whatsapp-baileys-api/commit/f449434ed3cac53ba7f3f43395874e13772e50e3))
* restore ResponseHandler import in AddParticipants and RemoveParticipants controllers ([c4864c6](https://github.com/crowslayer/whatsapp-baileys-api/commit/c4864c6c847d69b300c87547b6d40c7488637ca7))
* **SendReactionController:** restore import for ResponseHandler ([7814f9f](https://github.com/crowslayer/whatsapp-baileys-api/commit/7814f9f40839731cfbb6dc0627d8a7bcfbdfab83))
* **tests:** correct expected name values in FlowAggregate and WhatsAppInstanceAggregate tests for consistency ([9ca2f47](https://github.com/crowslayer/whatsapp-baileys-api/commit/9ca2f472a2d911a8a95ae3bbe2d68f58dbb87938))
* update ConnectInstanceController to retrieve instanceId from request parameters ([3a1ebae](https://github.com/crowslayer/whatsapp-baileys-api/commit/3a1ebaeb06b51165ff132f66087754d41de71aee))

### Documentation

* **TESTING:** update test structure and add controller validation patterns ([7fd2579](https://github.com/crowslayer/whatsapp-baileys-api/commit/7fd2579845dc30dcdc546ab1136cde07f1b14410))

### Code Refactoring

* **AggregateRoot:** enhance domain event handling with pullDomainEvents method ([d02e482](https://github.com/crowslayer/whatsapp-baileys-api/commit/d02e482fa1d780827c04794500f71511d10bab89))
* **BaileysConnection, BaileysEventRouter:** remove commented-out code ([c505120](https://github.com/crowslayer/whatsapp-baileys-api/commit/c505120aed40665c5ffb9823375443e5358f8991))
* **BaileysEventHandlers:** update chat ID extraction logic and remove commented-out code ([278da26](https://github.com/crowslayer/whatsapp-baileys-api/commit/278da26bd26c79259b18f9a37c5c1829a9e1aae8))
* **ChatAggregate:** remove unused import for AggregateRoot ([5d4e67c](https://github.com/crowslayer/whatsapp-baileys-api/commit/5d4e67c0622e3b82e39ce7c61c19aacf6e7f6ff4))
* **ChatType:** update chat type values and validation logic ([d3a3875](https://github.com/crowslayer/whatsapp-baileys-api/commit/d3a3875d27893e88318756cd6ea64980fc8419e3))
* clean up HumanBehaviorService and MongoDBConnection ([7ec2abb](https://github.com/crowslayer/whatsapp-baileys-api/commit/7ec2abb8eeb3fa3bc278b7d9cffcf1dd68510256))
* clean up SocketGateway by removing commented-out code and improving error logging ([06c7894](https://github.com/crowslayer/whatsapp-baileys-api/commit/06c78942dc65d3d6d10771f5b3b4610f54ecb371))
* **DomainEvent:** enhance event metadata structure and serialization ([34bc925](https://github.com/crowslayer/whatsapp-baileys-api/commit/34bc925b01d043a99601adacae8b1fbe92e659c7))
* enhance InstanceCreatedEvent structure and creation method ([bae302e](https://github.com/crowslayer/whatsapp-baileys-api/commit/bae302e3fd905b27f98606f297b1796714f0f14a))
* enhance IWhatsAppRuntime interface with additional services ([915374e](https://github.com/crowslayer/whatsapp-baileys-api/commit/915374e382f61d366751a7a6f1a37e83832cc09b))
* enhance MessageReceivedSubscriber to handle specific message types ([e31492f](https://github.com/crowslayer/whatsapp-baileys-api/commit/e31492f57ba4f3b9d31830e9707b834a409ad418))
* enhance MongoDB connection management with configurable options ([f87560a](https://github.com/crowslayer/whatsapp-baileys-api/commit/f87560acc8f308308564243e09d741ae23bbd23b))
* **EventClasses:** enhance event structure and metadata for domain events ([e004ff1](https://github.com/crowslayer/whatsapp-baileys-api/commit/e004ff1c164b8a3cfad996975b72ec712cceb73b))
* **IDomainEventSubscriber:** change imports to use type imports for DomainEvent types ([45509ea](https://github.com/crowslayer/whatsapp-baileys-api/commit/45509eac7c3d8c33b9b7e68518f875ac73283307))
* improve error handling in DatabaseConnectionFactory and DomainEventDeserializer ([c5d7acc](https://github.com/crowslayer/whatsapp-baileys-api/commit/c5d7accef64c18d8086ba65251a458ae71e95591))
* improve route protection configuration in FactoryConfig ([3eb9d26](https://github.com/crowslayer/whatsapp-baileys-api/commit/3eb9d2604fca2a8bd0c4b3f97ed8e99e499e5fde))
* improve WhatsAppInstance runtime and aggregate logic ([330d22e](https://github.com/crowslayer/whatsapp-baileys-api/commit/330d22ef9e56e9d3a1d2c28cf117dc45523e7647))
* **index:** update bootstrap function to register domain event bus subscribers ([765c882](https://github.com/crowslayer/whatsapp-baileys-api/commit/765c882ac22fe95aeb47076aaa55716b79d97e45))
* integrate BaileysMessageMapper into BaileysEventRouter for message handling ([dee0ebc](https://github.com/crowslayer/whatsapp-baileys-api/commit/dee0ebc2d3fa211b703cd2b3bf67b2fbc3ffbd78))
* introduce RuntimeError for improved error handling in runtime management ([106b8ad](https://github.com/crowslayer/whatsapp-baileys-api/commit/106b8adb4f296b47aaafbd6c0b720d5e73cacc1d))
* **MessageReceivedSubscriber:** change BotService import to IBotService type import ([474cb1c](https://github.com/crowslayer/whatsapp-baileys-api/commit/474cb1c8650399298b3ca65149dce475c5d22a56))
* **MockLogger:** update logger methods to use vitest mocks ([08d574c](https://github.com/crowslayer/whatsapp-baileys-api/commit/08d574ce056213337275777d0b69806cb8a14dd2))
* **MongoCampaignReadRepository:** enhance error handling and improve code structure ([ad8fd12](https://github.com/crowslayer/whatsapp-baileys-api/commit/ad8fd12db52246182da60b694076b25be67bfb81))
* **Name:** remove unnecessary uppercasing in constructor ([c2544b5](https://github.com/crowslayer/whatsapp-baileys-api/commit/c2544b5c44b46b82b267cfd0aced8c71e6f84075))
* **QRCodePersist:** update to use IConnectionStateStore for QR code persistence ([dec60fc](https://github.com/crowslayer/whatsapp-baileys-api/commit/dec60fcd73e18b724b06ee9559bb4cb70ee8100a))
* remove deprecated onMessage method from BaileysEventHandlers ([7cfac1b](https://github.com/crowslayer/whatsapp-baileys-api/commit/7cfac1ba9869593915c63b10ffb1465ce25568ab))
* remove unused event bus subscription from BotService and update event handling ([88f1c92](https://github.com/crowslayer/whatsapp-baileys-api/commit/88f1c9299ee54cbf3b1e68d8608948394c9d2e44))
* rename instanceName to instanceId in InstanceConnectedPayload type ([fdf215c](https://github.com/crowslayer/whatsapp-baileys-api/commit/fdf215ce93c23c79dfade5c8cce2223b9cf35341))
* reorganize domain event imports for consistency ([4d620d9](https://github.com/crowslayer/whatsapp-baileys-api/commit/4d620d9132769583d62a5d57bfec91d04d7c41e5))
* replace generic error handling with custom WhatsAppConnectionError ([8a61a52](https://github.com/crowslayer/whatsapp-baileys-api/commit/8a61a52988ed8836872c8c05d33cc8faad396ea5))
* **SendTextController.test:** replace PhoneNormalizer mock with MockPhoneNormalizer ([c692809](https://github.com/crowslayer/whatsapp-baileys-api/commit/c6928096fb6f45aa013202c062ad74fb5e1f2332))
* simplify IMessageRepository and enhance MessageModel schema ([524b066](https://github.com/crowslayer/whatsapp-baileys-api/commit/524b066a4972d2480632599de1a5876fa661ea60))
* standardize test imports and formatting across campaign and flow test files ([5fafdfb](https://github.com/crowslayer/whatsapp-baileys-api/commit/5fafdfbed8010dbb5c5940cdb0a0e0d1ca52d5d8))
* **StoreQRCodeGenerated:** remove console log from event handling ([be1bf6b](https://github.com/crowslayer/whatsapp-baileys-api/commit/be1bf6b17e4928558aff4dfbd00019a92cadf746))
* **StoreQRCodeGenerated:** update to use QRCodePersist for QR code storage ([35918fc](https://github.com/crowslayer/whatsapp-baileys-api/commit/35918fc6f5c35c27dff0a0deae130d87f0d4b20f))
* streamline FactoryConfig by utilizing DatabaseConfigBuilder and SecurityConfigBuilder ([cebfcbd](https://github.com/crowslayer/whatsapp-baileys-api/commit/cebfcbded676a4d5179e8c52663f0df47dc76dc4))
* **tests:** standardize import paths and formatting in FlowAggregate, FlowModel, CreateFlowController, and GetFlowController tests ([4fa875a](https://github.com/crowslayer/whatsapp-baileys-api/commit/4fa875ae582674aa5c64d51b7716185f3e30bb38))
* **tests:** update event tests to use static creation methods and improve consistency ([f72e098](https://github.com/crowslayer/whatsapp-baileys-api/commit/f72e0989639942faa59b6690bf43442b1b69475f))
* update BaileysMessageMapper to return structured MessagePayload ([93a1cb4](https://github.com/crowslayer/whatsapp-baileys-api/commit/93a1cb48b321aa4f907b3d144f2cde87043e643a))
* update BotService and MessageReceivedSubscriber to use conversationId and messageId ([b5e7f57](https://github.com/crowslayer/whatsapp-baileys-api/commit/b5e7f5773d4302f5e2a533a5d5f88a06670a9348))
* update BotService to use structured message handling ([2fcabcb](https://github.com/crowslayer/whatsapp-baileys-api/commit/2fcabcba4037cccb1e6406faf0558e80ff8e6179))
* update CreateInstanceCommandHandler to use toPrimitives method ([cb30238](https://github.com/crowslayer/whatsapp-baileys-api/commit/cb302381ea57758ba735609581f530f964de0b54))
* update InstanceConnectedEvent instantiation in WhatsAppInstanceAggregate ([51ba8e6](https://github.com/crowslayer/whatsapp-baileys-api/commit/51ba8e66e603710c2a1b985199cdb9e53c388864))
* update InstanceConnectedEvent to use instanceId instead of instanceName ([887800f](https://github.com/crowslayer/whatsapp-baileys-api/commit/887800f9d35ea6d2a41db85ea02ef6f1a2e176fe))
* update InstanceDisconnectedEvent to include instanceId in payload ([fcf90c2](https://github.com/crowslayer/whatsapp-baileys-api/commit/fcf90c2f3515af63ec1d5f00f0a9c9672b1ba18e))
* update PairingCodeGeneratedEvent to use DomainEvent structure ([513b538](https://github.com/crowslayer/whatsapp-baileys-api/commit/513b5380740ecbeb567f211d742be4ecce2d4667))
* **WhatsAppInstanceAggregate:** remove unused properties and comments ([a4b8bee](https://github.com/crowslayer/whatsapp-baileys-api/commit/a4b8bee2772eecf655baf847a1ddfe106b4987a3))
* **WhatsAppInstanceAggregate:** update instance creation event and remove unused methods ([3e9ec49](https://github.com/crowslayer/whatsapp-baileys-api/commit/3e9ec495bdbbdbd829b4c59e8ed5dc7bbb421cad))

### Testing and Integration

* add comprehensive test suites for Mongo repositories ([f28d123](https://github.com/crowslayer/whatsapp-baileys-api/commit/f28d1231045225d39f18303f5157b6b34faa5ac8))
* **ConnectInstanceController:** enhance tests with mock response handling ([d53b887](https://github.com/crowslayer/whatsapp-baileys-api/commit/d53b8879b0bcd86d4248f69d96d714d32e81b1ec))
* **CreateInstanceController:** enhance tests with mock implementations and additional assertions ([cbaf91b](https://github.com/crowslayer/whatsapp-baileys-api/commit/cbaf91b852ade712176d3fb3cac677345fb427cb))
* **DisconnectInstanceController:** enhance tests with improved mock handling and assertions ([b814612](https://github.com/crowslayer/whatsapp-baileys-api/commit/b814612f0f1122f9332da6540350b59896dfe2e0))
* **DisconnectInstanceController:** refactor tests to use mocks and improve assertions ([916d6d9](https://github.com/crowslayer/whatsapp-baileys-api/commit/916d6d9f6d660d3f758899b651053588f34c2c54))
* enhance ConnectInstanceController tests to validate command dispatch and response handling ([1e0a73b](https://github.com/crowslayer/whatsapp-baileys-api/commit/1e0a73b553c9226f20d73d5a9fa0ff0671b71a7a))
* **FlowModel:** add Vitest imports for improved test structure ([a0c6e94](https://github.com/crowslayer/whatsapp-baileys-api/commit/a0c6e941e339ff5d0760fac2680ae679cd24a3ae))
* **GetInstanceController:** enhance tests with improved mock handling and additional assertions ([23a691c](https://github.com/crowslayer/whatsapp-baileys-api/commit/23a691ca9582f134dce88bebb9a37839a33d1085))
* **GetInstancesController:** add vitest imports for enhanced testing capabilities ([2a9672e](https://github.com/crowslayer/whatsapp-baileys-api/commit/2a9672e9c899b61b609f2f5ddbce64b3ab48593e))
* **GetQRController:** update tests to include NextFunction type for improved error handling ([ac7dedd](https://github.com/crowslayer/whatsapp-baileys-api/commit/ac7deddd7f21ea09b4d8090c6a25712324d7b25d))
* **GetQRStatusController:** include NextFunction type for enhanced error handling ([6f5d54a](https://github.com/crowslayer/whatsapp-baileys-api/commit/6f5d54ae5969a61b0c490c8f1d41abc537be3e1f))
* **MockCommandBus:** add mock implementation for command bus testing ([aca587a](https://github.com/crowslayer/whatsapp-baileys-api/commit/aca587a802caa6202b1385da8365e537624aa73a))
* **MockNext:** add mock implementation for Next.js testing ([14a6aff](https://github.com/crowslayer/whatsapp-baileys-api/commit/14a6affc4c5745784751c637f5038237e0cdb036))
* **MockRequest:** add mock implementation for request testing ([bb4c1d3](https://github.com/crowslayer/whatsapp-baileys-api/commit/bb4c1d3a45b28f23bce796e3511ad36169cd30fb))
* **MockResponse:** add mock implementation for response testing ([3a7d042](https://github.com/crowslayer/whatsapp-baileys-api/commit/3a7d042c06cddff7746522177abf8957ac34bce4))
* **MongoCampaignReadRepository:** add comprehensive tests for campaign retrieval methods ([c13fcc2](https://github.com/crowslayer/whatsapp-baileys-api/commit/c13fcc22c6f81a59366ce5d596984d910f569655))
* **MongoCampaignReadRepository:** add detailed tests for campaign methods ([55c0a75](https://github.com/crowslayer/whatsapp-baileys-api/commit/55c0a75f51f3590945ab1eaf73ae8e06e1cf4510))
* **MongoCampaignRepository:** add comprehensive test suite for campaign methods ([2b60f88](https://github.com/crowslayer/whatsapp-baileys-api/commit/2b60f88b0e5f917264ecc5d40c9106b2d4de00f3))
* **MongoChatReadRepository:** add comprehensive test suite for chat methods ([f43059f](https://github.com/crowslayer/whatsapp-baileys-api/commit/f43059f3a384d9547c8cdb240ed2b6ce976331ea))
* **MongoChatReadRepository:** add comprehensive tests for chat retrieval methods ([462ec49](https://github.com/crowslayer/whatsapp-baileys-api/commit/462ec491278be9c50e30929cb23d6dc0fdaa4612))
* **MongoFlowReadRepository:** add comprehensive test suite for flow methods ([88af948](https://github.com/crowslayer/whatsapp-baileys-api/commit/88af9483b87de2e2d09ab76710a52943ee59385e))
* **MongoFlowReadRepository:** add comprehensive tests for flow retrieval methods ([167e883](https://github.com/crowslayer/whatsapp-baileys-api/commit/167e8834a1429f6c3790b01137022d880614c844))
* **MongoWhatsAppInstanceReadRepository:** add comprehensive test suite for repository methods ([e5c69b5](https://github.com/crowslayer/whatsapp-baileys-api/commit/e5c69b5735d4d427c0b043007cb7b32f3bb115e7))
* **MongoWhatsAppInstanceReadRepository:** add comprehensive tests for repository methods ([c109337](https://github.com/crowslayer/whatsapp-baileys-api/commit/c109337954ca2643e8374e5a853158a210f7c04d))
* **MongoWhatsAppInstanceRepository:** add comprehensive test suite for repository methods ([fe6254f](https://github.com/crowslayer/whatsapp-baileys-api/commit/fe6254f9cef0a037e01c6d2edb117413828b04f4))
* **MongoWhatsAppInstanceRepository:** add comprehensive tests for repository methods ([5371ee9](https://github.com/crowslayer/whatsapp-baileys-api/commit/5371ee9ebd31183cb0f4424bd73cad5881ce8e04))
* remove obsolete test suites for Mongo repositories ([abe7151](https://github.com/crowslayer/whatsapp-baileys-api/commit/abe7151df43396c23974b8f350cb69a74f1dc2ae))
* **ResponseHandler:** enhance tests for response handling functionality ([9bac6a6](https://github.com/crowslayer/whatsapp-baileys-api/commit/9bac6a69a8459ad20ebcc105ac3c58f60a2094e7))
* **SendAudioController:** enhance tests for audio sending functionality ([4bcad0f](https://github.com/crowslayer/whatsapp-baileys-api/commit/4bcad0f627e8e5954bdea690f5a50966686212d6))
* **SendContactController:** enhance tests for contact handling and validation ([5bcf9c4](https://github.com/crowslayer/whatsapp-baileys-api/commit/5bcf9c4a9e32fa5cbfadba467a33efc49d0d84ca))
* **SendDocumentController:** enhance tests for document sending functionality ([f29dc3b](https://github.com/crowslayer/whatsapp-baileys-api/commit/f29dc3bbecb1161dedee00bd1238f9d7dfa44718))
* **SendImageController:** enhance tests for image sending functionality ([05bcc07](https://github.com/crowslayer/whatsapp-baileys-api/commit/05bcc07015022b3db9f8b6fec52fcc4ad41d1125))
* **SendLocationController:** enhance tests for location sending functionality ([dd35081](https://github.com/crowslayer/whatsapp-baileys-api/commit/dd35081865c8a3f22afb95068937fc50133a8b2d))
* **SendReactionController:** enhance tests for reaction handling functionality ([69a16c1](https://github.com/crowslayer/whatsapp-baileys-api/commit/69a16c1533f909fb2ecd1642201f7ba6b237f960))
* **SendStickerController:** enhance tests for sticker sending functionality ([4d4a2f9](https://github.com/crowslayer/whatsapp-baileys-api/commit/4d4a2f945b8425e896ecbbcf4bb410cbaf18e167))
* **SendTextController:** enhance tests for message sending functionality ([ff443cb](https://github.com/crowslayer/whatsapp-baileys-api/commit/ff443cb97a8f10fb9cd35e633d30cc6c8e0ecac3))
* **SendVideoController:** enhance tests for video sending functionality ([18fc747](https://github.com/crowslayer/whatsapp-baileys-api/commit/18fc747cec4ed1b9660fa61c3008aaf717dfc18c))
* update BotService tests to use conversationId and include messageId and senderId ([c320ea8](https://github.com/crowslayer/whatsapp-baileys-api/commit/c320ea8aaadce6ece397cb043b83c0d6d93376a2))
* **WhatsAppInstanceRuntime:** add tests for QR code handling and disconnection scenarios ([1a49b89](https://github.com/crowslayer/whatsapp-baileys-api/commit/1a49b89fcc721b0e791f3910dac148a084b37af3))
* **WhatsAppInstanceRuntime:** enhance tests with domainEventBus and QR code event handling ([2512993](https://github.com/crowslayer/whatsapp-baileys-api/commit/2512993d4c41a927ad7affc50ead9c17525adabd))
* **WhatsAppRuntimeFactory:** add domainEventBus to instance creation for improved event handling ([855b07b](https://github.com/crowslayer/whatsapp-baileys-api/commit/855b07bcdef4a93a8fe80fe3d03c69da617281eb))

# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-05-05

### Added

- Flow seeds: added `scripts/seed_flows.ts` to initialize bot flows.
- Bot/flows architecture: new modules (BotService, FlowEngine, FlowMapper, FlowTriggerResolver, ConditionNodeExecutor, InputNodeExecutor, MessageNodeExecutor, FlowTypes, IBotService, IConversationState, IConversationStore, INodeExecutor).
- Mongo persistence: new models (FlowModel, FlowSessionModel), repositories (MongoFlowReadRepository, MongoFlowRepository), and updated data schemas.
- Bot and flows configuration: YAML files in `src/config/services/bot` (application.yaml, infrastructure.yaml) and deployment pipelines.
- HTTP controllers and routes for flow and node management.
- Flow domain: aggregates and definitions for FlowAggregate and FlowDefinitionAggregate.
- Infrastructure: Mongo adapters and repositories for flows.
- Seed script for flows and local testing.

## [1.2.0] - 2026-05-01

### Added

- Campaigns and adapters present in this release.
- Integrations with runtime and observability scaffolding.

### Changed

- Minor improvements to deployment and wiring.

### Fixed

- No breaking fixes yet.

## [1.1.0] - 2026-05-01

### Added

- Campaigns management: added campaign domain, orchestration, and related workflows.
- Modular Baileys adapters: MessageSender, ChatManager, GroupManager, PresenceManager, MediaHandler added.
- Infrastructure and runtime support for campaigns and adapters.
- Observability improvements: scaffolding for metrics and logs.
- Documentation updates and migration notes.

### Changed

- Observability scaffolding and migration notes prepared.

### Fixed

- No breaking fixes yet.
