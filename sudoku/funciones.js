const figuras = [
  { 
    id: 1, 
    nombre: "Círculo", 
    svg: '<img src="img/circulo.webp" class="svg-symbol" alt="Círculo">' 
  },
  { 
    id: 2, 
    nombre: "Líneas paralelas", 
    svg: '<img src="img/paralelas.webp" class="svg-symbol" alt="Líneas paralelas">'
  },
  { 
    id: 3, 
    nombre: "Triángulo", 
    svg: '<img src="img/triangulo.webp" class="svg-symbol" alt="Triángulo">'
  },
  { 
    id: 4, 
    nombre: "Cuadrado", 
    svg: '<img src="img/cuadrado.webp" class="svg-symbol" alt="Cuadrado">'
  },
  { 
    id: 5, 
    nombre: "Pentágono", 
    svg: '<img src="img/pentagono.webp" class="svg-symbol" alt="Pentágono">'
  },
  {
    id: 6, 
    nombre: "Hexágono", 
    svg: '<img src="img/hexagono.webp" class="svg-symbol" alt="Hexágono">'
  },
];

let history = [];
let hintedCells = []; // New array to store hinted cell coordinates

// Tablero solo con números pre-rellenados:
const initialPuzzle = [
  [null, 5, null, null, null, null],
  [2, null, null, null, null, null],
  [null, null, null, null, 1, null],
  [null, null, null, null, null, null],
  [4, null, null, null, null, 6],
  [null, null, null, null, null, 3],
];

// Solución completa del Sudoku para proporcionar pistas
const sudokuSolution = [
  [5, 6, 1, 4, 2, 3],
  [2, 3, 4, 5, 6, 1],
  [1, 2, 5, 6, 3, 4],
  [3, 4, 6, 1, 5, 2],
  [4, 5, 2, 3, 1, 6],
  [6, 1, 3, 2, 4, 5]
];

const goldenCells = [
  [0,1],
  [2,4],
  [5,5]
];

let scoreDisplay;
let timerDisplay;
let gameMode;
let score;
let timeLeft;
let timerInterval;
let isSudokuSolvedOnce = false; // Variable para controlar si el Sudoku ya se resolvió una vez
let solveButton; // Declarar solveButton globalmente
let pistasUsadasPuzzle = 0;
let totalPistasUsadas = 0;

