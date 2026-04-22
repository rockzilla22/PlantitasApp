# AI/specs/STRIPE_SPEC.md: Configuración de Stripe para Plantacora

## 1. RESUMEN

Este documento detalla la estrategia de precios, estructura de productos y configuración técnica de Stripe para soportar el modelo de monetización de Plantacora.

> **Nota**: Los valores aquí definidos están centralizados en `src/data/configProject.ts`. Cualquier cambio de precios debe hacerse ahí para mantener consistencia entre el código y Stripe Dashboard.

---

## 2. ESTRATEGIA DE PRECIOS

### 2.1 Justificación del Modelo

| Costo | Valor | Fuente |
|-------|-------|--------|
| **Supabase Basic** | $25/mes | Base de datos PostgreSQL + Auth + Storage |
| **Dominio + SSL** | $5/mes | Vercel Pro o dominio propio |
| **Transacciones Stripe** | 2.9% + $0.30 | Por cada pago exitoso |

### 2.2 Punto de Equilibrio (Break-even)

| Escenario | Ingreso | Costo Stripe | Costo Supabase | Margen Neto |
|-----------|---------|--------------|----------------|-------------|
| 1 Pro ($2.50) | $2.50 | -$0.38 | -$25.00 | **-$22.88** |
| 10 Pro ($2.50 c/u) | $25.00 | -$3.30 | -$25.00 | **-$3.30** |
| 11 Pro ($2.50 c/u) | $27.50 | -$3.59 | -$25.00 | **-$1.09** |
| 12 Pro ($2.50 c/u) | $30.00 | -$3.90 | -$25.00 | **+$0.10** ✅ |
| 1 Premium/mes | $4.00 | -$0.42 | -$25.00 | **-$21.42** |
| 6 Premium/mes | $24.00 | -$3.12 | -$25.00 | **-$4.12** |
| 7 Premium/mes | $28.00 | -$3.54 | -$25.00 | **-$0.54** |
| **8 Premium/mes** | $32.00 | -$3.96 | -$25.00 | **+$3.04** ✅ |

### 2.3 Modelo de Sostenibilidad

```
┌─────────────────────────────────────────────────────────────┐
│  META REALISTA (Fase Inicial)                              │
├─────────────────────────────────────────────────────────────┤
│  8 usuarios Premium × $32/mes = $256/mes bruto             │
│  - Stripe ($34) = $222/mes                                 │
│  - Supabase Basic ($25) = $197/mes neto                    │
│  = $2,364/año de revenue                                   │
└─────────────────────────────────────────────────────────────┘
```

> **Nota importante**: El modelo de slots (one-time) tiene **margen negativo** en ventas individuales. Su propósito es:
> 1. Onboarding de pago (baja barrera)
> 2. Conversion a Premium (alto margen recurrente)
> 3. Captar usuarios que no pueden pagar suscripción pero sí compra única

---

## 3. PRODUCTOS EN STRIPE DASHBOARD

### 3.1 Productos de Slots (One-Time)

| Product ID | Nombre | Modo | Precio USD | Slots | Costo/unit | Margen |
|------------|--------|------|------------|-------|------------|--------|
| `pro_5` | Pro 5 Slots | payment | $2.50 | +5 | $0.38 | $2.12 |
| `pro_10` | Pro 10 Slots | payment | $5.00 | +10 | $0.45 | $4.55 |
| `pro_15` | Pro 15 Slots | payment | $7.50 | +15 | $0.53 | $6.97 |

> **Estrategia**: El pack de 10 slots tiene el **mejor ratio precio/valor** ($0.50/slot). El de 5 es el entry-point más barato ($0.50/slot).

### 3.2 Productos de Suscripción (Recurrente)

| Product ID | Nombre | Modo | Precio | periodicity | Descuento vs Monthly |
|------------|--------|------|--------|-------------|---------------------|
| `premium_monthly` | Premium Monthly | subscription | $4.00 | month | — |
| `premium_yearly` | Premium Yearly | subscription | $43.20 | year | **10% OFF** ($3.60/mes) |

### 3.3 Comparativa de Descuento

| Mensual (12 meses) | Anual | Ahorro | Precio real/mes |
|--------------------|-------|--------|-----------------|
| $4 × 12 = $48 | $43.20 | $4.80 (10%) | $3.60 |

---

