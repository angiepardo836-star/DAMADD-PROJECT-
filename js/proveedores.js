let toastTimer3;
    function showAlert3(msg) {
        const t = document.getElementById('toast3');
        if (!t) return;

        t.textContent = msg;
        
        t.style.transform = 'translateX(-50%) translateY(0)';
        t.style.opacity = '1';

        clearTimeout(toastTimer3);
        
        toastTimer3 = setTimeout(() => { 
            t.style.transform = 'translateX(-50%) translateY(-100px)'; 
            t.style.opacity = '0'; 
        }, 4000);
    }

// Ejecuta la carga de datos en cuanto abre la página
document.addEventListener('DOMContentLoaded', () => {
    obtenerProveedores();
});
let idProveedorAEliminar = null;


//  LEER (MOSTRAR DATOS)
async function obtenerProveedores() {
    try {
        const respuesta = await fetch('/obtener-proveedores');
        const proveedores = await respuesta.json();
 
        const tbody = document.getElementById('cuerpoTabla');
        if (!tbody) return;
 
        tbody.innerHTML = "";
 
        proveedores.forEach(p => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', p.documento);
            tr.innerHTML = `
                <td><span class="badge-tipo">${p.tipo_documento}</span></td>
                <td><span class="badge-doc">${p.documento}</span></td>
                <td>${p.nombre}</td>
                <td>${p.apellido || 'N/A'}</td>
                <td>${p.telefono}</td>
                <td>${p.ciudad}</td>
                <td>${p.direccion}</td>
                <td>
                    <span class="${p.estado === 'Activo' ? 'estado-activo' : 'estado-inactivo'}">
                        ${p.estado}
                    </span>
                </td>
                <td class="correo-cell">${p.correo}</td>

                <td>
                    <div class="acciones">
                        <button class="btn-accion-editar" onclick="editarFila(this)" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button class="btn-accion-eliminar"
                                onclick="mostrarModalEliminarProveedor(${p.documento})"
                                title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>

                        <button class="btn-accion-comprar"
                                onclick="realizarCompra(${p.documento}, '${p.nombre}')"
                                title="Comprar">
                            <i class="fa-solid fa-cart-shopping"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
 
    } catch (error) {
        console.error("Error al obtener proveedores:", error);
    }
}

//  CREAR (GUARDAR NUEVO)
async function saveNew() {
    const tipo_documento = document.getElementById('new_tipo_documento').value.trim();
    const documento      = document.getElementById('new_documento').value.trim();
    const nombre         = document.getElementById('new_nombre').value.trim();
    const apellidoRaw = document.getElementById('new_apellido').value.trim();
    const apellido = apellidoRaw === "" ? null : apellidoRaw;
    const telefono       = document.getElementById('new_telefono').value.trim();
    const ciudad         = document.getElementById('new_ciudad').value.trim();
    const direccion      = document.getElementById('new_direccion').value.trim();
    const estado         = document.getElementById('new_estado').value.trim();
    const correo         = document.getElementById('new_correo').value.trim();


    if (!tipo_documento || !documento || !nombre  || !telefono || !ciudad || !direccion || !estado || !correo) {
        showAlert3("Todos los campos son obligatorios. Por favor, completa el formulario.");
        return;
    }

    if (!/^[^\s@]+@gmail\.com$/.test(correo)) {
        showAlert3("El correo debe tener formato válido: algo@gmail.com");
        return;
    }

    if (!/^[36][0-9]{9}$/.test(telefono)) {
        showAlert3("El teléfono debe tener 10 dígitos y empezar con 3 o 6.");
        return;
    }

    const datos = { tipo_documento, documento, nombre, apellido, telefono, ciudad, direccion, estado, correo };

    try {
        const response = await fetch('/guardar-proveedor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            showAlert3("Proveedor agregado correctamente.");
            closeAddModal();
            location.reload();
        } else {
            const msg = await response.text();
            showAlert3("Error: " + msg);
        }
    } catch (error) {
        console.error("Error al agregar proveedor:", error);
        showAlert3("Error: " + error.message);
    }
}
    function cerrarModal() {
        closeAddModal();
        limpiarFormularioRegistro();}

        
// Eliminar proveedor
async function eliminarProveedor(id) {
    try {
        const response = await fetch(`/eliminar-proveedor/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert3("Proveedor eliminado correctamente.");

            const modal = document.getElementById("modalEliminarProveedor");
            if (modal) {
                modal.style.display = "none";
            }

            idProveedorAEliminar = null;

            obtenerProveedores();
        } else {
            showAlert3("Error al eliminar proveedor.");
        }

    } catch (error) {
        console.error("Error al eliminar:", error);
        showAlert3("Error: " + error.message);
    }
}
document.addEventListener("DOMContentLoaded", () => {

    const btnEliminar = document.getElementById("btnConfirmarEliminarProveedor");

    if (btnEliminar) {
        btnEliminar.addEventListener("click", () => {

            if (idProveedorAEliminar !== null) {
                eliminarProveedor(idProveedorAEliminar);
            }

        });
    }

});

