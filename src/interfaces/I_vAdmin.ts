export default interface I_vAdmin {
    mostrarPedidos(pedidos: any[]): void;
    mostrarProductos(productos: any[]): void;
    onProcesarPedido(callback: (id: string) => void): void;
    onCancelarPedido(callback: (id: string) => void): void;
    onFiltrarPedidos(callback: (filtros: any) => void): void;
    onGuardarProducto(callback: (producto: any) => void): void;
    onEliminarProducto(callback: (id: string) => void): void;
    mostrarModal(tipo: "success" | "danger" | "warning", mensaje: string): void;
    
    mostrarReportes(datos: { 
        recaudacionDiariaUSD: number;
        recaudacionDiariaBS: number; 
        masVendido: { nombre: string; cantidad: number } | null; 
        mayorIngreso: { nombre: string; totalUSD: number; totalBS: number } | null; 
    }): void;
    llenarSelectorProductosAnalisis(productos: any[]): void;
    onAnalizarProducto(callback: (codigo: string) => void): void;
    mostrarAnalisisProducto(unidades: number, ingresosUSD: number, ingresosBS: number): void;
    setTasa(tasa: number): void;
}
