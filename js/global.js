document.addEventListener('DOMContentLoaded', () => {

    const togglers = document.querySelectorAll(".toggle-password, .toggle-passwordd, .toggle-passwordd-sub");

    const eyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    const eyeClosed = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

    togglers.forEach(btn => {
        btn.addEventListener("click", function() {
            const input = this.parentElement.querySelector("input");
            
            if (input.type === "password") {
                input.type = "text";
                this.innerHTML = eyeClosed; // Cambia a icono tachado
            } else {
                input.type = "password";
                this.innerHTML = eyeOpen; // Vuelve al ojo normal
            }
        });
    });

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
    ];

    const passwordRequisitos = document.getElementById('password-requisitos');
    const validarContraseña = (value, inputElement) => {
        if (!inputElement) return;

        const estructuraContrasena = /^(?=.*[._%+@#$?!&*-])[a-zA-Z0-9._%+-@#$?!&*]{8,30}$/;

        if (value === "") {
            inputElement.style.borderColor = '';
            passwordRequisitos.style.display = 'none';
        } else if (estructuraContrasena.test(value)) { 
            inputElement.style.borderColor = '';
            passwordRequisitos.style.display = 'none';
        } else {
            inputElement.style.borderColor = 'red';
            if (document.activeElement.id === 'pass-nueva') {
                passwordRequisitos.style.display = 'block';
            } 
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


    const passEl = document.getElementById('pass-nueva');

    passEl && passEl.addEventListener('input', () => {
        const v = passEl.value;
        let score = 0;
        if (v.length >= 6)  score++;
        if (v.length >= 10) score++;
        if (/[!@#$%^&*.]/.test(v)) score++;
        if (/[A-Z]/.test(v) && /[0-9]/.test(v)) score++;
        const colors = ['red','#e67e22','#f1c40f','#1eb304'];
        const labels = ['Muy débil','Débil','Buena','Fuerte'];
        [1,2,3,4].forEach(i => {
        document.getElementById('s'+i).style.background = i <= score ? colors[score-1] : '#2e2e2e';
        });
        document.getElementById('strength-label').textContent = v.length ? (labels[score-1]||'') : '';
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

    let toastTimer1;
    function showAlert1(msg) {
        const t = document.getElementById('toast1');
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
    const nombre = sessionStorage.getItem('usuarioNombre');
    const rol = sessionStorage.getItem('usuarioRol');

    if (!nombre || !rol) {
        window.location.href = 'Inicio_sesion.html'; 
        return;
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.body.style.visibility = 'visible';
        const nombreDisplay = document.getElementById('nombre-display');
        if (nombreDisplay) nombreDisplay.textContent = nombre;

        const botonPerfil = document.getElementById('boton-perfil');
        if (botonPerfil) {
            botonPerfil.addEventListener('click', (e) => {
                e.preventDefault();
                if (rol === 'Empleado') abrirModalPerfil(); 
                else window.location.href = 'cuenta.html';
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
        document.getElementById('perfil-tipo-doc').value       = datos.tipo_documento || '';
        document.getElementById('perfil-documento').value      = datos.documento || '';
        document.getElementById('perfil-nombre').value         = datos.nombre || '';
        document.getElementById('perfil-apellido').value       = datos.apellido || '';
        document.getElementById('perfil-usuario').value        = datos.usuario || '';
        document.getElementById('perfil-telefono').value       = datos.telefono || '';
        document.getElementById('perfil-correo').value         = datos.correo || '';

        // Limpia los inputs de contraseñas 
        document.getElementById('pass-nueva').value = '';
        document.getElementById('pass-confirmar').value = '';
        document.getElementById('perfil-telefono').style.borderColor = ''; 
        document.getElementById('perfil-correo').style.borderColor = ''; 
        document.getElementById('pass-nueva').style.borderColor = ''; 
        document.getElementById('pass-confirmar').style.borderColor = ''; 
        document.getElementById('s1').style.background = '#2e2e2e'; 
        document.getElementById('s2').style.background = '#2e2e2e'; 
        document.getElementById('s3').style.background = '#2e2e2e'; 
        document.getElementById('s4').style.background = '#2e2e2e'; 
        document.getElementById('strength-label').textContent = '';
        document.getElementById('password-requisitos').style.display = 'none';
        
        modal.style.display = 'flex';
    } catch (error) {
        console.error("Error en el servidor:", error);
        showAlert("No se pudieron cargar los datos de tu perfil.");
    }
}

function inicializarEventosPerfil() {
    const modal = document.getElementById('modal-perfil');
    const subModal = document.getElementById('sub-modal-confirmar');

    // modal principal
    document.getElementById('cerrar-modal').addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // sub-modal
    document.getElementById('cerrar-sub-modal').addEventListener('click', () => { subModal.style.display = 'none'; });

    document.getElementById('btn-guardar-perfil').addEventListener('click', (e) => {
        e.preventDefault();

        if (!document.getElementById('perfil-nombre').value || !document.getElementById('perfil-apellido').value || !document.getElementById('perfil-telefono').value || !document.getElementById('perfil-correo').value) {
            showAlert("Los campos obligatorios no pueden quedar vacíos.");
            return;
        }

        const telefono = document.getElementById('perfil-telefono').value.trim();

        if (telefono.length !== 10) {
            showAlert("El número de teléfono debe tener 10 dígitos.");
            return;
        } 

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/.test(document.getElementById('perfil-correo').value)) {
            showAlert("El correo electrónico no es válido.");
            return;
        }

        const passNueva = document.getElementById('pass-nueva').value;
        const passConfirmar = document.getElementById('pass-confirmar').value;

        if (passNueva !== "" || passConfirmar !== "") {
            const estructuraContrasena = /^(?=.*[._%+@#$?!&*-])[a-zA-Z0-9._%+-@#$?!&*]{8,30}$/;
            if (!estructuraContrasena.test(passNueva)) {
                showAlert("La nueva contraseña no cumple con los requisitos mínimos de seguridad.");
                return;
            }
            if (passNueva !== passConfirmar) {
                showAlert("La nueva contraseña y su confirmación no coinciden.");
                return;
            }
        }

        document.getElementById('pass-actual-confirmar').value = "";
        subModal.style.display = 'flex';
    });

    document.getElementById('btn-verificar-final').addEventListener('click', ejecutarGuardadoConVerificacion);
}

async function ejecutarGuardadoConVerificacion() {
    const documento = sessionStorage.getItem('usuarioId');
    const passActual = document.getElementById('pass-actual-confirmar').value;
    const passNueva = document.getElementById('pass-nueva').value;

    if (!passActual) {
        showAlert1("Debes escribir tu contraseña actual para confirmar.");
        return;
    }

    try {
        // Verifica la contraseña actual 
        const resVerificar = await fetch('/verificar-password-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documento: documento, password_ingresada: passActual })
        });

        const dataVerificar = await resVerificar.json();

        if (!dataVerificar.success) {
            showAlert1("La contraseña actual ingresada es incorrecta.");
            return;
        }

        // actualiza el perfil
        const datosParaEnviar = {
            nombre:    document.getElementById('perfil-nombre').value.trim(),
            apellido:  document.getElementById('perfil-apellido').value.trim(),
            usuario:   document.getElementById('perfil-usuario').value.trim(),
            telefono:  document.getElementById('perfil-telefono').value.trim(),
            correo:    document.getElementById('perfil-correo').value.trim(),
            contrasena: passNueva 
        };

        if (!datosParaEnviar.nombre || !datosParaEnviar.apellido || !datosParaEnviar.usuario || !datosParaEnviar.correo || !datosParaEnviar.telefono) {
            showAlert1("Los campos obligatorios no pueden quedar vacíos.");
            return;
        }

        const respuesta = await fetch(`/editar-usuario/${documento}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosParaEnviar)
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            showAlert1("Cambios guardados correctamente.");
            sessionStorage.setItem('usuarioNombre', datosParaEnviar.nombre);
            
            setTimeout(() => {
                document.getElementById('sub-modal-confirmar').style.display = 'none';
                document.getElementById('modal-perfil').style.display = 'none';
                location.reload();
            }, 1500);
        } else {
            showAlert1(resultado.message || "Hubo un error al guardar los cambios.");
        }

    } catch (error) {
        console.error("Error en el proceso de guardado:", error);
        showAlert1("Error en el servidor.");
    }
}