document.addEventListener("DOMContentLoaded", () => {
  scoreDisplay = document.getElementById("score");
  timerDisplay = document.getElementById("timer");
  solveButton = document.querySelector('#btn-resolver');
  
  const groupIrAdelanteDiv = document.getElementById("group-ir-adelante");

  // Asegurar que el game-over-overlay esté oculto al iniciar
  const gameOverOverlay = document.getElementById('game-over-overlay');
  if (gameOverOverlay) {
    gameOverOverlay.classList.add('oculto');
    gameOverOverlay.style.display = 'none';
  }

  // Limpiar las marcas de regreso (sin aplicar penalizaciones)
  const regresoDesde = localStorage.getItem('regresoDesdeModulo');
  const tiempoRegreso = localStorage.getItem('tiempoRegreso');
  
  if (regresoDesde && tiempoRegreso && (Date.now() - parseInt(tiempoRegreso)) < 5000) {
    // Solo limpiar las marcas sin aplicar penalizaciones
    localStorage.removeItem('regresoDesdeModulo');
    localStorage.removeItem('tiempoRegreso');
  }

  renderBoard();
  renderDragZone();
  saveState(); // Guarda el estado inicial

  // Elementos de la interfaz
  const btnPistaExtra = document.getElementById("btn-pista-extra");
  if (groupIrAdelanteDiv) groupIrAdelanteDiv.style.display = "flex"; // Force display for development

  // Modales
  const modalPista = document.getElementById("modal-pista");
  const cerrarModalPista = document.getElementById("cerrar-modal-pista");
  const pistaExplicacion = document.getElementById("pista-explicacion");
  const feedbackPista = document.getElementById("feedback-pista");
  const btnConfirmarPista = document.getElementById("btn-confirmar-pista");
  const btnDescartarPista = document.getElementById("btn-descartar-pista");

  // Estado del juego
  gameMode = localStorage.getItem('gameMode') || 'score'; // Recupera el modo de juego
  score = parseInt(localStorage.getItem('score')) || 400; // Recuperar score de localStorage
  
  // El timeLeft ahora se maneja a través del timer global
  if (gameMode === 'time' && window.globalTimer) {
    timeLeft = window.globalTimer.getTimeLeft();
  } else {
    timeLeft = 0; // En modo puntuación no necesitamos timeLeft
  }
  
  // Inicializar variables de pistas (ya declaradas globalmente)
  pistasUsadasPuzzle = 0;
  totalPistasUsadas = parseInt(localStorage.getItem('totalPistasUsadas')) || 0;
  let puzzleActual = "sudoku"; // Siempre es el puzzle del sudoku aquí

  const puzzles = {
    sudoku: {
      modal: null,
      respuesta: "",
      btnVer: null,
      btnResolver: null,
      input: null,
      feedback: null,
      cerrarModal: null,
      escenaSiguiente: null,
    },
  };

  const pistas = {
    sudoku: [], 
  };

  // --- INICIALIZACIÓN DEL JUEGO ---
  function inicializarJuegoSudoku() {
    // Cargar estado si es necesario, por ahora solo inicializa
    if (gameMode === 'score') {
      document.getElementById("score-container").style.display = "block";
      document.getElementById("timer-container").style.display = "none";
      if (scoreDisplay) scoreDisplay.textContent = score;
    } else if (gameMode === 'time') {
      document.getElementById("score-container").style.display = "none";
      document.getElementById("timer-container").style.display = "block";
      startTimer();
    }
    if (btnPistaExtra) btnPistaExtra.style.display = "flex";
    
    // Actualizar mensaje según el modo de juego
    actualizarMensajeInstrucciones();
  }

  // --- ACTUALIZAR MENSAJE SEGÚN MODO DE JUEGO ---
  function actualizarMensajeInstrucciones() {
    const mensajeElement = document.getElementById("mensaje-instrucciones");
    if (mensajeElement) {
      let mensaje = "Arrastra las runas hasta su posición correcta en el tablero. ¡No repitas símbolos ni en filas, ni en columnas ni en cada uno de los cuadrantes marcados en rojo!<br>";
      
      if (gameMode === 'time') {
        mensaje += "Cada vez que hagas click en resolver y no sea correcta la solución se te penalizará restando 30 segundos a tu valioso tiempo.";
      } else if (gameMode === 'score') {
        mensaje += "Cada vez que hagas click en resolver y no sea correcta la solución se te penalizará restando 15 puntos de tu puntuación.";
      }
      
      mensajeElement.innerHTML = mensaje;
    }
  }

  // --- LÓGICA DE PISTAS ---
  function pedirPista() {
    if (pistasUsadasPuzzle < 2) { // Permitir hasta 2 pistas
      // Mostrar el modal de confirmación de pista
      if (modalPista) modalPista.style.display = "flex";
      if (feedbackPista) feedbackPista.textContent = ""; // Limpiar feedback anterior

      let costoPuntos = 25;
      let costoMinutos = 2;
      if (pistasUsadasPuzzle === 1) { // Segunda pista
        costoPuntos = 25;
        costoMinutos = 2;
      }

      if (pistaExplicacion) {
        let explanationText = "";
        if (gameMode === 'time') {
          explanationText = `Durante esta prueba tendrás acceso a un máximo de 2 pistas extra y en cada una de ellas te daremos 3 figuras para resolver el panel. ¡Pero no será gratis! Se restarán ${costoMinutos} minutos de tu valioso tiempo por la ${pistasUsadasPuzzle === 0 ? 'primera' : 'segunda'} pista.`;
        } else if (gameMode === 'score') {
          explanationText = `Durante esta prueba tendrás acceso a un máximo de 2 pistas extra en las cuales se incluirán en el tablero 3 figuras por pista usada, para ayudarte en la resolución del tablero. ¡Pero no será gratis! Se te restarán ${costoPuntos} puntos por la ${pistasUsadasPuzzle === 0 ? 'primera' : 'segunda'} pista.`;
        }
        pistaExplicacion.textContent = explanationText;
      }

      // Ocultar el botón de segunda pista si existe (ya no se usa directamente)
      const oldBtnSegundaPista = document.getElementById("btn-segunda-pista");
      if (oldBtnSegundaPista) oldBtnSegundaPista.style.display = "none";

      // Mostrar los botones de confirmación/descarte
      if (btnConfirmarPista) btnConfirmarPista.style.display = "block";
      if (btnDescartarPista) btnDescartarPista.style.display = "block";

    } else {
      if (feedbackPista) feedbackPista.textContent = "Ya has usado todas las pistas para este puzzle.";
      if (modalPista) modalPista.style.display = "flex";
      // Ocultar botones de confirmación si ya no hay pistas disponibles
      if (btnConfirmarPista) btnConfirmarPista.style.display = "none";
      if (btnDescartarPista) btnDescartarPista.style.display = "none";
    }
  }

  function confirmarPista() {
    // Ocultar los botones de confirmación/descarte
    if (btnConfirmarPista) btnConfirmarPista.style.display = "none";
    if (btnDescartarPista) btnDescartarPista.style.display = "none";

    // Aplicar penalización
    let penaltyScore = 25;
    let penaltyTime = 120; // 2 minutos
    if (pistasUsadasPuzzle === 1) { // Segunda pista
      penaltyScore = 25;
      penaltyTime = 120; // 2 minutos
    }

    if (gameMode === 'score') {
      score -= penaltyScore;
      localStorage.setItem('score', score); // Guardar en localStorage
      if (scoreDisplay) scoreDisplay.textContent = score;
    } else if (gameMode === 'time') {
      // Usar el timer global para aplicar la penalización
      if (window.globalTimer) {
        window.globalTimer.applyPenalty(penaltyTime);
        timeLeft = window.globalTimer.getTimeLeft(); // Actualizar timeLeft local
      }
    }

    pistasUsadasPuzzle++;
    totalPistasUsadas++;

    const currentBoard = history[history.length - 1];
    let hintsGiven = 0;
    const cellsToHint = [];

    // Encontrar celdas vacías que no sean goldenCells
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (currentBoard[r][c] === null) {
          const isGolden = goldenCells.some(([gr, gc]) => gr === r && gc === c);
          if (!isGolden) {
            cellsToHint.push({ row: r, col: c });
          }
        }
      }
    }

    // Mezclar cellsToHint para elegir celdas vacías al azar
    for (let i = cellsToHint.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cellsToHint[i], cellsToHint[j]] = [cellsToHint[j], cellsToHint[i]];
    }

    // Dar hasta 3 pistas
    let availableCellsForHint = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (currentBoard[r][c] === null) {
          const isGolden = goldenCells.some(([gr, gc]) => gr === r && gc === c);
          if (!isGolden) {
            const correctValue = sudokuSolution[r][c];
            if (isValidPlacement(currentBoard, r, c, correctValue)) {
              availableCellsForHint.push({ row: r, col: c, value: correctValue });
            }
          }
        }
      }
    }

    // Shuffle availableCellsForHint to pick random valid cells
    for (let i = availableCellsForHint.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableCellsForHint[i], availableCellsForHint[j]] = [availableCellsForHint[j], availableCellsForHint[i]];
    }

    for (let i = 0; i < Math.min(3, availableCellsForHint.length); i++) {
      const { row, col, value } = availableCellsForHint[i];
      currentBoard[row][col] = value; // Update the board state
      hintedCells.push({row, col}); // Store coordinates of the hinted cell
      hintsGiven++;
    }

    // Volver a renderizar el tablero con las nuevas pistas
    renderBoard(currentBoard);
    saveState(); // Guardar el nuevo estado con las pistas

    if (feedbackPista) {
      if (hintsGiven > 0) {
        feedbackPista.textContent = `Se han añadido ${hintsGiven} pistas al tablero.`;
      } else {
        feedbackPista.textContent = "No hay más celdas vacías para dar pistas.";
      }
    }

    // Deshabilitar el botón principal de pista si se alcanzó el máximo de pistas
    if (pistasUsadasPuzzle >= 2) {
      if (btnPistaExtra) btnPistaExtra.disabled = true;
    }

    // Cerrar el modal después de aplicar la pista (sin usar closeOverlayModal)
    setTimeout(() => {
      if (modalPista) {
        modalPista.style.display = "none";
        // NO llamar a closeOverlayModal para evitar interferencias con el timer
      }
    }, 2000); // Esperar 2 segundos para que el usuario vea el feedback
  }

  function descartarPista() {
    if (modalPista) modalPista.style.display = "none";
    // NO usar closeOverlayModal para evitar interferencias
  }

  if (btnPistaExtra) {
    btnPistaExtra.addEventListener("click", pedirPista);
  }
  if (btnConfirmarPista) {
    btnConfirmarPista.addEventListener("click", confirmarPista);
  }
  if (btnDescartarPista) {
    btnDescartarPista.addEventListener("click", descartarPista);
  }
  if (cerrarModalPista) {
    cerrarModalPista.addEventListener("click", descartarPista);
  }

  const btnVolverAtras = document.getElementById("btn-volver-atras");
  const btnIrAdelanteButton = document.getElementById("btn-ir-adelante");

  if (btnVolverAtras) {
    btnVolverAtras.addEventListener("click", () => {
      // Volver al juego principal - escena templo
      window.location.href = "/escaperoom/juego.php#escena-templo";
    });
  }

  if (btnIrAdelanteButton) {
    btnIrAdelanteButton.addEventListener("click", () => {
      // Resolver automáticamente el sudoku con animación
      completarSudokuAutomaticamente();
      
      // No necesitamos redirigir aquí ya que completarSudokuAutomaticamente
      // ahora muestra el modal de pista extra que maneja la redirección
    });
  }

  // --- LÓGICA DEL TEMPORIZADOR ---
  function startTimer() {
    // Solo iniciar timer en modo tiempo
    if (gameMode !== 'time') return;
    
    // El timer global ya debería estar funcionando, no hacer nada más
    // Solo asegurar que el display esté actualizado
    if (window.globalTimer) {
      const currentTime = window.globalTimer.getTimeLeft();
      if (currentTime > 0) {
        timeLeft = currentTime;
        updateTimerDisplay();
      }
    }
  }

  document.getElementById('btn-restart').addEventListener('click', () => {
    if (window.globalTimer) {
      window.globalTimer.clear();
    }
    window.location.href = '/escaperoom/juego.php';
  });

  function updateTimerDisplay() {
    if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // --- FUNCIÓN PARA ENVIAR RESULTADOS DE LA PARTIDA ---
  function sendGameResult() {
    const gameData = {
      modo_juego: gameMode,
      pistas_usadas: totalPistasUsadas,
      resultado: 1 // 1 para éxito, 0 para fallo
    };

    if (gameMode === 'score') {
      gameData.puntuacion_final = score;
      gameData.tiempo_restante_final = null;
    } else if (gameMode === 'time') {
      gameData.puntuacion_final = null;
      gameData.tiempo_restante_final = timeLeft;
    }
fetch('../controller/guardarPartida.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(gameData),
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    // Éxito: puedes mostrar un mensaje o pasar a la siguiente pantalla
    alert('¡Partida guardada con éxito!');
  } else {
    // Error: muestra el mensaje del backend al usuario
    alert('Error: ' + data.mensaje);
  }
})
.catch((error) => {
  alert('Error de conexión con el servidor.');
});
}

  // --- GESTIÓN DE MODALES SUPERPUESTOS ---
  let activeGameModal = null;

  function openOverlayModal(modal) {
    const gameModals = document.querySelectorAll('.modal-overlay'); // Selecciona todos los modales con esta clase
    gameModals.forEach(m => {
      if (m.style.display === 'flex') {
        activeGameModal = m;
        m.style.display = 'none';
      }
    });
    if (modal) modal.style.display = 'flex';
  }

  function closeOverlayModal(modal) {
    if (modal) modal.style.display = 'none';
    if (activeGameModal) {
      activeGameModal.style.display = 'flex';
      activeGameModal = null;
    }
  }

  // --- MODAL DE PERFIL ---
  const btnPerfil = document.getElementById('btn-perfil');
  const modalPerfil = document.getElementById('modal-perfil');
  const cerrarModalPerfil = document.getElementById('cerrar-modal-perfil');
  const btnCambiarImg = document.getElementById('btn-cambiar-img');
  const inputPerfilImg = document.getElementById('input-perfil-img');
  const perfilImgPreview = document.getElementById('perfil-img-preview');

  if (btnPerfil) {
      btnPerfil.addEventListener('click', (e) => {
        e.preventDefault();
        cargarPerfil();
        openOverlayModal(modalPerfil);
      });
  }
  if (cerrarModalPerfil) {
      cerrarModalPerfil.addEventListener('click', () => closeOverlayModal(modalPerfil));
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

  // --- MODAL DE RANKING ---

  const btnRanking = document.getElementById('btn-ranking');
  const modalRanking = document.getElementById('modal-ranking');
  const cerrarModalRanking = document.getElementById('cerrar-modal-ranking');
  const tablaRankingBody = document.querySelector('#tabla-ranking tbody');

  function cargarRanking() {
    fetch('../controller/obtenerRanking.php')
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

  function showRanking(tipo) {
    // Ocultar todas las tablas
    const tablaPuntos = document.getElementById('tabla-ranking-puntos');
    const tablaTiempo = document.getElementById('tabla-ranking-tiempo');
    
    if (tablaPuntos) tablaPuntos.style.display = 'none';
    if (tablaTiempo) tablaTiempo.style.display = 'none';
    
    // Mostrar la tabla seleccionada
    if (tipo === 'puntos' && tablaPuntos) {
      tablaPuntos.style.display = 'table';
    } else if (tipo === 'tiempo' && tablaTiempo) {
      tablaTiempo.style.display = 'table';
    }
    
    // Actualizar estado de los botones
    const botones = document.querySelectorAll('.ranking-btn');
    botones.forEach(btn => btn.classList.remove('active'));
    
    const botonActivo = document.querySelector(`.ranking-btn[onclick*="${tipo}"]`);
    if (botonActivo) {
      botonActivo.classList.add('active');
    }
  }

  if (btnRanking) {
      btnRanking.addEventListener('click', () => {
          cargarRanking();
          openOverlayModal(modalRanking);
          // Mostrar puntos por defecto y activar el botón correspondiente
          setTimeout(() => {
            showRanking('puntos');
          }, 100);
      });
  }

  // Hacer showRanking disponible globalmente
  window.showRanking = showRanking;

  if (cerrarModalRanking) {
      cerrarModalRanking.addEventListener('click', () => closeOverlayModal(modalRanking));
  }

  // --- BOTÓN CERRAR SESIÓN ---
  const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Limpiar datos del juego
        localStorage.removeItem('gameMode');
        localStorage.removeItem('score');
        localStorage.removeItem('timeLeft');
        localStorage.removeItem('endTime');
        localStorage.removeItem('gameStartTime');
        
        // Redirigir a login
        window.location.href = '../admin/login.php';
      }
    });
  }

  // Botón Salir en el modal de Game Over
  const btnExit = document.getElementById('btn-exit');
  if (btnExit) {
    btnExit.addEventListener('click', function() {
      window.location.href = '../admin/logout.php';
    });
  }

  window.addEventListener('click', (e) => {
      if (e.target === modalPerfil) closeOverlayModal(modalPerfil);
      if (e.target === modalRanking) closeOverlayModal(modalRanking);
      if (e.target === modalPista) {
        // Cierre simple para modal de pistas para evitar interferencias
        modalPista.style.display = "none";
      }
  });

  // Manejador global para soltar fuera de las celdas del sudoku
  document.body.addEventListener('dragover', (e) => {
    e.preventDefault(); // Permite el drop en el body
  });

  document.body.addEventListener('drop', (e) => {
    const source = e.dataTransfer.getData("source");
    const originalRow = e.dataTransfer.getData("originalRow");
    const originalCol = e.dataTransfer.getData("originalCol");

    // Si el arrastre viene del tablero y se suelta fuera de una celda TD
    if (source === "board" && e.target.tagName !== 'TD') {
      const originalCell = document.querySelector(`[data-row="${originalRow}"][data-col="${originalCol}"]`);
      if (originalCell) {
        originalCell.innerHTML = "";
        originalCell.dataset.value = "";
        saveState();
        loadState(history[history.length - 1]);
      }
    }
  });

  inicializarJuegoSudoku();

  // Lógica del botón Resolver/Continuar
  if (solveButton) {
    solveButton.addEventListener('click', handleSolveButton);
  }

  // Lógica del botón Continuar del modal del pergamino
  const btnAvanzarSudoku = document.getElementById('btn-avanzar-sudoku');
  if (btnAvanzarSudoku) {
    btnAvanzarSudoku.addEventListener('click', () => {
      // Redirigir a la escena de la jungla
      window.location.href = "/escaperoom/juego.php#escena-jungla"; 
    });
  }

  window.addEventListener('click', (e) => {
      if (e.target === modalPerfil) closeOverlayModal(modalPerfil);
      if (e.target === modalRanking) closeOverlayModal(modalRanking);
      if (e.target === modalPista) {
        // Cierre simple para modal de pistas para evitar interferencias
        modalPista.style.display = "none";
      }
  });
});

