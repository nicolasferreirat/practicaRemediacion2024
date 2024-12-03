const token = localStorage.getItem('jwt');

//Cargar datos de personas al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    // Obtener el parámetro de la URL
    const params = new URLSearchParams(window.location.search);
    const mail = params.get('mail');
    const nombre = params.get('given_name');
    const apellido = params.get('family_name');

    // Rellenar el campo de correo electrónico si existe en la URL
    if (mail) {
        const inputMail = document.getElementById('mail');
        inputMail.value = decodeURIComponent(mail);  // Decodificar y asignar el email al campo
    }

    // Rellenar el campo de nombre si existe en la URL
    if (nombre) {
        const inputNombre = document.getElementById('nombre');
        inputNombre.value = decodeURIComponent(nombre);  // Decodificar y asignar el nombre
    }

    // Rellenar el campo de apellido si existe en la URL
    if (apellido) {
        const inputApellido = document.getElementById('apellido');
        inputApellido.value = decodeURIComponent(apellido);  // Decodificar y asignar el apellido
    }

});

function validarNombre(nombre){
    //Obtención de elementos del registrarUsuario.html
    const errorNombre = document.getElementById("errorNombre");
    const inputNombre = document.getElementById("nombre");

    //Verificar minimo y maximo de nombre
    if ((nombre.length < 3)){
        inputNombre.style.borderColor = 'red';
        inputNombre.style.borderWidth = '1.5px';
        if(nombre.length == 0){
            errorNombre.textContent = "El campo 'Nombre' es obligatorio.";
        }
        else{
            errorNombre.textContent = "El nombre es muy corto.";
        }
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
        if(apellido.length == 0){
            errorApellido.textContent = "El campo 'Apellido' es obligatorio.";
        }
        else{
            errorApellido.textContent = "El apellido es muy corto.";
        }
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

function validarPassword(password) {
    //Obtención de elementos del formulario
    const errorpassword = document.getElementById("errorPassword");
    const inputpassword = document.getElementById("password");
    const requerimientos = document.getElementById("requerimientosPassword");

    //String con los errores
    let errores = "";

    // Verificar si la contraseña tiene más de 8 caracteres
    if (password.length < 8 || password.length > 12) {
        errores += "Su contraseña debe tener entre 8 y 12 dígitos.<br>";
    }

    // Verificar si contiene al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) {
        errores += "Su contraseña debe tener al menos una letra mayúscula.<br>";
    }

    // Verificar si contiene al menos una letra minúscula
    if (!/[a-z]/.test(password)) {
        errores += "Su contraseña debe tener al menos una letra minúscula.<br>";
    }

    // Verificar si contiene al menos un número
    if (!/[0-9]/.test(password)) {
        errores += "Su contraseña debe tener al menos un número.<br>";
    }

    // Verificar si contiene caracteres especiales
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errores += "Su contraseña debe tener al menos un caracter especial.<br>";
    }

    //Mostrar los errores si hay
    if(errores.length > 0){
        inputpassword.style.borderColor = 'red';
        inputpassword.style.borderWidth = '1.5px';
        errorpassword.innerHTML = errores;
        requerimientos.style.display = "none";
        return false;
    } else{
        // Si pasa todas las verificaciones, la contraseña es válida
        inputpassword.style.borderColor = 'green';
        inputpassword.style.borderWidth = '2px';
        errorpassword.textContent = "";
        return true;
    }    
}

function repetirPassword(passwordDos){
    //Obtención de elementos del formulario
    const errorRepetirPassword = document.getElementById("errorRepetirPassword");
    const inputRepetirPassword = document.getElementById("repetirPassword")
    const password = document.getElementById("password");

    //Comparar ambas contraseñas
    if (passwordDos !== password.value)
    {
        inputRepetirPassword.style.borderColor = 'red';
        inputRepetirPassword.style.borderWidth = '1.5px';
        errorRepetirPassword.textContent = "Las contraseñas no coinciden.";
        return false;
    }
    if (passwordDos === "")
        {
            inputRepetirPassword.style.borderColor = 'red';
            inputRepetirPassword.style.borderWidth = '1.5px';
            errorRepetirPassword.textContent = "El campo está incompleto.";
            return false;
        }

    // Si todas las verificaciones anteriores se pasan, la segunda contraseña es válida.
    inputRepetirPassword.style.borderColor = 'green';
    inputRepetirPassword.style.borderWidth = '4px';
    errorRepetirPassword.textContent = "";
    return true;
}

