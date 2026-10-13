# Rendimiento de las páginas públicas

La comparación usa la compilación de producción de Next.js 16.3.8 sobre el commit base `1e6853a`, y la compilación de esta rama. No se usó `next dev` para medir. La rama se basa en la PR de seguridad existente; no incluye sus cambios como optimizaciones nuevas.

## Cambios respaldados por hallazgos

- La portada hacía una consulta de próximo partido cuyo resultado no se usaba. Se elimina; el carrusel sigue recibiendo el calendario completo, ordenado como antes.
- Las lecturas independientes de las cuatro páginas públicas se esperaban en serie. Ahora se inician mediante `Promise.all`. Se mantienen filtros, orden, sesión de Supabase y manejo de los resultados.
- Las listas usaban `select('*')`. Se seleccionan los campos que usan las páginas y el carrusel; no se envían fechas internas de creación, biografías sin uso u otros campos innecesarios.
- Los logos pequeños usaban `fill` sin `sizes`, por lo que el navegador elegía imágenes de anchura de viewport. Se declaran tamaños coherentes con el CSS actual y tamaños separados para las fotos del roster y los jugadores destacados. No se cambian URLs, calidad, formatos, estilos, textos ni dimensiones de los contenedores.

La traza confirmó que Next.js ya deduplicaba la consulta de `team_settings` del layout y la página en cada render. No se añade otra capa de caché. Se conservan las declaraciones `revalidate`, el cliente Supabase basado en cookies y los encabezados `private, no-cache, no-store, max-age=0, must-revalidate` observados. No se modifican páginas administrativas ni las reglas de caché de contenido personalizado.

Outfit ya se sirve como WOFF2 local, con precarga y `display: swap`; no se modificó la fuente. Lighthouse señala principalmente JavaScript del runtime de Next.js como código sin uso en la carga inicial. Se mantienen los componentes cliente que requieren interactividad; no se eliminan funciones ni compatibilidad con navegadores para mejorar una puntuación.

## Método y reproducción

Herramientas: Node 24.19.0, Lighthouse 13.5.0, Chromium 154 y Playwright 1.62.1. Instalar las herramientas de medición fuera del árbol de dependencias de la aplicación:

```bash
npm install --prefix /tmp/redzone-perf-tools --no-package-lock --cache /workspace/.npm lighthouse@13.5.0 playwright@1.62.1
mkdir -p /tmp/redzone-performance /tmp/redzone-harness
cp scripts/*.mjs /tmp/redzone-harness/
```

Usar una copia limpia del repositorio y los mismos datos, máquina y configuración de red. Ejecutar primero sobre `1e6853a` y luego sobre el commit de esta PR. Los scripts se copian fuera del checkout para que también estén disponibles al medir el commit base. En cada versión:

```bash
cd /workspace/jaguares-redzone
npm ci --cache /workspace/.npm
npm run build
NODE_USE_ENV_PROXY=1 NODE_OPTIONS='--import=/tmp/redzone-harness/performance-trace.mjs' PERF_QUERY_LOG=/tmp/redzone-performance/before-queries.jsonl npm run start -- --hostname 127.0.0.1 --port 3004
```

Desde otra terminal, con el servidor listo:

```bash
node /tmp/redzone-harness/measure-performance.mjs before
PERF_QUERY_LOG=/tmp/redzone-performance/before-queries.jsonl node /tmp/redzone-harness/measure-http.mjs before
PLAYWRIGHT_MODULE=/tmp/redzone-perf-tools/node_modules/playwright/index.mjs node /tmp/redzone-harness/check-public-pages.mjs before
```

Detener únicamente ese servidor antes de cambiar la versión y recompilar. Para la segunda versión sustituir `before` por `after`, incluido el nombre del log de consultas. El uso del proxy de Node es una adaptación de este entorno, igual en ambas fases; no se guarda como cambio del runtime de la aplicación. El navegador debe estar disponible en `/usr/bin/chromium`.

