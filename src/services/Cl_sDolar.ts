export default class Cl_sDolar {
    private static CACHE_KEY = "dolar_rate_cache";
    private static CACHE_EXPIRY = 2 * 60 * 60 * 1000; // 2 horas
    private static DEFAULT_RATE = 596.78; // Tasa manual de respaldo por defecto

    static async obtenerTasa(): Promise<number> {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (cached) {
                const { rate, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < this.CACHE_EXPIRY && typeof rate === "number" && rate > 0) {
                    return rate;
                }
            }
        } catch (e) {
            console.warn("Error al leer la caché de tasa de cambio:", e);
        }

        try {
            const respuesta = await fetch("https://ve.dolarapi.com/v1/dolares/oficial");
            if (!respuesta.ok) {
                throw new Error(`API respondió con status: ${respuesta.status}`);
            }
            const data = await respuesta.json();
            const rate = data?.price;
            if (typeof rate === "number" && rate > 0) {
                localStorage.setItem(this.CACHE_KEY, JSON.stringify({ rate, timestamp: Date.now() }));
                return rate;
            } else {
                throw new Error("La respuesta de la API no contiene un precio de tasa válido");
            }
        } catch (error) {
            console.error("Error al consultar la API de ve.dolarapi.com. Se usará la tasa de respaldo:", error);
            try {
                const cached = localStorage.getItem(this.CACHE_KEY);
                if (cached) {
                    const { rate } = JSON.parse(cached);
                    if (typeof rate === "number" && rate > 0) {
                        return rate;
                    }
                }
            } catch (_) {}
            return this.DEFAULT_RATE;
        }
    }
}