### 3.4 Skins (Micro-transacciones)

#### 3.4.1 Room Skins (Más visibles, más valor)

| Product ID | Nombre | Modo | Precio USD | Costo/unit | Margen |
|------------|--------|------|------------|------------|--------|
| `skin_room_rustic` | Skin Rústico (Room) | payment | $0.50 | $0.31 | $0.19 |
| `skin_room_minimal` | Skin Minimal (Room) | payment | $0.50 | $0.31 | $0.19 |
| `skin_room_zen` | Skin Zen (Room) | payment | $1.00 | $0.33 | $0.67 |
| `skin_room_tropical` | Skin Tropical (Room) | payment | $1.00 | $0.33 | $0.67 |
| `skin_room_cottage` | Skin Cottage (Room) | payment | $1.00 | $0.33 | $0.67 |

> **Estrategia**: Los room skins son el producto más accesible ($0.50-1). Bajo margen por unidad pero alto volumen potencial. El usuario puede comprar skins para múltiples rooms.

#### 3.4.2 Plant Skins (Pequeñas, "hyper pequeñas")

| Product ID | Nombre | Modo | Precio USD | Costo/unit | Margen |
|------------|--------|------|------------|------------|--------|
| `skin_plant_pot_1` | Maceta Vintage | payment | $0.25 | $0.30 | **-$0.05** ⚠️ |
| `skin_plant_pot_2` | Maceta Cerámica | payment | $0.25 | $0.30 | **-$0.05** ⚠️ |
| `skin_plant_pot_3` | Maceta Diseño | payment | $0.50 | $0.32 | $0.18 |

> **Nota**: Las plant skins de $0.25 tienen margen negativo ($0.30 costo Stripe). **Estrategia**: Vender en bundle de 3+ para cubrir costos, o aumentar a $0.50 mínimo.

#### 3.4.3 Bundle Skins (Mejor valor)

| Product ID | Nombre | Modo | Precio USD | Incluir | Margen |
|------------|--------|------|------------|---------|--------|
| `skin_room_pack_3` | 3 Room Skins | payment | $2.00 | 3 rooms (任选) | $1.00 |
| `skin_plant_pack_5` | 5 Plant Skins | payment | $1.50 | 5 macetas | $0.70 |
| `skin_full_pack` | Skins Pack Completo | payment | $5.00 | 3 rooms + 5 plants | $3.80 |

#### 3.4.4 Resumen de Margen (Skins)

| Escenario | Ingreso | Costo Stripe | Margen Neto |
|-----------|---------|--------------|-------------|
| 1 Room Skin ($0.50) | $0.50 | -$0.31 | **$0.19** |
| 10 Room Skins ($0.50) | $5.00 | -$0.45 | **$4.55** |
| 1 Plant Skin ($0.50) | $0.50 | -$0.32 | **$0.18** |
| 1 Plant Skin ($0.25) | $0.25 | -$0.30 | **-$0.05** ⚠️ |
| 1 Full Pack ($5.00) | $5.00 | -$0.45 | **$4.55** |

> **Nota importante**: Los skins son **micro-transacciones de bajo margen**. Su propósito no es cubrir costos fijos, sino:
> 1. Revenue adicional de usuarios activos (impulse buy)
> 2. Personalización que aumenta engagement
> 3. No dependen del break-even de Premium

---

## 4. ESTRUCTURA DE PRODUCTOS EN DASHBOARD

### 4.1 Crear en Stripe Dashboard

