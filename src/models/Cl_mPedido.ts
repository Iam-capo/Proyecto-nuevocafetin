export default class Cl_mPedido {
    private _id?: string;
    private _nomCliente: string = "";
    private _cedula: string = "";
    private _items: { codigo: string; nombre: string; precio: number; cantidad: number }[] = [];
    private _metodoPago: string = "";
    private _detallesPago: string = "";
    private _fecha: number = 0;
    private _estado: string = "Pendiente";

    constructor({ id, nomCliente, cedula, items, metodoPago, detallesPago, fecha, estado }: 
                { id?: string; nomCliente: string; cedula: string; items: any[]; metodoPago: string; detallesPago: string; fecha: number; estado?: string }) {
        this._id = id;
        this.nomCliente = nomCliente;
        this.cedula = cedula;
        this.items = items;
        this.metodoPago = metodoPago;
        this.detallesPago = detallesPago;
        this.fecha = fecha;
        if (estado) this.estado = estado;
    }

    get id(): string | undefined { return this._id; }
    set nomCliente(value: string) { this._nomCliente = value; }
    get nomCliente(): string { return this._nomCliente; }
    set cedula(value: string) {if (!value || value.trim() === "") {throw new Error("La cédula es obligatoria");}this._cedula = value.trim(); }
    get cedula(): string { return this._cedula; }
    set items(value: any[]) { this._items = value ?? []; }
    get items(): any[] { return this._items; }
    set metodoPago(value: string) { this._metodoPago = value; }
    get metodoPago(): string { return this._metodoPago; }
    set detallesPago(value: string) { this._detallesPago = value; }
    get detallesPago(): string { return this._detallesPago; }
    set fecha(value: number) { this._fecha = value; }
    get fecha(): number { return this._fecha; }
    set estado(value: string) { this._estado = value; }
    get estado(): string { return this._estado; }

    total(): number {
        return this.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    }

    cantidadTotal(): number {
        return this.items.reduce((sum, item) => sum + item.cantidad, 0);
    }

    toJSON() {
        return {
            NomCliente: this.nomCliente,
            Cedula: this.cedula,
            Items: this.items,
            Total: this.total,
            MetodoPago: this.metodoPago,
            DetallesPago: this.detallesPago,
            fecha: this.fecha,
            estado: this.estado
        };
    }
}