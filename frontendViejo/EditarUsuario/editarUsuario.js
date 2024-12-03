function obtenerIdUsuario() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

const idUsuario = obtenerIdUsuario();



// boton volver al listado
document.getElementById("menu").addEventListener('click', function() {
    window.location.href = '../MenuPrincipal/menuPrincipal.html';  
});

// boton confirmar
document.getElementById("botonRegistro").addEventListener('click', function() {
    manejarEnvioFormulario();
});

const token = localStorage.getItem('jwt');
///////////////////////////////////////////////////////////////////////////Eventos//////////////////////

//////////////////////////////////////////////////////////////////////////////////
async function obtenerDatosUsuario() {
    try {
        const respuesta = await fetch(`/backend/usuarios/${idUsuario}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,  
                'Content-Type': 'application/json'
            }
        });
        if (!respuesta.ok) {
            throw new Error('Respuesta de la red no fue correcta');
        }
        const usuario = await respuesta.json();
        const datos = JSON.stringify(usuario);
        return datos;

    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
    }
}

async function actualizarDatosUsuario(datosUsuario) {
    const errorEditar = document.getElementById("errorBotonRegistro");
    try {
        const respuesta = await fetch(`/backend/usuarios/${idUsuario}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosUsuario)
        });
        
        if (!respuesta.ok) {
            throw new Error(`Error: ${respuesta.status} ${respuesta.statusText}`);
        } 
        errorEditar.style.color = "green";
        errorEditar.innerHTML = "Se ha editado los datos del usuario correctamente.<br> Redirigiendo al menu principal...";
        setTimeout(function() {
            window.location.href = '../MenuPrincipal/menuPrincipal.html';
        }, 2000);

    } catch (error) {
        console.error("Error al editar el usuario:", error);
        errorEditar.style.color = "red";
        errorEditar.textContent = "Ha surgido un error intentando editar a este usuario. Inténtelo de nuevo más tarde.";
    }
}

async function llenarFormulario() {
    const usuarioJson = await obtenerDatosUsuario();
    if (usuarioJson) {
        const usuario = JSON.parse(usuarioJson);
        document.getElementById('nombre').value = usuario.nombre;
        document.getElementById('apellido').value = usuario.apellido;
        document.getElementById('nombreUsuario').value = usuario.nombre_usuario;
        document.getElementById('mail').value = usuario.mail;
    }
}

async function manejarEnvioFormulario() {
    if(confirmarCambios()){
        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const nombre_usuario = document.getElementById('nombreUsuario').value;
        const mail = document.getElementById('mail').value;


        const datosUsuario = {
            nombre: nombre,
            apellido: apellido,
            nombre_usuario: nombre_usuario,
            mail: mail,
        };

        await actualizarDatosUsuario(datosUsuario);
    }
    
}

window.onload = () => {
    llenarFormulario();
};

////////////////////////////////////////////////// VALIDACIONES DE CAMPOS //////////////////////////////////////////////////////////////////////////////////

function validarNombre(nombre){
    //Obtención de elementos del formulario
    const errorNombre = document.getElementById("errorNombre");
    const inputNombre = document.getElementById("nombre");

    //Verificar minimo y maximo de nombre
    if ((nombre.length < 3)){
        inputNombre.style.borderColor = 'red';
        inputNombre.style.borderWidth = '1.5px';
        errorNombre.textContent = "El campo 'Nombre' es obligatorio.";
        return false;
    }
    if ((nombre.length > 30)){
        inputNombre.style.borderColor = 'red';
        inputNombre.style.borderWidth = '1.5px';
        errorNombre.textContent = "El 'Nombre' excede el límite de carácteres.";
        return false;
    }

    // Si todas las verificaciones anteriores se pasan, el nombre es válido.
    inputNombre.style.borderColor = 'green';
    inputNombre.style.borderWidth = '2px';
    errorNombre.textContent = "";
    return true;
}

function validarApellido(apellido){
    //Obtención de elementos del formulario
    const errorApellido = document.getElementById("errorApellido");
    const inputApellido = document.getElementById("apellido");

    //Verificar minimo y maximo de apellido
    if ((apellido.length < 3)){
        inputApellido.style.borderColor = 'red';
        inputApellido.style.borderWidth = '1.5px';
        errorApellido.textContent = "El campo 'Apellido' es obligatorio.";
        return false;
    }
    if ((apellido.length > 30)){
        inputApellido.style.borderColor = 'red';
        inputApellido.style.borderWidth = '1.5px';
        errorApellido.textContent = "El 'Apellido' excede el límite de carácteres.";
        return false;
    }

    // Si todas las verificaciones anteriores se pasan, el apellido es válido.
    inputApellido.style.borderColor = 'green';
    inputApellido.style.borderWidth = '2px';
    errorApellido.textContent = "";
    return true;
}

