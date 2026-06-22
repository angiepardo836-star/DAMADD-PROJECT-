document.addEventListener('DOMContentLoaded', () => {
    // --- REFERENCIAS AL DOM ---
    const tablaCuentas = document.getElementById('tabla-cuentas-body');
    const modalEditar = document.getElementById('modal-editar');
    const formEditar = document.getElementById('formulario-editar-cuenta');
    const formCrearCuenta = document.getElementById('formulario-crear-cuenta');
    const btnCerrarModal = document.querySelector('.cerrar-modal');
    const btnCancelar = document.querySelector('.btn-cancelar');

    // ---  MANEJO DE PESTAÑAS ---
    const botonesPestaña = document.querySelectorAll('.pestaña-btn');
    const contenidosPestaña = document.querySelectorAll('.pestaña-contenido');

    botonesPestaña.forEach(btn => {
        btn.addEventListener('click', () => {
            const objetivo = btn.getAttribute('data-pestaña');
            
            botonesPestaña.forEach(b => b.classList.remove('activo'));
            contenidosPestaña.forEach(c => c.classList.remove('activo'));

            btn.classList.add('activo');
            // Corrección de IDs: 'screar' -> 'crear'
            const idSeccion = objetivo === 'screar' ? 'crear' : objetivo;
            document.getElementById(idSeccion).classList.add('activo');

            if (objetivo === 'administrar') cargarUsuarios();
        });
    });

    // --- 2. CARGAR USUARIOS EN LA TABLA ---
    async function cargarUsuarios() {
        try {
            const response = await fetch('/obtener-usuarios');
            const usuarios = await response.json();
            
            tablaCuentas.innerHTML = '';
            
            if (usuarios.length === 0) {
                document.getElementById('sin-cuentas').style.display = 'block';
                return;
            }

            document.getElementById('sin-cuentas').style.display = 'none';

            usuarios.forEach(u => {
                const usuario      = u.usuario || u.usuario_usuario || '—';
                const nombre       = u.nombre || u.nombre_usuario || '—';
                const apellido     = u.apellido || u.apellido_usuario || '—';
                const correo       = u.correo || u.correo_usuario || '—';
                const cargo        = u.cargo || u.cargo_usuario || '—';
                const id_usuario   = u.documento || u.id_usuario || '—';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.usuario || u.usuario_usuario || '—'}</td>
                    <td>${u.nombre || u.nombre_usuario || ''}</td>
                    <td>${u.apellido || u.apellido_usuario || ''}</td>
                    <td>${u.correo || u.correo_usuario || ''}</td>
                    <td><span class="badge-${u.cargo || u.cargo_usuario}">${u.cargo || u.cargo_usuario}</span></td>
                    <td>
                        <button class="btn-edit" onclick="prepararEdicion(${u.id_usuario})">Editar</button>
                        <button class="btn-delete" onclick="eliminarUsuario(${u.id_usuario})">Eliminar</button>
                    </td>
                `;
                tablaCuentas.appendChild(tr);
            });
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        }
    }

    // --- 3. GUARDAR NUEVO USUARIO (EVITA PANTALLA NEGRA) ---
    formCrearCuenta.addEventListener('submit', async (e) => {
        e.preventDefault(); // Detiene el envío automático del navegador

        const datos = {
            nombre_usuario: document.getElementById('nombre').value.trim(),
            apellido_usuario: document.getElementById('apellido').value.trim(),
            usuario_usuario: document.getElementById('usuario').value.trim(),
            correo_usuario: document.getElementById('correo').value.trim(),
            contraseña_usuario: document.getElementById('contraseña').value.trim(),
            cargo_usuario: document.getElementById('rol').value
        };

        try {
            const response = await fetch('/guardar-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const result = await response.json();

            if (result.success) {
                alert("¡Cuenta creada con éxito!");
                formCrearCuenta.reset();
                // Redirigir visualmente a la tabla para ver el nuevo usuario
                document.querySelector('[data-pestaña="administrar"]').click();
            } else {
                alert("Error al registrar: " + result.message);
            }
        } catch (error) {
            console.error("Error en el registro:", error);
            alert("Error de conexión con el servidor.");
        }
    });

    // --- 4. PREPARAR EDICIÓN (PIDE CONTRASEÑA DEL USUARIO A EDITAR) ---
    window.prepararEdicion = async (id) => {
        const password_ingresada = prompt("Ingrese la contraseña ACTUAL de este usuario para permitir cambios:");
        
        if (!password_ingresada) return;

        try {
            const verif = await fetch('/verificar-password-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({documento: id, contrasena: password_ingresada })
            });

            const resultado = await verif.json();

            if (resultado.success) {
                const res = await fetch('/obtener-usuarios');
                const usuarios = await res.json();
                const u = usuarios.find(u => u.id_usuario === id);

                if (u) {
                    document.getElementById('editar-usuario-original').value = u.documento || u.id_usuario;
                    document.getElementById('editar-nombre').value = u.nombre_usuario || u.nombre || '';
                    document.getElementById('editar-apellido').value = u.apellido_usuario || u.apellido || '';
                    document.getElementById('editar-usuario').value = u.usuario_usuario || u.usuario || '';
                    document.getElementById('editar-correo').value = u.correo_usuario || u.correo || '';
                    document.getElementById('editar-rol').value = u.cargo_usuario || u.cargo || '';

                    modalEditar.style.display = 'flex';
                }
            } else {
                alert("Contraseña incorrecta. No tienes permiso para editar este perfil.");
            }
        } catch (error) {
            console.error("Error en validación:", error);
        }
    };

    // --- 5. GUARDAR CAMBIOS DE EDICIÓN ---
    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editar-usuario-original').value;
        
        const datos = {
            nombre_usuario: document.getElementById('editar-nombre').value.trim(),
            apellido_usuario: document.getElementById('editar-apellido').value.trim(),
            usuario_usuario: document.getElementById('editar-usuario').value.trim(),
            correo_usuario: document.getElementById('editar-correo').value.trim(),
            contraseña_usuario: document.getElementById('editar-contraseña').value.trim(), 
            cargo_usuario: document.getElementById('editar-rol').value
        };

        try {
            const res = await fetch(`/editar-usuario/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const data = await res.json();

            if (data.success) {
                alert("Cuenta actualizada con éxito");
                modalEditar.style.display = 'none';
                formEditar.reset();
                cargarUsuarios();
            } else {
                alert("Error al actualizar la cuenta");
            }
        } catch (error) {
            console.error("Error en actualización:", error);
        }
    });

    // --- 6. ELIMINAR USUARIO ---
    window.eliminarUsuario = async (id) => {
        if (!confirm("¿Estás seguro de eliminar esta cuenta?")) return;

        try {
            const res = await fetch(`/eliminar-usuario/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert("Usuario eliminado correctamente");
                cargarUsuarios();
            }
        } catch (error) {
            alert("Error al intentar eliminar el usuario");
        }
    };

    // --- CERRAR MODAL ---
    const cerrar = () => {
        modalEditar.classList.remove('open');
        formEditar.reset();
    };

    btnCerrarModal?.addEventListener('click', cerrar);
    btnCancelar?.addEventListener('click', cerrar);
    
    window.addEventListener('click', (e) => {
        if (e.target === modalEditar) cerrar();
    });

    // Carga inicial
    cargarUsuarios();
});