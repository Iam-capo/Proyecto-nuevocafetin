import I_vAdmin from "../interfaces/I_vAdmin.js";

export default class Cl_vAdmin implements I_vAdmin {
    private tablaPedidos: HTMLTableSectionElement;
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
    private guardarProductoCallback?: (producto: any) => void;
    private eliminarProductoCallback?: (id: string) => void;
    private modalEl: HTMLElement | null;
    private modalInstance: any;
    private modalBody: HTMLElement | null;

    constructor() {
        this.tablaPedidos = document.getElementById("tablaPedidos") as HTMLTableSectionElement;
        this.filtroEstado = document.getElementById("inFiltroEstado") as HTMLSelectElement;
        this.filtroMetodoPago = document.getElementById("inFiltroMetodoPago") as HTMLSelectElement;
        this.filtroFecha = document.getElementById("inFiltroFecha") as HTMLInputElement;
        this.tablaProductos = document.getElementById("tablaProductos") as HTMLTableSectionElement;
        this.formProducto = document.getElementById("formProducto") as HTMLFormElement;
        this.btnGuardarProducto = document.getElementById("btnGuardarProducto") as HTMLButtonElement;
        this.modalEl = document.getElementById("adminAlertModal");
        this.modalBody = document.getElementById("adminAlertModalBody");

        this.filtroEstado.onchange = () => this.filtrarCallback?.({ estado: this.filtroEstado.value, metodoPago: this.filtroMetodoPago.value, fecha: this.filtroFecha.value });
        this.filtroMetodoPago.onchange = () => this.filtrarCallback?.({ estado: this.filtroEstado.value, metodoPago: this.filtroMetodoPago.value, fecha: this.filtroFecha.value });
        this.filtroFecha.onchange = () => this.filtrarCallback?.({ estado: this.filtroEstado.value, metodoPago: this.filtroMetodoPago.value, fecha: this.filtroFecha.value });
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
            const productosHtml = pedido.items.map((i: any) => `${i.nombre} x${i.cantidad}`).join("<br>");
            const fila = this.tablaPedidos.insertRow();
            fila.innerHTML = `
                <td>${pedido.id || ''}</td>
                <td>${pedido.nomCliente}</td>
                <td>${productosHtml}</td>
                <td>${pedido.cantidadTotal()}</td>
                <td>$${pedido.total().toFixed(2)}</td>
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
            fila.innerHTML = `
                <td>${prod.codigo}</td>
                <td>${prod.nombre}</td>
                <td>${prod.categoria}</td>
                <td>$${prod.precio.toFixed(2)}</td>
                <td>${prod.popularidad}%</td>
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
        (document.getElementById("prodImagenNombre") as HTMLInputElement).value = prod.imagen;
        this.productoEditandoId = prod.id;
    }

    guardarProducto() {
        const codigo = (document.getElementById("prodCodigo") as HTMLInputElement).value.trim();
        const nombre = (document.getElementById("prodNombre") as HTMLInputElement).value.trim();
        const imagen = (document.getElementById("prodImagenNombre") as HTMLInputElement).value.trim();
        const categoria = (document.getElementById("prodCategoria") as HTMLInputElement).value.trim();
        const precio = parseFloat((document.getElementById("prodPrecio") as HTMLInputElement).value);
        if (!codigo || !nombre || !categoria || isNaN(precio)) {
            this.mostrarModal("warning", "Complete todos los campos correctamente");
            return;
        }
        this.guardarProductoCallback?.({ id: this.productoEditandoId, codigo, nombre, categoria, precio, imagen });
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
}