function renderBoard(boardState = initialPuzzle) {
  const table = document.getElementById("sudoku");
  table.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    let row = document.createElement("tr");
    for (let j = 0; j < 6; j++) {
      let cell = document.createElement("td");
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.ondragover = (e) => e.preventDefault();
      cell.ondrop = dropHandler;

      // Marcar celdas doradas sin aplicar estilo visual hasta resolver
      if (goldenCells.some(([r,c]) => r === i && c === j)) {
        cell.classList.add("golden-cell"); // Clase para identificar, sin estilo visual
      }

      // Añadir clase para celdas con pistas
      if (hintedCells.some(hc => hc.row === i && hc.col === j)) {
        cell.classList.add("hinted-cell");
      }

      const val = boardState[i][j];
      if (val !== null) {
        if (isFigure(+val)) {
          let svg = figuras.find(f => f.id == val).svg;
          cell.innerHTML = svg;
        } else {
          cell.textContent = val;
        }
        cell.dataset.value = val;
        
        // Las celdas iniciales del puzzle y las celdas con pistas no deben ser arrastrables
        const isInitialPuzzleCell = initialPuzzle[i][j] !== null;
        const isHintedCell = hintedCells.some(hc => hc.row === i && hc.col === j);

        if (!isInitialPuzzleCell && !isHintedCell) {
          cell.draggable = true;
          cell.ondragstart = dragHandler;
          cell.dataset.originalRow = i; 
          cell.dataset.originalCol = j; 
        } else {
          cell.draggable = false; 
          cell.ondragstart = null; 
        }
      }
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

function renderDragZone() {
  const zone = document.getElementById("dragZone");
  zone.innerHTML = "";

  figuras.forEach(f => {
    let div = document.createElement("div");
    div.classList.add("draggable");
    div.innerHTML = f.svg;
    if (f.id === 2) {
      div.style.width = "72px";
      div.style.height = "72px";
      div.querySelector('.svg-symbol').style.width = "72px";
      div.querySelector('.svg-symbol').style.height = "72px";
    }
    div.draggable = true;
    div.dataset.value = f.id;
    div.ondragstart = dragHandler;
    zone.appendChild(div);
  });
  }

function dragHandler(e) {
  e.dataTransfer.setData("value", e.currentTarget.dataset.value);
  // Comprobar si el arrastre se originó en una celda del tablero
  if (e.currentTarget.dataset.originalRow && e.currentTarget.dataset.originalCol) {
    e.dataTransfer.setData("source", "board");
    e.dataTransfer.setData("originalRow", e.currentTarget.dataset.originalRow);
    e.dataTransfer.setData("originalCol", e.currentTarget.dataset.originalCol);
  } else {
    e.dataTransfer.setData("source", "dragZone");
  }
  playSound("audioClick");
}

function dropHandler(e) {
  e.preventDefault();
  const value = e.dataTransfer.getData("value");
  const source = e.dataTransfer.getData("source");
  const originalRow = e.dataTransfer.getData("originalRow");
  const originalCol = e.dataTransfer.getData("originalCol");

  // Limpiar la celda de destino antes de colocar el nuevo valor
  e.target.innerHTML = "";
  e.target.dataset.value = "";

  if (isFigure(+value)) {
    let svg = figuras.find(f => f.id == value).svg;
    e.target.innerHTML = svg;
  }
  e.target.dataset.value = value;

  // Si el origen fue del tablero, limpiar la celda original
  if (source === "board") {
    const originalCell = document.querySelector(`[data-row="${originalRow}"][data-col="${originalCol}"]`);
    if (originalCell) {
      originalCell.innerHTML = "";
      originalCell.dataset.value = "";
    }
  }
  saveState(); // Guarda el estado después de cada movimiento
  loadState(history[history.length - 1]); // Recarga el tablero desde el último estado
}



function saveState() {
  const table = document.getElementById("sudoku");
  let currentState = [];
  for (let i = 0; i < 6; i++) {
    let row = [];
    for (let j = 0; j < 6; j++) {
      row.push(table.rows[i].cells[j].dataset.value || null);
    }
    currentState.push(row);
  }
  history.push(currentState);
}

function loadState(state) {
  renderBoard(state);
}

function deshacer() {
  if (history.length > 1) {
    history.pop(); // Elimina el estado actual
    loadState(history[history.length - 1]); // Carga el estado anterior
  }
}

function limpiar() {
  history = []; // Limpia el historial
  renderBoard(initialPuzzle); // Renderiza el tablero inicial vacío
  saveState(); // Guarda el estado inicial limpio
}


function isFigure(val) {
  return figuras.some(f => f.id === val);
}

function isValidPlacement(board, row, col, value) {
  // Convertir value a string para comparación consistente
  value = value.toString();
  
  // Verificar fila - no debe haber el mismo valor en la fila
  for (let c = 0; c < 6; c++) {
    if (c !== col && board[row][c] && board[row][c].toString() === value) {
      return false;
    }
  }

  // Verificar columna - no debe haber el mismo valor en la columna
  for (let r = 0; r < 6; r++) {
    if (r !== row && board[r][col] && board[r][col].toString() === value) {
      return false;
    }
  }

  // Verificar subcuadrícula 2x3 - no debe haber el mismo valor en el bloque
  const startRow = Math.floor(row / 2) * 2;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const checkRow = startRow + r;
      const checkCol = startCol + c;
      if ((checkRow !== row || checkCol !== col) && 
          board[checkRow][checkCol] && 
          board[checkRow][checkCol].toString() === value) {
        return false;
      }
    }
  }

  return true;
}

