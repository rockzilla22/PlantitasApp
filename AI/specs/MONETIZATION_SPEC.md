# AI/specs/MONETIZATION_SPEC.md: Sistema de Monetización PlantitasApp

## 1. MODELO DE NEGOCIO

| Tier | Precio | Cloud | Slots | Comportamiento |
|------|--------|-------|-------|-----------------|
| **Free** | $0 | ❌ | 50 total | Límite rígido |
| **Pro** (one-time) | $3-15 USD | ❌ | +50 por compra | Acumulable hasta 200 max |
| **Premium** (sub) | $3/mes o $30/año | ✅ | Unlimited | Revierte a 50 al vencer |

### Detalles de Slots
- **Contaje**: Total agregado entre todas las entidades
  - plants + propagations + wishlist + notes + inventoryitems + seasonaltasks
- **Límite Free**: 50 items global
- **Límite Pro**: Máximo 200 slots comprados (50 × 4 compras)
- **Límite Premium**: Ilimitado mientras la subscripción esté activa

### Flujo de Usuario
```
Usuario Free (50 items) → Intenta agregar #51
    → ❌ Bloqueado → Modal Upsell ("Compra Pro o Premium")
    
Usuario Pro (100 slots) → Intenta agregar #101
    → ❌ Bloqueado → Modal Upsell
    
Usuario Premium activo → Puede agregar ilimitados
    → Cloud sync activo
    
Usuario Premium vencido (no renueva)
    → 30 días de gracia para exportar
    → Ver primeras 50 por fecha, resto oculto
```

---

## 2. DATOS EN SUPABASE

### `raw_app_meta_data` Schema
```typescript
interface AppMetadata {
  provider: string;
  providers: string[];
  has_access: boolean;           // Premium activo
  premium_expires_at: string | null;
  premium_started_at: string | null;
  
  // Pro (one-time)
  purchased_slots: number;      // Slots comprados (0-200)
  slots_purchased_at: string | null;
  
  // Tracking
  subscription_id: string | null;
}
```

### Lógica de Cálculo
```typescript
function getSlotLimit(user: User): number {
  const meta = user.raw_app_meta_data;
  
  if (meta.has_access && isPremiumActive(meta.premium_expires_at)) {
    return 999999; // Unlimited
  }
  
  const purchased = meta.purchased_slots || 0;
  return 50 + purchased; // Free 50 + Pro purchased
}

function countUsedSlots(data: AppData): number {
  const { plants, propagations, wishlist, globalNotes, inventory, seasonalTasks } = data;
  
  const invCount = Object.values(inventory).reduce((sum, arr) => sum + arr.length, 0);
  const seasonCount = Object.values(seasonalTasks).reduce((sum, arr) => sum + arr.length, 0);
  
  return plants.length + 
         propagations.length + 
         wishlist.length + 
         globalNotes.length + 
         invCount + 
         seasonCount;
}

function canAddItem(data: AppData): boolean {
  const user = $user.get();
  if (!user) return true; // Free local
  
  const limit = getSlotLimit(user);
  const used = countUsedSlots(data);
  
  return used < limit;
}
```

---

## 3. PRODUCTOS EN STRIPE

### Stripe Products
| Product ID | Nombre | Tipo | Precio | Descripción |
|------------|--------|------|--------|-------------|
| `pro_5` | Pro 5 Slots | one-time | $3 | +5 slots, lifetime |
| `pro_10` | Pro 10 Slots | one-time | $5 | +10 slots, lifetime |
| `pro_20` | Pro 20 Slots | one-time | $8 | +20 slots, lifetime |
| `pro_50` | Pro 50 Slots | one-time | $15 | +50 slots, lifetime |
| `premium_monthly` | Premium Monthly | subscription | $3/month | Cloud + Unlimited |
| `premium_yearly` | Premium Yearly | subscription | $30/year | Cloud + Unlimited (20% desc) |

