/* ==========================================================================
   pagina-index.js · Catálogo: view_item_list, select_item, view_promotion, select_promotion
   ========================================================================== */
(function () {
  "use strict";

  var LISTA_ID = "catalogo_principal";
  var LISTA_NOMBRE = "Catálogo principal";
  var PROMO = {
    id: "BIENVENIDA10",
    nombre: "Cupón de bienvenida 10 %",
    creativo: "banner_inicio_bienvenida",
    espacio: "inicio_superior"
  };
  var PRODUCTO_DESTACADO = "ABC-001";

  // Parámetros iguales para view_promotion y select_promotion.
  function paramsPromocion() {
    var p = window.CATALOGO.buscar(PRODUCTO_DESTACADO);
    var datos = {
      promotion_id: PROMO.id,
      promotion_name: PROMO.nombre,
      creative_name: PROMO.creativo,
      creative_slot: PROMO.espacio
    };
    var item = window.Carrito.itemEvento(p, 1, 0, true, datos);
    return {
      promotion_id: datos.promotion_id,
      promotion_name: datos.promotion_name,
      creative_name: datos.creative_name,
      creative_slot: datos.creative_slot,
      items: [item]
    };
  }

  function pintarCatalogo() {
    var grid = document.getElementById("grid-productos");
    grid.innerHTML = window.CATALOGO.productos.map(function (p, i) {
      return '<a class="tarjeta" href="producto.html?id=' + p.id + '" data-indice="' + i + '">' +
        window.CATALOGO.visual(p) +
        '<div class="tarjeta-cuerpo"><span class="categoria">' + p.categoria + "</span>" +
        "<h3>" + p.nombre + '</h3><p class="precio">' + window.fmtCOP(p.precio) + "</p></div></a>";
    }).join("");

    // select_item: se envía antes de navegar al detalle.
    grid.addEventListener("click", function (e) {
      var enlace = e.target.closest(".tarjeta");
      if (!enlace) { return; }
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) { return; }
      e.preventDefault();
      var i = Number(enlace.getAttribute("data-indice"));
      var p = window.CATALOGO.productos[i];
      var extra = { item_list_id: LISTA_ID, item_list_name: LISTA_NOMBRE };
      window.Analytics.enviarYNavegar("select_item", {
        item_list_id: LISTA_ID,
        item_list_name: LISTA_NOMBRE,
        items: [window.Carrito.itemEvento(p, 1, i, false, extra)]
      }, enlace.getAttribute("href"));
    });

    // view_item_list: al cargar el catálogo.
    var extraLista = { item_list_id: LISTA_ID, item_list_name: LISTA_NOMBRE };
    window.Analytics.enviarEvento("view_item_list", {
      item_list_id: LISTA_ID,
      item_list_name: LISTA_NOMBRE,
      items: window.CATALOGO.productos.map(function (p, i) {
        return window.Carrito.itemEvento(p, 1, i, false, extraLista);
      })
    });
  }

  function pintarBanner() {
    var banner = document.getElementById("banner-cupon");

    if (window.Carrito.cuponAplicado()) {
      banner.classList.add("aplicado");
      banner.innerHTML =
        "<div><small>Cupón activo</small><h2>BIENVENIDA10 aplicado</h2>" +
        "<p>Tu 10 % de descuento ya está en el carrito.</p></div>" +
        '<a class="btn btn-claro" href="carrito.html">Ir al carrito</a>';
      return;
    }

    var destacado = window.CATALOGO.buscar(PRODUCTO_DESTACADO);
    var precioPromo = destacado.precio - window.Carrito.descuentoUnitario(destacado);
    banner.innerHTML =
      "<div><small>Primera compra</small><h2>10 % de descuento con BIENVENIDA10</h2>" +
      "<p>Aplica a toda la tienda. Ejemplo: " + destacado.nombre + " por " + window.fmtCOP(precioPromo) + ".</p></div>" +
      '<button type="button" class="btn btn-claro" id="btn-banner">Aplicar cupón</button>';

    // view_promotion: al mostrar el banner.
    window.Analytics.enviarEvento("view_promotion", paramsPromocion());

    // select_promotion: aplica el cupón y lleva al carrito.
    document.getElementById("btn-banner").addEventListener("click", function () {
      window.Carrito.aplicarCupon(PROMO.id);
      window.Analytics.enviarYNavegar("select_promotion", paramsPromocion(), "carrito.html");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    pintarCatalogo();
    pintarBanner();
  });
})();
