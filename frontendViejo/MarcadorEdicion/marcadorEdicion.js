// Función para mostrar/ocultar el menú desplegable
function toggleMenu() {
    document.querySelector('.navigation').classList.toggle('active');
}

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