Se hacen tres pasadas por ruta y perfil, 24 por fase, con perfiles de navegador nuevos. Cada ruta recibe una petición HTTP de calentamiento. Lighthouse usa simulación de red/CPU: móvil 412×823, DPR 1.75, RTT 150 ms, 1638.4 Kbps y CPU ×4; escritorio 1350×940, DPR 1, RTT 40 ms, 10240 Kbps y CPU ×1. Se informan medianas y muestras completas, sin descartar valores atípicos.

El benchmark HTTP usa diez peticiones secuenciales por ruta, tras calentamiento, y mide el tiempo hasta recibir todo el HTML, no solo TTFB. La traza precargada registra exclusivamente nombres de tablas y duración, nunca claves, cookies, cabeceras ni datos de respuesta. Ejecutar esta medición sin otra navegación concurrente para que los conteos pertenezcan a cada petición.

Las comprobaciones de navegador adicionales usan 390×844 y 1440×900. Comparan texto (excepto los números del contador que cambian con el tiempo), enlaces y dimensiones de imágenes. También permiten comprobar navegación y carrusel en el conjunto de datos disponible. Los scripts de medición y sus paquetes no forman parte del JavaScript de la aplicación.

## Limitaciones

- Las tablas eran: una identidad, siete partidos, seis posiciones y cero jugadores. Las fotos y el bloque de jugadores destacados no pueden evaluarse visualmente con ese conjunto de datos.
- Supabase respondió correctamente a las lecturas. La red externa sigue siendo una fuente de variación; las muestras de ambas versiones no son simultáneas.
- Las imágenes rasterizadas de BN Sports devolvieron 500 desde el optimizador: la conexión directa requerida por el optimizador fue rechazada (`ECONNREFUSED`). El SVG externo también falló en el navegador. El original comprobado sí respondió 200 mediante el proxy. No se desactivaron verificaciones TLS/SSRF ni se sustituyeron recursos para fabricar una puntuación.
- Los fallos de imagen ocurrieron antes y después. Los nuevos tamaños generan distintas variantes de URL: en la primera pasada móvil de inicio hubo 11 peticiones de imagen fallidas antes y 21 después. Este cambio de conjunto de peticiones fallidas limita aún más la comparación de LCP. Por ello, los resultados de LCP, bytes y puntuaciones no representan una carga visual completa. No se demuestra ahorro de bytes de imágenes ni se certifica su apariencia final. Los tamaños solicitados y la geometría sí se comprobaron.
- El HTML puede aumentar por los candidatos `srcset` adicionales. No se presenta una reducción de transferencia total que los datos no demuestren.
- Son mediciones de laboratorio en una máquina virtual, con variación entre pasadas. No hay métricas de campo ni medición de INP; TBT no equivale a INP.
- No se dispuso de una sesión administrativa para comprobar contenido personalizado; su código y reglas de caché no se cambiaron.

Las muestras numéricas completas quedan en `performance-results.json`; los informes Lighthouse y snapshots completos se entregan como artefacto separado.

## Comparación HTTP

Mediana de diez peticiones hasta recibir todo el HTML. Los encabezados de caché permanecieron iguales y cada petición siguió haciendo sus propias lecturas.

| Ruta | Antes (ms) | Después (ms) | Consultas antes → después | HTML sin comprimir antes → después (bytes) |
|---|---:|---:|---|---|
| `/` | 340.4 | 130.5 | 5 → 4 | 127728 → 146181 |
| `/calendario` | 129.6 | 107.1 | 2 → 2 | 92175 → 104543 |
| `/roster` | 125.2 | 84.3 | 2 → 2 | 28781 → 30923 |
| `/posiciones` | 139.5 | 91.2 | 2 → 2 | 54996 → 61455 |

La portada reduce un 61.7% el tiempo mediano observado y elimina una de sus cinco consultas. Las otras páginas también responden antes en este conjunto de muestras. La red externa y el orden temporal de las fases impiden atribuir toda la diferencia exclusivamente al código o extrapolar ese porcentaje a producción. El HTML aumenta por los candidatos responsivos adicionales; no se demuestra reducción global de bytes transferidos.

