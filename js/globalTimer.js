/**
 * Sistema de Timer Global para Escape Room
 * Maneja el temporizador de forma centralizada para todos los módulos
 */

class GlobalTimer {
  constructor() {
    this.timerInterval = null;
    this.timeLeft = 0;
    this.endTime = null;
    this.gameMode = 'score';
    this.isInitialized = false;
    this.callbacks = {
      onTick: [],
      onTimeUp: [],
      onUpdate: []
    };
    
    // Inicializar al cargar
    this.init();
  }

  init() {
    // Recuperar modo de juego
    this.gameMode = localStorage.getItem('gameMode') || 'score';
    
    if (this.gameMode === 'time') {
      // Verificar si ya existe un timer activo
      const storedEndTime = localStorage.getItem('endTime');
      if (storedEndTime) {
        this.endTime = parseInt(storedEndTime);
        this.resumeTimer();
      }
    }
    
    this.isInitialized = true;
  }

  // Iniciar nuevo timer de 30 minutos
  startNewTimer() {
    if (this.gameMode !== 'time') return;
    
    this.timeLeft = 30 * 60; // 30 minutos
    this.endTime = Date.now() + (this.timeLeft * 1000);
    
    localStorage.setItem('endTime', this.endTime);
    localStorage.setItem('timeLeft', this.timeLeft);
    
    this.startInterval();
  }

  // Reanudar timer existente
  resumeTimer() {
    if (this.gameMode !== 'time' || !this.endTime) return;
    
    const remainingTime = this.endTime - Date.now();
    if (remainingTime <= 0) {
      this.triggerTimeUp();
      return;
    }
    
    this.timeLeft = Math.ceil(remainingTime / 1000);
    localStorage.setItem('timeLeft', this.timeLeft);
    
    this.startInterval();
  }

  // Iniciar el intervalo del timer
  startInterval() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      // Leer endTime actualizado desde localStorage (puede haber cambiado por penalizaciones)
      const currentEndTime = parseInt(localStorage.getItem('endTime'));
      if (!currentEndTime) {
        this.stop();
        return;
      }

      this.endTime = currentEndTime;
      const remainingTime = this.endTime - Date.now();
      
      if (remainingTime <= 0) {
        this.triggerTimeUp();
        return;
      }

      this.timeLeft = Math.ceil(remainingTime / 1000);
      localStorage.setItem('timeLeft', this.timeLeft);
      
      // Ejecutar callbacks de tick
      this.callbacks.onTick.forEach(callback => callback(this.timeLeft));
      this.callbacks.onUpdate.forEach(callback => callback(this.timeLeft));
    }, 1000);
  }

  // Aplicar penalización de tiempo
  applyPenalty(seconds) {
    if (this.gameMode !== 'time') return;
    
    this.timeLeft = Math.max(0, this.timeLeft - seconds);
    this.endTime = Date.now() + (this.timeLeft * 1000);
    
    localStorage.setItem('endTime', this.endTime);
    localStorage.setItem('timeLeft', this.timeLeft);
    
    // Ejecutar callbacks de actualización
    this.callbacks.onUpdate.forEach(callback => callback(this.timeLeft));
    
    if (this.timeLeft <= 0) {
      this.triggerTimeUp();
    }
  }

  // Detener timer
  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Limpiar timer completamente
  clear() {
    this.stop();
    localStorage.removeItem('endTime');
    localStorage.removeItem('timeLeft');
    this.timeLeft = 0;
    this.endTime = null;
  }

  // Disparar evento de tiempo agotado
  triggerTimeUp() {
    this.stop();
    this.clear();
    this.callbacks.onTimeUp.forEach(callback => callback());
  }

  // Registrar callback para tick del timer
  onTick(callback) {
    this.callbacks.onTick.push(callback);
  }

  // Registrar callback para tiempo agotado
  onTimeUp(callback) {
    this.callbacks.onTimeUp.push(callback);
  }

  // Registrar callback para actualizaciones (penalizaciones, etc.)
  onUpdate(callback) {
    this.callbacks.onUpdate.push(callback);
  }

  // Obtener tiempo restante formateado
  getFormattedTime() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Verificar si el timer está activo
  isActive() {
    return this.timerInterval !== null;
  }

  // Obtener tiempo restante en segundos
  getTimeLeft() {
    return this.timeLeft;
  }

  // Obtener modo de juego
  getGameMode() {
    return this.gameMode;
  }

  // Establecer modo de juego
  setGameMode(mode) {
    this.gameMode = mode;
    localStorage.setItem('gameMode', mode);
  }
}

// Crear instancia global solo si no existe
if (!window.globalTimer) {
  window.globalTimer = new GlobalTimer();
}

