<?php
/**
 * Archivo de funciones helper para rutas y configuración
 */

// Función para obtener la ruta base del proyecto
function getBasePath() {
    return dirname(__DIR__);
}

// Función para incluir archivos de forma segura
function safeRequire($relativePath) {
    $fullPath = getBasePath() . DIRECTORY_SEPARATOR . $relativePath;
    if (file_exists($fullPath)) {
        require_once $fullPath;
        return true;
    } else {
        error_log("Archivo no encontrado: " . $fullPath);
        return false;
    }
}

// Función para obtener la URL base del proyecto
function getBaseUrl() {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'];
    $scriptPath = dirname($_SERVER['SCRIPT_NAME']);
    
    // Remover /admin, /controller, etc. del path para obtener la base
    $basePath = preg_replace('/\/(admin|controller|data).*$/', '', $scriptPath);
    
    return $protocol . $host . $basePath . '/';
}

// Función para debug en desarrollo
function debugLog($message) {
    if (defined('DB_HOST') && DB_HOST === 'localhost') {
        error_log("[ESCAPEROOM DEBUG] " . $message);
    }
}
?>
