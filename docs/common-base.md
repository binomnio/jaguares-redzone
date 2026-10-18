# Base funcional común

Los cuatro portales usan la misma implementación de estas funciones. Las copias de `utils/games.ts`, `utils/roster.ts`, `utils/public-data.ts`, `GameForm`, `PlayerForm`, `StandingForm`, `PlayerCard`, `NextGameHero` y `HomeStandings` se mantienen idénticas. Las páginas las conectan con la identidad y los datos de cada equipo.

- TBD: el checkbox del formulario permite guardar sin fecha confirmada con el sentinel existente `2999-01-01T00:00:00.000Z`. Se reconoce también en edición, calendario, portada, lista admin y carrusel. No requiere cambiar columnas ni migrar registros. Al desmarcarlo, la fecha vuelve a ser obligatoria y se guarda con el mismo tratamiento horario anterior.
- Calendario: partidos con fecha en orden cronológico; TBD al final, por jornada con orden numérico natural (Semana 2 antes de Semana 10). No se mutan las listas recibidas.
- Carrusel: selecciona primero el siguiente partido con fecha confirmada; si no existe, uno TBD. Los TBD muestran Por Definir / TBD y no crean un contador hasta el año 2999. Conserva navegación, logos originales, animaciones, resultados, BYE, mapas y transmisión.
- Roster: dorsales en orden numérico (2 antes de 10) en portada y roster; empates conservan el orden de respaldo por apellido de la consulta. Valores sin dorsal numérico quedan al final. Diez jugadores en la vista previa y cuatro destacados. Las tarjetas usan el mismo diseño responsive y posición opcional.
- Posiciones: `HomeStandings` muestra las siete columnas existentes, resalta el equipo propio y tiene estado vacío. Las cuatro portadas leen `standings` de su propia conexión Supabase en paralelo con las otras consultas. No calcula, inventa ni copia estadísticas. Comanches incorpora este bloque visual usando su tabla ya existente.

Las imágenes mantienen sus URLs y archivos originales, sin optimizador de Next/Vercel. No cambian permisos, sesiones ni caché como parte de esta unificación. No se aplican migraciones ni se escriben datos remotos.

## Personalización

Conservar por equipo las variables de entorno de Supabase, los registros de sus tablas, archivos en public, iconos y URLs de imágenes, colores, textos de portada, metadatos en el layout público y créditos del Footer. No reutilizar credenciales o datos de otro portal. Los valores y textos personalizados existentes no se sustituyen al sincronizar la lógica común.

No hay un paquete remoto que actualice automáticamente los cuatro repositorios: las funciones están sincronizadas en esta revisión. Los cambios futuros de lógica deben trasladarse y validarse en los cuatro.

## Validación reproducible

Ejecutar npm ci con el lockfile del repositorio, npm run build, npm test y npm run lint. El build también comprueba TypeScript.

Las pruebas unitarias comprueban fechas y ordenación, ausencia de mutaciones, selección del carrusel, número de previews/destacados, validación del sentinel y renderizado de posiciones y logos.

Para comprobar la interfaz sin conectar Supabase, instalar esbuild@0.28.2 y playwright@1.62.1 fuera del repositorio (por ejemplo en /tmp/admin-mobile-tools) y disponer de Chromium en /usr/bin/chromium. Ejecutar:

```bash
node scripts/check-common-team-functions.mjs
node scripts/check-admin-mobile.mjs
```

ESBUILD_MODULE y PLAYWRIGHT_MODULE permiten elegir instalaciones externas. COMMON_UI_OUTPUT y ADMIN_MOBILE_OUTPUT eligen directorios temporales distintos para capturas y resultados. Cada script abre un servidor de fixtures solo en loopback y en un puerto libre, y lo cierra al terminar.

La batería común prueba portada, calendario, roster, posiciones vacías y alta/edición TBD a 390 y 1440 px. Hidrata el carrusel y los formularios reales; intercepta las APIs y simula router, Next Image/Link y Supabase. La batería admin prueba 11 vistas en cuatro anchos. Usan CSS de producción, Arial y logos de muestra, y no certifican Next Router, autenticación remota, fuentes/imágenes reales ni Safari/iOS. Probar guardados reales y datos propios en staging requiere configurar el Supabase correspondiente y una sesión autorizada; no introducir secretos en el código o los informes.
