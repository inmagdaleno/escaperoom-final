-- Script para corregir los tipos de datos de la tabla partida
-- Ejecutar este script en la base de datos para corregir los problemas de tipos de datos

USE escaperoom;

-- Corregir el tipo de dato de pistas_usadas (permitir más de 9 pistas)
ALTER TABLE partida MODIFY COLUMN pistas_usadas int(11) NOT NULL DEFAULT 0;

-- Corregir el tipo de dato de puntuacion_final (permitir puntuaciones hasta 999999)
ALTER TABLE partida MODIFY COLUMN puntuacion_final int(11) DEFAULT NULL;

-- Opcional: Verificar la estructura actualizada
-- DESCRIBE partida;
