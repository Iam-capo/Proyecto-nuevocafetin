export default class Cl_mProducto {
    private _id?: string;
    private _codigo: string = "";
    private _nombre: string = "";
    private _categoria: string = "";
    private _precio: number = 0;
    private _imagen: string = "";
    private _cantidad_disponible: number = 0;

    constructor({ id, codigo, nombre, categoria, precio, imagen, cantidad_disponible = 0 }: 
                { id?: string; codigo: string; nombre: string; categoria: string; precio: number; imagen: string; cantidad_disponible?: number }) {
        this._id = id;
        this.codigo = codigo;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this._imagen = imagen;
        this.cantidad_disponible = cantidad_disponible;
    }

    get id(): string | undefined { return this._id; }
    set codigo(value: string) { this._codigo = value; }
    get codigo(): string { return this._codigo; }
    set nombre(value: string) { this._nombre = value; }
    get nombre(): string { return this._nombre; }
    set categoria(value: string) { this._categoria = value; }
    get categoria(): string { return this._categoria; }
    set precio(value: number) { this._precio = value; }
    get precio(): number { return this._precio; }
    set imagen(value: string) { this._imagen = value; }
    get imagen(): string { return this._imagen; }
    set cantidad_disponible(value: number) { this._cantidad_disponible = value; }
    get cantidad_disponible(): number { return this._cantidad_disponible; }

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