class Usuario {
    constructor(nombre, apellido, nombre_usuario, mail, password) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.nombre_usuario = nombre_usuario;
        this.mail = mail;
        this.password = password;
    }

    imprimirinfo() {
        return `Nombre: ${this.nombre} ${this.apellido}\nNombre de usuario: ${this.nombre_usuario} \nEmail: ${this.mail}\ncontraseña: ${this.password}\n`;
    }
}

function registrar(){
    const errorRegistrar = document.getElementById("errorBotonRegistro");

    const nombre = document.getElementById("nombre");
    const apellido = document.getElementById("apellido");
    const nombreUsuario = document.getElementById("nombreUsuario");
    const mail = document.getElementById("mail");
    const password = document.getElementById("password");
    const passwordDos = document.getElementById("repetirPassword")

    if (validarNombre(nombre.value) && validarApellido(apellido.value) && validarNombreUsuario(nombreUsuario.value) && validarMail(mail.value) && validarPassword(password.value) && repetirPassword(passwordDos.value))
    {
        const perfilCreado = new Usuario(nombre.value, apellido.value, nombreUsuario.value, mail.value, password.value)
        return perfilCreado;
    }
    errorRegistrar.style.color = "red";
    errorRegistrar.textContent = "Error. Faltan rellenar campos de manera correcta.";
    return false;
}

async function altaUsuario(nuevoUsuario) {
    const errorRegistrar = document.getElementById("errorBotonRegistro");
    try {
        const responseAlta = await fetch("/backend/usuarios", {
            method: "POST",
            body: JSON.stringify(nuevoUsuario),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Verificación de la respuesta
        if (!responseAlta.ok) {
            throw new Error(`Error: ${responseAlta.status} ${responseAlta.statusText}`);
        }

        // Mensaje de éxito y redirección
        errorRegistrar.style.color = "green";
        errorRegistrar.innerHTML = "Se ha registrado correctamente.<br> Redirigiendo al login...";
        setTimeout(function() {
            window.location.href = '../index.html';
        }, 2000);
    } catch (error) {
        console.error('Error:', error);
        errorRegistrar.style.color = "red";
        errorRegistrar.textContent = "Ha surgido un error intentando registrar a esta usuario. Intentelo de nuevo más tarde.";
    }
}


////////////////////////////// EVENTOS //////////////////////////////////////////////////////////////////////////////////////////

//Agregar evento al apretar el boton registrarse
document.getElementById("botonRegistro").addEventListener("click", function() {
    if (registrar()){
        //Hacer POST
        altaUsuario(registrar());      
    }
});

//Agregar evento al apretar el boton volver
document.getElementById("login").addEventListener("click", function() {
    const fromPage = localStorage.getItem('fromPage');
    console.log(fromPage);
    window.location.href = '../index.html';
});


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
agregarEventoBlur('password', validarPassword);


// ocultamos las contraseñas con puntitos negros
document.getElementById('togglePassword').addEventListener('click', function () {
    const campoContrasena = document.getElementById('password');
    const botonMostrarOcultar = document.getElementById('togglePassword');
    
    // Alternar entre el tipo 'password' y 'text'
    if (campoContrasena.type === 'password') {
        campoContrasena.type = 'text';
    } else {
        campoContrasena.type = 'password';
    }
});

document.getElementById('togglerepPassword').addEventListener('click', function () {
    const campoContrasena = document.getElementById('repetirPassword');
    const botonMostrarOcultar = document.getElementById('togglerepPassword');
    
    // Alternar entre el tipo 'password' y 'text'
    if (campoContrasena.type === 'password') {
        campoContrasena.type = 'text';
    } else {
        campoContrasena.type = 'password';
    }
});
