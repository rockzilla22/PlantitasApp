# AI/specs/REFERRAL_SPEC.md: Sistema de Referidos Plantacora

## 1. RESUMEN EJECUTIVO

Sistema de referidos que recompensa al usuario y al invitado con beneficios mutuos. El objetivo es impulsar el crecimiento orgánico de la base de usuarios mediante recompensas escalonadas y tangible.

---

## 2. REGLAS DE NEGOCIO

### 2.1 Recompensas por Hito

| Hito | Recompensa Referrer | Recompensa Referido | Condiciones |
|------|---------------------|---------------------|-------------|
| **Registro completado** | +1 slot | +1 slot | Registro + 5 plantas creadas en Dashboard |
| **Primera compra Pro** | +5 slots | +5 slots | Solo si el referido NO tiene Premium activo |
| **Primera compra Premium** | +7 días Premium | +7 días Premium | Solo si el referido NO tiene Pro previo |

### 2.2 Colisión Pro vs Premium

Por cada referido, **solo se otorga UNA recompensa de compra**:

- Si el referido compra Pro primero → se otorga recompensa Pro, luego Premium no genera más recompensa
- Si el referido compra Premium primero → se otorga recompensa Premium, luego Pro no genera más recompensa

### 2.3 Límites y Restricciones

| Límite | Valor |
|--------|-------|
| Slots máximos por referral (acumulables) | **100** |
| Código de invitación expira en | **7 días** |
| Anti-fraude | Prohibido auto-referido (mismo email, device, IP, método de pago) |

---

## 3. MODELO DE DATOS

### 3.1 Tabla: `referrals`

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- El usuario que emite la invitación
  referrer_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- El código único de invitación
  referral_code VARCHAR(12) UNIQUE NOT NULL,
  
  -- El usuario que aceptó (nullable hasta que aceita)
  referred_id UUID REFERENCES auth.users(id),
  
  -- Estado del referral
  status VARCHAR(20) DEFAULT 'pending', -- pending | accepted | pro_purchased | premium_purchased
  
  -- Tracking de recompensas otorgadas
  rewards_granted JSONB DEFAULT '{
    "signup": { "referrer": 0, "referred": 0 },
    "pro_purchase": { "referrer": false, "referred": false },
    "premium_purchase": { "referrer": false, "referred": false }
  }',
  
  -- Cuándo expira el código
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
```

### 3.2 Tracking de Slots de Referral

Los slots ganados por referral son **separados** de los slots comprados (Pro). Se almacenan en `app_metadata`:

```typescript
interface AppMetadata {
  // ... campos existentes de monetización ...
  
  // Slots de referral (separados de purchased_slots)
  referral_slots: number;        // Slots ganados por referidos
  referral_slots_used: number;   // Slots de referral ya consumidos
  
  // Premium days de referral (bonificación)
  referral_premium_days: number;  // Días extra de Premium ganados
  referral_premium_used: number;  // Días ya aplicados
}
```

---

## 4. FLUJO DE USUARIO

### 4.1 Emisor (Referrer)

```
1. Usuario accede a sección "Invitar Amigos"
   ↓
2. Sistema genera código único de 12 caracteres
   ↓
3. Usuario comparte link/código (email, WhatsApp, redes)
   ↓
4. Sistema muestra:
   - Slots ganados hasta ahora
   - Código de invitación
   - Beneficios por cada referido
   - Fecha de expiración del código
```

### 4.2 Receptor (Referred)

```
1. Usuario recibe enlace/código de invitación
   ↓
2. Click en enlace → landing con código prellenado
   ↓
3. Registro de cuenta nueva
   ↓
4. Al crear su 5ta planta en Dashboard:
   - Se marca el referral como "accepted"
   - Referrer +1 slot
   - Referido +1 slot
   - Notificación a ambos
   ↓
5. Checkout Pro (primera compra):
   - Verificar: ¿tiene Premium activo? → NO permite Pro reward
   - Referrer +5 slots
   - Referido +5 slots
   - Marcar "pro_purchased" en rewards_granted
   ↓
6. Checkout Premium (primera compra):
   - Verificar: ¿tiene Pro activo? → NO permite Premium reward
   - Ambos +7 días Premium
   - Marcar "premium_purchased" en rewards_granted
