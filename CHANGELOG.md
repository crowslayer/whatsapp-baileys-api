## [1.2.0] - 2026-05-01\n### Added\n- Campaigns and adapters present in this release.\n- Integrations with runtime and observability scaffolding.\n\n### Changed\n- Minor improvements to deployment and wiring.\n\n### Fixed\n- No breaking fixes yet.\n\n
# Change Log

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-05-01
### Added
- Campaigns management: added campaign domain, orchestration and related workflows.
- Modular Baileys adapters: MessageSender, ChatManager, GroupManager, PresenceManager, MediaHandler added.
- Infrastructure and runtime support for campaigns and adapters.
- Observability improvements: scaffolding for metrics and logs.
- Documentation updates and notes for migration.

### Changed
- Observability scaffolding and migration notes prepared.

### Fixed
- No breaking fixes yet.

## [Unreleased]
- Changes to be released.

## [Unreleased]
- Features and changes to be released.
- Will include the campaigns module and Baileys adapters refactor.
## [1.3.0] - 2026-05-05
### Added
- Seeds de flows: añadidos scripts/seed_flows.ts para inicializar flows del bot.
- Arquitectura de bot/flows: nuevos módulos (BotService, FlowEngine, FlowMapper, FlowTriggerResolver, ConditionNodeExecutor, InputNodeExecutor, MessageNodeExecutor, FlowTypes, IBotService, IConversationState, IConversationStore, INodeExecutor).
- Persistencia Mongo: nuevos modelos (FlowModel, FlowSessionModel), repositorios (MongoFlowReadRepository, MongoFlowRepository) y esquemas de datos actualizados.
- Configuración de bot y flows: YAMLs en src/config/services/bot (application.yaml, infrastructure.yaml) y pipelines de despliegue.
- Controladores y rutas HTTP para gestión de flows y nodos.
- Dominio de flows: agregados y definiciones de FlowAggregate y FlowDefinitionAggregate.
- Infraestructura: adaptadores y repositorios Mongo para flows.
- Script de seed para flujos y pruebas locales.
