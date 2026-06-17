import I_vAdmin from "../interfaces/I_vAdmin.js";
import sPedido from "../services/Cl_sPedido.js";
import sProducto from "../services/Cl_sProducto.js";
import Cl_mPedido from "../models/Cl_mPedido.js";
import Cl_sDolar from "../services/Cl_sDolar.js";

export default class Cl_cAdmin {
    private vista: I_vAdmin;
    private pedidos: Cl_mPedido[] = [];
    private productos: any[] = [];
    private filtros = { estado: "Todos", metodoPago: "Todos", fecha: "", cedula: "" };
    private tasa: number = 40.0;

    constructor(vista: I_vAdmin) {
        this.vista = vista;
        this.vista.onProcesarPedido((id) => this.procesarPedido(id));
        this.vista.onCancelarPedido((id) => this.cancelarPedido(id));
        this.vista.onFiltrarPedidos((filtros) => {
            this.filtros = { ...this.filtros, ...filtros };
            this.vista.mostrarPedidos(this.filtrarPedidos());
        });
        this.vista.onGuardarProducto(async (producto) => await this.guardarProducto(producto));
        this.vista.onEliminarProducto(async (id) => await this.eliminarProducto(id));
        this.vista.onAnalizarProducto((codigo) => {
            const res = this.analizarProducto(codigo);
            this.vista.mostrarAnalisisProducto(res.unidades, res.ingresoUSD, res.ingresoBS);
        });
        this.cargarDatos();
        setInterval(() => this.cargarPedidos(), 5000);
    }

    private analizarProducto(codigo: string): { unidades: number; ingresoUSD: number; ingresoBS: number } {
        let unidades = 0;
        let ingresoUSD = 0;
        let ingresoBS = 0;
        this.pedidos.forEach(p => {
            if (p.estado !== "Cancelado") {
                const esBs = p.metodoPago === "Efectivo Bs." || p.metodoPago === "Pago Móvil" || p.metodoPago === "Efectivo BS";
                p.items.forEach(i => {
                    if (i.codigo === codigo) {
                        unidades += i.cantidad;
                        if (esBs) {
                            ingresoBS += i.precio * i.cantidad;
                        } else {
                            ingresoUSD += i.precio * i.cantidad;
                        }
                    }
                });
            }
        });
        return { unidades, ingresoUSD, ingresoBS };
    }

    private calcularReportes() {
        const hoyStr = new Date().toISOString().split('T')[0];
        let recaudacionUSD = 0;
        let recaudacionBS = 0;
        const unidadesPorProducto: Record<string, { nombre: string; cantidad: number }> = {};
        const ingresosPorProducto: Record<string, { nombre: string; totalUSD: number; totalBS: number }> = {};

        this.pedidos.forEach(p => {
            if (p.estado !== "Cancelado") {
                const esBs = p.metodoPago === "Efectivo Bs." || p.metodoPago === "Pago Móvil" || p.metodoPago === "Efectivo BS";
                const fechaPedidoStr = String(p.fecha || '');
                const fechaPedido = fechaPedidoStr.split(' ')[0];
                if (fechaPedido === hoyStr) {
                    if (esBs) {
                        recaudacionBS += p.total();
                    } else {
                        recaudacionUSD += p.total();
                    }
                }

                p.items.forEach(i => {
                    if (!unidadesPorProducto[i.codigo]) {
                        unidadesPorProducto[i.codigo] = { nombre: i.nombre, cantidad: 0 };
                    }
                    unidadesPorProducto[i.codigo].cantidad += i.cantidad;

                    if (!ingresosPorProducto[i.codigo]) {
                        ingresosPorProducto[i.codigo] = { nombre: i.nombre, totalUSD: 0, totalBS: 0 };
                    }
                    if (esBs) {
                        ingresosPorProducto[i.codigo].totalBS += i.precio * i.cantidad;
                    } else {
                        ingresosPorProducto[i.codigo].totalUSD += i.precio * i.cantidad;
                    }
                });
            }
        });

        let masVendido: { nombre: string; cantidad: number } | null = null;
        for (const codigo in unidadesPorProducto) {
            const data = unidadesPorProducto[codigo];
            if (!masVendido || data.cantidad > masVendido.cantidad) {
                masVendido = { nombre: data.nombre, cantidad: data.cantidad };
            }
        }

        let mayorIngreso: { nombre: string; totalUSD: number; totalBS: number } | null = null;
        for (const codigo in ingresosPorProducto) {
            const data = ingresosPorProducto[codigo];
            if (!mayorIngreso) {
                mayorIngreso = data;
            } else {
                const currentScore = data.totalUSD + (data.totalBS / this.tasa);
                const maxScore = mayorIngreso.totalUSD + (mayorIngreso.totalBS / this.tasa);
                if (currentScore > maxScore) {
                    mayorIngreso = data;
                }
            }
        }

        this.vista.mostrarReportes({ 
            recaudacionDiariaUSD: recaudacionUSD, 
            recaudacionDiariaBS: recaudacionBS, 
            masVendido, 
            mayorIngreso 
        });
    }

