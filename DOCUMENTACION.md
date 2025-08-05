# Documentación del Proyecto Escape Room

## 1. Arquitectura del sistema
El sistema está basado en una arquitectura web cliente-servidor:
- **Frontend:** HTML, CSS y JavaScript para la interfaz de usuario y lógica interactiva de los juegos.
- **Backend:** PHP para la gestión de usuarios, lógica de juego, administración y comunicación con la base de datos.
- **Base de datos:** MySQL, utilizada para almacenar usuarios, partidas, rankings y otros datos persistentes.
- **Servidor:** Apache (XAMPP recomendado para desarrollo local).

## 2. Diagrama de la base de datos
La base de datos principal incluye las siguientes tablas:
- **usuarios**: id, nombre, email, password, fecha_registro
- **partidas**: id, id_usuario, modo_juego, puntuacion_final, tiempo_empleado, pistas_usadas, resultado, fecha.
- **ranking**: id, id_usuario, valor, tipo (score/time)
- **otros**: tablas auxiliares para pistas, logs, etc.

```
+-----------+      +-----------+      +---------+
| usuarios  |<-----| partidas  |----->| ranking |
+-----------+      +-----------+      +---------+
```

## 3. Explicación de las principales funciones PHP
- **config/database.php**: Configuración de conexión a la base de datos MySQL.
- **controller/usuarioController.php**: Registro, login, verificación y gestión de usuarios.
- **controller/guardarPartida.php**: Guarda los datos de la partida al finalizar el juego.
- **controller/obtenerRanking.php**: Devuelve el ranking de usuarios por puntos y tiempo.
- **admin/login.php, logout.php, restablecer.php, verificar.php**: Gestión de autenticación y recuperación de cuentas.
- **data/enviarCorreos.php**: Envío de correos para verificación y recuperación usando PHPMailer.

## 4. Descripción de la estructura de archivos
- **/admin/**: Archivos de administración y autenticación.
- **/config/**: Configuración global y conexión a la base de datos.
- **/controller/**: Lógica de negocio y endpoints PHP.
- **/css/**: Estilos globales y específicos de cada juego.
- **/data/**: Acceso a la base de datos y utilidades (PHPMailer, etc).
- **/Final/**: Juego final del portal, lógica JS, estilos, imágenes y pantalla de victoria.
- **/img/**: Imágenes generales del juego.
- **/js/**: Scripts JS globales y específicos.
- **/mapa/**, **/sudoku/**: Juegos individuales con sus propios recursos.
- **/video/**: Videos usados en el juego.
- **escaperoom.sql**: Script de creación de la base de datos.

## 5. Requisitos del sistema y dependencias
- **Sistema operativo:** Windows, macOS o Linux
- **Servidor web:** Apache (XAMPP recomendado)
- **PHP:** >= 7.4
- **MySQL:** >= 5.7
- **Extensiones PHP:** mysqli, json
- **Dependencias externas:** PHPMailer (incluido en /data/PHPMailer)

## 6. Guía de instalación y configuración
1. Instala XAMPP y arranca Apache y MySQL.
2. Clona o copia el proyecto en la carpeta `htdocs` de XAMPP.
3. Importa el archivo `escaperoom.sql` en MySQL para crear la base de datos y tablas.
4. Configura los datos de acceso a la base de datos en `config/database.php`.
5. Accede a la URL local (por ejemplo, `http://localhost/escaperoom/juego.php`).
6. (Opcional) Configura el envío de correos en `data/enviarCorreos.php` si se requiere verificación o recuperación de cuentas.

---

Para dudas técnicas, consulta los archivos README.md y la documentación interna de cada script PHP.

---

## 7. Flujo de usuario
1. El usuario accede a la página principal y se registra o inicia sesión.
2. Selecciona el modo de juego (puntos o tiempo) y comienza la partida.
3. Juega los retos (mapa, sudoku, portal final), interactuando con la interfaz y resolviendo acertijos.
4. Puede solicitar pistas, lo que aplica penalizaciones según el modo de juego.
5. Al finalizar, el sistema guarda la partida y muestra la pantalla de victoria y el ranking.
6. El usuario puede consultar su perfil, editar datos y ver el ranking general.