```
Stripe Dashboard → Products → + Add Product

────────────────────────────────────────
PRODUCTO 1: Pro 5 Slots
────────────────────────────────────────
Name: Pro 5 Slots
Description: +5 slots permanentes para tu jardín botánico
Pricing: One-time price → $2.50 USD
Metadata:
  productType: pro
  slots: 5
────────────────────────────────────────

PRODUCTO 2: Pro 10 Slots
────────────────────────────────────────
Name: Pro 10 Slots  
Description: +10 slots permanentes - Mejor valor
Pricing: One-time price → $5.00 USD
Metadata:
  productType: pro
  slots: 10
────────────────────────────────────────

PRODUCTO 3: Pro 15 Slots
────────────────────────────────────────
Name: Pro 15 Slots
Description: +15 slots permanentes - Mejor valor
Pricing: One-time price → $7.50 USD
Metadata:
  productType: pro
  slots: 15
────────────────────────────────────────

PRODUCTO 4: Room Skin - Rústico
────────────────────────────────────────
Name: Room Skin - Rústico
Description: Skin decorativo para una habitación
Pricing: One-time price → $0.50 USD
Metadata:
  productType: skin_room
  skinId: rustic
────────────────────────────────────────

PRODUCTO 5: Room Skin - Minimal
────────────────────────────────────────
Name: Room Skin - Minimal
Description: Skin decorativo para una habitación
Pricing: One-time price → $0.50 USD
Metadata:
  productType: skin_room
  skinId: minimal
────────────────────────────────────────

PRODUCTO 6: Room Skin - Zen
────────────────────────────────────────
Name: Room Skin - Zen
Description: Skin decorativo para una habitación
Pricing: One-time price → $1.00 USD
Metadata:
  productType: skin_room
  skinId: zen
────────────────────────────────────────

PRODUCTO 7: Room Skin - Tropical
────────────────────────────────────────
Name: Room Skin - Tropical
Description: Skin decorativo para una habitación
Pricing: One-time price → $1.00 USD
Metadata:
  productType: skin_room
  skinId: tropical
────────────────────────────────────────

PRODUCTO 8: Room Skin - Cottage
────────────────────────────────────────
Name: Room Skin - Cottage
Description: Skin decorativo para una habitación
Pricing: One-time price → $1.00 USD
Metadata:
  productType: skin_room
  skinId: cottage
────────────────────────────────────────

PRODUCTO 9: Plant Skin Pack (3 Macetas)
────────────────────────────────────────
Name: Plant Skin Pack
Description: 3 skins de macetas para tus plantas
Pricing: One-time price → $1.50 USD
Metadata:
  productType: skin_plant_pack
  skins: 3
────────────────────────────────────────

PRODUCTO 10: Premium Mensual
────────────────────────────────────────────────────────────────
Name: Premium - Monthly
Description: Ilimitado + Cloud Sync - Facturado mensual
Pricing: 
  - Price: $4.00 USD
  - Billing: Recurring
  - Interval: Monthly
Metadata:
  productType: premium
  billing: monthly
────────────────────────────────────────────────────────────────

PRODUCTO 11: Premium Anual
────────────────────────────────────────────────────────────────
Name: Premium - Yearly
Description: Ilimitado + Cloud Sync - 10% dto
Pricing:
  - Price: $43.20 USD
  - Billing: Recurring
  - Interval: Yearly
Metadata:
  productType: premium
  billing: yearly
  discount: 10
```
Stripe Dashboard → Products → + Add Product

─────────────────────────────────────────
PRODUCTO 1: Pro 5 Slots
─────────────────────────────────────────
Name: Pro 5 Slots
Description: +5 slots permanentes para tu jardín botánico
Pricing: One-time price → $3.00 USD
Metadata:
  productType: pro
  slots: 5
─────────────────────────────────────────

PRODUCTO 2: Pro 10 Slots
─────────────────────────────────────────
Name: Pro 10 Slots  
Description: +10 slots permanentes - Mejor valor
Pricing: One-time price → $5.00 USD
Metadata:
  productType: pro
  slots: 10
─────────────────────────────────────────

... (repetir para pro_20, pro_50)

PRODUCTO 5: Premium Mensual
─────────────────────────────────────────────────────────────────
Name: Premium - Monthly
Description: Ilimitado + Cloud Sync - Facturado mensual
Pricing: 
  - Price: $4.00 USD
  - Billing: Recurring
  - Interval: Monthly
Metadata:
  productType: premium
  billing: monthly
─────────────────────────────────────────────────────────────────

PRODUCTO 6: Premium Anual
─────────────────────────────────────────────────────────────────
Name: Premium - Yearly
Description: Ilimitado + Cloud Sync - 10% dto
Pricing:
  - Price: $43.20 USD
  - Billing: Recurring
  - Interval: Yearly
Metadata:
  productType: premium
  billing: yearly
  discount: 10
```

---

## 5. CONFIGURACIÓN TÉCNICA

### 5.1 Checkout Mode

```typescript
// Pro (one-time)
const checkoutPro = await stripe.checkout.sessions.create({
  mode: 'payment',           // ← Pago único
  line_items: [{
    price: 'price_xxx',      // ID del producto pro_X
    quantity: 1,
  }],
  metadata: {
    userId: user.id,
    productType: 'pro_5',     // ← Identificador del pack
  },
});

