/* ==========================================================================
   pagina-gracias.js · Confirmación y evento purchase (una sola vez por pedido)
   ========================================================================== */
(function () {
  "use strict";

  var CLAVE_PEDIDO = "abracadabra_pedido";

  function leerPedido() {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_PEDIDO)); } catch (e) { return null; }
  }
  function guardarPedido(p) {
    try { sessionStorage.setItem(CLAVE_PEDIDO, JSON.stringify(p)); } catch (e) { /* nada */ }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var cont = document.getElementById("gracias-contenido");
    var pedido = leerPedido();

    if (!pedido || !pedido.transaction_id) {
      cont.innerHTML =
        '<div class="vacio"><p>No hay un pedido reciente para confirmar.</p><a class="btn" href="index.html">Ir al catálogo</a></div>';
      return;
    }

    var yaEnviado = pedido.enviado === true;

    if (!yaEnviado) {
      // Propiedad de usuario antes de purchase.
      window.gtag("set", "user_properties", { tipo_cliente: pedido.tipo_cliente });

      window.Analytics.enviarEvento("purchase", {
        transaction_id: pedido.transaction_id,
        affiliation: pedido.affiliation,
        value: pedido.value,          // productos con descuento, sin envío
        shipping: pedido.shipping,
        coupon: pedido.coupon,
        tipo_cliente: pedido.tipo_cliente,
        items: pedido.items
      });

      // Marcar como enviado: recargar esta página no repite purchase.
      pedido.enviado = true;
      guardarPedido(pedido);
      window.Carrito.vaciar();
    }

    var filas = pedido.items.map(function (i) {
      return '<div class="fila"><span>' + i.quantity + " × " + i.item_name + "</span><span>" + window.fmtCOP(i.price * i.quantity) + "</span></div>";
    }).join("");

    cont.innerHTML =
      '<div class="check" aria-hidden="true">✓</div>' +
      "<h1>¡Gracias por tu compra simulada!</h1>" +
      '<p class="lead">Pedido <span class="codigo">' + pedido.transaction_id + "</span> · cliente " + pedido.tipo_cliente.toLowerCase() + ".</p>" +
      '<div class="panel resumen"><h2>Resumen</h2>' + filas +
      '<div class="fila"><span>Productos' + (pedido.coupon ? " (con " + pedido.coupon + ")" : "") + "</span><span>" + window.fmtCOP(pedido.value) + "</span></div>" +
      '<div class="fila"><span>Envío</span><span>' + (pedido.shipping === 0 ? "Gratis" : window.fmtCOP(pedido.shipping)) + "</span></div>" +
      '<div class="fila total"><span>Total</span><span>' + window.fmtCOP(pedido.value + pedido.shipping) + "</span></div></div>" +
      '<p class="privacidad">' + (yaEnviado
        ? "Este pedido ya se había registrado: al recargar no se envía otro evento purchase."
        : "Evento purchase enviado. Si recargas esta página, no se repetirá.") + "</p>" +
      '<p style="margin-top:22px"><a class="btn" href="index.html">Seguir explorando</a></p>';
  });
})();
