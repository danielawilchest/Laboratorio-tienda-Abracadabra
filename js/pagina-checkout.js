/* ==========================================================================
   pagina-checkout.js · Checkout en dos pasos
   begin_checkout (al abrir), add_shipping_info (Continuar al pago),
   add_payment_info (Pagar simulado). No se guarda nombre ni ningún dato personal.
   ========================================================================== */
(function () {
  "use strict";

  var PAISES = ["Colombia", "México", "Estados Unidos", "España", "Chile", "Perú", "Argentina", "Panamá"];
  var CLAVE_PEDIDO = "abracadabra_pedido";
  var AFILIACION = "Abracadabra muebles - Tienda web";

  var envioElegido = null;

  function $(id) { return document.getElementById(id); }
  function servicioActual() { return document.querySelector('input[name="servicio"]:checked').value; }

  function pintarTarifas() {
    var pais = $("pais").value;
    var nacional = pais === "Colombia";
    var est = window.Carrito.envio(pais, "Estándar");
    var exp = window.Carrito.envio(pais, "Express");
    $("precio-estandar").textContent = est.costo === 0 ? "Gratis" : window.fmtCOP(est.costo);
    $("precio-express").textContent = window.fmtCOP(exp.costo);
    $("plazo-estandar").textContent = nacional
      ? "Entrega nacional · gratis desde " + window.fmtCOP(window.Carrito.ENVIO_GRATIS_DESDE) + " en productos"
      : "Envío internacional";
    $("plazo-express").textContent = nacional ? "Entrega nacional prioritaria" : "Envío internacional prioritario";
  }

  function pintarResumen() {
    var lineas = window.Carrito.lineas();
    var conCupon = window.Carrito.cuponAplicado();
    var envio = window.Carrito.envio($("pais").value, servicioActual());
    var total = window.Carrito.totalProductos() + envio.costo;

    var filas = lineas.map(function (l) {
      var unit = conCupon ? l.producto.precio - window.Carrito.descuentoUnitario(l.producto) : l.producto.precio;
      return '<div class="fila"><span>' + l.cantidad + " × " + l.producto.nombre + "</span><span>" + window.fmtCOP(unit * l.cantidad) + "</span></div>";
    }).join("");

    $("resumen-checkout").innerHTML =
      "<h2>Tu pedido</h2>" + filas +
      '<div class="fila"><span>Subtotal</span><span>' + window.fmtCOP(window.Carrito.subtotal()) + "</span></div>" +
      (conCupon ? '<div class="fila descuento"><span>Descuento BIENVENIDA10</span><span>−' + window.fmtCOP(window.Carrito.descuento()) + "</span></div>" : "") +
      '<div class="fila"><span>Envío (' + envio.tier + ")</span><span>" + (envio.costo === 0 ? "Gratis" : window.fmtCOP(envio.costo)) + "</span></div>" +
      '<div class="fila total"><span>Total</span><span>' + window.fmtCOP(total) + "</span></div>";
  }

  function actualizarVista() { pintarTarifas(); pintarResumen(); }

  function mostrarPaso(n) {
    $("form-envio").hidden = n !== 1;
    $("form-pago").hidden = n !== 2;
    if (n === 2) {
      $("form-pago").classList.remove("animar-paso");
      void $("form-pago").offsetWidth;
      $("form-pago").classList.add("animar-paso");
    } else {
      $("form-envio").classList.remove("animar-paso");
      void $("form-envio").offsetWidth;
      $("form-envio").classList.add("animar-paso");
    }
    $("indicador-1").className = "paso " + (n === 1 ? "activo" : "hecho");
    $("indicador-2").className = "paso " + (n === 2 ? "activo" : "");
  }

  function nuevoIdTransaccion() {
    var azar = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "ABR-" + Date.now().toString(36).toUpperCase() + "-" + azar;
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.Carrito.lineas().length) {
      window.location.replace("carrito.html");
      return;
    }

    $("pais").innerHTML = PAISES.map(function (p) { return '<option value="' + p + '">' + p + "</option>"; }).join("");
    actualizarVista();
    $("pais").addEventListener("change", actualizarVista);
    document.querySelectorAll('input[name="servicio"]').forEach(function (r) {
      r.addEventListener("change", actualizarVista);
    });

    // begin_checkout: al abrir checkout.html.
    window.Analytics.enviarEvento("begin_checkout", window.Carrito.paramsCompra());

    // Paso 1 → add_shipping_info
    $("form-envio").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!$("nombre").value.trim()) { $("nombre").focus(); return; }   // el nombre solo se valida, nunca se guarda

      envioElegido = window.Carrito.envio($("pais").value, servicioActual());

      // Propiedad de usuario: Nacional / Internacional
      window.gtag("set", "user_properties", { tipo_cliente: envioElegido.tipo });

      var params = window.Carrito.paramsCompra();
      params.shipping_tier = envioElegido.tier;
      window.Analytics.enviarEvento("add_shipping_info", params);

      mostrarPaso(2);
    });

    $("volver-envio").addEventListener("click", function () { mostrarPaso(1); });

    // Paso 2 → add_payment_info y paso a gracias.html
    $("form-pago").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!envioElegido) { mostrarPaso(1); return; }
      $("btn-pagar").disabled = true;

      var pago = document.querySelector('input[name="pago"]:checked').value;
      var base = window.Carrito.paramsCompra();

      // El pedido viaja a gracias.html en sessionStorage (sin datos personales).
      var pedido = {
        transaction_id: nuevoIdTransaccion(),
        affiliation: AFILIACION,
        value: base.value,
        shipping: envioElegido.costo,
        coupon: base.coupon,
        tipo_cliente: envioElegido.tipo,
        items: base.items,
        enviado: false
      };
      try { sessionStorage.setItem(CLAVE_PEDIDO, JSON.stringify(pedido)); } catch (err) { /* nada */ }

      base.payment_type = pago;
      window.Analytics.enviarYNavegar("add_payment_info", base, "gracias.html");
    });
  });
})();
