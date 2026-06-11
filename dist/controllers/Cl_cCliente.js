import sPedido from "../services/Cl_sPedido.js";
import sProducto from "../services/Cl_sProducto.js";
import Cl_mCarrito from "../models/Cl_mCarrito.js";
export default class Cl_cCliente {
    vista;
    productos = [];
    productosOriginales = [];
    carrito;
    textoBusqueda = "";
    categoriaSeleccionada = "Todas";
    constructor(vista) {
        this.vista = vista;
        this.carrito = new Cl_mCarrito();
        this.vista.onAgregarProducto((codigo, cantidad) => this.agregarAlCarrito(codigo, cantidad));
        this.vista.onEliminarProducto((codigo) => this.eliminarDelCarrito(codigo));
        this.vista.onEnviar(() => this.enviarPedido());
        this.vista.onBuscar((texto) => {
            this.textoBusqueda = texto;
            this.aplicarFiltros();
        });
        this.vista.onCambiarCategoria((categoria) => {
            this.categoriaSeleccionada = categoria;
            this.aplicarFiltros();
        });
        this.cargarProductos();
    }
    async cargarProductos() {
        const resultado = await sProducto.obtenerTodos();
        if (resultado.ok) {
            this.productosOriginales = resultado.data;
            this.productos = [...this.productosOriginales];
            // Obtener categorías únicas
            const categoriasUnicas = Array.from(new Set(this.productosOriginales.map(p => p.categoria)))
                .filter(c => c && c.trim() !== "");
            this.vista.llenarCategorias(categoriasUnicas);
            this.vista.mostrarProductos(this.productosOriginales);
        }
        else {
            this.vista.mostrarAlerta("danger", "Error al cargar productos");
        }
    }
    aplicarFiltros() {
        let filtrados = this.productosOriginales;
        // Búsqueda por texto (case-insensitive)
        if (this.textoBusqueda.trim() !== "") {
            const busqueda = this.textoBusqueda.toLowerCase();
            filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(busqueda));
        }
        // Filtro por categoría
        if (this.categoriaSeleccionada !== "Todas") {
            filtrados = filtrados.filter(p => p.categoria === this.categoriaSeleccionada);
        }
        this.vista.mostrarProductos(filtrados);
    }
    agregarAlCarrito(codigo, cantidad) {
        const producto = this.productosOriginales.find(p => p.codigo === codigo);
        if (!producto)
            return;
        this.carrito.agregar(producto, cantidad);
        // Actualizar vista del carrito y total inmediatamente
        this.vista.mostrarCarrito(this.carrito.getItems());
        this.vista.mostrarTotal(this.carrito.calcularTotal());
    }
    // En tu método eliminarDelCarrito en Cl_cCliente.ts
    eliminarDelCarrito(codigo) {
        // 1. Eliminamos del modelo Carrito
        this.carrito.eliminar(codigo);
        // 2. Actualizamos las tablas y el total
        this.vista.mostrarCarrito(this.carrito.getItems());
        this.vista.mostrarTotal(this.carrito.calcularTotal());
        // 3. ¡AQUÍ ESTÁ LA SOLUCIÓN! 
        // Reseteamos el contador visual en la tarjeta del producto
        this.vista.resetContador(codigo);
    }
    actualizarVistaCarrito() {
        this.vista.mostrarCarrito(this.carrito.getItems());
        this.vista.mostrarTotal(this.carrito.calcularTotal());
    }
    async enviarPedido() {
        const nomCliente = this.vista.nomCliente;
        if (!nomCliente.trim()) {
            this.vista.mostrarAlerta("danger", "Ingrese su nombre");
            return;
        }
        if (this.carrito.estaVacio()) {
            this.vista.mostrarAlerta("warning", "Agregue al menos un producto");
            return;
        }
        const metodoPago = this.vista.metodoPago;
        if (!metodoPago) {
            this.vista.mostrarAlerta("danger", "Seleccione un método de pago");
            return;
        }
        let detallesPago = "";
        if (metodoPago === "Pago Móvil") {
            const ref = this.vista.referenciaPago;
            if (!ref.trim()) {
                this.vista.mostrarAlerta("danger", "Ingrese referencia/número de teléfono para Pago Móvil");
                return;
            }
            detallesPago = ref;
        }
        else if (metodoPago === "Otro") {
            const desc = this.vista.descripcionOtro;
            if (!desc.trim()) {
                this.vista.mostrarAlerta("danger", "Ingrese una descripción para 'Otro'");
                return;
            }
            detallesPago = desc;
        }
        const ahora = new Date();
        const fecha = ahora.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const hora = ahora.toTimeString().split(' ')[0]; // Formato HH:MM:SS
        const pedido = {
            NomCliente: nomCliente,
            Items: this.carrito.getItemsParaEnvio(),
            Total: this.carrito.calcularTotal(),
            MetodoPago: metodoPago,
            DetallesPago: detallesPago,
            Fecha: `${fecha} ${hora}`,
            estado: "Pendiente"
        };
        const resultado = await sPedido.agregar(pedido);
        this.vista.mostrarAlerta(resultado.ok ? "success" : "danger", resultado.mensaje);
        if (resultado.ok) {
            this.carrito.vaciar();
            this.vista.limpiar();
            this.actualizarVistaCarrito();
        }
    }
}
//# sourceMappingURL=Cl_cCliente.js.map