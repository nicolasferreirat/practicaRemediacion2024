// Función para mostrar/ocultar el menú desplegable
function toggleMenu() {
    document.querySelector('.navigation').classList.toggle('active');
}

// Función para manejar el redimensionamiento de la pantalla
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        document.querySelector('.navigation').classList.remove('active');
    }
});

function obtenerIdUsuarioDesdeToken() {
    const token = localStorage.getItem('jwt');
    
    if (token) {
        const payloadBase64 = token.split('.')[1]; // El payload es la segunda parte del token
        const payloadDecoded = JSON.parse(atob(payloadBase64));
        const idUsuario = payloadDecoded.id;

        return idUsuario;
    } else {
        console.log("No se encontró ningún token en localStorage.");
        return null; 
    }
}

document.getElementById("inicio").addEventListener('click', function() {
    window.location.href = '../MenuPrincipal/menuPrincipal.html';
});
document.getElementById("historial").addEventListener('click', function() {
    window.location.href = '../Historial/historial.html';
});
document.getElementById("sobreNosotros").addEventListener('click', function() {
    window.location.href = '../SobreNosotros/sobreNosotros.html';
});

// ver datos del usuario
document.getElementById("musuario").addEventListener('click', function() {
    const IdUsu = obtenerIdUsuarioDesdeToken();
    console.log(IdUsu);
    window.location.href = `../VerDatosUsuario/verDatosUsuario.html?id=${IdUsu}`;   
});

// ver datos del usuario
document.getElementById("usuario").addEventListener('click', function() {
    const IdUsu = obtenerIdUsuarioDesdeToken();
    console.log(IdUsu);
    window.location.href = `../VerDatosUsuario/verDatosUsuario.html?id=${IdUsu}`;   
});


//Hacer cerrar sesión dialog
function abrirLogoutDialog() {
    document.getElementById('logoutDialog').style.display = 'flex';
}

function cerrarLogoutDialog() {
    document.getElementById('logoutDialog').style.display = 'none';
}

function confirmarLogout() {
    localStorage.removeItem('jwt'); //Eliminar token de sesion
    window.location.href = '../index.html';
}