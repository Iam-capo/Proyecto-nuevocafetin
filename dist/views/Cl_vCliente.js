export default class Cl_vCliente {
    inNomCliente;
    inCedCliente;
    divProductos;
    tablaCarrito;
    spTotalPedido;
    selectMetodoPago;
    divPagoMovil;
    divOtro;
    inRefPago;
    inDescOtro;
    btEnviar;
    alertContainer;
    inBuscar;
    selectCategoria;
    agregarCallback;
    eliminarCallback;
    enviarCallback;
    buscarCallback;
    cambiarCategoriaCallback;
    cantidades = new Map();
    tasa = 40.0;
    setTasa(tasa) {
        this.tasa = tasa;
    }
    constructor() {
        this.inNomCliente = document.getElementById("inNomCliente");
        this.inCedCliente = document.getElementById("inCedCliente");
        this.divProductos = document.getElementById("listaProductos");
        this.tablaCarrito = document.getElementById("tablaCarrito");
        this.spTotalPedido = document.getElementById("spTotalPedido");
        this.selectMetodoPago = document.getElementById("metodoPago");
        this.divPagoMovil = document.getElementById("divPagoMovil");
        this.divOtro = document.getElementById("divOtro");
        this.inRefPago = document.getElementById("refPagoMovil");
        this.inDescOtro = document.getElementById("descOtro");
        this.btEnviar = document.getElementById("btEnviar");
        this.alertContainer = document.getElementById("clienteAlertContainer");
        this.inBuscar = document.getElementById("inBuscar");
        this.selectCategoria = document.getElementById("selectCategoria");
        this.selectMetodoPago.addEventListener("change", () => this.cambiarMetodoPago());
        this.btEnviar.onclick = () => this.enviarCallback?.();
        this.inBuscar.addEventListener("input", () => this.buscarCallback?.(this.inBuscar.value));
        this.selectCategoria.addEventListener("change", () => this.cambiarCategoriaCallback?.(this.selectCategoria.value));
        this.cambiarMetodoPago();
    }
    cambiarMetodoPago() {
        const value = this.selectMetodoPago.value;
        this.divPagoMovil.style.display = value === "Pago Móvil" ? "block" : "none";
        this.divOtro.style.display = value === "Otro" ? "block" : "none";
    }
    get nomCliente() { return this.inNomCliente.value; }
    get cedula() { return this.inCedCliente.value; }
    get metodoPago() { return this.selectMetodoPago.value; }
    get referenciaPago() { return this.inRefPago.value; }
    get descripcionOtro() { return this.inDescOtro.value; }
    onAgregarProducto(callback) {
        this.agregarCallback = callback;
    }
    onEliminarProducto(callback) {
        this.eliminarCallback = callback;
    }
    onEnviar(callback) {
        this.enviarCallback = callback;
    }
    mostrarProductos(productos) {
        this.divProductos.innerHTML = "";
        productos.forEach(prod => {
            const div = document.createElement("div");
            div.className = "col-md-3 mb-4";
            let cantidad = this.cantidades.get(prod.codigo) || 0;
            div.innerHTML = `
                <div class="card-prod shadow-sm">
                    <img src="img/${prod.imagen}" class="img-fluid mb-2" style="height: 80px;">
                    <h6>${prod.nombre}</h6>
                    <p class="text-muted fw-bold">$${prod.precio.toFixed(2)}</p>
                    <div class="control-cantidad">
                        <button class="btn-qty btn-minus" data-codigo="${prod.codigo}">-</button>
                        <span id="cant-${prod.codigo}" class="fs-5">${cantidad}</span>
                        <button class="btn-qty btn-plus" data-codigo="${prod.codigo}">+</button>
                    </div>
                </div>
            `;
            const img = div.querySelector("img");
            img.onerror = () => {
                img.src = "img/placeholder.png";
            };
            const display = div.querySelector(`#cant-${prod.codigo}`);
            div.querySelector(".btn-plus").addEventListener("click", () => {
                cantidad++;
                this.cantidades.set(prod.codigo, cantidad);
                display.textContent = cantidad.toString();
                // Notificamos al controlador el cambio inmediato
                this.agregarCallback?.(prod.codigo, 1);
            });
            div.querySelector(".btn-minus").addEventListener("click", () => {
                if (cantidad > 0) {
                    cantidad--;
                    this.cantidades.set(prod.codigo, cantidad);
                    display.textContent = cantidad.toString();
                    // Notificamos para restar al carrito (cantidad negativa)
                    this.agregarCallback?.(prod.codigo, -1);
                }
            });
            this.divProductos.appendChild(div);
        });
    }
    mostrarCarrito(items) {
        this.tablaCarrito.innerHTML = "";
        items.forEach(item => {
            const fila = this.tablaCarrito.insertRow();
            fila.innerHTML = `
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger btn-eliminar" data-codigo="${item.codigo}">Eliminar</button></td>
            `;
            const btnEliminar = fila.querySelector(".btn-eliminar");
            btnEliminar.onclick = () => this.eliminarCallback?.(item.codigo);
        });
    }
    mostrarTotal(total) {
        const totalBs = total * this.tasa;
        const totalBsFormateado = totalBs.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        this.spTotalPedido.innerHTML = `$${total.toFixed(2)} <span class="d-block text-bolivares-sutil" style="font-size: 0.7em; font-weight: normal; margin-top: 2px;">Bs. ${totalBsFormateado}</span>`;
    }
    mostrarAlerta(tipo, mensaje) {
        const id = `alert-${Date.now()}`;
        this.alertContainer.innerHTML = `<div id="${id}" class="alert alert-${tipo} alert-dismissible fade show">${mensaje}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el)
                el.remove();
        }, 3000);
    }
    limpiar() {
        this.inNomCliente.value = "";
        this.inCedCliente.value = "";
        this.selectMetodoPago.value = "";
        this.inRefPago.value = "";
        this.inDescOtro.value = "";
        this.inBuscar.value = "";
        this.selectCategoria.value = "Todas";
        this.cantidades.clear();
        this.cambiarMetodoPago();
    }
    resetContador(codigo) {
        const span = document.getElementById(`cant-${codigo}`);
        if (span) {
            span.textContent = "0";
        }
        this.cantidades.set(codigo, 0);
    }
    onBuscar(callback) {
        this.buscarCallback = callback;
    }
    onCambiarCategoria(callback) {
        this.cambiarCategoriaCallback = callback;
    }
    llenarCategorias(categorias) {
        this.selectCategoria.innerHTML = '<option value="Todas">Todas las categorías</option>';
        categorias.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat;
            opt.textContent = cat;
            this.selectCategoria.appendChild(opt);
        });
    }
}
//# sourceMappingURL=Cl_vCliente.js.map