function isSudokuSolved() {
  const table = document.getElementById("sudoku");
  
  // Verificar que todas las celdas estén llenas
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      const cellValue = table.rows[i].cells[j].dataset.value;
      if (!cellValue || cellValue === "") {
        return false; // Hay celdas vacías
      }
    }
  }

  // Verificar filas - cada fila debe tener valores únicos del 1 al 6
  for (let i = 0; i < 6; i++) {
    let rowValues = new Set();
    for (let j = 0; j < 6; j++) {
      let cellValue = table.rows[i].cells[j].dataset.value;
      if (!cellValue || rowValues.has(cellValue)) {
        return false;
      }
      rowValues.add(cellValue);
    }
    // Verificar que tenga exactamente los 6 valores únicos
    if (rowValues.size !== 6) {
      return false;
    }
  }

  // Verificar columnas - cada columna debe tener valores únicos del 1 al 6
  for (let j = 0; j < 6; j++) {
    let colValues = new Set();
    for (let i = 0; i < 6; i++) {
      let cellValue = table.rows[i].cells[j].dataset.value;
      if (!cellValue || colValues.has(cellValue)) {
        return false;
      }
      colValues.add(cellValue);
    }
    // Verificar que tenga exactamente los 6 valores únicos
    if (colValues.size !== 6) {
      return false;
    }
  }

  // Verificar subcuadrículas 2x3 - cada subcuadrícula debe tener valores únicos del 1 al 6
  for (let blockRow = 0; blockRow < 6; blockRow += 2) {
    for (let blockCol = 0; blockCol < 6; blockCol += 3) {
      let blockValues = new Set();
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 3; j++) {
          let cellValue = table.rows[blockRow + i].cells[blockCol + j].dataset.value;
          if (!cellValue || blockValues.has(cellValue)) {
            return false;
          }
          blockValues.add(cellValue);
        }
      }
      // Verificar que tenga exactamente los 6 valores únicos
      if (blockValues.size !== 6) {
        return false;
      }
    }
  }

  return true; // Todo está correcto
}

