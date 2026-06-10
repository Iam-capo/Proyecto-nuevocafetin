import I_vCliente from "../interfaces/I_vCliente.js";

export default class Cl_vCliente implements I_vCliente {
    private inNomCliente: HTMLInputElement;
    private divProductos: HTMLElement;
    private tablaCarrito: HTMLTableSectionElement;
    private spTotalPedido: HTMLSpanElement;
    private selectMetodoPago: HTMLSelectElement;
    private divPagoMovil: HTMLElement;
    private divOtro: HTMLElement;
    private inRefPago: HTMLInputElement;
    private inDescOtro: HTMLInputElement;
    private btEnviar: HTMLButtonElement;
    private alertContainer: HTMLElement;
    private agregarCallback?: (codigo: string, cantidad: number) => void;
    private eliminarCallback?: (codigo: string) => void;
    private enviarCallback?: () => void;

    constructor() {
        this.inNomCliente = document.getElementById("inNomCliente") as HTMLInputElement;
        this.divProductos = document.getElementById("listaProductos") as HTMLElement;
        this.tablaCarrito = document.getElementById("tablaCarrito") as HTMLTableSectionElement;
        this.spTotalPedido = document.getElementById("spTotalPedido") as HTMLSpanElement;
        this.selectMetodoPago = document.getElementById("metodoPago") as HTMLSelectElement;
        this.divPagoMovil = document.getElementById("divPagoMovil") as HTMLElement;
        this.divOtro = document.getElementById("divOtro") as HTMLElement;
        this.inRefPago = document.getElementById("refPagoMovil") as HTMLInputElement;
        this.inDescOtro = document.getElementById("descOtro") as HTMLInputElement;
        this.btEnviar = document.getElementById("btEnviar") as HTMLButtonElement;
        this.alertContainer = document.getElementById("clienteAlertContainer") as HTMLElement;

        this.selectMetodoPago.addEventListener("change", () => this.cambiarMetodoPago());
        this.btEnviar.onclick = () => this.enviarCallback?.();
        this.cambiarMetodoPago();
    }

    cambiarMetodoPago() {
        const value = this.selectMetodoPago.value;
        this.divPagoMovil.style.display = value === "Pago Móvil" ? "block" : "none";
        this.divOtro.style.display = value === "Otro" ? "block" : "none";
    }

    get nomCliente(): string { return this.inNomCliente.value; }
    get metodoPago(): string { return this.selectMetodoPago.value; }
    get referenciaPago(): string { return this.inRefPago.value; }
    get descripcionOtro(): string { return this.inDescOtro.value; }

    onAgregarProducto(callback: (codigo: string, cantidad: number) => void): void {
        this.agregarCallback = callback;
    }

    onEliminarProducto(callback: (codigo: string) => void): void {
        this.eliminarCallback = callback;
    }

    onEnviar(callback: () => void): void {
        this.enviarCallback = callback;
    }

    mostrarProductos(productos: any[]): void {
        this.divProductos.innerHTML = "";
        productos.forEach(prod => {
            const div = document.createElement("div");
            div.className = "col-md-3 mb-4";
            div.innerHTML = `
                <div class="card-prod shadow-sm">
                    <img src="img/${prod.imagen}" class="img-fluid mb-2" style="height: 80px;">
                    <h6>${prod.nombre}</h6>
                    <p class="text-muted fw-bold">$${prod.precio.toFixed(2)}</p>
                    <div class="control-cantidad">
                        <button class="btn-qty btn-minus" data-codigo="${prod.codigo}">-</button>
                        <span id="cant-${prod.codigo}" class="fs-5">0</span>
                        <button class="btn-qty btn-plus" data-codigo="${prod.codigo}">+</button>
                    </div>
                </div>
            `;
            
            const img = div.querySelector("img") as HTMLImageElement;
            img.onerror = () => {
                img.src = "img/placeholder.png";
            };

            const display = div.querySelector(`#cant-${prod.codigo}`) as HTMLElement;
            let cantidad = 0;

            div.querySelector(".btn-plus")!.addEventListener("click", () => {
                cantidad++;
                display.textContent = cantidad.toString();
                // Notificamos al controlador el cambio inmediato
                this.agregarCallback?.(prod.codigo, 1); 
            });
            
            div.querySelector(".btn-minus")!.addEventListener("click", () => {
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

    mostrarCarrito(items: { codigo: string; nombre: string; precio: number; cantidad: number }[]): void {
        this.tablaCarrito.innerHTML = "";
        items.forEach(item => {
            const fila = this.tablaCarrito.insertRow();
            fila.innerHTML = `
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger btn-eliminar" data-codigo="${item.codigo}">Eliminar</button></td>
            `;
            const btnEliminar = fila.querySelector(".btn-eliminar") as HTMLButtonElement;
            btnEliminar.onclick = () => this.eliminarCallback?.(item.codigo);
        });
    }

    mostrarTotal(total: number): void {
        this.spTotalPedido.textContent = `$${total.toFixed(2)}`;
    }

    mostrarAlerta(tipo: "success" | "danger" | "warning", mensaje: string): void {
        const id = `alert-${Date.now()}`;
        this.alertContainer.innerHTML = `<div id="${id}" class="alert alert-${tipo} alert-dismissible fade show">${mensaje}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.remove();
        }, 3000);
    }

    limpiar(): void {
        this.inNomCliente.value = "";
        this.selectMetodoPago.value = "";
        this.inRefPago.value = "";
        this.inDescOtro.value = "";
        this.cambiarMetodoPago();
    }

    // Agrega este método a tu clase Cl_vCliente
resetContador(codigo: string): void {
    const span = document.getElementById(`cant-${codigo}`) as HTMLElement;
    if (span) {
        span.textContent = "0";
        // También debemos resetear la variable local si la tienes guardada
        // En este diseño, el span es nuestra fuente de verdad visual
    }
}
}