# Electronic Lake

Landing + tienda de celulares para [@electronic_lake](https://www.instagram.com/electronic_lake/). Catálogo generado automáticamente desde un mensaje del importador usando Groq (LLaMA 3.3 70B), con checkout por WhatsApp.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19)
- **Tailwind CSS v4**
- **TypeScript**
- **Zustand** (carrito con persistencia en localStorage)
- **Groq SDK** (extracción de modelos + specs)
- **@vercel/blob** (storage del catálogo)
- **Wikipedia REST API** (imágenes de modelos, cacheadas 30 días)

## Estructura

```
src/
  app/
    page.tsx                 ← landing + grid
    producto/[slug]/page.tsx ← detalle de producto
    admin/                   ← panel de admin protegido
    layout.tsx               ← header, footer, cart drawer
  components/
  lib/
    cart.ts                  ← store zustand
    catalog.ts               ← read/write a Vercel Blob
    groq.ts                  ← extracción + enriquecimiento con LLaMA
    images.ts                ← resolución de imágenes vía Wikipedia
    whatsapp.ts
    types.ts
```

## Variables de entorno

Copiá `.env.local.example` a `.env.local` y completá:

```
GROQ_API_KEY=gsk_...
ADMIN_PASSWORD=...
NEXT_PUBLIC_WHATSAPP_NUMBER=5491138184414
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/electronic_lake/
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

Para obtener `BLOB_READ_WRITE_TOKEN`: en el proyecto de Vercel → **Storage** → **Create Store** → **Blob** → conectar al proyecto (el token se inyecta automáticamente en todos los entornos).

## Desarrollo

```bash
npm install
npm run dev
```

## Admin

- Ruta: `/admin`
- Contraseña: `ADMIN_PASSWORD`
- Flujo:
  1. Pegar el listado del importador (precios en USD)
  2. Ingresar el valor del dólar (ARS)
  3. **Generar catálogo** → Groq extrae modelos, genera specs + highlights, Wikipedia resuelve imágenes, se guarda en Blob
  4. Para ajustar solo el tipo de cambio usar **Solo actualizar dólar**

## Checkout

El carrito persiste en localStorage. El botón **Finalizar por WhatsApp** abre `wa.me/<numero>` con el detalle de los productos y el total en ARS.

---

Diseñado y desarrollado por [eterlab](https://eterlab.co/).
