<?php
// Diagnóstico básico paso a paso
echo "Step 1: PHP básico funcionando<br>";

// Test 2: Información del servidor
echo "Step 2: Información del servidor<br>";
echo "PHP Version: " . phpversion() . "<br>";

// Test 3: Verificar si podemos mostrar errores
echo "Step 3: Configurando errores<br>";
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
echo "Errores configurados<br>";

// Test 4: Variables de servidor básicas
echo "Step 4: Variables básicas<br>";
if (isset($_SERVER['HTTP_HOST'])) {
    echo "HTTP_HOST: " . $_SERVER['HTTP_HOST'] . "<br>";
}
if (isset($_SERVER['DOCUMENT_ROOT'])) {
    echo "DOCUMENT_ROOT: " . $_SERVER['DOCUMENT_ROOT'] . "<br>";
}

echo "Step 5: Fin del diagnóstico básico<br>";
?>