// Premium (subscription)
const checkoutPremium = await stripe.checkout.sessions.create({
  mode: 'subscription',       // ← Suscripción recurrente
  line_items: [{
    price: 'price_yyy',      // ID del producto premium_monthly/yearly
    quantity: 1,
  }],
  metadata: {
    userId: user.id,
    productType: 'premium_monthly', // o premium_yearly
  },
});
```

### 5.2 Webhook Events Requeridos

| Evento | Acción | Prioridad |
|--------|--------|-----------|
| `checkout.session.completed` | Activar producto (slots o Premium) | 🔴 Alta |
| `customer.subscription.updated` | Actualizar fecha de expiración | 🔴 Alta |
| `customer.subscription.deleted` | Revocar acceso Premium | 🔴 Alta |
| `invoice.payment_failed` | Notificar usuario | 🟡 Media |
| `charge.refunded` | Revertir slots (si aplica) | 🟡 Media |

### 5.3 Metadata Estándar

```typescript
// En todo checkout session
metadata: {
  userId: string;           // ID de Supabase Auth
  productType: string;      // pro_5 | pro_10 | pro_15 | skin_room | skin_plant_pack | premium_monthly | premium_yearly
  source: 'web' | 'mobile'; // Para tracking analytics
}

// En subscription
metadata: {
  userId: string;
  productType: 'premium_monthly' | 'premium_yearly';
  originalPrice: number;
  discount: number;         // 0 o 10
}

// En skin purchase
metadata: {
  userId: string;
  productType: 'skin_room' | 'skin_plant_pack';
  skinId: string;           // rustic | minimal | zen | tropical | cottage
  roomKey?: string;         // Para room skins: living, kitchen, etc.
}
```

---

## 6. WEBHOOK HANDLER

### 6.1 Endpoint

```
POST /api/webhooks/stripe
Headers:
  - stripe-signature: <signature>
  - Content-Type: application/json
