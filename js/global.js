document.addEventListener('DOMContentLoaded', () => {

    const inputsAValidar = [
        document.getElementById('perfil-nombre'),
        document.getElementById('perfil-apellido')
    ];

    const manejarTeclado = function(event) {
        const tecla = event.key;
        const valorActual = this.value;

        const teclasPermitidas = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
        if (teclasPermitidas.includes(tecla) || event.ctrlKey || event.metaKey) {
        return; 
        }

        // Bloquear números o símbolos
        if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]$/.test(tecla)) {
        event.preventDefault();
        return;
        }

        // Límite de 25 caracteres por palabra
        const palabras = valorActual.split(' ');
        const palabraActual = palabras[palabras.length - 1];
        if (tecla !== ' ' && palabraActual.length >= 25) {
        event.preventDefault();
        return;
        }

        // Validación del Espacio (Máximo 3 palabras / 2 espacios)
        if (tecla === ' ') {
        if (valorActual.length === 0 || valorActual.endsWith(' ')) {
            event.preventDefault();
            return;
        }
        const cantidadEspacios = (valorActual.match(/ /g) || []).length;
        if (cantidadEspacios >= 2) {
            event.preventDefault();
            return;
        }
        }
    };

    // Formateo 
    const manejarFormato = function() {
        const posicionCursor = this.selectionStart;
        let texto = this.value;

        let palabras = texto.split(' ');
        let palabrasFormateadas = palabras.map((palabra) => {
        if (palabra.length === 0) return '';
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
        });

        let textoFinal = palabrasFormateadas.join(' ');

        if (this.value !== textoFinal) {
        this.value = textoFinal;
        this.setSelectionRange(posicionCursor, posicionCursor);
        }
    };

    const manejarPegado = function(event) {
        event.preventDefault(); // Detiene el pegado del navegador

        let textoPegado = '';
        if (event.clipboardData) {
            textoPegado = event.clipboardData.getData('text');
        } else if (window.clipboardData) {
            textoPegado = window.clipboardData.getData('Text');
        }

        if (!textoPegado) return;

        // Solo letras y espacios
        let textoLimpio = textoPegado.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ ]/g, '');

        const start = this.selectionStart;
        const end = this.selectionEnd;
        const textoActual = this.value;

        let textoUnido = textoActual.substring(0, start) + textoLimpio + textoActual.substring(end);

        let palabrasTotales = textoUnido.split(' ');

        // Formateo
        let palabrasProcesadas = palabrasTotales
            .filter(p => p.trim() !== '') // Elimina espacios dobles
            .slice(0, 3)                  // 3 palabras máximas
            .map(palabra => {
            let palabraCortada = palabra.substring(0, 25);
            
            return palabraCortada.charAt(0).toUpperCase() + palabraCortada.slice(1).toLowerCase();
            });

        let resultadoFinal = palabrasProcesadas.join(' ');

        if (textoUnido.endsWith(' ') && palabrasProcesadas.length < 3) {
            resultadoFinal += ' ';
        }

        this.value = resultadoFinal;

        this.setSelectionRange(resultadoFinal.length, resultadoFinal.length);
    };

    // Asigna las funciones a cada input de la lista
    inputsAValidar.forEach(input => {
        if (input) { // Verifica que el input exista 
            input.addEventListener('keydown', manejarTeclado);
            input.addEventListener('input', manejarFormato);
            input.addEventListener('paste', manejarPegado);
        }
    });

    const inputTelefono = document.getElementById('perfil-telefono');

    if (!inputTelefono) return;

    inputTelefono.addEventListener('keydown', function(event) {
        const tecla = event.key;
        const valorActual = this.value;

        const teclasPermitidas = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
        if (teclasPermitidas.includes(tecla) || event.ctrlKey || event.metaKey) {
        return;
        }

        if (tecla === ' ') {
        event.preventDefault();
        return;
        }

        if (!/^[0-9]$/.test(tecla)) {
        event.preventDefault();
        return;
        }

        // Tiene que empezar por 3 o por 6
        if (valorActual.length === 0 && tecla !== '3' && tecla !== '6') {
        event.preventDefault();
        return;
        }

        // Si empieza por 6, el siguiente DEBE ser 0
        if (valorActual.length === 1 && valorActual === '6' && tecla !== '0') {
        event.preventDefault();
        return;
        }
    });

    inputTelefono.addEventListener('input', function() {
        const posicionCursor = this.selectionStart;

        let textoLimpio = this.value.replace(/[^0-9]/g, '').slice(0, 10);

        if (textoLimpio.length > 0) {
        const primerDigito = textoLimpio.charAt(0);
        // Si no empieza por 3 o 6, vacia el input
        if (primerDigito !== '3' && primerDigito !== '6') {
            textoLimpio = '';
        } 
        // Si empieza por 6 pero el segundo no es 0
        else if (primerDigito === '6' && textoLimpio.length > 1 && textoLimpio.charAt(1) !== '0') {
            textoLimpio = '6';
        }
        }

        if (this.value !== textoLimpio) {
        this.value = textoLimpio;
        this.setSelectionRange(posicionCursor - 1, posicionCursor - 1);
        }
        
        const validarTelefono = (value) => {
            const estructuraTelefono = /^[0-9]{10}$/;

            if (value === "") {
                inputTelefono.style.borderColor = '';
            } else if (estructuraTelefono.test(value)) { 
                inputTelefono.style.borderColor = '';
            } else {
                inputTelefono.style.borderColor = 'red';
            }
        };

        validarTelefono(inputTelefono.value);
    });

    inputTelefono.addEventListener('paste', function(event) {
        event.preventDefault(); // Detiene el pegado del navegador

        const clipboard = event.clipboardData || window.clipboardData;
        const textoPegado = clipboard ? clipboard.getData('text') : '';

        if (!textoPegado) return;

        // Solo números 
        let soloNumeros = textoPegado.replace(/[^0-9]/g, '');
        if (!soloNumeros) return;

        const start = this.selectionStart;
        const end = this.selectionEnd;

        let resultadoUnido = this.value.substring(0, start) + soloNumeros + this.value.substring(end);

        if (resultadoUnido.length > 10) {
        resultadoUnido = resultadoUnido.slice(0, 10);
        }

        // Aplica filtross
        if (resultadoUnido.length > 0) {
        const primerDigito = resultadoUnido.charAt(0);
        if (primerDigito !== '3' && primerDigito !== '6') {
            return; 
        }
        if (primerDigito === '6' && resultadoUnido.length > 1 && resultadoUnido.charAt(1) !== '0') {
            resultadoUnido = '6';
        }
        }

        const caracteresAgregados = resultadoUnido.length - (this.value.length - (end - start));

        this.value = resultadoUnido;

        // Coloca el cursor al final 
        this.setSelectionRange(start + caracteresAgregados, start + caracteresAgregados);

        const validarTelefono = (value) => {
            const estructuraTelefono = /^[0-9]{10}$/;

            if (value === "") {
                inputTelefono.style.borderColor = '';
            } else if (estructuraTelefono.test(value)) { 
                inputTelefono.style.borderColor = '';
            } else {
                inputTelefono.style.borderColor = 'red';
            }
        };

        validarTelefono(inputTelefono.value);
    });

    const inputEmail = document.getElementById('perfil-correo');

    if (inputEmail) {
        inputEmail.addEventListener('input', (e) => {
            const value = e.target.value;

            const validarCorreo = (value) => {
                const estructuraCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;

                if (value === "") {
                    inputEmail.style.borderColor = '';
                } else if (estructuraCorreo.test(value)) { 
                    inputEmail.style.borderColor = '';
                } else {
                    inputEmail.style.borderColor = 'red';
                }
            };

            validarCorreo(inputEmail.value);
        });

        inputEmail.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
            }
        });

        inputEmail.addEventListener('paste', function(event) {
            event.preventDefault(); // Detiene el pegado del navegador

            const clipboard = event.clipboardData || window.clipboardData;
            const textoPegado = clipboard ? clipboard.getData('text') : '';

            if (!textoPegado) return;

            const textoLimpio = textoPegado.replace(/\s/g, '');

            const start = this.selectionStart;
            const end = this.selectionEnd;

            let resultadoFinal = this.value.substring(0, start) + textoLimpio + this.value.substring(end);

            if (resultadoFinal.length > 100) {
                resultadoFinal = resultadoFinal.slice(0, 100);
            }

            this.value = resultadoFinal;

            // Coloca el cursor al final del texto 
            const nuevaPosicion = start + textoLimpio.length;
            this.setSelectionRange(nuevaPosicion, nuevaPosicion);

            const validarCorreo = (value) => {
                const estructuraCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;

                if (value === "") {
                    inputEmail.style.borderColor = '';
                } else if (estructuraCorreo.test(value)) { 
                    inputEmail.style.borderColor = '';
                } else {
                    inputEmail.style.borderColor = 'red';
                }
            };

            validarCorreo(inputEmail.value);
        });
    }

    const inputsContrasenas = [
        document.getElementById('pass-nueva'),
        document.getElementById('pass-confirmar'),
        document.getElementById('pass-actual')
    ];


    const validarContraseña = (value, inputElement) => {
        if (!inputElement) return;

        const estructuraContrasena = /^(?=.*[._%+@#$?!&*-])[a-zA-Z0-9._%+-@#$?!&*]{8,30}$/;

        if (value === "") {
            inputElement.style.borderColor = '';
        } else if (estructuraContrasena.test(value)) { 
            inputElement.style.borderColor = '';
        } else {
            inputElement.style.borderColor = 'red';
        }
    };

    inputsContrasenas.forEach(input => {
        if (input) {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                
                validarContraseña(value, input);
            });
        }
    });

});

    let toastTimer;
    function showAlert(msg) {
        const t = document.getElementById('toast');
        if (!t) return;

        t.textContent = msg;
        
        t.style.transform = 'translateX(-50%) translateY(0)';
        t.style.opacity = '1';

        clearTimeout(toastTimer);
        
        toastTimer = setTimeout(() => { 
            t.style.transform = 'translateX(-50%) translateY(-100px)'; 
            t.style.opacity = '0'; 
        }, 4000);
    }

