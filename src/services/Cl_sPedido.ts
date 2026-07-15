import Cl_sPedidoApi from "./Cl_sPedidoApi.js";

export default class Cl_sPedido {
    private static TABLA = "Pedido";

    static async agregar(pedido: any): Promise<{ ok: boolean; mensaje: string }> {
        const registro = { ...pedido, tabla: this.TABLA };
        return await Cl_sPedidoApi.agregar(registro);
    }

    static async obtenerTodos(): Promise<{ ok: boolean; data: any[] }> {
        const result = await Cl_sPedidoApi.getTabla({ tabla: this.TABLA });
        return { ok: result.ok, data: result.tabla };
    }

    static async actualizarEstado(id: string, nuevoEstado: string): Promise<{ ok: boolean; mensaje: string }> {
        const data = { estado: nuevoEstado };
        return await Cl_sPedidoApi.actualizarPorId(id, data);
    }

    static async actualizar(id: string, datos: any): Promise<{ ok: boolean; mensaje: string }> {
        return await Cl_sPedidoApi.actualizarPorId(id, datos);
    }
}
