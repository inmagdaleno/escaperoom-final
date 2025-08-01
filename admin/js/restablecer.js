document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const nuevaPassword = document.querySelector('input[name="nueva_password"]');
    const confirmarPassword = document.querySelector('input[name="confirmar_password"]');
    const submitBtn = document.querySelector('input[type="submit"]');
    
    // Crear elemento para mostrar mensajes de error o éxito
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.display = 'none';
    
    // Insertar el div de error después del campo de confirmar contraseña
    confirmarPassword.parentNode.insertBefore(errorDiv, confirmarPassword.nextSibling);
    
    // Función para validar contraseñas
    function validarPasswords() {
        const password1 = nuevaPassword.value;
        const password2 = confirmarPassword.value;
        
        // Limpiar estilos anteriores
        nuevaPassword.classList.remove('error-border', 'success-border');
        confirmarPassword.classList.remove('error-border', 'success-border');
        errorDiv.style.display = 'none';
        
        // Si ambos campos están vacíos, no mostrar error
        if (password1 === '' && password2 === '') {
            return true;
        }
        
        // Validar longitud mínima
        if (password1.length < 4) {
            mostrarError('La contraseña debe tener al menos 4 caracteres');
            nuevaPassword.classList.add('error-border');
            return false;
        }
        
        // Si se está escribiendo en el campo de confirmar pero no coinciden
        if (password2 !== '' && password1 !== password2) {
            mostrarError('Las contraseñas no coinciden');
            confirmarPassword.classList.add('error-border');
            return false;
        }
        
        // Si las contraseñas coinciden y no están vacías
        if (password1 === password2 && password1 !== '') {
            mostrarExito('Las contraseñas coinciden');
            nuevaPassword.classList.add('success-border');
            confirmarPassword.classList.add('success-border');
            return true;
        }
        
        return true;
    }
    
    // Función para mostrar mensaje de error
    function mostrarError(mensaje) {
        errorDiv.textContent = mensaje;
        errorDiv.style.display = 'block';
        errorDiv.classList.remove('success-message');
        errorDiv.classList.add('error-message');
    }
    
    // Función para mostrar mensaje de éxito
    function mostrarExito(mensaje) {
        errorDiv.textContent = mensaje;
        errorDiv.style.display = 'block';
        errorDiv.classList.remove('error-message');
        errorDiv.classList.add('success-message');
    }
    
    // Validar en tiempo real mientras se escribe
    nuevaPassword.addEventListener('input', function() {
        validarPasswords();
    });
    
    confirmarPassword.addEventListener('input', function() {
        validarPasswords();
    });
    
    // Validar al enviar el formulario
    form.addEventListener('submit', function(e) {
        const password1 = nuevaPassword.value;
        const password2 = confirmarPassword.value;
        
        if (password1 === '' || password2 === '') {
            e.preventDefault();
            mostrarError('Por favor, completa ambos campos de contraseña');
            return false;
        }
        
        if (password1.length < 4) {
            e.preventDefault();
            mostrarError('La contraseña debe tener al menos 4 caracteres');
            nuevaPassword.focus();
            return false;
        }
        
        if (password1 !== password2) {
            e.preventDefault();
            mostrarError('Las contraseñas no coinciden. Por favor, verifica que sean idénticas');
            confirmarPassword.focus();
            confirmarPassword.select();
            return false;
        }
        
        submitBtn.value = 'Restableciendo...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.value = 'Restablecer Contraseña';
            submitBtn.disabled = false;
        }, 5000);
        
        return true;
    });
    
    
    function validarFortaleza(password) {
        const criterios = {
            longitud: password.length >= 8,
            mayuscula: /[A-Z]/.test(password),
            minuscula: /[a-z]/.test(password),
            numero: /\d/.test(password),
            especial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        let fuerza = 0;
        for (let criterio in criterios) {
            if (criterios[criterio]) fuerza++;
        }
        
        return {
            criterios: criterios,
            nivel: fuerza < 2 ? 'débil' : fuerza < 4 ? 'media' : 'fuerte',
            puntuacion: fuerza
        };
    }
});
