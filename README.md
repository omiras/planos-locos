# Planos Locos

Aplicación web ligera para ver "planos" (plane cards) localmente. Muestra imágenes grandes, texto (inglés/español) y sustituye símbolos de maná como `{R}` por iconos SVG.

**Contenido**
- `src/App.vue` — Componente principal (Vue 3, `<script setup>`). Gestiona navegación entre planos, reproducción de sonido al cambiar de plano, overlay fullscreen con fade-out, y alternador de idioma (EN/ES).
- `src/assets/planes.json` — Datos locales de los planos (incluye `text` y `text_es`).
- `src/assets/symbology.json` — Símbolos de maná de Scryfall (campo `symbol` y `svg_uri`).
- `src/assets/*.wav` — Efectos de sonido para el botón (asegúrate de tener `sound1.wav`, `sound2.wav`, `sound3.wav`).

Requisitos
- Node.js (>= 16 recomendable)
- npm

Instalación y ejecución en desarrollo

1. Instala dependencias:

```powershell
npm install
```

2. Ejecuta el servidor de desarrollo (Vite):

```powershell
npm run dev
```

3. Abre la URL que muestre la consola (por defecto `http://localhost:5173`).

Construcción para producción

```powershell
npm run build
npm run preview
```

Qué hace la app
- Carga los planos desde `src/assets/planes.json` (sin llamadas externas).
- Al pulsar "Cambiar Plano" reproduce uno de varios sonidos al azar y muestra un overlay fullscreen con la imagen del plano; el overlay se desvanece y la vista hace scroll hacia el título del plano.
- Puedes alternar entre texto en inglés y español con el botón `EN/ES`.
- Los tokens de símbolo (p. ej. `{R}`, `{2}`, `{W/U}`) detectados en `text` o `text_es` se sustituyen por imágenes SVG usando `src/assets/symbology.json`.

Notas técnicas importantes

- Sustitución de símbolos:
  - El código sustituye tokens `{...}` por etiquetas `<img>` con `style` inline en `v-html` para evitar problemas con `scoped` CSS y con `v-html`.
  - Si prefieres usar una clase CSS (`.inline-symbol`), quita `scoped` del bloque `<style>` en `src/App.vue` o modifica la implementación para renderizar VNodes en lugar de HTML crudo.

- Assets ausentes:
  - Si faltan los archivos de sonido (`sound1.wav` etc.) la construcción puede fallar porque son importaciones estáticas. Asegúrate de poner los archivos en `src/assets/` o sustituir las importaciones por carga dinámica.

- Seguridad: `v-html` introduce HTML sin sanitizar. En este proyecto los datos vienen del archivo local `planes.json`; si más adelante cargas contenido remoto, considera sanitizar el HTML antes de insertarlo.

Personalización rápida
- Cambiar duración del overlay: modifica los `setTimeout` en `fetchPlanesAndShow()` en `src/App.vue`.
- Cambiar tamaño/alineado de los iconos: ajusta la cadena `inlineStyle` en el reemplazo de símbolos (o usa `.inline-symbol` si quitas `scoped`).
- Persistir idioma: puedes guardar `showEnglish` en `localStorage` y restaurarlo al cargar.

Depuración
- Errores al ejecutar `npm run dev`: pega la salida del terminal aquí y te ayudaré a diagnosticar.
- Problemas de visualización de símbolos: abre las DevTools y verifica que las `<img>` sustitutas tienen el `src` correcto y el `style` aplicado.

Siguientes pasos sugeridos
- Ejecutar `npm run dev` y probar en móvil (modo landscape) para confirmar que la imagen ocupa la parte superior y el texto queda legible.
- Si quieres puedo implementar persistencia de idioma o cambiar la sustitución para renderizar VNodes (mejor integración con Vue).

Contacto
- Si quieres que haga ajustes concretos (persistencia, VNodes, quitar `scoped`, cambiar animaciones, etc.), dime cuál y lo implemento.
