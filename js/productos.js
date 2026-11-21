/* ==========================================================================
   productos.js · Catálogo ficticio de Abracadabra muebles
   Precios enteros en COP. Sin imágenes externas: bloques de color + SVG propio.
   ========================================================================== */
(function () {
  "use strict";

  // Íconos SVG sencillos (trazos) por tipo de mueble. viewBox 0 0 100 70.
  var ICONOS = {
    sofa: '<path d="M18 40V26a10 10 0 0 1 10-10h44a10 10 0 0 1 10 10v14"/><path d="M8 44a8 8 0 0 1 16 0v6h52v-6a8 8 0 0 1 16 0v14H8z"/><path d="M20 58v6M80 58v6"/>',
    mesa: '<ellipse cx="50" cy="26" rx="38" ry="10"/><path d="M30 34l-6 30M70 34l6 30M50 36v28"/>',
    redonda: '<circle cx="50" cy="26" r="22"/><path d="M50 48v16M36 64h28"/>',
    poltrona: '<path d="M30 40V26a10 10 0 0 1 10-10h20a10 10 0 0 1 10 10v14"/><path d="M20 44a8 8 0 0 1 16 0v4h28v-4a8 8 0 0 1 16 0v14H20z"/><path d="M28 58v6M72 58v6"/>',
    biblioteca: '<rect x="22" y="6" width="56" height="58" rx="4"/><path d="M22 25h56M22 44h56M50 6v58"/>',
    centro: '<rect x="14" y="26" width="72" height="10" rx="5"/><path d="M26 36v26M74 36v26"/>'
  };

  var PRODUCTOS = [
    { id: "ABC-001", nombre: "Sofá Nube 3 puestos", categoria: "Sofás", precio: 2890000, sigla: "SN", icono: "sofa", color1: "#4c6ef5", color2: "#263eb8",
      descripcion: "Sofá de tres puestos con espuma de alta densidad y tapizado antimanchas. Líneas suaves y asiento profundo para el día a día." },
    { id: "ABC-002", nombre: "Sala Aurora esquinera", categoria: "Salas", precio: 4200000, sigla: "SA", icono: "sofa", color1: "#e87348", color2: "#b83d1b",
      descripcion: "Sala esquinera modular de cinco puestos con chaise longue. Estructura en madera certificada y cojines desenfundables." },
    { id: "ABC-003", nombre: "Comedor Roble 6 puestos", categoria: "Comedores", precio: 3150000, sigla: "CR", icono: "mesa", color1: "#9d7253", color2: "#5c3d28",
      descripcion: "Mesa rectangular en roble macizo con seis sillas tapizadas. Acabado mate resistente al uso diario." },
    { id: "ABC-004", nombre: "Comedor Luna redondo 4 puestos", categoria: "Comedores", precio: 1890000, sigla: "CL", icono: "redonda", color1: "#38a3a5", color2: "#166b6c",
      descripcion: "Mesa redonda con base central y cuatro sillas. Ideal para apartamentos y espacios compactos." },
    { id: "ABC-005", nombre: "Poltrona Brisa", categoria: "Muebles", precio: 990000, sigla: "PB", icono: "poltrona", color1: "#c25785", color2: "#872754",
      descripcion: "Poltrona de lectura con respaldo curvo y patas en madera. Tela de tacto suave, fácil de limpiar." },
    { id: "ABC-006", nombre: "Biblioteca Atlas modular", categoria: "Muebles", precio: 1250000, sigla: "BA", icono: "biblioteca", color1: "#2997b5", color2: "#135e75",
      descripcion: "Biblioteca de seis módulos combinables, con estantes ajustables en altura y fondo reforzado." },
    { id: "ABC-007", nombre: "Mesa auxiliar Eclipse", categoria: "Otros muebles", precio: 129000, sigla: "ME", icono: "centro", color1: "#7a8494", color2: "#454d5c",
      descripcion: "Mesa auxiliar de tapa lacada y patas metálicas. Una pieza pequeña y sencilla que completa cualquier rincón." },
    { id: "ABC-008", nombre: "Sofá cama Nómada", categoria: "Sofás", precio: 2350000, sigla: "NO", icono: "sofa", color1: "#785cd4", color2: "#4a2fa3",
      descripcion: "Sofá cama de dos puestos con mecanismo de apertura suave y baúl para guardar cobijas." }
  ];

  window.CATALOGO = {
    marca: "Abracadabra muebles",
    moneda: "COP",
    productos: PRODUCTOS,
    buscar: function (id) {
      for (var i = 0; i < PRODUCTOS.length; i++) {
        if (PRODUCTOS[i].id === id) { return PRODUCTOS[i]; }
      }
      return null;
    },
    // Bloque visual (gradiente + ícono SVG + siglas) en lugar de una foto.
    visual: function (p, clase) {
      return '<div class="visual ' + (clase || "") + '" style="background:linear-gradient(135deg,' + p.color1 + "," + p.color2 + ')" role="img" aria-label="' + p.nombre + '">' +
        '<svg viewBox="0 0 100 70" aria-hidden="true">' + ICONOS[p.icono] + "</svg>" +
        '<span class="sigla">' + p.sigla + "</span></div>";
    }
  };
})();
