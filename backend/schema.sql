-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS pedidos_db;
USE pedidos_db;

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion TEXT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Productos (Catálogo de platillos)
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    imagen_url VARCHAR(255)
);

-- 3. Tabla de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    estado ENUM('pendiente', 'en_preparación', 'entregado') DEFAULT 'pendiente',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 4. Tabla de Detalles del Pedido (Productos dentro de cada pedido)
CREATE TABLE IF NOT EXISTS detalles_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);usuariosusuariosusuarios

-- Insertar Productos 
USE pedidos_db;

-- Limpiar productos anteriores por si ya tenías datos de prueba
DELETE FROM productos;

-- Insertar platillos clasificados por categoría (Desayuno, Almuerzo, Cena)
INSERT INTO productos (nombre, descripcion, precio, categoria, imagen_url) VALUES 
-- Desayunos
('Desayuno Chapín', 'Huevos al gusto, frijolitos volteados, plátanos maduros y queso fresco.', 35.00, 'Desayuno', 'img/desayuno.jpg'),
('Pancakes con Miel', 'Torre de 3 esponjosos pancakes acompañados de miel de maple y mantequilla.', 30.00, 'Desayuno', 'img/pancakes.jpg'),

-- Almuerzos
('Pechuga a la Plancha', 'Jugosa pechuga acompañada de puré de papas y vegetales al vapor.', 55.00, 'Almuerzo', 'img/pollo_plancha.jpg'),
('Cordero Asado', 'Jugosa carne de cordero acompañada de frijolo papas y ensalada.', 65.00, 'Almuerzo', 'img/pasta.jpg'),
('Caldo de Res Tradicional', 'Tradicional sopa de res con verduras frescas de la temporada y arroz.', 50.00, 'Almuerzo', 'img/caldo_res.jpg'),

-- Cenas
('Hamburguesa Clásica', 'Jugosa carne a la parrilla con queso cheddar, lechuga y tomate.', 45.00, 'Cena', 'img/hamburguesa.jpg'),
('Tacos de Carnitas (3 pzas)', 'Tortillas de maíz con carnitas doraditas, cebolla, cilantro y salsa de la casa.', 40.00, 'Cena', 'img/tacos.jpg'),
('Pizza Pepperoni Personal', 'Masa crujiente, salsa de tomate artesanal, doble mozzarella y pepperoni.', 60.00, 'Cena', 'img/pizza.jpg');