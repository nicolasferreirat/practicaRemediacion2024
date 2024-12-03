function obtenerIdUsuario() {
    const urlParams = new URLSearchParams(window.location.search);
    const idObtenido = urlParams.get('id');
    return idObtenido;
}

const token = localStorage.getItem('jwt');

const IdUsu = obtenerIdUsuario();

async function obtenerDatosUsuario(IdUsuario) {
    try {
        // Obtención de los datos de la persona mediante promesa
        const promesaResponse = await fetch(`/backend/usuarios/${IdUsuario}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,  // Agregar el token al encabezado Authorization
                'Content-Type': 'application/json'
            }
        });
        const usuarios = await promesaResponse.json();
        const datos = JSON.stringify(usuarios);

        console.log("---TOKEN---")
        console.log(token);
        // Llamada a la función para cargar los datos de la persona
        cargaUsuario(datos);
    } catch (error) {
        console.error('Error al obtener los datos de la persona:', error);
    }
}

// boton Eliminar usuario
document.getElementById("eliminarUsuario").addEventListener('click', function() {
    const IdUsu = obtenerIdUsuario(); 
    window.location.href = `../EliminarUsuario/eliminarUsuario.html?id=${IdUsu}`;   
});


// boton editar usuario
document.getElementById("editarUsuario").addEventListener('click', function() {
    const IdUsu = obtenerIdUsuario(); 
    window.location.href = `../EditarUsuario/editarUsuario.html?id=${IdUsu}`;   
});

// boton editar contraseña
document.getElementById("editarPassword").addEventListener('click', function() {
    const IdUsu = obtenerIdUsuario(); 
    window.location.href = `../EditarPassword/editarPassword.html?id=${IdUsu}`;   
});

document.getElementById("volver").addEventListener('click', function() {
    const IdUsu = obtenerIdUsuario(); 
    window.location.href = `../MenuPrincipal/menuPrincipal.html`;   
});


function cargaUsuario(datos){
    //Obtener el cuerpo de la tabla del usuario
    const cuerpoTablaUsuarios = document.querySelector("#listaUsuarios tbody");
    //Limpiar el contenido
    cuerpoTablaUsuarios.innerHTML = ''; 
    //De string a array
    const usuario = JSON.parse(datos);
    //Creacion de cada fila de la tabla
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${usuario.id}</td>
        <td>${usuario.nombre}</td>
        <td>${usuario.apellido}</td>
        <td>${usuario.nombre_usuario}</td>
        <td>${usuario.mail}</td>
    `;
        cuerpoTablaUsuarios.appendChild(row);
};


window.onload = obtenerDatosUsuario(IdUsu);
