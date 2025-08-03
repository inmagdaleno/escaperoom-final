<?php
session_start();
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
 
if (!isset($_SESSION['usuario_id'])) {
    header('Location: ../admin/login.php');
    exit;
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Puzzle</title>
  <link rel="stylesheet" href="../css/estilos.css">
  <link rel="stylesheet" href="estilos.css">
  <style>
  @import url('https://fonts.googleapis.com/css2?family=Barriecito&family=Barrio&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
  </style>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
</head>
</head>

<body>

  <!-- Score Display y Timer - Globales para ambas escenas -->
  <div id="score-container">Puntuación: <span id="score">100</span></div>
  <div id="timer-container" style="display: none;">Tiempo: <span id="timer">30:00</span></div>

  <!-- Botones de esquina superior derecha - Globales para ambas escenas -->
  <div class="esquina-superior-derecha">
    <button id="btn-perfil" class="btn-icono-esquina" title="Perfil de Usuario">
      <i class="fas fa-user"></i>
    </button>
    <button id="btn-ranking" class="btn-icono-esquina" title="Ranking">
      <i class="fas fa-trophy"></i>
    </button>
    <button id="btn-cerrar-sesion" class="btn-icono-esquina" title="Cerrar Sesión">
      <i class="fas fa-sign-out-alt"></i>
    </button>
  </div>

  <!-- Escena Jungla - Pantalla previa al mapa -->
  <section id="escena-jungla" class="pantalla visible">
    <!-- Botón de volver atrás para la escena jungla -->
    <div class="esquina-superior-izquierda">
      <div class="button-group" id="group-ir-atras-jungla">
        <button id="btn-volver-atras-jungla" class="btn-icono-esquina" title="Volver Atrás">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <span class="button-label">ATRÁS</span>
      </div>
    </div>
    
    <div class="contenido" id="contenido-jungla">
      <h2>La Jungla</h2>
      <p>Has estado vagando sin rumbo fijo cuando de pronto… algo cambia. Frente a ti se alzan unos majestuosos árboles milenarios. Su presencia impone y su silencio incomoda... pero tienes la sensación de que intentan decirte algo. Tras ellos, un camino sombrío se adentra en la espesura de la jungla. A medida que avanzas, empiezas a encontrar símbolos, números y letras tallados en la corteza con un brillo inusual. No los entiendes pero sientes que te están guiando.</p>
      <button id="ir-mapa">Adéntrate en la jungla</button>
    </div>
  </section>

  <!-- Escena Principal del Mapa -->
  <section id="escena-mapa" class="pantalla">
    
    <!-- Botones de esquina superior izquierda para navegación -->
    <div class="esquina-superior-izquierda">
      <div class="button-group" id="group-ir-atras">
        <button id="btn-volver-atras" class="btn-icono-esquina" title="Volver Atrás">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <span class="button-label">ATRÁS</span>
      </div>

      <!-- Botón para Ir Adelante -->
      <div class="button-group" id="group-ir-adelante">
        <button id="btn-ir-adelante" class="btn-icono-esquina" title="Ir Adelante">
          <i class="fa-solid fa-arrow-right"></i>
        </button>
        <span class="button-label">ADELANTE</span>
      </div>
    </div>

    <h1 id="main-title">El mapa de los Secretos</h1>
    <p id="subtitle">Reconstruye el mapa arrastrando las piezas hasta el tablero. Una vez completado, <br> importantes secretos de esta isla serán desvelados</p>

    <div class="puzzle-wrapper">
      <div id="pieces" class="pieces-container"></div>
      <div id="board" class="board-container"></div>
    </div>

  </section> <!-- Cierre de escena-mapa -->

  <!-- Modales fuera de las secciones -->
  <!-- Modal para Perfil de Usuario -->
  <div id="modal-perfil" class="modal-overlay">
    <div class="modal-contenido">
      <span class="cerrar" id="cerrar-modal-perfil">&times;</span>
      <h2>Perfil de Usuario</h2>
      
      <!-- Vista de visualización del perfil -->
      <div id="perfil-vista" class="perfil-vista">
        <div class="perfil-info-container">
          <div class="perfil-img-container">
            <img id="perfil-img-display" src="../img/avatar.webp" alt="Imagen de perfil">
          </div>
          <div class="perfil-datos">
            <div class="perfil-campo">
              <strong>Nombre:</strong>
              <span id="perfil-nombre-display">-</span>
            </div>
            <div class="perfil-campo">
              <strong>Email:</strong>
              <span id="perfil-email-display">-</span>
            </div>
          </div>
        </div>
        <div class="perfil-acciones">
          <button type="button" id="btn-editar-perfil" class="btn-pista-primario">Editar Perfil</button>
        </div>
      </div>
      
      <!-- Vista de edición del perfil -->
      <div id="perfil-edicion" class="perfil-edicion" style="display: none;">
        <form id="form-perfil">
          <div class="perfil-img-container">
            <img id="perfil-img-preview" src="../img/avatar.webp" alt="Imagen de perfil">
            <input type="file" id="input-perfil-img" accept="image/*" style="display: none;">
            <button type="button" id="btn-cambiar-img" class="btn-pista-secundario">Cambiar Imagen</button>
          </div>
          <div class="form-grupo">
            <label for="perfil-nombre">Nombre:</label>
            <input type="text" id="perfil-nombre" name="nombre" placeholder="Tu nombre">
          </div>
          <div class="form-grupo">
            <label for="perfil-email">Email:</label>
            <input type="email" id="perfil-email" name="email" placeholder="Tu correo electrónico">
          </div>
          <div class="perfil-acciones">
            <button type="submit" id="btn-guardar-perfil" class="btn-pista-primario" style="margin: 0 auto; display: block;">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal para Ranking -->
    <!-- Modal Ranking -->
    <div id="modal-ranking" class="modal-overlay">
      <div class="modal-contenido">
        <h2>Ranking de Jugadores</h2>
        <span class="cerrar">&times;</span>
        
        <div class="ranking-buttons">
          <button id="btn-puntos" class="ranking-btn active" onclick="showRanking('puntos')">Por Puntos</button>
          <button id="btn-tiempo" class="ranking-btn" onclick="showRanking('tiempo')">Por Tiempo</button>
        </div>
        
        <div id="ranking-puntos" class="ranking-table active">
          <table id="tabla-ranking-puntos">
            <thead>
              <tr>
                <th>Posición</th>
                <th>Jugador</th>
                <th>Puntuación</th>
              </tr>
            </thead>
            <tbody>
              <!-- Los datos se cargan dinámicamente -->
            </tbody>
          </table>
        </div>
        
        <div id="ranking-tiempo" class="ranking-table">
          <table id="tabla-ranking-tiempo">
            <thead>
              <tr>
                <th>Posición</th>
                <th>Jugador</th>
                <th>Tiempo</th>
              </tr>
            </thead>
            <tbody>
              <!-- Los datos se cargan dinámicamente -->
            </tbody>
          </table>
        </div>
      </div>
    </div>   <!-- Modal Mapa -->
    <div id="modal-mapa" class="modal-overlay">
        <div class="modal-content glass-effect">
            <span class="cerrar" id="cerrar-mapa">&times;</span>
            <h2>¡Enhorabuena!</h2>
            <p>Has conseguido completar el mapa y reunir las 4 claves que te faltaban. Date prisa en conseguir las coordenadas para que puedas escapar. ¡El tiempo corre en tu contra!</p>
            <img src="img/mapa.webp" alt="Mapa con pistas" class="modal-image">
            <button id="btn-continuar-mapa" class="continue-button">Continuar</button>
        </div>
    </div>

  <div id="game-over-overlay" class="oculto" style="display: none;">
    <video id="game-over-video" src="../video/isla.mp4" loop></video>
    <div class="game-over-content">
      <h1>Game Over</h1>
      <button id="btn-restart">Volver a jugar</button>
    </div>
  </div>

  <script src="../js/globalTimer.js"></script>
  <script src="funciones.js"></script>
</body>
</html>