```

---

## 5. CÁLCULO DE LÍMITES

### 5.1 Slots Totales del Usuario

```typescript
function getTotalSlotLimit(user: User): number {
  const meta = user.raw_app_meta_data;
  
  // 1. Base del plan
  let base = 50; // Free default
  
  // 2. Slots comprados (Pro) - máximo 200
  const purchased = Math.min(meta.purchased_slots || 0, 200);
  
  // 3. Slots de referral - máximo 100
  const referral = Math.min(meta.referral_slots || 0, 100);
  
  // 4. Premium = ilimitado
  if (meta.has_access && isPremiumActive(meta.premium_expires_at)) {
    return 999999;
  }
  
  return base + purchased + referral;
}
```

### 5.2 Días Premium Extra

```typescript
function getPremiumExpirationDate(user: User): Date {
  const meta = user.raw_app_meta_data;
  
  if (!meta.has_access) {
    // No tiene Premium activo, los días referral no aplican
    return null;
  }
  
  const baseExpiry = new Date(meta.premium_expires_at);
  const referralDays = meta.referral_premium_days || 0;
  const daysUsed = meta.referral_premium_used || 0;
  
  const remainingBonusDays = referralDays - daysUsed;
  
  if (remainingBonusDays <= 0) {
    return baseExpiry;
  }
  
  // Extender la fecha de expiración
  return addDays(baseExpiry, remainingBonusDays);
}
```

---

## 6. ANTI-FRAUDE

### 6.1 Validaciones Prohibidas

|check|Descripción|
|-----|-----------|
| Mismo email | El email del referido no puede existir en `auth.users` |
| Mismo device | Verificación de fingerprint de dispositivo |
| Misma IP | Rate limiting por IP en endpoint de registro |
| Mismo método de pago | Si paga, verificar que no reuse payment method del referrer |
| Cuenta existente | Si el referido ya tiene cuenta, no puede usar el código |

### 6.2 flags en Metadata

```typescript
interface FraudFlags {
  is_self_referral: boolean;
  device_fingerprint: string;
  ip_address: string;
  payment_method_id?: string;
}
```

---

## 7. UI - SECCIÓN INVITAR AMIGOS

### 7.1 Layout Propuesto

```
┌─────────────────────────────────────────┐
│         INVITAR AMIGOS                  │
├─────────────────────────────────────────┤
│  🎁 Gana +1 slot por cada amigo         │
│  que se registre y cree 5 plantas        │
│                                         │
│  💎 Si compran Pro: +5 slots extra      │
│  ☁️ Si compran Premium: +7 días extra  │
│                                         │
├─────────────────────────────────────────┤
│  TU CÓDIGO: PLANTAS2026XYZ              │
│  (Expira en 7 días)                     │
├─────────────────────────────────────────┤
│  [ Copiar enlace ]  [ Compartir ]       │
├─────────────────────────────────────────┤
│  TUS REFERIDOS                          │
│  ┌─────────────────────────────────┐    │
│  │ 👤 Juan Pérez    ✅ Aceptado    │    │
│  │    +1 ✓ Pro ✓                  │    │
│  │    Slots: +6                   │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 👤 María G.     ⏳ Pendiente    │    │
│  │    Link enviado, sin aceptar    │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### 7.2 Badge de Progreso

```
┌─────────────────────────────────────────┐
│  🌱 Referidos: 3/10    Slots ganados: 8 │
│  ████████░░░░░░░░░░░░  80%             │
└─────────────────────────────────────────┘
```

---

## 8. ENDPOINTS API

### 8.1 GET `/api/referral/code`

```typescript
// Returns: { 
//   code: string,
//   expiresAt: string,
//   referralLink: string 
// }
```

### 8.2 GET `/api/referral/stats`

```typescript
// Returns: {
//   totalReferrals: number,
//   acceptedReferrals: number,
//   pendingReferrals: number,
//   proPurchases: number,
//   premiumPurchases: number,
//   slotsEarned: number,
//   premiumDaysEarned: number
// }
```

### 8.3 POST `/api/referral/accept`

```typescript
// Body: { referralCode: string }
// Returns: { success: boolean, reward: { slots: number } }
// Errors: CODE_EXPIRED, CODE_USED, SELF_REFERAL, ALREADY_REFERRED
```

### 8.4 GET `/api/referral/referrals`

