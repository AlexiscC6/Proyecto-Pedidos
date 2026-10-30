const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('Frontend'));

const dbConfig = {
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'pedidos_db'
};

async function probarConexionDB() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Conexión exitosa a la BD!!');
        await connection.end();
    } catch (err) {
        console.error('No se pudo conectar a la BD!:', err.message);
    }
}

probarConexionDB();

// Obtener todos los productos del menú
app.get('/api/productos', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM productos');
        await connection.end();
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
});

// Agregar un nuevo producto (Admin)
app.post('/api/productos', async (req, res) => {
    let connection;
    try {
        const { nombre, descripcion, precio, categoria, imagen_url } = req.body;
        connection = await mysql.createConnection(dbConfig);
        
        await connection.execute(
            'INSERT INTO productos (nombre, descripcion, precio, categoria, imagen_url) VALUES (?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, categoria, imagen_url]
        );
        
        await connection.end();
        res.json({ success: true, message: '¡Producto agregado con éxito!' });
    } catch (err) {
        if (connection) await connection.end();
        console.error('Error al agregar producto:', err);
        res.status(500).json({ success: false, message: 'Error al guardar el producto.' });
    }
});

// Registrar pedido, usuario y detalles
app.post('/api/pedidos', async (req, res) => {
    let connection;
    try {
        let { nombre, fecha_nacimiento, telefono, direccion, metodo_pago, total, productos } = req.body;

        if (fecha_nacimiento && fecha_nacimiento.includes('/')) {
            const partes = fecha_nacimiento.split('/');
            if (partes.length === 3) {
                fecha_nacimiento = `${partes[2]}-${partes[1]}-${partes[0]}`;
            }
        }

        connection = await mysql.createConnection(dbConfig);

        const [usuarioExistente] = await connection.execute(
            'SELECT id FROM usuarios WHERE telefono = ?', 
            [telefono]
        );

        let usuarioId;
        if (usuarioExistente.length > 0) {
            usuarioId = usuarioExistente[0].id;
            await connection.execute(
                'UPDATE usuarios SET nombre = ?, fecha_nac = ?, direccion = ? WHERE id = ?',
                [nombre, fecha_nacimiento, direccion, usuarioId]
            );
        } else {
            const [resultadoUsuario] = await connection.execute(
                'INSERT INTO usuarios (nombre, fecha_nac, telefono, direccion) VALUES (?, ?, ?, ?)', 
                [nombre, fecha_nacimiento, telefono, direccion]
            );
            usuarioId = resultadoUsuario.insertId;
        }

        const [resultadoPedido] = await connection.execute(
            'INSERT INTO pedidos (usuario_id, total, metodo_pago, estado, fecha_registro) VALUES (?, ?, ?, "Recibido", NOW())', 
            [usuarioId, total, metodo_pago]
        );
        
        const pedidoId = resultadoPedido.insertId;

        if (productos && productos.length > 0) {
            for (const prod of productos) {
                await connection.execute(
                    'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                    [pedidoId, prod.id, prod.cantidad, prod.precio]
                );
            }
        }

        await connection.end();
        res.json({ success: true, message: '¡Pedido procesado con éxito!', pedidoId });

    } catch (err) {
        if (connection) await connection.end();
        console.error('Error detallado al procesar el pedido:', err);
        res.status(500).json({ success: false, message: 'Error al procesar el pedido en el servidor.' });
    }
});

// Ruta para EDITAR un platillo existente
app.put('/api/productos/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, categoria, imagen_url } = req.body;
        
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, imagen_url = ? WHERE id = ?',
            [nombre, descripcion, precio, categoria, imagen_url, id]
        );
        await connection.end();
        
        res.json({ success: true, message: 'Platillo actualizado exitosamente' });
    } catch (err) {
        if (connection) await connection.end();
        console.error('Error al actualizar platillo:', err);
        res.status(500).json({ success: false, error: 'Error al actualizar el producto' });
    }
});

// Ruta para ELIMINAR un platillo
app.delete('/api/productos/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        
        connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM productos WHERE id = ?', [id]);
        await connection.end();
        
        res.json({ success: true, message: 'Platillo eliminado exitosamente' });
    } catch (err) {
        if (connection) await connection.end();
        console.error('Error al eliminar platillo:', err);
        res.status(500).json({ success: false, error: 'Error al eliminar el producto' });
    }
});

// Obtener resumen de ventas por categoría (Admin)
app.get('/api/admin/resumen-ventas', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT 
                p.categoria, 
                SUM(dp.cantidad) AS total_vendidos, 
                SUM(dp.cantidad * dp.precio_unitario) AS total_recaudado
            FROM detalles_pedido dp
            JOIN productos p ON dp.producto_id = p.id
            GROUP BY p.categoria
        `);
        await connection.end();
        res.json(rows);
    } catch (err) {
        if (connection) await connection.end();
        console.error('Error al obtener resumen:', err);
        res.status(500).json({ error: 'Error al obtener el reporte de ventas' });
    }
});

// Obtener todos los pedidos para gestionar estados (Admin)
app.get('/api/admin/pedidos', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT p.id, u.nombre AS cliente, u.telefono, p.total, p.metodo_pago, p.estado, p.fecha_registro
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.fecha_registro DESC
        `);
        await connection.end();
        res.json(rows);
    } catch (err) {
        if (connection) await connection.end();
        console.error('Error al obtener pedidos admin:', err);
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
});

// Actualizar estado de pedido (Admin)
app.put('/api/admin/pedidos/:id/estado', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { estado } = req.body;
        connection = await mysql.createConnection(dbConfig);
        
        await connection.execute(
            'UPDATE pedidos SET estado = ? WHERE id = ?',
            [estado, id]
        );
        
        await connection.end();
        res.json({ success: true, message: 'Estado actualizado correctamente' });
    } catch (err) {
        if (connection) await connection.end();
        console.error('Error al actualizar estado:', err);
        res.status(500).json({ success: false, message: 'Error al actualizar el estado' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo exitosamente en http://localhost:${PORT}`);
});