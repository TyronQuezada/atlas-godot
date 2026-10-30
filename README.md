# Atlas Godot

Guía visual en español de **Godot 4**: nodos, señales, funciones, recetas paso a paso ("quiero hacer…") y un diccionario de términos de desarrollo de juegos.

**Ver la página:** https://tyronquezada.github.io/atlas-godot/

## Qué incluye

- **Recetas**: personajes 2D/3D, enemigos, IA de movimiento y de visión, inventario, armas, máquina de estados, diálogos, tilemaps, tweens, raycasts, game feel y más, con el árbol de escena, piezas necesarias y scripts explicados.
- **Nodos**: ficha de cada nodo con analogía, ideas de uso, propiedades, métodos y señales clicables.
- **Señales y funciones**: qué reciben, qué devuelven y un script de ejemplo.
- **Diccionario**: jerga de desarrollo de videojuegos con índice A–Z.
- Búsqueda global con `Ctrl+K`.

## Usarlo en local

Es un sitio estático sin dependencias. Sirve la carpeta con cualquier servidor:

```bash
python -m http.server 8000
```

y abre `http://localhost:8000`.

## Publicar cambios

```bash
./publicar.sh "Describe el cambio"
```

Sube la versión `?v=` de los archivos en `index.html`, hace commit y push. GitHub Pages se actualiza en 1-2 minutos.

## Editar el contenido

| Archivo | Contenido |
|---|---|
| `data.js` | Nodos, señales, funciones, recetas base y diccionario |
| `extras.js` | Recetas, nodos, señales y funciones adicionales |
| `ideas.js` | Analogías e ideas de uso de nodos/señales, explicaciones de recetas |
| `members.js` | Explicación de cada propiedad, método y señal |
| `app.js` / `styles.css` | Lógica e interfaz |

Las capturas e íconos se enlazan desde [docs.godotengine.org](https://docs.godotengine.org) y el [repositorio de Godot](https://github.com/godotengine/godot) (CC BY 3.0 / MIT). Proyecto no oficial.
