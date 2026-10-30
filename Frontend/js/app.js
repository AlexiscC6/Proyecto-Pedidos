// ruta del servidor
const API_URL = 'http://localhost:3000/api/productos';
let carrito = [], listaProductosGlobal = [];

// ejecuta esto al cargar la pagina
document.addEventListener('DOMContentLoaded', () => {
    obtenerProductos();
    cargarCarritoLocalStorage();
});

// trae los datos de la base de datos
async function obtenerProductos() {
    try {
        const res = await fetch(API_URL);
        listaProductosGlobal = await res.json();
        renderizarProductos(listaProductosGlobal);
    } catch (err) { console.error('Error al conectar con el backend:', err); }
}

// crea las tarjetas y las mete segun la categoria
function renderizarProductos(productos) {
    const contDesayunos = document.getElementById('contenedor-desayunos');
    const contAlmuerzos = document.getElementById('contenedor-almuerzos');
    const contCenas = document.getElementById('contenedor-cenas');

    if (contDesayunos) contDesayunos.innerHTML = ''; 
    if (contAlmuerzos) contAlmuerzos.innerHTML = ''; 
    if (contCenas) contCenas.innerHTML = ''; 

    productos.forEach(prod => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('card'); 
        const cat = prod.categoria.toLowerCase();
        const img = `../Img/${prod.imagen_url.split('/').pop()}`;

        tarjeta.innerHTML = `
            <img src="${img}" alt="${prod.nombre}">
            <h3>${prod.nombre}</h3>
            <p>${prod.descripcion}</p>
            <div class="precio">Q ${parseFloat(prod.precio).toFixed(2)}</div>
            <button class="btn" onclick="agregarAlCarrito(${prod.id})">Agregar al Carrito</button>
        `;
        
        if (cat.includes('desayun') && contDesayunos) contDesayunos.appendChild(tarjeta);
        else if (cat.includes('almuerzo') && contAlmuerzos) contAlmuerzos.appendChild(tarjeta);
        else if (cat.includes('cena') && contCenas) contCenas.appendChild(tarjeta);
    });
}

// mete cosas al carrito
function agregarAlCarrito(id) {
    const prod = listaProductosGlobal.find(p => p.id === id);
    if (!prod) return;
    const item = carrito.find(i => i.id === id);
    
    if (item) item.cantidad++;
    else carrito.push({ id: prod.id, nombre: prod.nombre, precio: parseFloat(prod.precio), cantidad: 1 });
    sincronizarCarrito();
}

// suma o resta productos del carrito
function cambiarCantidad(id, cambio) {
    const item = carrito.find(i => i.id === id);
    if (!item) return;
    item.cantidad += cambio;
    if (item.cantidad <= 0) carrito = carrito.filter(i => i.id !== id);
    sincronizarCarrito();
}

// guarda el carrito para que no se borre al recargar
function sincronizarCarrito() {
    localStorage.setItem('carrito_antojo_express', JSON.stringify(carrito));
    actualizarInterfazCarrito();
}

// recupera los datos guardados
function cargarCarritoLocalStorage() {
    const guardado = localStorage.getItem('carrito_antojo_express');
    if (guardado) { carrito = JSON.parse(guardado); actualizarInterfazCarrito(); }
}

// dibuja el carrito en la pantalla
function actualizarInterfazCarrito() {
    const contItems = document.getElementById('carrito-items');
    const textoTotal = document.getElementById('carrito-total');
    const contHeader = document.getElementById('contador-carrito');
    if (!contItems) return;

    contItems.innerHTML = '';
    let total = 0, cantTotal = 0;

    if (carrito.length === 0) {
        contItems.innerHTML = `<p style="color:#666;font-size:0.95rem;margin-bottom:1rem;">No hay productos seleccionados.</p>`;
        if (contHeader) contHeader.textContent = '🛒 Carrito (0)';
        if (textoTotal) textoTotal.textContent = 'Q 0.00';
        return;
    }

    carrito.forEach(item => {
        total += item.precio * item.cantidad;
        cantTotal += item.cantidad;
        const div = document.createElement('div');
        div.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:0.9rem;border-bottom:1px solid #eee;padding-bottom:8px;";
        div.innerHTML = `
            <div style="flex:2;"><strong>${item.nombre}</strong><br><span style="color:#666;">Q ${item.precio.toFixed(2)} x ${item.cantidad}</span></div>
            <div style="display:flex;gap:5px;align-items:center;">
                <button onclick="cambiarCantidad(${item.id}, -1)" style="padding:2px 8px;cursor:pointer;background:#ddd;border:none;border-radius:4px;">-</button>
                <span>${item.cantidad}</span>
                <button onclick="cambiarCantidad(${item.id}, 1)" style="padding:2px 8px;cursor:pointer;background:#ddd;border:none;border-radius:4px;">+</button>
            </div>
        `;
        contItems.appendChild(div);
    });

    if (contHeader) contHeader.textContent = `🛒 Carrito (${cantTotal})`;
    if (textoTotal) textoTotal.textContent = `Q ${total.toFixed(2)}`;
}