function verificar() {
  const table = document.getElementById("sudoku");
  let correct = true;

  // Limpiar errores previos
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      table.rows[i].cells[j].classList.remove("error");
    }
  }

  // Verificar que todas las celdas estén llenas
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      let cell = table.rows[i].cells[j];
      let v = cell.dataset.value;
      if (!v || v === "") {
        correct = false;
        cell.classList.add("error");
      }
    }
  }

  // Verificar filas - no debe haber duplicados
  for (let i = 0; i < 6; i++) {
    let fila = [];
    let cellsInRow = [];
    for (let j = 0; j < 6; j++) {
      let cell = table.rows[i].cells[j];
      let v = cell.dataset.value;
      cellsInRow.push(cell);
      if (v && v !== "") {
        if (fila.includes(v)) {
          correct = false;
          // Marcar todas las celdas con valor duplicado en esta fila
          cellsInRow.forEach(c => {
            if (c.dataset.value === v) {
              c.classList.add("error");
            }
          });
        } else {
          fila.push(v);
        }
      }
    }
  }

  // Verificar columnas - no debe haber duplicados
  for (let j = 0; j < 6; j++) {
    let col = [];
    let cellsInCol = [];
    for (let i = 0; i < 6; i++) {
      let cell = table.rows[i].cells[j];
      let v = cell.dataset.value;
      cellsInCol.push(cell);
      if (v && v !== "") {
        if (col.includes(v)) {
          correct = false;
          // Marcar todas las celdas con valor duplicado en esta columna
          cellsInCol.forEach(c => {
            if (c.dataset.value === v) {
              c.classList.add("error");
            }
          });
        } else {
          col.push(v);
        }
      }
    }
  }

  // Verificar subcuadrículas 2x3 - no debe haber duplicados
  for (let blockRow = 0; blockRow < 6; blockRow += 2) {
    for (let blockCol = 0; blockCol < 6; blockCol += 3) {
      let block = [];
      let cellsInBlock = [];
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 3; j++) {
          let cell = table.rows[blockRow + i].cells[blockCol + j];
          let v = cell.dataset.value;
          cellsInBlock.push(cell);
          if (v && v !== "") {
            if (block.includes(v)) {
              correct = false;
              // Marcar todas las celdas con valor duplicado en este bloque
              cellsInBlock.forEach(c => {
                if (c.dataset.value === v) {
                  c.classList.add("error");
                }
              });
            } else {
              block.push(v);
            }
          }
        }
      }
    }
  }

  return correct;
}

