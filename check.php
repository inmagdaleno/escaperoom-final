<?php
/**
 * Archivo de diagnóstico para verificar el estado del servidor
 * Accede a este archivo para diagnosticar problemas: http://www.alumnainma.com/escaperoom/check.php
 */

echo "<h1>Diagnóstico del Servidor - Escape Room</h1>";

// Verificar versión de PHP
echo "<h2>Información del Sistema</h2>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";
echo "<p><strong>Server:</strong> " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p><strong>Document Root:</strong> " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
echo "<p><strong>Script Path:</strong> " . __FILE__ . "</p>";

// Verificar extensiones necesarias
echo "<h2>Extensiones PHP</h2>";
$required_extensions = ['mysqli', 'json', 'session'];
foreach ($required_extensions as $ext) {
    $status = extension_loaded($ext) ? "✅ Disponible" : "❌ No disponible";
    echo "<p><strong>$ext:</strong> $status</p>";
}

// Verificar archivos de configuración
echo "<h2>Archivos de Configuración</h2>";
$config_files = [
    'config/config.php',
    'config/database.php',
    'data/usuarioDB.php',
    'controller/usuarioController.php'
];

foreach ($config_files as $file) {
    $path = __DIR__ . '/' . $file;
    $status = file_exists($path) ? "✅ Existe" : "❌ No encontrado";
    echo "<p><strong>$file:</strong> $status</p>";
}

// Probar inclusión de config
echo "<h2>Test de Configuración</h2>";
try {
    require_once 'config/config.php';
    echo "<p>✅ Config.php cargado correctamente</p>";
    echo "<p><strong>Environment:</strong> " . (defined('ENVIRONMENT') ? ENVIRONMENT : 'No definido') . "</p>";
    echo "<p><strong>DB Host:</strong> " . (defined('DB_HOST') ? DB_HOST : 'No definido') . "</p>";
    echo "<p><strong>DB Name:</strong> " . (defined('DB_NAME') ? DB_NAME : 'No definido') . "</p>";
} catch (Exception $e) {
    echo "<p>❌ Error cargando config.php: " . $e->getMessage() . "</p>";
}

// Probar conexión a base de datos
echo "<h2>Test de Base de Datos</h2>";
try {
    require_once 'config/database.php';
    $database = new Database();
    echo "<p>✅ Conexión a base de datos exitosa</p>";
    
    // Probar consulta simple
    $conexion = $database->getConexion();
    $result = $conexion->query("SELECT COUNT(*) as count FROM usuarios");
    if ($result) {
        $row = $result->fetch_assoc();
        echo "<p>✅ Consulta de prueba exitosa. Usuarios en DB: " . $row['count'] . "</p>";
    }
    $database->close();
} catch (Exception $e) {
    echo "<p>❌ Error de base de datos: " . $e->getMessage() . "</p>";
}

// Verificar permisos de escritura
echo "<h2>Permisos</h2>";
$writable_dirs = ['.', 'config', 'data'];
foreach ($writable_dirs as $dir) {
    $status = is_writable($dir) ? "✅ Escribible" : "❌ No escribible";
    echo "<p><strong>$dir:</strong> $status</p>";
}

echo "<h2>Variables de Sesión</h2>";
session_start();
if (empty($_SESSION)) {
    echo "<p>No hay variables de sesión activas</p>";
} else {
    echo "<pre>";
    print_r($_SESSION);
    echo "</pre>";
}

echo "<h2>Variables de Servidor Relevantes</h2>";
$server_vars = ['HTTP_HOST', 'SERVER_NAME', 'REQUEST_URI', 'SCRIPT_NAME', 'DOCUMENT_ROOT'];
foreach ($server_vars as $var) {
    echo "<p><strong>$var:</strong> " . ($_SERVER[$var] ?? 'No definida') . "</p>";
}
?>