### Mode
- **Pro (one-time)**: `mode: 'payment'` (Stripe Checkout)
- **Premium**: `mode: 'subscription'` (Stripe Checkout)

---

## 4. WEBHOOK HANDLER

### Endpoint: `/api/webhooks/stripe`
```typescript
// POST /api/webhooks/stripe
// Signature: stripe-signature header validation

// Evento: checkout.session.completed
interface StripeEvent {
  type: 'checkout.session.completed';
  data: {
    object: {
      id: string;
      mode: 'payment' | 'subscription';
      customer: string;
      customer_email: string;
      metadata: {
        userId: string;
        productType: 'pro_5' | 'pro_10' | ... | 'premium_monthly' | 'premium_yearly';
      };
    };
  };
}
```

### Acciones por Evento
```typescript
async function handleCheckoutComplete(event: StripeEvent) {
  const { userId, productType } = event.data.object.metadata;
  
  switch (productType) {
    case 'pro_5':
    case 'pro_10':
    case 'pro_20':
    case 'pro_50':
      await addPurchasedSlots(userId, parseInt(productType.split('_')[1]));
      break;
      
    case 'premium_monthly':
    case 'premium_yearly':
      await activatePremium(userId, productType);
      break;
  }
}

async function addPurchasedSlots(userId: string, slots: number) {
  const user = await supabase.auth.admin.getUserById(userId);
  const current = user.raw_app_meta_data?.purchased_slots || 0;
  const newTotal = Math.min(current + slots, 200); // Cap at 200
  
  await supabase.auth.admin.updateUser(userId, {
    app_metadata: {
      ...user.raw_app_meta_data,
      purchased_slots: newTotal,
      slots_purchased_at: new Date().toISOString(),
    }
  });
}

async function activatePremium(userId: string, productType: string) {
  const duration = productType === 'premium_yearly' ? '1 year' : '1 month';
  const expiresAt = addDuration(new Date(), duration);
  
  await supabase.auth.admin.updateUser(userId, {
    app_metadata: {
      has_access: true,
      premium_started_at: new Date().toISOString(),
      premium_expires_at: expiresAt.toISOString(),
    }
  });
}
```

---

## 5. API ENDPOINTS

### POST `/api/checkout`
```typescript
// Body: { productId: 'pro_5' | 'pro_10' | 'pro_20' | 'pro_50' | 'premium_monthly' | 'premium_yearly' }
// Returns: { url: stripeCheckoutUrl }
```

### GET `/api/subscription/status`
```typescript
// Returns: { 
//   hasPremium: boolean, 
//   expiresAt: string | null,
//   slotsLimit: number,
//   slotsUsed: number
// }
```

### POST `/api/convert-to-pro`
```typescript
// Convierte cuenta local a Pro (para usuarios sin cloud que compran slots)
// Body: { email, paymentProof }
// Returns: { success: boolean }
```

---

## 6. UI - PRICING PAGE

### Nuevo Layout
```
┌─────────────────────────────────────────┐
│           ELIGE TU PLAN                 │
├─────────────────────────────────────────┤
│  🌱 Free   │   ☁️ Premium   │  💎 Pro   │
│   $0/mes   │   $3/mes      │  $3-15    │
│  50 items  │   Unlimited  │  +50/item │
│           │   + Cloud    │  (one-time)│
├─────────────────────────────────────────┤
│  ✅ Todo   │  ✅ Todo    │  ✅ Todo   │
│  ✅ Local │  ✅ Cloud   │  ✅ Local  │
│  ❌ Cloud │  ✅ Backup  │  ❌ Cloud  │
│  ⚠️ 50    │  ♾️ ∞      │  ⚡ Stack  │
└─────────────────────────────────────────┘
```

