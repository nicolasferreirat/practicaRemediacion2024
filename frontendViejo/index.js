document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Obtener los valores de usuario (o correo) y contraseña
        const mailUsuario = document.getElementById('mailUsuario').value;
        const password = document.getElementById('password').value;

        //IF que verifica si el usuario ingreso con el mail o con el nombre de usuario
        if (mailUsuario.includes('@')) {
            try {
                // Realizar el POST al backend para la autenticación
                const response = await fetch('https://localhost/backend/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        mail: mailUsuario,
                        password: password,
                    }),
                });
    
                errorMessage.style.display = 'none';
    
                if (!response.ok) {
                    if (response.status === 401 || response.status === 404) {
                        // Usuario o contraseña incorrectos
                        errorMessage.textContent = 'Las credenciales son incorrectas.';
                        errorMessage.style.display = 'block'; 
                    } else {
                        throw new Error('Error en la autenticación');
                    }
                    return;
                }
    
                // Autenticación exitosa: procesar la respuesta y redirigir
                const data = await response.json();
                const token = data.token;
    
                // Guardar el token en localStorage
                localStorage.setItem('jwt', token);
    
                // Redirigir a la página principal
                window.location.href = 'MenuPrincipal/menuPrincipal.html';  //--------------------------ACA MANDARIA AL MENU PRINCIPAL
            } catch (error) {
                // Mostrar cualquier error inesperado
                console.error('Error durante la autenticación:', error);
                errorMessage.textContent = 'Hubo un problema con la autenticación. Por favor, intenta de nuevo.';
                errorMessage.style.display = 'block';
            }
          } else {
            try {
                // Realizar el POST al backend para la autenticación
                const response = await fetch('https://localhost/backend/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nombre_usuario: mailUsuario,
                        password: password,
                    }),
                });
    
                errorMessage.style.display = 'none';
    
                if (!response.ok) {
                    if (response.status === 401 || response.status === 404) {
                        // Usuario o contraseña incorrectos
                        errorMessage.textContent = 'Las credenciales son incorrectas';
                        errorMessage.style.display = 'block'; 
                    } else {
                        throw new Error('Error en la autenticación');
                    }
                    return;
                }
    
                // Autenticación exitosa: procesar la respuesta y redirigir
                const data = await response.json();
                const token = data.token;
                console.log("----------------------------")
                console.log(token)
                console.log("----------------------------")

                // Guardar el token en localStorage
                localStorage.setItem('jwt', token);
    
                // Redirigir a la página principal
                window.location.href = 'MenuPrincipal/menuPrincipal.html'; 
            } catch (error) {
                // Mostrar cualquier error inesperado
                console.error('Error durante la autenticación:', error);
                errorMessage.textContent = 'Hubo un problema con la autenticación. Por favor, intenta de nuevo.';
                errorMessage.style.display = 'block';
            }
          }
    });
});

document.getElementById("sobreNosotros").addEventListener('click', function() {
    window.location.href = '../SobreNosotros/sobreNosotros.html';
});

