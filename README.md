# INNOVA — Evaluación de desempeño (MVP)

Aplicación web interna para captura manual del instrumento de evaluación de desempeño: cálculo de subtotales por perspectiva, calificación final, persistencia en MongoDB y generación de PDF (pdf-lib).

## Requisitos previos

- Node.js 18+ (recomendado LTS)
- Cluster MongoDB accesible (Atlas o local) y cadena de conexión

## Instalación

```bash
npm install
```

## Variables de entorno

Puedes partir de `.env.example` (sin secretos) y copiarlo:

```bash
copy .env.example .env.local
```

En macOS/Linux: `cp .env.example .env.local`. Luego edita `.env.local` con tu URI real.

Crea o edita el archivo `.env.local` en la raíz del proyecto:

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.example.mongodb.net
MONGODB_DB=innova_evaluaciones
```

- **MONGODB_URI**: URI del cluster o instancia MongoDB.
- **MONGODB_DB**: Nombre de la base de datos (se usará la colección `evaluations`).

En [Vercel](https://vercel.com), añade las mismas variables en **Settings → Environment Variables**.

## Desarrollo local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La raíz redirige a `/evaluaciones`.

## Producción

```bash
npm run build
npm start
```

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/evaluaciones` | Listado de evaluaciones (nombre, puesto, área, fecha, calificación final, estado) |
| `/evaluaciones/nueva` | Formulario de nueva evaluación, totales en vivo, guardar / PDF / finalizar |

### API (Route Handlers)

| Método y ruta | Descripción |
|---------------|-------------|
| `GET /api/evaluations` | Lista evaluaciones ordenadas por `createdAt` descendente |
| `POST /api/evaluations` | Crea evaluación en estado `draft` |
| `GET /api/evaluations/[id]` | Obtiene una evaluación por ID |
| `PUT /api/evaluations/[id]` | Actualiza una evaluación existente |
| `POST /api/evaluations/finalize` | Finaliza (`status: finalized`, `finalizedAt`). Cuerpo: `{ id, evaluation? }` |
| `POST /api/evaluations/pdf` | Recibe el payload de la evaluación y devuelve un `.pdf` descargable |

## Dependencias principales

- **next** — App Router, React, despliegue en Vercel
- **react** / **react-dom**
- **typescript**
- **tailwindcss** — Estilos utilitarios
- **mongodb** — Driver oficial
- **pdf-lib** — Generación de archivos PDF

## Estructura relevante

```
app/
  api/evaluations/...
  evaluaciones/
components/
lib/
types/
```

La plantilla del instrumento vive en `lib/evaluation-template.ts` para poder extenderla o conectar fuentes automáticas más adelante sin acoplar el JSX.

## Estados de evaluación

- `draft`: borrador
- `finalized`: finalizada (no se elimina el historial al limpiar el formulario en la UI)
