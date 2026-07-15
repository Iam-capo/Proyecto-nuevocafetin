import Cl_sDolar from "./Cl_sDolar.js";

export default class Cl_sTasa {
    static async obtenerTasa(): Promise<number> {
        return await Cl_sDolar.obtenerTasa();
    }
}
