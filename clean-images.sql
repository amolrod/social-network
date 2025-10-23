-- Script para limpiar URLs de imágenes de la base de datos
-- Esto eliminará todas las referencias a avatar_url y cover_url

UPDATE users 
SET avatar_url = NULL, cover_url = NULL 
WHERE avatar_url IS NOT NULL OR cover_url IS NOT NULL;

-- Mostrar el resultado
SELECT COUNT(*) as usuarios_actualizados FROM users WHERE avatar_url IS NULL AND cover_url IS NULL;
