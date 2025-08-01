<?php
// Evitar cualquier output antes de session_start
ob_start();

// Habilitar reporte de errores para diagnóstico
if (defined('ENVIRONMENT') && ENVIRONMENT === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

// Iniciar sesión primero
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

try {
    require_once __DIR__ . '/config/config.php';
    require_once __DIR__ . '/config/database.php';
} catch (Exception $e) {
    ob_end_clean();
    die('Error de configuración: ' . $e->getMessage());
}

// Verificar sesión después de cargar configuración
if (!isset($_SESSION['usuario_id'])) {
    ob_end_clean();
    header('Location: admin/login.php');
    exit;
}

// Limpiar el buffer de salida
ob_end_clean();
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Escapa de la isla efímera</title>

  <style>
  @import url('https://fonts.googleapis.com/css2?family=Barriecito&family=Barrio&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
  </style>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Rock+Salt&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />

  <link rel="stylesheet" href="css/estilos.css" />
</head>

<body>
  <!-- Botones de esquina superior derecha -->
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



  <!-- Modal para Perfil de Usuario -->
  <div id="modal-perfil" class="modal modal-overlay">
    <div class="modal-contenido">
      <span class="cerrar" id="cerrar-modal-perfil">&times;</span>
      <h2>Perfil de Usuario</h2>
      <span><?php echo htmlspecialchars($_SESSION['nombre']); ?></span>

      <form id="form-perfil">
        <div class="perfil-img-container">
          <img id="perfil-img-preview" src="img/avatar.webp" alt="Imagen de perfil">
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
        <button type="submit" id="btn-guardar-perfil" class="btn-pista-primario">Guardar Cambios</button>
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
  <div id="score-container">Puntuación: <span id="score">100</span></div>
  <div id="timer-container" style="display: none;">Tiempo: <span id="timer">30:00</span></div>



  
  <!-- Pantalla de Introducción -->
  <section id="pantalla-introduccion" class="pantalla">
    <div id="modal-introduccion" class="modal modal-overlay">
      <div class="modal-contenido">
        <span class="cerrar" id="cerrar-modal-introduccion">&times;</span>
        <h2>¡Bienvenido a la Isla Efímera!</h2> 
        <p>Has despertado en una isla que no aparece en ningún mapa y no es un error de GPS. Una isla que viaja por dimensiones desconocidas y que desaparece al caer el sol llevándose consigo a quienes no logran escapar de ella.</p> 
        <p>Tu única salida es encontrar las 6 claves encriptadas ocultadas por los Ancestros alrededor de la isla. Solo ellas te revelarán las coordenadas del portal de salida. Explora cada rincón y pon a prueba tu ingenio, papel y lápiz tampoco te vendrán mal... Cada prueba contará con pistas extras que te ayudarán a resolver los enigmas de esta isla, pero también te restarán tiempo... </p> 
        <p>¡Así que ten cuidado! los enigmas pueden ser traicioneros, el tiempo avanza y el sol desciende</p> 
        <p>¿Lograrás escapar?</p>
      </div>
    </div>
  </section>

    <!-- Pantalla de Selección de Modo de Juego -->
  <section id="pantalla-modo-juego" class="pantalla">
    <div class="contenido">
      <h2>Elige tu Aventura</h2>
      <p>¿Cómo quieres jugar?</p>
      <button id="btn-modo-puntuacion">Modo Puntuación</button>
      <button id="btn-modo-tiempo">Modo Contrarreloj</button>
    </div>
  </section>

  <!-- Pantalla de Bienvenida -->
  <section id="pantalla-bienvenida" class="pantalla">
       <div class="contenido">
          <!-- animación gsap dispersión -->
          <canvas id="canvas"></canvas>
          <h1 id="text" class="texto">La Isla Efímera</h1>
    
          <p>Despiertas en la arena húmeda de una isla paradisiaca y desconocida. No recuerdas cómo has llegado hasta allí. Te levantas desorientado, cegado por el reflejo del sol sobre el agua cristalina. En el viento se escucha un surruro que te advierte: cuando caiga el sol, la isla desaparecerá… ¡y tú con ella!</p>
          <button id="btn-comenzar">Comienza la aventura</button>
      </div>
  </section>

       <!-- Escena Playa -->
  <section id="escena-playa" class="pantalla">
    <div class="contenido">
      <h2>La Playa</h2>
      <p>Caminando por la arena encuentras una botella medio enterrada. Junto a ella un diario de navegación antiguo con la letra A y unos simbolos grabados. La última anotación realizada el 9 Abril de un año desconocido decía: "Me cuesta ordenar mis recuerdos, donde había A solo hay N". Dentro de la botella también parece haber algo escrito. </p>
      <button id="btn-ver-papel">Examina la botella</button>
    </div>

      <!-- Modal para el puzzle 1 -->
      <div id="modal1" class="modal">
        <div class="modal-contenido">
          <img id="pergamino-img" src="img/pergamino1.webp" alt="Pergamino antiguo con un mensaje cifrado">
          <div class="pergamino-container">
            <p>Hay 26 pasos en la arena pero si giras 13 todo cambia. <br> Lo que antes callaba...ahora habla</p>
            <input type="text" id="respuesta-puzzle1" placeholder="Introduce la respuesta" />
            <button id="btn-resolver-puzzle1" class="btn-resolver">Resolver</button>
            <div class="feedback"><p id="feedback-puzzle1"></p></div>
          </div>
          <button id="btn-pista-extra-modal1" class="btn-pista-extra-estilo-modal1">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
      </div>

      </div>

  <!-- Modal para Pista Extra-->
  <div id="modal-pista" class="modal-overlay oculto" style="display:none;">
    <div class="modal-contenido">
      <h2>Pista Extra</h2>
      <p id="pista-explicacion">Para este acertijo dispones de 1 pista extra. Pero su uso supondrá una penalización de 25 puntos en tu puntuación</p>
      <p id="feedback-pista" class="feedback"></p>
      <div class="modal-acciones">
        <button id="btn-confirmar-pista" class="btn-pista-primario btn-primary-gradient">Confirmar</button>
        <button id="btn-descartar-pista" class="btn-pista-secundario">Descartar</button>
      </div>
    </div>
  </div>
  </section>

    <!-- Modal imagen de la pista extra -->
<div id="modal-pista-imagen" class="modal-overlay oculto" style="display:none; z-index:3000;">
  <div class="modal-contenido">
    <h2>Pista Visual</h2>
    <img id="img-pista-extra" src="img/pista1_2.webp" alt="Pista visual">
    <div style="text-align:center;margin-top:1em;">
      <button id="btn-cerrar-pista-imagen" class="btn-pista-primario btn-primary-gradient">Cerrar</button>
    </div>
  </div>
</div>

   <!-- Pantalla Templo -->
      <section id="escena-templo" class="pantalla">
        <div class="contenido">
          <h2>El Templo</h2>
          <p>A lo lejos divisas lo que parecen ser los restos de un templo erigido sobre las rocas. ¿Será allí dónde se encuentra lo que necesitas para salir de aquí?</p>
          <p>No hay tiempo para dudar. Así que te lanzas al mar y subes por las escarpadas rocas. Recorres el templo sin encontrar nada hasta que tropiezas con un pequeño tablero de madera tallado rodeado de pequeñas piezas de madera y sobre el tablero una inscripción: "Alinea cada pieza con su ancestro"</p>
          <button id="btn-ir-sudoku">Examinar tablero</button>
        </div>
      </section>


      <!-- Pantalla Final -->
      <section id="escena-final" class="pantalla">
        <div class="contenido">
          <h1>¡Felicidades!</h1>
          <p>Has escapado de la Isla Efímera. Tu puntuación final es de <span id="score-final"></span> puntos.</p>
          <button id="btn-reiniciar">Jugar de nuevo</button>
        </div>
      </section>

  <div id="game-over-overlay" class="oculto">
    <video id="game-over-video" src="video/isla.mp4" loop></video>
    <div class="game-over-content">
      <h1>Game Over</h1>
      <button id="btn-restart">Volver a jugar</button>
    </div>
  </div>

  <script src="js/globalTimer.js"></script>
  <script src="js/funciones.js"></script>

</body>
</html>
