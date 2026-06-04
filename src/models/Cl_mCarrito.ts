export type CarritoItem = {
    codigo: string;
    nombre: string;
    precio: number;
    cantidad: number;
};

export default class Cl_mCarrito {
    private items: CarritoItem[] = [];

    getItems(): CarritoItem[] {
        return [...this.items];
    }

    // En Cl_mCarrito.ts
agregar(producto: { codigo: string; nombre: string; precio: number }, cantidad: number): void {
    const existente = this.items.find(item => item.codigo === producto.codigo);
    
    if (existente) {
        existente.cantidad += cantidad;
        // Si la cantidad llega a 0, eliminamos el item del carrito
        if (existente.cantidad <= 0) {
            this.eliminar(producto.codigo);
        }
    } else if (cantidad > 0) {
        this.items.push({
            codigo: producto.codigo,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: cantidad
        });
    }
}

    eliminar(codigo: string): void {
        this.items = this.items.filter(item => item.codigo !== codigo);
    }

    vaciar(): void {
        this.items = [];
    }

    calcularTotal(): number {
        return this.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    }

    estaVacio(): boolean {
        return this.items.length === 0;
    }

    getItemsParaEnvio(): CarritoItem[] {
        return this.items.map(item => ({ ...item }));
    }
}