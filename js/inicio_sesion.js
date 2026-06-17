document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('login-form');
    const registroForm = document.getElementById('registro-form');
    const modalRegistro = document.getElementById('modal-registro');
    const btnAbrirRegistro = document.getElementById('abrir-registro');
    const btnCerrarModal = document.getElementById('cerrar-modal');
    const errorMessage = document.getElementById('error-message');

    // Ajustar visibilidad del campo de la clave de autorización
    async function ajustarInterfazRegistro() {
        try {
            const response = await fetch('/obtener-usuarios');
            const usuarios = await response.json();
            const hayGerente = usuarios.some(u => u.rol === 'Gerente');
            
            const contenedorKey = document.getElementById('contenedor-admin-key');
            const inputKey = document.getElementById('admin-key');

            if (contenedorKey) {
                contenedorKey.style.display = hayGerente ? 'block' : 'none';
            }
            if (inputKey) {
                inputKey.required = false; 
            }
        } catch (error) {

        }
    }

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

    // Control de Modal
    btnAbrirRegistro.addEventListener('click', (e) => {
        e.preventDefault();
        ajustarInterfazRegistro(); 
        modalRegistro.style.display = 'flex';
    });

    btnCerrarModal.addEventListener('click', () => modalRegistro.style.display = 'none');

    window.addEventListener('click', (e) => {
        if (e.target === modalRegistro) modalRegistro.style.display = 'none'; 
    });

    // Inicio de Sesión
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usuario = document.getElementById('usuario').value.trim();
        const contrasena = document.getElementById('contrasena').value.trim();

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, contrasena})
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                showAlert1(message = data.message );
                return; 
            }

            sessionStorage.setItem('usuarioId', data.documento);
            sessionStorage.setItem('usuarioNombre', data.nombre);
            sessionStorage.setItem('usuarioRol', data.rol);

            window.location.href = 'inicio.html';

        } catch (error) {
            console.error(error);
            showAlert1('Error de conexión al intentar iniciar sesión.');
        }
    });

    const inputDocumento = document.getElementById('numero-documento');
    const selectTipoDoc = document.getElementById('tipo-documento');

    function obtenerReglasDocumento() {
        const tipo = selectTipoDoc ? selectTipoDoc.value : 'CC';
        switch (tipo) {
            case 'CC':  return { regex: /^\d{9,10}$/, minLength:9, maxLength: 10, soloNumeros: true };
            case 'CE':  return { regex: /^\d{6,15}$/, minLength:6, maxLength: 15, soloNumeros: true };
            case 'PPT': return { regex: /^\d{6,8}$/, minLength:6, maxLength: 8, soloNumeros: true };
            case 'PA':  return { regex: /^[a-zA-Z0-9]{6,15}$/, minLength:6, maxLength: 15, soloNumeros: false };
        }
    }

    // Limpia el borde 
    if (selectTipoDoc) {
        selectTipoDoc.addEventListener('change', () => {
            inputDocumento.value = '';
            inputDocumento.style.borderColor = '';
        });
    }

    inputDocumento.addEventListener('keydown', function(event) {
        const reglas = obtenerReglasDocumento();
        const teclasPermitidas = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
        
        if (event.ctrlKey || event.metaKey || teclasPermitidas.includes(event.key)) {
            return; 
        }

        if (event.key === ' ') {
            event.preventDefault();
            return;
        }

        if (reglas.soloNumeros && !/^[0-9]$/.test(event.key)) {
            event.preventDefault();
            return;
        }
        if (!reglas.soloNumeros && !/^[a-zA-Z0-9]$/.test(event.key)) {
            event.preventDefault();
            return;
        }

        if (this.value.length >= reglas.maxLength && this.selectionStart === this.selectionEnd) {
            event.preventDefault();
            return;
        }
    });

    inputDocumento.addEventListener('input', function() {
        const reglas = obtenerReglasDocumento();

        if (this.value.length > reglas.maxLength) {
            this.value = this.value.slice(0, reglas.maxLength);
        }

        if (this.value === "") {
            this.style.borderColor = '';
        } else if (reglas.regex.test(this.value)) { 
            this.style.borderColor = ''; 
        } else {
            this.style.borderColor = 'red'; 
        }
    });

    inputDocumento.addEventListener('paste', function(event) {
        event.preventDefault(); 
        const reglas = obtenerReglasDocumento();
        const clipboard = event.clipboardData || window.clipboardData;
        const texto = clipboard ? clipboard.getData('text').trim() : '';
        
        const textoFiltrado = reglas.soloNumeros ? texto.replace(/[^0-9]/g, '') : texto.replace(/[^a-zA-Z0-9]/g, '');
        if (!textoFiltrado) return;

        const inicio = this.selectionStart;
        const fin = this.selectionEnd;
        let textoUnido = this.value.substring(0, inicio) + textoFiltrado + this.value.substring(fin);

        if (textoUnido.length > reglas.maxLength) {
            textoUnido = textoUnido.slice(0, reglas.maxLength);
        }

        this.value = textoUnido;

        if (this.value === "") {
            this.style.borderColor = '';
        } else if (reglas.regex.test(this.value)) {
            this.style.borderColor = '';
        } else {
            this.style.borderColor = 'red';
        }
    });

    // Registro de Usuario
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datos = {
            documento: document.getElementById('numero-documento').value.trim(),
            tipo_documento: document.getElementById('tipo-documento').value.trim(),
            nombre: document.getElementById('nombre').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            usuario: document.getElementById('usuario-registro').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            correo: document.getElementById('gmail').value.trim(),
            contrasena: document.getElementById('password').value.trim(),
            confirmar_contrasena: document.getElementById('confirmar-contrasena').value.trim(),
            admin_key: document.getElementById('admin-key').value.trim() 
        };

        const reglas = obtenerReglasDocumento();
        if (!reglas.regex.test(datos.documento)) {
            let minimo = 0;
            switch (datos.tipo_documento) {
                case 'CC':  minimo = 9; break;
                case 'CE':  minimo = 6; break;
                case 'PPT': minimo = 6; break;
                case 'PA':  minimo = 6; break;
            }

            showAlert(`El número de documento no es válido para ${datos.tipo_documento}. Debe tener un mínimo de ${minimo} caracteres.`);
            return;
        }

        // Validación de contraseñas
        if (datos.contrasena !== datos.confirmar_contrasena) {
            showAlert("Las contraseñas no coinciden. Por favor, verifícalas.");
            return; 
        }

        try {
            const response = await fetch('/guardar-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const data = await response.json();
            
            if (data.success) {
                showAlert(data.message);
                setTimeout(() => location.reload(), 2000);
            } else {
                showAlert(data.message);
            }
        } catch (error) {
            showAlert('Error al intentar registrar el usuario.');
        }
    });

    const togglers = document.querySelectorAll(".toggle-password, .toggle-passwordd");

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
        document.getElementById('nombre'),
        document.getElementById('apellido')
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

    const inputsUsuario = [
        document.getElementById('usuario'),
        document.getElementById('usuario-registro') 
    ];

    const manejarTecladoUsuario = function(event) {
        const tecla = event.key;

        const teclasPermitidas = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
        if (teclasPermitidas.includes(tecla) || event.ctrlKey || event.metaKey) {
        return;
        }

        if (tecla === ' ') { //  boquea espacios
        event.preventDefault();
        return;
        }
    };

    const manejarEscrituraUsuario = function() {
        const posicionCursor = this.selectionStart;

        // Elimina espacios y solo permite 30 caracteres
        const textoSinEspacios = this.value.replace(/\s/g, '').slice(0, 30);

        if (this.value !== textoSinEspacios) {
        this.value = textoSinEspacios;
        this.setSelectionRange(posicionCursor - 1, posicionCursor - 1);
        }
    };

    const manejarPegadoUsuario = function(event) {
        event.preventDefault(); // Detiene el pegado del navegador

        const clipboard = event.clipboardData || window.clipboardData;
        const textoPegado = clipboard ? clipboard.getData('text') : '';

        if (!textoPegado) return;

        // Elimina espacios
        const textoLimpio = textoPegado.replace(/\s/g, '');

        const start = this.selectionStart;
        const end = this.selectionEnd;

        let resultadoFinal = this.value.substring(0, start) + textoLimpio + this.value.substring(end);

        if (resultadoFinal.length > 30) {
        resultadoFinal = resultadoFinal.slice(0, 30);
        }

        const caracteresAgregados = resultadoFinal.length - (this.value.length - (end - start));

        this.value = resultadoFinal;

        this.setSelectionRange(start + caracteresAgregados, start + caracteresAgregados);
    };

    inputsUsuario.forEach(input => {
        if (input) { // Verifica que el input exista
            input.addEventListener('keydown', manejarTecladoUsuario);
            input.addEventListener('input', manejarEscrituraUsuario);
            input.addEventListener('paste', manejarPegadoUsuario);
        }
    });

    const inputTelefono = document.getElementById('telefono');

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

    const inputEmail = document.getElementById('gmail');

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
        document.getElementById('password'),
        document.getElementById('confirmar-contrasena'),
        document.getElementById('admin-key'),
        document.getElementById('contrasena')
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