(function() {
    const nombreReal = sessionStorage.getItem('usuarioNombre');
    const rol = sessionStorage.getItem('usuarioRol');

    if (!nombreReal || !rol) {
        window.location.href = 'Inicio_sesion.html'; 
        return;
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.body.style.visibility = 'visible';
        
        const nombreDisplay = document.getElementById('nombre-display');
        if (nombreDisplay) {
            nombreDisplay.textContent = nombreReal;
        }

        const botonPerfil = document.getElementById('boton-perfil');
        if (botonPerfil) {
            botonPerfil.addEventListener('click', (e) => {
                e.preventDefault();
                if (rol === 'Empleado') {
                    abrirModalPerfil(); 
                } else {
                    window.location.href = 'cuenta.html';
                }
            });
        }
        
        inicializarEventosPerfil();
    });
})();

async function abrirModalPerfil() {
    const modal = document.getElementById('modal-perfil');
    const documentoActual = sessionStorage.getItem('usuarioId'); 

    if (!documentoActual) return console.error("No hay documento de identidad en la sesión.");

    try {
        const respuesta = await fetch(`/obtener-perfil/${documentoActual}`);
        if (!respuesta.ok) throw new Error("Error al obtener datos del servidor.");
        
        const datos = await respuesta.json();

        document.getElementById('perfil-badge-rol').textContent = datos.rol || 'Empleado';
        document.getElementById('perfil-tipo-doc').value       = datos.tipo_documento || '';
        document.getElementById('perfil-documento').value      = datos.documento || '';
        document.getElementById('perfil-nombre').value         = datos.nombre || '';
        document.getElementById('perfil-apellido').value       = datos.apellido || '';
        document.getElementById('perfil-usuario').value        = datos.usuario || '';
        document.getElementById('perfil-telefono').value       = datos.telefono || '';
        document.getElementById('perfil-correo').value         = datos.correo || '';

        modal.style.display = 'flex';

    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        showAlert("No se pudieron cargar los datos de tu perfil.");
    }
}

