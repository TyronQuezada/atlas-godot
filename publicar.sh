#!/usr/bin/env bash
# Publica los cambios en GitHub Pages: sube la versión ?v= de los archivos
# (para que los navegadores no usen la copia vieja), hace commit y push.
# Uso: ./publicar.sh "mensaje del commit"
set -euo pipefail
cd "$(dirname "$0")"

if [ -z "$(git status --porcelain)" ]; then
  echo "Nada que publicar."
  exit 0
fi

v=$(date +%Y%m%d%H%M)
sed -i -E "s/\?v=[0-9]+\"/?v=$v\"/g" index.html

git add -A
git commit -q -m "${1:-Actualizar contenido}"
git push -q
echo "Publicado (v=$v). GitHub Pages se actualiza en 1-2 minutos:"
echo "https://tyronquezada.github.io/atlas-godot/"
