import sPedido from "../services/Cl_sPedido.js";
import sProducto from "../services/Cl_sProducto.js";
import Cl_mCarrito from "../models/Cl_mCarrito.js";
import Cl_sTasa from "../services/Cl_sTasa.js";
import Cl_mPedido from "../models/Cl_mPedido.js";
export default class Cl_cCliente {
    vista;
    productos = [];
    productosOriginales = [];
    carrito;
    textoBusqueda = "";
    categoriaSeleccionada = "Todas";
    tasa = 40.0;
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
        this.tasa = await Cl_sTasa.obtenerTasa();
        Cl_mPedido.tasaActual = this.tasa;
        this.vista.setTasa(this.tasa);
        const resultado = await sProducto.obtenerTodos();
        if (resultado.ok) {
            // Filtrar productos con cantidad_disponible > 0
            this.productosOriginales = resultado.data.filter(p => (p.cantidad_disponible !== undefined ? p.cantidad_disponible : 0) > 0);
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
        const cedula = this.vista.cedula;
        if (!cedula.trim()) {
            this.vista.mostrarAlerta("danger", "Ingrese su cédula");
            return;
        }
        // Validar unicidad de cédula (un número de cédula debe pertenecer al mismo nombre de cliente)
        const resPedidos = await sPedido.obtenerTodos();
        if (resPedidos.ok) {
            const yaExisteDiferente = resPedidos.data.some(p => {
                const ced = p.Cedula || p.cedula || "";
                const nom = p.NomCliente || p.nomCliente || "";
                return ced.trim().toLowerCase() === cedula.trim().toLowerCase() &&
                    nom.trim().toLowerCase() !== nomCliente.trim().toLowerCase();
            });
            if (yaExisteDiferente) {
                this.vista.mostrarAlerta("danger", "La cédula ya está registrada a nombre de otro cliente");
                return;
            }
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
        // Asegurar que la tasa de cambio esté actualizada al enviar el pedido
        this.tasa = await Cl_sTasa.obtenerTasa();
        Cl_mPedido.tasaActual = this.tasa;
        this.vista.setTasa(this.tasa);
        const esBolivares = metodoPago === "Efectivo Bs." || metodoPago === "Pago Móvil" || metodoPago === "Efectivo BS" || metodoPago === "Efectivo Bs";
        let itemsParaEnvio = this.carrito.getItemsParaEnvio();
        const totalUSD = parseFloat(this.carrito.calcularTotal().toFixed(2));
        const totalBs = parseFloat(this.carrito.calcularTotalEnBs(this.tasa).toFixed(2));
        if (esBolivares) {
            itemsParaEnvio = itemsParaEnvio.map((item) => ({
                ...item,
                precio: parseFloat((item.precio * this.tasa).toFixed(2))
            }));
        }
        const pedido = {
            NomCliente: nomCliente,
            Cedula: cedula,
            Items: itemsParaEnvio,
            Total: totalUSD,
            TotalBs: totalBs,
            MetodoPago: metodoPago,
            DetallesPago: detallesPago,
            Fecha: `${fecha} ${hora}`,
            estado: "Pendiente"
        };
        const resultado = await sPedido.agregar(pedido);
        this.vista.mostrarAlerta(resultado.ok ? "success" : "danger", resultado.mensaje);
        if (resultado.ok) {
            // Descontar inventario
            const resProd = await sProducto.obtenerTodos();
            if (resProd.ok) {
                const todosProductos = resProd.data;
                const itemsVendidos = this.carrito.getItems();
                for (const item of itemsVendidos) {
                    const prodDb = todosProductos.find(p => p.codigo === item.codigo);
                    if (prodDb && prodDb.id) {
                        const stockActual = prodDb.cantidad_disponible !== undefined ? prodDb.cantidad_disponible : 0;
                        const nuevoStock = Math.max(0, stockActual - item.cantidad);
                        await sProducto.actualizar(prodDb.id, {
                            ...prodDb,
                            cantidad_disponible: nuevoStock
                        });
                    }
                }
            }
            this.carrito.vaciar();
            this.vista.limpiar();
            this.actualizarVistaCarrito();
            await this.cargarProductos();
        }
    }
}
//# sourceMappingURL=Cl_cCliente.js.map