import I_vAdmin from "../interfaces/I_vAdmin.js";

export default class Cl_vAdmin implements I_vAdmin {
    private tablaPedidos: HTMLTableSectionElement;
    private tasa: number = 40.0;

    setTasa(tasa: number): void {
        this.tasa = tasa;
    }
    private filtroEstado: HTMLSelectElement;
    private filtroMetodoPago: HTMLSelectElement;
    private tablaProductos: HTMLTableSectionElement;
    private formProducto: HTMLFormElement;
    private btnGuardarProducto: HTMLButtonElement;
    private productoEditandoId: string | null = null;
    private procesarCallback?: (id: string) => void;
    private cancelarCallback?: (id: string) => void;
    private filtrarCallback?: (filtros: any) => void;
    private filtroFecha: HTMLInputElement;
    private filtroCedula: HTMLInputElement;
    private guardarProductoCallback?: (producto: any) => void;
    private eliminarProductoCallback?: (id: string) => void;
    private modalEl: HTMLElement | null;
    private modalInstance: any;
    private modalBody: HTMLElement | null;

    private txtRecaudacionDiaria: HTMLElement;
    private txtProductoMasVendido: HTMLElement;
    private txtProductoMasVendidoDetalle: HTMLElement;
    private txtProductoMayorIngreso: HTMLElement;
    private txtProductoMayorIngresoDetalle: HTMLElement;
    private selectAnalisisProducto: HTMLSelectElement;
    private txtUnidadesProducto: HTMLElement;
    private txtIngresoProducto: HTMLElement;
    private analizarProductoCallback?: (codigo: string) => void;

    constructor() {
        this.tablaPedidos = document.getElementById("tablaPedidos") as HTMLTableSectionElement;
        this.filtroEstado = document.getElementById("inFiltroEstado") as HTMLSelectElement;
        this.filtroMetodoPago = document.getElementById("inFiltroMetodoPago") as HTMLSelectElement;
        this.filtroFecha = document.getElementById("inFiltroFecha") as HTMLInputElement;
        this.filtroCedula = document.getElementById("inFiltroCedula") as HTMLInputElement;
        this.tablaProductos = document.getElementById("tablaProductos") as HTMLTableSectionElement;
        this.formProducto = document.getElementById("formProducto") as HTMLFormElement;
        this.btnGuardarProducto = document.getElementById("btnGuardarProducto") as HTMLButtonElement;
        this.modalEl = document.getElementById("adminAlertModal");
        this.modalBody = document.getElementById("adminAlertModalBody");

        this.txtRecaudacionDiaria = document.getElementById("txtRecaudacionDiaria") as HTMLElement;
        this.txtProductoMasVendido = document.getElementById("txtProductoMasVendido") as HTMLElement;
        this.txtProductoMasVendidoDetalle = document.getElementById("txtProductoMasVendidoDetalle") as HTMLElement;
        this.txtProductoMayorIngreso = document.getElementById("txtProductoMayorIngreso") as HTMLElement;
        this.txtProductoMayorIngresoDetalle = document.getElementById("txtProductoMayorIngresoDetalle") as HTMLElement;
        this.selectAnalisisProducto = document.getElementById("selectAnalisisProducto") as HTMLSelectElement;
        this.txtUnidadesProducto = document.getElementById("txtUnidadesProducto") as HTMLElement;
        this.txtIngresoProducto = document.getElementById("txtIngresoProducto") as HTMLElement;

        this.selectAnalisisProducto.onchange = () => {
            this.analizarProductoCallback?.(this.selectAnalisisProducto.value);
        };

        const triggerFiltro = () => this.filtrarCallback?.({
            estado: this.filtroEstado.value,
            metodoPago: this.filtroMetodoPago.value,
            fecha: this.filtroFecha.value,
            cedula: this.filtroCedula.value
        });

        this.filtroEstado.onchange = triggerFiltro;
        this.filtroMetodoPago.onchange = triggerFiltro;
        this.filtroFecha.onchange = triggerFiltro;
        this.filtroCedula.oninput = triggerFiltro;
        this.formProducto.onsubmit = (e) => { e.preventDefault(); this.guardarProducto(); };
        this.btnGuardarProducto.onclick = () => this.guardarProducto();

        if (this.modalEl && (window as any).bootstrap) {
            this.modalInstance = new (window as any).bootstrap.Modal(this.modalEl);
        }

        const inputArchivo = document.getElementById("prodImagenFile") as HTMLInputElement;
        inputArchivo.addEventListener("change", () => {
            const file = inputArchivo.files?.[0];
            if (file) {
                (document.getElementById("prodImagenNombre") as HTMLInputElement).value = file.name;
                }
                });
    }

