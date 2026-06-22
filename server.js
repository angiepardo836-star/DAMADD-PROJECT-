require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger (para ver peticiones)
app.use((req, res, next) => {
    console.log("Petición recibida:", req.method, req.url);
    next();
});

// Conexión a MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234567',
    database: process.env.DB_NAME || 'damadd',
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/inicio_sesion.html');
});

// GUARDAR PROVEEDOR
// GUARDAR PROVEEDOR
app.post('/guardar-proveedor', (req, res) => {
    console.log('Datos proveedor recibidos:', req.body);
    const { tipo_documento, documento, nombre, apellido, telefono, ciudad, direccion, correo, estado } = req.body;

    const sql = `
        INSERT INTO proveedor
        (tipo_documento, documento, nombre, apellido, telefono, ciudad, direccion, correo, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        tipo_documento,
        documento,
        nombre,
        apellido,
        telefono,
        ciudad,
        direccion,
        correo,
        estado
    ], (err) => {

        if (err) {
            console.error(err);
            return res.status(500).send(err.message);
        }

        res.send("Proveedor guardado.");
    });
});

// OBTENER TODOS LOS PROVEEDORES
app.get('/obtener-proveedores', (req, res) => {
    const sql = "SELECT * FROM proveedor"; 
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener proveedores:', err);
            return res.status(500).json({ success:false, message:"Error en la base de datos"});
        }
        res.json(results); // Envía los datos como una lista JSON
    });
});

// RUTA PARA ELIMINAR PROVEEDOR  
app.delete('/eliminar-proveedor/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM proveedor WHERE documento = ?";
    
    db.query(sql, [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err.message);
        }
        res.send("Proveedor eliminado.");
    });
});

// RUTA PARA EDITAR PROVEEDOR
app.put('/editar-proveedor/:id', (req, res) => {
    const id = req.params.id;
    const { tipo_documento, documento, nombre, apellido,  telefono, ciudad, direccion, correo, estado } = req.body;
    
    const sql = `
        UPDATE proveedor 
        SET tipo_documento=?, documento=?, nombre=?, apellido=?,  telefono=?, ciudad=?, direccion=?, correo=?, estado=?
        WHERE documento =?
    `;

    db.query(sql, [tipo_documento, documento, nombre, apellido,  telefono, ciudad, direccion, correo, estado], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error");
        }

        res.send("Proveedor actualizado.");
    });
});


// RUTA PARA ELIMINAR PROVEEDOR  
app.delete('/eliminar-proveedor/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM proveedor WHERE id_proveedor = ?";
    
    db.query(sql, [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error");
        }
        res.send("Proveedor eliminado.");
    });
});

// RUTA PARA EDITAR PROVEEDOR
app.put('/editar-proveedor/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, documento, telefono, ciudad, direccion, correo, producto } = req.body;
    
    const sql = `
        UPDATE proveedor 
        SET nombre_proveedor=?, certificacion_proveedor=?, telefono_proveedor=?, 
            ciudad_proveedor=?, direccion_proveedor=?, correo_proveedor=?, producto_proveedor=? 
        WHERE id_proveedor=?
    `;

    db.query(sql, [nombre, documento, telefono, ciudad, direccion, correo, producto, id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error");
        }

        res.send("Proveedor actualizado.");
    });
});

// COMPRAr PRODUCTO (REGISTRAR COMPRA)

app.post('/registrar-compra', (req, res) => {
    const { 
        fecha_compra, cantidad_producto_compra, precio_unitario, 
        valor_compra, forma_pago_compra, estado_compra, 
        id_proveedor, id_producto 
    } = req.body;

    // validación básica de entrada
    if (!fecha_compra || !forma_pago_compra || !estado_compra) {
        return res.status(400).send('Faltan campos obligatorios');
    }
    if (
        isNaN(cantidad_producto_compra) ||
        isNaN(precio_unitario) ||
        isNaN(valor_compra) ||
        isNaN(id_proveedor) ||
        isNaN(id_producto)
    ) {
        return res.status(400).send('Valores numéricos inválidos');
    }

    // 1. Primero insertamos la compra
    const sqlCompra = `INSERT INTO compra (fecha_compra, cantidad_producto_compra, precio_unitario, valor_compra, forma_pago_compra, estado_compra, id_proveedor, id_producto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sqlCompra, [fecha_compra, cantidad_producto_compra, precio_unitario, valor_compra, forma_pago_compra, estado_compra, id_proveedor, id_producto], (err, result) => {
        if (err) {
            console.error("ERROR AL INSERTAR COMPRA:", err.message);
            return res.status(500).send("Error al registrar la compra.");
        }

        // 2. Si la compra se insertó bien, actualizamos el stock en la tabla producto
        // Usamos SET cantidad_producto = cantidad_producto + ? para sumar lo nuevo
        const sqlActualizarStock = `UPDATE producto SET cantidad_producto = cantidad_producto + ? WHERE id_producto = ?`;

        db.query(sqlActualizarStock, [cantidad_producto_compra, id_producto], (errStock) => {
            if (errStock) {
                console.error("ERROR AL ACTUALIZAR STOCK:", errStock.message);
                // Nota: La compra ya se guardó, pero el stock falló
                return res.status(500).send("Compra registrada, pero no se pudo actualizar el stock.");
            }
            
            res.send("ok"); // Todo salió perfecto
        });
    });
});

