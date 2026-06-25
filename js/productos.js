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
            if (Number(p.cantidad_producto) === 0) {
                tr.classList.add('sin-stock');
            }
            const cantidadNum = Number(p.cantidad_producto) || 0;
            const precioNum = Number(p.precio_unitario_producto) || 0;
            let totalCalc = cantidadNum * precioNum;
            // mostrar sin decimales cuando es entero, en especial 0
            let totalDisplay = totalCalc === 0 ? '0' : (Number.isInteger(totalCalc) ? String(totalCalc) : totalCalc.toFixed(2));
            tr.innerHTML = `
                <td>${p.id_producto}</td> 
                <td>${p.nombre_producto}</td>
                <td>${p.marca_producto}</td>
                <td>${p.cantidad_producto}</td>
                <td>${p.categoria_producto}</td>
                <td>${p.presentacion_producto}</td>
                <td>${formatearFecha(p.fecha_vencimiento_producto)}</td>
                <td>${p.precio_unitario_producto}</td>
                <td>${totalDisplay}</td>
                <td>
                    <button class="btn-accion-editar" onclick="editarFila(this)">Editar</button>
                    <button class="btn-accion-eliminar" onclick="eliminarProducto(${p.id_producto})">Eliminar</button>
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
    const nombre = document.getElementById('new_nombre').value.trim();
    const marca = document.getElementById('new_marca').value.trim();
    const cantidad = parseFloat(document.getElementById('new_cantidad').value);
    const categoria = document.getElementById('new_categoria').value.trim();
    const presentacion = document.getElementById('new_presentacion').value.trim();
    const fecha_vencimiento = document.getElementById('new_fecha_vencimiento').value.trim();
    const precio = parseFloat(document.getElementById('new_precio').value);
    const total = precio * cantidad;

    if (!nombre || !marca || isNaN(cantidad) || !categoria || !presentacion || isNaN(precio)) {
        alert("Todos los campos son obligatorios, menos la fecha de vencimiento.");
        return;
    }
    //ALTER TABLE producto
    //MODIFY COLUMN fecha_vencimiento_producto DATE NULL;

    const datos = {
        nombre_producto: nombre,
        marca_producto: marca,
        cantidad_producto: cantidad,
        categoria_producto: categoria,
        presentacion_producto: presentacion,
        fecha_vencimiento_producto: fecha_vencimiento || null,
        precio_unitario_producto: precio,
        precio_total_producto: total
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

// EDITAR EN LÍNEA
function editarFila(btn) { 
    let fila = btn.parentNode.parentNode; 
    let celdas = fila.getElementsByTagName("td"); 

    // Editamos desde la celda 1 hasta la 7
    for (let i = 1; i <= 7; i++) { 
        let contenido = celdas[i].innerText;
        let tipo = (i === 6) ? 'date' : (i === 3 || i === 7) ? 'number' : 'text';
        let atributos = 'style="width: 100%; box-sizing: border-box;"';
        // la cantidad no puede ser negativa, el precio tampoco (0 está permitido)
        if (i === 3 || i === 7) {
            atributos += ' min="0"';
        }
        celdas[i].innerHTML = `<input type="${tipo}" value="${contenido}" ${atributos}>`; 
    }

    btn.textContent = "Guardar";
    btn.onclick = function() { guardarEdicion(this); };
}

// GUARDAR EDICIÓN
async function guardarEdicion(btn) { 
    let fila = btn.parentNode.parentNode; 
    let celdas = fila.getElementsByTagName("td"); 

    // Limpiamos el ID de cualquier espacio o salto de línea
    const idRaw = celdas[0].innerText.trim();
    const id = parseInt(idRaw);

    if (isNaN(id)) {
        alert("Error: No se pudo encontrar el ID del producto.");
        return;
    }

    // Captura de datos desde los inputs
    const cant = parseFloat(celdas[3].querySelector("input").value) || 0;
    const prec = parseFloat(celdas[7].querySelector("input").value) || 0;

    if (cant < 0) {
        return alert('La cantidad no puede ser negativa');
    }
    if (prec < 0) {
        return alert('El precio no puede ser negativo');
    }

    const datos = {
        nombre_producto: celdas[1].querySelector("input").value.trim(),
        marca_producto: celdas[2].querySelector("input").value.trim(),
        cantidad_producto: cant,
        categoria_producto: celdas[4].querySelector("input").value.trim(),
        presentacion_producto: celdas[5].querySelector("input").value.trim(),
        fecha_vencimiento_producto: celdas[6].querySelector("input").value || null,
        precio_unitario_producto: prec,
        precio_total_producto: (cant * prec).toFixed(2) // Calculado automáticamente
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
    document.getElementById('new_nombre').value = "";
    document.getElementById('new_marca').value = "";
    document.getElementById('new_cantidad').value = "";
    document.getElementById('new_categoria').value = "";
    document.getElementById('new_presentacion').value = "";
}