//  EDITAR EN LÍNEA 

function editarFila(btn) {
    const fila = btn.closest("tr");
    const celdas = fila.getElementsByTagName("td");


// Nombre
    const nombreInput = crearInputTexto(celdas[2].innerText.trim());
    agregarValidacionNombreApellido(nombreInput);
    celdas[2].innerHTML = '';
    celdas[2].appendChild(nombreInput);

// Apellido
    const apellidoInput = crearInputTexto(celdas[3].innerText.trim());
    agregarValidacionNombreApellido(apellidoInput);
    celdas[3].innerHTML = '';
    celdas[3].appendChild(apellidoInput);

// Teléfono
    const telefonoInput = crearInputTexto(celdas[4].innerText.trim());
    agregarValidacionTelefono(telefonoInput);
    celdas[4].innerHTML = '';
    celdas[4].appendChild(telefonoInput);

 // Ciudad
    const ciudadInput = crearInputTexto(celdas[5].innerText.trim());
    agregarValidacionCiudad(ciudadInput);
    celdas[5].innerHTML = '';
    celdas[5].appendChild(ciudadInput);

// Dirección
    const direccionInput = crearInputTexto(celdas[6].innerText.trim());
    agregarValidacionDireccion(direccionInput);
    celdas[6].innerHTML = '';
    celdas[6].appendChild(direccionInput);


// Estado
    const estadoActual = celdas[7].innerText.trim();
    celdas[7].innerHTML = `
    <select class="select-editar">
        <option value="Activo" ${estadoActual === 'Activo' ? 'selected' : ''}>Activo</option>
        <option value="Inactivo" ${estadoActual === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
    </select>`;

    btn.innerHTML = '<i class="fas fa-save"></i>';
    btn.onclick = function () { guardarEdicion(this); };

    // Correo

    const correoInput = crearInputTexto(celdas[8].innerText.trim());
    agregarValidacionCorreo(correoInput);
    celdas[8].innerHTML = '';
    celdas[8].appendChild(correoInput);
}


function crearInputTexto(valor) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = valor;
    input.className = "input-editar";
    return input;
}


