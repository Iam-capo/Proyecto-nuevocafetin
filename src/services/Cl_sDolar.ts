export default class Cl_sDolar {
    private static CACHE_KEY = "dolar_rate_cache";
    private static CACHE_EXPIRY = 60 * 1000; // 1
    private static DEFAULT_RATE = 607.39; // respaldo final

    static async obtenerTasa(): Promise<number> {
        try {
            const respuesta = await fetch("https://ve.dolarapi.com/v1/dolares");
            if (!respuesta.ok) {
                throw new Error(`API respondió con status: ${respuesta.status}`);
            }
            const data = await respuesta.json();
            let bcv = data.find((item: any) => item.fuente === "oficial" || item.fuente === "BCV");
            if (!bcv) {
                // si no hay BCV, tomar el primer elemento con promedio
                bcv = data.find((item: any) => typeof item.promedio === "number" && item.promedio > 0);
            }
            if (bcv && typeof bcv.promedio === "number" && bcv.promedio > 0) {
                const rate = bcv.promedio;
                // guardar en caché para futuros usos (por si falla la API)
                try {
                    localStorage.setItem(this.CACHE_KEY, JSON.stringify({ rate, timestamp: Date.now() }));
                } catch (_) {}
                return rate;
            } else {
                throw new Error("No se encontró una tasa válida en la respuesta");
            }
        } catch (error) {
            console.error("Error al consultar la API de ve.dolarapi.com:", error);
            // si falla, intentar usar caché (aunque esté caducada)
            try {
                const cached = localStorage.getItem(this.CACHE_KEY);
                if (cached) {
                    const { rate, timestamp } = JSON.parse(cached);
                    // si la caché tiene una tasa válida, la usamos aunque esté caducada
                    if (typeof rate === "number" && rate > 0) {
                        console.warn("Usando tasa de caché (posiblemente desactualizada)");
                        return rate;
                    }
                }
            } catch (_) {}
            // último recurso: tasa por defecto
            console.warn("Usando tasa por defecto");
            return this.DEFAULT_RATE;
        }
    }
}