/* ==========================================================================
   monitor.js · Monitor de eventos (ayuda didáctica)
   Panel fijo a la derecha con: estado de la conexión, origen de la visita (UTM),
   los últimos 12 eventos (persisten entre páginas) y el botón "Simular nuevo visitante".
   ========================================================================== */
(function () {
  "use strict";

  var K_EVENTOS = "abracadabra_monitor_eventos";
  var K_ORIGEN = "abracadabra_monitor_origen";
  var K_OCULTO = "abracadabra_monitor_oculto";
  var K_CARRITO = "abracadabra_carrito";
  var MAX = 12;

  function leerJSON(almacen, clave, defecto) {
    try {
      var v = JSON.parse(almacen.getItem(clave));
      return v === null || v === undefined ? defecto : v;
    } catch (e) { return defecto; }
  }
  function escribir(almacen, clave, valor) {
    try { almacen.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento */ }
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function dinero(n) { return "$" + Number(n).toLocaleString("es-CO"); }
  function hora(d) {
    function dos(n) { return (n < 10 ? "0" : "") + n; }
    return dos(d.getHours()) + ":" + dos(d.getMinutes()) + ":" + dos(d.getSeconds());
  }

  // ---------- Origen de la visita (primera página de la sesión) ----------
  function obtenerOrigen() {
    var o = leerJSON(sessionStorage, K_ORIGEN, null);
    if (!o) {
      var q = new URLSearchParams(window.location.search);
      var s = q.get("utm_source"), m = q.get("utm_medium"), c = q.get("utm_campaign");
      o = (s || m || c) ? { s: s, m: m, c: c } : { directo: true };
      escribir(sessionStorage, K_ORIGEN, o);
    }
    return o;
  }
  function textoOrigen() {
    var o = obtenerOrigen();
    if (o.directo) { return "directo (sin UTM)"; }
    return (o.s || "—") + " / " + (o.m || "—") + " · " + (o.c || "—");
  }

  // ---------- Resumen legible de un evento ----------
  function resumen(nombre, p) {
    var partes = [];
    if (nombre === "page_view") {
      var ruta = "";
      try { ruta = new URL(p.page_location).pathname.split("/").pop() || "index.html"; } catch (e) { ruta = ""; }
      return ruta + (p.page_title ? " · " + p.page_title : "");
    }
    if (p.promotion_id) { partes.push("promoción " + p.promotion_id); }
    if (p.item_list_name && !p.promotion_id) { partes.push("lista: " + p.item_list_name); }
    if (p.items && p.items.length) {
      var unidades = p.items.reduce(function (s, i) { return s + (i.quantity || 0); }, 0);
      var nombres = p.items.slice(0, 2).map(function (i) { return i.item_name; }).join(", ");
      if (p.items.length > 2) { nombres += " +" + (p.items.length - 2) + " más"; }
      partes.push(unidades + " ud · " + nombres);
    }
    if (p.value !== undefined) { partes.push("valor " + dinero(p.value)); }
    if (p.shipping !== undefined) { partes.push("envío " + dinero(p.shipping)); }
    if (p.shipping_tier) { partes.push(p.shipping_tier); }
    if (p.payment_type) { partes.push(p.payment_type); }
    if (p.coupon) { partes.push("cupón " + p.coupon); }
    if (p.transaction_id) { partes.push(p.transaction_id); }
    if (p.tipo_cliente) { partes.push("cliente " + p.tipo_cliente); }
    return partes.join(" · ");
  }

  // ---------- Registro de eventos ----------
  var pintarLista = null;

  function registrar(nombre, params) {
    var lista = leerJSON(sessionStorage, K_EVENTOS, []);
    lista.push({ t: hora(new Date()), n: nombre, r: resumen(nombre, params || {}) });
    if (lista.length > MAX) { lista = lista.slice(lista.length - MAX); }
    escribir(sessionStorage, K_EVENTOS, lista);
    if (pintarLista) { pintarLista(); }
  }

  // ---------- Simular nuevo visitante ----------
  function borrarCookiesGA() {
    var host = window.location.hostname;
    var partes = host.split(".");
    var dominios = [host, "." + host];
    for (var i = 1; i < partes.length - 1; i++) {
      var d = partes.slice(i).join(".");
      dominios.push(d, "." + d);
    }
    document.cookie.split(";").forEach(function (c) {
      var nombre = c.split("=")[0].trim();
      if (nombre.indexOf("_ga") !== 0) { return; }
      var caducada = nombre + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = caducada;                       // cookie sin dominio explícito
      dominios.forEach(function (d) { document.cookie = caducada + "; domain=" + d; });
    });
  }
  function simularNuevoVisitante() {
    borrarCookiesGA();
    try { localStorage.removeItem(K_CARRITO); } catch (e) { /* nada */ }
    try { sessionStorage.clear(); } catch (e) { /* nada */ }
    window.location.href = "index.html";
  }

  // ---------- Panel ----------
  function montar() {
    var est = (window.Analytics && window.Analytics.estado) ? window.Analytics.estado() : { valido: false };
    var estadoTexto, estadoClase;
    if (est.valido) {
      estadoTexto = "Conectado a " + est.id + (est.debug ? " · modo depuración" : " · sin modo depuración");
      estadoClase = "ok";
    } else {
      estadoTexto = "Sin ID de medición: los eventos solo se muestran aquí. Edita js/config.js.";
      estadoClase = "error";
    }

    var panel = document.createElement("aside");
    panel.id = "monitor-eventos";
    panel.setAttribute("aria-label", "Monitor de eventos de Google Analytics 4");
    panel.innerHTML =
      '<div class="monitor-barra"><strong>Monitor de eventos</strong>' +
      '<button type="button" id="monitor-toggle"></button></div>' +
      '<div class="monitor-cuerpo">' +
      '<div class="monitor-estado ' + estadoClase + '" id="monitor-estado">' + esc(estadoTexto) + "</div>" +
      '<div class="monitor-bloque"><h4>Origen de la visita</h4><p id="monitor-origen">' + esc(textoOrigen()) + "</p></div>" +
      '<div class="monitor-bloque monitor-bloque-lista"><h4>Últimos ' + MAX + " eventos</h4>" +
      '<ol id="monitor-lista"></ol></div>' +
      '<button type="button" id="monitor-reset">Simular nuevo visitante</button>' +
      "</div>";
    document.body.appendChild(panel);

    var boton = panel.querySelector("#monitor-toggle");
    var lista = panel.querySelector("#monitor-lista");

    function aplicarEstado(oculto) {
      document.body.classList.toggle("monitor-oculto", oculto);
      panel.classList.toggle("plegado", oculto);
      boton.textContent = oculto ? "Mostrar monitor" : "Ocultar";
      boton.setAttribute("aria-expanded", oculto ? "false" : "true");
    }
    var oculto = false;
    try { oculto = localStorage.getItem(K_OCULTO) === "1"; } catch (e) { oculto = false; }
    aplicarEstado(oculto);

    boton.addEventListener("click", function () {
      oculto = !oculto;
      try { localStorage.setItem(K_OCULTO, oculto ? "1" : "0"); } catch (e) { /* nada */ }
      aplicarEstado(oculto);
    });
    panel.querySelector("#monitor-reset").addEventListener("click", simularNuevoVisitante);

    pintarLista = function () {
      var datos = leerJSON(sessionStorage, K_EVENTOS, []).slice().reverse();   // más reciente primero
      if (!datos.length) {
        lista.innerHTML = '<li class="monitor-vacio">Aún no hay eventos.</li>';
        return;
      }
      lista.innerHTML = datos.map(function (e) {
        return '<li><span class="m-hora">' + esc(e.t) + '</span><b class="m-nombre">' + esc(e.n) + "</b>" +
          (e.r ? '<span class="m-res">' + esc(e.r) + "</span>" : "") + "</li>";
      }).join("");
    };
    pintarLista();
  }

  obtenerOrigen();   // fija el origen en la primera página de la sesión

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montar);
  } else {
    montar();
  }

  window.MonitorEventos = { registrar: registrar };
})();
