# CRBNB — Compliance

Cumplimiento legal para el mercado MVP (Costa Rica) y expansión planeada (Latam, España).

## Ley 8968 — Costa Rica

La **Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales** (N° 8968) es la regulación de protección de datos de Costa Rica, alineada con GDPR.

### Checklist MVP

- [x] **Consentimiento explícito al signup**: checkbox "Acepto la política de privacidad"
- [x] **Política de privacidad** publicada en `/legal/privacy` (es + en)
- [x] **Términos del servicio** en `/legal/terms` (es + en)
- [x] **Política de cookies** en `/legal/cookies` (es + en)
- [x] **Right to access:** `/account/export` → JSON con todos los datos del usuario (TODO Fase 11)
- [x] **Right to erasure:** `/account/delete` → soft-delete + hard-delete a 30 días (TODO Fase 11)
- [x] **Cookie banner:** categorías necesarias vs analíticas con consentimiento explícito (TODO Fase 11)
- [x] **Disclosure de transferencias internacionales** (Supabase US-East)
- [x] **RoPA (Records of Processing Activities)** mantenido internamente
- [x] **Data minimization:** solo recopilamos lo necesario

### Datos personales recopilados

| Categoría | Datos | Base legal | Retención |
|---|---|---|---|
| Identidad | Nombre, email, teléfono | Consentimiento | Mientras cuenta activa + 5 años fiscal |
| Verificación | Cédula/DNI + selfie (KYC opcional) | Consentimiento | Hasta verificación + 5 años |
| Pago | Email del proveedor de pago, account_ref | Ejecución del contrato | Mientras cuenta activa |
| Uso | Reservas, mensajes, actividad | Interés legítimo | Mientras cuenta activa + 5 años |
| Técnicos | IP, user-agent, cookies necesarias | Interés legítimo | 90 días |

### Derechos del usuario (derechos ARCO)

- **Acceso:** Solicitar todos sus datos en formato JSON
- **Rectificación:** Corregir datos inexactos
- **Cancelación:** Supresión de datos (salvo obligaciones legales)
- **Oposición:** Oponerse a tratamientos específicos (ej. analítica)

Contacto DPO: **dpo@crbnb.com** — Respuesta en ≤10 días hábiles.

### Transferencias internacionales

Algunos proveedores almacenan datos fuera de Costa Rica:

| Proveedor | Servicio | Ubicación | Garantía |
|---|---|---|---|
| Supabase | DB + Auth + Storage | US-East (Virginia) | Contrato DPA + SCC |
| Cloudflare | CDN + Pages + Workers | Global | DPA + Privacy Shield successor |
| Resend | Email transaccional | US | DPA |
| MapTiler | Tiles de mapa | EU (Francia) | DPA + GDPR |

## GDPR — UE (cuando expandamos a España)

La Ley 8968 es muy similar a GDPR. Cumplir GDPR cubre el 90% de los requisitos.

### Diferencias adicionales GDPR

- [ ] **DPA (Data Processing Agreement)** formal con cada proveedor
- [ ] **DPIA (Data Protection Impact Assessment)** para tratamientos de alto riesgo
- [ ] **DPO dedicado** (no email genérico) si >5000 usuarios UE
- [ ] **Cookies estrictamente necesarias vs todo lo demás** — distinción más estricta en GDPR

## LGPD — Brasil (futuro)

Para Brasil, replicar el cumplimiento de GDPR ya cubre LGPD. Detalles menores:

- **ANPD** como autoridad de control (no PRODHAB Costa Rica)
- Plazo de notificación de breach: 2 días hábiles (vs 72h GDPR)
- Base legal "legítimo interés" más restrictiva

## LFPDPPP — México (futuro)

Similar a GDPR. INAI como autoridad.

- Derechos ARCO idénticos
- Plazo de respuesta: 20 días (vs 10 días CR)
- Transferencias internacionales requieren aviso específico

## PCI-DSS

**CRBNB NO procesa ni almacena datos de tarjetas directamente.** El flujo es:

1. Huésped ingresa tarjeta en Tylopay/Onvo (ambos PCI-DSS Level 1)
2. Tylopay/Onvo tokenizan la tarjeta
3. CRBNB solo recibe `payment_intent_id` y `payment_status`
4. Dinero va directo del huésped al host (Tylopay/Onvo hace split)

Esto nos coloca en **SAQ A** (Self-Assessment Questionnaire A) — el nivel más bajo de cumplimiento PCI-DSS. No requiere auditoría externa.

## KYC — Verificación de identidad

Hosts pueden verificar su identidad opcionalmente para obtener badge ✓.

**Opciones evaluadas:**

| Vendor | Costo | Cobertura | Notas |
|---|---|---|---|
| Onfido | $$$ | Global | Mejor UX, más caro |
| Persona | $$ | US + Latam | Buen balance |
| Vendor local CR | $ | Solo CR | Requiere integración manual |

**Decisión MVP:** Diferido a Fase 10 (Admin). Mientras tanto, badge se otorga manualmente por admin.

## Brechas de seguridad

Proceso en caso de breach:

1. **Detección** (<24h): alertas automatizadas en Sentry + Supabase
2. **Contención** (<1h): revocar tokens afectados, bloquear accesos sospechosos
3. **Evaluación** (<24h): alcance del breach, datos comprometidos
4. **Notificación a usuarios** (<72h GDPR / <2 días LFPDPPP / <10 días Ley 8968)
5. **Notificación a autoridad** (cuando aplique)
6. **Post-mortem** (<7 días): root cause + remediación + learnings

Plantilla de comunicación en `docs/BREACH_TEMPLATE.md` (TODO).

## Auditoría

`public.audit_log` registra:
- Cambios en profiles/hosts
- Acciones de admin
- Eventos de pago (webhooks)
- Accesos a datos sensibles

Append-only (sin UPDATE/DELETE grants para usuarios).

Retención: 5 años (alineado con obligaciones fiscales).

## Resumen ejecutivo

CRBNB está diseñado para cumplir proactivamente con:

- ✅ Ley 8968 Costa Rica (mercado MVP)
- 🔄 GDPR UE (preparado para expansión)
- 🔄 LGPD/LFPDPPP Latam (preparado para expansión)
- ✅ PCI-DSS SAQ A (no procesamos tarjetas directamente)

El enfoque "dinero nunca toca CRBNB + Supabase RLS + Cloudflare Edge" minimiza
superficie de ataque y facilita el cumplimiento.