function inicializarEventosPerfil() {
    const modal = document.getElementById('modal-perfil');
    const btnCambiarPass = document.getElementById('btn-cambiar-pass');
    const seccionPassword = document.getElementById('seccion-password');

    document.getElementById('cerrar-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    const passActual = document.getElementById('pass-actual');
    if (btnCambiarPass) {
        btnCambiarPass.addEventListener('click', () => {
            if (passActual.value === "" ) {
                showAlert("Por favor, ingresa tu contraseña actual para habilitar el cambio.");
                return;
            }
            seccionPassword.style.display = 'block';
            btnCambiarPass.innerText = "Guardar nueva contraseña";
        });
    }

    document.getElementById('btn-guardar-perfil').addEventListener('click', guardarCambiosPerfil);
}

async function guardarCambiosPerfil() {
    const documento = sessionStorage.getItem('usuarioId');

    const datosParaEnviar = {
        tipo_documento: document.getElementById('perfil-tipo-doc').value,
        nombre:         document.getElementById('perfil-nombre').value.trim(),
        apellido:       document.getElementById('perfil-apellido').value.trim(),
        usuario:        document.getElementById('perfil-usuario').value.trim(),
        telefono:       document.getElementById('perfil-telefono').value.trim(),
        correo:         document.getElementById('perfil-correo').value.trim(),
        contrasena:     "" 
    };

    if (!datosParaEnviar.nombre || !datosParaEnviar.apellido || !datosParaEnviar.usuario || !datosParaEnviar.correo) {
        showAlert("Los campos obligatorios de tu cuenta no pueden quedar vacíos.");
        return;
    }

    try {
        const respuesta = await fetch(`/editar-usuario/${documento}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosParaEnviar)
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            showAlert("Cambios de perfil guardados correctamente.");
            sessionStorage.setItem('usuarioNombre', datosParaEnviar.nombre);
            
            setTimeout(() => {
                document.getElementById('modal-perfil').style.display = 'none';
                location.reload();
            }, 1500);
        } else {
            showAlert(resultado.message || "Hubo un error al guardar los cambios.");
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        showAlert("No se pudo conectar con el servidor.");
    }
}

async function confirmarNuevaContrasena() {
    const documento = sessionStorage.getItem('usuarioId');
    const passActual = document.getElementById('pass-actual').value;
    const passNueva = document.getElementById('pass-nueva').value;

    if (!passActual || !passNueva) {
        showAlert("Por favor, completa ambos campos de contraseña.");
        return;
    }

    const estructuraContrasena = /^(?=.*[._%+@#$?!&*-])[a-zA-Z0-9._%+-@#$?!&*]{8,30}$/;
    
    if (!estructuraContrasena.test(passNueva)) {
        showAlert("La nueva contraseña debe tener entre 8 y 30 caracteres e incluir al menos un símbolo especial (ej: . _ % + @ # $ ? ! & * -).");
        return;
    }

    try {
        const resVerificar = await fetch('/verificar-password-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario: documento, password_ingresada: passActual })
        });

        const dataVerificar = await resVerificar.json();

        if (!dataVerificar.success) {
            showAlert("La contraseña actual ingresada es incorrecta.");
            return;
        }

        const datosEdicion = {
            tipo_documento: document.getElementById('perfil-tipo-doc').value,
            nombre:         document.getElementById('perfil-nombre').value.trim(),
            apellido:       document.getElementById('perfil-apellido').value.trim(),
            usuario:        document.getElementById('perfil-usuario').value.trim(),
            telefono:       document.getElementById('perfil-telefono').value.trim(),
            correo:         document.getElementById('perfil-correo').value.trim(),
            contrasena:     passNueva 
        };

        const resGuardar = await fetch(`/editar-usuario/${documento}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosEdicion)
        });

        if (resGuardar.ok) {
            showAlert("Contraseña modificada con éxito. La interfaz se actualizará.");
            setTimeout(() => location.reload(), 1500);
        } else {
            showAlert("No se pudo procesar la actualización de la clave.");
        }
    } catch (error) {
        console.error("Error en cambio de clave:", error);
        showAlert("Error de conexión durante la validación de seguridad.");
    }
}

function toggleVisibility(idInput, icono) {
    const input = document.getElementById(idInput);
    if (input.type === "password") {
        input.type = "text";
        icono.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = "password";
        icono.classList.replace('fa-eye-slash', 'fa-eye');
    }
}