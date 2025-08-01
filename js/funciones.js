document.addEventListener("DOMContentLoaded", () => {
  // --- INICIALIZACIÓN DEL TIMER ---
  // Inicializa el timer solo si no existe
  if (!localStorage.getItem('endTime')) {
    const endTime = Date.now() + 30 * 60 * 1000; // 30 minutos en ms
    localStorage.setItem('endTime', endTime);
  }

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
  const pantallaFinal = document.getElementById("pantalla-final");

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
  window.score = 400;
  window.timeLeft = 30 * 60; // 30 minutos en segundos
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
    window.score = 400;
    window.timeLeft = 30 * 60;
    window.totalPistasUsadas = 0;
    window.pistasUsadasPuzzle = 0;
    if (scoreDisplay) scoreDisplay.textContent = window.score;
    window.updateTimerDisplay();
    clearInterval(window.timerInterval);
    localStorage.removeItem('endTime');

    // Mostrar la pantalla de introducción al inicializar
    window.cambiarPantalla(null, pantallaIntroduccion);
    
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
    console.log(`Cambiando pantalla de ${pantallaOcultar ? pantallaOcultar.id : 'ninguna'} a ${pantallaMostrar.id}`);
    if (pantallaOcultar) pantallaOcultar.classList.remove("visible");
    pantallaMostrar.classList.add("visible");

    const scoreContainer = document.getElementById("score-container");
    const timerContainer = document.getElementById("timer-container");
    
    // No mostrar elementos del juego en pantallas de introducción, bienvenida, modo de juego o final
    if (pantallaMostrar !== pantallaBienvenida && 
        pantallaMostrar !== pantallaModoJuego && 
        pantallaMostrar !== pantallaFinal && 
        pantallaMostrar !== pantallaIntroduccion) {
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
    clearInterval(window.timerInterval);
    const endTime = Date.now() + 30 * 60 * 1000;
    localStorage.setItem('endTime', endTime);

    window.timerInterval = setInterval(() => {
      const remainingTime = endTime - Date.now();
      if (remainingTime <= 0) {
        clearInterval(window.timerInterval);
        const overlay = document.getElementById('game-over-overlay');
        const video = document.getElementById('game-over-video');
        if (overlay) overlay.classList.remove('oculto');
        if (video) video.play();
        return;
      }
      window.timeLeft = Math.ceil(remainingTime / 1000);
      window.updateTimerDisplay();
    }, 1000);
  }

  window.updateTimerDisplay = function() {
    if (window.gameMode !== 'time') return;

    // Primero intentar actualizar el display digital del temporizador si existe
    const minTens = document.getElementById('minTens');
    const minUnits = document.getElementById('minUnits');
    const secTens = document.getElementById('secTens');
    const secUnits = document.getElementById('secUnits');

    if (minTens && minUnits && secTens && secUnits) {
      const minutes = Math.floor(window.timeLeft / 60);
      const seconds = window.timeLeft % 60;
      const minStr = String(minutes).padStart(2, '0');
      const secStr = String(seconds).padStart(2, '0');
      minTens.textContent = minStr[0];
      minUnits.textContent = minStr[1];
      secTens.textContent = secStr[0];
      secUnits.textContent = secStr[1];
    }

    // También actualizar el display básico si existe
    if (timerDisplay) timerDisplay.textContent = window.formatTime(window.timeLeft);
  }

  window.formatTime = function(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // --- ENVIAR RESULTADOS DE LA PARTIDA ---
  window.sendGameResult = function() {
    const gameData = {
      modo_juego: window.gameMode,
      pistas_usadas: window.totalPistasUsadas,
      resultado: 1
    };
    
    if (window.gameMode === 'score') {
      gameData.puntuacion_final = window.score;
      gameData.tiempo_restante_final = null;
    } else if (window.gameMode === 'time') {
      gameData.puntuacion_final = null;
      gameData.tiempo_restante_final = window.timeLeft;
    }

    fetch('/controller/guardarPartida.php', {
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
            if (puzzle.escenaSiguiente === pantallaFinal) {
              window.sendGameResult();
              if (window.gameMode === 'score') {
                if (window.totalPistasUsadas === 0) {
                  window.score += 100;
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
            if (scoreDisplay) scoreDisplay.textContent = window.score;
            if (puzzle.feedback) puzzle.feedback.textContent = "Incorrecto, prueba de nuevo. Has perdido 10 puntos.";
          } else if (window.gameMode === 'time') {
            window.timeLeft -= 60;
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
        if (scoreDisplay) scoreDisplay.textContent = window.score;
      } else if (window.gameMode === 'time') {
        window.timeLeft -= 120; // Resta 2 minutos
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
  if (btnPistaExtra) btnPistaExtra.addEventListener("click", () => window.openOverlayModal(modalPista));
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
        pistaExplicacion.textContent = 'Para este acertijo dispones de 1 pista extra. Pero su uso supondrá una penalización de 1 minuto en tu tiempo restante.';
      } else {
        pistaExplicacion.textContent = 'Para este acertijo dispones de 1 pista extra. Pero su uso supondrá una penalización de 20 puntos en tu puntuación.';
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
        window.timeLeft = Math.max(0, window.timeLeft - 60);
        window.updateTimerDisplay();
      } else if (window.gameMode === 'score') {
        window.score = Math.max(0, window.score - 20);
        if (scoreDisplay) scoreDisplay.textContent = window.score;
      }
      
      const feedbackPista = document.getElementById('feedback-pista');
      if (feedbackPista) {
        feedbackPista.textContent = '¡Has usado una pista! Se ha aplicado la penalización.';
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
    if (!tablaRankingBody) return;
    tablaRankingBody.innerHTML = '';
    
    fetch('/controller/obtenerRanking.php', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const scoreRanking = data.ranking.score || [];
        scoreRanking.forEach((item, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.jugador}</td>
            <td>${item.valor} pts</td>
          `;
          tablaRankingBody.appendChild(row);
        });
        
        if (scoreRanking.length > 0 && (data.ranking.time || []).length > 0) {
          const separatorRow = document.createElement('tr');
          separatorRow.innerHTML = `<td colspan="3" style="text-align: center; font-weight: bold; background-color: rgba(255,255,255,0.1);">--- Ranking por Tiempo ---</td>`;
          tablaRankingBody.appendChild(separatorRow);
        }
        
        const timeRanking = data.ranking.time || [];
        timeRanking.forEach((item, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.jugador}</td>
            <td>${window.formatTime(item.valor)}</td>
          `;
          tablaRankingBody.appendChild(row);
        });
      } else {
        console.error('Error al obtener ranking:', data.mensaje);
        tablaRankingBody.innerHTML = `<tr><td colspan="3">Error al cargar el ranking: ${data.mensaje}</td></tr>`;
      }
    })
    .catch(error => {
      console.error('Error en la solicitud de ranking:', error);
      tablaRankingBody.innerHTML = `<tr><td colspan="3">Error de conexión al cargar el ranking.</td></tr>`;
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
    btnPerfil.addEventListener('click', () => window.openOverlayModal(modalPerfil));
  }
  
  if (cerrarModalPerfil) {
    cerrarModalPerfil.addEventListener('click', () => window.closeOverlayModal(modalPerfil));
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
      window.location.href = '/juego.php';
    });
  }

  // --- NAVEGACIÓN POR HASH ---
  function mostrarPantallaSegunHash() {
    document.querySelectorAll('.pantalla').forEach(sec => sec.classList.remove('visible'));
    const hash = window.location.hash.replace('#', '');
    const seccion = document.getElementById(hash);
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
      console.log("Clic en 'Comenzar la aventura'");
      window.gameMode = 'score';
      document.getElementById("score-container").style.display = "block";
      document.getElementById("timer-container").style.display = "none";
      window.cambiarPantalla(pantallaBienvenida, escenaPlaya);
    });
  }
  
  if (btnModoPuntuacion) {
    btnModoPuntuacion.addEventListener("click", () => {
      console.log("Clic en 'Modo Puntuación'");
      window.gameMode = 'score';
      document.getElementById("score-container").style.display = "block";
      document.getElementById("timer-container").style.display = "none";
      window.cambiarPantalla(pantallaModoJuego, pantallaBienvenida);
    });
  }
  
  if (btnModoTiempo) {
    btnModoTiempo.addEventListener("click", () => {
      console.log("Clic en 'Modo Contrarreloj'");
      window.gameMode = 'time';
      document.getElementById("score-container").style.display = "none";
      document.getElementById("timer-container").style.display = "block";
      window.startTimer();
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

  const btnContinuarSudoku = document.getElementById('btn-continuar-sudoku');
  if (btnContinuarSudoku) {
    btnContinuarSudoku.addEventListener('click', function() {
      window.location.hash = 'escena-jungla';
      mostrarPantallaSegunHash();
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

  // Iniciar el juego por primera vez
  window.inicializarJuego();
});