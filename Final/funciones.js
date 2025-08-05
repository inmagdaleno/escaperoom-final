        document.addEventListener("DOMContentLoaded", function() {
            
            // LIMPIEZA AGRESIVA AL CARGAR LA PÁGINA
            const cleanupElements = [
                'pista-explicacion',
                'feedback-pista'
            ];
            
            cleanupElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = "";
                    element.innerHTML = "";
                    element.style.cssText = "";
                    element.removeAttribute('style');
                    element.className = element.className.replace(/success|error|warning/g, '');
                }
            });
            
            // Limpiar localStorage relacionado con pistas si es necesario
            const pistaKeys = Object.keys(localStorage).filter(key => key.includes('pista'));
            pistaKeys.forEach(key => {
                localStorage.removeItem(key);
            });
            
            // OVERRIDE DE FUNCIONES GLOBALES QUE PUEDEN INTERFERIR
            // Desactivar la función openOverlayModal global para este modal específico
            const originalOpenOverlayModal = window.openOverlayModal;
            window.openOverlayModal = function(modal) {
                const modalPista = document.getElementById('modal-pista');
                if (modal === modalPista) {
                    return; // No hacer nada, usar nuestro sistema local
                }
                // Para otros modales, usar la función original
                if (originalOpenOverlayModal) {
                    return originalOpenOverlayModal(modal);
                }
            };
            
    // Elementos de la interfaz
    const scoreDisplay = document.getElementById("score");
    const timerDisplay = document.getElementById("timer");

    // Estado del juego (recuperar de localStorage)
    let gameMode = localStorage.getItem('gameMode') || 'score';
    let score = parseInt(localStorage.getItem('score')) || 400;
    let totalPistasUsadas = parseInt(localStorage.getItem('totalPistasUsadas')) || 0; // Mover aquí para scope global

    // Inicializar tiempo de inicio del juego si no existe
    if (!localStorage.getItem('gameStartTime')) {
        localStorage.setItem('gameStartTime', Date.now());
    }

    // Asegurar que el game-over-overlay esté oculto al iniciar
    const gameOverOverlay = document.getElementById('game-over-overlay');
    if (gameOverOverlay) {
        gameOverOverlay.classList.add('oculto');
        gameOverOverlay.style.display = 'none';
    }

    // Asegurar que la pantalla de victoria esté oculta al iniciar
    const victoryScreen = document.getElementById('victory-screen');
    if (victoryScreen) {
        victoryScreen.classList.remove('visible');
        victoryScreen.classList.add('oculto');
        const victoryVideo = document.getElementById('victory-video');
        if (victoryVideo) {
            victoryVideo.pause();
        }
    }

    // Asegurar que la escena final esté visible al iniciar
    const escenaFinal = document.getElementById('escena-final');
    if (escenaFinal) {
        escenaFinal.classList.remove('oculto');
        escenaFinal.classList.add('visible');
    }

    // Inicializar displays
    if (gameMode === 'score') {
        document.getElementById("score-container").style.display = "block";
        document.getElementById("timer-container").style.display = "none";
        if (scoreDisplay) scoreDisplay.textContent = score;
    } else if (gameMode === 'time') {
        document.getElementById("score-container").style.display = "none";
        document.getElementById("timer-container").style.display = "block";
        
        // El timer global ya debería estar funcionando
        if (window.globalTimer) {
            const currentTime = window.globalTimer.getTimeLeft();
            if (currentTime > 0) {
                window.updateAllTimerDisplays(currentTime);
            }
        }
    }

        // Small delay to ensure all elements are rendered
        setTimeout(() => {
            
            // --- MODALES Y EVENTOS ---
            
            // Modal de Perfil
            const modalPerfil = document.getElementById('modal-perfil');
            const btnPerfil = document.getElementById('btn-perfil');
            
            if (btnPerfil && modalPerfil) {
                btnPerfil.addEventListener('click', (e) => {
                    e.preventDefault();
                    cargarPerfil();
                    modalPerfil.style.display = 'flex';
                    modalPerfil.classList.add('show');
                });
            }

            // Modal de Ranking
            const modalRanking = document.getElementById('modal-ranking');
            const btnRanking = document.getElementById('btn-ranking');
            
            if (btnRanking && modalRanking) {
                btnRanking.addEventListener('click', (e) => {
                    e.preventDefault();
                    cargarRanking();
                    modalRanking.style.display = 'flex';
                    modalRanking.classList.add('show');
                });
            }

            // Modal de Pista Extra

            // Modal de Pista Extra
            const modalPista = document.getElementById('modal-pista');
            const btnPistaExtra = document.getElementById('btn-pista-extra');
            const cerrarModalPista = document.getElementById('cerrar-modal-pista');
            const pistaExplicacion = document.getElementById('pista-explicacion');
            const feedbackPista = document.getElementById('feedback-pista');
            const btnConfirmarPista = document.getElementById('btn-confirmar-pista');
            const btnDescartarPista = document.getElementById('btn-descartar-pista');

            // Variables para el sistema de pistas
            let pistasUsadasPortal = 0;
            // totalPistasUsadas ya está definida en el scope global

            if (btnPistaExtra && modalPista) {
                btnPistaExtra.addEventListener('click', function() {
                    
                    // Limpieza completa del estado previo
                    for (let i = 1; i < 9999; i++) window.clearTimeout(i);
                    for (let i = 1; i < 9999; i++) window.clearInterval(i);
                    
                    // Limpiar el feedbackPista completamente
                    if (feedbackPista) {
                        feedbackPista.textContent = "";
                        feedbackPista.innerHTML = "";
                        feedbackPista.classList.remove('success', 'error', 'warning');
                        feedbackPista.style.cssText = "";
                        feedbackPista.removeAttribute('style');
                    }
                    
                    // Reset del estado del modal
                    if (modalPista) {
                        modalPista.style.display = "none";
                    }
                    
                    // Ejecutar pedirPista con un ligero delay
                    setTimeout(() => {
                        pedirPista();
                    }, 50);
                });
            }

            if (cerrarModalPista) {
                cerrarModalPista.addEventListener('click', () => {
                    modalPista.style.display = 'none';
                    modalPista.classList.remove('show');
                });
            }

            if (btnConfirmarPista) {
                btnConfirmarPista.addEventListener('click', () => {
                    confirmarPista();
                });
            }

            if (btnDescartarPista) {
                btnDescartarPista.addEventListener('click', () => {
                    descartarPista();
                });
            }

            // Funciones para el sistema de pistas
            function pedirPista() {
                
                // Limpiar cualquier estado previo de forma agresiva
                if (feedbackPista) {
                    feedbackPista.textContent = "";
                    feedbackPista.innerHTML = "";
                    feedbackPista.classList.remove('success', 'error', 'warning');
                    feedbackPista.style.color = "";
                    feedbackPista.style.display = "none";
                }

                // Limpiar cualquier timeout que pueda estar ejecutándose
                for (let i = 1; i < 9999; i++) window.clearTimeout(i);

                if (pistasUsadasPortal < 2) { // Permitir hasta 2 pistas visuales
                    
                    // Mostrar el modal de confirmación de pista
                    if (modalPista) {
                        modalPista.style.display = "flex";
                    }

                    if (pistaExplicacion) {
                        let explanationText = "";
                        if (gameMode === 'time') {
                            if (pistasUsadasPortal === 0) {
                                explanationText = `Para este acertijo dispones de 2 pistas visuales. Esta es la primera pista y su uso supondrá una penalización de 2 minutos que se descontarán a tu marcador.`;
                            } else {
                                explanationText = `Esta es la segunda y última pista visual. Su uso supondrá una penalización de 3 minutos que se descontarán a tu marcador.`;
                            }
                        } else if (gameMode === 'score') {
                            if (pistasUsadasPortal === 0) {
                                explanationText = `Para este acertijo dispones de 2 pistas visuales. Esta es la primera pista y su uso supondrá una penalización de 25 puntos en tu puntuación.`;
                            } else {
                                explanationText = `Esta es la segunda y última pista visual. Su uso supondrá una penalización de 30 puntos en tu puntuación.`;
                            }
                        }
                        pistaExplicacion.textContent = explanationText;
                    }

                    // Mostrar los botones de confirmación/descarte
                    if (btnConfirmarPista) {
                        btnConfirmarPista.style.display = "inline-block";
                    }
                    if (btnDescartarPista) {
                        btnDescartarPista.style.display = "inline-block";
                    }

                } else {
                    if (feedbackPista) {
                        feedbackPista.textContent = "Ya has usado todas las pistas para esta prueba.";
                        feedbackPista.style.display = "block";
                    }
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

                // Aplicar penalización según la pista (primera o segunda)
                let penaltyScore = pistasUsadasPortal === 0 ? 25 : 30; // 25 puntos primera, 30 segunda
                let penaltyTime = pistasUsadasPortal === 0 ? 120 : 180; // 2 minutos primera, 3 minutos segunda

                if (gameMode === 'score') {
                    score -= penaltyScore;
                    localStorage.setItem('score', score);
                    if (scoreDisplay) scoreDisplay.textContent = score;
                } else if (gameMode === 'time') {
                    // Usar el timer global para aplicar la penalización
                    if (window.globalTimer) {
                        window.globalTimer.applyPenalty(penaltyTime);
                    }
                }

                pistasUsadasPortal++;
                totalPistasUsadas++;
                localStorage.setItem('totalPistasUsadas', totalPistasUsadas);

                // Mostrar feedback de penalización
                if (feedbackPista) {
                    if (gameMode === 'time') {
                        const minutos = pistasUsadasPortal === 1 ? 2 : 3;
                        feedbackPista.textContent = `¡Has usado una pista! Se han descontado ${minutos} minutos de tu tiempo.`;
                    } else {
                        const puntos = pistasUsadasPortal === 1 ? 25 : 30;
                        feedbackPista.textContent = `¡Has usado una pista! Se han descontado ${puntos} puntos de tu puntuación.`;
                    }
                    feedbackPista.classList.remove('success', 'error');
                    feedbackPista.classList.add('warning');
                }

                // Cerrar el modal de confirmación y mostrar la imagen
                setTimeout(() => {
                    if (modalPista) {
                        modalPista.style.display = 'none';
                        modalPista.classList.add('oculto');
                    }
                    if (feedbackPista) feedbackPista.textContent = '';
                    
                    // Cambiar la imagen según la pista usada
                    const imgPistaExtra = document.getElementById('img-pista-extra');
                    if (imgPistaExtra) {
                        if (pistasUsadasPortal === 1) {
                            imgPistaExtra.src = 'img/pergamino-f1.webp';
                        } else {
                            imgPistaExtra.src = 'img/pergamino-f2.webp';
                        }
                    }
                    
                    // Mostrar modal de imagen
                    const modalPistaImagen = document.getElementById('modal-pista-imagen');
                    if (modalPistaImagen) {
                        modalPistaImagen.style.display = 'flex';
                        modalPistaImagen.classList.remove('oculto');
                        document.body.style.overflow = 'hidden';
                    }
                }, 1200);
            }

            function descartarPista() {
                // Cerrar el modal sin aplicar penalización
                if (modalPista) {
                    modalPista.style.display = "none";
                    modalPista.classList.remove('show');
                }
            }

            // Modal de imagen de pista
            const modalPistaImagen = document.getElementById('modal-pista-imagen');
            const btnCerrarPistaImagen = document.getElementById('btn-cerrar-pista-imagen');
            const cerrarModalPistaImagen = document.getElementById('cerrar-modal-pista-imagen');

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

            // Botón de cerrar sesión
            const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
            if (btnCerrarSesion) {
                btnCerrarSesion.addEventListener('click', () => {
                    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                        localStorage.clear();
                        window.location.href = '../admin/login.php';
                    }
                });
            }

            // Cerrar modales
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('cerrar')) {
                    const modal = e.target.closest('.modal-overlay');
                    if (modal) {
                        modal.style.display = 'none';
                        modal.classList.remove('show');
                    }
                }
            });

            // También manejar clicks fuera del modal para cerrar
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    e.target.style.display = 'none';
                    e.target.classList.remove('show');
                }
            });
        }, 100); // Small delay

    // Función para cargar ranking
    function cargarRanking() {
        fetch('../controller/obtenerRanking.php')
            .then(res => res.json())
            .then(data => {
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

    // --- NAVEGACIÓN ---
    const btnVolverAtras = document.getElementById("btn-volver-atras");
    const btnIrAdelante = document.getElementById("btn-ir-adelante");

    // Botón "Volver Atrás"
    if (btnVolverAtras) {
        btnVolverAtras.addEventListener("click", () => {
            // Volver al mapa en la escena-mapa (escena anterior)
            localStorage.setItem('mapaEscena', 'escena-mapa');
            window.location.href = "../mapa/mapa.php";
        });
    }

    // Botón "Ir Adelante" 
    if (btnIrAdelante) {
        btnIrAdelante.addEventListener("click", () => {
            // Simular la animación dorada primero
            const inputs = ['primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto'];
            const correctAnswers = ["24", "2", "13", "1", "25", "20"];
            
            // Llenar los inputs con los valores correctos
            inputs.forEach((id, index) => {
                const input = document.getElementById(id);
                if (input) {
                    input.value = correctAnswers[index];
                    // Limpiar clases anteriores
                    input.classList.remove('error', 'wrong-position', 'correct');
                }
            });

            // Aplicar la animación dorada con delay
            setTimeout(() => {
                inputs.forEach(id => {
                    const input = document.getElementById(id);
                    if (input) {
                        input.classList.add('correct');
                    }
                });

                // Mostrar feedback de éxito
                const feedbackMessage = document.getElementById('feedback-message');
                if (feedbackMessage) {
                    feedbackMessage.textContent = '¡Perfecto! Todas las coordenadas son correctas.';
                    feedbackMessage.style.color = '#4CAF50';
                }
            }, 100);

            // Después de la animación, mostrar pantalla de victoria
            setTimeout(() => {
                const victoryScreen = document.getElementById('victory-screen');
                const currentScene = document.querySelector('.pantalla.visible');
                if (currentScene) {
                    currentScene.classList.remove('visible');
                    currentScene.classList.add('oculto');
                }
                victoryScreen.classList.remove('oculto');
                victoryScreen.classList.add('visible');
                document.getElementById('victory-video').play();
                
                // Ocultar elementos de la interfaz
                document.getElementById('score-container').style.display = 'none';
                document.getElementById('timer-container').style.display = 'none';
                document.querySelector('.esquina-superior-derecha').style.display = 'none';
                document.querySelector('.esquina-superior-izquierda').style.display = 'none';
            }, 6000); // Esperar 6 segundos para ver la nueva animación dorada
        });
    }

    // --- BOTÓN CONTINUAR PORTAL ---
    const btnIrPortal = document.getElementById("btn-ir-portal");
    if (btnIrPortal) {
        btnIrPortal.addEventListener("click", () => {
            // Cambiar de escena-final a escena-discos con transición suave
            const escenaFinal = document.getElementById('escena-final');
            const escenaDiscos = document.getElementById('escena-discos');
            
            if (escenaFinal && escenaDiscos) {
                // Fade out de la escena final
                escenaFinal.style.opacity = '0';
                escenaFinal.style.transition = 'opacity 0.3s ease-in-out';
                
                setTimeout(() => {
                    escenaFinal.classList.remove('visible');
                    escenaFinal.classList.add('oculto');
                    escenaDiscos.classList.remove('oculto');
                    escenaDiscos.classList.add('visible');
                    
                    // Fade in de la escena de discos
                    escenaDiscos.style.opacity = '0';
                    setTimeout(() => {
                        escenaDiscos.style.opacity = '1';
                        escenaDiscos.style.transition = 'opacity 0.3s ease-in-out';
                    }, 50);
                }, 300);
            }
        });
    }

    // Botón restart del game over
    document.getElementById('btn-restart').addEventListener('click', () => {
        localStorage.removeItem('endTime');
        window.location.href = '/escaperoom/juego.php';
    });

    // --- BOTONES DE PANTALLA DE VICTORIA ---
    // Botón "Jugar otra vez" - redirige a la pantalla de selección de modo de juego
    document.getElementById('btn-play-again').addEventListener('click', () => {
        // Limpiar datos de la partida
        localStorage.removeItem('endTime');
        localStorage.removeItem('gameStartTime');
        localStorage.removeItem('totalPistasUsadas');
        localStorage.removeItem('gameMode');
        localStorage.removeItem('score');
        localStorage.removeItem('mapaEscena');
        // Redirigir a la pantalla de selección de modo de juego
        window.location.href = '/escaperoom/juego.php';
    });

    // Botón "Salir" - simula salir del juego
    document.getElementById('btn-exit').addEventListener('click', () => {
        // Limpiar datos de la partida
        localStorage.removeItem('endTime');
        localStorage.removeItem('gameStartTime');
        localStorage.removeItem('totalPistasUsadas');
        localStorage.removeItem('gameMode');
        localStorage.removeItem('score');
        localStorage.removeItem('mapaEscena');
        
        // Intentar cerrar la ventana (funciona si fue abierta por JavaScript)
        if (window.opener) {
            window.close();
        } else {
            // Fallback: redirigir a una página de salida o cerrar sesión
            if (confirm('¿Quieres cerrar sesión y salir del juego?')) {
                window.location.href = '../admin/logout.php';
            }
        }
    });

    // --- ENVIAR PARTIDA ---
    function enviarPartida(gameData) {
        fetch('../controller/guardarPartida.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameData),
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Partida guardada exitosamente
            } else {
                console.error('Error al guardar partida:', data.mensaje);
                // Opcionalmente mostrar un mensaje discreto en la pantalla
            }
        })
        .catch((error) => {
            console.error('❌ Error de conexión al guardar partida:', error);
            console.error('❌ Stack trace:', error.stack); // Debug temporal
            // Fallar silenciosamente para no interrumpir la experiencia del usuario
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

    // Obtener referencias a los discos después de que se cargue el DOM
    const discos = document.querySelectorAll('.disco');
    const botonComprobar = document.getElementById('comprobar');
    const botonObtenerCoordenadas = document.getElementById('obtenerCoordenadas');
    const valorDisplay = document.querySelector('.valor-display');
    const feedbackMessage = document.getElementById('feedback-message');
    
    // Variables para el drag & drop
    let arrastrando = false;
    let discoActual = null;
    let centroX, centroY;
    let anguloInicial, anguloInicialDisco;
    
    // Ángulos actuales de cada disco
    const angulos = {
        disco1: 0,
        disco2: 0,
        disco3: 0
    };
    
    // Configurar eventos para los discos una vez que se han cargado
    discos.forEach((disco, index) => {
        disco.addEventListener('mousedown', function(e) {
            if (e.button === 0) { // Left click
                arrastrando = true;
                discoActual = index;
                disco.classList.add('dragging');
                let rect = disco.getBoundingClientRect();
                centroX = rect.left + rect.width / 2;
                centroY = rect.top + rect.height / 2;
                anguloInicial = Math.atan2(e.clientY - centroY, e.clientX - centroX);
                anguloInicialDisco = angulos['disco' + (index + 1)];
                e.preventDefault();
            }
        });
        
        // Eventos táctiles para dispositivos móviles
        disco.addEventListener('touchstart', function(e) {
            arrastrando = true;
            discoActual = index;
            disco.classList.add('dragging');
            let rect = disco.getBoundingClientRect();
            centroX = rect.left + rect.width / 2;
            centroY = rect.top + rect.height / 2;
            const touch = e.touches[0];
            anguloInicial = Math.atan2(touch.clientY - centroY, touch.clientX - centroX);
            anguloInicialDisco = angulos['disco' + (index + 1)];
            e.preventDefault();
        });
    });
    
    // Eventos globales de mouse para el arrastre
    document.addEventListener('mousemove', function(e) {
        if (arrastrando && discoActual !== null) {
            const anguloActual = Math.atan2(e.clientY - centroY, e.clientX - centroX);
            const diferencia = anguloActual - anguloInicial;
            const nuevoAngulo = anguloInicialDisco + diferencia;
            
            // Convertir radianes a grados
            const grados = (nuevoAngulo * 180 / Math.PI + 360) % 360;
            angulos['disco' + (discoActual + 1)] = grados;
            
            // Aplicar la rotación al disco
            const disco = discos[discoActual];
            disco.style.transform = `rotate(${grados}deg)`;
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (arrastrando) {
            // Remover la clase dragging del disco actual
            if (discoActual !== null && discos[discoActual]) {
                discos[discoActual].classList.remove('dragging');
            }
            arrastrando = false;
            discoActual = null;
        }
    });
    
    // Eventos globales táctiles para dispositivos móviles
    document.addEventListener('touchmove', function(e) {
        if (arrastrando && discoActual !== null) {
            const touch = e.touches[0];
            const anguloActual = Math.atan2(touch.clientY - centroY, touch.clientX - centroX);
            const diferencia = anguloActual - anguloInicial;
            const nuevoAngulo = anguloInicialDisco + diferencia;
            
            // Convertir radianes a grados
            const grados = (nuevoAngulo * 180 / Math.PI + 360) % 360;
            angulos['disco' + (discoActual + 1)] = grados;
            
            // Aplicar la rotación al disco
            const disco = discos[discoActual];
            disco.style.transform = `rotate(${grados}deg)`;
            e.preventDefault();
        }
    });
    
    document.addEventListener('touchend', function() {
        if (arrastrando) {
            // Remover la clase dragging del disco actual
            if (discoActual !== null && discos[discoActual]) {
                discos[discoActual].classList.remove('dragging');
            }
            arrastrando = false;
            discoActual = null;
        }
    });

    botonComprobar.addEventListener('click', () => {
        const correctAnswers = {
            primero: "24",
            segundo: "2",
            tercero: "13",
            cuarto: "1",
            quinto: "25",
            sexto: "20"
        };

        const userAnswers = {
            primero: document.getElementById('primero').value,
            segundo: document.getElementById('segundo').value,
            tercero: document.getElementById('tercero').value,
            cuarto: document.getElementById('cuarto').value,
            quinto: document.getElementById('quinto').value,
            sexto: document.getElementById('sexto').value
        };

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
            // Primero aplicar la clase correct a todos los inputs para la animación prolongada
            for (const id in userAnswers) {
                const input = document.getElementById(id);
                input.classList.add('correct');
            }
            
            // Mostrar mensaje de éxito
            const feedbackMessage = document.getElementById('feedback-message');
            if (feedbackMessage) {
                feedbackMessage.textContent = '¡Perfecto! Todas las coordenadas son correctas.';
                feedbackMessage.style.color = '#4CAF50';
            }
            
            // Detener el timer
            if (window.globalTimer) {
                window.globalTimer.stop();
            }
            
            // Guardar la partida completada
            const gameStartTime = parseInt(localStorage.getItem('gameStartTime')) || Date.now();
            const gameEndTime = Date.now();
            const tiempoEmpleado = Math.floor((gameEndTime - gameStartTime) / 1000); // en segundos
            
            let puntuacionFinal = null;
            let tiempoRestanteFinal = null;
            
            if (gameMode === 'score') {
                puntuacionFinal = score;
            } else if (gameMode === 'time') {
                // Obtener tiempo restante del timer global
                tiempoRestanteFinal = window.globalTimer ? window.globalTimer.getTimeLeft() : 0;
            }
            
            const gameData = {
                id_prueba: 5, // ID para la prueba final del portal
                tiempo_empleado: tiempoEmpleado,
                pistas_usadas: totalPistasUsadas,
                puntuacion_final: puntuacionFinal,
                resultado: 1, // 1 para éxito (completada)
                modo_juego: gameMode === 'score' ? 'puntos' : 'tiempo',
                tiempo_restante_final: tiempoRestanteFinal
            };
            
            enviarPartida(gameData);
            
            // Esperar a que la animación de los inputs se vea (6 segundos para mostrar mejor la animación dorada)
            setTimeout(() => {
                const victoryScreen = document.getElementById('victory-screen');
                const currentScene = document.querySelector('.pantalla.visible');
                
                if (currentScene) {
                    // Aplicar el efecto de disolución
                    currentScene.classList.add('dissolving');
                    
                    // Después de la disolución, cambiar a la pantalla de victoria
                    setTimeout(() => {
                        currentScene.classList.remove('visible', 'dissolving');
                        currentScene.classList.add('oculto');
                        
                        victoryScreen.classList.remove('oculto');
                        victoryScreen.classList.add('visible');
                        document.getElementById('victory-video').play();
                        
                        // Hide other elements like score/timer containers
                        document.getElementById('score-container').style.display = 'none';
                        document.getElementById('timer-container').style.display = 'none';
                        document.querySelector('.esquina-superior-derecha').style.display = 'none';
                        document.querySelector('.esquina-superior-izquierda').style.display = 'none';
                    }, 2000); // Duración de la animación de disolución
                } else {
                    // Fallback si no hay escena actual
                    victoryScreen.classList.remove('oculto');
                    victoryScreen.classList.add('visible');
                    document.getElementById('victory-video').play();
                    
                    // Hide other elements like score/timer containers
                    document.getElementById('score-container').style.display = 'none';
                    document.getElementById('timer-container').style.display = 'none';
                    document.querySelector('.esquina-superior-derecha').style.display = 'none';
                    document.querySelector('.esquina-superior-izquierda').style.display = 'none';
                }
                
                localStorage.removeItem('endTime'); // Clear the timer on victory
            }, 6000); // Esperar 6 segundos para ver la animación de los inputs

        } else if (wrongPosition) {
            feedbackMessage.textContent = 'Algunos números son correctos pero no están en la posición adecuada.';
        } else {
            feedbackMessage.textContent = 'Algunos números son incorrectos. Inténtalo de nuevo.';
        }
    });

    botonObtenerCoordenadas.addEventListener('click', () => {
        // Usar las funciones ya definidas para obtener el valor más cercano
        const valorDisco1 = obtenerValorDisco1(angulos.disco1);
        const valorDisco2 = obtenerValorDisco2(angulos.disco2);
        const valorDisco3 = obtenerValorDisco3(angulos.disco3);
        const valorTotal = valorDisco1 + valorDisco2 + valorDisco3;
        if (valorDisplay) {
            valorDisplay.textContent = valorTotal;
            valorDisplay.style.visibility = 'visible';
        }
    });

    // --- MANEJO DE PERFIL ---
    const formPerfil = document.getElementById('form-perfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', (e) => {
            e.preventDefault();
            guardarPerfil();
        });
    }

    // Botón para editar perfil
    const btnEditarPerfil = document.getElementById('btn-editar-perfil');
    if (btnEditarPerfil) {
        btnEditarPerfil.addEventListener('click', () => {
            mostrarVistaEdicion();
        });
    }

    // Botón para cancelar edición
    const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');
    if (btnCancelarEdicion) {
        btnCancelarEdicion.addEventListener('click', () => {
            mostrarVistaVisualizacion();
        });
    }

    // Funcionalidad básica para cambio de imagen de perfil
    const btnCambiarImg = document.getElementById('btn-cambiar-img');
    const inputPerfilImg = document.getElementById('input-perfil-img');
    const perfilImgPreview = document.getElementById('perfil-img-preview');
    const perfilImgDisplay = document.getElementById('perfil-img-display');

    if (btnCambiarImg && inputPerfilImg) {
        btnCambiarImg.addEventListener('click', () => {
            inputPerfilImg.click();
        });

        inputPerfilImg.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageSrc = e.target.result;
                    if (perfilImgPreview) perfilImgPreview.src = imageSrc;
                    if (perfilImgDisplay) perfilImgDisplay.src = imageSrc;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});