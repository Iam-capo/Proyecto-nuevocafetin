export default class Cl_vAdmin {
    tablaPedidos;
    tasa = 40.0;
    setTasa(tasa) {
        this.tasa = tasa;
    }
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
    filtroCedula;
    guardarProductoCallback;
    eliminarProductoCallback;
    modalEl;
    modalInstance;
    modalBody;
    txtRecaudacionDiaria;
    txtProductoMasVendido;
    txtProductoMasVendidoDetalle;
    txtProductoMayorIngreso;
    txtProductoMayorIngresoDetalle;
    selectAnalisisProducto;
    txtUnidadesProducto;
    txtIngresoProducto;
    analizarProductoCallback;
    constructor() {
        this.tablaPedidos = document.getElementById("tablaPedidos");
        this.filtroEstado = document.getElementById("inFiltroEstado");
        this.filtroMetodoPago = document.getElementById("inFiltroMetodoPago");
        this.filtroFecha = document.getElementById("inFiltroFecha");
        this.filtroCedula = document.getElementById("inFiltroCedula");
        this.tablaProductos = document.getElementById("tablaProductos");
        this.formProducto = document.getElementById("formProducto");
        this.btnGuardarProducto = document.getElementById("btnGuardarProducto");
        this.modalEl = document.getElementById("adminAlertModal");
        this.modalBody = document.getElementById("adminAlertModalBody");
        this.txtRecaudacionDiaria = document.getElementById("txtRecaudacionDiaria");
        this.txtProductoMasVendido = document.getElementById("txtProductoMasVendido");
        this.txtProductoMasVendidoDetalle = document.getElementById("txtProductoMasVendidoDetalle");
        this.txtProductoMayorIngreso = document.getElementById("txtProductoMayorIngreso");
        this.txtProductoMayorIngresoDetalle = document.getElementById("txtProductoMayorIngresoDetalle");
        this.selectAnalisisProducto = document.getElementById("selectAnalisisProducto");
        this.txtUnidadesProducto = document.getElementById("txtUnidadesProducto");
        this.txtIngresoProducto = document.getElementById("txtIngresoProducto");
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
            const esBs = pedido.metodoPago === "Efectivo Bs." || pedido.metodoPago === "Pago Móvil" || pedido.metodoPago === "Efectivo BS" || pedido.metodoPago === "Efectivo Bs";
            const totalStr = esBs ? `Bs. ${pedido.total().toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${pedido.total().toFixed(2)}`;
            const productosHtml = pedido.items.map((i) => `${i.nombre} x${i.cantidad}`).join("<br>");
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
        document.getElementById("prodCantidad").value = prod.cantidad_disponible !== undefined ? prod.cantidad_disponible : 0;
        document.getElementById("prodImagenNombre").value = prod.imagen;
        this.productoEditandoId = prod.id;
    }
    guardarProducto() {
        const codigo = document.getElementById("prodCodigo").value.trim();
        const nombre = document.getElementById("prodNombre").value.trim();
        const categoria = document.getElementById("prodCategoria").value.trim();
        const precio = parseFloat(document.getElementById("prodPrecio").value);
        const cantidad_disponible = parseInt(document.getElementById("prodCantidad").value) || 0;
        const inputArchivo = document.getElementById("prodImagenFile");
        const file = inputArchivo.files?.[0];
        let imagen = "";
        if (file) {
            imagen = file.name;
        }
        else {
            imagen = document.getElementById("prodImagenNombre").value.trim();
        }
        if (!codigo || !nombre || !categoria || isNaN(precio) || isNaN(cantidad_disponible)) {
            this.mostrarModal("warning", "Complete todos los campos correctamente");
            return;
        }
        this.guardarProductoCallback?.({ id: this.productoEditandoId, codigo, nombre, categoria, precio, cantidad_disponible, imagen });
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
    mostrarReportes(datos) {
        const usdFormateado = datos.recaudacionDiariaUSD.toFixed(2);
        const bsFormateado = datos.recaudacionDiariaBS.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        this.txtRecaudacionDiaria.innerHTML = `$${usdFormateado} <span style="font-size: 0.6em; font-weight: normal; display: block;">Bs. ${bsFormateado}</span>`;
        if (datos.masVendido) {
            this.txtProductoMasVendido.textContent = datos.masVendido.nombre;
            this.txtProductoMasVendidoDetalle.textContent = `${datos.masVendido.cantidad} unidades`;
        }
        else {
            this.txtProductoMasVendido.textContent = "—";
            this.txtProductoMasVendidoDetalle.textContent = "0 unidades";
        }
        if (datos.mayorIngreso) {
            this.txtProductoMayorIngreso.textContent = datos.mayorIngreso.nombre;
            const mayorUSDFormateado = datos.mayorIngreso.totalUSD.toFixed(2);
            const mayorBSFormateado = datos.mayorIngreso.totalBS.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            this.txtProductoMayorIngresoDetalle.innerHTML = `$${mayorUSDFormateado} USD<br>Bs. ${mayorBSFormateado} BS`;
        }
        else {
            this.txtProductoMayorIngreso.textContent = "—";
            this.txtProductoMayorIngresoDetalle.textContent = "$0.00 USD / Bs. 0,00 BS";
        }
    }
    llenarSelectorProductosAnalisis(productos) {
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
    onAnalizarProducto(callback) {
        this.analizarProductoCallback = callback;
    }
    mostrarAnalisisProducto(unidades, ingresosUSD, ingresosBS) {
        this.txtUnidadesProducto.textContent = unidades.toString();
        const ingUSDFormateado = ingresosUSD.toFixed(2);
        const ingBSFormateado = ingresosBS.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        this.txtIngresoProducto.innerHTML = `$${ingUSDFormateado} USD<br><span class="fs-6 text-success" style="font-weight: normal;">Bs. ${ingBSFormateado} BS</span>`;
    }
}
//# sourceMappingURL=Cl_vAdmin.js.map