// GUARDAR PRODUCTO
app.post('/guardar-producto', async (req, res) => {
    console.log('Datos producto recibidos:', req.body);

    const {
        nombre_producto,
        marca_producto,
        cantidad_producto,
        categoria_producto,
        presentacion_producto,
        fecha_vencimiento_producto,
        precio_unitario_producto
    } = req.body;

    // Definimos la consulta para buscar duplicados
    const sqlCheck = `
        SELECT id_producto FROM producto 
        WHERE marca_producto = ? 
          AND categoria_producto = ? 
          AND presentacion_producto = ?
    `;

    // Ejecutamos la búsqueda
    db.query(sqlCheck, [ marca_producto, categoria_producto, presentacion_producto], (err, results) => {
        if (err) {
            console.error("Error al buscar duplicados:", err);
            return res.status(500).send("Error en el servidor al verificar el producto.");
        }

        // Si encontramos resultados, significa que ya existe
        if (results.length > 0) {
            return res.status(400).send("El producto ya existe en la base de datos.");
        }

        // Si no existe, procedemos con el guardado normal
        const total = cantidad_producto * precio_unitario_producto;
        const sqlInsert = `
            INSERT INTO producto 
            (nombre_producto, marca_producto, cantidad_producto, categoria_producto, 
            presentacion_producto, fecha_vencimiento_producto, 
            precio_unitario_producto, precio_total_producto)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sqlInsert, [
            nombre_producto,
            marca_producto,
            cantidad_producto,
            categoria_producto,
            presentacion_producto,
            fecha_vencimiento_producto,
            precio_unitario_producto,
            total
        ], (errInsert) => {
            if (errInsert) {
                console.error("Error al insertar:", errInsert);
                return res.status(500).send("ERROR: producto repetido no se puede agregar.");
            }
            res.send("Producto guardado exitosamente.");
        });
    });
    
});

// OBTENER TODOS LOS PRODUCTOS
app.get('/obtener-productos', (req, res) => {
    const sql = "SELECT * FROM producto"; 
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).json({ success:false, message:"Error en la base de datos"});
        }
        res.json(results); // Envía los datos como una lista JSON
    });
});

// DESCONTAR CANTIDAD DE UN PRODUCTO (usado por mesas.js)
app.post('/descontar-producto', (req, res) => {
    const { id, cantidad } = req.body;
    if (typeof id === 'undefined' || typeof cantidad === 'undefined') {
        return res.status(400).send('Datos incompletos');
    }
    const sql = `UPDATE producto
                 SET cantidad_producto = cantidad_producto - ?
                 WHERE id_producto = ? AND cantidad_producto >= ?`;
    db.query(sql, [cantidad, id, cantidad], (err, result) => {
        if (err) {
            console.error('Error al descontar producto:', err);
            return res.status(500).send('Error en la base de datos');
        }
        if (result.affectedRows === 0) {
            // No se actualizó: puede ser id inválido o stock insuficiente
            return res.status(400).send('Stock insuficiente o producto no encontrado');
        }
        res.send('ok');
    });
});

// RUTA PARA ELIMINAR PRODUCTO 
app.delete('/eliminar-producto/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM producto WHERE id_producto = ?";
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar:", err);
            return res.status(500).send("Error en la base de datos");
        }
        // Si no se eliminó nada (porque el ID no existe)
        if (result.affectedRows === 0) {
            return res.status(404).send("Producto no encontrado");
        }
        res.send("Producto eliminado.");
    });
});

// RUTA PARA EDITAR PRODUCTO
app.put('/editar-producto/:id', (req, res) => {
    const id = req.params.id;
    const { 
        nombre_producto, 
        marca_producto, 
        cantidad_producto, 
        categoria_producto, 
        presentacion_producto, 
        fecha_vencimiento_producto, 
        precio_unitario_producto, 
        precio_total_producto 
    } = req.body;
    
    const sql = `
        UPDATE producto
        SET nombre_producto=?, marca_producto=?, cantidad_producto=?, 
            categoria_producto=?, presentacion_producto=?, fecha_vencimiento_producto=?, 
            precio_unitario_producto=?, precio_total_producto=? 
        WHERE id_producto=?
    `;

    const valores = [
        nombre_producto, marca_producto, cantidad_producto, 
        categoria_producto, presentacion_producto, 
        fecha_vencimiento_producto || null, 
        precio_unitario_producto, precio_total_producto, 
        id
    ];

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error("Error SQL detallado:", err);
            return res.status(500).send("Error al actualizar");
        }
        res.send("Producto actualizado.");
    });
});

// REGISTRO DE USUARIOS 
app.post('/guardar-usuario', async (req, res) => {
    const { tipo_documento, documento, nombre, apellido, usuario, telefono, correo, contrasena, admin_key } = req.body;

        if (correo === process.env.CORREO_SOPORTE) {
            return res.status(400).json({ success: false, message: "El correo electrónico ya está registrado." });
        }

        const sqlCheck = `
            SELECT documento, usuario, telefono, correo 
            FROM usuario 
            WHERE documento = ? OR usuario = ? OR telefono = ? OR correo = ? 
            LIMIT 1
        `;
        
        const [usuariosExistentes] = await db.promise().query(sqlCheck, [documento, usuario, telefono, correo]);

        if (usuariosExistentes.length > 0) {
            const registrado = usuariosExistentes[0];
            
            if (registrado.documento.toString() === documento.toString()) {
                return res.status(400).json({ success: false, message: "El número de documento ya está registrado." });
            }
            if (registrado.usuario === usuario) {
                return res.status(400).json({ success: false, message: "El nombre de usuario ya está en uso." });
            }
            if (registrado.telefono === telefono) {
                return res.status(400).json({ success: false, message: "El número de teléfono ya está registrado." });
            }
            if (registrado.correo === correo) {
                return res.status(400).json({ success: false, message: "El correo electrónico ya está registrado." });
            }
        }

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(contrasena, salt);

        const [filas] = await db.promise().query("SELECT COUNT(*) as total FROM usuario WHERE rol = 'Gerente'");
        const existeGerente = filas[0].total > 0;

        let rolFinal = 'Empleado';

        if (!existeGerente) {
            rolFinal = 'Gerente';
        } else {
            const [propietarios] = await db.promise().query("SELECT contrasena FROM usuario WHERE rol = 'Gerente' LIMIT 1");
            
            if (propietarios.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontró un Gerente activo para validar la clave" });
            }

            const claveValida = await bcrypt.compare(admin_key, propietarios[0].contrasena);
            if (!claveValida) {
                return res.status(401).json({ success: false, message: "Clave de autorización incorrecta" });
            }
        }

        const sqlUser = `
            INSERT INTO usuario (
                tipo_documento, documento, nombre, apellido, usuario, 
                telefono, correo, contrasena, rol, estado, 
                fecha_creacion, fecha_modificacion, usuario_modifica, usuario_crea
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Activo', NOW(), NOW(), ?, ?)
        `;
        
        await db.promise().query(sqlUser, [
            tipo_documento, documento, nombre, apellido, usuario, 
            telefono, correo, hash, rolFinal, usuario, usuario
        ]);
        
        return res.json({ success: true, message: `Registro exitoso | Rol asignado: ${rolFinal}` });

    } catch (error) {
        console.error("Error en registro:", error);
        return res.status(500).json({ success: false, message: "Error en el servidor" });
    }
});

// LOGIN 
app.post('/login', async (req, res) => {
    const { usuario: identificador, contrasena } = req.body; 
    
    if (identificador === process.env.CORREO_SOPORTE && contrasena === process.env.CLAVE_SOPORTE) {
        return res.json({
            success: true,
            documento: "0000000000",
            tipo_documento: "CC",
            nombre: "Soporte",
            apellido: "DAMADD",
            usuario: "soporte_damadd",
            telefono: "0000000000",
            correo: process.env.CORREO_SOPORTE,
            rol: "Administrador" 
        });
    }

    const sql = "SELECT * FROM usuario WHERE usuario = ? OR correo = ?";

    db.query(sql, [identificador, identificador], async (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Error de base de datos" });
        
        if (results && results.length > 0) {
            const usuarioBD = results[0];

            if (usuarioBD.estado === 'Inactivo') {
                return res.json({ success: false, message: "El usuario se encuentra inactivo." });
            }

            const contrasenaCorrecta = await bcrypt.compare(contrasena, usuarioBD.contrasena);
            
            if (contrasenaCorrecta) {
                return res.json({ 
                    success: true, 
                    documento: usuarioBD.documento,
                    tipo_documento: usuarioBD.tipo_documento,
                    nombre: usuarioBD.nombre,
                    apellido: usuarioBD.apellido,
                    usuario: usuarioBD.usuario,
                    telefono: usuarioBD.telefono,
                    correo: usuarioBD.correo,
                    rol: usuarioBD.rol 
                });
            } else {
                return res.json({ success: false, message: "Contraseña incorrecta." });
            }
        } else {
            return res.json({ success: false, message: "El usuario no existe." });
        }
    });
});

// configuración nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS 
    }
});

function generarBolasImagenes(codigo) {
    const digitos = String(codigo).split('');
    const urlBolas = {
        '1': 'https://res.cloudinary.com/dknlberyo/image/upload/v1780684052/bola1_qqz44m.png',
        '2': 'https://res.cloudinary.com/dknlberyo/image/upload/v1780684052/bola2_o3vevy.png',
        '3': 'https://res.cloudinary.com/dknlberyo/image/upload/v1780684052/bola3_ro4ssc.png',
        '4': 'https://res.cloudinary.com/dknlberyo/image/upload/v1780684052/bola4_keupcd.png',
        '5': 'https://res.cloudinary.com/dknlberyo/image/upload/v1780684052/bola5_ndtd1v.png',
        '6': 'https://res.cloudinary.com/dknlberyo/image/upload/v1780684052/bola6_omho8d.png',
        '7': 'https://res.cloudinary.com/dknlberyo/image/upload/v1780684053/bola7_hqcqaw.png',
        '8': 'https://res.cloudinary.com/dknlberyo/image/upload/v1780684053/bola8_qylugp.png',
        '9': 'https://res.cloudinary.com/dknlberyo/image/upload/v1780684053/bola9_hnwz02.png',
        '0': 'https://res.cloudinary.com/dknlberyo/image/upload/v1780684052/bola0_cpjh1v.png' 
    };

    return digitos.map(dgt => {
        const src = urlBolas[dgt]; 
        return `
            <td align="center" style="padding: 0 4px;">
                <img src="${src}" alt="${dgt}" width="50" height="50" style="display: block; border: 0;">
            </td>
        `;
    }).join('');
}


// PASO 1: SOLICITAR CÓDIGO
app.post('/olvido-contrasena', async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ success: false, message: "El correo es obligatorio." });
    }

    try {
        // Verifica si el usuario existe
        const [usuarios] = await db.promise().query('SELECT documento, nombre FROM usuario WHERE correo = ?', [correo]);

        if (usuarios.length === 0) {
            return res.status(404).json({ success: false, message: "No existe ninguna cuenta registrada con este correo." });
        }

        const usuario = usuarios[0];

        const codigoRecuperacion = crypto.randomInt(100000, 999999).toString();
        const expiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 Minutos

        await db.promise().query(
            'UPDATE usuario SET codigo_recuperacion = ?, expiracion_codigo = ?, fecha_modificacion = NOW(), usuario_modifica = ? WHERE documento = ?',
            [codigoRecuperacion, expiracion, usuario.nombre, usuario.documento]
        );

        const bolasHtmlResult = generarBolasImagenes(codigoRecuperacion);
        const mailOptions = {
            from: `"DAMADD" <${process.env.EMAIL_USER}>`,
            to: correo,
            subject: 'Código de Recuperación 🎱',
            html: `
                <!DOCTYPE html>
                <html>
                <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: sans-serif;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #0d131f; border: 1px solid #1e293b; border-radius: 16px; margin: 40px auto;">
                        <tr>
                            <td align="center" style="padding: 40px 0;">
                                <img src="https://res.cloudinary.com/dknlberyo/image/upload/v1780689335/logoo_lycq4e.png" alt="logo" style="width: 40%; height: auto;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 40px; color: #f1f5f9; font-size: 15px; text-align: center;">
                                <p>Hola, <strong>${usuario.nombre}</strong>.</p>
                                <p style="color: #94a3b8;">Tu código de recuperación es:</p> 
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 20px;">
                                <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                    <tr>${bolasHtmlResult}</tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 20px 40px;">
                                <p style="font-size: 13px; color: #64748b;">Este código expira en 15 minutos.</p>
                                <p style="font-size: 11px; color: #475569;">© 2026 software DAMADD. Todos los derechos reservados.</p>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        };

        // Envia el correo 
        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: "Código enviado a tu correo." });

    } catch (error) {
        console.error("Error en paso 1 de recuperación:", error);
        return res.status(500).json({ success: false, message: "Error en el proceso de recuperación." });
    }
});


