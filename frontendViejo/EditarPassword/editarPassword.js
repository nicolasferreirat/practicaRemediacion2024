function validarContraseña(contraseña) {
    //Obtención de elementos del formulario
    const errorContraseña = document.getElementById("errorContraseña");
    const inputContraseña = document.getElementById("contrasenaNueva");
    const requerimientos = document.getElementById("requirements");
    const contrasenaActual = document.getElementById("contrasenaActual").value;

    //String con los errores
    let errores = "";

    // Verificar si la contraseña tiene más de 8 caracteres
    if (contraseña.length < 8 || contraseña.length > 12) {
        errores += "Su contraseña debe tener entre 8 y 12 dígitos.<br>";
    }

    // Verificar si contiene al menos una letra mayúscula
    if (!/[A-Z]/.test(contraseña)) {
        errores += "Su contraseña debe tener al menos una letra mayúscula.<br>";
    }

    // Verificar si contiene al menos una letra minúscula
    if (!/[a-z]/.test(contraseña)) {
        errores += "Su contraseña debe tener al menos una letra minúscula.<br>";
    }

    // Verificar si contiene al menos un número
    if (!/[0-9]/.test(contraseña)) {
        errores += "Su contraseña debe tener al menos un número.<br>";
    }

    // Verificar si contiene caracteres especiales
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(contraseña)) {
        errores += "Su contraseña debe tener al menos un caracter especial.<br>";
    }

    //Verificar que la contrasena nueva no es igual a la contrasena actual
    if (contraseña === contrasenaActual) {
        errores += "Su contraseña nueva no puede ser igual a la actual.<br>";
    }

    //Mostrar los errores si hay
    if(errores.length > 0){
        inputContraseña.style.borderColor = 'red';
        inputContraseña.style.borderWidth = '1.5px';
        errorContraseña.innerHTML = errores;
        requerimientos.style.display = "none";
        return false;
    } else{
        // Si pasa todas las verificaciones, la contraseña es válida
        inputContraseña.style.borderColor = 'green';
        inputContraseña.style.borderWidth = '2px';
        errorContraseña.textContent = "";
        return true;
    }    
}

function repetirContraseña(contraseñaDos){
    //Obtención de elementos del formulario
    const errorRepetirContraseña = document.getElementById("errorRepetirContraseña");
    const inputRepetirContraseña = document.getElementById("confirmarContra")
    const contraseña = document.getElementById("contrasenaNueva");

    //Comparar ambas contraseñas
    if (contraseñaDos !== contraseña.value)
    {
        inputRepetirContraseña.style.borderColor = 'red';
        inputRepetirContraseña.style.borderWidth = '1.5px';
        errorRepetirContraseña.textContent = "Las contraseñas no coinciden.";
        return false;
    }
    if (contraseñaDos === "")
        {
            inputRepetirContraseña.style.borderColor = 'red';
            inputRepetirContraseña.style.borderWidth = '1.5px';
            errorRepetirContraseña.textContent = "El campo está incompleto.";
            return false;
        }

    // Si todas las verificaciones anteriores se pasan, la segunda contraseña es válida.
    inputRepetirContraseña.style.borderColor = 'green';
    inputRepetirContraseña.style.borderWidth = '2px';
    errorRepetirContraseña.textContent = "";
    return true;
}

function contrasenaCorrecta(contrasena){

}

async function contrasenaCorrecta() {
    const inputContrasenaActual = document.getElementById('contrasenaActual');
    const contrasenaActual = inputContrasenaActual.value;
    const errorContrasena = document.getElementById("errorContrasenaActual");

    try {
        const token = localStorage.getItem('jwt'); 

        const respuesta = await fetch('/backend/usuarios/validarPassword', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: contrasenaActual })
        });

        console.log(respuesta);
        const resultado = await respuesta.json();

        if (respuesta.ok) {
            errorContrasena.textContent = "Contraseña actual válida.";
            errorContrasena.style.color = "green";
        } else {
            errorContrasena.textContent = resultado.error || "La contraseña actual es incorrecta.";
            errorContrasena.style.color = "red";
        }
    } catch (error) {
        console.error('Error al validar la contraseña actual:', error);
        errorContrasena.textContent = "Error al validar la contraseña actual.";
        errorContrasena.style.color = "red";
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('editarContrasenaForm');
    const mensajeElemento = document.getElementById('mensaje');

    formulario.addEventListener('submit', async function (evento) {
        evento.preventDefault();


        const nuevaContrasena = document.getElementById('contrasenaNueva').value;
        const contrasenaActual = document.getElementById('contrasenaActual').value;

        try {
            const token = localStorage.getItem('jwt');
            const respuesta = await fetch('/backend/usuarios/cambiarPassword', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    actualPassword: contrasenaActual,
                    nuevaPassword: nuevaContrasena
                })
            });

            console.log(respuesta);
            const resultado = await respuesta.json();

            if (respuesta.ok) {
                mensajeElemento.innerHTML = "Contraseña actualizada correctamente.<br>Redirigiendo al menu principal...";
                mensajeElemento.style.color = "green";
                setTimeout(function() {
                    window.location.href = '../MenuPrincipal/menuPrincipal.html';
                }, 2000);
            } else {
                mensajeElemento.textContent = resultado.error || "Error al actualizar la contraseña.";
                mensajeElemento.style.color = "red";
            }
        } catch (error) {
            console.error('Error al actualizar contraseña:', error);
            mensajeElemento.textContent = "Ocurrió un error. Intenta nuevamente.";
            mensajeElemento.style.color = "red";
        }
    });
});

//Agregar eventos al sacar el foco de un campo
function agregarEventoBlur(idCampo, funcionValidacion) {
    const input = document.getElementById(idCampo);
    input.addEventListener('blur', function() {
        funcionValidacion(input.value);
    });
}

agregarEventoBlur('contrasenaNueva',validarContraseña)
agregarEventoBlur('confirmarContra',repetirContraseña)
agregarEventoBlur('contrasenaActual', contrasenaCorrecta)

//Agregar evento al apretar el boton volver
document.getElementById("menu").addEventListener("click", function() {
    window.location.href = '../MenuPrincipal/menuPrincipal.html';
});

document.getElementById('togglePassword').addEventListener('click', function () {
    const campoContrasena = document.getElementById('contrasenaActual');    
    // Alternar entre el tipo 'password' y 'text'
    if (campoContrasena.type === 'password') {
        campoContrasena.type = 'text';
    } else {
        campoContrasena.type = 'password';
    }
});

document.getElementById('togglerepPassword').addEventListener('click', function () {
    const campoContrasena = document.getElementById('contrasenaNueva');
    
    // Alternar entre el tipo 'password' y 'text'
    if (campoContrasena.type === 'password') {
        campoContrasena.type = 'text';
    } else {
        campoContrasena.type = 'password';
    }
});