function obtenerCodigo() {
  const table = document.getElementById("sudoku");
  let code = "";
  for (let [r,c] of goldenCells) {
    let cell = table.rows[r].cells[c];
    code += cell.dataset.value;
  }
  return code;
}

function handleSolveButton() {
  const resultadoDiv = document.getElementById("resultado");
  const table = document.getElementById("sudoku");
  const modalPergaminoSudoku = document.getElementById('modal-pergamino-sudoku');

  if (solveButton.textContent === "Resolver") {
    if (isSudokuSolved()) {
      document.getElementById("resultado").innerHTML =
        "¡Puzzle resuelto!";
      table.classList.add("success");
      playSound("audioSuccess");
      iniciarResolucion(); // Aplica el estado resuelto a las celdas doradas
      sendGameResult(); // Enviar resultado al resolver el Sudoku
      solveButton.textContent = "Continuar";
      isSudokuSolvedOnce = true; // Marcar que el Sudoku ha sido resuelto
    } else {
      resultadoDiv.textContent = "Hay errores. Revisa filas, columnas y cuadrantes.";
      playSound("audioError");
      if (gameMode === 'score') {
        score -= 15; // Cambiar de 10 a 15 puntos
        localStorage.setItem('score', score); // Guardar en localStorage
        if (scoreDisplay) scoreDisplay.textContent = score;
      } else if (gameMode === 'time') {
        // Usar el timer global para aplicar penalización por respuesta incorrecta
        if (window.globalTimer) {
          // Verificar que hay tiempo suficiente antes de aplicar penalización
          const currentTime = window.globalTimer.getTimeLeft();
          if (currentTime > 30) { // Solo aplicar penalización si hay más de 30 segundos
            window.globalTimer.applyPenalty(30); // Reducir penalización a 30 segundos
          }
          timeLeft = window.globalTimer.getTimeLeft(); // Actualizar timeLeft local
        }
      }
    }
  } else if (solveButton.textContent === "Continuar") {
    // Mostrar el modal de pista extra del sudoku después de un breve delay
    setTimeout(() => {
      mostrarModalPistaExtraSudoku();
    }, 500); // Pequeño delay para que se vea la transición
  }
}

