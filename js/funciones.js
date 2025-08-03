document.addEventListener("DOMContentLoaded", () => {
  // --- PRECARGA DE IMÁGENES PARA EVITAR GLITCHES ---
  function preloadImages() {
    const imageUrls = [
      'img/botella.webp',
      'img/playa.webp', 
      'img/templo.webp',
      'img/atardecer.webp',
      'img/jungla.webp',
      'img/pergamino1.webp',
      'img/avatar.webp'
    ];

    const imagePromises = imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(url);
        img.src = url;
      });
    });

    Promise.allSettled(imagePromises).then(results => {
      console.log('Precarga de imágenes completada');
      // Aplicar clase loaded a escenas específicas
      const escenaPlaya = document.getElementById("escena-playa");
      if (escenaPlaya) {
        escenaPlaya.classList.remove('loading');
        escenaPlaya.classList.add('loaded');
      }
    });
  }

  // Inicializar precarga de imágenes
  preloadImages();

  // --- ELEMENTOS DE LA INTERFAZ ---
  const btnComenzar = document.getElementById("btn-comenzar");
  const scoreDisplay = document.getElementById("score");
  const timerDisplay = document.getElementById("timer");
  const scoreFinalDisplay = document.getElementById("score-final");
  const btnPistaExtra = document.getElementById("btn-pista-extra");
  const btnReiniciar = document.getElementById("btn-reiniciar");

  // Pantallas
  const pantallaBienvenida = document.getElementById("pantalla-bienvenida");
  const pantallaModoJuego = document.getElementById("pantalla-modo-juego");
  const pantallaIntroduccion = document.getElementById("pantalla-introduccion");
  const escenaPlaya = document.getElementById("escena-playa");
  const escenaJungla = document.getElementById("escena-jungla");
  const escenaFinal = document.getElementById("escena-final");

  // Hacer las pantallas accesibles globalmente para la función cambiarPantalla
  window.pantallaBienvenida = pantallaBienvenida;
  window.pantallaModoJuego = pantallaModoJuego;
  window.pantallaIntroduccion = pantallaIntroduccion;
  window.escenaPlaya = escenaPlaya;
  window.escenaJungla = escenaJungla;
  window.escenaFinal = escenaFinal;

  // Modales
  const modalPista = document.getElementById("modal-pista");
  const cerrarModalPista = document.getElementById("cerrar-modal-pista");
  const pistaImg = document.getElementById("pista-img");
  const feedbackPista = document.getElementById("feedback-pista");
  const btnSegundaPista = document.getElementById("btn-segunda-pista");
  const btnCerrarPista = document.getElementById("btn-cerrar-pista");

  // Botones de selección de modo
  const btnModoPuntuacion = document.getElementById("btn-modo-puntuacion");
  const btnModoTiempo = document.getElementById("btn-modo-tiempo");

  // Ranking
  const btnRanking = document.getElementById('btn-ranking');
  const modalRanking = document.getElementById('modal-ranking');
  const cerrarModalRanking = document.getElementById('cerrar-modal-ranking');
  const tablaRankingBody = document.querySelector('#tabla-ranking tbody');

  // Perfil
  const btnPerfil = document.getElementById('btn-perfil');
  const modalPerfil = document.getElementById('modal-perfil');
  const cerrarModalPerfil = document.getElementById('cerrar-modal-perfil');

  // Cerrar Sesión
  const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
  const btnCambiarImg = document.getElementById('btn-cambiar-img');
  const inputPerfilImg = document.getElementById('input-perfil-img');
  const perfilImgPreview = document.getElementById('perfil-img-preview');

  // Estado del juego - Variables globales
  window.gameMode = ""; // 'score' o 'time'
  window.score = parseInt(localStorage.getItem('score')) || 400;
  
  // Función helper para obtener timeLeft desde el timer global
  window.getTimeLeft = function() {
    if (window.globalTimer) {
      return window.globalTimer.getTimeLeft();
    }
    return parseInt(localStorage.getItem('timeLeft')) || (30 * 60);
  };
  
  // Función helper para obtener tiempo empleado
  window.getTimeElapsed = function() {
    return (30 * 60) - window.getTimeLeft();
  };
  
  window.timerInterval;
  window.pistasUsadasPuzzle = 0; // Pistas usadas en el puzzle actual
  window.totalPistasUsadas = 0; // Pistas usadas en todo el juego
  window.puzzleActual = "";

  // --- PUZZLES Y PISTAS ---
  const puzzles = {
    puzzle1: {
      modal: document.getElementById("modal1"),
      respuesta: "trece cuadrados en zeta",
      btnVer: document.getElementById("btn-ver-papel"),
      btnResolver: document.getElementById("btn-resolver-puzzle1"),
      input: document.getElementById("respuesta-puzzle1"),
      feedback: document.getElementById("feedback-puzzle1"),
      cerrarModal: document.getElementById("cerrar-modal-puzzle1"),
      escenaSiguiente: document.getElementById("escena-templo"),
    },
    // Puedes añadir más puzzles aquí
  };

  const pistas = {
    puzzle1: ["img/pista1_1.webp", "img/pista1_2.webp"],
    puzzle2: ["img/pista1_1.webp", "img/pista1_2.webp"],
    puzzle3: ["img/pista1_1.webp", "img/pista1_2.webp"],
    puzzle4: ["img/pista1_1.webp", "img/pista1_2.webp"],
  };

  // --- INICIALIZACIÓN DEL JUEGO ---
  window.inicializarJuego = function() {
    // Limpiar localStorage al reiniciar
    localStorage.removeItem('endTime');
    localStorage.removeItem('gameStartTime'); // Limpiar tiempo de inicio
    localStorage.removeItem('totalPistasUsadas'); // Limpiar contador de pistas
    localStorage.setItem('score', 400);
    localStorage.setItem('timeLeft', 30 * 60);
    localStorage.removeItem('gameMode'); // Permitir seleccionar modo nuevamente
    
    window.score = parseInt(localStorage.getItem('score')) || 400;
    window.timeLeft = parseInt(localStorage.getItem('timeLeft')) || (30 * 60);
    window.totalPistasUsadas = 0;
    window.pistasUsadasPuzzle = 0;
    // Resetear gameMode solo si no se ha establecido ninguno
    if (!window.gameMode) {
      // Intentar recuperar de localStorage primero
      const savedGameMode = localStorage.getItem('gameMode');
      window.gameMode = savedGameMode || "";
    }
    if (scoreDisplay) scoreDisplay.textContent = window.score;
    window.updateTimerDisplay();
    clearInterval(window.timerInterval);
    localStorage.removeItem('endTime');

    // Mostrar la pantalla de introducción al inicializar
    window.cambiarPantalla(null, window.pantallaIntroduccion);
    
    // Mostrar el modal de introducción usando openOverlayModal
    const modalIntroduccion = document.getElementById("modal-introduccion");
    if (modalIntroduccion && window.openOverlayModal) {
      window.openOverlayModal(modalIntroduccion);
    }
    
    if (modalPista) modalPista.style.display = "none";
    const scoreContainer = document.getElementById("score-container");
    if (scoreContainer) scoreContainer.style.display = "none";
    const timerContainer = document.getElementById("timer-container");
    if (timerContainer) timerContainer.style.display = "none";
    if (btnPistaExtra) btnPistaExtra.style.display = "none";
    
    // Ocultar overlay de game over
    const gameOverOverlay = document.getElementById('game-over-overlay');
    if (gameOverOverlay) gameOverOverlay.classList.add('oculto');
  }

  // --- NAVEGACIÓN ENTRE PANTALLAS ---
  window.cambiarPantalla = function(pantallaOcultar, pantallaMostrar) {
    if (pantallaOcultar) {
      pantallaOcultar.classList.remove("visible");
    }
    
    if (pantallaMostrar) {
      pantallaMostrar.classList.add("visible");
    }

    const scoreContainer = document.getElementById("score-container");
    const timerContainer = document.getElementById("timer-container");
    
    // No mostrar elementos del juego en pantallas de introducción, bienvenida, modo de juego o final
    if (pantallaMostrar !== window.pantallaBienvenida && 
        pantallaMostrar !== window.pantallaModoJuego && 
        pantallaMostrar !== window.escenaFinal && 
        pantallaMostrar !== window.pantallaIntroduccion) {
      if (btnPistaExtra) btnPistaExtra.style.display = "flex";
      if (window.gameMode === 'score') {
        if (scoreContainer) scoreContainer.style.display = "block";
        if (timerContainer) timerContainer.style.display = "none";
      } else if (window.gameMode === 'time') {
        if (scoreContainer) scoreContainer.style.display = "none";
        if (timerContainer) timerContainer.style.display = "block";
      }
    } else {
      if (btnPistaExtra) btnPistaExtra.style.display = "none";
      if (scoreContainer) scoreContainer.style.display = "none";
      if (timerContainer) timerContainer.style.display = "none";
    }
  }

  // --- TEMPORIZADOR ---
  window.startTimer = function() {
    // Usar el timer global
    if (window.globalTimer) {
      if (window.globalTimer.getGameMode() === 'time') {
        // Si ya hay un timer activo, reanudarlo. Si no, crear uno nuevo
        if (!window.globalTimer.isActive()) {
          const hasExistingTimer = localStorage.getItem('endTime');
          if (hasExistingTimer) {
            window.globalTimer.resumeTimer();
          } else {
            window.globalTimer.startNewTimer();
          }
        }
      }
    }
  }

  window.updateTimerDisplay = function() {
    // Esta función ahora es manejada por el timer global
    // Mantenemos la función para compatibilidad pero el timer global maneja la actualización
  }

  window.formatTime = function(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // --- ENVIAR RESULTADOS DE LA PARTIDA ---
  window.sendGameResult = function() {
    // Calcular tiempo empleado (solo relevante para modo tiempo)
    const tiempoEmpleado = window.gameMode === 'time' ? 
      window.getTimeElapsed() : // Tiempo empleado usando helper
      0; // Para modo puntuación no es relevante
    
    const gameData = {
      id_prueba: 5, // ID de la prueba final según la base de datos
      tiempo_empleado: tiempoEmpleado,
      modo_juego: window.gameMode === 'score' ? 'puntos' : 'tiempo', // Convertir al formato esperado por PHP
      pistas_usadas: window.totalPistasUsadas,
      resultado: 1
    };
    
    if (window.gameMode === 'score') {
      gameData.puntuacion_final = window.score;
      gameData.tiempo_restante_final = null;
    } else if (window.gameMode === 'time') {
      gameData.puntuacion_final = null;
      gameData.tiempo_restante_final = window.getTimeLeft();
    }

    fetch('controller/guardarPartida.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('Partida guardada con éxito');
      } else {
        console.error('Error:', data.mensaje);
      }
    })
    .catch((error) => {
      console.error('Error de conexión con el servidor:', error);
    });
  }

  // --- GESTIÓN DE MODALES SUPERPUESTOS ---
  let activeGameModal = null;

  window.openOverlayModal = function(modal) {
    console.log('Abriendo modal:', modal ? modal.id : 'null');
    
    // Identificar modales específicos que pueden estar activos
    const modal1 = document.getElementById("modal1");
    
    if (modal === modalPista && modal1 && modal1.style.display === 'flex') {
      activeGameModal = modal1;
      modal1.style.display = 'none';
    } else {
      // Ocultar temporalmente otros modales de juego activos
      const gameModals = document.querySelectorAll('.game-modal');
      gameModals.forEach(m => {
        if (m.style.display === 'flex') {
          activeGameModal = m;
          m.style.display = 'none';
        }
      });
    }
    
    if (modal) modal.style.display = 'flex';
  }

  window.closeOverlayModal = function(modal) {
    if (modal) modal.style.display = 'none';
    // Restaurar el modal de juego si había uno activo
    if (activeGameModal) {
      activeGameModal.style.display = 'flex';
      activeGameModal = null;
    }
  }

  // --- LÓGICA DE LOS PUZZLES ---
  function setupPuzzle(puzzleKey) {
    const puzzle = puzzles[puzzleKey];
    if (!puzzle) return;

    if (puzzle.btnVer) {
      puzzle.btnVer.addEventListener("click", () => {
        window.puzzleActual = puzzleKey;
        window.pistasUsadasPuzzle = 0;
        if (puzzle.modal) puzzle.modal.style.display = "flex";
        if (puzzle.input) puzzle.input.value = "";
        if (puzzle.feedback) puzzle.feedback.style.display = "none";
      });
    }

    if (puzzle.cerrarModal) {
      puzzle.cerrarModal.addEventListener("click", () => {
        if (puzzle.modal) puzzle.modal.style.display = "none";
      });
    }

    if (puzzle.btnResolver) {
      puzzle.btnResolver.addEventListener("click", () => {
        if (puzzle.input && puzzle.input.value.trim().toLowerCase() === puzzle.respuesta) {
          if (puzzle.feedback) {
            puzzle.feedback.textContent = "¡Correcto!";
            puzzle.feedback.className = "success";
            puzzle.feedback.style.display = "block";
          }
          setTimeout(() => {
            if (puzzle.modal) puzzle.modal.style.display = "none";
            const pantallaActual = puzzle.btnVer.closest(".pantalla");
            window.cambiarPantalla(pantallaActual, puzzle.escenaSiguiente);
            if (puzzle.escenaSiguiente === window.escenaFinal) {
              window.sendGameResult();
              if (window.gameMode === 'score') {
                if (window.totalPistasUsadas === 0) {
                  window.score += 100;
                  localStorage.setItem('score', window.score); // Guardar en localStorage
                  alert("¡Felicidades! Has completado el juego sin usar pistas y ganas 100 puntos de bonus.");
                }
                if (scoreFinalDisplay) scoreFinalDisplay.textContent = window.score;
              } else if (window.gameMode === 'time') {
                clearInterval(window.timerInterval);
                if (scoreFinalDisplay) scoreFinalDisplay.textContent = window.formatTime(window.timeLeft);
              }
            }
          }, 1500);
        } else {
          if (window.gameMode === 'score') {
            window.score -= 10;
            localStorage.setItem('score', window.score); // Guardar en localStorage
            if (scoreDisplay) scoreDisplay.textContent = window.score;
            if (puzzle.feedback) puzzle.feedback.textContent = "Incorrecto, prueba de nuevo. Has perdido 10 puntos.";
          } else if (window.gameMode === 'time') {
            window.timeLeft -= 60;
            localStorage.setItem('timeLeft', window.timeLeft); // Guardar en localStorage
            
            // Actualizar el endTime para reflejar la penalización
            const newEndTime = Date.now() + (window.timeLeft * 1000);
            localStorage.setItem('endTime', newEndTime);
            
            window.updateTimerDisplay();
            if (puzzle.feedback) puzzle.feedback.textContent = "Incorrecto, prueba de nuevo. Has perdido 1 minuto.";
            if (window.timeLeft <= 0) {
              clearInterval(window.timerInterval);
              alert("¡Se te acabó el tiempo! No te ha dado tiempo a escapar de La Isla Efímera. Ahora quedarás atrapado en una dimensión desconocida hasta el fin de los días");
              window.inicializarJuego();
              return;
            }
          }
          if (puzzle.feedback) {
            puzzle.feedback.className = "error";
            puzzle.feedback.style.display = "block";
          }
        }
      });
    }
  }
  Object.keys(puzzles).forEach(setupPuzzle);

  // --- LÓGICA DE PISTAS ---
  function pedirPista() {
    if (window.pistasUsadasPuzzle < 2) {
      const pistaActualSrc = pistas[window.puzzleActual][window.pistasUsadasPuzzle];
      if (pistaImg) pistaImg.src = pistaActualSrc;
      if (modalPista) modalPista.style.display = "flex";
      
      if (window.gameMode === 'score') {
        window.score -= 25;
        localStorage.setItem('score', window.score); // Guardar en localStorage
        if (scoreDisplay) scoreDisplay.textContent = window.score;
      } else if (window.gameMode === 'time') {
        window.timeLeft -= 120; // Resta 2 minutos
        localStorage.setItem('timeLeft', window.timeLeft); // Guardar en localStorage
        
        // Actualizar el endTime para reflejar la penalización
        const newEndTime = Date.now() + (window.timeLeft * 1000);
        localStorage.setItem('endTime', newEndTime);
        
        window.updateTimerDisplay();
        if (window.timeLeft <= 0) {
          clearInterval(window.timerInterval);
          alert("¡Se acabó el tiempo! Fin del juego.");
          window.inicializarJuego();
          return;
        }
      }
      
      window.pistasUsadasPuzzle++;
      window.totalPistasUsadas++;
      if (feedbackPista) feedbackPista.textContent = "";
      if (btnSegundaPista) btnSegundaPista.style.display = window.pistasUsadasPuzzle === 1 ? "block" : "none";
    } else {
      if (feedbackPista) feedbackPista.textContent = "Ya has usado todas las pistas para este puzzle.";
      if (pistaImg) pistaImg.src = "";
      if (modalPista) modalPista.style.display = "flex";
      if (btnSegundaPista) btnSegundaPista.style.display = "none";
    }
  }

  // Event listeners para pistas
  // No agregar event listener a btnPistaExtra si estamos en la página del portal
  if (btnPistaExtra && !window.location.pathname.includes('portal.php')) {
    btnPistaExtra.addEventListener("click", () => window.openOverlayModal(modalPista));
  }
  if (btnSegundaPista) btnSegundaPista.addEventListener("click", pedirPista);
  if (btnCerrarPista) btnCerrarPista.addEventListener("click", () => window.closeOverlayModal(modalPista));
  if (cerrarModalPista) cerrarModalPista.addEventListener("click", () => window.closeOverlayModal(modalPista));

  // --- MODAL DE PISTAS EXTRAS CON CONFIRMACIÓN ---
  const btnPistaExtraModal1 = document.getElementById('btn-pista-extra-modal1');
  const pistaExplicacion = document.getElementById('pista-explicacion');
  const btnConfirmarPista = document.getElementById('btn-confirmar-pista');
  const btnDescartarPista = document.getElementById('btn-descartar-pista');
  const modalPistaImagen = document.getElementById('modal-pista-imagen');
  const btnCerrarPistaImagen = document.getElementById('btn-cerrar-pista-imagen');
  const cerrarModalPistaImagen = document.getElementById('cerrar-modal-pista-imagen');

  if (btnPistaExtraModal1 && modalPista) {
    btnPistaExtraModal1.addEventListener('click', () => {
      if (window.gameMode === 'time') {
        pistaExplicacion.textContent = 'Para este acertijo dispones de 1 pista extra. Pero su uso supondrá una penalización de 2 minutos que se descontarán a tu marcador.';
      } else {
        pistaExplicacion.textContent = 'Para este acertijo dispones de 1 pista extra. Pero su uso supondrá una penalización de 25 puntos en tu puntuación.';
      }
      modalPista.style.display = 'flex';
      modalPista.classList.remove('oculto');
      document.body.style.overflow = 'hidden';
    });
  }

  if (btnConfirmarPista) {
    btnConfirmarPista.addEventListener('click', () => {
      // Penalización según el modo de juego
      if (window.gameMode === 'time') {
        // Usar el timer global para aplicar penalización
        if (window.globalTimer) {
          window.globalTimer.applyPenalty(120); // 2 minutos
        }
      } else if (window.gameMode === 'score') {
        // Descontar 25 puntos
        window.score = Math.max(0, window.score - 25);
        localStorage.setItem('score', window.score); // Guardar en localStorage
        if (scoreDisplay) scoreDisplay.textContent = window.score;
      }
      
      const feedbackPista = document.getElementById('feedback-pista');
      if (feedbackPista) {
        if (window.gameMode === 'time') {
          feedbackPista.textContent = '¡Has usado una pista! Se han descontado 2 minutos de tu tiempo.';
        } else {
          feedbackPista.textContent = '¡Has usado una pista! Se han descontado 25 puntos de tu puntuación.';
        }
        feedbackPista.classList.remove('success', 'error');
        feedbackPista.classList.add('warning');
      }
      
      setTimeout(() => {
        if (modalPista) {
          modalPista.style.display = 'none';
          modalPista.classList.add('oculto');
          document.body.style.overflow = '';
        }
        if (feedbackPista) feedbackPista.textContent = '';
      }, 1200);
      
      if (modalPistaImagen) {
        setTimeout(() => {
          modalPistaImagen.style.display = 'flex';
          modalPistaImagen.classList.remove('oculto');
          document.body.style.overflow = 'hidden';
        }, 1200);
      }
    });
  }

  if (btnDescartarPista) {
    btnDescartarPista.addEventListener('click', () => {
      if (modalPista) {
        modalPista.style.display = 'none';
        modalPista.classList.add('oculto');
        document.body.style.overflow = '';
      }
    });
  }

  function cerrarModalImagenPista() {
    if (modalPistaImagen) {
      modalPistaImagen.style.display = 'none';
      modalPistaImagen.classList.add('oculto');
      document.body.style.overflow = '';
    }
  }

  if (btnCerrarPistaImagen) btnCerrarPistaImagen.addEventListener('click', cerrarModalImagenPista);
  if (cerrarModalPistaImagen) cerrarModalPistaImagen.addEventListener('click', cerrarModalImagenPista);
  if (modalPistaImagen) {
    modalPistaImagen.addEventListener('click', (e) => {
      if (e.target === modalPistaImagen) cerrarModalImagenPista();
    });
  }

  // --- MODAL DE RANKING ---
  function cargarRanking() {
    fetch('controller/obtenerRanking.php')
      .then(res => res.json())
      .then(data => {
        console.log('Datos del ranking:', data);
        
        // Cargar ranking por puntos
        const tbodyPuntos = document.querySelector('#tabla-ranking-puntos tbody');
        if (tbodyPuntos) {
          tbodyPuntos.innerHTML = '';
          
          if (data.success && data.ranking && data.ranking.score && data.ranking.score.length > 0) {
            data.ranking.score.forEach((jugador, i) => {
              tbodyPuntos.innerHTML += `<tr>
                <td>${i+1}</td>
                <td>${jugador.jugador}</td>
                <td>${jugador.valor} puntos</td>
              </tr>`;
            });
          } else {
            tbodyPuntos.innerHTML = '<tr><td colspan="3">No hay partidas por puntos</td></tr>';
          }
        }
        
        // Cargar ranking por tiempo
        const tbodyTiempo = document.querySelector('#tabla-ranking-tiempo tbody');
        if (tbodyTiempo) {
          tbodyTiempo.innerHTML = '';
          
          if (data.success && data.ranking && data.ranking.time && data.ranking.time.length > 0) {
            data.ranking.time.forEach((jugador, i) => {
              const minutos = Math.floor(jugador.valor / 60);
              const segundos = jugador.valor % 60;
              tbodyTiempo.innerHTML += `<tr>
                <td>${i+1}</td>
                <td>${jugador.jugador}</td>
                <td>${minutos}:${segundos.toString().padStart(2, '0')}</td>
              </tr>`;
            });
          } else {
            tbodyTiempo.innerHTML = '<tr><td colspan="3">No hay partidas por tiempo</td></tr>';
          }
        }
      })
      .catch(error => {
        console.error('Error cargando ranking:', error);
        const tbodyPuntos = document.querySelector('#tabla-ranking-puntos tbody');
        const tbodyTiempo = document.querySelector('#tabla-ranking-tiempo tbody');
        if (tbodyPuntos) tbodyPuntos.innerHTML = '<tr><td colspan="3">Error al cargar ranking</td></tr>';
        if (tbodyTiempo) tbodyTiempo.innerHTML = '<tr><td colspan="3">Error al cargar ranking</td></tr>';
      });
  }

  if (btnRanking) {
    btnRanking.addEventListener('click', () => {
      cargarRanking();
      window.openOverlayModal(modalRanking);
    });
  }
  
  if (cerrarModalRanking) {
    cerrarModalRanking.addEventListener('click', () => window.closeOverlayModal(modalRanking));
  }

  // --- MODAL DE PERFIL ---
  if (btnPerfil) {
    btnPerfil.addEventListener('click', (e) => {
      e.preventDefault();
      cargarPerfil();
      window.openOverlayModal(modalPerfil);
    });
  }
  
  if (cerrarModalPerfil) {
    cerrarModalPerfil.addEventListener('click', () => window.closeOverlayModal(modalPerfil));
  }

  // Botón editar perfil
  const btnEditarPerfil = document.getElementById('btn-editar-perfil');
  if (btnEditarPerfil) {
    btnEditarPerfil.addEventListener('click', () => {
      mostrarVistaEdicion();
    });
  }

  // Botón cancelar edición
  const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');
  if (btnCancelarEdicion) {
    btnCancelarEdicion.addEventListener('click', () => {
      mostrarVistaVisualizacion();
    });
  }

  // Formulario de perfil
  const formPerfil = document.getElementById('form-perfil');
  if (formPerfil) {
    formPerfil.addEventListener('submit', (e) => {
      e.preventDefault();
      guardarPerfil();
    });
  }

  // --- CERRAR SESIÓN ---
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
      const confirmado = confirm("¿Seguro que quieres cerrar sesión?");
      if (confirmado) {
        fetch('admin/logout.php', {
          method: 'POST'
        })
        .then(() => {
          window.location.href = 'admin/login.php';
        })
        .catch(error => {
          console.error('Error al cerrar sesión:', error);
        });
      }
    });
  }
  
  if (btnCambiarImg) {
    btnCambiarImg.addEventListener('click', () => {
      if (inputPerfilImg) inputPerfilImg.click();
    });
  }
  
  if (inputPerfilImg) {
    inputPerfilImg.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (perfilImgPreview) perfilImgPreview.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }

  // --- GAME OVER Y RESTART ---
  const btnRestart = document.getElementById('btn-restart');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      localStorage.removeItem('endTime');
      localStorage.removeItem('gameStartTime'); // Limpiar tiempo de inicio
      localStorage.removeItem('totalPistasUsadas'); // Limpiar contador de pistas
      window.location.href = '/escaperoom/juego.php';
    });
  }

  // --- NAVEGACIÓN POR HASH ---
  function mostrarPantallaSegunHash() {
    document.querySelectorAll('.pantalla').forEach(sec => sec.classList.remove('visible'));
    const hash = window.location.hash.replace('#', '');
    const seccion = document.getElementById(hash);
    
    // Limpiar las marcas de regreso (sin aplicar penalizaciones)
    const regresoDesde = localStorage.getItem('regresoDesdeModulo');
    const tiempoRegreso = localStorage.getItem('tiempoRegreso');
    
    if (regresoDesde && tiempoRegreso && (Date.now() - parseInt(tiempoRegreso)) < 5000) {
      // Solo limpiar las marcas sin aplicar penalizaciones
      localStorage.removeItem('regresoDesdeModulo');
      localStorage.removeItem('tiempoRegreso');
    }
    
    if (seccion) {
      seccion.classList.add('visible');
    } else {
      document.getElementById('pantalla-bienvenida').classList.add('visible');
    }
  }

  window.addEventListener('hashchange', mostrarPantallaSegunHash);

  // --- EVENTOS PRINCIPALES ---
  if (btnComenzar) {
    btnComenzar.addEventListener("click", () => {
      // Inicializar tiempo de inicio del juego
      if (!localStorage.getItem('gameStartTime')) {
        localStorage.setItem('gameStartTime', Date.now());
      }
      
      // Limpiar contador de pistas si es una nueva partida
      if (!localStorage.getItem('totalPistasUsadas')) {
        localStorage.setItem('totalPistasUsadas', 0);
      }
      
      // No forzar el gameMode aquí, mantener el modo seleccionado previamente
      // Solo cambiar a modo score si no se ha seleccionado ningún modo
      if (!window.gameMode) {
        window.gameMode = 'score';
        localStorage.setItem('gameMode', 'score'); // Guardar en localStorage
      }
      
      // Mostrar el contador apropiado según el modo de juego
      if (window.gameMode === 'score') {
        document.getElementById("score-container").style.display = "block";
        document.getElementById("timer-container").style.display = "none";
      } else if (window.gameMode === 'time') {
        document.getElementById("score-container").style.display = "none";
        document.getElementById("timer-container").style.display = "block";
        // Solo inicializar timer si no existe uno activo y no hay un timer guardado
        if (window.globalTimer && !window.globalTimer.isActive() && !localStorage.getItem('endTime')) {
          window.startTimer();
        }
      }
      
      window.cambiarPantalla(pantallaBienvenida, escenaPlaya);
    });
  }
  
  if (btnModoPuntuacion) {
    btnModoPuntuacion.addEventListener("click", () => {
      window.gameMode = 'score';
      localStorage.setItem('gameMode', 'score'); // Guardar en localStorage
      document.getElementById("score-container").style.display = "block";
      document.getElementById("timer-container").style.display = "none";
      window.cambiarPantalla(pantallaModoJuego, pantallaBienvenida);
    });
  }
  
  if (btnModoTiempo) {
    btnModoTiempo.addEventListener("click", () => {
      window.gameMode = 'time';
      localStorage.setItem('gameMode', 'time'); // Guardar en localStorage
      
      // Inicializar tiempo de inicio del juego si no existe
      if (!localStorage.getItem('gameStartTime')) {
        localStorage.setItem('gameStartTime', Date.now());
      }
      
      // Configurar el timer global
      if (window.globalTimer) {
        window.globalTimer.setGameMode('time');
      }
      
      document.getElementById("score-container").style.display = "none";
      document.getElementById("timer-container").style.display = "block";
      
      // Solo inicializar nuevo timer si no hay uno existente
      if (!localStorage.getItem('endTime')) {
        window.startTimer();
      }
      
      window.cambiarPantalla(pantallaModoJuego, pantallaBienvenida);
    });
  }
  
  if (btnReiniciar) {
    btnReiniciar.addEventListener("click", () => {
      window.inicializarJuego();
    });
  }

  // Navegación específica del juego
  const btnIrSudoku = document.getElementById("btn-ir-sudoku");
  if (btnIrSudoku) {
    btnIrSudoku.addEventListener("click", () => {
      window.location.href = "sudoku/sudoku.php";
    });
  }

  const btnIrJungla = document.getElementById("ir-jungla");
  if (btnIrJungla) {
    btnIrJungla.addEventListener("click", () => {
      window.location.href = "mapa/mapa.php";
    });
  }

  const btnContinuarSudoku = document.getElementById('btn-continuar-sudoku');
  if (btnContinuarSudoku) {
    btnContinuarSudoku.addEventListener('click', function() {
      window.location.href = "mapa/mapa.php";
    });
  }

  // Cerrar modales al hacer clic fuera
  window.addEventListener('click', (e) => {
    if (e.target === modalPerfil) window.closeOverlayModal(modalPerfil);
    if (e.target === modalRanking) window.closeOverlayModal(modalRanking);
    if (e.target === modalPista) window.closeOverlayModal(modalPista);
    const modalIntroduccion = document.getElementById("modal-introduccion");
    if (e.target === modalIntroduccion) window.closeOverlayModal(modalIntroduccion);
  });

  // --- MODAL DE INTRODUCCIÓN ---
  const modalIntroduccion = document.getElementById("modal-introduccion");
  const cerrarModalIntroduccion = document.getElementById("cerrar-modal-introduccion");

  if (cerrarModalIntroduccion) {
    cerrarModalIntroduccion.addEventListener("click", () => {
      if (modalIntroduccion) {
        window.closeOverlayModal(modalIntroduccion);
        window.cambiarPantalla(document.getElementById("pantalla-introduccion"), pantallaModoJuego);
      }
    });
  }

  // --- FUNCIÓN UTILITARIA PARA LIMPIAR EL TIMER ---
  window.clearGameTimer = function() {
    localStorage.removeItem('endTime');
    clearInterval(window.timerInterval);
  }

  // --- INICIALIZACIÓN AUTOMÁTICA DEL TIMER ---
  // Si existe un timer display y hay un endTime en localStorage, continuar el timer
  if (document.getElementById('timer') && localStorage.getItem('endTime')) {
    const endTime = parseInt(localStorage.getItem('endTime'), 10);
    const remainingTime = endTime - Date.now();
    
    if (remainingTime > 0) {
      window.timeLeft = Math.ceil(remainingTime / 1000);
      window.gameMode = 'time'; // Establecer modo tiempo si hay timer activo
      
      // Iniciar el timer para que continúe desde donde estaba
      window.timerInterval = setInterval(() => {
        const currentEndTime = parseInt(localStorage.getItem('endTime'), 10);
        const currentRemainingTime = currentEndTime - Date.now();
        
        if (currentRemainingTime <= 0) {
          clearInterval(window.timerInterval);
          localStorage.removeItem('endTime');
          const overlay = document.getElementById('game-over-overlay');
          const video = document.getElementById('game-over-video');
          if (overlay) overlay.classList.remove('oculto');
          if (video) video.play();
          return;
        }
        
        window.timeLeft = Math.ceil(currentRemainingTime / 1000);
        window.updateTimerDisplay();
      }, 1000);
      
      window.updateTimerDisplay();
    } else {
      // El tiempo ya expiró
      localStorage.removeItem('endTime');
    }
  }

  // Solo inicializar el juego si estamos en la página principal (juego.php)
  // y no en un módulo específico (sudoku, mapa, etc.)
  const isMainGamePage = window.location.pathname.endsWith('juego.php') || 
                        window.location.pathname.endsWith('/') ||
                        window.location.pathname.indexOf('juego.php') !== -1;
  
  if (isMainGamePage) {
    // Iniciar el juego por primera vez solo si no hay un timer activo
    if (!localStorage.getItem('endTime')) {
      window.inicializarJuego();
    } else {
      // Forzar inicialización para evitar problemas
      localStorage.removeItem('endTime');
      window.inicializarJuego();
    }
  }

  // Función para alternar entre rankings
  window.showRanking = function(tipo) {
    const btnPuntos = document.getElementById('btn-puntos');
    const btnTiempo = document.getElementById('btn-tiempo');
    const rankingPuntos = document.getElementById('ranking-puntos');
    const rankingTiempo = document.getElementById('ranking-tiempo');
    
    if (tipo === 'puntos') {
      btnPuntos.classList.add('active');
      btnTiempo.classList.remove('active');
      rankingPuntos.classList.add('active');
      rankingTiempo.classList.remove('active');
    } else {
      btnTiempo.classList.add('active');
      btnPuntos.classList.remove('active');
      rankingTiempo.classList.add('active');
      rankingPuntos.classList.remove('active');
    }
  };

  // --- FUNCIONES DE PERFIL ---
  function cargarPerfil() {
    fetch('controller/perfilController.php')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Actualizar vista de visualización
                const nombreDisplay = document.getElementById('perfil-nombre-display');
                const emailDisplay = document.getElementById('perfil-email-display');
                
                if (nombreDisplay) nombreDisplay.textContent = data.usuario.nombre || 'Sin nombre';
                if (emailDisplay) emailDisplay.textContent = data.usuario.email || 'Sin email';
                
                // Actualizar campos de edición
                const nombreInput = document.getElementById('perfil-nombre');
                const emailInput = document.getElementById('perfil-email');
                
                if (nombreInput) nombreInput.value = data.usuario.nombre || '';
                if (emailInput) emailInput.value = data.usuario.email || '';
                
                // Mostrar vista de visualización
                mostrarVistaVisualizacion();
            } else {
                console.error('Error al cargar perfil:', data.mensaje);
            }
        })
        .catch(error => {
            console.error('Error cargando perfil:', error);
        });
  }

  function guardarPerfil() {
    const nombreInput = document.getElementById('perfil-nombre');
    const emailInput = document.getElementById('perfil-email');
    
    if (!nombreInput || !emailInput) {
        alert('Error: No se encontraron los campos del formulario.');
        return;
    }
    
    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    
    if (!nombre || !email) {
        alert('Por favor, completa todos los campos.');
        return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
        alert('Por favor, ingresa un email válido.');
        return;
    }
    
    const perfilData = { nombre, email };
    
    fetch('controller/perfilController.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(perfilData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Perfil actualizado con éxito.');
            
            // Actualizar la vista de visualización con los nuevos datos
            const nombreDisplay = document.getElementById('perfil-nombre-display');
            const emailDisplay = document.getElementById('perfil-email-display');
            
            if (nombreDisplay) nombreDisplay.textContent = nombre;
            if (emailDisplay) emailDisplay.textContent = email;
            
            // Volver a la vista de visualización
            mostrarVistaVisualizacion();
        } else {
            alert('Error al actualizar perfil: ' + data.mensaje);
        }
    })
    .catch(error => {
        console.error('Error guardando perfil:', error);
        alert('Error al guardar el perfil. Inténtalo de nuevo.');
    });
  }

  function mostrarVistaVisualizacion() {
    const vistaVisualizacion = document.getElementById('perfil-vista');
    const vistaEdicion = document.getElementById('perfil-edicion');
    
    if (vistaVisualizacion) vistaVisualizacion.style.display = 'block';
    if (vistaEdicion) vistaEdicion.style.display = 'none';
  }

  function mostrarVistaEdicion() {
    const vistaVisualizacion = document.getElementById('perfil-vista');
    const vistaEdicion = document.getElementById('perfil-edicion');
    
    if (vistaVisualizacion) vistaVisualizacion.style.display = 'none';
    if (vistaEdicion) vistaEdicion.style.display = 'block';
  }

});