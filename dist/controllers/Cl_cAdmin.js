import sPedido from "../services/Cl_sPedido.js";
import sProducto from "../services/Cl_sProducto.js";
import Cl_mPedido from "../models/Cl_mPedido.js";
export default class Cl_cAdmin {
    vista;
    pedidos = [];
    productos = [];
    filtros = { estado: "Todos", metodoPago: "Todos", fecha: "" };
    constructor(vista) {
        this.vista = vista;
        this.vista.onProcesarPedido((id) => this.procesarPedido(id));
        this.vista.onCancelarPedido((id) => this.cancelarPedido(id));
        this.vista.onFiltrarPedidos((filtros) => {
            this.filtros = { ...this.filtros, ...filtros };
            this.vista.mostrarPedidos(this.filtrarPedidos());
        });
        this.vista.onGuardarProducto(async (producto) => await this.guardarProducto(producto));
        this.vista.onEliminarProducto(async (id) => await this.eliminarProducto(id));
        this.cargarDatos();
        setInterval(() => this.cargarPedidos(), 5000);
    }
    porcentajeMasVendidos() {
        const counts = {};
        let totalItemsVendidos = 0;
        this.pedidos.forEach(p => {
            p.items.forEach(i => {
                counts[i.codigo] = (counts[i.codigo] || 0) + i.cantidad;
                totalItemsVendidos += i.cantidad;
            });
        });
        return this.productos.map(p => {
            const cantidadVendidoDelProducto = counts[p.codigo] || 0;
            const popularidad = totalItemsVendidos > 0
                ? ((cantidadVendidoDelProducto / totalItemsVendidos) * 100).toFixed(2)
                : "0.00";
            return { ...p, popularidad };
        });
    }
    async cargarDatos() {
        await Promise.all([this.cargarProductos(), this.cargarPedidos()]);
        this.vista.mostrarProductos(this.porcentajeMasVendidos());
    }
    async cargarProductos() {
        const res = await sProducto.obtenerTodos();
        if (res.ok) {
            this.productos = res.data;
            this.vista.mostrarProductos(this.porcentajeMasVendidos());
        }
    }
    async cargarPedidos() {
        const res = await sPedido.obtenerTodos();
        if (res.ok) {
            this.pedidos = res.data.map((p) => new Cl_mPedido({
                id: p.id,
                nomCliente: p.NomCliente,
                items: p.Items,
                metodoPago: p.MetodoPago,
                detallesPago: p.DetallesPago,
                fecha: p.Fecha,
                estado: p.estado
            }));
            this.vista.mostrarPedidos(this.filtrarPedidos());
        }
    }
    filtrarPedidos() {
        return this.pedidos.filter(p => {
            const estadoMatch = this.filtros.estado === "Todos" || p.estado === this.filtros.estado;
            const pagoMatch = this.filtros.metodoPago === "Todos" || p.metodoPago === this.filtros.metodoPago;
            let fechaMatch = true;
            if (this.filtros.fecha) {
                const fechaPedidoStr = String(p.fecha || '');
                const fechaPedido = fechaPedidoStr.split(' ')[0];
                fechaMatch = fechaPedido === this.filtros.fecha;
            }
            return estadoMatch && pagoMatch && fechaMatch;
        });
    }
    async procesarPedido(id) {
        const res = await sPedido.actualizarEstado(id, "Procesado");
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.ok ? "Pedido procesado" : res.mensaje);
        if (res.ok)
            await this.cargarPedidos();
    }
    async cancelarPedido(id) {
        const res = await sPedido.actualizarEstado(id, "Cancelado");
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.ok ? "Pedido cancelado" : res.mensaje);
        if (res.ok)
            await this.cargarPedidos();
    }
    async guardarProducto(producto) {
        let res;
        if (producto.id) {
            res = await sProducto.actualizar(producto.id, producto);
        }
        else {
            res = await sProducto.agregar(producto);
        }
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.mensaje);
        if (res.ok)
            await this.cargarProductos();
    }
    async eliminarProducto(id) {
        const res = await sProducto.eliminar(id);
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.mensaje);
        if (res.ok)
            await this.cargarProductos();
    }
}
//# sourceMappingURL=Cl_cAdmin.js.map