# Catálogo Mayorista DianubyHome

Catálogo web responsive de espejos con luz y tecnología fabricados por DianubyHome. Está pensado para clientes mayoristas y permite explorar productos, elegir variantes, preparar un pedido y enviarlo completo por WhatsApp.

Sitio público: <https://caraqueleonardoAlfredo.github.io/catalogo-dianubyhome/>

## Funcionalidades

- Nueve líneas de producto con filtros por tecnología.
- Fichas con galería, características, variantes y precios.
- Cambio automático de fotografía al seleccionar variantes visuales.
- Carrito persistente con productos, variantes y cantidades.
- Total estimado y aviso del mínimo mayorista de 15 unidades combinables.
- Pedido detallado por WhatsApp al +54 9 3863 536486.
- Diseño adaptado a computadora, tablet y celular.
- Sitio completamente estático, sin servidor, base de datos ni credenciales.

## Tecnología

- React 19
- TypeScript
- Vite 8
- CSS responsive
- GitHub Actions y GitHub Pages

## Instalación

Requiere Node.js 22.13 o superior.

```bash
npm install
```

## Desarrollo local

```bash
npm run dev
```

Vite mostrará la dirección local en la terminal. El proyecto usa la base `/catalogo-dianubyhome/`, igual que GitHub Pages.

## Compilación

```bash
npm run build
```

La salida estática se genera en `dist/` e incluye `index.html`. Para revisar esa compilación localmente:

```bash
npm run preview
```

Para compilar y ejecutar las verificaciones automáticas:

```bash
npm test
```

## Actualizar el catálogo

Los productos están definidos en `app/page.tsx`, dentro de la constante `PRODUCTS`.

- Para actualizar un precio, editar `price` en la variante correspondiente.
- Para agregar una variante, añadirla en `variants` sin modificar precios no confirmados.
- Para relacionar una variante con una fotografía, usar `imageIndex`, contando desde `0` según el orden de `images`.
- Para cambiar el número de WhatsApp, editar `whatsappNumber`.
- Para modificar estilos, editar `app/globals.css`.

Las fotografías se guardan dentro de `public/images/`. Las rutas de productos se construyen con `import.meta.env.BASE_URL`; no deben comenzar con `/images`. El logo y el favicon se encuentran en `public/logo-dianuby.png` y `public/favicon.png`.

## Despliegue automático

El workflow `.github/workflows/deploy-pages.yml` se ejecuta en cada push a `main`:

1. Instala las dependencias con `npm ci`.
2. Compila el sitio con `npm run build`.
3. Sube `dist/` como artifact de GitHub Pages.
4. Publica el artifact en el entorno `github-pages`.

En la configuración del repositorio, GitHub Pages debe tener como origen **GitHub Actions**. El workflow también puede ejecutarse manualmente desde la pestaña Actions.

## Condiciones comerciales publicadas

La compra mínima es de 15 unidades combinables. El pago puede realizarse por transferencia o efectivo: 50% para iniciar la fabricación y 50% al entregar. Los precios publicados están expresados en pesos argentinos, sin IVA y sujetos a actualización.