function iniciarResolucion() {
  if (verificar()) { // Solo si el tablero es correcto
    animarGoldCells();
  } else {
    // Opcional: muestra un mensaje de error
    mostrarMensaje('El tablero no está resuelto correctamente.');
  }
}

function animarGoldCells() {
  const table = document.getElementById("sudoku");
  
  // Aplicar la animación de brillo dorado a las celdas golden
  goldenCells.forEach(([row, col]) => {
    const cell = table.rows[row].cells[col];
    if (cell) {
      cell.classList.remove("golden-cell"); // Remover clase de marcador
      cell.classList.add("solved-gold"); // Agregar nueva clase con animación dorada
    }
  });
  
  // Reproducir sonido de éxito
  playSound("audioSuccess");
}

function mostrarMensaje(mensaje) {
  const resultadoDiv = document.getElementById("resultado");
  if (resultadoDiv) {
    resultadoDiv.textContent = mensaje;
    resultadoDiv.style.display = "block";
  }
}

function playSound(id) {
  let audio = document.getElementById(id);
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
}

// Función para completar automáticamente el sudoku con animación
function completarSudokuAutomaticamente() {
  const table = document.getElementById("sudoku");
  
  // Llenar el tablero con la solución completa
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const cell = table.rows[row].cells[col];
      if (cell && !cell.classList.contains('initial-cell')) {
        // Solo llenar las celdas que no son iniciales
        const figura = figuras.find(f => f.id === sudokuSolution[row][col]);
        if (figura) {
          cell.innerHTML = figura.svg;
          cell.dataset.value = figura.id;
          
          // Agregar una pequeña animación de aparición
          cell.style.opacity = '0';
          cell.style.transform = 'scale(0.8)';
          setTimeout(() => {
            cell.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            cell.style.opacity = '1';
            cell.style.transform = 'scale(1)';
          }, (row * 6 + col) * 50); // Delay progresivo
        }
      }
    }
  }
  
  // Después de completar el tablero, iniciar la animación dorada
  setTimeout(() => {
    mostrarMensaje("¡Puzzle resuelto automáticamente!");
    iniciarResolucion(); // Aplica el estado resuelto a las celdas doradas
    isSudokuSolvedOnce = true; // Marcar que el Sudoku ha sido resuelto
    
    // Mostrar el modal de pista extra después de la animación
    setTimeout(() => {
      mostrarModalPistaExtraSudoku();
    }, 1000); // Esperar 1 segundo más después de la animación dorada
  }, 1500); // Esperar a que termine la animación de llenado
}

