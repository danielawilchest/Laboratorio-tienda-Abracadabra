# Abracadabra muebles · Laboratorio de GA4

Tienda en línea **ficticia** para el laboratorio de Google Analytics 4 del Diplomado en E-commerce y Negocios Internacionales Digitales.
Solo HTML, CSS y JavaScript puros: sin servidor, sin base de datos, sin npm y sin pagos reales.

## 1. Poner tu ID de medición (único archivo que se edita)

Abre `js/config.js` y reemplaza el marcador:

```js
window.TIENDA_CONFIG = { GA_MEASUREMENT_ID: "G-XXXXXXXXXX", DEBUG_MODE: true };
```

- Dónde está el ID: GA4 → Administrar → Flujos de datos → tu flujo Web → **ID de medición** (formato `G-AB12CD34EF`).
- Con `G-XXXXXXXXXX` **no se carga Google Analytics**: la tienda funciona y el monitor (panel derecho) muestra los eventos en rojo "Sin ID de medición".
- `DEBUG_MODE: true` envía `debug_mode` y los eventos aparecen en GA4 → Administrar → **DebugView**. Con `false` se envían sin `debug_mode`.

## 2. Estructura

```
index.html            Catálogo (inicio)
producto.html?id=...  Detalle de producto (ej.: producto.html?id=ABC-001)
carrito.html          Carrito
checkout.html         Checkout en dos pasos (Envío → Pago simulado)
gracias.html          Confirmación (evento purchase)
css/estilos.css       Estilos (diseño tipo Apple)
js/config.js          ← único archivo que se edita
js/productos.js       Ocho productos ficticios
js/carrito.js         Carrito (localStorage), cupón, tarifas de envío
js/analytics.js       Carga de gtag.js y funciones de envío de eventos
js/monitor.js         Monitor de eventos (panel didáctico)
js/pagina-*.js        Un archivo por página
```

## 3. Productos (precios en COP)

| ID | Producto | Categoría | Precio |
|---|---|---|---|
| ABC-001 | Sofá Nube 3 puestos | Sofás | 2.890.000 |
| ABC-002 | Sala Aurora esquinera | Salas | 4.200.000 |
| ABC-003 | Comedor Roble 6 puestos | Comedores | 3.150.000 |
| ABC-004 | Comedor Luna redondo 4 puestos | Comedores | 1.890.000 |
| ABC-005 | Poltrona Brisa | Muebles | 990.000 |
| ABC-006 | Biblioteca Atlas modular | Muebles | 1.250.000 |
| ABC-007 | Mesa auxiliar Eclipse | Otros muebles | 129.000 |
| ABC-008 | Sofá cama Nómada | Sofás | 2.350.000 |

## 4. Cupón y envío

- Cupón **BIENVENIDA10**: 10 % de descuento. Se aplica desde el banner del inicio o escribiéndolo en el carrito.
- Tarifas: Nacional Estándar 12.000 · Nacional Express 25.000 · Internacional Estándar 95.000 · Internacional Express 160.000.
- Nacional Estándar es **gratis** cuando el valor de los productos (ya con descuento) es de 150.000 o más. Para ver la tarifa de 12.000, compra solo la Mesa auxiliar Eclipse (129.000), el único producto por debajo del umbral.
- Países: Colombia (Nacional) y México, Estados Unidos, España, Chile, Perú, Argentina, Panamá (Internacional).

## 5. Contrato de medición (12 eventos)

Todos los eventos llevan `currency: "COP"`. Cada ítem lleva `item_id`, `item_name`, `item_brand`, `item_category`, `price`, `quantity` e `index` (empieza en 0). Con cupón: `price` = precio unitario con descuento, `discount` = descuento por unidad y `coupon`.

| # | Evento | Cuándo se envía |
|---|---|---|
| 1 | `view_item_list` | Al cargar el catálogo (`catalogo_principal`) |
| 2 | `view_promotion` | Al mostrarse el banner del cupón |
| 3 | `select_promotion` | Clic en el banner: aplica el cupón y va al carrito |
| 4 | `select_item` | Clic en un producto del catálogo, antes de navegar |
| 5 | `view_item` | Al abrir el detalle del producto |
| 6 | `add_to_cart` | Al agregar o aumentar unidades |
| 7 | `remove_from_cart` | Al quitar o disminuir unidades |
| 8 | `view_cart` | Al abrir el carrito con productos |
| 9 | `begin_checkout` | Al abrir `checkout.html` |
| 10 | `add_shipping_info` | Clic en "Continuar al pago" (`shipping_tier`) |
| 11 | `add_payment_info` | Clic en "Pagar (simulado)" (`payment_type`) |
| 12 | `purchase` | Al cargar `gracias.html`, una sola vez por pedido |

Propiedad de usuario: `tipo_cliente` ("Nacional" / "Internacional") con `gtag('set', 'user_properties', ...)` al confirmar el envío y antes de `purchase`.
En GA4 debes registrar `tipo_cliente` como **dimensión personalizada** (alcance: usuario) para verla en informes.

Decisiones de diseño que conviene conocer:

- `view_promotion` y `select_promotion` llevan como ítem de ejemplo el producto destacado del banner (Sofá Nube, ABC-001) con precio ya descontado.
- `view_item_list`, `select_item` y `view_item` usan el precio de lista; los eventos del carrito y de la compra usan el precio con descuento si hay cupón.
- `purchase.value` = suma de `price × quantity` de los ítems (productos con descuento, sin envío); el envío va en `shipping`.
- El nombre del checkout es solo para validar el formulario: **no se guarda ni se envía**.

## 6. Monitor de eventos

Panel fijo a la derecha (380 px; en pantallas menores de 820 px va abajo con 300 px de alto). Muestra el estado de la conexión, el origen de la visita (UTM), los últimos 12 eventos (persisten entre páginas) y el botón **Simular nuevo visitante**, que borra las cookies `_ga*`, el carrito y `sessionStorage`, y vuelve al inicio. El botón Ocultar/Mostrar recuerda su estado.

Prueba de UTM: abre `index.html?utm_source=google&utm_medium=cpc&utm_campaign=lanzamiento` como primera página de la sesión.

## 7. Publicar en GitHub y Vercel (sin instalar nada)

1. En github.com: **New repository** → nombre `abracadabra-muebles` → público → Create.
2. **Add file → Upload files**. Descomprime el .zip y arrastra **el contenido** de la carpeta (que `index.html` quede en la raíz del repositorio, junto a `css/` y `js/`). Pulsa **Commit changes**.
3. En vercel.com: **Add New → Project** → importa el repositorio.
4. **Framework Preset: Other**. Deja Build Command y Output Directory vacíos → **Deploy**.
5. Abre la URL `.vercel.app`, pega tu ID en `js/config.js` (en GitHub: abre el archivo → lápiz → Commit) y Vercel republica solo.

## Aviso

Sitio académico de simulación. No procesa pagos reales, no guarda datos personales y usa Google Analytics 4 con fines educativos.