// para mostrar u ocultar las secciones mediante los acordeones
function toggleSeccion(idContenedor, btn) {
    document.getElementById(idContenedor).classList.toggle('oculto');
    btn.classList.toggle('activo');
}

// abre la ventana de cobro
function abrirModalCheckout() {
    if (carrito.length === 0) {
        alert('El carrito está vacío. Agrega al menos un producto.');
        return;
    }
    document.getElementById('modal-checkout').classList.remove('oculto');
}

// cierra la ventana emergente
function cerrarModal() {
    document.getElementById('modal-checkout').classList.add('oculto');
}

// envia la informacion del formulario a la base de datos
async function enviarPedido(e) {
    e.preventDefault();
    const datosPedido = {
        nombre: document.getElementById('nombre-cliente').value,
        fecha_nacimiento: document.getElementById('fecha-nacimiento-cliente').value,
        telefono: document.getElementById('telefono-cliente').value,
        direccion: document.getElementById('direccion-cliente').value,
        metodo_pago: document.getElementById('metodo-pago-cliente').value,
        total: carrito.reduce((acc, i) => acc + (i.precio * i.cantidad), 0),
        productos: carrito
    };

    try {
        const res = await fetch('http://localhost:3000/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPedido)
        });
        const data = await res.json();
        
        if (data.success) {
            alert('¡Pedido realizado con éxito!');
            carrito = [];
            sincronizarCarrito();
            cerrarModal();
            document.getElementById('form-checkout').reset();
        } else { alert('Error al procesar el pedido.'); }
    } catch (err) { console.error(err); alert('Error de conexión con el servidor.'); }
}

// FUNCIÓN: Muestra el menú debajo de las tarjetas y activa el botón flotante fijo
function seleccionarCategoriaPorTarjeta(categoriaSeleccionada) {
    const contenedorDinamico = document.getElementById('contenedor-tarjetas-dinamico');
    const contenedorBtnFlotante = document.getElementById('contenedor-btn-flotante');
    
    // Si el contenedor ya está abierto con esta misma categoría, lo cerramos
    if (!contenedorDinamico.classList.contains('oculto') && contenedorDinamico.dataset.categoriaActual === categoriaSeleccionada) {
        cerrarMenuDinamico();
        return;
    }

    // Filtramos los productos según la categoría seleccionada
    const productosFiltrados = listaProductosGlobal.filter(prod => 
        prod.categoria.toLowerCase().includes(categoriaSeleccionada.toLowerCase().slice(0, -1))
    );

    // Dibujamos las tarjetas de platillos en el contenedor dinámico inferior
    contenedorDinamico.innerHTML = '';
    
    if (productosFiltrados.length === 0) {
        contenedorDinamico.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 20px;">No hay platillos disponibles en esta categoría.</p>`;
    } else {
        productosFiltrados.forEach(prod => {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('card'); 
            const img = `../Img/${prod.imagen_url.split('/').pop()}`;

            tarjeta.innerHTML = `
                <img src="${img}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <p>${prod.descripcion}</p>
                <div class="precio">Q ${parseFloat(prod.precio).toFixed(2)}</div>
                <button class="btn" onclick="agregarAlCarrito(${prod.id})">Agregar al Carrito</button>
            `;
            contenedorDinamico.appendChild(tarjeta);
        });
    }

    // Mostramos el contenedor inferior, guardamos el estado y activamos el botón flotante fijo
    contenedorDinamico.classList.remove('oculto');
    contenedorDinamico.dataset.categoriaActual = categoriaSeleccionada;
    if (contenedorBtnFlotante) contenedorBtnFlotante.classList.remove('oculto');

    // Desplazamiento suave hacia el menú recién abierto debajo de las tarjetas
    contenedorDinamico.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Función para cerrar y limpiar el menú dinámico inferior y ocultar el botón flotante
function cerrarMenuDinamico() {
    const contenedorDinamico = document.getElementById('contenedor-tarjetas-dinamico');
    const contenedorBtnFlotante = document.getElementById('contenedor-btn-flotante');

    contenedorDinamico.classList.add('oculto');
    contenedorDinamico.dataset.categoriaActual = '';
    contenedorDinamico.innerHTML = '';
    
    if (contenedorBtnFlotante) contenedorBtnFlotante.classList.add('oculto');
}