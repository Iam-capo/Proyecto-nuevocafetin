export default class Cl_mProducto {
    _id;
    _codigo = "";
    _nombre = "";
    _categoria = "";
    _precio = 0;
    _imagen = "";
    _cantidad_disponible = 0;
    constructor({ id, codigo, nombre, categoria, precio, imagen, cantidad_disponible = 0 }) {
        this._id = id;
        this.codigo = codigo;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this._imagen = imagen;
        this.cantidad_disponible = cantidad_disponible;
    }
    get id() { return this._id; }
    set codigo(value) { this._codigo = value; }
    get codigo() { return this._codigo; }
    set nombre(value) { this._nombre = value; }
    get nombre() { return this._nombre; }
    set categoria(value) { this._categoria = value; }
    get categoria() { return this._categoria; }
    set precio(value) { this._precio = value; }
    get precio() { return this._precio; }
    set imagen(value) { this._imagen = value; }
    get imagen() { return this._imagen; }
    set cantidad_disponible(value) { this._cantidad_disponible = value; }
    get cantidad_disponible() { return this._cantidad_disponible; }
    toJSON() {
        return {
            tabla: "producto",
            codigo: this.codigo,
            nombre: this.nombre,
            categoria: this.categoria,
            precio: this.precio,
            imagen: this.imagen,
            cantidad_disponible: this.cantidad_disponible
        };
    }
}
//# sourceMappingURL=Cl_mProducto.js.map