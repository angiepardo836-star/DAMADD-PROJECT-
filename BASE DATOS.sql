            
# Crear base de datos
create database damadd; 
use damadd; 

# Tabla de Producto
create table producto(
id int primary key not null auto_increment,
tipo_producto ENUM("Producto","Material") not null,
nombre varchar(50) not null,
marca varchar(50) not null,
categoria varchar(50) not null,
presentacion varchar(50),
cantidad int not null,
fecha_vencimiento date,
precio_unitario decimal(10,6) not null,
estado ENUM("Bueno","Malo") not null,
descripcion varchar(255) not null
);
ALTER TABLE producto ADD CONSTRAINT producto_unico UNIQUE ( nombre, marca, presentacion);

# Tabla de Mesa
create table mesa(
id int primary key not null auto_increment,
estado ENUM("Libre","Ocupada","Inactiva") not null,
capacidad int not null,
mantenimiento varchar(255)
);

        # Tabla Bolirana data
create table bolirana(
id int primary key not null auto_increment,
estado ENUM("Libre","Ocupada","Inactiva") not null,
precio_hora decimal(10,6) not null,
tiempo_servicio int,
mantenimiento varchar(255)
);

# Tabla de Billar
create table billar(
id int primary key not null auto_increment,
estado ENUM("Libre","Ocupada","Inactiva") not null,
precio_hora decimal(10,2) not null,
tiempo_servicio int,
mantenimiento varchar(255)
);

# Tabla de Reserva 
create table reserva(
id int primary key not null auto_increment,
nombre varchar(50) not null,
apellido varchar(50) not null,
telefono varchar(15) not null unique,
fecha date not null,
hora_inicio time not null,
hora_fin time not null,
estado ENUM("Pendiente", "Cancelada", "Completada") not null,
juego varchar(50) not null,
cantidad_bolirana int,
cantidad_billar int,
cantidad_mesa int,
foreign key (id) references bolirana(id),
foreign key (id) references billar(id),
foreign key (id) references mesa(id));

# Tabla de Proveedor
create table proveedor(
id int primary key not null,
tipo_documento ENUM("CC", "CE", "NIT", "PA", "PPT") not null,
documento varchar(15) not null,
nombre varchar(50) not null,
apellido varchar(50),
telefono varchar(15) not null unique,
ciudad varchar(50) not null,
direccion varchar(50) not null,
correo varchar(150) not null unique,
estado ENUM("Activo", "Inactivo") not null
);

# Tabla de Usuario
create table usuario(
id int primary key not null auto_increment,
tipo_documento enum("CC","CE","PA","PPT") not null,
documento varchar(15) not null,
nombre varchar(50) not null,
apellido varchar(50) not null,
usuario varchar(50) not null unique,
telefono varchar(15) not null unique,
correo varchar(150) not null unique,
contrasena varchar(255) not null,
rol ENUM("Gerente","Empleado","Administrador") not null,
estado enum("Activo","Inactivo") default "Activo" not null,
fecha_creacion timestamp not null,
fecha_modificacion timestamp,
usuario_modifica varchar(100),
usuario_crea varchar(100) not null,
codigo_recuperacion varchar(10),
expiracion_codigo datetime);

#venta 
create table venta(
id int key not null auto_increment,
fecha date not null, 
hora time not null, 
total decimal(10,6) not null, 
estado ENUM("Pendiente", "Completada", "Cancelada") not null,
forma_pago ENUM("Efectivo", "Transferencia", "Tarjeta Débito", "Tarjeta Crédito") not null, 
metodo_pago ENUM("Cuotas", "Contado", "Crédito") not null, 
foreign key (id) references usuario(id), 
foreign key (id) references usuario(id)
);

# tabla de compra 
create table compra(
id int primary key not null auto_increment, 
fecha date not null, 
hora time not null, 
total decimal(10,6) not null, 
estado ENUM("Pendiente", "Completada", "Cancelada") not null, 
metodo_pago ENUM("Cuotas", "Contado", "Crédito") not null,
forma_pago ENUM("Efectivo", "Transferencia", "Tarjeta Débito", "Tarjeta Crédito") not null, 
foreign key (id) references usuario(id)); 

# Tabla de Detalle Venta
create table detalle_venta(
id int primary key not null auto_increment,
cantidad int not null,
precio_unitario decimal(10,6),
total decimal(10,6) not null,
foreign key (id) references venta(id),
foreign key (id) references producto(id),
foreign key (id) references mesa(id),
foreign key (id) references billar(id),
foreign key (id) references bolirana(id)
);

# Tabla de Detalle Compra
create table detalle_compra(
id int primary key not null auto_increment,
cantidad int not null,
precio_unitario decimal(10,6) not null,
total decimal(10,6) not null,
iva decimal(10,6) not null, 
foreign key (id) references proveedor(id),
foreign key (id) references producto(id),
foreign key (id) references compra (id)
);