## Lighthouse

Medianas de tres pasadas; antes → después. Los bytes incluyen solicitudes fallidas de imágenes, por lo que no son una medida válida del peso visual final.

| Ruta / perfil | Puntuación | FCP (s) | LCP (s) | CLS | TBT (ms) | Transferencia (KiB) |
|---|---|---|---|---|---|---|
| `/` / mobile | 97 → 97 | 0.91 → 0.94 | 2.50 → 2.56 | 0.000919 → 0.000919 | 36.5 → 41.5 | 240.8 → 241.9 |
| `/` / desktop | 100 → 100 | 0.25 → 0.29 | 0.54 → 0.60 | 0.001032 → 0.001032 | 0.0 → 0.0 | 241.6 → 243.1 |
| `/calendario` / mobile | 98 → 99 | 0.77 → 0.76 | 2.29 → 2.23 | 0.000000 → 0.000000 | 45.0 → 40.0 | 234.0 → 236.4 |
| `/calendario` / desktop | 100 → 100 | 0.21 → 0.22 | 0.55 → 0.54 | 0.000000 → 0.000000 | 0.0 → 0.0 | 233.9 → 235.5 |
| `/roster` / mobile | 100 → 98 | 0.76 → 0.76 | 1.81 → 2.33 | 0.000000 → 0.000000 | 42.5 → 41.5 | 229.9 → 230.4 |
| `/roster` / desktop | 100 → 100 | 0.21 → 0.21 | 0.53 → 0.52 | 0.000000 → 0.000000 | 0.0 → 0.0 | 230.8 → 230.2 |
| `/posiciones` / mobile | 100 → 99 | 0.76 → 0.77 | 1.67 → 2.25 | 0.000000 → 0.000000 | 41.5 → 45.0 | 233.6 → 232.5 |
| `/posiciones` / desktop | 100 → 100 | 0.21 → 0.22 | 0.53 → 0.53 | 0.000000 → 0.000000 | 0.0 → 0.0 | 232.3 → 233.9 |

No hay mejora uniforme de Lighthouse/LCP. Roster y posiciones empeoran en las medianas móviles; escritorio conserva 100 puntos. La portada móvil tuvo un valor atípico de 86 puntos después (rango 86–100 frente a 97–100 antes), que se mantiene en las muestras. CLS permanece igual. Con los recursos externos incompletos y tres muestras no se demuestra una mejora general ni se descarta una regresión de carga visual en un entorno con imágenes disponibles; es necesario repetir allí.

## Comprobaciones

- Build de producción y TypeScript: aprobados.
- `npm test`: 19 pruebas aprobadas, ninguna omitida. La nueva prueba verifica arranque concurrente de lecturas, filtros/orden y conservación de campos usados.
- Lint global: cinco errores y cinco advertencias anteriores; desaparece la advertencia de `nextGame` sin uso. Las nuevas utilidades, scripts y prueba pasan ESLint.
- Ocho snapshots de página/viewport: HTTP 200, textos y enlaces iguales, dimensiones iguales y sin desbordamiento global ni errores de JavaScript. Los números del contador se normalizan porque cambian con el tiempo. Las clases CSS se compararon contra el commit base y no cambiaron.
- El navegador selecciona 48 px para el logo de navbar a 390 px/DPR 1, frente a 640 px antes. No se traduce a ahorro de bytes comprobado porque la imagen no carga.
- Navegación de calendario y controles de carrusel: comprobados sobre producción.
- Seis APIs sin sesión: 401. `/admin/dashboard` sin sesión: 307 a `/login`.
- No se aplicaron migraciones, escrituras remotas, fusiones ni despliegues.

Para regenerar las medianas tras ambas fases: `node /tmp/redzone-harness/summarize-performance.mjs`.

La transferencia mediana de JavaScript en inicio/móvil permanece prácticamente igual: 150359 → 150393 bytes. No se afirma una reducción de JavaScript.
