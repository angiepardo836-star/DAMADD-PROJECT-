document.addEventListener('DOMContentLoaded', () => {
    const togglers = document.querySelectorAll(".toggle-passwordd");

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

  const inputEmail = document.getElementById('email');

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
        document.getElementById('login-pass'),
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
            if (document.activeElement.id === 'login-pass') {
                passwordRequisitos.style.top = '129%';
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

  const formPaso1 = document.getElementById('form-paso1');
  const formPaso2 = document.getElementById('form-paso2');
  const formPaso3 = document.getElementById('form-paso3');

  const cardPaso1 = document.getElementById('forgot-step1');
  const cardPaso2 = document.getElementById('forgot-step2');
  const cardPaso3 = document.getElementById('forgot-step3');

  const emailInput = document.getElementById('email');
  const emailShow = document.getElementById('forgot-email-show');
  const toast = document.getElementById('toast');

  const btnEnviar = document.getElementById('btn-enviar');
  const btnVerificar = document.getElementById('btn-verificar');
  const btnReenviar = document.getElementById('btn-reenviar');

  let correoUsuario = "";
  let intentosCodigo = 0;

  const inputsBolasIds = ['fcd0', 'fcd1', 'fcd2', 'fcd3', 'fcd4', 'fcd5'];

    // Alerta
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

    // Configuración de inputs de código
    inputsBolasIds.forEach((id, index) => {
        const input = document.getElementById(id);
        if (!input) return;

        input.addEventListener('keydown', (e) => {
            const key = e.key;

            if (key === 'ArrowLeft' || (key === 'Backspace' && !input.value)) {
                if (index > 0) {
                    e.preventDefault(); 
                    const inputAnterior = document.getElementById(inputsBolasIds[index - 1]);
                    inputAnterior.focus();
                    setTimeout(() => inputAnterior.select(), 0); 
                }
                return;
            }

            if (key === 'ArrowRight') {
                if (index < inputsBolasIds.length - 1) {
                    e.preventDefault();
                    const inputSiguiente = document.getElementById(inputsBolasIds[index + 1]);
                    inputSiguiente.focus();
                    setTimeout(() => inputSiguiente.select(), 0);
                }
                return;
            }

            if (key === 'Backspace') {
                return true; 
            }

            if (key === ' ' || isNaN(key) || key === 'Unidentified') {
                if (key.length > 1) return true; 
              
                e.preventDefault();
                return false;
            }

            if (!isNaN(key) && key.length === 1) {
                e.preventDefault(); 
                input.value = key;  

                if (index < inputsBolasIds.length - 1) {
                    const inputSiguiente = document.getElementById(inputsBolasIds[index + 1]);
                    inputSiguiente.focus();
                    setTimeout(() => inputSiguiente.select(), 0);
                }
            }
        });

        input.addEventListener('click', () => {
            input.select();
        });
    });

  // Une los dígitos en un solo string 
  function obtenerCodigoCompleto() {
      return inputsBolasIds.map(id => document.getElementById(id).value).join('');
  }

  // Limpia los inputs 
  function limpiarBolas() {
    inputsBolasIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const primeraBola = document.getElementById(inputsBolasIds[0]);
    if (primeraBola) primeraBola.focus();
  };

  // PASO 1: SOLICITAR CÓDIGO (ENVÍO DE CORREO)
  formPaso1.addEventListener('submit', async (e) => {
    e.preventDefault();

    intentosCodigo = 0;
    btnVerificar.disabled = false;
      
    correoUsuario = emailInput.value.trim();
    if (!correoUsuario) return;

    btnEnviar.innerText = "Enviando...";
    btnEnviar.disabled = true;

    try {
        const response = await fetch('/olvido-contrasena', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: correoUsuario })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showAlert(data.message, false); 
              
            cardPaso1.classList.add('hidden');
            cardPaso2.classList.remove('hidden');
            emailShow.innerText = correoUsuario;
              
            document.getElementById(inputsBolasIds[0]).focus();
        } else {
            showAlert(data.message || "No se pudo procesar la solicitud.");
        }
    } catch (error) {
        console.error("Error Paso 1:", error);
        showAlert("Error en el servidor.");
    } finally {
        btnEnviar.innerText = "Enviar código de recuperación";
        btnEnviar.disabled = false;
    }
  });

  //Reenviar código
  btnReenviar.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!correoUsuario) {
        correoUsuario = emailInput.value.trim();
    }

    if (!correoUsuario) {
        showAlert("Ingresa tu correo");
        return;
    }
    btnReenviar.innerText = "Reenviando...";
    try {
        const response = await fetch('/olvido-contrasena', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: correoUsuario })
        });
        const data = await response.json();
          
        if (response.ok && data.success) {
            btnVerificar.innerText = "Verificar código";
            btnVerificar.disabled = false;
            limpiarBolas();
            showAlert("Nuevo código enviado.", false);
            intentosCodigo = 0;
        } else {
            showAlert(data.message);
        }
    } catch (error) {
        showAlert("Error al intentar reenviar.");
    } finally {
        btnReenviar.innerText = "Reenviar código";
    }
  });

  // PASO 2: VERIFICAR EL CÓDIGO 
  formPaso2.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (intentosCodigo === 3) {
        showAlert("Has alcanzado el número de intentos permitidos.");
        btnVerificar.disabled = true;
        btnVerificar.innerText = "Código bloqueado";
        return;
    }

    const codigoIngresado = obtenerCodigoCompleto();

    if (codigoIngresado.length < 6) {
        showAlert("Ingresa el código completo.");
        return;
    }

    btnVerificar.innerText = "Validando...";
    btnVerificar.disabled = true;

    try {
        const response = await fetch('/verificar-codigo-recuperacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                correo: correoUsuario,
                codigo: codigoIngresado 
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showAlert(data.message, false);
              
            cardPaso2.classList.add('hidden');
            cardPaso3.classList.remove('hidden');
        } else {
            intentosCodigo++;
            if (intentosCodigo >= 3) {
                showAlert(`Código incorrecto. Has alcanzado el número de intentos permitidos.`);
                btnVerificar.disabled = true;
                btnVerificar.innerText = "Código bloqueado";
                limpiarBolas();
                return;
            } else {
                const intentosRestantes = 3 - intentosCodigo;
                showAlert("Código incorrecto." + (intentosRestantes > 0 ? ` Intentos restantes: ${intentosRestantes}.` : ""));
                inputsBolasIds.forEach(id => document.getElementById(id).value = ''); // Limpia campos
                document.getElementById(inputsBolasIds[0]).focus(); // Reinicia cursor
                btnVerificar.innerText = "Verificar código";
                btnVerificar.disabled = false;
            }
        }
    } catch (error) {
        console.error("Error Paso 2:", error);
        showAlert("Error en el servidor.");
        btnVerificar.innerText = "Verificar código";
        btnVerificar.disabled = false;
    } 
  });


  // PASO 3: ACTUALIZAR CONTRASEÑA
  formPaso3.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevaPass = document.getElementById('login-pass').value.trim();
    const confirmarPass = document.getElementById('login-pass-confirm').value.trim();

    const estructuraContrasena = /^(?=.*[._%+@#$?!&*-])[a-zA-Z0-9._%+-@#$?!&*]{8,30}$/;
      
    if (!estructuraContrasena.test(nuevaPass)) {
        showAlert("La contraseña debe tener al menos 8 caracteres y 1 carácter especial.");
        return;
    }

    if (nuevaPass !== confirmarPass) {
        showAlert("Las contraseñas no coinciden.");
        return;
    }

    const btnGuardar = document.getElementById('btn-guardar');
    btnGuardar.innerText = "Guardando...";
    btnGuardar.disabled = true;

    try {
        const response = await fetch('/actualizar-contrasena-recuperacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                correo: correoUsuario,
                nueva_pass: nuevaPass 
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showAlert("Contraseña actualizada con éxito.", false);
            setTimeout(() => { 
                window.location.href = "inicio_sesion.html";
            }, 2000);
        } else {
            showAlert(data.message || "No se pudo actualizar la contraseña.");
        }
    } catch (error) {
        console.error("Error Paso 3:", error);
        showAlert("Error en el servidor.");
    } finally {
        btnGuardar.innerText = "Guardar contraseña";
        btnGuardar.disabled = false;
    }
  });

    const passEl = document.getElementById('login-pass');

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


});