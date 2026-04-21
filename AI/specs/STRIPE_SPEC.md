# AI/specs/STRIPE_SPEC.md: Configuración de Stripe para PlantitasApp

## 1. RESUMEN

Este documento detalla la estrategia de precios, estructura de productos y configuración técnica de Stripe para soportar el modelo de monetización de PlantitasApp.

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
| 1 Pro ($5) | $5.00 | -$0.45 | -$25.00 | **-$20.45** |
| 5 Pro ($5 c/u) | $25.00 | -$2.25 | -$25.00 | **-$2.25** |
| 9 Pro ($5 c/u) | $45.00 | -$4.05 | -$25.00 | **+$15.95** |
| 1 Premium/mes | $3.00 | -$0.39 | -$25.00 | **-$21.61** |
| 9 Premium/mes | $27.00 | -$3.51 | -$25.00 | **-$1.51** |
| 10 Premium/mes | $30.00 | -$3.90 | -$25.00 | **+$1.10** |

### 2.3 Modelo de Sostenibilidad

```
┌─────────────────────────────────────────────────────────────┐
│  META REALISTA (Fase Inicial)                              │
├─────────────────────────────────────────────────────────────┤
│  10 usuarios Premium × $27/mes = $270/mes bruto            │
│  - Stripe ($35) = $235/mes                                 │
│  - Supabase Basic ($25) = $210/mes neto                    │
│  = $2,520/año de revenue                                   │
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
| `pro_5` | Pro 5 Slots | payment | $3.00 | +5 | $0.39 | $2.61 |
| `pro_10` | Pro 10 Slots | payment | $5.00 | +10 | $0.45 | $4.55 |
| `pro_20` | Pro 20 Slots | payment | $8.00 | +20 | $0.53 | $7.47 |
| `pro_50` | Pro 50 Slots | payment | $15.00 | +50 | $0.75 | $14.25 |

> **Estrategia**: El pack de 10 slots tiene el **mejor ratio precio/valor** ($0.50/slot). El de 5 es el entry-point más barato.

### 3.2 Productos de Suscripción (Recurrente)

| Product ID | Nombre | Modo | Precio | periodicity | Descuento vs Monthly |
|------------|--------|------|--------|-------------|---------------------|
| `premium_monthly` | Premium Monthly | subscription | $3.00 | month | — |
| `premium_yearly` | Premium Yearly | subscription | $30.00 | year | **10% OFF** ($2.50/mes) |

### 3.3 Comparativa de Descuento

| Mensual (12 meses) | Anual | Ahorro | Precio real/mes |
|--------------------|-------|--------|-----------------|
| $3 × 12 = $36 | $30 | $6 (16.7%) | $2.50 |

---

## 4. ESTRUCTURA DE PRODUCTOS EN DASHBOARD

### 4.1 Crear en Stripe Dashboard

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
─────────────────────────────────────────
Name: Premium - Monthly
Description: Ilimitado + Cloud Sync - Facturado mensual
Pricing: 
  - Price: $3.00 USD
  - Billing: Recurring
  - Interval: Monthly
Metadata:
  productType: premium
  billing: monthly
─────────────────────────────────────────

PRODUCTO 6: Premium Anual
─────────────────────────────────────────
Name: Premium - Yearly
Description: Ilimitado + Cloud Sync - 10% dto
Pricing:
  - Price: $30.00 USD
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
  productType: string;      // pro_5 | pro_10 | pro_20 | pro_50 | premium_monthly | premium_yearly
  source: 'web' | 'mobile'; // Para tracking analytics
}

// En subscription
metadata: {
  userId: string;
  productType: 'premium_monthly' | 'premium_yearly';
  originalPrice: number;
  discount: number;         // 0 o 10
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
      const { userId, productType } = session.metadata!;
      
      if (productType.startsWith('pro_')) {
        const slots = parseInt(productType.split('_')[1]);
        await addPurchasedSlots(userId, slots);
      } else if (productType.startsWith('premium_')) {
        const duration = productType === 'premium_yearly' ? '1 year' : '1 month';
        await activatePremium(userId, duration);
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
    { id: 'pro_5', name: 'Pro 5 Slots', price: 3, slots: 5, stripePriceId: 'price_xxx' },
    { id: 'pro_10', name: 'Pro 10 Slots', price: 5, slots: 10, stripePriceId: 'price_xxx' },
    { id: 'pro_20', name: 'Pro 20 Slots', price: 8, slots: 20, stripePriceId: 'price_xxx' },
    { id: 'pro_50', name: 'Pro 50 Slots', price: 15, slots: 50, stripePriceId: 'price_xxx' },
  ],
  
  // Productos Premium (subscription)
  premiumProducts: [
    { id: 'premium_monthly', name: 'Premium Monthly', price: 3, period: 'month', stripePriceId: 'price_xxx' },
    { id: 'premium_yearly', name: 'Premium Yearly', price: 30, period: 'year', discount: 10, stripePriceId: 'price_xxx' },
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