async function validarNombreUsuario(nombreDeusuario){
    //Obtención de elementos del formulario
    const errorNombreUsuario = document.getElementById("errorNombreUsuario");
    const inputNombreUsuario = document.getElementById("nombreUsuario");

     //Verificar minimo y maximo de nombre
     if ((nombreDeusuario.length < 3)){
        inputNombreUsuario.style.borderColor = 'red';
        inputNombreUsuario.style.borderWidth = '1.5px';
        if(nombre.length == 0){
            errorNombreUsuario.textContent = "El campo 'Nombre de usuario' es obligatorio.";
        }
        else{
            errorNombreUsuario.textContent = "El nombre de usuario es muy corto.";
        }
        return false;
    }
    if ((nombreDeusuario.length > 30)){
        inputNombreUsuario.style.borderColor = 'red';
        inputNombreUsuario.style.borderWidth = '1.5px';
        errorNombreUsuario.textContent = "El 'Nombre de usuario' excede el límite de carácteres.";
        return false;
    }

    if (nombreDeusuario.includes('@')) {
        inputNombreUsuario.style.borderColor = 'red';
        inputNombreUsuario.style.borderWidth = '1.5px';
        errorNombreUsuario.textContent = "El 'Nombre de usuario' no puede contener el carácter '@'.";
        return false;
    }

     //Chequear que el nombre de usuario no esta registrado
     try {
        const response = await fetch('/backend/usuarios/validarNombreUsuario', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre_usuario: nombreDeusuario }) 
        });

        if (!response.ok) {
            throw new Error('Error en la red o en el servidor');
        }

        const result = await response.json();

        // Verificar si el nombre de usuario ya está registrado
        if (result.existe) {
            inputNombreUsuario.style.borderColor = 'red';
            inputNombreUsuario.style.borderWidth = '1.5px';
            errorNombreUsuario.textContent = "Este nombre de usuario ya está registrado.";
            return false;
        }
    } catch (error) {
        console.error('Error al validar el nombre de usuario:', error);
        errorNombreUsuario.textContent = "Error al validar el nombre de usuario. Intente nuevamente.";
        return false;
    }
    // Si todas las verificaciones anteriores se pasan, el nombre es válido.
    inputNombreUsuario.style.borderColor = 'green';
    inputNombreUsuario.style.borderWidth = '2px';
    errorNombreUsuario.textContent = "";
    return true;
}

async function validarMail(mail){
    //Obtención de elementos del formulario
    const errorMail = document.getElementById("errorMail");
    const inputMail = document.getElementById("mail");

    //Expresión regular de un correo xxxx@xxxx.xx
    const mailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    //Chequear si el correo es válido
    if(!mailRegex.test(mail)){
        inputMail.style.borderColor = 'red';
        inputMail.style.borderWidth = '1.5px';
        errorMail.textContent = "El correo electrónico que ingresó no es válido.";
        return false;
    }

    try {
        const response = await fetch('/backend/usuarios/validarCorreo', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mail: mail })
        });

        if (!response.ok) {
            throw new Error('Error en la red o en el servidor');
        }

        const result = await response.json();

        // Verificar si el correo ya está registrado
        if (result.existe) {
            inputMail.style.borderColor = 'red';
            inputMail.style.borderWidth = '1.5px';
            errorMail.textContent = "Este correo electrónico ya está registrado.";
            return false;
        }
    } catch (error) {
        console.error('Error al validar el correo electrónico:', error);
        errorMail.textContent = "Error al validar el correo electrónico. Intente nuevamente.";
        return false;
    }

    // Si las verificación anterior pasa, el correo es válido.
    inputMail.style.borderColor = 'green';
    inputMail.style.borderWidth = '2px';
    errorMail.textContent = "";
    return true;
}
////////////////////////////////////////////////// fin  VALIDACIONES DE CAMPOS //////////////////////////////////////////////////////////////////////////////////

///////////////////////////////CLASE PERSONA Y FUNCION CONFIRMARCAMBIOS (IMPRIME LOS DATOS DE LA PERSONA) ////////////////////////////////////////////////////////
class Usuario {
    constructor(id,nombre, apellido, nombre_usuario, mail) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.nombre_usuario = nombre_usuario;
        this.mail = mail;
    }

    imprimirinfo() {
        return `ID: ${this.id} \n Nombre: ${this.nombre} ${this.apellido}\nMail: ${this.mail}`;
    }
}

function confirmarCambios(){
    const errorConfirmar = document.getElementById("errorBotonRegistro");

    const nombre = document.getElementById("nombre");
    const apellido = document.getElementById("apellido");
    const nombre_usuario = document.getElementById("nombreUsuario");
    const mail = document.getElementById("mail");

    if (validarNombre(nombre.value) && validarApellido(apellido.value) && validarNombreUsuario (nombre_usuario.value, idUsuario) && validarMail(mail.value, idUsuario))
    {
        return true;
    }
    errorConfirmar.style.color = "red";
    errorConfirmar.textContent = "Error. Faltan rellenar campos de manera correcta.";
    return false;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Agregar eventos al sacar el foco de un campo
function agregarEventoBlur(idCampo, funcionValidacion) {
    const input = document.getElementById(idCampo);
    input.addEventListener('blur', function() {
        funcionValidacion(input.value);
    });
}

agregarEventoBlur('nombre', validarNombre);
agregarEventoBlur('apellido', validarApellido);
agregarEventoBlur('nombreUsuario', validarNombreUsuario);
agregarEventoBlur('mail', validarMail);
