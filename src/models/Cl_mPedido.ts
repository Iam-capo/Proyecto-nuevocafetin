export default class Cl_mPedido {
    private _id?: string;
    private _nomCliente: string = "";
    private _cedula: string = "";
    private _items: { codigo: string; nombre: string; precio: number; cantidad: number }[] = [];
    private _metodoPago: string = "";
    private _detallesPago: string = "";
    private _fecha: string | number = "";
    private _estado: string = "Pendiente";
    private _totalUSD: number = 0;
    private _totalBs: number = 0;

    private static _tasaActual: number = 40.0;
    static set tasaActual(value: number) { this._tasaActual = value; }
    static get tasaActual(): number { return this._tasaActual; }

    constructor({ id, nomCliente, cedula, items, metodoPago, detallesPago, fecha, estado, totalUSD, totalBs }: 
                { id?: string; nomCliente: string; cedula: string; items: any[]; metodoPago: string; detallesPago: string; fecha: string | number; estado?: string; totalUSD?: number; totalBs?: number }) {
        this._id = id;
        this.nomCliente = nomCliente;
        this.cedula = cedula;
        this.items = items;
        this.metodoPago = metodoPago;
        this.detallesPago = detallesPago;
        this.fecha = fecha;
        if (estado) this.estado = estado;
        this._totalUSD = totalUSD ?? 0;
        this._totalBs = totalBs ?? 0;
    }

    get id(): string | undefined { return this._id; }
    set nomCliente(value: string) { this._nomCliente = value; }
    get nomCliente(): string { return this._nomCliente; }
    set cedula(value: string) { if (!value || value.trim() === "") { throw new Error("La cédula es obligatoria"); } this._cedula = value.trim(); }
    get cedula(): string { return this._cedula; }
    set items(value: any[]) { this._items = value ?? []; }
    get items(): any[] { return this._items; }
    set metodoPago(value: string) { this._metodoPago = value; }
    get metodoPago(): string { return this._metodoPago; }
    set detallesPago(value: string) { this._detallesPago = value; }
    get detallesPago(): string { return this._detallesPago; }
    set fecha(value: string | number) { this._fecha = value; }
    get fecha(): string | number { return this._fecha; }
    set estado(value: string) { this._estado = value; }
    get estado(): string { return this._estado; }

    get totalUSD(): number {
        return this.total();
    }

    total(): number {
        if (this._totalUSD > 0) {
            return parseFloat(this._totalUSD.toFixed(2));
        }
        const t = this.items.reduce((sum, item) => {
            const itemTotal = parseFloat((item.precio * item.cantidad).toFixed(2));
            return sum + itemTotal;
        }, 0);
        return parseFloat(t.toFixed(2));
    }

    cantidadTotal(): number {
        return this.items.reduce((sum, item) => sum + item.cantidad, 0);
    }

    calcularTotalEnBs(tasa?: number): number {
        if (this._totalBs > 0) {
            return parseFloat(this._totalBs.toFixed(2));
        }
        const t = tasa || Cl_mPedido.tasaActual;
        const totalBs = this.total() * t;
        return parseFloat(totalBs.toFixed(2));
    }

    get totalEnBs(): number {
        return this.calcularTotalEnBs();
    }

    get TotalBs(): number {
        return this.totalEnBs;
    }

    toJSON() {
        return {
            NomCliente: this.nomCliente,
            Cedula: this.cedula,
            Items: this.items,
            Total: this.total(),
            TotalBs: this.totalEnBs,
            MetodoPago: this.metodoPago,
            DetallesPago: this.detallesPago,
            fecha: this.fecha,
            estado: this.estado
        };
    }
}
