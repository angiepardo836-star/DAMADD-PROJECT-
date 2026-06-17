(function(){ // Inicio función autoejecutable única
      // Lista de productos disponibles
      let productosDisponibles = [];

      /**
       * Consulta al backend la lista de productos
       */
      function cargarProductosDisponibles(){
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
          mesaTimers.set(mesaNum, { startTime: null, totalMinutes: 0 });
        }
      }

      function closeAll(except){ 
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

      function parseMinutesFromLabel(text){ 
        text = text.toLowerCase(); 
        if (text.includes('2 horas') || text.includes('2 hora')) return 120;
        if (text.includes('1:30 hora')) return 90;
        if (text.includes('1 hora') || (text.includes('1h') && !text.includes('1 hora '))) return 60;
        if (text.includes('30')) return 30; 
       
        const m = text.match(/(\d+)\s*min/); 
        if (m) return parseInt(m[1],10); 
        return 0; 
      }

      function formatTime(seconds){ 
        const m = Math.floor(seconds/60).toString().padStart(2,'0');
        const s = (seconds%60).toString().padStart(2,'0');
        return `${m}:${s}`; 
      }

      function startTimerFor(btn, seconds){ 
        if (timers.has(btn)){
          clearInterval(timers.get(btn).interval); 
          timers.delete(btn); 
        }
        if (!seconds || seconds <= 0) return; 

        let remaining = seconds; 
        const container = btn.closest('.time-container'); 
        const display = container ? container.querySelector('.time-display') : null; 

        if (display){
          display.textContent = formatTime(remaining); 
          display.classList.add('visible','running'); 
        }

        const interval = setInterval(()=>{ 
          remaining -= 1; 
          if (remaining <= 0){ 
            clearInterval(interval); 
            timers.delete(btn); 
            if (display){ 
              display.classList.remove('visible','running'); 
              display.textContent = ''; 
            }
            try{ alert('Tiempo finalizado para la mesa'); }catch(e){} 
            return; 
          }
          if (display) display.textContent = formatTime(remaining); 
        },1000);

        timers.set(btn, { interval, remaining }); 
      }

      function stopTimerFor(btn){ 
        if (timers.has(btn)){
          clearInterval(timers.get(btn).interval); 
          timers.delete(btn); 
        }
        const container = btn.closest('.time-container');
        const display = container ? container.querySelector('.time-display') : null; 
        if (display){ 
          display.classList.remove('visible','running'); 
          display.textContent = ''; 
        }
        btn.classList.remove('timer-running'); 
        btn.textContent = 'Tiempo ▾'; 
      }

      // Inicialización unificada de eventos dinámicos mediante delegación real
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

          // PRIORIDAD DE CAPTURA DEL NÚMERO DE MESA:
          // 1. data-mesa del botón factura, 2. dataset.mesa de la tarjeta, 3. Número en el título H3
          let mesaNum = 1;
          if (btnFactura && btnFactura.getAttribute('data-mesa')) {
            mesaNum = parseInt(btnFactura.getAttribute('data-mesa'), 10);
          } else if (tarjetaMesa && tarjetaMesa.dataset.mesa) {
            mesaNum = parseInt(tarjetaMesa.dataset.mesa, 10);
          } else if (tarjetaMesa) {
            const titulo = tarjetaMesa.querySelector('h3')?.textContent || '';
            const match = titulo.match(/\d+/);
            if (match) mesaNum = parseInt(match[0], 10);
          }

          asegurarMesaInicializada(mesaNum);

          const value = option.textContent.trim(); 
          
          container.classList.remove('open'); 
          menu.setAttribute('aria-hidden', 'true'); 
          menu.style.display = 'none'; 

          // Opción: Detener Tiempo
          if (option.classList.contains('stop-option')){ 
            stopTimerFor(btn);
            
            fetch("http://localhost:3000/actualizar_mesa", {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({ mesa: mesaNum, estado: "libre", tiempo: 0 })
            });
            mesaTimers.set(mesaNum, { startTime: null, totalMinutes: 0 });
            console.log(`Se detuvo el cronómetro para mesa ${mesaNum}`); 
            return; 
          }

          // Opción: Asignar un Tiempo nuevo
          btn.textContent = value + ' ▾'; 
          const minutes = parseMinutesFromLabel(value); 
          startTimerFor(btn, minutes * 60); 
          
          fetch("http://localhost:3000/actualizar_mesa", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ mesa: mesaNum, estado: "ocupada", tiempo: minutes })
          });

          mesaTimers.set(mesaNum, { startTime: new Date(), totalMinutes: minutes });
          console.log(`Inicia cronómetro mesa ${mesaNum}:`, minutes, 'minutos'); 
        });

        // 3. CORRECCIÓN CENTRAL: Único listener global para el botón de Factura
        document.addEventListener('click', (e) => {
          const btnFactura = e.target.closest('.factura-btn');
          if (!btnFactura) return;
          
          e.stopPropagation();
          
          // Capturar los atributos exactos definidos en tu HTML dinámico
          const numeroStr = btnFactura.getAttribute('data-mesa') || "1";
          const tipoStr = btnFactura.getAttribute('data-tipo') || "Mesa";
          const mesaNum = parseInt(numeroStr, 10);
          
          // Aseguramos que los mapas de datos reconozcan este ID de mesa
          asegurarMesaInicializada(mesaNum);

          // Sincronizar el encabezado del modal con los datos de la mesa presionada
          const modalTitulo = document.getElementById('invoice-mesa-num');
          if (modalTitulo) {
              modalTitulo.textContent = `${tipoStr} ${numeroStr}`;
          }
          
          // Renderizar los datos correctos de la mesa correspondiente
          showInvoice(mesaNum);
        });
      }

      // Cerrar componentes flotantes al hacer click fuera o con ESC
      document.addEventListener('click', () => closeAll(null)); 
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAll(null); 
      });

      // Funcionalidad de Factura e Invoices (Modales)
      const invoiceModal = document.getElementById('invoice-modal'); 
      const productsModal = document.getElementById('products-modal'); 
      const btnPedidos = document.getElementById('btn-pedidos'); 

      function renderProductsList(mesaNum){ 
        const productsList = document.getElementById('products-list');
        if(!productsList) return;
        productsList.innerHTML = '';
        
        productosDisponibles.forEach((producto, idx) => {
          if (producto.cantidad <= 0) return;

          const productDiv = document.createElement('div');
          productDiv.style.cssText = 'padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 5px; display: flex; justify-content: space-between; align-items: center;';
          productDiv.innerHTML = `
            <span>${producto.nombre} (${producto.marca}- ${producto.cantidad}) - COP$${producto.precio.toLocaleString('es-CO')}</span>
            <button onclick="window.agregarProductoAMesa(${mesaNum}, ${idx});" style="padding: 5px 10px; background: #146d02; color: white; border: none; border-radius: 4px; cursor: pointer;">Agregar</button>
          `;
          productsList.appendChild(productDiv);
        });
      }

      window.agregarProductoAMesa = function(mesaNum, productoIdx){ 
        const producto = productosDisponibles[productoIdx];
        if (!producto) return alert('Producto inválido');
        
        const cantidadStr = prompt(`Cantidad a agregar de "${producto.nombre}":`, '1');
        if (cantidadStr === null) return; 
        const cantidad = parseInt(cantidadStr, 10);
        if (isNaN(cantidad) || cantidad <= 0) return alert('Cantidad inválida');
        if (cantidad > producto.cantidad) {
          return alert(`Solo hay ${producto.cantidad} en stock`);
        }

        asegurarMesaInicializada(mesaNum);
        const productos = mesasProductos.get(mesaNum) || [];
        const existente = productos.find(p => p.nombre === producto.nombre && p.precio === producto.precio && p.marca === producto.marca);
        if (existente){
          existente.cantidad = (existente.cantidad || 1) + cantidad;
        } else {
          productos.push({ nombre: producto.nombre, marca: producto.marca, precio: producto.precio, cantidad: cantidad });
        }
        mesasProductos.set(mesaNum, productos);

        fetch('/descontar-producto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: producto.id, cantidad })
        }).then(resp => {
          if (!resp.ok) return resp.text().then(t => Promise.reject(t));
          producto.cantidad -= cantidad;
          renderProductsList(mesaNum);
          alert(`"${producto.nombre}" x${cantidad} agregado a mesa ${mesaNum}`);
        }).catch(err => {
          alert('No se pudo descontar stock: ' + err);
        });
      };

      function showProductsModal(mesaNum){ 
        document.getElementById('products-mesa-num').textContent = mesaNum;
        if(productosDisponibles.length === 0){
          cargarProductosDisponibles().then(() => {
            renderProductsList(mesaNum);
            productsModal.classList.add('visible');
            productsModal.setAttribute('aria-hidden', 'false');
          });
        } else {
          renderProductsList(mesaNum);
          productsModal.classList.add('visible');
          productsModal.setAttribute('aria-hidden', 'false');
        }
      }

      function closeProductsModal(){ 
        productsModal.classList.remove('visible');
        productsModal.setAttribute('aria-hidden', 'true');
      }

      if(btnPedidos) {
        btnPedidos.addEventListener('click', () => {
          let mesaSeleccionada = prompt('Ingresa el número de mesa:', '1');
          if (mesaSeleccionada) {
            const mesaNum = parseInt(mesaSeleccionada, 10);
            if (!isNaN(mesaNum) && mesaNum > 0) {
              showProductsModal(mesaNum);
            } else {
              alert('Por favor ingresa un número de mesa válido.');
            }
          }
        });
      }

      function showInvoice(mesaNum){ 
        const mesaInfo = mesaTimers.get(mesaNum) || { startTime: null, totalMinutes: 0 }; 
        const productos = mesasProductos.get(mesaNum) || []; 
        const now = new Date(); 
        const dateStr = now.toLocaleDateString('es-ES'); 
        const timeStr = now.toLocaleTimeString('es-ES'); 

        document.getElementById('invoice-date').textContent = dateStr; 
        document.getElementById('invoice-time').textContent = timeStr; 
        document.getElementById('invoice-duration').textContent = mesaInfo.totalMinutes + ' minutos'; 
        
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
        
        const tiempoTotal = (mesaInfo.totalMinutes || 0) / 30 * 4000; 
        const productosTotal = productos.reduce((sum, prod) => sum + (prod.precio * (prod.cantidad || 1)), 0); 
        const totalCOP = tiempoTotal + productosTotal; 
        
        document.getElementById('invoice-subtotal').textContent = Math.round(tiempoTotal).toLocaleString('es-CO');
        document.getElementById('invoice-total').textContent = totalCOP.toLocaleString('es-CO'); 

        invoiceModal.classList.add('visible'); 
        invoiceModal.setAttribute('aria-hidden', 'false'); 
      }

      function closeInvoice(){ 
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
          const subTituloText = document.getElementById('invoice-mesa-num').textContent;
          const match = subTituloText.match(/\d+/);
          const mesaNum = match ? parseInt(match[0], 10) : 1;
          
          const tiempoInfo = mesaTimers.get(mesaNum) || { startTime: null, totalMinutes: 0 };
          
          if (!tiempoInfo.totalMinutes || tiempoInfo.totalMinutes === 0) {
              alert('Debes registrar un tiempo antes de procesar el pago');
              return;
          }
          
          const metodo = prompt('Ingresa el método de pago (ej: Efectivo, Transferencia, Tarjeta):');
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

              // Limpiar datos tras pago exitoso
              mesasProductos.set(mesaNum, []);
              mesaTimers.set(mesaNum, { startTime: null, totalMinutes: 0 });

              invoiceModal.classList.remove('visible');
              invoiceModal.setAttribute('aria-hidden', 'true');

              const successModal = document.getElementById('payment-success-modal');
              document.getElementById('payment-method-display').textContent = metodo;
              document.getElementById('success-mesa-num').textContent = mesaNum;
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