// Ejecuta la carga de datos en cuanto abre la página
document.addEventListener('DOMContentLoaded', () => {
    obtenerProveedores();
});


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
                <td>${p.apellido}</td>
                <td>${p.telefono}</td>
                <td>${p.ciudad}</td>
                <td>${p.direccion}</td>
                <td class="correo-cell">${p.correo}</td>
                <td>
                    <span class="${p.estado === 'Activo' ? 'estado-activo' : 'estado-inactivo'}">
                        ${p.estado}
                    </span>
                </td>
                <td>
                    <button class="btn-accion-editar"  onclick="editarFila(this)">✏️</button>
                    <button class="btn-accion-eliminar" onclick="eliminarProveedor(${p.documento})">🗑️</button>
                    <button class="btn-accion-comprar"  onclick="realizarCompra(${p.documento}, '${p.nombre}')">🛒</button>
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
    const apellido       = document.getElementById('new_apellido').value.trim();
    const telefono       = document.getElementById('new_telefono').value.trim();
    const ciudad         = document.getElementById('new_ciudad').value.trim();
    const direccion      = document.getElementById('new_direccion').value.trim();
    const correo         = document.getElementById('new_correo').value.trim();
    const estado         = document.getElementById('new_estado').value.trim();

    if (!tipo_documento || !documento || !nombre || !apellido || !telefono || !ciudad || !direccion || !correo || !estado) {
        alert("Todos los campos son obligatorios. Por favor, completa el formulario.");
        return;
    }

    if (!/^[^\s@]+@gmail\.com$/.test(correo)) {
        alert("El correo debe tener formato válido: algo@gmail.com");
        return;
    }

    if (!/^[36][0-9]{9}$/.test(telefono)) {
        alert("El teléfono debe tener 10 dígitos y empezar con 3 o 6.");
        return;
    }

    const datos = { tipo_documento, documento, nombre, apellido, telefono, ciudad, direccion, correo, estado };

    try {
        const response = await fetch('/guardar-proveedor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            alert("Proveedor agregado correctamente.");
            closeAddModal();
            location.reload();
        } else {
            const msg = await response.text();
            alert("Error: " + msg);
        }
    } catch (error) {
        console.error("Error al agregar proveedor:", error);
        alert("Error: " + error.message);
    }
}