//  GUARDAR EDICIÓN
async function guardarEdicion(btn) {
    const fila = btn.closest("tr");
    const celdas = fila.getElementsByTagName("td");

    const documentoOriginal = fila.getAttribute('data-id');

    const tipo_documento = (celdas[0].querySelector('span') || celdas[0]).innerText.trim();
    const documento      = (celdas[1].querySelector('span') || celdas[1]).innerText.trim();
    const nombre         = celdas[2].querySelector("input").value.trim();
    const apellidoTexto = celdas[3].querySelector("input").value.trim();
    const apellido = (apellidoTexto === "" || apellidoTexto === "N/A") ? null : apellidoTexto;
    const telefono       = celdas[4].querySelector("input").value.trim();
    const ciudad         = celdas[5].querySelector("input").value.trim();
    const direccion      = celdas[6].querySelector("input").value.trim();
    const estado         = celdas[7].querySelector("select").value.trim();
    const correo         = celdas[8].querySelector("input").value.trim();


    
    if (!tipo_documento || !documento || !nombre  || !telefono || !ciudad || !direccion || !estado || !correo) {
        showAlert3("Todos los campos son obligatorios.");
        return;
    }

    if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{1,75}$/.test(nombre)) {
        showAlert3("El nombre solo debe contener letras y tener máximo 3 palabras.");
        return;
    }

    if (apellido && !/^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{1,75}$/.test(apellido)) {
        showAlert3("El apellido solo debe contener letras y tener máximo 3 palabras.");
        return;
    }


    if (!/^[^\s@]+@gmail\.com$/.test(correo)) {
        showAlert3("El correo debe tener formato válido: algo@gmail.com");
        return;
    }

    if (!/^[36][0-9]{9}$/.test(telefono)) {
        showAlert3("El teléfono debe tener 10 dígitos y empezar con 3 o 6.");
        return;
    }
   

    const datos = { tipo_documento, documento, nombre, apellido, telefono, ciudad, direccion, estado, correo };

    try {
        const response = await fetch(`/editar-proveedor/${documento}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            showAlert3("Proveedor actualizado correctamente.");
            obtenerProveedores();
        } else {
            showAlert3("Error al actualizar proveedor.");
        }
    } catch (error) {
        console.error("Error al actualizar:", error);
        showAlert3("Error al actualizar proveedor.");
    }
}


//  BUSCADOR / FILTRADO

function filtrarTabla() {
    const input  = document.getElementById("buscador");
    const filtro = input.value.toUpperCase();
    const tabla  = document.getElementById("tablaProveedores");
    const filas  = tabla.getElementsByTagName("tr");

    for (let i = 1; i < filas.length; i++) {
        const celdas  = filas[i].getElementsByTagName("td");
        let coincide  = false;

        for (let j = 0; j < celdas.length - 1; j++) {
            const celda  = celdas[j];
            celda.innerHTML = celda.innerText;

            const texto  = celda.innerText;
            const upper  = texto.toUpperCase();

            if (upper.includes(filtro) && filtro !== "") {
                const index    = upper.indexOf(filtro);
                const original = texto;
                celda.innerHTML = original.substring(0, index) +
                    "<mark>" + original.substring(index, index + filtro.length) + "</mark>" +
                    original.substring(index + filtro.length);
                coincide = true;
            } else if (upper.includes(filtro)) {
                coincide = true;
            }
        }
        filas[i].style.display = coincide ? " " : "none";
    }
}


//  CONTROL DE MODALES
function openAddModal()  { document.getElementById('addProductModal').style.display = 'flex'; }
function closeAddModal() { document.getElementById('addProductModal').style.display = 'none'; }

function limpiarFormularioRegistro() {
    ['new_tipo_documento','new_documento','new_nombre','new_apellido',
     'new_telefono','new_ciudad','new_direccion','new_correo','new_estado']
        .forEach(id => { document.getElementById(id).value = ""; });
}


//  REALIZAR COMPRA (MODAL)
let compraProveedorId = null;

function realizarCompra(idProv, nombreProv) {
    compraProveedorId = idProv;
    document.getElementById('modalCompraTexto').textContent =
        `Completa los datos de la compra a ${nombreProv}.`;
    document.getElementById('formRegistrarCompra').reset();
    document.getElementById('modalRegistrarCompra').style.display = 'flex';
}

function cerrarModalCompra() {
    document.getElementById('modalRegistrarCompra').style.display = 'none';
    compraProveedorId = null;
}
document.addEventListener('DOMContentLoaded', () => {

    //  Formato precio con separador de miles
    const inputPrecioCompra = document.getElementById('inputPrecioUnitario');
    if (inputPrecioCompra) {
        inputPrecioCompra.addEventListener('input', function () {
            let valor = this.value.replace(/[^0-9]/g, '');
            if (valor) {
                valor = parseInt(valor).toLocaleString('es-CO');
            }
            this.value = valor;
        });

        // Bloquea el signo menos y letras al escribir
        inputPrecioCompra.addEventListener('keydown', function (event) {
            const teclasPermitidas = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'];
            if (teclasPermitidas.includes(event.key) || event.ctrlKey || event.metaKey) return;
            if (!/^[0-9]$/.test(event.key)) { event.preventDefault(); return; }
        });
    }

    //  Bloquear negativos en ID producto y Cantidad 
    ['inputIdProducto', 'inputCantidad'].forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;

        input.addEventListener('keydown', function (event) {
            const teclasPermitidas = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'];
            if (teclasPermitidas.includes(event.key) || event.ctrlKey || event.metaKey) return;
            // Bloquea "-", "+", "e"/"E" (notación científica) y cualquier no dígito
            if (!/^[0-9]$/.test(event.key)) { event.preventDefault(); return; }
        });

        input.addEventListener('input', function () {
            // Por si se pega un valor negativo o con letras
            let limpio = this.value.replace(/[^0-9]/g, '');
            if (this.value !== limpio) this.value = limpio;
        });

        input.addEventListener('paste', function (event) {
            event.preventDefault();
            const clipboard = event.clipboardData || window.clipboardData;
            const texto = clipboard ? clipboard.getData('text') : '';
            const limpio = texto.replace(/[^0-9]/g, '');
            if (limpio) this.value = limpio;
        });
    });

//  Envío del formulario 
    const form = document.getElementById('formRegistrarCompra');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const idProd = document.getElementById('inputIdProducto').value.trim();
            const cant   = document.getElementById('inputCantidad').value.trim();
            const precioTexto = document.getElementById('inputPrecioUnitario').value.trim();
            const precio = precioTexto.replace(/[^0-9]/g, ''); 
            const pago   = document.getElementById('selectMetodoPago').value;

            if (!idProd || !cant || !precio || !pago) {
                showAlert3("Todos los campos son obligatorios.");
                return;
            }

            if (isNaN(idProd) || isNaN(cant) || isNaN(precio)
                || Number(idProd) <= 0 || Number(cant) <= 0 || Number(precio) <= 0) {
                showAlert3("Ingresa valores numéricos válidos y mayores a 0.");
                return;
            }

            const documentoUsuario = sessionStorage.getItem('usuarioId');
            if (!documentoUsuario) {
                showAlert3("No se encontró el usuario en sesión. Vuelve a iniciar sesión.");
                return;
            }

            const datos = {
                documento_proveedor: compraProveedorId,
                documento_usuario: documentoUsuario,
                id_producto: parseInt(idProd),
                cantidad: parseInt(cant),
                precio_unitario: parseFloat(precio),
                forma_pago: pago
            };

            const btn = document.getElementById('btnAceptarCompra');
            btn.disabled = true;
            btn.textContent = 'Guardando...';

            try {
                const res = await fetch('/registrar-compra', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                if (res.ok) {
                    showAlert3("¡Compra registrada con éxito!");
                    cerrarModalCompra();
                } else {
                    const mensajeError = await res.text();
                    showAlert3("Error: " + mensajeError);                
                }
            } catch (error) {
                console.error("Error:", error);
                showAlert3("Error al registrar la compra.");
            } finally {
                btn.disabled = false;
                btn.textContent = 'Aceptar';
            }
        });
    }
    const btnCerrarCompra = document.getElementById('btnCerrarCompra');
    if (btnCerrarCompra) {
        btnCerrarCompra.addEventListener('click', cerrarModalCompra);
    }
});

    

//  Nombre / Apellido
function agregarValidacionNombreApellido(input) {
    input.addEventListener('keydown', function (event) {
        const tecla = event.key;
        const teclasPermitidas = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'];
        if (teclasPermitidas.includes(tecla) || event.ctrlKey || event.metaKey) return;

        if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]$/.test(tecla)) { event.preventDefault(); return; }

        const palabras     = this.value.split(' ');
        const palabraActual = palabras[palabras.length - 1];
        if (tecla !== ' ' && palabraActual.length >= 25) { event.preventDefault(); return; }

        if (tecla === ' ') {
            if (this.value.length === 0 || this.value.endsWith(' ')) { event.preventDefault(); return; }
            if ((this.value.match(/ /g) || []).length >= 2) { event.preventDefault(); return; }
        }
    });

    input.addEventListener('input', function () {
        const pos    = this.selectionStart;
        const partes = this.value.split(' ').map(p =>
            p.length === 0 ? '' : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
        );
        const nuevo = partes.join(' ');
        if (this.value !== nuevo) { this.value = nuevo; this.setSelectionRange(pos, pos); }
    });

    input.addEventListener('paste', function (event) {
        event.preventDefault();
        const clipboard = event.clipboardData || window.clipboardData;
        let texto = clipboard ? clipboard.getData('text') : '';
        let limpio = texto.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ ]/g, '');
        const start = this.selectionStart, end = this.selectionEnd;
        let unido = this.value.substring(0, start) + limpio + this.value.substring(end);
        let palabras = unido.split(' ').filter(p => p.trim() !== '').slice(0, 3)
            .map(p => { let c = p.substring(0, 25); return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase(); });
        let resultado = palabras.join(' ');
        if (unido.endsWith(' ') && palabras.length < 3) resultado += ' ';
        this.value = resultado;
        this.setSelectionRange(resultado.length, resultado.length);
    });
}
 
// Teléfono 
function agregarValidacionTelefono(input) {
    if (!input) return;

    // Función interna para validar el borde (10 dígitos exactos)
    const validarBordeTelefono = (value) => {
        const estructuraTelefono = /^[0-9]{10}$/;
        if (value === "" || estructuraTelefono.test(value)) { 
            input.style.borderColor = '';
        } else {
            input.style.borderColor = 'red';
        }
    };

    input.addEventListener('keydown', function (event) {
        const tecla = event.key;
        const valorActual = this.value;
        const teclasPermitidas = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
        
        if (teclasPermitidas.includes(tecla) || event.ctrlKey || event.metaKey) return;
        
        // Bloquear espacios explicitamente
        if (tecla === ' ') { event.preventDefault(); return; }
        
        // Solo números
        if (!/^[0-9]$/.test(tecla)) { event.preventDefault(); return; }
        
        // Tiene que empezar por 3 o por 6
        if (valorActual.length === 0 && tecla !== '3' && tecla !== '6') { event.preventDefault(); return; }
        
        // Si empieza por 6, el siguiente DEBE ser 0
        if (valorActual.length === 1 && valorActual === '6' && tecla !== '0') { event.preventDefault(); return; }
        
        // Máximo 10 caracteres
        if (valorActual.length >= 10) { event.preventDefault(); return; }
    });

    input.addEventListener('input', function () {
        const posicionCursor = this.selectionStart;
        let textoLimpio = this.value.replace(/[^0-9]/g, '').slice(0, 10);

        if (textoLimpio.length > 0) {
            const primerDigito = textoLimpio.charAt(0);
            // Si no empieza por 3 o 6, vacía el input
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
            // Ajustar cursor tras la corrección manual
            this.setSelectionRange(posicionCursor - 1, posicionCursor - 1);
        }

        validarBordeTelefono(this.value);
    });

    input.addEventListener('paste', function (event) {
        event.preventDefault();
        const clipboard = event.clipboardData || window.clipboardData;
        let texto = clipboard ? clipboard.getData('text') : '';
        let limpio = texto.replace(/[^0-9]/g, '');
        
        const start = this.selectionStart, end = this.selectionEnd;
        let unido = this.value.substring(0, start) + limpio + this.value.substring(end);
        
        // Limitar a 10 dígitos max antes de evaluar
        if (unido.length > 10) {
            unido = unido.slice(0, 10);
        }

        // Aplicar filtros de negocio al texto pegado resultante
        if (unido.length > 0) {
            const primerDigito = unido.charAt(0);
            if (primerDigito !== '3' && primerDigito !== '6') return; 
            
            if (primerDigito === '6' && unido.length > 1 && unido.charAt(1) !== '0') {
                unido = '6';
            }
        }

        const caracteresAgregados = unido.length - (this.value.length - (end - start));
        this.value = unido;
        
        // Posicionar cursor de forma inteligente
        this.setSelectionRange(start + caracteresAgregados, start + caracteresAgregados);
        
        validarBordeTelefono(this.value);
    });
}  

// Ciudad 
function agregarValidacionCiudad(input) {
    input.addEventListener('keydown', function (event) {
        const tecla = event.key;
        const teclasPermitidas = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'];
        if (teclasPermitidas.includes(tecla) || event.ctrlKey || event.metaKey) return;
        if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]$/.test(tecla)) { event.preventDefault(); return; }
        const palabras = this.value.split(' ');
        const palabraActual = palabras[palabras.length - 1];
        if (tecla !== ' ' && palabraActual.length >= 25) { event.preventDefault(); return; }
        if (tecla === ' ') {
            if (this.value.length === 0 || this.value.endsWith(' ')) { event.preventDefault(); return; }
            if ((this.value.match(/ /g) || []).length >= 2) { event.preventDefault(); return; }
        }
    });

    input.addEventListener('input', function () {
        const pos = this.selectionStart;
        const partes = this.value.split(' ').map(p =>
            p.length === 0 ? '' : p.charAt(0).toUpperCase() + p.slice(1)
        );
        const nuevo = partes.join(' ');
        if (this.value !== nuevo) { this.value = nuevo; this.setSelectionRange(pos, pos); }
    });

    input.addEventListener('paste', function (event) {
        event.preventDefault();
        const clipboard = event.clipboardData || window.clipboardData;
        let texto = clipboard ? clipboard.getData('text') : '';
        let limpio = texto.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ ]/g, '');
        const start = this.selectionStart, end = this.selectionEnd;
        let unido = this.value.substring(0, start) + limpio + this.value.substring(end);
        let palabras = unido.split(' ').filter(p => p.trim() !== '').slice(0, 3)
            .map(p => { let c = p.substring(0, 25); return c.charAt(0).toUpperCase() + c.slice(1); });
        let resultado = palabras.join(' ');
        if (unido.endsWith(' ') && palabras.length < 3) resultado += ' ';
        this.value = resultado;
        this.setSelectionRange(resultado.length, resultado.length);
    });
}

// Dirección
function agregarValidacionDireccion(input) {
    input.addEventListener('keydown', function (event) {
        const tecla = event.key;
        const teclasPermitidas = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'];
        if (teclasPermitidas.includes(tecla) || event.ctrlKey || event.metaKey) return;
        if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9 #\-.,/°]$/.test(tecla)) { event.preventDefault(); return; }
        if (this.value.length >= 60) { event.preventDefault(); return; }
        if (tecla === ' ' && (this.value.length === 0 || this.value.endsWith(' '))) { event.preventDefault(); return; }
    });

    input.addEventListener('paste', function (event) {
        event.preventDefault();
        const clipboard = event.clipboardData || window.clipboardData;
        let texto = clipboard ? clipboard.getData('text') : '';
        let limpio = texto.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ0-9 #\-.,/°]/g, '');
        const start = this.selectionStart, end = this.selectionEnd;
        let unido = this.value.substring(0, start) + limpio + this.value.substring(end);
        let resultado = unido.substring(0, 60);
        this.value = resultado;
        this.setSelectionRange(resultado.length, resultado.length);
    });
}

//  Correo 
function agregarValidacionCorreo(input) {
    input.addEventListener('keydown', function (event) {
        const tecla = event.key;
        const teclasPermitidas = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'];
        if (teclasPermitidas.includes(tecla) || event.ctrlKey || event.metaKey) return;
        if (!/^[a-zA-Z0-9@._\-+]$/.test(tecla)) { event.preventDefault(); return; }
        if (this.value.length >= 50) { event.preventDefault(); return; }
    });

    input.addEventListener('blur', function () {
        const valor = this.value.trim();
        if (valor === '') return;
        if (!/^[^\s@]+@gmail\.com$/.test(valor)) {
            this.setCustomValidity('Por favor ingresa un correo válido con @gmail.com');
            this.reportValidity();
        } else {
            this.setCustomValidity('');
        }
    });

    input.addEventListener('paste', function (event) {
        event.preventDefault();
        const clipboard = event.clipboardData || window.clipboardData;
        let texto = clipboard ? clipboard.getData('text') : '';
        let limpio = texto.replace(/[^a-zA-Z0-9@._\-+]/g, '');
        const start = this.selectionStart, end = this.selectionEnd;
        let unido = this.value.substring(0, start) + limpio + this.value.substring(end);
        let resultado = unido.substring(0, 50);
        this.value = resultado;
        this.setSelectionRange(resultado.length, resultado.length);
    });
}


//   FORMULARIO DE AGREGAR
document.addEventListener('DOMContentLoaded', () => {


   // Documento
    function agregarValidacionDocumento(inputDoc, selectTipo) {
        if (!inputDoc) return;

        // Reglas segun seleccione el tipo de documento
        function obtenerReglasDocumento() {
            const tipo = selectTipo ? selectTipo.value : 'CC';
            switch (tipo) {
                case 'CC':  return { regex: /^\d{9,10}$/, minLength: 9, maxLength: 10, soloNumeros: true };
                case 'CE':  return { regex: /^\d{6,15}$/, minLength: 6, maxLength: 15, soloNumeros: true };
                case 'PPT': return { regex: /^\d{6,8}$/, minLength: 6, maxLength: 8, soloNumeros: true };
                case 'PA':  return { regex: /^[a-zA-Z0-9]{6,15}$/, minLength: 6, maxLength: 15, soloNumeros: false };
                case 'NIT': return { regex: /^\d{9,11}$/, minLength: 9, maxLength: 11, soloNumeros: true };
                default:    return { regex: /^\d{9,10}$/, minLength: 9, maxLength: 10, soloNumeros: true };
            }
        }

        // Borde rojo 
        function validarDoc(value) {
            const reglas = obtenerReglasDocumento();
            if (value === "") {
                inputDoc.style.borderColor = '';
            } else if (reglas.regex.test(value)) { 
                inputDoc.style.borderColor = ''; 
            } else {
                inputDoc.style.borderColor = 'red'; 
            }
        }

        // Si se cambia el tipo de documento, se limpia el input 
        if (selectTipo) {
            selectTipo.addEventListener('change', () => {
                inputDoc.value = '';
                inputDoc.style.borderColor = '';
            });
        }

        inputDoc.addEventListener('keydown', function (event) {
            const reglas = obtenerReglasDocumento();
            const teclasPermitidas = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
            
            if (event.ctrlKey || event.metaKey || teclasPermitidas.includes(event.key)) return;
            
            if (event.key === ' ') { event.preventDefault(); return; }

            // (Pasaporte) Valida si solo admite números o alfanumérico 
            if (reglas.soloNumeros && !/^[0-9]$/.test(event.key)) {
                event.preventDefault();
                return;
            }
            if (!reglas.soloNumeros && !/^[a-zA-Z0-9]$/.test(event.key)) {
                event.preventDefault();
                return;
            }

            // Controla el máximo de caracteres permitido 
            if (this.value.length >= reglas.maxLength && this.selectionStart === this.selectionEnd) {
                event.preventDefault();
                return;
            }
        });

        inputDoc.addEventListener('input', function () {
            const reglas = obtenerReglasDocumento();

            // Recorta si excede el tamaño máximo configurado
            if (this.value.length > reglas.maxLength) {
                this.value = this.value.slice(0, reglas.maxLength);
            }

            validarDoc(this.value);
        });

        inputDoc.addEventListener('paste', function (event) {
            event.preventDefault();
            const reglas = obtenerReglasDocumento();
            const clipboard = event.clipboardData || window.clipboardData;
            const texto = clipboard ? clipboard.getData('text').trim() : '';
            
            // Filtra el texto pegado dependiendo de si es solo números o alfanumérico
            const textoFiltrado = reglas.soloNumeros ? texto.replace(/[^0-9]/g, '') : texto.replace(/[^a-zA-Z0-9]/g, '');
            if (!textoFiltrado) return;

            const ini = this.selectionStart, fin = this.selectionEnd;
            let unido = this.value.substring(0, ini) + textoFiltrado + this.value.substring(fin);

            if (unido.length > reglas.maxLength) {
                unido = unido.slice(0, reglas.maxLength);
            }

            const agregados = unido.length - (this.value.length - (fin - ini));
            this.value = unido;
            
            // Coloca el cursor de forma inteligente en la posición correcta tras pegar
            const pos = ini + Math.max(0, agregados);
            this.setSelectionRange(pos, pos);
            
            validarDoc(this.value);
        });
    }

    const inputDocumento = document.getElementById('new_documento');
    const selectTipoDoc = document.getElementById('new_tipo_documento'); 

    if (inputDocumento) {
        agregarValidacionDocumento(inputDocumento, selectTipoDoc);
    }

    // Nombre y Apellido 
    const inputsNombreApellido = [
        document.getElementById('new_nombre'),
        document.getElementById('new_apellido')
    ];
    inputsNombreApellido.forEach(input => {
        if (input) agregarValidacionNombreApellido(input);
    });

    // Teléfono 
    const inputTelefono = document.getElementById('new_telefono');
    if (inputTelefono) agregarValidacionTelefono(inputTelefono);

    // Ciudad  
    const inputCiudad = document.getElementById('new_ciudad');
    if (inputCiudad) agregarValidacionCiudad(inputCiudad);

    //  Dirección 
    const inputDireccion = document.getElementById('new_direccion');
    if (inputDireccion) agregarValidacionDireccion(inputDireccion);

    //  Correo  
    const inputCorreo = document.getElementById('new_correo');
    if (inputCorreo) agregarValidacionCorreo(inputCorreo);

});

function mostrarModalEliminarProveedor(id){
    idProveedorAEliminar = id;
    document.getElementById("modalEliminarProveedor").style.display = "flex";
}

function cerrarModalEliminarProveedor(){
    document.getElementById("modalEliminarProveedor").style.display = "none";
    idProveedorAEliminar = null;
}
