import I_vCliente from "../interfaces/I_vCliente.js";

export default class Cl_vCliente implements I_vCliente {
    private inNomCliente: HTMLInputElement;
    private inCedCliente: HTMLInputElement;
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
    private errNomCliente: HTMLElement;
    private errCedCliente: HTMLElement;
    private errRefPagoMovil: HTMLElement;
    private agregarCallback?: (codigo: string, cantidad: number) => void;
    private eliminarCallback?: (codigo: string) => void;
    private enviarCallback?: () => void;
    private buscarCallback?: (texto: string) => void;
    private cambiarCategoriaCallback?: (categoria: string) => void;
    private cantidades: Map<string, number> = new Map();
    private tasa: number = 40.0;

    setTasa(tasa: number): void {
        this.tasa = tasa;
    }

    constructor() {
        this.inNomCliente = document.getElementById("inNomCliente") as HTMLInputElement;
        this.inCedCliente = document.getElementById("inCedCliente") as HTMLInputElement;
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
        this.errNomCliente = document.getElementById("errNomCliente") as HTMLElement;
        this.errCedCliente = document.getElementById("errCedCliente") as HTMLElement;
        this.errRefPagoMovil = document.getElementById("errRefPagoMovil") as HTMLElement;

        this.selectMetodoPago.addEventListener("change", () => {
            this.cambiarMetodoPago();
            this.validarFormulario(this.selectMetodoPago.value === "Pago Móvil");
        });
        
        this.inNomCliente.addEventListener("input", () => {
            this.validarNombre(true);
            this.validarFormulario(false);
        });

        this.inCedCliente.addEventListener("input", () => {
            this.validarCedula(true);
            this.validarFormulario(false);
        });

        this.inRefPago.addEventListener("input", () => {
            this.validarPagoMovil(true);
            this.validarFormulario(false);
        });

        this.btEnviar.onclick = () => {
            if (this.validarFormulario(true)) {
                this.enviarCallback?.();
            } else {
                this.mostrarAlerta("danger", "Por favor, corrige los errores en el formulario antes de enviar.");
            }
        };
        
        this.inBuscar.addEventListener("input", () => this.buscarCallback?.(this.inBuscar.value));
        this.selectCategoria.addEventListener("change", () => this.cambiarCategoriaCallback?.(this.selectCategoria.value));

        this.cambiarMetodoPago();
        this.validarFormulario(false);
    }

    cambiarMetodoPago() {
        const value = this.selectMetodoPago.value;
        this.divPagoMovil.style.display = value === "Pago Móvil" ? "block" : "none";
        this.divOtro.style.display = value === "Otro" ? "block" : "none";
    }