```

### 6.2 Implementación

```typescript
// src/app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { addPurchasedSlots } from '@/core/application/AddPurchasedSlots';
import { activatePremium } from '@/core/application/ActivatePremium';
import { revokePremium } from '@/core/application/RevokePremium';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, productType, skinId, roomKey } = session.metadata!;
      
      if (productType.startsWith('pro_')) {
        const slots = parseInt(productType.split('_')[1]);
        await addPurchasedSlots(userId, slots);
      } else if (productType.startsWith('premium_')) {
        const duration = productType === 'premium_yearly' ? '1 year' : '1 month';
        await activatePremium(userId, duration);
      } else if (productType === 'skin_room') {
        // Desbloquear skin de room
        await unlockRoomSkin(userId, skinId!, roomKey!);
      } else if (productType === 'skin_plant_pack') {
        // Desbloquear pack de skins de plantas
        await unlockPlantSkinPack(userId, 3);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.userId;
      
      // Actualizar fecha de expiración
      await updatePremiumExpiry(userId, subscription.current_period_end * 1000);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.userId;
      
      // Revocar acceso
      await revokePremium(userId);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }));
}
```

---

## 7. IMPUESTOS Y MONEDAS

### 7.1 Configuración

| Setting | Valor |
|---------|-------|
| Moneda | **USD** (estándar, evita conversiones) |
| Taxes | **Disable** (precio es final, usuario en país sin VAT/IVA) |
| Currency conversion | Stripe convierte automáticamente si el usuario paga en otra moneda |

### 7.2 Configuración en Stripe

```
Settings → General → Default currency: USD
Settings → Tax → Disable automatic taxes (para MVP)
Checkout → Currency: USD (show pricing in customer's currency: ON)
```

---

## 8. TESTING

### 8.1 Modo Test

```
Claves de test disponibles en:
Stripe Dashboard → Developers → API Keys

STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### 8.2 Cards de Prueba

| Card Number | Resultado |
|-------------|-----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0000 0000 3220 | 3D Secure required |

### 8.3 Webhook CLI

```bash
# Listen to webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Output:
# > Ready! Your webhook signing secret is whsec_xxx (use this in .env)
```

---

## 9. VARIABLES DE ENTORNO

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_xxx          # Prod: sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx  # Prod: pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx       # Del CLI o Dashboard

# Testing
STRIPE_SECRET_KEY=sk_test_xxx         # Test: sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # Test: pk_test_xxx
```

---

## 10. CONFIGURACIÓN CENTRALIZADA

Los valores de productos están en `src/data/configProject.ts`:

```typescript
// configProject.ts
monetization: {
  // Productos Pro (one-time)
  proProducts: [
    { id: 'pro_5', name: 'Pro 5 Slots', price: 2.50, slots: 5, stripePriceId: 'price_xxx' },
    { id: 'pro_10', name: 'Pro 10 Slots', price: 5.00, slots: 10, stripePriceId: 'price_xxx' },
    { id: 'pro_15', name: 'Pro 15 Slots', price: 7.50, slots: 15, stripePriceId: 'price_xxx' },
  ],
  
  // Productos Premium (subscription)
  premiumProducts: [
    { id: 'premium_monthly', name: 'Premium Monthly', price: 4, period: 'month', stripePriceId: 'price_xxx' },
    { id: 'premium_yearly', name: 'Premium Yearly', price: 43.20, period: 'year', discount: 10, stripePriceId: 'price_xxx' },
  ],

  // Room Skins (one-time)
  roomSkins: [
    { id: 'rustic', name: 'Rustico', price: 0.50, stripePriceId: 'price_xxx' },
    { id: 'minimal', name: 'Minimal', price: 0.50, stripePriceId: 'price_xxx' },
    { id: 'zen', name: 'Zen', price: 1.00, stripePriceId: 'price_xxx' },
    { id: 'tropical', name: 'Tropical', price: 1.00, stripePriceId: 'price_xxx' },
    { id: 'cottage', name: 'Cottage', price: 1.00, stripePriceId: 'price_xxx' },
  ],

  // Plant Skins (one-time)
  plantSkinPacks: [
    { id: 'skin_plant_pack_3', name: 'Plant Skin Pack (3)', price: 1.50, count: 3, stripePriceId: 'price_xxx' },
  ],
  
  // Costos
  costs: {
    supabase: { basic: 25 },  // $25/mes
    stripe: { percent: 2.9, fixed: 0.30 },
  },
}
```

---

## 11. IMPLEMENTATION CHECKLIST

- [ ] 1. Crear cuenta Stripe (si no existe)
- [ ] 2. Configurar productos en Stripe Dashboard
- [ ] 3. Obtener Stripe Price IDs y guardarlos en configProject.ts
- [ ] 4. Configurar webhook endpoint
- [ ] 5. Probar webhook con Stripe CLI
- [ ] 6. Implementar `/api/checkout` endpoint
- [ ] 7. Implementar webhook handler completo
- [ ] 8. Agregar STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET a producción
- [ ] 9. TEST: Compra Pro one-time
- [ ] 10. TEST: Suscripción Premium mensual
- [ ] 11. TEST: Upgrade de Free → Pro → Premium
- [ ] 12. TEST: Cancelación de Premium (webhook subscription.deleted)
- [ ] 13. Configurar email receipts en Stripe (opcional)

---

## 12. FAQ STRIPE

### P: ¿Puedo cambiar precios después de crear productos?
**R**: No. En Stripe, los precios son inmutables. Para cambiar precios, crear nuevos productos y archivar los viejos.

### P: ¿Cómo manejo refunds?
**R**: Por ahora no hay refunds implementados. Para futura versión: usar `stripe.refunds.create()`.

### P: ¿Qué pasa si Stripe baja?
**R**: La app debe manejar gracefully el caso donde checkout falla. Mostrar mensaje amigable.

### P: ¿Puedo ofrecer códigos de descuento?
**R**: Sí, usar **Stripe Coupons** o **Promotion Codes**. Crear en Dashboard → Products → Coupons.

### P: ¿Cómo sé si un usuario es suscriptor activo?
**R**: Consultar `user.raw_app_meta_data.has_access` + verificar `premium_expires_at > now`.

---

## 13. NOTAS

- La estrategia de precios prioriza **Premium recurrente** sobre Pro one-time
- El objetivo inicial es llegar a **10 Premium** para cubrir Supabase Basic
- Los packs de slots son entry-points de bajo costo para convertir a Premium después
- El descuento anual (10%) es suficiente para impulsar conversiones sin sacrificar demasiado margen