// PASO 2: VERIFICAR CÓDIGO
app.post('/verificar-codigo-recuperacion', async (req, res) => {
    const { correo, codigo } = req.body;

    if (!correo || !codigo) {
        return res.status(400).json({ success: false, message: "Datos incompletos." });
    }

    try {
        const [resultados] = await db.promise().query(
            'SELECT expiracion_codigo FROM usuario WHERE correo = ? AND codigo_recuperacion = ?',
            [correo, codigo]
        );

        if (resultados.length === 0) {
            return res.status(400).json({ success: false, message: "El código es incorrecto." });
        }

        const usuario = resultados[0];
        if (new Date() > new Date(usuario.expiracion_codigo)) {
            return res.status(400).json({ success: false, message: "El código ha expirado." });
        }

        return res.json({ success: true, message: "Código verificado correctamente." });

    } catch (error) {
        console.error("Error en paso 2 de recuperación:", error);
        return res.status(500).json({ success: false, message: "Error en el servidor." });
    }
});


// PASO 3: ACTUALIZAR CONTRASEÑA
app.post('/actualizar-contrasena-recuperacion', async (req, res) => {
    const { correo, nueva_pass } = req.body;

    if (!correo || !nueva_pass) {
        return res.status(400).json({ success: false, message: "Datos incompletos." });
    }

    const estructuraContrasena = /^(?=.*[._%+@#$?!&*-])[a-zA-Z0-9._%+-@#$?!&*]{8,30}$/;
    if (!estructuraContrasena.test(nueva_pass)) {
        return res.status(400).json({ success: false, message: "La contraseña no cumple con los requisitos de seguridad." });
    }

    try {
        const [resultados] = await db.promise().query('SELECT contrasena, usuario FROM usuario WHERE correo = ?', [correo]);
        
        if (resultados.length === 0) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }

        const contrasenaActual = resultados[0].contrasena;
        const nombreUsuario = resultados[0].usuario;

        // Compara contraseñas
        const coinciden = await bcrypt.compare(nueva_pass, contrasenaActual);
        if (coinciden) {
            return res.status(400).json({ success: false, message: "La nueva contraseña no puede ser igual a la anterior." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nueva_pass, salt);

        const [resultado] = await db.promise().query(
            'UPDATE usuario SET contrasena = ?, codigo_recuperacion = NULL, expiracion_codigo = NULL, fecha_modificacion = NOW(), usuario_modifica = ? WHERE correo = ?',
            [hashedPassword, nombreUsuario, correo]
        );

        if (resultado.affectedRows === 0) {
            return res.status(400).json({ success: false, message: "El usuario ya no existe." });
        }

        return res.json({ success: true, message: "Contraseña actualizada con éxito." });

    } catch (error) {
        console.error("Error en paso 3 de recuperación:", error);
        return res.status(500).json({ success: false, message: "Error al guardar la contraseña." });
    }
});


// OBTENER PERFIL
app.get('/obtener-perfil/:id', async (req, res) => {
    const id = req.params.id;
    const sql = "SELECT documento, tipo_documento, nombre, apellido, usuario, telefono, correo, rol FROM usuario WHERE documento = ?";
    
    try {
        const [result] = await db.promise().query(sql, [id]);
        if (result.length > 0) {
            return res.json(result[0]); 
        } else {
            return res.status(404).json({ success: false, message: "Perfil no encontrado" });
        }
    } catch (error) {
        console.error("Error en obtener-perfil:", error);
        return res.status(500).json({ success: false, message: "Error en el servidor." });
    }
});


// OBTENER TODOS LOS USUARIOS 
app.get('/obtener-usuarios', async (req, res) => {
    try {
        const sql = `
            SELECT documento, tipo_documento, nombre, apellido, usuario, 
                   telefono, correo, rol, estado, fecha_creacion 
            FROM usuario
        `;
        const [results] = await db.promise().query(sql);
        return res.json(results);
    } catch (error) {
        console.error("Error en obtener-usuarios:", error);
        return res.status(500).json([]);
    }
});

// ELIMINAR USUARIO
app.delete('/eliminar-usuario/:id', (req, res) => {
    db.query("DELETE FROM usuario WHERE documento = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

// VERIFICAR CONTRASEÑA ANTES DE EDITAR
app.post('/verificar-password-admin', async (req, res) => {
    const { documento, password_ingresada } = req.body;
    
    if (!documento || !password_ingresada) {
        return res.status(400).json({ success: false, message: "Datos incompletos." });
    }

    const sql = "SELECT contrasena FROM usuario WHERE documento = ?";
    try {
        const [results] = await db.promise().query(sql, [documento]);
        if (results.length === 0) {
            return res.json({ success: false, message: "Usuario no encontrado." });
        }
        
        // Comparación del hash seguro de Bcrypt
        const valid = await bcrypt.compare(password_ingresada, results[0].contrasena);
        return res.json({ success: valid });
    } catch (err) {
        console.error("Error en verificar-password:", err);
        return res.status(500).json({ success: false, message: "Error en el servidor." });
    }
});

// EDITAR USUARIO
app.put('/editar-usuario/:id', async (req, res) => {
    const { nombre, apellido, usuario, telefono, correo, contrasena } = req.body;
    const id = req.params.id; 

    try {
        let sql;
        let params;

        // Si el usuario cambia la contraseña
        if (contrasena && contrasena.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            const passwordEncriptada = await bcrypt.hash(contrasena, salt);
            
            sql = `UPDATE usuario SET nombre=?, apellido=?, usuario=?, telefono=?, correo=?, contrasena=?, fecha_modificacion=NOW(), usuario_modifica=? WHERE documento=?`;
            params = [nombre, apellido, usuario, telefono, correo, passwordEncriptada, usuario, id];
        } else {
            // Si el usuario dejó vacíos los inputs de contraseña
            sql = `UPDATE usuario SET nombre=?, apellido=?, usuario=?, telefono=?, correo=?, fecha_modificacion=NOW(), usuario_modifica=? WHERE documento=?`;
            params = [nombre, apellido, usuario, telefono, correo, usuario, id];
        }

        const [result] = await db.promise().query(sql, params);
        
        if (result.affectedRows > 0) {
            return res.json({ success: true });
        } else {
            return res.status(404).json({ success: false, message: "No se encontró el registro para actualizar." });
        }
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        return res.status(500).json({ success: false, message: "Error en el servidor." });
    }
});

// GUARDAR FACTURA
app.post('/guardar-factura', (req, res) => {
    const { numero_mesa, fecha_factura, hora_factura, cantidad, total, metodo_pago,id_producto } = req.body;

    if (!numero_mesa || !fecha_factura || !hora_factura || !metodo_pago) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
    }

    const sql = `
        INSERT INTO factura (
            fecha_venta, hora_venta, cantidad_producto_venta, precio_unitario, forma_pago_venta, numero_mesa,
            id_compra, id_proveedor, id_producto
        )
        VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?)
    `;

    db.query(sql, [
        fecha_factura,       // formato 'YYYY-MM-DD'
        hora_factura,        // formato 'HH:MM:SS'
        cantidad || 1,
        total || 0,
        metodo_pago,
        numero_mesa,
        id_producto
    ], (err, result) => {
        if (err) {
            console.error("ERROR AL GUARDAR FACTURA:", err.message);
            return res.status(500).json({ success: false, message: "Error al guardar la factura" });
        }
        res.json({ success: true, id_factura: result.insertId });
    });
});

// Archivos estáticos
app.use(express.static(__dirname));

// SERVIDOR
const PORT = 3000;

//CONTROL MESAS

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
app.post("/actualizar_mesa", (req, res) => {

  const mesa = req.body.mesa;
  const estado = req.body.estado;
  const tiempo = req.body.tiempo;

  console.log("Mesa:", mesa, "Estado:", estado, "Tiempo:", tiempo);

  const sql = `
    UPDATE mesa
    SET estado_mesa = ?, tiempo_servicio = ?
    WHERE numero_mesa = ?
  `;

  db.query(sql, [estado, tiempo, mesa], (err, result) => {

    if (err) {
      console.log("Error:", err);
      res.send("error");
      return;
    }

    console.log("Filas afectadas:", result.affectedRows);
    res.send("ok");

  });

});
// BUSCAR CANCIÓN EN YOUTUBE
app.get('/search-song', async (req, res) => {
    const q = req.query.q;
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "Falta YOUTUBE_API_KEY en.env" });
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&key=${apiKey}&type=video&maxResults=1&videoEmbeddable=true`;

    try {
        const fetch = require('node-fetch');
        const response = await fetch(url);
        const data = await response.json();
        res.json({ videoId: data.items?.[0]?.id?.videoId || null });
    } catch (err) {
        console.error("Error YouTube API:", err);
        res.json({ videoId: null });
    }
});