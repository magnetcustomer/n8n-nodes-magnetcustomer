# Guía de Migración: v1.x a v2.0

Esta guía te ayuda a migrar tus flujos de trabajo de n8n del nodo Magnet Customer v1.x a v2.0.

## Cambios que Rompen Compatibilidad

| Aspecto | v1.x | v2.0 |
|---------|------|------|
| Endpoints de creación | `/import/leads`, `/import/contacts`, etc. | `/leads`, `/contacts`, etc. |
| Seguimiento de origen | Header `api: 'n8n'` | Body `source: 'n8n'` |
| Soporte de plataforma | V1 + V2 | **Solo V2** |
| Deduplicación | Integrada (lado del servidor) | A nivel de flujo de trabajo (ver abajo) |

## Qué Debes Hacer

### Si tus flujos de trabajo solo Crean contactos/leads

**No se requieren cambios.** El nodo maneja el mapeo de endpoints internamente. Solo actualiza la versión del nodo.

### Si tus flujos de trabajo dependen de la deduplicación

En v1.x, el endpoint `/import/leads` tenía **deduplicación integrada** — si ya existía un contacto con el mismo CPF/email, los datos se **fusionaban** en lugar de crear un duplicado.

En v2.0, el endpoint `POST /leads` crea directamente **sin deduplicación**. Para reproducir el mismo comportamiento, debes agregar un paso de búsqueda antes de crear.

## Patrón de Deduplicación (Buscar → Ramificar → Crear o Actualizar)

### Antes (v1.x) — Nodo único

```
[Trigger] → [Magnet Customer: Create Lead]
```

El nodo manejaba la deduplicación internamente. Si ya existía un lead con el mismo CPF, se actualizaba en lugar de duplicarse.

### Después (v2.0) — Buscar + IF + Crear/Actualizar

```
[Trigger] → [Magnet Customer: Search Lead] → [IF] → [Create Lead] (no encontrado)
                                                  → [Update Lead] (encontrado)
```

### Configuración paso a paso

#### 1. Buscar contacto existente

Agrega un nodo **Magnet Customer** con:
- **Resource:** Lead (o Customer/Prospect)
- **Operation:** Search
- **Search:** Usa el valor CPF/doc de tu trigger: `{{ $json.doc }}`

#### 2. Verificar si el contacto existe

Agrega un nodo **IF**:
- **Condition:** `{{ $json.length > 0 }}` es verdadero
  - O verifica: `{{ $('Search Lead').item.json.length }}` es mayor que 0

#### 3a. Si NO se encontró → Crear

Agrega un nodo **Magnet Customer** con:
- **Resource:** Lead
- **Operation:** Create
- Completa los campos con los datos de tu trigger

#### 3b. Si se encontró → Actualizar

Agrega un nodo **Magnet Customer** con:
- **Resource:** Lead
- **Operation:** Update
- **Lead ID:** `{{ $('Search Lead').first().json._id }}`
- Completa los campos que deseas actualizar

### Ejemplo de flujo de trabajo completo

```
┌──────────┐    ┌─────────────────┐    ┌────┐    ┌─────────────────┐
│ Webhook  │───▶│ MC: Search Lead │───▶│ IF │───▶│ MC: Create Lead │ (no encontrado)
│ Trigger  │    │ search = doc    │    │    │    └─────────────────┘
└──────────┘    └─────────────────┘    │    │    ┌─────────────────┐
                                       │    │───▶│ MC: Update Lead │ (encontrado)
                                       └────┘    └─────────────────┘
```

### Consejos

- **Buscar por CPF/Doc:** Usa el parámetro `search` con el número de documento. La API busca en `fullname`, `email`, `doc` y `phones`.
- **Buscar por email:** Si no tienes CPF, busca por dirección de email.
- **Flujos de trabajo en lote:** Para importaciones masivas, agrega un nodo **Split In Batches** antes de la búsqueda para evitar límites de tasa.
- **Límites de tasa:** La API permite hasta 100 solicitudes por minuto por tenant. Agrega pausas entre lotes si es necesario.

## Seguimiento de Origen

Los contactos creados a través de n8n ahora se rastrean con `source: 'n8n'` en el CRM. Esto es automático — no se requiere configuración. Puedes filtrar contactos por origen en la plataforma Magnet Customer.

## Preguntas Frecuentes

### ¿Necesito cambiar mis flujos de trabajo existentes?

Solo si dependen del comportamiento de deduplicación. Si tus flujos de trabajo simplemente crean contactos sin preocuparse por duplicados, funcionarán tal cual después de la actualización.

### ¿Puedo seguir usando v1.x?

Sí, v1.9.x sigue disponible en npm. Sin embargo, no recibirá actualizaciones y puede dejar de funcionar cuando la infraestructura V1 sea deprecada.

### ¿Qué sucede si creo un duplicado?

El CRM creará un segundo contacto con los mismos datos. Puedes usar la función **Merge** en la plataforma Magnet Customer para consolidar duplicados manualmente, o implementar el patrón de deduplicación descrito anteriormente.

### ¿Cómo sé qué versión estoy usando?

En n8n, ve a **Settings > Community Nodes**. La versión se muestra junto al nombre del nodo.

## Soporte

- [Referencia de API](https://apireference.magnetcustomer.com)
- [GitHub Issues](https://github.com/magnetcustomer/n8n-nodes-magnetcustomer/issues)
- Email: suporte@magnetcustomer.com
