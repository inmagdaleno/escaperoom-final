document.addEventListener("DOMContentLoaded", () => {
  // Manejo de transición de escena jungla a mapa
  const escenaJungla = document.getElementById("escena-jungla");
  const escenaMapa = document.getElementById("escena-mapa");
  const btnIrMapa = document.getElementById("ir-mapa");
  const piecesContainer = document.getElementById("pieces");
  const boardContainer = document.getElementById("board");
  const btnIrAdelante = document.getElementById("btn-ir-adelante");
  const btnVolverAtras = document.getElementById("btn-volver-atras");

  // Elementos de la interfaz
  const scoreDisplay = document.getElementById("score");
  const timerDisplay = document.getElementById("timer");

  // Estado del juego (recuperar de localStorage)
  let gameMode = localStorage.getItem('gameMode') || 'score';
  let score = parseInt(localStorage.getItem('score')) || 400;
  let timeLeft = 0; // Ahora manejado por el timer global

  // Inicializar mostrando la escena jungla primero
  if (escenaJungla && escenaMapa) {
    escenaJungla.classList.add("visible");
    escenaMapa.classList.remove("visible");
  }

  // Variables para el puzzle
  let draggedPiece = null;

  // --- FUNCIONES DEL PUZZLE ---
  function initializePuzzle() {
    console.log("Iniciando initializePuzzle...");
    console.log("piecesContainer:", piecesContainer);
    console.log("boardContainer:", boardContainer);
    
    if (!piecesContainer || !boardContainer) {
      console.error("No se encontraron los contenedores del puzzle");
      return;
    }
    
    const cols = 6;
    const rows = 6;
    const pieceWidth = 500 / cols;
    const pieceHeight = 500 / rows;
    const positions = [];

    // Limpiar contenedores primero
    piecesContainer.innerHTML = '';
    boardContainer.innerHTML = '';
    
    console.log("Contenedores limpiados");

    // Generar posiciones (x, y) de cada pieza
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        positions.push({ x, y });
      }
    }
    
    console.log("Posiciones generadas:", positions.length);

    // Mezclar posiciones para las piezas sueltas
    const shuffledPositions = positions.slice().sort(() => Math.random() - 0.5);
    
    console.log("Posiciones mezcladas:", shuffledPositions.length);

    // Crear piezas sueltas
    shuffledPositions.forEach(pos => {
      const piece = document.createElement("div");
      piece.classList.add("piece");
      piece.setAttribute("draggable", true);
      piece.dataset.pos = `${pos.x}-${pos.y}`;

      piece.style.backgroundImage = "url('img/mapa.webp')";
      piece.style.backgroundPosition = `-${pos.x * pieceWidth}px -${pos.y * pieceHeight}px`;
      piece.style.backgroundSize = '500px 500px'; // Añadir tamaño específico
      
      // Estilos de depuración temporal
      piece.style.border = '2px solid red';
      piece.style.width = '83.333px';
      piece.style.height = '83.333px';
      piece.style.position = 'absolute';

      randomizePiecePosition(piece, piecesContainer.offsetWidth, piecesContainer.offsetHeight);
      piece.addEventListener("dragstart", dragStart);
      piecesContainer.appendChild(piece);
    });
    
    console.log("Piezas creadas:", piecesContainer.children.length);
    console.log("Tamaño del contenedor de piezas:", piecesContainer.offsetWidth, "x", piecesContainer.offsetHeight);

    // Crear slots en el tablero
    positions.forEach(pos => {
      const slot = document.createElement("div");
      slot.classList.add("slot");
      slot.dataset.pos = `${pos.x}-${pos.y}`;
      
      // Estilos de depuración temporal
      slot.style.border = '2px solid blue';
      slot.style.width = '83.333px';
      slot.style.height = '83.333px';
      slot.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';

      slot.addEventListener("dragover", dragOver);
      slot.addEventListener("drop", drop);
      boardContainer.appendChild(slot);
    });
    
    console.log("Slots creados:", boardContainer.children.length);
    console.log("Tamaño del contenedor del tablero:", boardContainer.offsetWidth, "x", boardContainer.offsetHeight);

    // Add dragover and drop listeners to piecesContainer
    piecesContainer.addEventListener("dragover", dragOver);
    piecesContainer.addEventListener("drop", drop);
  }

  function randomizePiecePosition(piece, containerWidth, containerHeight) {
    const margin = 10;
    const maxX = containerWidth - 83.333 - margin;
    const maxY = containerHeight - 83.333 - margin;
    
    const randomX = Math.random() * maxX + margin;
    const randomY = Math.random() * maxY + margin;
    
    piece.style.left = randomX + "px";
    piece.style.top = randomY + "px";
  }

  function dragStart(e) {
    draggedPiece = e.target;
  }

  function dragOver(e) {
    e.preventDefault();
  }

  function drop(e) {
    e.preventDefault();
    const target = e.target;
    
    if (target.classList.contains("slot") && !target.hasChildNodes()) {
      // Dropping on empty slot
      if (draggedPiece.dataset.pos === target.dataset.pos) {
        // Correct position
        target.appendChild(draggedPiece);
        draggedPiece.style.position = "static";
        draggedPiece.style.left = "";
        draggedPiece.style.top = "";
        target.classList.add("correct-slot");
        
        setTimeout(() => {
          target.classList.remove("correct-slot");
        }, 1000);
        
        if (gameMode === 'score') {
          score += 10;
          scoreDisplay.textContent = score;
          localStorage.setItem('score', score);
        }
        
        checkPuzzleCompletion();
      } else {
        // Incorrect position
        target.classList.add("incorrect-slot");
        setTimeout(() => {
          target.classList.remove("incorrect-slot");
        }, 1000);
        
        if (gameMode === 'score') {
          score = Math.max(0, score - 5);
          scoreDisplay.textContent = score;
          localStorage.setItem('score', score);
        }
      }
    } else if (target.id === "pieces" || target.classList.contains("piece")) {
      // Dropping back to pieces container
      const piecesContainer = document.getElementById("pieces");
      piecesContainer.appendChild(draggedPiece);
      randomizePiecePosition(draggedPiece, piecesContainer.offsetWidth, piecesContainer.offsetHeight);
    }
    
    draggedPiece = null;
  }

  function checkPuzzleCompletion() {
    const slots = boardContainer.querySelectorAll(".slot");
    const completedSlots = Array.from(slots).filter(slot => slot.hasChildNodes());
    
    if (completedSlots.length === slots.length) {
      showCompletionAnimation();
    }
  }

  function showCompletionAnimation() {
    const mainTitle = document.getElementById("main-title");
    const subtitle = document.getElementById("subtitle");
    const piecesContainer = document.getElementById("pieces");
    
    const elementosOcultar = [mainTitle, subtitle, piecesContainer];
    
    elementosOcultar.forEach(el => {
      if (el) {
        el.style.transition = "opacity 3s ease-out";
        el.style.opacity = "0";
      }
    });
    
    setTimeout(() => {
      elementosOcultar.forEach(el => {
        if (el) el.style.visibility = 'hidden';
      });
      
      document.body.classList.add('fondo-piedra2');
      
      const btnExaminar = document.createElement('button');
      btnExaminar.id = 'btn-examinar-mapa';
      btnExaminar.textContent = 'Examinar Mapa';
      btnExaminar.className = 'btn-pista-primario btn-primary-gradient';
      btnExaminar.style.opacity = '0';
      btnExaminar.style.transition = 'opacity 1.5s cubic-bezier(.4,0,.2,1)';
      document.body.appendChild(btnExaminar);
      
      setTimeout(() => {
        btnExaminar.style.opacity = '1';
      }, 100);
      
      btnExaminar.addEventListener('click', () => {
        const modalMapa = document.getElementById('modal-mapa');
        if (modalMapa) {
          modalMapa.style.display = 'flex';
        }
      });
    }, 1600);
  }

  // Evento para pasar de jungla a mapa
  if (btnIrMapa) {
    btnIrMapa.addEventListener("click", () => {
      escenaJungla.classList.remove("visible");
      setTimeout(() => {
        escenaMapa.classList.add("visible");
        // Inicializar puzzle después de mostrar la escena
        setTimeout(() => {
          initializePuzzle();
        }, 100);
      }, 300);
    });
  }

  // --- NAVEGACIÓN ---
  if (btnVolverAtras) {
    btnVolverAtras.addEventListener("click", () => {
      localStorage.setItem('regresoDesdeModulo', 'mapa');
      localStorage.setItem('tiempoRegreso', Date.now());
      window.location.href = "../juego.php#escena-jungla";
    });
  }

  if (btnIrAdelante) {
    btnIrAdelante.addEventListener('click', () => {
      window.location.href = "../Final/portal.php";
    });
  }

  // --- TIMER Y SCORE ---
  if (gameMode === 'time' && window.globalTimer) {
    const hasExistingTimer = localStorage.getItem('endTime');
    if (hasExistingTimer) {
      window.globalTimer.resumeTimer();
    }
    timeLeft = window.globalTimer.getTimeLeft();
  }

  if (gameMode === 'score') {
    document.getElementById("score-container").style.display = "block";
    document.getElementById("timer-container").style.display = "none";
    if (scoreDisplay) scoreDisplay.textContent = score;
  } else if (gameMode === 'time') {
    document.getElementById("score-container").style.display = "none";
    document.getElementById("timer-container").style.display = "block";
    startTimer();
  }

  function startTimer() {
    if (window.globalTimer) {
      const hasExistingTimer = localStorage.getItem('endTime');
      if (hasExistingTimer) {
        window.globalTimer.resumeTimer();
      } else {
        window.globalTimer.startNewTimer(30 * 60 * 1000);
      }
      
      window.globalTimer.onUpdate((timeLeft) => {
        const timerDisplay = document.getElementById("timer");
        if (timerDisplay) {
          const minutes = Math.floor(timeLeft / 60);
          const seconds = timeLeft % 60;
          timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
      });
      
      window.globalTimer.onTimeUp(() => {
        showGameOver();
      });
    }
  }

  function showGameOver() {
    const gameOverOverlay = document.getElementById('game-over-overlay');
    if (gameOverOverlay) {
      gameOverOverlay.classList.remove('oculto');
      gameOverOverlay.style.display = 'flex';
    }
  }

  // --- MODALES ---
  const modalPerfil = document.getElementById('modal-perfil');
  const btnPerfil = document.getElementById('btn-perfil');
  const btnRanking = document.getElementById('btn-ranking');
  const modalRanking = document.getElementById('modal-ranking');
  const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

  if (btnPerfil && modalPerfil) {
    btnPerfil.addEventListener('click', () => {
      modalPerfil.style.display = 'flex';
    });
  }

  if (btnRanking && modalRanking) {
    btnRanking.addEventListener('click', () => {
      cargarRanking();
      modalRanking.style.display = 'flex';
    });
  }

  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('gameMode');
        localStorage.removeItem('score');
        localStorage.removeItem('timeLeft');
        localStorage.removeItem('endTime');
        localStorage.removeItem('gameStartTime');
        window.location.href = '../admin/login.php';
      }
    });
  }

  function cargarRanking() {
    const tbody = document.querySelector('#tabla-ranking tbody');
    if (tbody) {
      fetch('../controller/obtenerRanking.php')
        .then(res => res.json())
        .then(data => {
          tbody.innerHTML = '';
          data.forEach((jugador, i) => {
            tbody.innerHTML += `<tr>
              <td>${i+1}</td>
              <td>${jugador.nombre}</td>
              <td>${jugador.puntuacion}</td>
            </tr>`;
          });
        })
        .catch(error => console.error('Error cargando ranking:', error));
    }
  }

  // Cerrar modales
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('cerrar')) {
      const modal = e.target.closest('.modal-overlay');
      if (modal) {
        modal.style.display = 'none';
      }
    }
  });

  // Modal del mapa completado
  const modalMapa = document.getElementById('modal-mapa');
  const btnContinuarMapa = document.getElementById('btn-continuar-mapa');
  
  if (btnContinuarMapa) {
    btnContinuarMapa.addEventListener('click', () => {
      window.location.href = "../Final/portal.php";
    });
  }

  // Asegurar que el game-over-overlay esté oculto al iniciar
  const gameOverOverlay = document.getElementById('game-over-overlay');
  if (gameOverOverlay) {
    gameOverOverlay.classList.add('oculto');
    gameOverOverlay.style.display = 'none';
  }

}); // Fin DOMContentLoaded
