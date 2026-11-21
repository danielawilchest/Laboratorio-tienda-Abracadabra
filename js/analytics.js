/* ==========================================================================
   analytics.js · Carga de GA4 y funciones de envío de eventos
   --------------------------------------------------------------------------
   - Solo carga gtag.js si el ID tiene formato G-... y no es el marcador.
   - Expone:
       Analytics.enviarEvento(nombre, params)
       Analytics.enviarYNavegar(nombre, params, url)
     (y Analytics.estado(), que usa el monitor para mostrar la conexión)
   - Todos los eventos llevan currency: "COP" (se agrega automáticamente).
   ========================================================================== */
(function () {
  "use strict";

  var cfg = window.TIENDA_CONFIG || {};
  var ID = String(cfg.GA_MEASUREMENT_ID || "").trim();
  var MARCADOR = "G-XXXXXXXXXX";
  var valido = /^G-[A-Z0-9]{4,}$/i.test(ID) && ID.toUpperCase() !== MARCADOR;
  var debug = cfg.DEBUG_MODE === true;

  // gtag siempre existe (solo empuja a dataLayer); la red solo se usa si hay ID válido.
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };

  // Quita valores undefined/null (por ejemplo, coupon cuando no hay cupón).
  function limpiar(valor) {
    if (Array.isArray(valor)) { return valor.map(limpiar); }
    if (valor && typeof valor === "object") {
      var r = {};
      Object.keys(valor).forEach(function (k) {
        if (valor[k] !== undefined && valor[k] !== null) { r[k] = limpiar(valor[k]); }
      });
      return r;
    }
    return valor;
  }

  function aMonitor(nombre, params) {
    try {
      if (window.MonitorEventos) { window.MonitorEventos.registrar(nombre, params); }
    } catch (e) { /* el monitor nunca debe romper la tienda */ }
  }

  function preparar(params) {
    var p = limpiar(params || {});
    if (!p.currency) { p.currency = "COP"; }
    return p;
  }

  // Envía un evento.
  function enviarEvento(nombre, params) {
    var p = preparar(params);
    aMonitor(nombre, p);
    window.gtag("event", nombre, p);
  }

  // Envía un evento y luego navega a url (cuando GA confirma o a más tardar a los 1200 ms).
  function enviarYNavegar(nombre, params, url) {
    var p = preparar(params);
    aMonitor(nombre, p);

    var navegado = false;
    function ir() {
      if (navegado) { return; }
      navegado = true;
      window.location.href = url;
    }

    if (!valido) {            // sin GA no hay nada que esperar
      window.gtag("event", nombre, p);
      ir();
      return;
    }

    var conCallback = Object.assign({}, p, { event_callback: ir, event_timeout: 1000 });
    window.gtag("event", nombre, conCallback);
    setTimeout(ir, 1200);     // respaldo si el callback nunca llega
  }

  // Carga de gtag.js solo con un ID real.
  if (valido) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
    document.head.appendChild(s);

    window.gtag("js", new Date());
    if (debug) {
      window.gtag("config", ID, { debug_mode: true });
    } else {
      window.gtag("config", ID);
    }
  }

  window.Analytics = {
    enviarEvento: enviarEvento,
    enviarYNavegar: enviarYNavegar,
    estado: function () { return { id: ID, valido: valido, debug: debug }; }
  };

  // page_view: GA4 lo envía solo al configurar; aquí además queda en el monitor.
  aMonitor("page_view", { page_title: document.title, page_location: window.location.href });
})();
