<?php
// Archivo para capturar y mostrar errores
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Función para capturar errores fatales
function shutdown_handler() {
    $error = error_get_last();
    if ($error && $error['type'] === E_ERROR) {
        echo "ERROR FATAL CAPTURADO:<br>";
        echo "Tipo: " . $error['type'] . "<br>";
        echo "Mensaje: " . $error['message'] . "<br>";
        echo "Archivo: " . $error['file'] . "<br>";
        echo "Línea: " . $error['line'] . "<br>";
    }
}

register_shutdown_function('shutdown_handler');

echo "Iniciando diagnóstico con captura de errores...<br>";

// Intentar incluir el config
echo "Intentando cargar config...<br>";
try {
    require_once 'config/config.php';
    echo "✅ Config cargado<br>";
} catch (Exception $e) {
    echo "❌ Error en config: " . $e->getMessage() . "<br>";
} catch (ParseError $e) {
    echo "❌ Error de sintaxis en config: " . $e->getMessage() . "<br>";
} catch (Error $e) {
    echo "❌ Error fatal en config: " . $e->getMessage() . "<br>";
}

echo "Fin del diagnóstico<br>";
?>
