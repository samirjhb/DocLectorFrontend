# DocLectorFrontend

Frontend de **ClaridadContrato** — sube un contrato (PDF, JPG, PNG), lo manda a analizar y muestra en lenguaje simple qué cláusulas conviene revisar antes de firmar. Angular 17 (standalone components, signals), Tailwind, modo claro/oscuro.

El backend (NestJS) vive en un repo separado: [DocLectorBackend](https://github.com/samirjhb/DocLectorBackend).

## Correrlo localmente

```bash
npm install
npm start
```

Levanta en `http://localhost:4200` con un proxy (`proxy.conf.json`) que redirige `/api` hacia `http://localhost:3000` — necesita el backend corriendo en paralelo para funcionar.

## Build de producción

```bash
npm run build
```

Genera los archivos estáticos en `dist/client/browser/`.

La URL del backend para producción se configura en [`src/environments/environment.prod.ts`](src/environments/environment.prod.ts) — hay que actualizarla con la URL real del deploy del backend en Render.

## Deploy

Pensado para [Vercel](https://vercel.com) (free tier) — el archivo [`vercel.json`](vercel.json) en la raíz de este repo ya tiene la configuración (build command, carpeta de salida, y el rewrite necesario para que las rutas de Angular como `/resultado` funcionen al refrescar la página). Al importar este repo en Vercel, lo detecta automáticamente.

## Generado con

[Angular CLI](https://github.com/angular/angular-cli) 17.3.17.