### Botones de Compra
```tsx
// PricingPage.tsx
const products = [
  { id: 'pro_5', name: 'Pro 5', price: 3, slots: 5 },
  { id: 'pro_10', name: 'Pro 10', price: 5, slots: 10 },
  { id: 'pro_20', name: 'Pro 20', price: 8, slots: 20 },
  { id: 'pro_50', name: 'Pro 50', price: 15, slots: 50 },
  { id: 'premium_monthly', name: 'Premium', price: 3, period: 'month' },
  { id: 'premium_yearly', name: 'Premium', price: 30, period: 'year' },
];

<button onClick={() => createCheckout(product.id)}>
  {product.price === undefined ? 'Free' : `$${product.price}`}
</button>
```

---

## 7. UI - GATING EN APP

### Antes de agregar item
```tsx
// plantStore.ts新增
export const checkCanAdd = (): { allowed: boolean; reason?: string } => {
  const user = $user.get();
  if (!user) return { allowed: true }; // Free local
  
  const meta = user.raw_app_meta_data;
  if (hasPremium(meta)) return { allowed: true };
  
  const limit = 50 + (meta.purchased_slots || 0);
  const used = countUsedSlots($store.get());
  
  if (used >= limit) {
    return { allowed: false, reason: 'uplimit' };
  }
  
  return { allowed: true };
};

// En cada addPlant(), addPropagation(), etc
const check = checkCanAdd();
if (!check.allowed) {
  openModal('upsell', { type: check.reason });
  return;
}
```

### Upsell Modal
```tsx
// Modals.tsx
<Modal name="upsell">
  <h2>💎 ¡Espacio agotado!</h2>
  <p>Tenés {used}/{limit} items usados</p>
  
  <button onClick={() => router.push('/pricing')}>
    Ver Planes
  </button>
</Modal>
```

### Badge en Header
```tsx
// Header.tsx
const getUserStatus = () => {
  const meta = user?.raw_app_meta_data;
  if (!meta) return 'free';
  if (hasPremium(meta)) return 'premium';
  if (meta.purchased_slots > 0) return 'pro';
  return 'free';
};

// Mostrar: 🌱 / ☁️ / 💎 según estado
```

---

## 8. ADMIN PANEL - EXTENSION

### Nueva columna en Users table
| Campo | Tipo | Descripción |
|-------|------|-------------|
| has_access | boolean | Premium activo |
| premium_expires_at | timestamp | Cuándo vence |
| purchased_slots | number | Slots Pro comprados |
| subscription_id | string | ID de Stripe |

### Acciones Admin
- Ver quién tiene Premium activo
- Otorgar/quitar acceso manual
- Agregar slots sin pagar (testing)
- Ver historial de compras

---

## 9. IMPLEMENTATION Checklist

- [ ] 1. Actualizar Pricing Page con UI de planes
- [ ] 2. Crear productos en Stripe Dashboard
- [ ] 3. Implementar `/api/checkout`
- [ ] 4. Implementar webhook handler
- [ ] 5. Agregar funciones de slot en store
- [ ] 6. Agregar gating en cada add*()
- [ ] 7. Crear Upsell Modal
- [ ] 8. Actualizar Badge en Header
- [ ] 9. Agregar columnas en Admin Panel
- [ ] 10. TEST: flujo completo Free → Pro
- [ ] 11. TEST: flujo completo Free → Premium

---

## 10. COSTOS ESTIMADOS (Supabase + Stripe)

| Servicio | Tier | Costo |
|----------|------|-------|
| Supabase Free | Pro | $0/mes (hasta 500MB, 100 users) |
| Supabase Pro | 500MB extra | $25/mes |
| Stripe | Estándar | 2.9% + $0.30 per transaction |

### Margen por venta
- Pro $5 → costo ~$0.45 → margen ~$4.55
- Premium $3/mes → costo ~$0.10 → margen ~$2.90

---

## 11. NOTES

- No hay refunds implementados (primera versión)
- Elone-time NO incluye cloud, solo espacio local
- Los slots comprados son permanentes, no expiran
- Si el usuario compra Premium DESPUÉS de Pro, mantiene sus slots
- El límite de 200 es para evitar abuso, no es arbitrario