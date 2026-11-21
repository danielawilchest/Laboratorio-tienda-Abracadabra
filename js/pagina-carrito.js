/* ==========================================================================
   pagina-carrito.js · Carrito: view_cart, add_to_cart, remove_from_cart y cupón
   ========================================================================== */
(function () {
  "use strict";

  var mensaje = { texto: "", tipo: "" };

  function pintar() {
    var cont = document.getElementById("carrito-contenido");
    var lineas = window.Carrito.lineas();

    if (!lineas.length) {
      cont.innerHTML = '<div class="vacio"><p>Tu carrito está vacío.</p><a class="btn" href="index.html">Ver catálogo</a></div>';
      return;
    }

    var conCupon = window.Carrito.cuponAplicado();

    var filas = lineas.map(function (l) {
      var p = l.producto;
      var unit = conCupon ? p.precio - window.Carrito.descuentoUnitario(p) : p.precio;
      return '<div class="linea">' +
        window.CATALOGO.visual(p, "mini") +
        '<div class="linea-info"><span class="categoria">' + p.categoria + "</span>" +
        '<h3><a href="producto.html?id=' + p.id + '" style="color:inherit">' + p.nombre + "</a></h3>" +
        '<div class="linea-precio">' + window.fmtCOP(unit) +
        (conCupon ? '<span class="precio-tachado">' + window.fmtCOP(p.precio) + "</span>" : "") + " c/u</div>" +
        '<button type="button" class="btn-texto" data-accion="quitar" data-id="' + p.id + '">Quitar</button></div>' +
        '<div class="cantidad">' +
        '<button type="button" data-accion="menos" data-id="' + p.id + '" aria-label="Quitar una unidad">−</button>' +
        "<span>" + l.cantidad + "</span>" +
        '<button type="button" data-accion="mas" data-id="' + p.id + '" aria-label="Agregar una unidad">+</button></div>' +
        '<div class="linea-total">' + window.fmtCOP(unit * l.cantidad) + "</div></div>";
    }).join("");

    var cupon = conCupon
      ? '<div class="cupon-aplicado"><span>✓ ' + window.Carrito.CUPON + ' aplicado (−10 %)</span>' +
        '<button type="button" class="btn-texto" id="btn-quitar-cupon">Quitar</button></div>'
      : '<div class="cupon-fila"><input type="text" id="campo-cupon" placeholder="Código de cupón" autocomplete="off" aria-label="Código de cupón">' +
        '<button type="button" class="btn btn-sec" id="btn-cupon">Aplicar</button></div>';

    var resumen =
      '<div class="fila"><span>Subtotal</span><span>' + window.fmtCOP(window.Carrito.subtotal()) + "</span></div>" +
      (conCupon ? '<div class="fila descuento"><span>Descuento BIENVENIDA10</span><span>−' + window.fmtCOP(window.Carrito.descuento()) + "</span></div>" : "") +
      '<div class="fila total"><span>Total en productos</span><span>' + window.fmtCOP(window.Carrito.totalProductos()) + "</span></div>" +
      '<p class="nota">El costo de envío se calcula en el checkout.</p>' +
      '<a class="btn btn-bloque" href="checkout.html">Ir al checkout</a>';

    cont.innerHTML =
      '<div class="dos-columnas"><div class="panel">' + filas + "</div>" +
      '<aside class="panel resumen"><h2>Resumen</h2>' +
      '<div class="cupon-caja">' + cupon + '<div class="msg ' + mensaje.tipo + '" id="msg-cupon" role="status">' + mensaje.texto + "</div></div>" +
      resumen + "</aside></div>";
  }

  function manejarClic(e) {
    var el = e.target.closest("button");
    if (!el) { return; }
    var id = el.getAttribute("data-id");
    var accion = el.getAttribute("data-accion");

    if (accion === "mas") { window.Carrito.agregar(id, 1); mensaje = { texto: "", tipo: "" }; pintar(); }
    else if (accion === "menos") { window.Carrito.disminuir(id, 1); mensaje = { texto: "", tipo: "" }; pintar(); }
    else if (accion === "quitar") { window.Carrito.quitar(id); mensaje = { texto: "", tipo: "" }; pintar(); }
    else if (el.id === "btn-cupon") {
      var codigo = document.getElementById("campo-cupon").value;
      if (window.Carrito.aplicarCupon(codigo)) {
        mensaje = { texto: "Cupón aplicado: 10 % de descuento.", tipo: "ok" };
      } else {
        mensaje = { texto: "Cupón no válido.", tipo: "error" };
      }
      pintar();
    }
    else if (el.id === "btn-quitar-cupon") {
      window.Carrito.quitarCupon();
      mensaje = { texto: "", tipo: "" };
      pintar();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var cont = document.getElementById("carrito-contenido");
    cont.addEventListener("click", manejarClic);
    cont.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.id === "campo-cupon") {
        e.preventDefault();
        document.getElementById("btn-cupon").click();
      }
    });

    pintar();

    // view_cart: al abrir el carrito con productos.
    if (window.Carrito.lineas().length) {
      window.Analytics.enviarEvento("view_cart", window.Carrito.paramsCompra());
    }
  });
})();
