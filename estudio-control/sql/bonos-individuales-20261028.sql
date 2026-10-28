-- Esquema aplicado a producción en octubre 2026 mediante Supabase apply_migration.
-- Migration: individual_workshop_bonus_assignments_20261028
-- Replica para auditoría. El SQL ejecutado se conserva en el historial de migraciones.
-- Seguridad:
--   public.podcast_class_bonus_grants: RLS habilitado; solo owner escribe o revoca.
--   Alumnos: leen exclusivamente sus asignaciones con correo verificado y compra activa.
--   podcast_class_resources: excluye bonus_ de la lectura general de compradores.
--   class_resources_assigned_bonus_read solo publica estado ready a asignados.
--   Los recursos en draft se conservan ocultos, incluso si existe asignación.
-- Política aplicada: class_resources_paid_view contiene resource_code !~ '^bonus_' para no revelar bonos globalmente.
--   Nunca publicar claves ni usar service_role en el navegador.
-- Comprobación del estado real: consultar pg_policies, pg_class.relrowsecurity y table_privileges.
select 'class_bonus_grants_status' as diagnostic,
       c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname='podcast_class_bonus_grants';
