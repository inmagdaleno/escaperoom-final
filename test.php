<?php
// Test básico de PHP
echo "PHP está funcionando correctamente<br>";
echo "Versión PHP: " . phpversion() . "<br>";
echo "Servidor: " . $_SERVER['SERVER_SOFTWARE'] . "<br>";

// Test de mysqli
if (extension_loaded('mysqli')) {
    echo "✅ MySQLi disponible<br>";
} else {
    echo "❌ MySQLi NO disponible<br>";
}

// Test de sesiones
if (function_exists('session_start')) {
    echo "✅ Sesiones disponibles<br>";
    session_start();
    $_SESSION['test'] = 'funcionando';
    echo "Test de sesión: " . $_SESSION['test'] . "<br>";
} else {
    echo "❌ Sesiones NO disponibles<br>";
}
?>
