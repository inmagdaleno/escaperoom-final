<?php
// Test de sesión simple
ob_start();

// Forzar inicio de sesión
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

echo "<h1>Test de Sesión</h1>";

if (isset($_SESSION['usuario_id'])) {
    echo "<p>✅ Sesión activa</p>";
    echo "<p>Usuario ID: " . $_SESSION['usuario_id'] . "</p>";
    echo "<p>Nombre: " . ($_SESSION['nombre'] ?? 'No definido') . "</p>";
    echo "<p><a href='juego.php'>Ir al juego</a></p>";
} else {
    echo "<p>❌ No hay sesión activa</p>";
    echo "<p><a href='admin/login.php'>Ir al login</a></p>";
}

echo "<p><a href='debug_juego.php'>Diagnóstico completo</a></p>";

ob_end_flush();
?>
