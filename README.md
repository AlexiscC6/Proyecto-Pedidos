Antojo Express - Sistema de Pedidos en Tiempo Real

Plataforma transaccional web diseñada para gestionar el ciclo de vida completo de pedidos de comida, desarrollada como proyecto académico para el curso de Programación II. El sistema permite realizar pedidos en línea por parte de los clientes y gestionarlos a través de un panel de administración conectado a una base de datos relacional.

Stack Tecnológico

El proyecto está construido bajo una arquitectura monolítica modular:

Frontend: HTML5, CSS3 y JavaScript Vanilla (sin frameworks), con renderizado dinámico del DOM.

Backend Runtime: Node.js.

Framework Web: Express.js (para la creación de las rutas REST API y manejo de archivos estáticos).

Base de Datos: MySQL (con soporte para transacciones ACID y manejo de relaciones).

Controladores y Drivers: mysql2 (promesas y prepared statements).

Utilidades: cors para configuración de peticiones.

Estructura del Proyecto

SistemaPedidos/
│
├── backend/
│   └── schema.sql        # Estructura y script de la base de datos
│
├── Frontend/
│   ├── css/
│   │   └── style.css     # Estilos generales del sistema
│   ├── Img/              # Recursos visuales (platillos y logos)
│   ├── js/
│   │   ├── admin.html    # Panel de administración y gestión de ventas
│   │   ├── app.js        # Lógica del cliente y carrito de compras
│   │   └── index.html    # Página principal de la tienda / menú
│
├── server.js             # Servidor principal de Node.js y Express
├── package.json          # Dependencias y scripts del proyecto
└── README.md             # Documentación del sistema

Requisitos Previos

Antes de ejecutar el proyecto en tu computadora, asegúrate de tener instalado:

Node.js (versión 18.x o superior recomendada).

Un servidor de base de datos MySQL o MariaDB (puedes usar XAMPP o HeidiSQL).

Instalación y Configuración Paso a Paso

Clonar o descargar el repositorio en tu computadora.

Configurar la Base de Datos:

Abre tu administrador de MySQL (HeidiSQL, phpMyAdmin, etc.).

Crea una base de datos con el nombre: pedidos_db.

Ejecuta el script SQL (schema.sql) para crear las tablas necesarias (usuarios, productos, pedidos, detalles_pedido).

Nota: la tablas se han exportado con estructura limpia y vacía intencionalmente para que quien tenga el programa empieze a llenar desde cero.

Instalar las librerías y dependencias necesarias:
Abre tu terminal en la carpeta raíz del proyecto (SistemaPedidos) y ejecuta el siguiente comando para instalar automáticamente todas las librerías requeridas (Express, MySQL2 y CORS) basándose en el archivo package.json:

npm install


Verificar la conexión:
Abre el archivo server.js y asegúrate de que los parámetros de conexión coincidan con los de tu entorno local:

const dbConfig = {
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'pedidos_db'
};


Ejecución del Sistema

Encender el Servidor:
En la terminal, dentro de la carpeta raíz, ejecuta:

npm start


(Deberás ver en consola: Servidor corriendo exitosamente en http://localhost:3000 y el mensaje de conexión exitosa a la base de datos).

Acceder a las Interfaces:

Sitio Web del Cliente (Menú y Pedidos): Abre tu navegador e ingresa a: http://localhost:3000/index.html

Panel de Administración (Control de Estados y Ventas): Ingresa a: http://localhost:3000/js/admin.html

Funcionalidades Principales

Catálogo Dinámico: Carga de productos divididos por categorías (Desayunos, Almuerzos, Cenas) directamente desde la base de datos MySQL.

Gestión de Carrito: Cálculo automático de totales y selección de métodos de pago (Efectivo / Tarjeta POS).

Control de Clientes y Pedidos: Registro inteligente de usuarios mediante su número de teléfono y almacenamiento relacional de los detalles de cada compra.

Panel de Administración (Admin):

Reporte y resumen de ventas acumuladas por categoría.

Monitoreo y actualización interactiva de estados de pedidos (Recibido, En camino, Entregado).

Formulario de inserción de nuevos platillos al menú con asignación de imágenes locales.