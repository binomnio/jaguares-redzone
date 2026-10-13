# Activación de las restricciones administrativas

Las APIs de escritura, el middleware y la acción de identidad requieren un usuario verificado por Supabase Auth con `app_metadata.role = "admin"`. `user_metadata` no concede permisos. El diseño y los campos de los formularios se mantienen.

Antes de activar esta versión, asignar ese atributo a los usuarios actuales del staff mediante una herramienta administrativa de Supabase. Conservar los demás atributos existentes. Nunca exponer una clave service-role en el navegador ni permitir que el usuario edite su propio rol. Después de la asignación, los usuarios deben renovar su sesión para que el JWT utilizado por RLS contenga el rol actualizado.

Aplicar `supabase/migrations/20261013_admin_write_policies.sql` mediante el proceso habitual de migraciones, primero en una base de pruebas. La migración es transaccional y repetible; agrega políticas restrictivas de INSERT, UPDATE y DELETE para las cuatro tablas, sin cambiar lecturas públicas ni datos. Las políticas restrictivas impiden que otras políticas permisivas habiliten escrituras a usuarios autenticados sin rol admin. El script de instalación inicial `database-setup.sql` también exige el rol en sus políticas de escritura.

Comprobar con credenciales de prueba: usuario anónimo y usuario normal no pueden modificar ninguna tabla; un admin puede crear y editar partidos, jugadores, posiciones e identidad. Probar las tablas directamente mediante Supabase REST además de las APIs de Next.js. Confirmar que jornada, mapa y transmisión se conservan al crear y editar partidos, y que las consultas públicas siguen disponibles. Revisar las políticas ya desplegadas, especialmente posibles permisos de escritura para `anon`, antes de publicar. Esta PR no ejecuta migraciones ni asigna roles en la base remota.

Las validaciones admiten los dominios de imagen ya configurados y URLs HTTP/HTTPS para mapas y transmisiones. Los colores deben ser hexadecimales de seis dígitos; al leer valores antiguos inválidos se utilizan los mismos colores de respaldo existentes.