    mostrarPedidos(pedidos: any[]): void {
        this.tablaPedidos.innerHTML = "";
        pedidos.forEach(pedido => {
            const esBs = pedido.metodoPago === "Efectivo Bs." || pedido.metodoPago === "Pago Móvil" || pedido.metodoPago === "Efectivo BS" || pedido.metodoPago === "Efectivo Bs";
            const totalStr = esBs ? `Bs. ${pedido.total().toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${pedido.total().toFixed(2)}`;
            const productosHtml = pedido.items.map((i: any) => `${i.nombre} x${i.cantidad}`).join("<br>");
            const fila = this.tablaPedidos.insertRow();
            fila.innerHTML = `
                <td>${pedido.id || ''}</td>
                <td>${pedido.nomCliente}<br><small class="text-muted">CI: ${pedido.cedula || '—'}</small></td>
                <td>${productosHtml}</td>
                <td>${pedido.cantidadTotal()}</td>
                <td>${totalStr}</td>
                <td>${pedido.metodoPago}</td>
                <td>${pedido.detallesPago || '—'}</td>
                <td>${pedido.fecha || '—'}</td>
                <td class="${pedido.estado.toLowerCase()}">${pedido.estado}</td>
                <td><button class="btn btn-sm btn-success btn-procesar" data-id="${pedido.id}" ${pedido.estado !== 'Pendiente' ? 'disabled' : ''}>Procesar</button><button class="btn btn-sm btn-danger btn-cancelar" data-id="${pedido.id}" ${pedido.estado !== 'Pendiente' ? 'disabled' : ''}>Cancelar</button></td>
            `;
            const btn = fila.querySelector(".btn-procesar") as HTMLButtonElement;
            btn.onclick = () => this.procesarCallback?.(pedido.id);
            const btnCancelar = fila.querySelector(".btn-cancelar") as HTMLButtonElement;
            btnCancelar.onclick = () => this.cancelarCallback?.(pedido.id);
        });
    }

    mostrarProductos(productos: any[]): void {
        this.tablaProductos.innerHTML = "";
        productos.forEach(prod => {
            const fila = this.tablaProductos.insertRow();
            const popStr = !prod.popularidad || prod.popularidad === "0.00" || prod.popularidad === "0" || prod.popularidad === "—" ? "—" : `${prod.popularidad}%`;
            const cant = prod.cantidad_disponible !== undefined ? prod.cantidad_disponible : 0;
            fila.innerHTML = `
                <td>${prod.codigo}</td>
                <td>${prod.nombre}</td>
                <td>${prod.categoria}</td>
                <td>$${prod.precio.toFixed(2)}</td>
                <td>${cant}</td>
                <td>${popStr}</td>
                <td>
                    <button class="btn btn-sm btn-warning btn-editar" data-id="${prod.id}">Editar</button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${prod.id}">Eliminar</button>
                 </td>
            `;
            const btnEditar = fila.querySelector(".btn-editar") as HTMLButtonElement;
            const btnEliminar = fila.querySelector(".btn-eliminar") as HTMLButtonElement;
            btnEditar.onclick = () => this.editarProducto(prod);
            btnEliminar.onclick = () => this.eliminarProductoCallback?.(prod.id);
        });
    }

    editarProducto(prod: any) {
        (document.getElementById("prodCodigo") as HTMLInputElement).value = prod.codigo;
        (document.getElementById("prodNombre") as HTMLInputElement).value = prod.nombre;
        (document.getElementById("prodCategoria") as HTMLInputElement).value = prod.categoria;
        (document.getElementById("prodPrecio") as HTMLInputElement).value = prod.precio;
        (document.getElementById("prodCantidad") as HTMLInputElement).value = prod.cantidad_disponible !== undefined ? prod.cantidad_disponible : 0;
        (document.getElementById("prodImagenNombre") as HTMLInputElement).value = prod.imagen;
        this.productoEditandoId = prod.id;
    }

    guardarProducto() {
        const codigo = (document.getElementById("prodCodigo") as HTMLInputElement).value.trim();
        const nombre = (document.getElementById("prodNombre") as HTMLInputElement).value.trim();
        const categoria = (document.getElementById("prodCategoria") as HTMLInputElement).value.trim();
        const precio = parseFloat((document.getElementById("prodPrecio") as HTMLInputElement).value);
        const cantidad_disponible = parseInt((document.getElementById("prodCantidad") as HTMLInputElement).value) || 0;
        
        const inputArchivo = document.getElementById("prodImagenFile") as HTMLInputElement;
        const file = inputArchivo.files?.[0];
        let imagen = "";
        
        if (file) {
            imagen = file.name;
        } else {
            imagen = (document.getElementById("prodImagenNombre") as HTMLInputElement).value.trim();
        }

        if (!codigo || !nombre || !categoria || isNaN(precio) || isNaN(cantidad_disponible)) {
            this.mostrarModal("warning", "Complete todos los campos correctamente");
            return;
        }
        this.guardarProductoCallback?.({ id: this.productoEditandoId, codigo, nombre, categoria, precio, cantidad_disponible, imagen });
        this.formProducto.reset();
        this.productoEditandoId = null;
    }

