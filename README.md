# Internal Task - Object Migration

Este proyecto implementa una migración de datos desde la PokeAPI hacia HubSpot usando **Hexagonal Architecture (Ports & Adapters)**.

## Estructura de Carpetas

```
/src
  /application         # Casos de uso (lógica de migración)
  /domain              # Modelos de dominio (Pokémon, Move, Location)
  /adapters            # Integraciones externas (PokeAPI, HubSpot)
    /pokeapi
    /hubspot
  /ports               # Interfaces (contratos) para los repositorios
  /utils               # Utilidades generales
index.js               # Punto de entrada
```

## Descripción de Capas
- **application/**: Orquesta la migración y asociaciones.
- **domain/**: Define los modelos de negocio.
- **adapters/**: Implementa la comunicación con APIs externas.
- **ports/**: Define interfaces para los repositorios.
- **utils/**: Configuración, logs, helpers.

---

¡Listo para comenzar la migración siguiendo buenas prácticas de arquitectura! 