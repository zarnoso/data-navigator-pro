
-- Solo el dueño puede LEER objetos de su carpeta dentro del bucket
CREATE POLICY "mapadata_exports_owner_read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'mapadata-exports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Inserts/updates/deletes en el bucket solo por service_role (worker)
-- (no se crean policies adicionales; sin policy => denegado para authenticated/anon)
