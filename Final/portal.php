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
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Disco Cifrado</title>
  <link rel="stylesheet" href="estilos.css" />
  <link rel="preload" href="img/fondo.webp" as="image" />
  <link rel="preload" href="img/disco1.webp" as="image" />
  <link rel="preload" href="img/disco2.webp" as="image" />
  <link rel="preload" href="img/disco3.webp" as="image" />

  <style>
  @import url('https://fonts.googleapis.com/css2?family=Barriecito&family=Barrio&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
  </style>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Rock+Salt&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />

</head>
<body>
   <!-- Botones de esquina superior derecha -->
  <div class="esquina-superior-derecha">
    <div class="button-group">
      <!-- Botón Perfil -->
      <button id="btn-perfil" class="btn-icono-esquina" title="Perfil de Usuario">
        <i class="fas fa-user"></i>
      </button>
      <span class="button-label">USUARIO</span>
    </div>
    <div class="button-group">
      <!-- Botón Ranking -->
      <button id="btn-ranking" class="btn-icono-esquina" title="Ranking">
        <i class="fas fa-trophy"></i>
      </button>
      <span class="button-label">RANKING</span>
    </div>
  </div>

  <!-- Modal para Perfil de Usuario -->
  <div id="modal-perfil" class="modal modal-overlay">
    <div class="modal-contenido">
      <span class="cerrar" id="cerrar-modal-perfil">&times;</span>
      <h2>Perfil de Usuario</h2>
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
        <button type="submit" id="btn-guardar-perfil">Guardar Cambios</button>
      </form>
    </div>
  </div>

  <!-- Modal para Ranking -->
  <div id="modal-ranking" class="modal modal-overlay">
    <div class="modal-contenido">
      <span class="cerrar" id="cerrar-modal-ranking">&times;</span>
      <h2>Ranking de Jugadores</h2>
      <table id="tabla-ranking">
        <thead>
          <tr>
            <th>Puesto</th>
            <th>Jugador</th>
            <th>Puntuación</th>
          </tr>
        </thead>
        <tbody>
          <!-- Las filas del ranking se insertarán aquí con JavaScript -->
        </tbody>
      </table>
    </div>
  </div>

  <!-- Score Display -->
  <div id="score-container">Puntuación: <span id="score">400</span></div>
  <div id="timer-container" style="display: none;">Tiempo: <span id="timer">30:00</span></div>

  <!-- Botón para Volver Atrás -->

  <div class="esquina-superior-izquierda">
    <div class="button-group" id="group-ir-atras">
      <!-- Botón Atrás -->
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

   <!-- Pantalla portal -->
      <section id="escena-final" class="pantalla visible">
        <div class="contenido-portal">
          <h2>El Portal</h2>
          <p>Has llegado muy lejos ya, estás a solo un paso de escapar de esta isla maldita. Ahora necesitarás recopilar todas las claves y pistas encontradas en el camino para ponerlas en su correcto orden en el Astrolabio y conseguir las coordenadas del portal antes de que se apague el ultimo rayo sol. </p>
          <button id="btn-ir-portal">Continuar</button>
        </div>
      </section>

<section id="escena-discos" class="pantalla oculto">
  <div class="main-container">
    <div class="left-section">
      <div class="disco-container">
        <img src="img/flecha.svg" alt="Flecha" class="flecha">
        <div class="disco" id="disco3"></div>
        <div class="disco" id="disco2"></div>
        <div class="disco" id="disco1"></div>
        <div class="valor-display" id="valorDisplay">0</div>
      </div>
      <button id="obtenerCoordenadas">Obtener Coordenadas</button>
    </div>
    <div class="right-panel">
      <h1>El Astrolabio</h1>
      <p>Ahora tienes que descifrar las claves formadas por 1 numero, 1 símbolo y 1 letra, que has ido encontrando por el camino.</p>
      <p>Arrastra cada uno de los discos hasta alinearlo con la flecha en su posición correcta y encuentra la coordenada que corresponde a cada clave. ¡Pero ojo! Deberás introducirlas en el orden correcto</p>
      <div class="input-row">
        <input type="number" min="0" max="99" class="code-input" id="primero">
        <input type="number" min="0" max="99" class="code-input" id="segundo">
        <input type="number" min="0" max="99" class="code-input" id="tercero">
        <input type="number" min="0" max="99" class="code-input" id="cuarto">
        <input type="number" min="0" max="99" class="code-input" id="quinto">
        <input type="number" min="0" max="99" class="code-input" id="sexto">
      </div>
      <button id="comprobar">Comprobar</button>
      <div id="feedback-message"></div>
    </div>
  </div>
</section>

  <!-- Pantalla de Victoria -->
  <section id="victory-screen" class="pantalla oculto">
    <video id="victory-video" src="../video/portal.mp4" loop autoplay muted></video>
    <div class="victory-content">
      <h1 class="victory-message">¡Enhorabuena, has conseguido escapar de la Isla Efímera!</h1>
      <div class="victory-buttons">
        <button id="btn-play-again">Jugar otra vez</button>
        <button id="btn-exit">Salir</button>
      </div>
    </div>
  </section>

  <div id="game-over-overlay" class="oculto" style="display: none;">
    <video id="game-over-video" src="../video/isla.mp4" loop></video>
    <div class="game-over-content">
      <h1>Game Over</h1>
      <button id="btn-restart">Volver a jugar</button>
    </div>
  </div>

  <script src="funciones.js"></script>
</body>
</html>