//  ELIMINAR
async function eliminarProveedor(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este proveedor?")) return;

    try {
        const response = await fetch(`/eliminar-proveedor/${id}`, { method: 'DELETE' });

        if (response.ok) {
            alert("Proveedor eliminado correctamente.");
            obtenerProveedores();
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}


//  EDITAR EN LÍNEA 

function editarFila(btn) {
    const fila   = btn.parentNode.parentNode;
    const celdas = fila.getElementsByTagName("td");

    // 1 — Documento 
    const docActual = celdas[1].innerText.trim();
    const inputDoc = document.createElement('input');
    inputDoc.type = 'text';
    inputDoc.value = docActual;
    inputDoc.maxLength = 10;
    inputDoc.style.cssText = 'width:100%;box-sizing:border-box;';
    // Solo números
    inputDoc.addEventListener('keydown', function(event) {
        const teclasPermitidas = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'];
        if (event.ctrlKey || event.metaKey || teclasPermitidas.includes(event.key)) return;
        if (event.key === ' ') { event.preventDefault(); return; }
        if (!/^[0-9]$/.test(event.key)) { event.preventDefault(); }
        if (this.value.length >= 10) { event.preventDefault(); }
    });
    celdas[1].innerHTML = '';
    celdas[1].appendChild(inputDoc);

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

// Correo

    const correoInput = crearInputTexto(celdas[7].innerText.trim());
    agregarValidacionCorreo(correoInput);
    celdas[7].innerHTML = '';
    celdas[7].appendChild(correoInput);

    const estadoActual = celdas[8].innerText.trim();
    celdas[8].innerHTML = `
        <select style="width:100%;box-sizing:border-box;">
            <option value="Activo"   ${estadoActual === 'Activo'   ? 'selected' : ''}>Activo</option>
            <option value="Inactivo" ${estadoActual === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
        </select>`;

    btn.textContent = "Guardar";
    btn.onclick = function () { guardarEdicion(this); };
}

// Input de texto reutilizable
function crearInputTexto(valor) {
    const input = document.createElement('input');
    input.type  = 'text';
    input.value = valor;
    input.style.cssText = 'width:100%;box-sizing:border-box;';
    return input;
}


//  GUARDAR EDICIÓN
async function guardarEdicion(btn) {
    const fila   = btn.parentNode.parentNode;
    const celdas = fila.getElementsByTagName("td");

    const documentoOriginal = fila.getAttribute('data-id');

    const tipo_documento = celdas[0].querySelector("input").value.trim();
    const documento      = celdas[1].innerText.trim();                    
    const nombre         = celdas[2].querySelector("input").value.trim();
    const apellido       = celdas[3].querySelector("input").value.trim();
    const telefono       = celdas[4].querySelector("input").value.trim();
    const ciudad         = celdas[5].querySelector("input").value.trim();
    const direccion      = celdas[6].querySelector("input").value.trim();
    const correo         = celdas[7].querySelector("input").value.trim();
    const estado         = celdas[8].querySelector("select").value.trim();

    
    if (!tipo_documento || !documento || !nombre || !apellido || !telefono || !ciudad || !direccion || !correo || !estado) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{1,75}$/.test(nombre)) {
        alert("El nombre solo debe contener letras y tener máximo 3 palabras.");
        return;
    }

    if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{1,75}$/.test(apellido)) {
        alert("El apellido solo debe contener letras y tener máximo 3 palabras.");
        return;
    }

    if (!/^[^\s@]+@gmail\.com$/.test(correo)) {
        alert("El correo debe tener formato válido: algo@gmail.com");
        return;
    }

    if (!/^[36][0-9]{9}$/.test(telefono)) {
        alert("El teléfono debe tener 10 dígitos y empezar con 3 o 6.");
        return;
    }
   

    const datos = { tipo_documento, documento, nombre, apellido, telefono, ciudad, direccion, correo, estado };

    try {
        const response = await fetch(`/editar-proveedor/${documento}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            alert("Proveedor actualizado correctamente.");
            obtenerProveedores();
        } else {
            alert("Error al actualizar proveedor.");
        }
    } catch (error) {
        console.error("Error al actualizar:", error);
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
        filas[i].style.display = coincide ? "" : "none";
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

//  REALIZAR COMPRA
async function realizarCompra(idProv, nombreProv) {
    const idProd = prompt(`ID del producto que comprará a ${nombreProv}:`);
    const cant   = prompt("¿Cuántas unidades comprará?");
    const precio = prompt("¿Precio unitario de compra?");
    const pago   = prompt("Método de pago (Ejemplo: Efectivo, Transferencia, Crédito):", "Efectivo");

    if (!idProd || !cant || !precio || !pago) {
        alert("Operación cancelada: Faltan datos.");
        return;
    }

    if (isNaN(parseInt(idProd)) || isNaN(parseInt(cant)) || isNaN(parseFloat(precio))) {
        alert("Por favor ingresa números válidos para ID de producto, cantidad y precio.");
        return;
    }

    const datos = {
        fecha_compra: new Date().toISOString().split('T')[0],
        cantidad_producto_compra: parseInt(cant),
        precio_unitario: parseFloat(precio),
        valor_compra: parseInt(cant) * parseFloat(precio),
        forma_pago_compra: pago,
        estado_compra: "Completado",
        documento: idProv,
        id_producto: parseInt(idProd)
    };

    if (isNaN(datos.cantidad_producto_compra) || isNaN(datos.precio_unitario) || isNaN(datos.id_producto)) {
        alert("Error: alguno de los campos numéricos no es válido.");
        return;
    }

    try {
        const res = await fetch('/registrar-compra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            alert("¡Compra registrada con éxito!");
        } else {
            const mensajeError = await res.text();
            alert("Error: " + mensajeError);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}


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
    input.addEventListener('keydown', function (event) {
        const tecla = event.key;
        const teclasPermitidas = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'];
        if (teclasPermitidas.includes(tecla) || event.ctrlKey || event.metaKey) return;
        if (!/^[0-9]$/.test(tecla)) { event.preventDefault(); return; }
        if (this.value.length === 0 && tecla !== '3' && tecla !== '6') { event.preventDefault(); return; }
        if (this.value.length >= 10) { event.preventDefault(); return; }
    });

    input.addEventListener('paste', function (event) {
        event.preventDefault();
        const clipboard = event.clipboardData || window.clipboardData;
        let texto = clipboard ? clipboard.getData('text') : '';
        let limpio = texto.replace(/[^0-9]/g, '');
        const start = this.selectionStart, end = this.selectionEnd;
        let unido = this.value.substring(0, start) + limpio + this.value.substring(end);
        if (unido.length > 0 && unido[0] !== '3' && unido[0] !== '6') return;
        let resultado = unido.substring(0, 10);
        this.value = resultado;
        this.setSelectionRange(resultado.length, resultado.length);
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
    const inputDocumento = document.getElementById('new_documento');
    if (inputDocumento) {
        inputDocumento.addEventListener('keydown', function (event) {
            const teclasPermitidas = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'];
            if (event.ctrlKey || event.metaKey || teclasPermitidas.includes(event.key)) return;
            if (event.key === ' ') { event.preventDefault(); return; }
            if (!/^[0-9]$/.test(event.key)) { event.preventDefault(); }
            validarDoc(this.value);
        });

        inputDocumento.addEventListener('paste', function (event) {
            event.preventDefault();
            const clipboard = event.clipboardData || window.clipboardData;
            let texto = clipboard ? clipboard.getData('text') : '';
            let soloNum = texto.replace(/[^0-9]/g, '');
            if (!soloNum) return;
            const ini = this.selectionStart, fin = this.selectionEnd;
            let unido = this.value.substring(0, ini) + soloNum + this.value.substring(fin);
            if (unido.length > 10) unido = unido.slice(0, 10);
            const agregados = unido.length - (this.value.length - (fin - ini));
            this.value = unido;
            const pos = ini + Math.max(0, agregados);
            this.setSelectionRange(pos, pos);
            validarDoc(this.value);
        });

        function validarDoc(value) {
            inputDocumento.style.borderColor = value === '' ? '' : /^[0-9]{10}$/.test(value) ? '' : 'red';
        }
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