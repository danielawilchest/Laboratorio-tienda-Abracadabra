/* ==========================================================================
   pagina-producto.js · Detalle de producto: view_item y add_to_cart
   Se abre con producto.html?id=ABC-001
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var contenedor = document.getElementById("detalle-producto");
    var id = new URLSearchParams(window.location.search).get("id");
    var p = window.CATALOGO.buscar(id);

    if (!p) {
      contenedor.innerHTML =
        '<div class="vacio"><p>No encontramos ese producto.</p><a class="btn" href="index.html">Ver catálogo</a></div>';
      return;
    }

    document.title = p.nombre + " · Abracadabra muebles";
    contenedor.innerHTML =
      '<div class="detalle">' +
      window.CATALOGO.visual(p, "grande") +
      "<div>" +
      '<span class="categoria">' + p.categoria + " · " + p.id + "</span>" +
      "<h1>" + p.nombre + "</h1>" +
      '<p class="precio-grande">' + window.fmtCOP(p.precio) + "</p>" +
      '<p class="desc">' + p.descripcion + "</p>" +
      '<div class="acciones">' +
      '<button type="button" class="btn" id="btn-agregar">Agregar al carrito</button>' +
      '<a class="btn btn-sec" href="carrito.html">Ver carrito</a>' +
      "</div>" +
      '<p class="aviso-ok" id="aviso-agregado" role="status"></p>' +
      "</div></div>";

    // view_item: al abrir el detalle.
    window.Analytics.enviarEvento("view_item", {
      value: p.precio,
      items: [window.Carrito.itemEvento(p, 1, 0, false)]
    });

    // add_to_cart: lo envía Carrito.agregar().
    document.getElementById("btn-agregar").addEventListener("click", function () {
      window.Carrito.agregar(p.id, 1);
      var aviso = document.getElementById("aviso-agregado");
      aviso.textContent =
        "✓ Agregado al carrito (" + window.Carrito.cantidadTotal() + " en total)";
      aviso.classList.remove("activo");
      void aviso.offsetWidth;
      aviso.classList.add("activo");
    });
  });
})();