    private porcentajeMasVendidos() {
        const counts: Record<string, number> = {};
        let totalItemsVendidos = 0;

        this.pedidos.forEach(p => {
            p.items.forEach(i => {
                counts[i.codigo] = (counts[i.codigo] || 0) + i.cantidad;
                totalItemsVendidos += i.cantidad;
            });
        });

        return this.productos.map(p => {
            const cantidadVendidoDelProducto = counts[p.codigo] || 0;
            const popularidad: string = totalItemsVendidos > 0 
                ? ((cantidadVendidoDelProducto / totalItemsVendidos) * 100).toFixed(2) 
                : "0.00";
            return { ...p, popularidad };
        });
    }
    


    async cargarDatos() {
        this.tasa = await Cl_sDolar.obtenerTasa();
        this.vista.setTasa(this.tasa);
        await Promise.all([this.cargarProductos(), this.cargarPedidos()]);

        this.vista.mostrarProductos(this.porcentajeMasVendidos());
        this.vista.llenarSelectorProductosAnalisis(this.productos);
        this.calcularReportes();
    }

    async cargarProductos() {
        const res = await sProducto.obtenerTodos();
        if (res.ok) {
            this.productos = res.data;
            this.vista.mostrarProductos(this.porcentajeMasVendidos());
            this.vista.llenarSelectorProductosAnalisis(this.productos);
        }
    }

    async cargarPedidos() {
        const res = await sPedido.obtenerTodos();
        if (res.ok) {
            this.pedidos = res.data.map((p: any) => new Cl_mPedido({
                id: p.id,
                nomCliente: p.NomCliente,
                cedula: p.Cedula || p.cedula,
                items: p.Items,
                metodoPago: p.MetodoPago,
                detallesPago: p.DetallesPago,
                fecha: p.Fecha,
                estado: p.estado
            }));
            this.vista.mostrarPedidos(this.filtrarPedidos());
            this.calcularReportes();
            
            // Re-evaluar análisis seleccionado si hay alguno
            const selectEl = document.getElementById("selectAnalisisProducto") as HTMLSelectElement | null;
            if (selectEl && selectEl.value) {
                const resAnalisis = this.analizarProducto(selectEl.value);
                this.vista.mostrarAnalisisProducto(resAnalisis.unidades, resAnalisis.ingresoUSD, resAnalisis.ingresoBS);
            }
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

            let cedulaMatch = true;
            if (this.filtros.cedula) {
                const searchCed = this.filtros.cedula.trim().toLowerCase();
                const pedCed = (p.cedula || '').trim().toLowerCase();
                cedulaMatch = pedCed.includes(searchCed);
            }
            
            return estadoMatch && pagoMatch && fechaMatch && cedulaMatch;
        });
    }

    async procesarPedido(id: string) {
        const res = await sPedido.actualizarEstado(id, "Procesado");
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.ok ? "Pedido procesado" : res.mensaje);
        if (res.ok) await this.cargarPedidos();
    }
    async cancelarPedido(id: string) {
        const res = await sPedido.actualizarEstado(id, "Cancelado");
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.ok ? "Pedido cancelado" : res.mensaje);
        if (res.ok) await this.cargarPedidos();
    }

    async guardarProducto(producto: any) {
        let res;
        if (producto.id) {
            res = await sProducto.actualizar(producto.id, producto);
        } else {
            res = await sProducto.agregar(producto);
        }
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.mensaje);
        if (res.ok) await this.cargarProductos();
    }

    async eliminarProducto(id: string) {
        const res = await sProducto.eliminar(id);
        this.vista.mostrarModal(res.ok ? "success" : "danger", res.mensaje);
        if (res.ok) await this.cargarProductos();
    }
}