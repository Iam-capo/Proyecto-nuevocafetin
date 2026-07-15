export default class Cl_mCarrito {
    items = [];
    getItems() {
        return [...this.items];
    }
    // En Cl_mCarrito.ts
    agregar(producto, cantidad) {
        const existente = this.items.find(item => item.codigo === producto.codigo);
        if (existente) {
            existente.cantidad += cantidad;
            // Si la cantidad llega a 0, eliminamos el item del carrito
            if (existente.cantidad <= 0) {
                this.eliminar(producto.codigo);
            }
        }
        else if (cantidad > 0) {
            this.items.push({
                codigo: producto.codigo,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: cantidad
            });
        }
    }
    eliminar(codigo) {
        this.items = this.items.filter(item => item.codigo !== codigo);
    }
    vaciar() {
        this.items = [];
    }
    calcularTotal() {
        const total = this.items.reduce((sum, item) => {
            const itemTotal = parseFloat((item.precio * item.cantidad).toFixed(2));
            return sum + itemTotal;
        }, 0);
        return parseFloat(total.toFixed(2));
    }
    calcularTotalEnBs(tasa) {
        const totalBs = this.calcularTotal() * tasa;
        return parseFloat(totalBs.toFixed(2));
    }
    estaVacio() {
        return this.items.length === 0;
    }
    getItemsParaEnvio() {
        return this.items.map(item => ({ ...item }));
    }
}
//# sourceMappingURL=Cl_mCarrito.js.map