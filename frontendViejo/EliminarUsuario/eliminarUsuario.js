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


// boton NO
document.getElementById("no").addEventListener('click', function() {
    window.location.href = '../MenuPrincipal/menuPrincipal.html';   
});

// boton SI
document.getElementById("si").addEventListener('click', function() {
    eliminarUsuario(IdUsu);
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


async function eliminarUsuario(idUsuario) {
    const errorEliminar = document.getElementById("errorBotonEliminar");

    try {
        const responseEliminar = await fetch(`/backend/usuarios/${idUsuario}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,  // Agregar el token al encabezado Authorization
                'Content-Type': 'application/json'
            }
        });

        if (responseEliminar.ok) {
            errorEliminar.style.color = "white";
            errorEliminar.innerHTML = "Se ha eliminado a la persona correctamente.<br> Redirigiendo al login...";
            localStorage.removeItem('jwt');
            setTimeout(function() {
                window.location.href = '../index.html';
            }, 2000);
        } else {
            throw new Error(`Error al eliminar el usuario: ${responseEliminar.statusText}`);
        }
    } catch (error) {
        errorEliminar.style.color = "red";
        errorEliminar.innerHTML = `No se pudo eliminar a la persona.`;
    }
}


window.onload = obtenerDatosUsuario(IdUsu);