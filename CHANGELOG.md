<!--
Formato basado en https://keepachangelog.com/es-ES/1.1.0/
Este changelog resume cambios a alto nivel a partir de tags y mensajes de commit.
-->

# Changelog

Todas las modificaciones notables de este proyecto se documentarán en este archivo.

El proyecto usa tags tipo `vMAJOR.MINOR.PATCH` en git.

## [Unreleased]

### Added
- **Campañas**: servicio para gestionar y enviar campañas (`CampaignService`).
- **WebSocket gateway**: servidor HTTP + Socket para gestión en tiempo real (p. ej. `SocketGateway`).
- **Eventos de conexión**: manejo de eventos de pairing code y mejoras en enrutamiento/logging de eventos.

### Changed
- **Bootstrap**: limpieza/refactor del arranque (mejor logging y eliminación de código legado comentado).
- **Normalización de teléfono**: normalización consistente en controladores de mensajería.
- **Arquitectura runtime/event-bus**: refactors para unificar interfaces y reorganizar imports.

### Fixed
- **BaileysConnection**: consistencia de tipos para `_intentionalClose`.

## [v1.1.0] - 2026-03-29

### Added
- **Chats**: servicios y rutas para recuperación de chats.
- **Sincronización de chats**: soporte de sincronización reactiva y persistencia (MongoDB) para chat state.

### Changed
- **Adapter/Connection Manager**: mejoras para soportar sincronización y recuperación de chats.

## [v1.0.1] - 2026-03-16

### Added
- **Plantilla de entorno**: archivo `.env.example`.

### Changed
- **Documentación**: README ampliado con variables de entorno y endpoints.
- **Configuración**: ajustes de configuración/servicios y housekeeping del repo.