    onProcesarPedido(callback: (id: string) => void): void { this.procesarCallback = callback; }
    onCancelarPedido(callback: (id: string) => void): void { this.cancelarCallback = callback; }
    onFiltrarPedidos(callback: (filtros: any) => void): void { this.filtrarCallback = callback; }
    onGuardarProducto(callback: (producto: any) => void): void { this.guardarProductoCallback = callback; }
    onEliminarProducto(callback: (id: string) => void): void { this.eliminarProductoCallback = callback; }

    mostrarModal(tipo: "success" | "danger" | "warning", mensaje: string): void {
        if (!this.modalInstance || !this.modalBody) return;
        this.modalBody.innerHTML = `<div class="text-${tipo}">${mensaje}</div>`;
        this.modalInstance.show();
        setTimeout(() => this.modalInstance.hide(), 1500);
    }

    mostrarReportes(datos: { 
        recaudacionDiariaUSD: number; 
        recaudacionDiariaBS: number; 
        masVendido: { nombre: string; cantidad: number } | null; 
        mayorIngreso: { nombre: string; totalUSD: number; totalBS: number } | null; 
    }): void {
        const totalUSD = datos.recaudacionDiariaUSD + (datos.recaudacionDiariaBS / this.tasa);
        const totalUSDConsolidado = parseFloat(totalUSD.toFixed(2));
        const totalBSConsolidado = parseFloat((totalUSDConsolidado * this.tasa).toFixed(2));

        const usdFormateado = totalUSDConsolidado.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const bsFormateado = totalBSConsolidado.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        this.txtRecaudacionDiaria.innerHTML = `$ ${usdFormateado}<br>Bs. ${bsFormateado}`;
        
        if (datos.masVendido) {
            this.txtProductoMasVendido.textContent = datos.masVendido.nombre;
            this.txtProductoMasVendidoDetalle.textContent = `${datos.masVendido.cantidad} unidades`;
        } else {
            this.txtProductoMasVendido.textContent = "—";
            this.txtProductoMasVendidoDetalle.textContent = "0 unidades";
        }

        if (datos.mayorIngreso) {
            this.txtProductoMayorIngreso.textContent = datos.mayorIngreso.nombre;
            const totalUSD = datos.mayorIngreso.totalUSD + (datos.mayorIngreso.totalBS / this.tasa);
            const totalUSDConsolidado = parseFloat(totalUSD.toFixed(2));
            const totalBSConsolidado = parseFloat((totalUSDConsolidado * this.tasa).toFixed(2));

            const mayorUSDFormateado = totalUSDConsolidado.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const mayorBSFormateado = totalBSConsolidado.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            this.txtProductoMayorIngresoDetalle.innerHTML = `$ ${mayorUSDFormateado}<br>Bs. ${mayorBSFormateado}`;
        } else {
            this.txtProductoMayorIngreso.textContent = "—";
            this.txtProductoMayorIngresoDetalle.innerHTML = `$ 0,00<br>Bs. 0,00`;
        }
    }

    llenarSelectorProductosAnalisis(productos: any[]): void {
        const currentVal = this.selectAnalisisProducto.value;
        this.selectAnalisisProducto.innerHTML = '<option value="">Seleccione un producto...</option>';
        productos.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.codigo;
            opt.textContent = `${p.nombre} (${p.codigo})`;
            this.selectAnalisisProducto.appendChild(opt);
        });
        this.selectAnalisisProducto.value = currentVal;
    }

    onAnalizarProducto(callback: (codigo: string) => void): void {
        this.analizarProductoCallback = callback;
    }

    mostrarAnalisisProducto(unidades: number, ingresosUSD: number, ingresosBS: number): void {
        this.txtUnidadesProducto.textContent = unidades.toString();
        const totalUSD = ingresosUSD + (ingresosBS / this.tasa);
        const totalUSDConsolidado = parseFloat(totalUSD.toFixed(2));
        const totalBSConsolidado = parseFloat((totalUSDConsolidado * this.tasa).toFixed(2));

        const ingUSDFormateado = totalUSDConsolidado.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const ingBSFormateado = totalBSConsolidado.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        this.txtIngresoProducto.innerHTML = `$ ${ingUSDFormateado}<br>Bs. ${ingBSFormateado}`;
    }
}
