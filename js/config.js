/* ==========================================================================
   ABRACADABRA MUEBLES · CONFIGURACIÓN
   Este es el ÚNICO archivo que debes editar.
   ==========================================================================

   DÓNDE PEGAR TU ID DE MEDICIÓN DE GOOGLE ANALYTICS 4
   ---------------------------------------------------
   1. Entra a https://analytics.google.com
   2. Administrar (engranaje) → Flujos de datos → elige tu flujo Web.
   3. Copia el "ID de medición" (empieza por G- y tiene 10 caracteres).
   4. Pégalo abajo, reemplazando G-XXXXXXXXXX, SIN borrar las comillas.

   Ejemplo:  GA_MEASUREMENT_ID: "G-AB12CD34EF",

   Mientras el valor siga siendo G-XXXXXXXXXX, NO se carga Google Analytics:
   la tienda funciona igual y el monitor de eventos (panel derecho) muestra
   los eventos, pero no se envía nada a GA4.

   DEBUG_MODE
   ----------
   true  → los eventos se envían con debug_mode y los verás en GA4 →
           Administrar → DebugView (casi en tiempo real). Úsalo en el laboratorio.
   false → se envían sin debug_mode (tráfico normal; no aparece en DebugView).
*/
window.TIENDA_CONFIG = {
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX", // ← pega aquí tu ID de medición
  DEBUG_MODE: true                    // true = modo depuración | false = normal
};
