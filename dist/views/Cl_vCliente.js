export default class Cl_vCliente {
    inNomCliente;
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
    agregarCallback;
    eliminarCallback;
    enviarCallback;
    constructor() {
        this.inNomCliente = document.getElementById("inNomCliente");
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
        this.selectMetodoPago.addEventListener("change", () => this.cambiarMetodoPago());
        this.btEnviar.onclick = () => this.enviarCallback?.();
        this.cambiarMetodoPago();
    }
    cambiarMetodoPago() {
        const value = this.selectMetodoPago.value;
        this.divPagoMovil.style.display = value === "Pago Móvil" ? "block" : "none";
        this.divOtro.style.display = value === "Otro" ? "block" : "none";
    }
    get nomCliente() { return this.inNomCliente.value; }
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
    // En Cl_vCliente.ts, dentro del método mostrarProductos
    // Dentro de tu método mostrarProductos en Cl_vCliente.ts
    mostrarProductos(productos) {
        this.divProductos.innerHTML = "";
        productos.forEach(prod => {
            const div = document.createElement("div");
            div.className = "col-md-3 mb-4";
            div.innerHTML = `
            <div class="card-prod shadow-sm">
                <img src="img/${prod.imagen || 'default.png'}" class="img-fluid mb-2" style="height: 80px;">
                <h6>${prod.nombre}</h6>
                <p class="text-muted fw-bold">$${prod.precio.toFixed(2)}</p>
                <div class="control-cantidad">
                    <button class="btn-qty btn-minus" data-codigo="${prod.codigo}">-</button>
                    <span id="cant-${prod.codigo}" class="fs-5">0</span>
                    <button class="btn-qty btn-plus" data-codigo="${prod.codigo}">+</button>
                </div>
            </div>
        `;
            const display = div.querySelector(`#cant-${prod.codigo}`);
            let cantidad = 0;
            div.querySelector(".btn-plus").addEventListener("click", () => {
                cantidad++;
                display.textContent = cantidad.toString();
                // Notificamos al controlador el cambio inmediato
                this.agregarCallback?.(prod.codigo, 1);
            });
            div.querySelector(".btn-minus").addEventListener("click", () => {
                if (cantidad > 0) {
                    cantidad--;
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
        this.spTotalPedido.textContent = `$${total.toFixed(2)}`;
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
        this.selectMetodoPago.value = "";
        this.inRefPago.value = "";
        this.inDescOtro.value = "";
        this.cambiarMetodoPago();
    }
    // Agrega este método a tu clase Cl_vCliente
    resetContador(codigo) {
        const span = document.getElementById(`cant-${codigo}`);
        if (span) {
            span.textContent = "0";
            // También debemos resetear la variable local si la tienes guardada
            // En este diseño, el span es nuestra fuente de verdad visual
        }
    }
}
//# sourceMappingURL=Cl_vCliente.js.map