
# Escape Room Web

¡Bienvenido al proyecto Escape Room Web!

Este repositorio contiene el código fuente de un juego de escape room interactivo y educativo, desarrollado en PHP, JavaScript y CSS, con integración de base de datos MySQL y gestión avanzada de usuarios. El objetivo es resolver acertijos y retos para escapar de la isla, compitiendo por el mejor tiempo y puntuación.

---

## Tabla de contenidos
- [Características principales](#características-principales)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Configuración y personalización](#configuración-y-personalización)
- [Preguntas frecuentes](#preguntas-frecuentes)
- [Soporte y contribución](#soporte-y-contribución)
- [Créditos](#créditos)
- [Licencia](#licencia)

---

## Características principales
- Juego de escape room con diferentes pantallas y retos (mapa, sudoku, portal final)
- Sistema de usuarios con registro, login, edición de perfil y recuperación de contraseña
- Ranking de jugadores y guardado de partidas
- Efectos visuales modernos (glassmorphism, animaciones, responsive)
- Integración de PHPMailer para envío de correos (recuperación de contraseña, notificaciones)
- Recursos multimedia: imágenes, audio y video
- Modal de perfil de usuario unificado y consistente en todas las pantallas
- Sistema de pistas y ayudas para los retos
- Animaciones y efectos visuales para mejorar la experiencia

## Tecnologías utilizadas
- **PHP**: Backend y lógica de negocio
- **JavaScript**: Interactividad y lógica de juego en el frontend
- **CSS**: Estilos avanzados, glassmorphism, responsive design
- **MySQL**: Base de datos relacional para usuarios, partidas y ranking
- **PHPMailer**: Envío de correos electrónicos
- **HTML5**: Estructura de las páginas

## Estructura del proyecto
```
├── admin/           # Pantallas de administración y login
├── config/          # Configuración y conexión a la base de datos
├── controller/      # Lógica de control y endpoints
├── css/             # Estilos globales
├── data/            # Acceso a datos y PHPMailer
├── Final/           # Pantalla final y recursos asociados
├── img/             # Imágenes generales
├── js/              # Scripts globales
├── mapa/            # Pantalla de mapa y recursos
├── sudoku/          # Pantalla de sudoku y recursos
├── video/           # Videos del juego
├── juego.php        # Pantalla principal del juego
├── escaperoom.sql   # Script de base de datos
├── escaperoom-sql.pdf # Documentación de la base de datos
```

## Instalación y ejecución
1. Clona el repositorio:
   ```bash
   git clone https://github.com/tuusuario/escaperoom.git
   ```
2. Coloca el proyecto en tu servidor local (ejemplo: XAMPP en `htdocs`)
3. Importa el archivo `escaperoom.sql` en tu base de datos MySQL usando phpMyAdmin o la terminal:
   ```bash
   mysql -u usuario -p nombre_base_datos < escaperoom.sql
   ```
4. Configura los parámetros de conexión en `config/database.php` (usuario, contraseña, nombre de la base de datos)
5. Accede a `juego.php` desde tu navegador para comenzar a jugar

## Configuración y personalización
- Puedes modificar los estilos en la carpeta `css/` y en los archivos de cada pantalla
- Para cambiar imágenes, reemplaza los archivos en las carpetas `img/`, `Final/img/`, `mapa/img/`, `sudoku/img/`
- Los textos y mensajes se pueden editar directamente en los archivos PHP y JS
- Para personalizar el envío de correos, revisa `data/enviarCorreos.php` y la configuración de PHPMailer
- Si deseas agregar nuevos retos, crea nuevas carpetas y archivos siguiendo la estructura modular

## Preguntas frecuentes
**¿Por qué no se muestra una imagen o audio?**
- Verifica la ruta y el nombre del archivo (mayúsculas/minúsculas)
- Limpia la caché del navegador
- Asegúrate de que el archivo esté en la carpeta correcta

**¿Cómo restablezco mi contraseña?**
- Usa la opción de recuperación en la pantalla de login. Recibirás un correo si tu email está registrado.

**¿Cómo agrego nuevos usuarios o admin?**
- Puedes registrar nuevos usuarios desde la pantalla principal. Para admin, revisa la carpeta `admin/`.

**¿Cómo adapto el juego a otro idioma?**
- Edita los textos en los archivos PHP y JS. PHPMailer soporta múltiples idiomas en `data/PHPMailer/language/`.

## Soporte y contribución
¿Quieres reportar un bug, sugerir una mejora o contribuir?
- Abre un issue en GitHub
- Haz un fork y envía tu pull request
- Para soporte directo, contacta al desarrollador en el email del perfil

## Créditos
- Desarrollado por [Tu Nombre]
- Librerías: PHPMailer
- Imágenes, audio y video: recursos propios y libres de derechos

## Licencia
Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

---
¡Disfruta el reto, compite y comparte tus resultados en redes sociales!
