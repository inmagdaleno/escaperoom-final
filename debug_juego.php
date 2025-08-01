<?php
// Diagnóstico específico para juego.php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

echo "=== DIAGNÓSTICO JUEGO.PHP ===<br><br>";

// Test 1: Verificar sesión
echo "1. Verificando sesión...<br>";
session_start();
if (isset($_SESSION['usuario_id'])) {
    echo "✅ Usuario logueado: ID " . $_SESSION['usuario_id'] . "<br>";
    echo "✅ Nombre: " . ($_SESSION['nombre'] ?? 'No definido') . "<br>";
} else {
    echo "❌ No hay sesión activa<br>";
}

// Test 2: Verificar archivos de configuración
echo "<br>2. Verificando archivos...<br>";
$archivos = [
    'config/config.php',
    'config/database.php', 
    'css/estilos.css',
    'js/funciones.js'
];

foreach ($archivos as $archivo) {
    if (file_exists($archivo)) {
        echo "✅ $archivo existe<br>";
    } else {
        echo "❌ $archivo NO existe<br>";
    }
}

// Test 3: Verificar que se pueden incluir los archivos
echo "<br>3. Probando inclusiones...<br>";
try {
    require_once 'config/config.php';
    echo "✅ config.php incluido<br>";
} catch (Exception $e) {
    echo "❌ Error en config.php: " . $e->getMessage() . "<br>";
}

try {
    require_once 'config/database.php';
    echo "✅ database.php incluido<br>";
} catch (Exception $e) {
    echo "❌ Error en database.php: " . $e->getMessage() . "<br>";
}

// Test 4: Verificar conexión de base de datos
echo "<br>4. Probando base de datos...<br>";
try {
    $database = new Database();
    echo "✅ Conexión DB exitosa<br>";
    $database->close();
} catch (Exception $e) {
    echo "❌ Error DB: " . $e->getMessage() . "<br>";
}

echo "<br>=== FIN DIAGNÓSTICO ===<br>";
echo "<br><a href='admin/login.php'>Volver al login</a>";
echo "<br><a href='juego.php'>Ir a juego.php</a>";
?>
