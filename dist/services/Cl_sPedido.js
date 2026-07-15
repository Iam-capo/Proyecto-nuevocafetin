import Cl_sPedidoApi from "./Cl_sPedidoApi.js";
export default class Cl_sPedido {
    static TABLA = "Pedido";
    static async agregar(pedido) {
        const registro = { ...pedido, tabla: this.TABLA };
        return await Cl_sPedidoApi.agregar(registro);
    }
    static async obtenerTodos() {
        const result = await Cl_sPedidoApi.getTabla({ tabla: this.TABLA });
        return { ok: result.ok, data: result.tabla };
    }
    static async actualizarEstado(id, nuevoEstado) {
        const data = { estado: nuevoEstado };
        return await Cl_sPedidoApi.actualizarPorId(id, data);
    }
    static async actualizar(id, datos) {
        return await Cl_sPedidoApi.actualizarPorId(id, datos);
    }
}
//# sourceMappingURL=Cl_sPedido.js.map