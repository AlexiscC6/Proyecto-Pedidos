const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a tu base de datos en HeidiSQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',         // Cambia esto si configuraste un usuario específico en MySQL
    password: '',     // Pon tu contraseña de MySQL si tienes una asignada
    database: 'pedidos_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('¡Conectado exitosamente a la base de datos de HeidiSQL!');
});

// RUTA GET: Para consultar todos los productos desde la base de datos
app.get('/api/productos', (req, res) => {
    const query = 'SELECT * FROM productos';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener los productos' });
            return;
        }
        res.json(results);
    });
});

// Iniciar el servidor local en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});