// Función para mostrar el modal de pista extra del sudoku
function mostrarModalPistaExtraSudoku() {
  // Mostrar la pantalla con fondo tropical
  const pantallaTropical = document.getElementById('pantalla-pista-extra-sudoku');
  if (pantallaTropical) {
    pantallaTropical.style.display = 'flex';
    pantallaTropical.classList.remove('oculto');
  }
  
  // Obtener el botón de continuar y limpiar listeners anteriores
  const btnContinuar = document.getElementById('btn-continuar-sudoku');
  if (btnContinuar) {
    // Crear un nuevo botón para evitar múltiples listeners
    const newBtnContinuar = btnContinuar.cloneNode(true);
    btnContinuar.parentNode.replaceChild(newBtnContinuar, btnContinuar);
    
    // Agregar el event listener al nuevo botón
    newBtnContinuar.addEventListener('click', function() {
      // Asegurar que el gameMode se mantenga en localStorage
      if (gameMode) {
        localStorage.setItem('gameMode', gameMode);
      }
      if (score !== undefined) {
        localStorage.setItem('score', score);
      }
      
      // Ocultar la pantalla tropical
      if (pantallaTropical) {
        pantallaTropical.style.display = 'none';
        pantallaTropical.classList.add('oculto');
      }
      
      // Redirigir al mapa
      window.location.href = "../mapa/mapa.php";
    });
  }
}

// --- FUNCIONES DE PERFIL ---
function cargarPerfil() {
  fetch('../controller/perfilController.php')
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
  
  fetch('../controller/perfilController.php', {
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


