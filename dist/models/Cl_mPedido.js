export default class Cl_mPedido {
    _id;
    _nomCliente = "";
    _cedula = "";
    _items = [];
    _metodoPago = "";
    _detallesPago = "";
    _fecha = "";
    _estado = "Pendiente";
    _totalUSD = 0;
    _totalBs = 0;
    static _tasaActual = 40.0;
    static set tasaActual(value) { this._tasaActual = value; }
    static get tasaActual() { return this._tasaActual; }
    constructor({ id, nomCliente, cedula, items, metodoPago, detallesPago, fecha, estado, totalUSD, totalBs }) {
        this._id = id;
        this.nomCliente = nomCliente;
        this.cedula = cedula;
        this.items = items;
        this.metodoPago = metodoPago;
        this.detallesPago = detallesPago;
        this.fecha = fecha;
        if (estado)
            this.estado = estado;
        this._totalUSD = totalUSD ?? 0;
        this._totalBs = totalBs ?? 0;
    }
    get id() { return this._id; }
    set nomCliente(value) { this._nomCliente = value; }
    get nomCliente() { return this._nomCliente; }
    set cedula(value) { if (!value || value.trim() === "") {
        throw new Error("La cédula es obligatoria");
    } this._cedula = value.trim(); }
    get cedula() { return this._cedula; }
    set items(value) { this._items = value ?? []; }
    get items() { return this._items; }
    set metodoPago(value) { this._metodoPago = value; }
    get metodoPago() { return this._metodoPago; }
    set detallesPago(value) { this._detallesPago = value; }
    get detallesPago() { return this._detallesPago; }
    set fecha(value) { this._fecha = value; }
    get fecha() { return this._fecha; }
    set estado(value) { this._estado = value; }
    get estado() { return this._estado; }
    get totalUSD() {
        return this.total();
    }
    total() {
        if (this._totalUSD > 0) {
            return parseFloat(this._totalUSD.toFixed(2));
        }
        const t = this.items.reduce((sum, item) => {
            const itemTotal = parseFloat((item.precio * item.cantidad).toFixed(2));
            return sum + itemTotal;
        }, 0);
        return parseFloat(t.toFixed(2));
    }
    cantidadTotal() {
        return this.items.reduce((sum, item) => sum + item.cantidad, 0);
    }
    calcularTotalEnBs(tasa) {
        if (this._totalBs > 0) {
            return parseFloat(this._totalBs.toFixed(2));
        }
        const t = tasa || Cl_mPedido.tasaActual;
        const totalBs = this.total() * t;
        return parseFloat(totalBs.toFixed(2));
    }
    get totalEnBs() {
        return this.calcularTotalEnBs();
    }
    get TotalBs() {
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
//# sourceMappingURL=Cl_mPedido.js.map