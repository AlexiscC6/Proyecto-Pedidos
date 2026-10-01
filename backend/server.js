const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Conexión a la Base de Datos MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Cambia tu contraseña si tienes una configurada
    database: 'pedidos_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('¡Conexión exitosa a la BD!');
});

// GET: Obtener todos los productos del menú
app.get('/api/productos', (req, res) => {
    const query = 'SELECT * FROM productos';
    db.query(query, (err, resultados) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).json({ error: 'Error al obtener los productos' });
        }
        res.json(resultados);
    });
});

// POST: Registrar el pedido, usuario y detalles en MySQL
app.post('/api/pedidos', (req, res) => {
    const { nombre, correo, telefono, direccion, total, productos } = req.body;

    // 1. Guardar cliente en la tabla 'usuarios'
    const queryUsuario = 'INSERT INTO usuarios (nombre, correo, telefono, direccion) VALUES (?, ?, ?, ?)';

    db.query(queryUsuario, [nombre, correo, telefono, direccion], (err, resultadoUsuario) => {
        if (err) {
            console.error('Error al registrar usuario:', err);
            return res.status(500).json({ error: 'Error al registrar el usuario' });
        }

        const usuarioId = resultadoUsuario.insertId;

        // 2. Guardar la cabecera en la tabla 'pedidos'
        const queryPedido = 'INSERT INTO pedidos (usuario_id, total, fecha) VALUES (?, ?, NOW())';

        db.query(queryPedido, [usuarioId, total], (err, resultadoPedido) => {
            if (err) {
                console.error('Error al registrar pedido:', err);
                return res.status(500).json({ error: 'Error al registrar el pedido' });
            }

            const pedidoId = resultadoPedido.insertId;

            // 3. Guardar cada platillo del carrito en la tabla 'detalles_pedido'
            const queryDetalle = 'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES ?';

            const detallesValues = productos.map(item => [
                pedidoId,
                item.id,
                item.cantidad,
                item.precio
            ]);

            db.query(queryDetalle, [detallesValues], (err, resultadoDetalles) => {
                if (err) {
                    console.error('Error al registrar los detalles del pedido:', err);
                    return res.status(500).json({ error: 'Error al registrar los detalles del pedido' });
                }

                res.json({
                    success: true,
                    mensaje: '¡Pedido y detalles registrados con éxito!',
                    pedidoId: pedidoId
                });
            });
        });
    });
});

// Iniciar servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});