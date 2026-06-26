(function() { // Inicio función autoejecutable única
    // Lista de productos disponibles
    let productosDisponibles = [];

    /**
     * Consulta al backend la lista de productos
     */
    function cargarProductosDisponibles() {
        return fetch('/obtener-productos')
            .then(resp => resp.json())
            .then(productos => {
                productosDisponibles = productos.map(p => ({
                    id: p.id_producto,
                    nombre: p.nombre_producto,
                    marca: p.marca_producto,
                    precio: p.precio_unitario_producto,
                    cantidad: p.cantidad_producto
                }));
                return productosDisponibles;
            })
            .catch(err => {
                console.error('Error cargando productos disponibles:', err);
                return [];
            });
    }

    // Traer productos e inicializar eventos globales al iniciar
    document.addEventListener('DOMContentLoaded', () => {
        cargarProductosDisponibles();
        inicializarEventosGlobales(); 
    });

    // Estructuras de datos dinámicas
    const timers = new Map(); 
    const mesasProductos = new Map(); 
    const mesaTimers = new Map();

    // Función auxiliar para asegurar que una mesa exista en los Maps de datos
    function asegurarMesaInicializada(mesaNum) {
        if (!mesasProductos.has(mesaNum)) {
            mesasProductos.set(mesaNum, []);
        }
        if (!mesaTimers.has(mesaNum)) {
            // Guardamos el tipo para saber cómo calcular tarifas más adelante
            mesaTimers.set(mesaNum, { startTime: null, totalMinutes: 0, tipo: 'mesa' });
        }
    }

    function closeAll(except) { 
        document.querySelectorAll('.time-container').forEach(c => {
            if (c !== except) {
                c.classList.remove('open');
                const menu = c.querySelector('.time-menu'); 
                if (menu) {
                    menu.setAttribute('aria-hidden', 'true');
                    menu.style.display = 'none'; 
                }
            }
        });
    }

    function parseMinutesFromLabel(text) { 
        text = text.toLowerCase(); 
        if (text.includes('2 horas') || text.includes('2 hora')) return 120;
        if (text.includes('1:30 hora')) return 90;
        if (text.includes('1 hora') || (text.includes('1h') && !text.includes('1 hora '))) return 60;
        if (text.includes('30')) return 30; 
        if (text.includes('1 min')) return 1;
       
        const m = text.match(/(\d+)\s*min/); 
        if (m) return parseInt(m[1], 10); 
        return 0; 
    }

    function formatTime(seconds) { 
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`; 
    }

    // NUEVA FUNCIÓN AUXILIAR: Convierte minutos enteros a formato HH:MM:SS para MySQL
    function minutosAStringReloj(minutos) {
        const h = Math.floor(minutos / 60).toString().padStart(2, '0');
        const m = (minutos % 60).toString().padStart(2, '0');
        return `${h}:${m}:00`;
    }

    function startTimerFor(btn, seconds) { 
        if (timers.has(btn)) {
            clearInterval(timers.get(btn).interval); 
            timers.delete(btn); 
        }
        if (!seconds || seconds <= 0) return; 

        let remaining = seconds; 
        const container = btn.closest('.time-container'); 
        const display = container ? container.querySelector('.time-display') : null; 

        if (display) {
            display.textContent = formatTime(remaining); 
            display.classList.add('visible', 'running'); 
        }

        const interval = setInterval(() => { 
            remaining -= 1; 
            if (remaining <= 0) { 
                clearInterval(interval); 
                timers.delete(btn); 
                if (display) { 
                    display.classList.remove('visible', 'running'); 
                    display.textContent = '00:00:00'; 
                }
                try { alert('¡Tiempo finalizado para el juego!'); } catch (e) {} 
                return; 
            }
            if (display) display.textContent = formatTime(remaining); 
        }, 1000);

        timers.set(btn, { interval, remaining }); 
    }

    function stopTimerFor(btn) { 
        if (timers.has(btn)) {
            clearInterval(timers.get(btn).interval); 
            timers.delete(btn); 
        }
        const container = btn.closest('.time-container');
        const display = container ? container.querySelector('.time-display') : null; 
        if (display) { 
            display.classList.remove('visible', 'running'); 
            display.textContent = '00:00:00'; 
        }
        btn.textContent = 'Tiempo ▾'; 
    }

    function inicializarEventosGlobales() {
        
        // 1. Desplegar / Ocultar menú de tiempo ("Tiempo ▾")
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.time-btn');
            if (!btn) return;
            
            e.stopPropagation();
            const container = btn.closest('.time-container');
            const menu = container.querySelector('.time-menu');
            if (!container || !menu) return;

            const isOpen = container.classList.toggle('open'); 
            menu.setAttribute('aria-hidden', isOpen ? 'false' : 'true'); 
            
            if (isOpen) {
                closeAll(container); 
                menu.style.display = 'block'; 
            } else {
                menu.style.display = 'none'; 
            }
        });

        // 2. Selección de opción de tiempo (30 min, 1 hora, Detener, etc.)
        document.addEventListener('click', (e) => {
            const option = e.target.closest('.time-option');
            if (!option) return;

            e.stopPropagation();
            const container = option.closest('.time-container');
            const menu = container.querySelector('.time-menu');
            const btn = container.querySelector('.time-btn');
            const tarjetaMesa = option.closest('.tarjeta-mesa');
            const btnFactura = tarjetaMesa?.querySelector('.factura-btn');
            
            if (!container || !menu || !btn) return;

            // EXTRACCIÓN DEL ID Y EL TIPO DESDE LOS ATRIBUTOS DATA DEL HTML
            let mesaNum = 1;
            let tipoJuego = 'mesa'; // 'billar', 'bolirana', 'mesa'

            if (btnFactura) {
                mesaNum = parseInt(btnFactura.getAttribute('data-id') || btnFactura.getAttribute('data-mesa'), 10);
                tipoJuego = (btnFactura.getAttribute('data-tipo') || 'mesa').toLowerCase();
            } else if (tarjetaMesa) {
                const badge = tarjetaMesa.querySelector('.numero-mesa-badge');
                if (badge) mesaNum = parseInt(badge.textContent, 10);
                // Si tienes un atributo en la tarjeta que indique el tipo, lo lee, si no, busca por clases
                if (tarjetaMesa.classList.contains('tarjeta-billar')) tipoJuego = 'billar';
                else if (tarjetaMesa.classList.contains('tarjeta-bolirana')) tipoJuego = 'bolirana';
            }

            asegurarMesaInicializada(mesaNum);
            const value = option.textContent.trim(); 
            
            container.classList.remove('open'); 
            menu.setAttribute('aria-hidden', 'true'); 
            menu.style.display = 'none'; 

            // Opción: Detener Tiempo
            if (option.classList.contains('stop-option')) { 
                stopTimerFor(btn);
                
                // CORRECCIÓN: Enviamos las propiedades exactas que espera el backend
                fetch("http://localhost:3000/actualizar_mesa", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({ id: mesaNum, estado: "Libre", tiempo: "00:00:00", tipo: tipoJuego })
                }).catch(err => console.error("Error actualizando mesa en BD:", err));

                mesaTimers.set(mesaNum, { startTime: null, totalMinutes: 0, tipo: tipoJuego });
                console.log(`Se detuvo el cronómetro para ${tipoJuego} ${mesaNum}`); 
                return; 
            }

            // Opción: Asignar un Tiempo nuevo
            btn.textContent = value + ' ▾'; 
            const minutes = parseMinutesFromLabel(value); 
            startTimerFor(btn, minutes * 60); 
            
            // CORRECCIÓN: Parseamos el tiempo a cadena HH:MM:SS para MySQL
            const tiempoReloj = minutosAStringReloj(minutes);

            fetch("http://localhost:3000/actualizar_mesa", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ id: mesaNum, estado: "Ocupada", tiempo: tiempoReloj, tipo: tipoJuego })
            }).catch(err => console.error("Error actualizando mesa en BD:", err));

            mesaTimers.set(mesaNum, { startTime: new Date(), totalMinutes: minutes, tipo: tipoJuego });
            console.log(`Inicia cronómetro en ${tipoJuego} ${mesaNum}:`, minutes, 'minutos'); 
        });

        // 3. Único listener global para el botón de Factura
        document.addEventListener('click', (e) => {
            const btnFactura = e.target.closest('.factura-btn');
            if (!btnFactura) return;
            
            e.stopPropagation();
            
            const numeroStr = btnFactura.getAttribute('data-id') || btnFactura.getAttribute('data-mesa') || "1";
            const tipoStr = btnFactura.getAttribute('data-tipo') || "Mesa";
            const mesaNum = parseInt(numeroStr, 10);
            
            asegurarMesaInicializada(mesaNum);
            // Sincronizamos el tipo actual al abrir la factura
            const currentInfo = mesaTimers.get(mesaNum);
            currentInfo.tipo = tipoStr.toLowerCase();
            mesaTimers.set(mesaNum, currentInfo);

            const modalTitulo = document.getElementById('invoice-mesa-num');
            if (modalTitulo) {
                modalTitulo.textContent = `${tipoStr} ${numeroStr}`;
            }
            
            showInvoice(mesaNum);
        });
    }

    // Cerrar componentes flotantes al hacer click fuera o con ESC
    document.addEventListener('click', () => closeAll(null)); 
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAll(null); 
    });

    // Funcionalidad de Factura e modales
    const invoiceModal = document.getElementById('invoice-modal'); 
    const productsModal = document.getElementById('products-modal'); 
    const btnPedidos = document.getElementById('btn-pedidos'); 

    let productoSeleccionadoTemporal = null;

    // Evento para el buscador en tiempo real
    document.addEventListener('DOMContentLoaded', () => {
        const searchInput = document.getElementById('search-product');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                renderProductsList(searchInput.value.trim());
            });
        }
    });

    function renderProductsList(filtro = '') { 
        const productsList = document.getElementById('products-list');
        if (!productsList) return;
        productsList.innerHTML = '';
        
        const productosFiltrados = productosDisponibles.filter(p => 
            p.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
            p.marca.toLowerCase().includes(filtro.toLowerCase())
        );

        if (productosFiltrados.length === 0) {
            productsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 20px;">No se encontraron productos.</p>';
            return;
        }

        productosFiltrados.forEach((producto) => {
            if (producto.cantidad <= 0) return;

            const urlImagen = producto.imagen || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=60'; 

            const card = document.createElement('div');
            card.style.cssText = 'background: white; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: transform 0.2s;';
            
            card.onmouseenter = () => card.style.transform = 'scale(1.02)';
            card.onmouseleave = () => card.style.transform = 'none';

            card.innerHTML = `
                <div style="position: relative; width: 100%; height: 140px; background: #f9f9f9;">
                    <img src="${urlImagen}" alt="${producto.nombre}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="padding: 12px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 8px;">
                    <div>
                        <strong style="font-size: 15px; color: #333; display: block; margin-bottom: 2px;">${producto.nombre}</strong>
                        <span style="font-size: 12px; color: #888; display: block;">Marca: ${producto.marca}</span>
                        <span style="font-size: 12px; color: #fff; background: #666; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px;">Stock: ${producto.cantidad}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 5px;">
                        <span style="font-size: 16px; font-weight: bold; color: #146d02;">COP$ ${producto.precio.toLocaleString('es-CO')}</span>
                        <button onclick="window.abrirConfirmacionAgregar(${producto.id});" 
                                style="width: 100%; padding: 8px; background: #146d02; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px;">
                            Agregar
                        </button>
                    </div>
                </div>
            `;
            productsList.appendChild(card);
        });
    }

    window.abrirConfirmacionAgregar = function(productoId) {
        const producto = productosDisponibles.find(p => p.id === productoId);
        if (!producto) return;

        productoSeleccionadoTemporal = producto;

        document.getElementById('confirm-product-title').textContent = `Añadir "${producto.nombre}"`;
        document.getElementById('confirm-product-stock').textContent = `Disponibles en inventario: ${producto.cantidad}`;
        document.getElementById('confirm-input-cantidad').value = 1; 
        document.getElementById('confirm-input-cantidad').max = producto.cantidad;
        document.getElementById('confirm-error-msg').style.display = 'none';

        const confirmModal = document.getElementById('confirm-add-modal');
        confirmModal.classList.add('visible');
        confirmModal.setAttribute('aria-hidden', 'false');
    };

    function cerrarConfirmacion() {
        const confirmModal = document.getElementById('confirm-add-modal');
        confirmModal.classList.remove('visible');
        confirmModal.setAttribute('aria-hidden', 'true');
        productoSeleccionadoTemporal = null;
    }

    window.procesarAgregarProducto = function() {
        if (!productoSeleccionadoTemporal) return;

        const errorEl = document.getElementById('confirm-error-msg');
        const mesaNum = parseInt(document.getElementById('confirm-select-mesa').value, 10);
        const cantidad = parseInt(document.getElementById('confirm-input-cantidad').value, 10);

        if (isNaN(cantidad) || cantidad <= 0) {
            errorEl.textContent = 'Ingresa una cantidad válida.';
            errorEl.style.display = 'block';
            return;
        }
        if (cantidad > productoSeleccionadoTemporal.cantidad) {
            errorEl.textContent = `No hay suficiente stock (${productoSeleccionadoTemporal.cantidad} máx).`;
            errorEl.style.display = 'block';
            return;
        }

        asegurarMesaInicializada(mesaNum);
        const productos = mesasProductos.get(mesaNum) || [];
        const existente = productos.find(p => p.nombre === productoSeleccionadoTemporal.nombre && p.precio === productoSeleccionadoTemporal.precio && p.marca === productoSeleccionadoTemporal.marca);
        
        if (existente) {
            existente.cantidad = (existente.cantidad || 0) + cantidad;
        } else {
            productos.push({ 
                nombre: productoSeleccionadoTemporal.nombre, 
                marca: productoSeleccionadoTemporal.marca, 
                precio: productoSeleccionadoTemporal.precio, 
                cantidad: cantidad 
            });
        }
        mesasProductos.set(mesaNum, productos);

        fetch('/descontar-producto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: productoSeleccionadoTemporal.id, cantidad })
        }).then(resp => {
            if (!resp.ok) return resp.text().then(t => Promise.reject(t));
            
            productoSeleccionadoTemporal.cantidad -= cantidad;
            cerrarConfirmacion();
            renderProductsList(document.getElementById('search-product').value.trim());
        }).catch(err => {
            errorEl.textContent = 'Error de conexión con el servidor.';
            errorEl.style.display = 'block';
            console.error(err);
        });
    };

    function showProductsModal(mesaNumPredetermada = null) { 
        if (mesaNumPredetermada) {
            document.getElementById('confirm-select-mesa').value = mesaNumPredetermada;
        }

        const searchInput = document.getElementById('search-product');
        if (searchInput) searchInput.value = '';

        if (productosDisponibles.length === 0) {
            cargarProductosDisponibles().then(() => {
                renderProductsList();
                productsModal.classList.add('visible');
                productsModal.setAttribute('aria-hidden', 'false');
            });
        } else {
            renderProductsList();
            productsModal.classList.add('visible');
            productsModal.setAttribute('aria-hidden', 'false');
        }
    }

    function closeProductsModal() { 
        productsModal.classList.remove('visible');
        productsModal.setAttribute('aria-hidden', 'true');
    }

    if (btnPedidos) {
        btnPedidos.addEventListener('click', () => {
            showProductsModal(); 
        });
    }

    function showInvoice(mesaNum) { 
        const mesaInfo = mesaTimers.get(mesaNum) || { startTime: null, totalMinutes: 0, tipo: 'mesa' }; 
        const productos = mesasProductos.get(mesaNum) || []; 
        const now = new Date(); 
        const dateStr = now.toLocaleDateString('es-ES'); 
        const timeStr = now.toLocaleTimeString('es-ES'); 

        document.getElementById('invoice-date').textContent = dateStr; 
        document.getElementById('invoice-time').textContent = timeStr; 
        
        // CONDICIONAL DE TIEMPO: Las mesas normales muestran 0 minutos porque no cobran tiempo
        const esMesaNormal = mesaInfo.tipo === 'mesa';
        document.getElementById('invoice-duration').textContent = esMesaNormal ? 'N/A' : (mesaInfo.totalMinutes || 0) + ' minutos'; 
        
        const productsDiv = document.getElementById('invoice-products');
        
        if (productos.length === 0) {
            productsDiv.innerHTML = '<p id="no-products" style="color: #999;">Sin productos pedidos</p>';
        } else {
            productsDiv.innerHTML = '';
            productos.forEach((prod) => {
                const qty = prod.cantidad || 1;
                const prodP = document.createElement('p');
                prodP.innerHTML = `${prod.nombre} x${qty}  (${prod.precio.toLocaleString('es-CO')} c/u)`;
                productsDiv.appendChild(prodP);
            });
        }
        
        // CORRECCIÓN DE TARIFA DINÁMICA: Diferenciamos el precio por hora según el juego
        let precioPorMinuto = 0;
        if (mesaInfo.tipo === 'billar') precioPorMinuto = 6000 / 60;   // Ejemplo: $6.000 la hora de billar
        if (mesaInfo.tipo === 'bolirana') precioPorMinuto = 5000 / 60; // Ejemplo: $5.000 la hora de bolirana
        if (mesaInfo.tipo === 'mesa') precioPorMinuto = 0;             // Mesas normales no cobran tiempo

        const tiempoTotal = esMesaNormal ? 0 : (mesaInfo.totalMinutes || 0) * precioPorMinuto; 
        const productosTotal = productos.reduce((sum, prod) => sum + (prod.precio * (prod.cantidad || 1)), 0); 
        const totalCOP = tiempoTotal + productosTotal; 
        
        document.getElementById('invoice-subtotal').textContent = Math.round(tiempoTotal).toLocaleString('es-CO');
        document.getElementById('invoice-total').textContent = totalCOP.toLocaleString('es-CO'); 

        invoiceModal.classList.add('visible'); 
        invoiceModal.setAttribute('aria-hidden', 'false'); 
    }

    function closeInvoice() { 
        invoiceModal.classList.remove('visible'); 
        invoiceModal.setAttribute('aria-hidden', 'true'); 
    }

    // Listeners de los modales (Cierre de ventanas)
    const invoiceCloseBtn = invoiceModal.querySelector('.modal-close');
    const productsCloseBtn = productsModal.querySelector('.modal-close');
    const invoiceCloseBtnBottom = invoiceModal.querySelector('.btn-close-modal');
    
    if (invoiceCloseBtn) invoiceCloseBtn.addEventListener('click', closeInvoice);
    if (productsCloseBtn) productsCloseBtn.addEventListener('click', closeProductsModal);
    if (invoiceCloseBtnBottom) invoiceCloseBtnBottom.addEventListener('click', closeInvoice);

    invoiceModal.addEventListener('click', (e) => { if (e.target === invoiceModal) closeInvoice(); });
    productsModal.addEventListener('click', (e) => { if (e.target === productsModal) closeProductsModal(); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeInvoice(); closeProductsModal(); }
    });

    // PROCESAMIENTO DE PAGO
    window.procesarPago = async function() {
        const subTituloText = document.getElementById('invoice-mesa-num').textContent; // Ej: "Billar 2" o "Mesa 1"
        const match = subTituloText.match(/\d+/);
        const mesaNum = match ? parseInt(match[0], 10) : 1;
        
        // Identificar el tipo de mesa mediante el texto del título
        let tipoJuego = 'mesa';
        if (subTituloText.toLowerCase().includes('billar')) tipoJuego = 'billar';
        if (subTituloText.toLowerCase().includes('bolirana')) tipoJuego = 'bolirana';

        const metodo = prompt('Ingresa el método de pago (ej: Efectivo, Transferencia, Tarjeta Débito):');
        if (!metodo) {
            alert('Debes seleccionar un método de pago');
            return;
        }

        const now = new Date();
        const fechaMysql = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0'); 
        const horaMysql = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0') + ':' + String(now.getSeconds()).padStart(2,'0'); 
        const total = document.getElementById('invoice-total').textContent.replace(/\D/g, '');
        
        const productos = mesasProductos.get(mesaNum) || [];
        const cantidad = productos.reduce((sum, p) => sum + (p.cantidad || 1), 0);

        const datosFactura = {
            numero_mesa: mesaNum,
            tipo_mesa: tipoJuego,
            fecha_factura: fechaMysql,
            hora_factura: horaMysql,
            cantidad: cantidad || 1,
            total: parseInt(total) || 0,
            metodo_pago: metodo
        };

        try {
            const res = await fetch('/guardar-factura', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosFactura)
            });

            if (!res.ok) {
                const error = await res.json();
                alert('Error al guardar factura: ' + (error.message || 'Error desconocido'));
                return;
            }

            // Sincronizar el estado libre en la BD enviando el "tipo" correcto
            await fetch("http://localhost:3000/actualizar_mesa", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ id: mesaNum, estado: "Libre", tiempo: "00:00:00", tipo: tipoJuego })
            });

            // Limpiar datos tras pago exitoso
            mesasProductos.set(mesaNum, []);
            mesaTimers.set(mesaNum, { startTime: null, totalMinutes: 0, tipo: tipoJuego });

            invoiceModal.classList.remove('visible');
            invoiceModal.setAttribute('aria-hidden', 'true');

            const successModal = document.getElementById('payment-success-modal');
            document.getElementById('payment-method-display').textContent = metodo;
            document.getElementById('success-mesa-num').textContent = subTituloText; // Muestra "Billar 2" en lugar de solo "2"
            successModal.classList.add('visible');
            successModal.setAttribute('aria-hidden', 'false');

        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar pago: ' + error.message);
        }
    };

    window.cerrarPagoExitoso = function() {
        const successModal = document.getElementById('payment-success-modal');
        successModal.classList.remove('visible');
        successModal.setAttribute('aria-hidden', 'true');
    };

})(); // Fin de la función autoejecutable

// Imprimir factura fuera del wrapper por accesibilidad global
window.imprimirFactura = function() {
    const modal = document.getElementById('invoice-modal');
    if (!modal) return alert('No se encontró la factura');

    const ventana = window.open('', '_blank', 'width=800,height=600');
    ventana.document.write(`
        <html>
        <head>
            <title>Factura ${document.getElementById('invoice-mesa-num').textContent}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2, h3 { margin: 0 0 10px; }
                p { margin: 5px 0; }
                hr { margin: 10px 0; }
            </style>
        </head>
        <body>
            ${modal.querySelector('.modal-content').innerHTML}
        </body>
        </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
};