document.addEventListener('DOMContentLoaded', () => {
    // --- TIMER GLOBAL ---
    function startTimer() {
        const timerDisplay = document.getElementById('timer');
        const gameOverOverlay = document.getElementById('game-over-overlay');
        const gameOverVideo = document.getElementById('game-over-video');
        let timerInterval;

        // Inicializa endTime si no existe (30 minutos)
        if (!localStorage.getItem('endTime')) {
            const endTime = Date.now() + 30 * 60 * 1000;
            localStorage.setItem('endTime', endTime);
        }
        const endTime = parseInt(localStorage.getItem('endTime'), 10);

        function updateTimer() {
            const remainingTime = endTime - Date.now();
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                localStorage.removeItem('endTime');
                if (gameOverOverlay) gameOverOverlay.classList.remove('oculto');
                if (gameOverVideo) gameOverVideo.play();
                if (timerDisplay) timerDisplay.textContent = "0:00";
                return;
            }
            const minutes = Math.floor((remainingTime / 1000) / 60);
            const seconds = Math.floor((remainingTime / 1000) % 60);
            if (timerDisplay) timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    }
    if (document.getElementById('timer')) {
        startTimer();
    }

    // --- ENVIAR PARTIDA ---
    function enviarPartida(gameData) {
        fetch('/controller/guardarPartida.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('¡Partida guardada con éxito!');
                // Aquí puedes redirigir o mostrar pantalla de victoria
            } else {
                alert('Error: ' + data.mensaje);
            }
        })
        .catch(() => {
            alert('Error de conexión con el servidor.');
        });
    }

    // Ejemplo de cómo llamar a enviarPartida cuando el usuario termina la partida:
    // const gameData = {
    //     id_prueba: 3,
    //     modo_juego: 'puntos', // o 'tiempo'
    //     pistas_usadas: 2,
    //     resultado: 1, // 1 para éxito, 0 para fallo
    //     puntuacion_final: 100, // si modo_juego es 'puntos'
    //     tiempo_restante_final: null // si modo_juego es 'tiempo'
    // };
    // enviarPartida(gameData);

    // --- CARGAR RANKING ---
    function cargarRanking() {
        fetch('/controller/obtenerRanking.php')
            .then(res => res.json())
            .then(data => {
                const tbody = document.getElementById('ranking-body');
                if (!tbody) return;
                tbody.innerHTML = '';
                if (data.success && data.ranking) {
                    // Ranking por puntuación
                    if (data.ranking.score && data.ranking.score.length > 0) {
                        data.ranking.score.forEach((item, i) => {
                            tbody.innerHTML += `<tr>
                                <td>${i+1}</td>
                                <td>${item.jugador}</td>
                                <td>${item.valor} pts</td>
                            </tr>`;
                        });
                    }
                    // Separador y ranking por tiempo
                    if (data.ranking.time && data.ranking.time.length > 0) {
                        tbody.innerHTML += `<tr><td colspan="3" style="text-align:center;font-weight:bold;">--- Ranking por Tiempo ---</td></tr>`;
                        data.ranking.time.forEach((item, i) => {
                            tbody.innerHTML += `<tr>
                                <td>${i+1}</td>
                                <td>${item.jugador}</td>
                                <td>${item.valor} s</td>
                            </tr>`;
                        });
                    }
                } else {
                    tbody.innerHTML = `<tr><td colspan="3">No hay datos de ranking.</td></tr>`;
                }
            })
            .catch(() => {
                const tbody = document.getElementById('ranking-body');
                if (tbody) tbody.innerHTML = `<tr><td colspan="3">Error de conexión al cargar el ranking.</td></tr>`;
            });
    }

    // --- EVENTOS DE BOTONES ---
    const btnRanking = document.getElementById('btn-ranking');
    const modalRanking = document.getElementById('modal-ranking');
    if (btnRanking && modalRanking) {
        btnRanking.addEventListener('click', () => {
            cargarRanking();
            modalRanking.classList.add('visible');
        });
    }


    // Funcionalidad de los discos (existente)
    const obtenerValorDisco3 = (angulo) => {
        const valoresDisco3 = {
            15: 1, 45: 2, 75: 3, 105: 4, 135: 5, 165: 6,
            195: 7, 225: 8, 255: 9, 285: 10, 315: 11, 345: 12
        };
        const tolerancia = 5;

        for (const grados in valoresDisco3) {
            const gradosNum = parseInt(grados);
            const anguloNormalizado = (angulo % 360 + 360) % 360;

            if (anguloNormalizado >= gradosNum - tolerancia && anguloNormalizado <= gradosNum + tolerancia) {
                return valoresDisco3[grados];
            }
        }
        return 0; // Valor por defecto si no coincide
    };

    const obtenerValorDisco2 = (angulo) => {
        const valoresDisco2 = {
            0: 1, 22.5: 2, 45: 12, 67.5: 4, 90: 5, 112.5: 6,
            135: 7, 157.5: 11, 180: 9, 202.5: 3, 225: 14, 247.5: 8,
            270: 15, 292.5: 0, 315: 10, 337.5: 13
        };
        const tolerancia = 5;

        for (const grados in valoresDisco2) {
            const gradosNum = parseFloat(grados);
            const anguloNormalizado = (angulo % 360 + 360) % 360;

            if (anguloNormalizado >= gradosNum - tolerancia && anguloNormalizado <= gradosNum + tolerancia) {
                return valoresDisco2[grados];
            }
        }
        return 0; // Valor por defecto si no coincide
    };

    const obtenerValorDisco1 = (angulo) => {
        const valoresDisco1 = {
            0: 13, 13.85: 14, 27.7: 15, 41.55: 16, 55.4: 17, 69.25: 18,
            83.1: 19, 96.95: 20, 110.8: 21, 125.65: 22, 138.5: 23, 152.35: 24,
            166.2: 25, 180.05: 26, 193.9: 1, 207.75: 2, 221.6: 3, 235.45: 4,
            249.3: 5, 263.15: 6, 277: 7, 290.85: 8, 304.7: 9, 318.55: 10,
            332.4: 11, 346.25: 12
        };
        const tolerancia = 5;

        for (const grados in valoresDisco1) {
            const gradosNum = parseFloat(grados);
            const anguloNormalizado = (angulo % 360 + 360) % 360;

            if (anguloNormalizado >= gradosNum - tolerancia && anguloNormalizado <= gradosNum + tolerancia) {
                return valoresDisco1[grados];
            }
        }
        return 0; // Valor por defecto si no coincide
    };

    discos.forEach(disco => {
        disco.addEventListener('mousedown', (e) => {
            if (discoActivo === disco) {
                discoActivo = null;
                return;
            }

            discoActivo = disco;
            const rect = disco.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const startX = e.clientX - centerX;
            const startY = e.clientY - centerY;
            const startAngle = Math.atan2(startY, startX) * (180 / Math.PI);
            const currentAngle = angulos[disco.id];

            document.onmousemove = (e) => {
                if (discoActivo !== disco) return;

                const moveX = e.clientX - centerX;
                const moveY = e.clientY - centerY;
                const angle = Math.atan2(moveY, moveX) * (180 / Math.PI);
                let rotation = angle - startAngle;
                angulos[disco.id] = (currentAngle + rotation) % 360;
                disco.style.transform = `rotate(${angulos[disco.id]}deg)`;
            };
        });
    });

    botonComprobar.addEventListener('click', () => {
        const correctAnswers = {
            primero: "10",
            segundo: "25",
            tercero: "26",
            cuarto: "17",
            quinto: "5",
            sexto: "32"
        };

        const userAnswers = {
            primero: document.getElementById('primero').value,
            segundo: document.getElementById('segundo').value,
            tercero: document.getElementById('tercero').value,
            cuarto: document.getElementById('cuarto').value,
            quinto: document.getElementById('quinto').value,
            sexto: document.getElementById('sexto').value
        };

        const feedbackMessage = document.getElementById('feedback-message');
        let allCorrect = true;
        let wrongPosition = false;

        const correctValues = Object.values(correctAnswers);

        for (const id in userAnswers) {
            const input = document.getElementById(id);
            const userAnswer = userAnswers[id];

            input.classList.remove('error', 'wrong-position');

            if (correctAnswers[id] !== userAnswer) {
                allCorrect = false;
                if (correctValues.includes(userAnswer)) {
                    input.classList.add('wrong-position');
                    wrongPosition = true;
                } else {
                    input.classList.add('error');
                }
            }
        }

        if (allCorrect) {
            const victoryScreen = document.getElementById('victory-screen');
            const currentScene = document.querySelector('.pantalla.visible');
            if (currentScene) {
                currentScene.classList.remove('visible');
                currentScene.classList.add('oculto');
            }
            victoryScreen.classList.remove('oculto');
            victoryScreen.classList.add('visible');
            document.getElementById('victory-video').play();
            localStorage.removeItem('endTime'); // Clear the timer on victory

            // Hide other elements like score/timer containers
            document.getElementById('score-container').style.display = 'none';
            document.getElementById('timer-container').style.display = 'none';
            document.querySelector('.esquina-superior-derecha').style.display = 'none';
            document.querySelector('.esquina-superior-izquierda').style.display = 'none';

            // Add event listeners for victory buttons
            document.getElementById('btn-play-again').addEventListener('click', () => {
                window.location.href = '../juego.php';
            });

            document.getElementById('btn-exit').addEventListener('click', () => {
                window.close(); // Attempt to close the window
                // Fallback for browsers that prevent window.close()
                window.location.href = 'about:blank';
            });

        } else if (wrongPosition) {
            feedbackMessage.textContent = 'Algunos números son correctos pero no están en la posición adecuada.';
        } else {
            feedbackMessage.textContent = 'Algunos números son incorrectos. Inténtalo de nuevo.';
        }
    });

    botonObtenerCoordenadas.addEventListener('click', () => {
        const valorDisco3 = obtenerValorDisco3(angulos.disco3);
        const valorDisco2 = obtenerValorDisco2(angulos.disco2);
        const valorDisco1 = obtenerValorDisco1(angulos.disco1);
        const valorTotal = valorDisco1 + valorDisco2 + valorDisco3;
        valorDisplay.textContent = valorTotal;
        valorDisplay.style.visibility = 'visible';
    });
});

fetch('/controller/guardarPartida.php', {
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