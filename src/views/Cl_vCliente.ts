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
    private inBuscar: HTMLInputElement;
    private selectCategoria: HTMLSelectElement;
    private agregarCallback?: (codigo: string, cantidad: number) => void;
    private eliminarCallback?: (codigo: string) => void;
    private enviarCallback?: () => void;
    private buscarCallback?: (texto: string) => void;
    private cambiarCategoriaCallback?: (categoria: string) => void;
    private cantidades: Map<string, number> = new Map();

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
        this.inBuscar = document.getElementById("inBuscar") as HTMLInputElement;
        this.selectCategoria = document.getElementById("selectCategoria") as HTMLSelectElement;

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
            
            const img = div.querySelector("img") as HTMLImageElement;
            img.onerror = () => {
                img.src = "img/placeholder.png";
            };

            const display = div.querySelector(`#cant-${prod.codigo}`) as HTMLElement;

            div.querySelector(".btn-plus")!.addEventListener("click", () => {
                cantidad++;
                this.cantidades.set(prod.codigo, cantidad);
                display.textContent = cantidad.toString();
                // Notificamos al controlador el cambio inmediato
                this.agregarCallback?.(prod.codigo, 1); 
            });
            
            div.querySelector(".btn-minus")!.addEventListener("click", () => {
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
        this.inBuscar.value = "";
        this.selectCategoria.value = "Todas";
        this.cantidades.clear();
        this.cambiarMetodoPago();
    }

    resetContador(codigo: string): void {
        const span = document.getElementById(`cant-${codigo}`) as HTMLElement;
        if (span) {
            span.textContent = "0";
        }
        this.cantidades.set(codigo, 0);
    }

    onBuscar(callback: (texto: string) => void): void {
        this.buscarCallback = callback;
    }

    onCambiarCategoria(callback: (categoria: string) => void): void {
        this.cambiarCategoriaCallback = callback;
    }

    llenarCategorias(categorias: string[]): void {
        this.selectCategoria.innerHTML = '<option value="Todas">Todas las categorías</option>';
        categorias.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat;
            opt.textContent = cat;
            this.selectCategoria.appendChild(opt);
        });
    }
}
