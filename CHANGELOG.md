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
