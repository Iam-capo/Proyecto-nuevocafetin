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
    errNomCliente;
    errCedCliente;
    errRefPagoMovil;
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
        this.errNomCliente = document.getElementById("errNomCliente");
        this.errCedCliente = document.getElementById("errCedCliente");
        this.errRefPagoMovil = document.getElementById("errRefPagoMovil");
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
            }
            else {
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
    validarNombre(mostrarError = true) {
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
    validarCedula(mostrarError = true) {
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
    validarPagoMovil(mostrarError = true) {
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
    validarFormulario(mostrarError = true) {
        const nomValido = this.validarNombre(mostrarError);
        const cedValida = this.validarCedula(mostrarError);
        const pagoMovilValido = this.validarPagoMovil(mostrarError);
        const esValido = nomValido && cedValida && pagoMovilValido;
        this.btEnviar.disabled = !esValido;
        return esValido;
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
            const img = div.querySelector("img");
            img.onerror = () => {
                img.src = "img/placeholder.png";
            };
            const display = div.querySelector(`#cant-${prod.codigo}`);
            div.querySelector(".btn-plus").addEventListener("click", () => {
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