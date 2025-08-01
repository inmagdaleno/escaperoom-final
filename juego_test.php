<?php
// Versión simplificada de juego.php para debugging
session_start();

echo "=== JUEGO.PHP SIMPLIFICADO ===<br>";

// Verificar sesión
if (!isset($_SESSION['usuario_id'])) {
    echo "❌ No hay sesión, redirigiendo...<br>";
    header('Location: admin/login.php');
    exit;
}

echo "✅ Sesión activa: " . $_SESSION['nombre'] . "<br>";

// Intentar cargar configuración
try {
    require_once __DIR__ . '/config/config.php';
    echo "✅ Config cargado<br>";
} catch (Exception $e) {
    echo "❌ Error config: " . $e->getMessage() . "<br>";
}

try {
    require_once __DIR__ . '/config/database.php';
    echo "✅ Database cargado<br>";
} catch (Exception $e) {
    echo "❌ Error database: " . $e->getMessage() . "<br>";
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Escapa de la isla efímera - TEST</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .pantalla { display: none; }
    .pantalla.visible { display: block; }
    .modal { display: none; }
    .btn { padding: 10px 20px; margin: 10px; cursor: pointer; }
  </style>
</head>

<body>
  <h1>JUEGO.PHP - VERSIÓN DE PRUEBA</h1>
  
  <!-- Test de elementos básicos -->
  <div class="esquina-superior-derecha">
    <p>Usuario: <?php echo htmlspecialchars($_SESSION['nombre']); ?></p>
  </div>

  <!-- Score Display -->
  <div id="score-container">Puntuación: <span id="score">100</span></div>
  <div id="timer-container" style="display: none;">Tiempo: <span id="timer">30:00</span></div>

  <!-- Pantalla de Introducción -->
  <section id="pantalla-introduccion" class="pantalla visible">
    <div id="modal-introduccion" class="modal" style="display: flex;">
      <div class="modal-contenido">
        <h2>¡Bienvenido a la Isla Efímera!</h2> 
        <p>Esta es una versión de prueba.</p>
        <button id="cerrar-modal-introduccion" class="btn">Cerrar</button>
      </div>
    </div>
  </section>

  <!-- Pantalla de Selección de Modo -->
  <section id="pantalla-modo-juego" class="pantalla">
    <div class="contenido">
      <h2>Elige tu Aventura</h2>
      <button id="btn-modo-puntuacion" class="btn">Modo Puntuación</button>
      <button id="btn-modo-tiempo" class="btn">Modo Contrarreloj</button>
    </div>
  </section>

  <!-- Pantalla de Bienvenida -->
  <section id="pantalla-bienvenida" class="pantalla">
    <div class="contenido">
      <h1>La Isla Efímera</h1>
      <p>Test de la pantalla de bienvenida</p>
      <button id="btn-comenzar" class="btn">Comienza la aventura</button>
    </div>
  </section>

  <script>
    // JavaScript simplificado para testing
    console.log("JavaScript cargado");
    
    document.addEventListener("DOMContentLoaded", () => {
      console.log("DOM cargado");
      
      // Variables de estado simplificadas
      window.gameMode = "";
      window.score = 100;
      
      // Función para cambiar pantallas
      function cambiarPantalla(ocultar, mostrar) {
        console.log("Cambiando pantalla");
        if (ocultar) ocultar.classList.remove("visible");
        if (mostrar) mostrar.classList.add("visible");
      }
      
      // Event listeners básicos
      const btnCerrarIntro = document.getElementById("cerrar-modal-introduccion");
      const btnModoPuntuacion = document.getElementById("btn-modo-puntuacion");
      const btnModoTiempo = document.getElementById("btn-modo-tiempo");
      const btnComenzar = document.getElementById("btn-comenzar");
      
      const pantallaIntro = document.getElementById("pantalla-introduccion");
      const pantallaModo = document.getElementById("pantalla-modo-juego");
      const pantallaBienvenida = document.getElementById("pantalla-bienvenida");
      const modalIntro = document.getElementById("modal-introduccion");
      
      if (btnCerrarIntro) {
        btnCerrarIntro.addEventListener("click", () => {
          console.log("Cerrando modal introducción");
          modalIntro.style.display = "none";
          cambiarPantalla(pantallaIntro, pantallaModo);
        });
      }
      
      if (btnModoPuntuacion) {
        btnModoPuntuacion.addEventListener("click", () => {
          console.log("Modo puntuación seleccionado");
          window.gameMode = 'score';
          document.getElementById("score-container").style.display = "block";
          document.getElementById("timer-container").style.display = "none";
          cambiarPantalla(pantallaModo, pantallaBienvenida);
        });
      }
      
      if (btnModoTiempo) {
        btnModoTiempo.addEventListener("click", () => {
          console.log("Modo tiempo seleccionado");
          window.gameMode = 'time';
          document.getElementById("score-container").style.display = "none";
          document.getElementById("timer-container").style.display = "block";
          cambiarPantalla(pantallaModo, pantallaBienvenida);
        });
      }
      
      if (btnComenzar) {
        btnComenzar.addEventListener("click", () => {
          console.log("Comenzar aventura");
          alert("¡Juego funcionando! Modo: " + window.gameMode);
        });
      }
      
      console.log("Event listeners configurados");
    });
  </script>

</body>
</html>
