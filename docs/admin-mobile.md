# Admin en móvil

El panel usa una cabecera compacta con menú desplegable por debajo de 768 px. Mantiene la barra lateral en escritorio. El menú se cierra al elegir una sección; Escape lo cierra y devuelve el foco al botón. La marca enlaza al resumen del dashboard.

El contenido utiliza padding y títulos responsivos. Los botones principales ocupan todo el ancho en teléfonos, con áreas táctiles de al menos 44 px. Los formularios reducen el padding, permiten encoger los controles y apilan los grupos de estadísticas en móvil. Las tablas conservan todos los campos en un contenedor con desplazamiento horizontal y una indicación en móvil; ese contenedor admite foco de teclado. El estado vacío de posiciones abarca sus ocho columnas.

No cambian reglas de autorización, roles, Supabase, APIs, datos ni caché.

## Validación

- Build de producción, TypeScript y las 19 pruebas existentes: aprobados.
- Chromium: 44 comprobaciones (11 vistas × 320, 390, 768 y 1440 px) sobre componentes reales con datos locales aislados. Se comprueban apertura/cierre del menú, Escape, cierre al elegir sección, visibilidad de la navegación de escritorio, ausencia de desbordamiento global y errores de hidratación/JavaScript.
- Vistas: dashboard, identidad, tres listados, tres altas y tres ediciones.
- En el servidor de producción real, sin sesión: dashboard redirige a login y las seis APIs de escritura devuelven 401.
- Lint global mantiene cinco errores y cuatro advertencias anteriores. El componente nuevo, las páginas admin y el script de comprobación pasan ESLint.

La navegación se hidrata y se prueba de forma interactiva; los formularios se renderizan para comprobar su geometría y no se envían. La prueba de interfaz usa mocks de Next Link/Image y Supabase únicamente en el proceso de pruebas. No abre un acceso admin en la aplicación. La navegación de Link se representa con historial local y se valida el cierre del menú; no equivale a probar Next Router, login o guardado con una sesión real. Se usan imágenes de muestra y Arial junto al CSS de producción para verificar geometría; no se certifican fuentes, recursos remotos ni Safari/iOS. Para comprobar los flujos completos hace falta una cuenta real con `app_metadata.role = "admin"`.

## Repetir las comprobaciones de interfaz

Con Chromium disponible en `/usr/bin/chromium`:

```bash
npm run build
npm install --prefix /tmp/admin-mobile-tools --no-package-lock --cache /workspace/.npm esbuild@0.28.2 playwright@1.62.1
node scripts/check-admin-mobile.mjs
```

Las herramientas se instalan fuera de las dependencias de la aplicación. `ESBUILD_MODULE` y `PLAYWRIGHT_MODULE` permiten usar instalaciones ya disponibles. Los archivos temporales, resultados y capturas se generan en `/tmp/admin-mobile-fixture`; `ADMIN_MOBILE_OUTPUT` permite elegir otra ubicación. El servidor de fixtures escucha solo en loopback y se cierra al terminar.
