export default class Cl_vAdmin {
    tablaPedidos;
    filtroEstado;
    filtroMetodoPago;
    tablaProductos;
    formProducto;
    btnGuardarProducto;
    productoEditandoId = null;
    procesarCallback;
    cancelarCallback;
    filtrarCallback;
    filtroFecha;
    guardarProductoCallback;
    eliminarProductoCallback;
    modalEl;
    modalInstance;
    modalBody;
    constructor() {
        this.tablaPedidos = document.getElementById("tablaPedidos");
        this.filtroEstado = document.getElementById("inFiltroEstado");
        this.filtroMetodoPago = document.getElementById("inFiltroMetodoPago");
        this.filtroFecha = document.getElementById("inFiltroFecha");
        this.tablaProductos = document.getElementById("tablaProductos");
        this.formProducto = document.getElementById("formProducto");
        this.btnGuardarProducto = document.getElementById("btnGuardarProducto");
        this.modalEl = document.getElementById("adminAlertModal");
        this.modalBody = document.getElementById("adminAlertModalBody");
        this.filtroEstado.onchange = () => this.filtrarCallback?.({ estado: this.filtroEstado.value, metodoPago: this.filtroMetodoPago.value, fecha: this.filtroFecha.value });
        this.filtroMetodoPago.onchange = () => this.filtrarCallback?.({ estado: this.filtroEstado.value, metodoPago: this.filtroMetodoPago.value, fecha: this.filtroFecha.value });
        this.filtroFecha.onchange = () => this.filtrarCallback?.({ estado: this.filtroEstado.value, metodoPago: this.filtroMetodoPago.value, fecha: this.filtroFecha.value });
        this.formProducto.onsubmit = (e) => { e.preventDefault(); this.guardarProducto(); };
        this.btnGuardarProducto.onclick = () => this.guardarProducto();
        if (this.modalEl && window.bootstrap) {
            this.modalInstance = new window.bootstrap.Modal(this.modalEl);
        }
        const inputArchivo = document.getElementById("prodImagenFile");
        inputArchivo.addEventListener("change", () => {
            const file = inputArchivo.files?.[0];
            if (file) {
                document.getElementById("prodImagenNombre").value = file.name;
            }
        });
    }
    mostrarPedidos(pedidos) {
        this.tablaPedidos.innerHTML = "";
        pedidos.forEach(pedido => {
            const productosHtml = pedido.items.map((i) => `${i.nombre} x${i.cantidad}`).join("<br>");
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
            const btn = fila.querySelector(".btn-procesar");
            btn.onclick = () => this.procesarCallback?.(pedido.id);
            const btnCancelar = fila.querySelector(".btn-cancelar");
            btnCancelar.onclick = () => this.cancelarCallback?.(pedido.id);
        });
    }
    mostrarProductos(productos) {
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
            const btnEditar = fila.querySelector(".btn-editar");
            const btnEliminar = fila.querySelector(".btn-eliminar");
            btnEditar.onclick = () => this.editarProducto(prod);
            btnEliminar.onclick = () => this.eliminarProductoCallback?.(prod.id);
        });
    }
    editarProducto(prod) {
        document.getElementById("prodCodigo").value = prod.codigo;
        document.getElementById("prodNombre").value = prod.nombre;
        document.getElementById("prodCategoria").value = prod.categoria;
        document.getElementById("prodPrecio").value = prod.precio;
        document.getElementById("prodImagenNombre").value = prod.imagen;
        this.productoEditandoId = prod.id;
    }
    guardarProducto() {
        const codigo = document.getElementById("prodCodigo").value.trim();
        const nombre = document.getElementById("prodNombre").value.trim();
        const categoria = document.getElementById("prodCategoria").value.trim();
        const precio = parseFloat(document.getElementById("prodPrecio").value);
        const inputArchivo = document.getElementById("prodImagenFile");
        const file = inputArchivo.files?.[0];
        let imagen = "";
        if (file) {
            imagen = file.name;
        }
        else {
            imagen = document.getElementById("prodImagenNombre").value.trim();
        }
        if (!codigo || !nombre || !categoria || isNaN(precio)) {
            this.mostrarModal("warning", "Complete todos los campos correctamente");
            return;
        }
        this.guardarProductoCallback?.({ id: this.productoEditandoId, codigo, nombre, categoria, precio, imagen });
        this.formProducto.reset();
        this.productoEditandoId = null;
    }
    onProcesarPedido(callback) { this.procesarCallback = callback; }
    onCancelarPedido(callback) { this.cancelarCallback = callback; }
    onFiltrarPedidos(callback) { this.filtrarCallback = callback; }
    onGuardarProducto(callback) { this.guardarProductoCallback = callback; }
    onEliminarProducto(callback) { this.eliminarProductoCallback = callback; }
    mostrarModal(tipo, mensaje) {
        if (!this.modalInstance || !this.modalBody)
            return;
        this.modalBody.innerHTML = `<div class="text-${tipo}">${mensaje}</div>`;
        this.modalInstance.show();
        setTimeout(() => this.modalInstance.hide(), 1500);
    }
}
//# sourceMappingURL=Cl_vAdmin.js.map