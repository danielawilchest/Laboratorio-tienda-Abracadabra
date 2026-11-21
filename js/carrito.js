/* ==========================================================================
   carrito.js · Carrito (localStorage), cupón, tarifas de envío y armado de ítems
   ========================================================================== */
(function () {
  "use strict";

  var CLAVE = "abracadabra_carrito";
  var CUPON = "BIENVENIDA10";
  var PORCENTAJE = 0.10;
  var ENVIO_GRATIS_DESDE = 150000;   // Nacional Estándar, en valor de productos
  var TARIFAS = {
    "Nacional - Estándar": 12000,
    "Nacional - Express": 25000,
    "Internacional - Estándar": 95000,
    "Internacional - Express": 160000
  };

  var formato = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
  window.fmtCOP = function (n) { return formato.format(n); };

  // ---------- Estado ----------
  function leer() {
    try {
      var r = JSON.parse(localStorage.getItem(CLAVE));
      if (r && Array.isArray(r.lineas)) { return r; }
    } catch (e) { /* estado vacío */ }
    return { lineas: [], cupon: null };
  }
  function guardar(estado) {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ }
    actualizarContador(true);
  }
  function cuponAplicado() { return leer().cupon === CUPON; }

  function lineas() {
    return leer().lineas.map(function (l) {
      return { producto: window.CATALOGO.buscar(l.id), cantidad: l.cantidad };
    }).filter(function (l) { return l.producto && l.cantidad > 0; });
  }
  function cantidadTotal() {
    return lineas().reduce(function (s, l) { return s + l.cantidad; }, 0);
  }

  // ---------- Importes ----------
  function descuentoUnitario(p) { return Math.round(p.precio * PORCENTAJE); }
  function subtotal() {
    return lineas().reduce(function (s, l) { return s + l.producto.precio * l.cantidad; }, 0);
  }
  function descuento() {
    if (!cuponAplicado()) { return 0; }
    return lineas().reduce(function (s, l) { return s + descuentoUnitario(l.producto) * l.cantidad; }, 0);
  }
  function totalProductos() { return subtotal() - descuento(); }

  // ---------- Ítems para GA4 ----------
  // Con cupón: price = precio unitario con descuento, discount = descuento por unidad, coupon.
  function itemEvento(p, cantidad, indice, conCupon, extra) {
    var d = descuentoUnitario(p);
    var it = {
      item_id: p.id,
      item_name: p.nombre,
      item_brand: window.CATALOGO.marca,
      item_category: p.categoria,
      price: conCupon ? p.precio - d : p.precio,
      quantity: cantidad,
      index: indice
    };
    if (conCupon) { it.discount = d; it.coupon = CUPON; }
    if (extra) { Object.keys(extra).forEach(function (k) { it[k] = extra[k]; }); }
    return it;
  }
  function items() {
    var c = cuponAplicado();
    return lineas().map(function (l, i) { return itemEvento(l.producto, l.cantidad, i, c); });
  }
  function valorItems(lista) {
    return lista.reduce(function (s, i) { return s + i.price * i.quantity; }, 0);
  }
  // Parámetros comunes de view_cart, begin_checkout, add_shipping_info y add_payment_info.
  function paramsCompra() {
    var its = items();
    return { value: valorItems(its), coupon: cuponAplicado() ? CUPON : undefined, items: its };
  }

  // ---------- Operaciones (con sus eventos) ----------
  function emitir(nombre, params) {
    if (window.Analytics) { window.Analytics.enviarEvento(nombre, params); }
  }

  function agregar(id, n) {
    var p = window.CATALOGO.buscar(id);
    n = n || 1;
    if (!p) { return; }
    var e = leer(), l = null;
    e.lineas.forEach(function (x) { if (x.id === id) { l = x; } });
    if (l) { l.cantidad += n; } else { e.lineas.push({ id: id, cantidad: n }); }
    guardar(e);
    var it = itemEvento(p, n, 0, e.cupon === CUPON);
    emitir("add_to_cart", { value: it.price * n, items: [it] });
  }

  function disminuir(id, n) {
    var p = window.CATALOGO.buscar(id);
    if (!p) { return; }
    var e = leer(), l = null;
    e.lineas.forEach(function (x) { if (x.id === id) { l = x; } });
    if (!l) { return; }
    n = Math.min(n || 1, l.cantidad);
    l.cantidad -= n;
    e.lineas = e.lineas.filter(function (x) { return x.cantidad > 0; });
    guardar(e);
    var it = itemEvento(p, n, 0, e.cupon === CUPON);
    emitir("remove_from_cart", { value: it.price * n, items: [it] });
  }

  function quitar(id) {
    var e = leer(), l = null;
    e.lineas.forEach(function (x) { if (x.id === id) { l = x; } });
    if (l) { disminuir(id, l.cantidad); }
  }

  function aplicarCupon(codigo) {
    if (String(codigo || "").trim().toUpperCase() !== CUPON) { return false; }
    var e = leer();
    e.cupon = CUPON;
    guardar(e);
    return true;
  }
  function quitarCupon() {
    var e = leer();
    e.cupon = null;
    guardar(e);
  }
  function vaciar() {
    try { localStorage.removeItem(CLAVE); } catch (e) { /* nada */ }
    actualizarContador();
  }

  // ---------- Envío ----------
  function envio(pais, servicio) {
    var tipo = pais === "Colombia" ? "Nacional" : "Internacional";
    var tier = tipo + " - " + servicio;
    var costo = TARIFAS[tier];
    if (tier === "Nacional - Estándar" && totalProductos() >= ENVIO_GRATIS_DESDE) { costo = 0; }
    return { tipo: tipo, tier: tier, costo: costo };
  }

  // ---------- Contador del encabezado ----------
  function actualizarContador(animar) {
    var el = document.getElementById("contador-carrito");
    if (!el) { return; }
    var n = cantidadTotal();
    el.textContent = n;
    el.classList.toggle("sin-items", n === 0);
    if (animar && n > 0) {
      el.classList.remove("pop");
      void el.offsetWidth;
      el.classList.add("pop");
    }
  }
  document.addEventListener("DOMContentLoaded", function () { actualizarContador(false); });

  window.Carrito = {
    CUPON: CUPON,
    PORCENTAJE: PORCENTAJE,
    ENVIO_GRATIS_DESDE: ENVIO_GRATIS_DESDE,
    TARIFAS: TARIFAS,
    lineas: lineas,
    cantidadTotal: cantidadTotal,
    subtotal: subtotal,
    descuento: descuento,
    totalProductos: totalProductos,
    descuentoUnitario: descuentoUnitario,
    cuponAplicado: cuponAplicado,
    itemEvento: itemEvento,
    items: items,
    valorItems: valorItems,
    paramsCompra: paramsCompra,
    agregar: agregar,
    disminuir: disminuir,
    quitar: quitar,
    aplicarCupon: aplicarCupon,
    quitarCupon: quitarCupon,
    vaciar: vaciar,
    envio: envio
  };
})();