    validarNombre(mostrarError: boolean = true): boolean {
        const val = this.inNomCliente.value;
        if (!val.trim()) {
            if (mostrarError) {
                this.errNomCliente.textContent = "El nombre del cliente es obligatorio.";
                this.errNomCliente.style.display = "block";
                this.inNomCliente.classList.add("is-invalid");
                this.inNomCliente.style.borderColor = "red";
            }
            return false;
        }
        const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!regexLetras.test(val)) {
            if (mostrarError) {
                this.errNomCliente.textContent = "Por favor, ingresa solo letras";
                this.errNomCliente.style.display = "block";
                this.inNomCliente.classList.add("is-invalid");
                this.inNomCliente.style.borderColor = "red";
            }
            return false;
        }
        this.errNomCliente.textContent = "";
        this.errNomCliente.style.display = "none";
        this.inNomCliente.classList.remove("is-invalid");
        this.inNomCliente.style.borderColor = "";
        return true;
    }

    validarCedula(mostrarError: boolean = true): boolean {
        const val = this.inCedCliente.value;
        if (!val.trim()) {
            if (mostrarError) {
                this.errCedCliente.textContent = "La cédula del cliente es obligatoria.";
                this.errCedCliente.style.display = "block";
                this.inCedCliente.classList.add("is-invalid");
                this.inCedCliente.style.borderColor = "red";
            }
            return false;
        }
        const regexNumeros = /^\d+$/;
        if (!regexNumeros.test(val)) {
            if (mostrarError) {
                this.errCedCliente.textContent = "La cédula debe contener solo números.";
                this.errCedCliente.style.display = "block";
                this.inCedCliente.classList.add("is-invalid");
                this.inCedCliente.style.borderColor = "red";
            }
            return false;
        }
        if (val.length < 7) {
            if (mostrarError) {
                this.errCedCliente.textContent = "La cédula debe tener al menos 7 dígitos";
                this.errCedCliente.style.display = "block";
                this.inCedCliente.classList.add("is-invalid");
                this.inCedCliente.style.borderColor = "red";
            }
            return false;
        }
        this.errCedCliente.textContent = "";
        this.errCedCliente.style.display = "none";
        this.inCedCliente.classList.remove("is-invalid");
        this.inCedCliente.style.borderColor = "";
        return true;
    }

    validarPagoMovil(mostrarError: boolean = true): boolean {
        if (this.selectMetodoPago.value !== "Pago Móvil") {
            this.errRefPagoMovil.textContent = "";
            this.errRefPagoMovil.style.display = "none";
            this.inRefPago.classList.remove("is-invalid");
            this.inRefPago.style.borderColor = "";
            return true;
        }
        const val = this.inRefPago.value;
        if (!val.trim()) {
            if (mostrarError) {
                this.errRefPagoMovil.textContent = "La referencia de Pago Móvil es obligatoria.";
                this.errRefPagoMovil.style.display = "block";
                this.inRefPago.classList.add("is-invalid");
                this.inRefPago.style.borderColor = "red";
            }
            return false;
        }
        const regexNumeros = /^\d+$/;
        if (!regexNumeros.test(val)) {
            if (mostrarError) {
                this.errRefPagoMovil.textContent = "La referencia debe contener solo números.";
                this.errRefPagoMovil.style.display = "block";
                this.inRefPago.classList.add("is-invalid");
                this.inRefPago.style.borderColor = "red";
            }
            return false;
        }
        if (val.length <= 6) {
            if (mostrarError) {
                this.errRefPagoMovil.textContent = "La referencia debe tener más de 6 dígitos";
                this.errRefPagoMovil.style.display = "block";
                this.inRefPago.classList.add("is-invalid");
                this.inRefPago.style.borderColor = "red";
            }
            return false;
        }
        this.errRefPagoMovil.textContent = "";
        this.errRefPagoMovil.style.display = "none";
        this.inRefPago.classList.remove("is-invalid");
        this.inRefPago.style.borderColor = "";
        return true;
    }

    validarFormulario(mostrarError: boolean = true): boolean {
        const nomValido = this.validarNombre(mostrarError);
        const cedValida = this.validarCedula(mostrarError);
        const pagoMovilValido = this.validarPagoMovil(mostrarError);
        
        const esValido = nomValido && cedValida && pagoMovilValido;
        this.btEnviar.disabled = !esValido;
        return esValido;
    }

    get nomCliente(): string { return this.inNomCliente.value; }
    get cedula(): string { return this.inCedCliente.value; }
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
            div.className = "col-6 col-md-3 mb-4";
            let cantidad = this.cantidades.get(prod.codigo) || 0;
            const limit = prod.cantidad_disponible !== undefined ? prod.cantidad_disponible : 0;
            div.innerHTML = `
                <div class="card-prod shadow-sm h-100 d-flex flex-column justify-content-between">
                    <div>
                        <img src="img/${prod.imagen}" class="img-fluid mb-2" style="height: 80px; object-fit: contain;">
                        <h6 class="product-title">${prod.nombre}</h6>
                        <p class="text-muted fw-bold mb-2">$${prod.precio.toFixed(2)}</p>
                    </div>
                    <div class="control-cantidad mt-auto">
                        <button class="btn-qty btn-minus" data-codigo="${prod.codigo}">-</button>
                        <span id="cant-${prod.codigo}" class="fs-5 fw-bold mx-2">${cantidad}</span>
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
                if (cantidad >= limit) {
                    this.mostrarAlerta("warning", `Solo quedan ${limit} unidades disponibles`);
                    return;
                }
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
        const totalBs = total * this.tasa;
        const totalBsFormateado = totalBs.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        this.spTotalPedido.innerHTML = `$${total.toFixed(2)} <span class="d-block text-bolivares-sutil" style="font-size: 0.7em; font-weight: normal; margin-top: 2px;">Bs. ${totalBsFormateado}</span>`;
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
        this.inCedCliente.value = "";
        this.selectMetodoPago.value = "";
        this.inRefPago.value = "";
        this.inDescOtro.value = "";
        this.inBuscar.value = "";
        this.selectCategoria.value = "Todas";
        this.cantidades.clear();
        
        this.errNomCliente.textContent = "";
        this.errNomCliente.style.display = "none";
        this.inNomCliente.classList.remove("is-invalid");
        this.inNomCliente.style.borderColor = "";

        this.errCedCliente.textContent = "";
        this.errCedCliente.style.display = "none";
        this.inCedCliente.classList.remove("is-invalid");
        this.inCedCliente.style.borderColor = "";

        this.errRefPagoMovil.textContent = "";
        this.errRefPagoMovil.style.display = "none";
        this.inRefPago.classList.remove("is-invalid");
        this.inRefPago.style.borderColor = "";

        this.cambiarMetodoPago();
        this.validarFormulario(false);
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
