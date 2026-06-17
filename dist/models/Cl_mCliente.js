export default class Cl_mCliente {
    _cedula = "";
    _nombre = "";
    constructor({ cedula, nombre }) {
        this.cedula = cedula;
        this.nombre = nombre;
    }
    get cedula() {
        return this._cedula;
    }
    set cedula(value) {
        if (!value || value.trim() === "") {
            throw new Error("La cédula es obligatoria");
        }
        this._cedula = value.trim();
    }
    get nombre() {
        return this._nombre;
    }
    set nombre(value) {
        if (!value || value.trim() === "") {
            throw new Error("El nombre es obligatorio");
        }
        this._nombre = value.trim();
    }
    toJSON() {
        return {
            cedula: this.cedula,
            nombre: this.nombre
        };
    }
}
//# sourceMappingURL=Cl_mCliente.js.map