```typescript
// Returns: List<ReferralSummary>
// Incluye estado de cada referido y recompensas otorgadas
```

---

## 9. WEBHOOKS

### 9.1 Stripe Webhook - Reward Activation

Cuando el referido completa un checkout:

```typescript
// En webhook handler existente
case 'checkout.session.completed':
  const referral = await findReferralByEmail(customerEmail);
  
  if (referral && referral.status === 'accepted') {
    switch (productType) {
      case 'pro_5':
      case 'pro_10':
      case 'pro_20':
      case 'pro_50':
        if (!userHasPremium(referredUser)) {
          await grantReferralReward(referral, 'pro_purchase');
        }
        break;
        
      case 'premium_monthly':
      case 'premium_yearly':
        if (!userHasPro(referredUser)) {
          await grantReferralReward(referral, 'premium_purchase');
        }
        break;
    }
  }
  break;
```

---

## 10. CONFIGURACIÓN CENTRALIZADA

Todos los valores ajustables viven en `src/data/configProject.ts`:

```typescript
referrals: {
  // Recompensas por hito
  rewards: {
    signup: {
      referrerSlots: 1,
      referredSlots: 1,
      requiredPlants: 5, // plantas para validar aceptación
    },
    proPurchase: {
      referrerSlots: 5,
      referredSlots: 5,
      requiresNoPremium: true, // solo si no tiene Premium
    },
    premiumPurchase: {
      referrerDays: 7,
      referredDays: 7,
      requiresNoPro: true, // solo si no tiene Pro
    },
  },
  
  // Límites
  limits: {
    maxReferralSlots: 100,       // slots max de referral
    codeExpirationDays: 7,       // días de vigencia del código
    maxActiveReferrals: 10,      // referidos activos máximos
  },
  
  // Anti-fraude
  antiFraud: {
    blockSameEmail: true,
    blockSameDevice: true,
    blockSameIP: true,
    blockSamePaymentMethod: true,
  },
}
```

---

## 11. NOTIFICACIONES

### 11.1 Notificaciones In-App

| Evento | Destinatario | Mensaje |
|--------|--------------|---------|
| Referral aceptado | Referrer | "¡Tu amigo Juan se unió! +1 slot" |
| Referral aceptado | Referido | "¡Bienvenido! +1 slot de regalo" |
| Pro purchase referral | Ambos | "¡Tu amigo compró Pro! +5 slots" |
| Premium purchase referral | Ambos | "¡Tu amigo es Premium! +7 días extra" |

### 11.2 Email (opcional, fase 2)

- Invitación con link personalizado
- Recordatorio de código por expirar
- Resumen mensual de referidos

---

## 12. IMPLEMENTATION CHECKLIST

- [ ] 1. Agregar sección `referrals` en `configProject.ts`
- [ ] 2. Crear tabla `referrals` en Supabase
- [ ] 3. Extender `app_metadata` con campos de referral
- [ ] 4. Implementar `/api/referral/code` (generar código)
- [ ] 5. Implementar `/api/referral/accept` (validar + aplicar +1)
- [ ] 6. Modificar webhook de Stripe para detectar purchase referral
- [ ] 7. Crear lógica de `grantReferralReward()` con validación colisión
- [ ] 8. Implementar anti-fraude en accept endpoint
- [ ] 9. Actualizar cálculo de `getTotalSlotLimit()` con referral_slots
- [ ] 10. Crear UI "Invitar Amigos" en Dashboard
- [ ] 11. Agregar notificaciones in-app para rewards
- [ ] 12. TEST: flujo completo referrer → referido → signup → Pro/Premium

---

## 13. MATRIZ DE DECISIONES

| Decisión | Justificación |
|----------|---------------|
| +1 a AMBOS en signup | Incentivo mutuo, ambos motivados a completar el funnel |
| Slots de referral separados de Pro | El cap de 200 es para Pro bought, referral tiene su propio cap de 100 |
| +7 días Premium en vez de slots | Premium ya es ilimitado, días extra extienden la suscripción |
| Colisión Pro/Premium | Evita doble recompensa por misma conversión |
| 5 plantas para aceptación | Filtro anti-fraude: solo usuarios reales con actividad concretan |
| 7 días expiración | Urgencia sin ser agresivo |
| 100 max referral slots | Balance entre reward y sostenibilidad |