// Funciones de utilidad globales para compatibilidad
window.formatTime = function(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Función para actualizar displays de tiempo
window.updateAllTimerDisplays = function(timeLeft) {
  // Display básico de timer
  const timerDisplay = document.getElementById('timer');
  if (timerDisplay) {
    timerDisplay.textContent = window.formatTime(timeLeft);
  }

  // Display digital del temporizador (si existe)
  const minTens = document.getElementById('minTens');
  const minUnits = document.getElementById('minUnits');
  const secTens = document.getElementById('secTens');
  const secUnits = document.getElementById('secUnits');

  if (minTens && minUnits && secTens && secUnits) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const minStr = String(minutes).padStart(2, '0');
    const secStr = String(seconds).padStart(2, '0');

    minTens.textContent = minStr[0];
    minUnits.textContent = minStr[1];
    secTens.textContent = secStr[0];
    secUnits.textContent = secStr[1];
  }
};

// Función para mostrar game over
window.showGameOver = function() {
  const overlay = document.getElementById('game-over-overlay');
  const video = document.getElementById('game-over-video');
  
  if (overlay) {
    overlay.classList.remove('oculto');
    overlay.style.display = 'flex';
  }
  // Reproducir video solo tras interacción del usuario
  if (video) {
    // Intentar reproducir, pero si falla por falta de interacción, mostrar botón para reproducir
    video.play().catch(() => {
      // Crear botón para reproducir video si no existe
      if (!document.getElementById('btn-play-video')) {
        const btnPlay = document.createElement('button');
        btnPlay.id = 'btn-play-video';
        btnPlay.textContent = 'Ver animación';
        btnPlay.className = 'btn-pista-primario btn-primary-gradient';
        btnPlay.style.position = 'absolute';
        btnPlay.style.top = '50%';
        btnPlay.style.left = '50%';
        btnPlay.style.transform = 'translate(-50%, -50%)';
        btnPlay.style.zIndex = '4000';
        overlay.appendChild(btnPlay);
        btnPlay.addEventListener('click', () => {
          video.play();
          btnPlay.remove();
        });
      }
    });
  }
  // Guardar partida como fallida
  window.saveGameOverData();
};

// Función para guardar datos de game over
window.saveGameOverData = function() {
  const gameMode = localStorage.getItem('gameMode') || 'score';
  const gameStartTime = parseInt(localStorage.getItem('gameStartTime')) || Date.now();
  const gameEndTime = Date.now();
  const tiempoEmpleado = Math.floor((gameEndTime - gameStartTime) / 1000); // en segundos
  const totalPistasUsadas = parseInt(localStorage.getItem('totalPistasUsadas')) || 0;
  
  // Determinar en qué prueba se quedó (basado en la URL actual)
  let idPrueba = 1; // Por defecto mapa (mensaje)
  const currentPath = window.location.pathname;
  if (currentPath.includes('sudoku')) {
    idPrueba = 4;
  } else if (currentPath.includes('mapa')) {
    idPrueba = 3; // puzzle
  } else if (currentPath.includes('Final')) {
    idPrueba = 5; // final
  }
  
  let puntuacionFinal = null;
  if (gameMode === 'score') {
    puntuacionFinal = parseInt(localStorage.getItem('score')) || 0;
  }
  
  const gameData = {
    id_prueba: idPrueba,
    tiempo_empleado: tiempoEmpleado,
    pistas_usadas: totalPistasUsadas,
    puntuacion_final: puntuacionFinal,
    resultado: 0, // 0 para fallo (tiempo agotado)
    modo_juego: gameMode === 'score' ? 'puntos' : 'tiempo',
    tiempo_restante_final: 0 // Tiempo agotado
  };
  
  console.log('Guardando partida fallida con datos:', gameData);
  
  // Enviar datos al servidor (ruta relativa corregida)
  fetch('../controller/guardarPartida.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData),
  })
  .then(async response => {
    // Verificar si la respuesta es JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (data.success) {
        console.log('Partida fallida guardada exitosamente en la base de datos');
      } else {
        console.error('Error al guardar partida fallida:', data.mensaje);
      }
    } else {
      const text = await response.text();
      console.error('Respuesta inesperada al guardar partida:', text);
    }
  })
  .catch((error) => {
    console.error('Error de conexión al guardar partida fallida:', error);
  });
};

// Configurar callbacks del timer global (solo si no están ya configurados)
if (window.globalTimer && !window.globalTimer.callbacksConfigured) {
  // Callback para actualizar displays
  window.globalTimer.onUpdate(window.updateAllTimerDisplays);
  window.globalTimer.onTick(window.updateAllTimerDisplays);
  
  // Callback para game over
  window.globalTimer.onTimeUp(window.showGameOver);
  
  // Marcar como configurado para evitar duplicaciones
  window.globalTimer.callbacksConfigured = true;
}
