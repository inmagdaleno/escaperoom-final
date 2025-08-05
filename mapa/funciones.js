document.addEventListener("DOMContentLoaded", () => {
  // Estado del juego (debe ir antes de cualquier uso de gameMode)
  let gameMode = localStorage.getItem('gameMode') || 'score';
  let score = parseInt(localStorage.getItem('score')) || 400;
  let draggedPiece = null;

  // El timer global ya implementa applyPenalty, no es necesario redefinir penalización aquí
  // Elementos del DOM
  const escenaJungla = document.getElementById("escena-jungla");
  const escenaMapa = document.getElementById("escena-mapa");
  const btnIrMapa = document.getElementById("ir-mapa");
  const piecesContainer = document.getElementById("pieces");
  const boardContainer = document.getElementById("board");
  const btnIrAdelante = document.getElementById("btn-ir-adelante");
  const btnVolverAtras = document.getElementById("btn-volver-atras");
  const btnVolverAtrasJungla = document.getElementById("btn-volver-atras-jungla");
  
  // ...ya declarado arriba, eliminar duplicado...

  // Inicializar escenas
  if (escenaJungla && escenaMapa) {
    // Verificar si venimos del portal y debemos mostrar escena-mapa
    const mapaEscena = localStorage.getItem('mapaEscena');
    
    if (mapaEscena === 'escena-mapa') {
      // Mostrar escena-mapa directamente
      escenaJungla.classList.remove("visible");
      escenaMapa.classList.add("visible");
      // Limpiar el localStorage después de usar
      localStorage.removeItem('mapaEscena');
    } else {
      // Mostrar escena-jungla por defecto
      escenaJungla.classList.add("visible");
      escenaMapa.classList.remove("visible");
    }
  }

  // Configuración del puzzle (6x6 = 36 piezas)
  const PUZZLE_SIZE = 6;
  const PIECE_SIZE = 75;
  const IMAGE_SIZE = 450; // 6 * 75 = 450px

  // Función para crear el puzzle
  function createPuzzle() {
    console.log("Creando puzzle de 36 piezas...");
    
    // Verificar que los contenedores existen
    if (!piecesContainer || !boardContainer) {
      console.error("Contenedores no encontrados");
      return;
    }
    
    // Limpiar contenedores
    piecesContainer.innerHTML = '';
    boardContainer.innerHTML = '';

    // Configurar el área de piezas para recibir drops
    piecesContainer.addEventListener('dragover', handleDragOver);
    piecesContainer.addEventListener('drop', handleDrop);

    // Crear array de posiciones
    const positions = [];
    for (let row = 0; row < PUZZLE_SIZE; row++) {
      for (let col = 0; col < PUZZLE_SIZE; col++) {
        positions.push({ row, col });
      }
    }

    // Mezclar posiciones para las piezas sueltas
    const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);

    // Crear piezas sueltas con distribución y rotación aleatoria
    shuffledPositions.forEach((pos, index) => {
      const piece = document.createElement('div');
      piece.className = 'piece';
      piece.draggable = true;
      piece.dataset.row = pos.row;
      piece.dataset.col = pos.col;
      
      // Posición de la imagen de fondo
      const bgX = -pos.col * PIECE_SIZE;
      const bgY = -pos.row * PIECE_SIZE;
      piece.style.backgroundPosition = `${bgX}px ${bgY}px`;
      
      // Rotación aleatoria irregular (ángulos más naturales)
      const minRotation = -45;
      const maxRotation = 45;
      const randomRotation = Math.floor(Math.random() * (maxRotation - minRotation + 1)) + minRotation;
      piece.dataset.rotation = randomRotation;
      
      // Aplicar la rotación inicial
      piece.style.transform = `rotate(${randomRotation}deg)`;
      
      // Posición aleatoria en el contenedor (más distribuida)
      const containerWidth = 480; // Ancho disponible (500px - padding)
      const containerHeight = 480; // Alto disponible (500px - padding)
      
      // Crear zonas de distribución para evitar aglomeraciones
      const zones = [
        { x: 0, y: 0, w: containerWidth/2, h: containerHeight/2 },           // Esquina superior izquierda
        { x: containerWidth/2, y: 0, w: containerWidth/2, h: containerHeight/2 },      // Esquina superior derecha
        { x: 0, y: containerHeight/2, w: containerWidth/2, h: containerHeight/2 },     // Esquina inferior izquierda
        { x: containerWidth/2, y: containerHeight/2, w: containerWidth/2, h: containerHeight/2 } // Esquina inferior derecha
      ];
      
      // Seleccionar zona aleatoria
      const zone = zones[Math.floor(Math.random() * zones.length)];
      const randomX = zone.x + Math.random() * (zone.w - PIECE_SIZE);
      const randomY = zone.y + Math.random() * (zone.h - PIECE_SIZE);
      
      piece.style.left = randomX + 'px';
      piece.style.top = randomY + 'px';
      
      // Event listeners
      piece.addEventListener('dragstart', handleDragStart);
      piece.addEventListener('dragend', handleDragEnd);
      
      piecesContainer.appendChild(piece);
    });

    // Crear slots del tablero
    positions.forEach(pos => {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.dataset.row = pos.row;
      slot.dataset.col = pos.col;
      
      // Event listeners
      slot.addEventListener('dragover', handleDragOver);
      slot.addEventListener('drop', handleDrop);
      slot.addEventListener('dragenter', handleDragEnter);
      slot.addEventListener('dragleave', handleDragLeave);
      
      boardContainer.appendChild(slot);
    });

    console.log(`Puzzle de 6x6 creado: ${positions.length} piezas y slots`);
  }

  // Funciones de drag and drop
  function handleDragStart(e) {
    draggedPiece = e.target;
    e.target.style.opacity = '0.5';
    // Cambiar cursor a grabbing durante el arrastre
    e.target.style.cursor = 'grabbing';
    
    // Auto-corregir rotación al coger la pieza
    e.target.dataset.rotation = 0;
    e.target.style.transform = 'rotate(0deg)';
    
    // Limpiar el estado de la celda origen si la pieza viene del tablero
    if (draggedPiece.parentNode.classList.contains('slot')) {
      draggedPiece.parentNode.classList.remove('incorrect-piece', 'correct', 'incorrect');
    }
  }

  function handleDragEnd(e) {
    e.target.style.opacity = '1';
    // Restaurar cursor a grab
    e.target.style.cursor = 'grab';
    draggedPiece = null;
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDragEnter(e) {
    e.preventDefault();
    if (e.target.classList.contains('slot') && !e.target.hasChildNodes()) {
      e.target.classList.add('drag-over');
    }
  }

  function handleDragLeave(e) {
    if (e.target.classList.contains('slot')) {
      e.target.classList.remove('drag-over');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    let slot = e.target;
    
    // Si se suelta en una pieza que ya está en una celda, obtener la celda padre
    if (slot.classList.contains('piece') && slot.parentNode.classList.contains('slot')) {
      slot = slot.parentNode;
    }
    
    // Si se suelta en el área de piezas, devolver la pieza allí
    if (slot.id === 'pieces' || slot.closest('#pieces')) {
      returnPieceToArea(draggedPiece);
      return;
    }
    
    if (!slot.classList.contains('slot')) {
      return;
    }
    
    // Limpiar el estado de la celda origen antes de mover la pieza
    if (draggedPiece.parentNode.classList.contains('slot')) {
      draggedPiece.parentNode.classList.remove('incorrect-piece', 'correct', 'incorrect', 'correct-gold-hint');
    }
    
    // Si la celda ya tiene una pieza, intercambiarlas
    if (slot.hasChildNodes()) {
      const existingPiece = slot.firstElementChild;
      if (existingPiece.classList.contains('piece')) {
        // Limpiar estado de la celda destino
        slot.classList.remove('incorrect-piece', 'correct', 'incorrect');
        
        // Intercambiar las piezas
        const draggedParent = draggedPiece.parentNode;
        if (draggedParent.classList.contains('slot')) {
          draggedParent.appendChild(existingPiece);
          existingPiece.style.position = 'static';
          existingPiece.style.left = '';
          existingPiece.style.top = '';
          // Mantener cursor de mano para piezas en el tablero
          existingPiece.style.cursor = 'grab';
          
          // Verificar si la pieza intercambiada está en posición correcta
          const existingPieceRow = parseInt(existingPiece.dataset.row);
          const existingPieceCol = parseInt(existingPiece.dataset.col);
          const existingSlotRow = parseInt(draggedParent.dataset.row);
          const existingSlotCol = parseInt(draggedParent.dataset.col);
          
          if (existingPieceRow !== existingSlotRow || existingPieceCol !== existingSlotCol) {
            draggedParent.classList.add('incorrect-piece');
          }
        } else {
          returnPieceToArea(existingPiece);
        }
      }
    }
    
    // Limpiar cualquier estado previo de la celda destino
    slot.classList.remove('drag-over', 'correct', 'incorrect', 'incorrect-piece', 'correct-gold-hint');
    
    // Mover la pieza arrastrada a la nueva celda
    slot.appendChild(draggedPiece);
    draggedPiece.style.position = 'static';
    draggedPiece.style.left = '';
    draggedPiece.style.top = '';
    // Cambiar cursor para indicar que se puede mover
    draggedPiece.style.cursor = 'grab';
    
    // Verificar si es la posición correcta (solo posición, se auto-corrige la rotación)
    const pieceRow = parseInt(draggedPiece.dataset.row);
    const pieceCol = parseInt(draggedPiece.dataset.col);
    const slotRow = parseInt(slot.dataset.row);
    const slotCol = parseInt(slot.dataset.col);
    
    const isCorrectPosition = pieceRow === slotRow && pieceCol === slotCol;
    
    if (isCorrectPosition) {
      // Posición correcta - mostrar feedback positivo y aplicar efecto dorado sutil
      setTimeout(() => {
        slot.classList.add('correct');
        // Añadir efecto dorado sutil para piezas en posición correcta
        slot.classList.add('correct-gold-hint');
        setTimeout(() => {
          slot.classList.remove('correct');
        }, 600);
      }, 50);
      
      // Actualizar puntuación
      if (gameMode === 'score') {
        score += 10;
        updateScore();
      }
      
      // Verificar si el puzzle está completo
      checkPuzzleComplete();
      
    } else {
      // Posición incorrecta - mostrar feedback negativo y mantener borde rojo
      slot.classList.add('incorrect-piece');
      setTimeout(() => {
        slot.classList.add('incorrect');
        setTimeout(() => {
          slot.classList.remove('incorrect');
        }, 600);
      }, 50);
      
      if (gameMode === 'score') {
        score = Math.max(0, score - 10);
        updateScore();
        mostrarPenalizacion('-10 puntos');
      } else if (gameMode === 'time') {
        if (window.globalTimer && typeof window.globalTimer.applyPenalty === 'function') {
          window.globalTimer.applyPenalty(10);
        } else {
          console.warn('No se puede aplicar penalización de tiempo: función applyPenalty no disponible en globalTimer.');
        }
        mostrarPenalizacion('-10 segundos');
      }
    }
  }

  function returnPieceToArea(piece) {
    const piecesContainer = document.getElementById('pieces');
    
    // Limpiar estilos de posición
    piece.style.position = 'absolute';
    piece.style.left = '';
    piece.style.top = '';
    // Restaurar cursor original para piezas en el área
    piece.style.cursor = 'grab';
    
    // Remover clases de estado si las tiene
    if (piece.parentNode.classList.contains('slot')) {
      piece.parentNode.classList.remove('correct', 'incorrect', 'incorrect-piece', 'correct-gold-hint');
    }
    
    // Generar nueva posición aleatoria en el área de piezas
    const containerRect = piecesContainer.getBoundingClientRect();
    const maxX = containerRect.width - 75; // 75px es el ancho de la pieza
    const maxY = containerRect.height - 75; // 75px es el alto de la pieza
    
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;
    
    piece.style.left = randomX + 'px';
    piece.style.top = randomY + 'px';
    
    // Generar nueva rotación aleatoria irregular cuando regresa al área
    const minRotation = -45;
    const maxRotation = 45;
    const randomRotation = Math.floor(Math.random() * (maxRotation - minRotation + 1)) + minRotation;
    piece.dataset.rotation = randomRotation;
    piece.style.transform = `rotate(${randomRotation}deg)`;
    
    // Mover la pieza al contenedor de piezas
    piecesContainer.appendChild(piece);
  }

  function updateScore() {
    const scoreDisplay = document.getElementById("score");
    if (scoreDisplay) {
      scoreDisplay.textContent = score;
      localStorage.setItem('score', score);
    }
  }

  function checkPuzzleComplete() {
    const slots = boardContainer.querySelectorAll('.slot');
    let correctPieces = 0;
    
    slots.forEach(slot => {
      if (slot.hasChildNodes()) {
        const piece = slot.firstElementChild;
        if (piece.classList.contains('piece')) {
          const pieceRow = parseInt(piece.dataset.row);
          const pieceCol = parseInt(piece.dataset.col);
          const slotRow = parseInt(slot.dataset.row);
          const slotCol = parseInt(slot.dataset.col);
          
          // La pieza es correcta si está en la posición correcta (se auto-corrige al cogerla)
          const isCorrectPosition = pieceRow === slotRow && pieceCol === slotCol;
          
          if (isCorrectPosition) {
            correctPieces++;
          }
        }
      }
    });
    
    if (correctPieces === slots.length) {
      console.log("¡Puzzle completado!");
      showCompletionAnimation();
    }
  }

  // Alias para compatibilidad
  function checkPuzzleCompletion() {
    checkPuzzleComplete();
  }

  function showCompletionAnimation() {
    const mainTitle = document.getElementById("main-title");
    const subtitle = document.getElementById("subtitle");
    const instructions = document.querySelector(".puzzle-instructions");
    const puzzleWrapper = document.querySelector(".puzzle-wrapper");
    const boardContainer = document.querySelector(".board-container");
    
    // Añadir clase de completado para activar animaciones del tablero
    document.body.classList.add('puzzle-completed');
    
    // Aplicar animación dorada a todas las piezas en posición correcta
    const slots = boardContainer.querySelectorAll('.slot');
    slots.forEach((slot, index) => {
      if (slot.hasChildNodes()) {
        const piece = slot.firstElementChild;
        if (piece && piece.classList.contains('piece')) {
          // Añadir clase de oro a la pieza con un pequeño delay escalonado
          setTimeout(() => {
            slot.classList.add('final-gold-piece');
          }, index * 50); // 50ms de delay entre cada pieza para efecto cascada
        }
      }
    });
    
    // Crear partículas doradas
    createGoldParticles();
    
    // Animación de celebración del tablero (4 segundos para coincidir con la animación dorada)
    setTimeout(() => {
      // Comenzar desvanecimiento de elementos
      [mainTitle, subtitle, instructions].forEach(el => {
        if (el) {
          el.classList.add('fade-out-smooth');
        }
      });
      
      // Marcar body para transición de fondo
      document.body.classList.add('transitioning');
      
      // Desvanecimiento del tablero después de la animación
      setTimeout(() => {
        if (puzzleWrapper) {
          puzzleWrapper.classList.add('fade-out-smooth');
        }
        
        // Cambiar fondo después de que empiece el desvanecimiento
        setTimeout(() => {
          document.body.classList.add('fondo-piedra2');
        }, 1000);
        
        // Crear botón examinar después del desvanecimiento completo
        setTimeout(() => {
          const btnExaminar = document.createElement('button');
          btnExaminar.id = 'btn-examinar-mapa';
          btnExaminar.textContent = 'Examinar Mapa';
          btnExaminar.className = 'btn-pista-primario btn-primary-gradient';
          btnExaminar.style.opacity = '0';
          btnExaminar.style.transition = 'opacity 1.5s ease';
          document.body.appendChild(btnExaminar);
          
          // Mostrar botón con fade in
          setTimeout(() => {
            btnExaminar.style.opacity = '1';
          }, 100);
          
          // Event listener para el botón
          btnExaminar.addEventListener('click', function() {
            document.getElementById('modal-mapa').style.display = 'flex';
            hideExaminarMapaButton();
          });
        }, 3500); // Esperar a que termine el desvanecimiento
        
      }, 1000); // Esperar 1 segundo después de la animación del tablero
    }, 4000); // Esperar 4 segundos para la animación de celebración dorada
  }

  // Función para crear partículas doradas
  function createGoldParticles() {
    const puzzleWrapper = document.querySelector('.puzzle-wrapper');
    if (!puzzleWrapper) return;
    
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'gold-particle';
      
      // Posición aleatoria alrededor del tablero
      const x = Math.random() * puzzleWrapper.offsetWidth;
      const y = Math.random() * puzzleWrapper.offsetHeight;
      
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      
      puzzleWrapper.appendChild(particle);
      
      // Eliminar partícula después de la animación
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 3000);
    }
  }

  // Event listener para ir al mapa
  if (btnIrMapa) {
    btnIrMapa.addEventListener("click", () => {
      escenaJungla.classList.remove("visible");
      setTimeout(() => {
        escenaMapa.classList.add("visible");
        // Desplazar hacia arriba
        window.scrollTo(0, 0);
        setTimeout(() => {
          createPuzzle();
        }, 300);
      }, 300);
    });
  }

  // Observer para detectar cuando la escena del mapa se vuelve visible
  if (escenaMapa) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (escenaMapa.classList.contains('visible')) {
            setTimeout(() => {
              if (piecesContainer && boardContainer && piecesContainer.children.length === 0) {
                createPuzzle();
              }
            }, 100);
          }
        }
      });
    });
    
    observer.observe(escenaMapa, { attributes: true });
  }

  // Navegación
  if (btnVolverAtras) {
    btnVolverAtras.addEventListener("click", () => {
      // Simplemente navegar a la escena anterior (escena-jungla en el mismo archivo)
      if (escenaMapa && escenaJungla) {
        escenaMapa.classList.remove("visible");
        escenaJungla.classList.add("visible");
        // Ocultar el botón examinar mapa al volver a la jungla
        hideExaminarMapaButton();
      }
    });
  }

  // Navegación desde escena-jungla
  if (btnVolverAtrasJungla) {
    btnVolverAtrasJungla.addEventListener("click", () => {
      // Ocultar el botón examinar mapa antes de salir
      hideExaminarMapaButton();
      // Volver al sudoku (pantalla inmediatamente anterior)
      window.location.href = "../sudoku/sudoku.php";
    });
  }

  if (btnIrAdelante) {
    btnIrAdelante.addEventListener('click', () => {
      // Simular puzzle completado para ver las animaciones
      console.log("Simulando puzzle completado para mostrar animaciones...");
      
      // Asegurar que estamos en la escena del mapa
      if (escenaMapa && !escenaMapa.classList.contains('visible')) {
        // Si no estamos en la escena del mapa, ir primero
        escenaJungla.classList.remove("visible");
        escenaMapa.classList.add("visible");
        
        // Crear el puzzle y luego activar animaciones
        setTimeout(() => {
          createPuzzle();
          setTimeout(() => {
            showCompletionAnimation();
          }, 1000); // Esperar un poco para que se cree el puzzle
        }, 500);
      } else {
        // Si ya estamos en la escena del mapa, activar animaciones directamente
        showCompletionAnimation();
      }
    });
  }

  // Inicializar UI
  if (gameMode === 'score') {
    document.getElementById("score-container").style.display = "block";
    document.getElementById("timer-container").style.display = "none";
    updateScore();
  } else if (gameMode === 'time') {
    document.getElementById("score-container").style.display = "none";
    document.getElementById("timer-container").style.display = "block";
    
    // El timer global ya debería estar funcionando, no hacer nada más
    // Solo asegurar que el display esté actualizado
    if (window.globalTimer) {
      const currentTime = window.globalTimer.getTimeLeft();
      if (currentTime > 0) {
        window.updateAllTimerDisplays(currentTime);
      }
    }
  }

  // Modales y otros eventos
  // --- Pista Extra Modal ---
  const btnPistaExtra = document.getElementById('btn-pista-extra');
  const modalPista = document.getElementById('modal-pista');
  const cerrarModalPista = document.getElementById('cerrar-modal-pista');
  const pistaExplicacion = document.getElementById('pista-explicacion');
  const feedbackPista = document.getElementById('feedback-pista');
  const btnConfirmarPista = document.getElementById('btn-confirmar-pista');
  const btnDescartarPista = document.getElementById('btn-descartar-pista');

  // Explicación y penalización (puedes personalizar el texto)
  if (pistaExplicacion) {
    pistaExplicacion.textContent = 'La pista extra te mostrará una ayuda visual para resolver el mapa, pero recibirás una penalización de 15 segundos (contrarreloj) o perderás 10 puntos (puntuación). ¿Quieres continuar?';
  }
  if (feedbackPista) {
    feedbackPista.textContent = '';
  }

  if (btnPistaExtra && modalPista) {
    btnPistaExtra.addEventListener('click', () => {
      modalPista.style.display = 'flex';
    });
  }
  if (cerrarModalPista && modalPista) {
    cerrarModalPista.addEventListener('click', () => {
      modalPista.style.display = 'none';
    });
  }
  if (btnDescartarPista && modalPista) {
    btnDescartarPista.addEventListener('click', () => {
      modalPista.style.display = 'none';
    });
  }
  // El botón de confirmar pista abrirá el modal visual (pantalla-pista-extra-mapa)
  const pantallaPistaExtraMapa = document.getElementById('pantalla-pista-extra-mapa');
  const btnContinuarMapaPista = document.getElementById('btn-continuar-mapa-pista');
  if (btnConfirmarPista && pantallaPistaExtraMapa && modalPista) {
    btnConfirmarPista.addEventListener('click', () => {
      modalPista.style.display = 'none';
      pantallaPistaExtraMapa.style.display = 'flex';
    });
  }
  if (btnContinuarMapaPista && pantallaPistaExtraMapa) {
    btnContinuarMapaPista.addEventListener('click', () => {
      pantallaPistaExtraMapa.style.display = 'none';
    });
  }
  
  // Mostrar penalización temporal en pantalla
  function mostrarPenalizacion(texto) {
    let penalBox = document.getElementById('penalizacion-box');
    if (penalBox) {
      penalBox.innerHTML = `<span style="background:rgba(200,0,0,0.7);color:#fff;padding:12px 24px;border-radius:12px;font-size:1rem;font-weight:bold;box-shadow:0 2px 12px rgba(0,0,0,0.2);opacity:1;transition:opacity 0.3s;display:inline-block;">¡${texto}!</span>`;
      setTimeout(() => {
        penalBox.innerHTML = '';
      }, 1200);
    }
  }
  // Funciones para manejar la visibilidad del botón examinar mapa
  function hideExaminarMapaButton() {
    const btnExaminar = document.getElementById('btn-examinar-mapa');
    if (btnExaminar) {
      btnExaminar.style.display = 'none';
    }
  }
  
  function showExaminarMapaButton() {
    const btnExaminar = document.getElementById('btn-examinar-mapa');
    if (btnExaminar) {
      btnExaminar.style.display = 'block';
    }
  }
  
  const modalPerfil = document.getElementById('modal-perfil');
  const btnPerfil = document.getElementById('btn-perfil');
  const btnRanking = document.getElementById('btn-ranking');
  const modalRanking = document.getElementById('modal-ranking');
  const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

  if (btnPerfil && modalPerfil) {
    btnPerfil.addEventListener('click', () => {
      modalPerfil.style.display = 'flex';
      cargarPerfil();
      hideExaminarMapaButton();
    });
  }

  if (btnRanking && modalRanking) {
    btnRanking.addEventListener('click', () => {
      cargarRanking();
      modalRanking.style.display = 'flex';
      hideExaminarMapaButton();
    });
  }

  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.clear();
        window.location.href = '../admin/login.php';
      }
    });
  }

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

  // Cerrar modales
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('cerrar')) {
      const modal = e.target.closest('.modal-overlay');
      if (modal) {
        modal.style.display = 'none';
        showExaminarMapaButton();
      }
    }
  });

  // Modal del mapa completado
  const btnContinuarMapa = document.getElementById('btn-continuar-mapa');
  if (btnContinuarMapa) {
    btnContinuarMapa.addEventListener('click', () => {
      // Guardar que venimos de escena-mapa para la navegación de vuelta
      localStorage.setItem('portalOrigenEscena', 'escena-mapa');
      window.location.href = "../Final/portal.php";
    });
  }

  // Game Over - botón restart
  const btnRestart = document.getElementById('btn-restart');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      if (window.globalTimer) {
        window.globalTimer.clear();
      }
      // Limpiar localStorage del juego
      localStorage.removeItem('gameMode');
      localStorage.removeItem('score');
      localStorage.removeItem('timeLeft');
      localStorage.removeItem('endTime');
      localStorage.removeItem('gameStartTime');
      localStorage.removeItem('totalPistasUsadas');
      localStorage.removeItem('mapaEscena');
      localStorage.removeItem('portalOrigenEscena');
      
      // Redirigir al inicio del juego (escena modo-juego)
      window.location.href = '/escaperoom/juego.php#modo-juego';
    });
  }

  // Funciones para el modal de perfil
  function cargarPerfil() {
    fetch('../controller/perfilController.php', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Mostrar datos en la vista de visualización
        document.getElementById('perfil-nombre-display').textContent = data.usuario.nombre || 'Sin nombre';
        document.getElementById('perfil-email-display').textContent = data.usuario.email || 'Sin email';
        
        // Mostrar imagen de perfil
        const imgPath = data.usuario.imagen_perfil && data.usuario.imagen_perfil.trim() !== '' 
          ? data.usuario.imagen_perfil 
          : '../img/avatar.webp';
        document.getElementById('perfil-img-display').src = imgPath;
        document.getElementById('perfil-img-preview').src = imgPath;
        
        // Llenar formulario de edición
        document.getElementById('perfil-nombre').value = data.usuario.nombre || '';
        document.getElementById('perfil-email').value = data.usuario.email || '';
        
        // Mostrar vista de visualización por defecto
        mostrarVistaVisualizacion();
      } else {
        console.error('Error al cargar perfil:', data.error);
      }
    })
    .catch(error => {
      console.error('Error en la petición:', error);
    });
  }

  function mostrarVistaVisualizacion() {
    document.getElementById('perfil-vista').style.display = 'block';
    document.getElementById('perfil-edicion').style.display = 'none';
  }

  function mostrarVistaEdicion() {
    document.getElementById('perfil-vista').style.display = 'none';
    document.getElementById('perfil-edicion').style.display = 'block';
  }

  function guardarPerfil(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('nombre', document.getElementById('perfil-nombre').value);
    formData.append('email', document.getElementById('perfil-email').value);
    
    const inputImg = document.getElementById('input-perfil-img');
    if (inputImg.files[0]) {
      formData.append('imagen_perfil', inputImg.files[0]);
    }

    fetch('../controller/perfilController.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Perfil actualizado correctamente');
        cargarPerfil(); // Recargar datos
        mostrarVistaVisualizacion(); // Volver a vista de visualización
      } else {
        alert('Error: ' + (data.error || 'No se pudo actualizar el perfil'));
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al guardar el perfil');
    });
  }

  // Event listeners para el modal de perfil
  const cerrarModalPerfil = document.getElementById('cerrar-modal-perfil');
  const btnEditarPerfil = document.getElementById('btn-editar-perfil');
  const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');
  const formPerfil = document.getElementById('form-perfil');
  const btnCambiarImg = document.getElementById('btn-cambiar-img');
  const inputPerfilImg = document.getElementById('input-perfil-img');

  if (btnPerfil) {
    btnPerfil.addEventListener('click', () => {
      modalPerfil.style.display = 'flex';
      cargarPerfil();
    });
  }

  if (cerrarModalPerfil) {
    cerrarModalPerfil.addEventListener('click', () => {
      modalPerfil.style.display = 'none';
      mostrarVistaVisualizacion();
    });
  }

  if (btnEditarPerfil) {
    btnEditarPerfil.addEventListener('click', mostrarVistaEdicion);
  }

  if (btnCancelarEdicion) {
    btnCancelarEdicion.addEventListener('click', () => {
      cargarPerfil(); // Recargar datos originales
      mostrarVistaVisualizacion();
    });
  }

  if (formPerfil) {
    formPerfil.addEventListener('submit', guardarPerfil);
  }

  if (btnCambiarImg && inputPerfilImg) {
    btnCambiarImg.addEventListener('click', () => {
      inputPerfilImg.click();
    });

    inputPerfilImg.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          document.getElementById('perfil-img-preview').src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Cerrar modal al hacer clic fuera de él
  if (modalPerfil) {
    modalPerfil.addEventListener('click', (event) => {
      if (event.target === modalPerfil) {
        modalPerfil.style.display = 'none';
        mostrarVistaVisualizacion();
      }
    });
  }
});