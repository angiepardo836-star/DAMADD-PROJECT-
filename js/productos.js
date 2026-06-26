// Ejecuta la carga de datos en cuanto abre la página
document.addEventListener('DOMContentLoaded', () => {
    obtenerProductos();
});

// FORMATEO DE FECHA: Función auxiliar para que la fecha se vea bien (YYYY-MM-DD)
function formatearFecha(fechaISO) {
    if (!fechaISO) return "";
    const fecha = new Date(fechaISO);
    return fecha.toISOString().split('T')[0]; 
}

// LEER (MOSTRAR DATOS) 
async function obtenerProductos() {
    try {
        const respuesta = await fetch('/obtener-productos');
        const productos = await respuesta.json();
        
        const tbody = document.getElementById('cuerpoTabla');
        if(!tbody) return;
        
        tbody.innerHTML = ""; 

        productos.forEach(p => {
            const tr = document.createElement('tr');
            // si no hay cantidad (puede venir como string), añadir clase de advertencia
            if (Number(p.cantidad) === 0) {
                tr.classList.add('sin-stock');
            }
            const cantidadNum = Number(p.cantidad) || 0;
            const precioNum = Number(p.precio_unitario) || 0;
            let totalCalc = cantidadNum * precioNum;
            // mostrar sin decimales cuando es entero, en especial 0
            let totalDisplay = totalCalc === 0 ? '0' : (Number.isInteger(totalCalc) ? String(totalCalc) : totalCalc.toFixed(2));
            tr.innerHTML = `
                <td>${p.id}</td> 
                <td>${p.tipo_producto}</td>
                <td>${p.nombre}</td>
                <td>${p.marca}</td>
                <td>${p.cantidad}</td>
                <td>${p.categoria}</td>
                <td>${p.presentacion || "N/A"}</td>
                <td>${p.fecha_vencimiento ? formatearFecha(p.fecha_vencimiento) : "N/A"}</td>
                <td>${parseFloat(p.precio_unitario).toLocaleString('es-CO')}</td>
                <td>${p.estado}</td>
                <td>${p.descripcion}</td>
                <td>
                    <div class="acciones">
                        <button class="btn-accion-editar" onclick="editarFila(this)" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button class="btn-accion-eliminar" onclick="eliminarProducto(${p.id})" title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error al obtener productos:", error);
    }
}
    
// CREAR (GUARDAR NUEVO) 
async function saveNew() {
    const tipo_producto = document.getElementById('new_tipo_producto').value;
    const nombre = document.getElementById('new_nombre').value.trim();
    const marca = document.getElementById('new_marca').value.trim();
    const cantidad = parseFloat(document.getElementById('new_cantidad').value);
    const categoria = document.getElementById('new_categoria').value.trim();
    const presentacion = document.getElementById('new_presentacion').value.trim();
    const fecha_vencimiento = document.getElementById('new_fecha_vencimiento').value.trim();
    const precio = parseFloat(document.getElementById('new_precio').value.replace(/\./g, ''));
    const estado = document.getElementById('new_estado').value;
    const descripcion = document.getElementById('new_descripcion').value.trim();
    const total = precio * cantidad;

    if (!tipo_producto || !nombre || !marca || isNaN(cantidad) || !categoria || isNaN(precio) || !estado || !descripcion) {
        alert("Todos los campos son obligatorios, menos la fecha de vencimiento y presentacion.");
        return;
    }
    // Si es Producto, presentación sí es obligatoria
    if (tipo_producto === "Producto" && !presentacion) {
        alert("La presentación es obligatoria para los productos.");
        return;
    }
    //ALTER TABLE producto
    //MODIFY COLUMN fecha_vencimiento_producto DATE NULL;

    const datos = {
        tipo_producto: tipo_producto,
        nombre: nombre,
        marca: marca,
        cantidad: cantidad,
        categoria: categoria,
        presentacion: presentacion,
        fecha_vencimiento: fecha_vencimiento === "" ? null : fecha_vencimiento, // ← null si está vacío
        precio_unitario: precio,
        estado: estado, 
        descripcion: descripcion,
        precio_total: total
    };

    try {
        const response = await fetch('/guardar-producto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            alert("Producto guardado exitosamente.");
            closeAddModal();
            location.reload(); // Refrescamos para ver el nuevo dato
        } else {
            alert("ERROR: producto repetido no se puede agregar.");
        }
    } catch (error) {
      console.error("Error al agregar:", error);
    }
}

// ELIMINAR 
async function eliminarProducto(id) {
    if(!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
        const response = await fetch(`/eliminar-producto/${id}`, {
            method: 'DELETE'
        });

        if(response.ok) {
            alert("Producto eliminado correctamente.");
            obtenerProductos();
        } else {
            alert("No se pudo eliminar el producto de la base de datos.");
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}
// Permite solo letras y espacios, máx. 2 palabras, máx. 20 caracteres por palabra
function aplicarValidacionLetras(input) {
    if (!input) return;

    input.addEventListener("keydown", function(event) {
        const tecla = event.key;
        const valorActual = this.value;
        const teclasPermitidas = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"];

        if (teclasPermitidas.includes(tecla) || event.ctrlKey || event.metaKey) return;

        if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]$/.test(tecla)) {
            event.preventDefault();
            return;
        }

        const palabras = valorActual.split(" ");
        const palabraActual = palabras[palabras.length - 1];
        if (tecla !== " " && palabraActual.length >= 20) {
            event.preventDefault();
            return;
        }

        if (tecla === " ") {
            if (valorActual.length === 0 || valorActual.endsWith(" ")) {
                event.preventDefault();
                return;
            }
            const cantidadEspacios = (valorActual.match(/ /g) || []).length;
            if (cantidadEspacios >= 1) {
                event.preventDefault();
                return;
            }
        }
    });

    input.addEventListener("input", function() {
        const posicionCursor = this.selectionStart;
        let palabras = this.value.split(" ");
        let palabrasFormateadas = palabras.map(palabra => {
            if (palabra.length === 0) return "";
            return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
        });
        const textoFinal = palabrasFormateadas.join(" ");
        if (this.value !== textoFinal) {
            this.value = textoFinal;
            this.setSelectionRange(posicionCursor, posicionCursor);
        }
    });
}

// Solo números enteros (para cantidad)
function aplicarValidacionEntero(input) {
    if (!input) return;
    input.addEventListener("keydown", function(event) {
        const teclasPermitidas = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"];
        if (teclasPermitidas.includes(event.key) || event.ctrlKey || event.metaKey) return;
        if (event.key === "-" || event.key === "+" || event.key === "e" || event.key === "E" || !/^[0-9]$/.test(event.key)) {
            event.preventDefault();
        }
    });
    input.addEventListener("input", function() {
        this.value = this.value.replace(/[^0-9]/g, "");
    });
}

// Números con un solo punto decimal, sin negativos (para precio)
function aplicarValidacionPrecio(input) {
    if (!input) return;
    input.addEventListener("keydown", function(event) {
        const teclasPermitidas = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"];
        if (teclasPermitidas.includes(event.key)) return;
        if (event.key === "-") { event.preventDefault(); return; }
        if (!/^[0-9.]$/.test(event.key)) { event.preventDefault(); return; }
        if (event.key === "." && this.value.includes(".")) event.preventDefault();
    });
}
function editarFila(btn) {

    let fila = btn.closest("tr");
    let celdas = fila.getElementsByTagName("td");

    const tipoActual = celdas[1].innerText.trim();
    const estadoActual = celdas[9].innerText.trim();

    // Tipo Producto
    celdas[1].innerHTML = `
        <select>
            <option value="Producto" ${tipoActual === "Producto" ? "selected" : ""}>Producto</option>
            <option value="Material" ${tipoActual === "Material" ? "selected" : ""}>Material</option>
        </select>
    `;

    // Nombre
    celdas[2].innerHTML = `<input type="text" value="${celdas[2].innerText}">`;
    aplicarValidacionLetras(celdas[2].querySelector("input"));

    // Marca
    celdas[3].innerHTML = `<input type="text" value="${celdas[3].innerText}">`;
    aplicarValidacionLetras(celdas[3].querySelector("input"));

    // Cantidad
    celdas[4].innerHTML = `<input type="number" min="0" value="${celdas[4].innerText}">`;
    aplicarValidacionEntero(celdas[4].querySelector("input"));

    // Categoría
    celdas[5].innerHTML = `<input type="text" value="${celdas[5].innerText}">`;
    aplicarValidacionLetras(celdas[5].querySelector("input"));

    // Presentación
    celdas[6].innerHTML = `<input type="text" value="${celdas[6].innerText}">`;
    aplicarValidacionLetras(celdas[6].querySelector("input"));

    // Fecha
    const fechaActual = celdas[7].innerText.trim() === "N/A" ? "" : celdas[7].innerText.trim();
    const hoyEdicion = new Date().toISOString().split('T')[0];
    celdas[7].innerHTML = `<input type="date" value="${fechaActual}" min="${hoyEdicion}">`;

    // Precio
    celdas[8].innerHTML = `<input type="text" min="0" value="${celdas[8].innerText}">`;
    aplicarValidacionPrecio(celdas[8].querySelector("input"));

    // Estado
    celdas[9].innerHTML = `
        <select>
            <option value="Bueno" ${estadoActual === "Bueno" ? "selected" : ""}>Bueno</option>
            <option value="Malo" ${estadoActual === "Malo" ? "selected" : ""}>Malo</option>
        </select>
    `;

    // Descripción
    const descActual = celdas[10].innerText.trim();
    const descFormateada = descActual.charAt(0).toUpperCase() + descActual.slice(1);
    celdas[10].innerHTML = `<input type="text" value="${descFormateada}">`;

    btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i>`;
    btn.classList.remove('btn-accion-editar');
    btn.classList.add('btn-accion-comprar');
    btn.title = "Guardar";
    btn.onclick = function () {
        guardarEdicion(this);
    };
}
 
// GUARDAR EDICIÓN
async function guardarEdicion(btn) { 
    let fila = btn.closest("tr"); 
    let celdas = fila.getElementsByTagName("td"); 

    // Limpiamos el ID de cualquier espacio o salto de línea
    const idRaw = celdas[0].textContent.replace(/[^0-9]/g, '');
    const id = parseInt(idRaw);


    if (isNaN(id)) {
        alert("Error: No se pudo encontrar el ID del producto.");
        return;
    }

    // Captura de datos desde los inputs
    const tipo_producto = celdas[1].querySelector("select").value.trim();
    const nombre = celdas[2].querySelector("input").value.trim();
    const marca = celdas[3].querySelector("input").value.trim();
    const cant = parseFloat(celdas[4].querySelector("input").value);
    const categoria = celdas[5].querySelector("input").value.trim();
    const presentacion = celdas[6].querySelector("input").value.trim();
    const fecha_vencimiento = celdas[7].querySelector("input").value.trim();
    const prec = parseFloat(celdas[8].querySelector("input").value.replace(/\./g, ''));
    const estado = celdas[9].querySelector("select").value.trim();
    const descripcion = celdas[10].querySelector("input").value.replace(/[\n\r]/g, '').trim();

    // VALIDACIÓN: campos obligatorios (excepto fecha_vencimiento, siempre opcional)
    if (!tipo_producto || !nombre || !marca || isNaN(cant) || !categoria || isNaN(prec) || !estado || !descripcion) {
        alert("Todos los campos son obligatorios, menos la fecha de vencimiento.");
        return;
    }

    // VALIDACIÓN: presentación es obligatoria solo si el tipo es "Producto"
    if (tipo_producto === "Producto" && !presentacion) {
        alert("La presentación es obligatoria para los productos.");
        return;
    }

    if (cant < 0) {
        return alert('La cantidad no puede ser negativa');
    }
    if (prec < 0) {
        return alert('El precio no puede ser negativo');
    }

    const datos = {
        tipo_producto: tipo_producto,
        nombre: nombre,
        marca: marca,
        cantidad: cant,
        categoria: categoria,
        presentacion: presentacion,
        fecha_vencimiento: fecha_vencimiento === "" ? null : fecha_vencimiento, // ← null si está vacío
        precio_unitario: prec,
        estado: estado,
        descripcion: descripcion,
        precio_total: (cant * prec).toFixed(2)
    };
    try {
        const response = await fetch('/editar-producto/'+id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if(response.ok) {
            alert("Producto actualizado correctamente."); 
            obtenerProductos();
        } else {
            const msj = await response.text();
            alert("Error del servidor (404/500): " + msj);
        }
    } catch (error) {
        console.error("Error en la petición fetch:", error);
    }
}

// BUSCADOR (FILTRADO) 
function filtrarTabla() {
    let input = document.getElementById("buscador");
    let filtro = input.value.toUpperCase();
    let tabla = document.getElementById("tablaProductos");
    let filas = tabla.getElementsByTagName("tr");

    for (let i = 1; i < filas.length; i++) {
        let celdas = filas[i].getElementsByTagName("td");
        let coincide = false;

        for (let j = 0; j < celdas.length - 1; j++) {
            let celda = celdas[j];
            celda.innerHTML = celda.innerText; 
            
            let texto = celda.innerText;
            let upper = texto.toUpperCase();

            if (upper.includes(filtro) && filtro !== "") {
                let index = upper.indexOf(filtro);
                let original = texto;
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

// CONTROL DE MODALES 
function openAddModal() { document.getElementById('addProductModal').style.display = 'flex'; }
function closeAddModal() { document.getElementById('addProductModal').style.display = 'none'; }

function limpiarFormularioRegistro() {
    document.getElementById('new_tipo_producto').value = "";
    document.getElementById('new_nombre').value = "";
    document.getElementById('new_marca').value = "";
    document.getElementById('new_cantidad').value = "";
    document.getElementById('new_categoria').value = "";
    document.getElementById('new_presentacion').value = "";
    document.getElementById('new_estado').value = "";
    document.getElementById('new_descripcion').value = "";
}
document.addEventListener('DOMContentLoaded', () => {
    const inputsAValidar = [
        document.getElementById('new_nombre'),
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

        // Límite de 20 caracteres por palabra
        const palabras = valorActual.split(' ');
        const palabraActual = palabras[palabras.length - 1];
        if (tecla !== ' ' && palabraActual.length >= 20) {
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
        if (cantidadEspacios >= 1) {
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
    // Asigna las funciones a cada input de la lista
    inputsAValidar.forEach(input => {
        if (input) { // Verifica que el input exista 
            input.addEventListener('keydown', manejarTeclado);
            input.addEventListener('input', manejarFormato);
        }
    });
});
//MARCA
document.addEventListener('DOMContentLoaded', () => {
    const inputsAValidar = [
        document.getElementById('new_marca'),
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
        if (tecla !== ' ' && palabraActual.length >= 20) {
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
        if (cantidadEspacios >= 1) {
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
    // Asigna las funciones a cada input de la lista
    inputsAValidar.forEach(input => {
        if (input) { // Verifica que el input exista 
            input.addEventListener('keydown', manejarTeclado);
            input.addEventListener('input', manejarFormato);
        }
    });
});

//CATEGORIA
document.addEventListener('DOMContentLoaded', () => {
    const inputsAValidar = [
        document.getElementById('new_categoria'),
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
        if (tecla !== ' ' && palabraActual.length >= 20) {
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
        if (cantidadEspacios >= 1) {
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
    // Asigna las funciones a cada input de la lista
inputsAValidar.forEach(input => {
        if (input) { // Verifica que el input exista 
            input.addEventListener('keydown', manejarTeclado);
            input.addEventListener('input', manejarFormato);
        }
    });
});
//PRESENTACIÓN
document.addEventListener('DOMContentLoaded', () => {
    const inputsAValidar = [
        document.getElementById('new_presentacion'),
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
        if (tecla !== ' ' && palabraActual.length >= 20) {
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
        if (cantidadEspacios >= 1) {
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
    // Asigna las funciones a cada input de la lista
inputsAValidar.forEach(input => {
        if (input) { // Verifica que el input exista 
            input.addEventListener('keydown', manejarTeclado);
            input.addEventListener('input', manejarFormato);
        }
    });
});

//PRECIO
document.addEventListener('DOMContentLoaded', () => {
    const inputPrecio = document.getElementById('new_precio');

    if (inputPrecio) {
        inputPrecio.addEventListener('input', function() {
            let valor = this.value.replace(/[^0-9]/g, '');
            if (valor) {
                valor = parseInt(valor).toLocaleString('es-CO');
            }
            this.value = valor;
        });
    }
});
//CALENDARIO FECHA
document.addEventListener('DOMContentLoaded', () => {
    const inputFecha = document.getElementById('new_fecha_vencimiento'); 
    const hoy = new Date().toISOString().split('T')[0];
    inputFecha.min = hoy;

}); 
//CANTIDAD (Modal Agregar Producto)
document.addEventListener('DOMContentLoaded', () => {
    aplicarValidacionEntero(document.getElementById('new_cantidad'));
});
//DESCRIPCIÓN
document.addEventListener('DOMContentLoaded', () => {
    const inputDescripcion = document.getElementById('new_descripcion');

    if (inputDescripcion) {
        inputDescripcion.addEventListener('input', function() {
            const posicionCursor = this.selectionStart;
            if (this.value.length === 1) {
                this.value = this.value.toUpperCase();
                this.setSelectionRange(posicionCursor, posicionCursor);
            }
        });
    }
});
//CODIGO PARA QUE AL DARLE ENTER PASE AL SIGUIENTE CAMPO 
function activarEnter() {
    const campos = [
    document.querySelector("#new_nombre"),
    document.querySelector("#new_tipo_producto"),
    document.querySelector("#new_marca"),
    document.querySelector("#new_cantidad"),
    document.querySelector("#new_categoria"),
    document.querySelector("#new_presentacion"),   
    document.querySelector("#new_fecha_vencimiento"),
    document.querySelector("#new_precio"),
    document.querySelector("#new_estado"),
    document.querySelector("#new_descripcion")
]; 

    campos.forEach((campo, index) => {
        campo.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();

                const siguienteCampo = campos[index + 1]; 
                if (siguienteCampo){
                    siguienteCampo.focus(); 
                }
            }
        });
    });
};
//Función para cerrar el modal y limpiar el formulario
window.onload = activarEnter;
function cerrarModal() {
    closeAddModal();
    limpiarFormularioRegistro();
}