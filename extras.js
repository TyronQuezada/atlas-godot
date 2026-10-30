// Contenido ampliado: recetas de técnicas, IA y sistemas; nodos, señales, funciones y términos extra.
// Se carga después de data.js, ideas.js y members.js y añade a sus colecciones.

/* =========================================================
   RECETAS
   ========================================================= */
RECIPES.push(
  {
    id: "animaciones", title: "Animar con AnimationPlayer y AnimationTree",
    lead: "De la hoja de sprites al ataque con hitbox sincronizada y a la mezcla de animaciones con una máquina de estados.",
    img: DOC("2d_animation_spritesheet_animation.webp"),
    tree: [
      ["CharacterBody2D", "Jugador", 0, "CharacterBody2D"],
      ["Sprite2D", "Sprite2D", 1, "Sprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["Area2D", "EspadaHitbox", 1, "Area2D"],
      ["CollisionShape2D", "CollisionShape2D", 2, "CollisionShape2D"],
      ["AudioStreamPlayer2D", "SonidoEspada", 1, "AudioStreamPlayer2D"],
      ["AnimationPlayer", "AnimationPlayer", 1, "AnimationPlayer"],
      ["AnimationTree", "AnimationTree", 1, "AnimationTree"],
    ],
    need: [
      ["Sprite2D con hoja de sprites", "Configura hframes y vframes para que frame elija el cuadro."],
      ["AnimationPlayer", "Guarda las animaciones: idle, correr, atacar. Cada una son pistas con keyframes."],
      ["Area2D EspadaHitbox", "La zona que hace daño. Su CollisionShape2D empieza desactivada."],
      ["AnimationTree", "Decide qué animación suena y cómo pasar de una a otra. anim_player apunta al AnimationPlayer."],
      ["AudioStreamPlayer2D", "Sonido del golpe, disparado desde la propia animación."],
    ],
    steps: [
      { t: "Anima una hoja de sprites", d: "En una animación puedes guardar el valor de casi cualquier propiedad en un instante (un keyframe). Para animar cuadros guardas Sprite2D:frame en cada momento. Se hace en el editor; el código solo la reproduce.", file: "jugador.gd", code: `# En el editor:
# 1. Selecciona AnimationPlayer → Animación → Nueva → "correr"
# 2. Selecciona Sprite2D. En el Inspector, pulsa la llave junto a "frame":
#    crea la pista y el primer keyframe.
# 3. Avanza el cursor 0.1 s, cambia frame y vuelve a pulsar la llave. Repite.
# 4. Activa el bucle (flechas circulares) y ajusta la duración total.

func _physics_process(_delta: float) -> void:
    if velocity.x != 0:
        $AnimationPlayer.play("correr")
    else:
        $AnimationPlayer.play("idle")` },
      { t: "Un ataque que activa la hitbox", d: "La gracia de AnimationPlayer es que sincroniza todo: el cuadro del sprite, la colisión que hace daño y el sonido ocurren justo en el mismo instante. Una 'pista de método' llama funciones de tu script desde la línea de tiempo.", file: "jugador.gd", code: `# Animación "atacar" (0.4 s, sin bucle):
#   Sprite2D:frame                               0 → 1 → 2 → 3
#   EspadaHitbox/CollisionShape2D:disabled        true (0.0) · false (0.1) · true (0.25)
#   Pista de método (Añadir pista → Pista de llamada a método → Jugador):
#       sonido_golpe() en 0.1 s

func sonido_golpe() -> void:
    $SonidoEspada.pitch_scale = randf_range(0.9, 1.1)
    $SonidoEspada.play()

func atacar() -> void:
    $AnimationPlayer.play("atacar")
    await $AnimationPlayer.animation_finished
    $AnimationPlayer.play("idle")` },
      { t: "Máquina de estados de animación", d: "Con muchas animaciones, AnimationTree evita el lío de play() por todas partes. Pon tree_root = AnimationNodeStateMachine, añade los estados idle, correr y atacar y une con flechas los que pueden pasar de uno a otro. Desde código solo pides 'viaja a X'.", file: "jugador.gd", code: `@onready var tree: AnimationTree = $AnimationTree
@onready var estados: AnimationNodeStateMachinePlayback = tree.get("parameters/playback")

func _ready() -> void:
    tree.active = true

func _physics_process(_delta: float) -> void:
    # ... aquí va el movimiento ...
    if estados.get_current_node() == &"atacar":
        return  # no interrumpas el ataque
    if Input.is_action_just_pressed("atacar"):
        estados.travel("atacar")
    elif velocity.x != 0:
        estados.travel("correr")
    else:
        estados.travel("idle")` },
      { t: "8 direcciones con BlendSpace2D", d: "En un juego top-down, un BlendSpace2D elige la animación según un vector: colocas caminar_arriba en (0,-1), caminar_derecha en (1,0), etc., y Godot escoge la más cercana a la dirección del input.", file: "jugador.gd", code: `# Estado "caminar" del AnimationTree = AnimationNodeBlendSpace2D
# con una animación en cada dirección. Lo mismo para "idle".
var ultima_dir := Vector2.DOWN

func animar(dir: Vector2) -> void:
    if dir != Vector2.ZERO:
        ultima_dir = dir
        tree.set("parameters/caminar/blend_position", dir)
        estados.travel("caminar")
    else:
        tree.set("parameters/idle/blend_position", ultima_dir)
        estados.travel("idle")` },
    ],
    tips: ["Mientras el AnimationTree está activo controla al AnimationPlayer: no llames a $AnimationPlayer.play() a la vez.", "En la pista de una propiedad, el modo de actualización 'Discreto' salta de valor en valor (ideal para frame y disabled).", "Copia la ruta exacta de un parámetro con clic derecho en el Inspector del AnimationTree."],
  },
  {
    id: "tweens", title: "Tweens: animar desde código",
    lead: "Animaciones de una línea para la interfaz y el game feel: aparecer, recoger, flotar, contar puntos y destellos.",
    img: null,
    tree: [
      ["Node2D", "Juego", 0, "Node2D"],
      ["Sprite2D", "Moneda", 1, "Sprite2D"],
      ["CanvasLayer", "UI", 1, "CanvasLayer"],
      ["Label", "Puntos", 2, "Label"],
      ["ColorRect", "Flash", 2, "ColorRect"],
    ],
    need: [
      ["create_tween()", "Crea un Tween ligado al nodo: si el nodo se borra, el Tween se detiene solo."],
      ["Propiedades animables", "Casi todas: position, scale, rotation, modulate, value, e incluso subpropiedades como \"position:y\"."],
      ["ColorRect Flash", "Full Rect, blanco, modulate.a = 0 y mouse_filter = Ignore para el destello."],
    ],
    steps: [
      { t: "Lo básico: de A a B", d: "tween_property(objeto, \"propiedad\", valor_final, segundos). Con set_trans eliges la curva (BACK rebota un poco al final) y con set_ease dónde se suaviza.", file: "efectos.gd", code: `func aparecer(nodo: Node2D) -> void:
    nodo.scale = Vector2.ZERO
    var t := create_tween()
    t.tween_property(nodo, "scale", Vector2.ONE, 0.4)\\
        .set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)` },
      { t: "Secuencia y paralelo", d: "Por defecto cada tween_property espera al anterior. parallel() hace que el siguiente ocurra a la vez. tween_callback ejecuta una función cuando llega su turno.", file: "efectos.gd", code: `func recoger(moneda: Node2D) -> void:
    var t := create_tween()
    t.tween_property(moneda, "position:y", moneda.position.y - 30, 0.25)
    t.parallel().tween_property(moneda, "modulate:a", 0.0, 0.25)
    t.tween_callback(moneda.queue_free)  # después de los dos anteriores` },
      { t: "Bucles y cómo detenerlos", d: "set_loops() repite para siempre; as_relative() suma al valor actual en vez de ir a un valor fijo. Guarda el Tween en una variable para poder pararlo con kill().", file: "efectos.gd", code: `var flotar: Tween

func _ready() -> void:
    flotar = create_tween().set_loops()
    flotar.tween_property($Moneda, "position:y", -6.0, 0.6).as_relative().set_trans(Tween.TRANS_SINE)
    flotar.tween_property($Moneda, "position:y", 6.0, 0.6).as_relative().set_trans(Tween.TRANS_SINE)

func detener() -> void:
    if flotar:
        flotar.kill()` },
      { t: "Contar números y destellos", d: "tween_method llama a una función con cada valor intermedio: perfecto para que los puntos 'suban' en vez de saltar. El destello sube la opacidad de golpe y la baja con un Tween.", file: "ui.gd", code: `var puntos_mostrados := 0

func sumar_puntos(total: int) -> void:
    create_tween().tween_method(_mostrar_puntos, puntos_mostrados, total, 0.5)

func _mostrar_puntos(valor: int) -> void:
    puntos_mostrados = valor
    %Puntos.text = str(valor)

func flash() -> void:
    %Flash.modulate.a = 0.6
    create_tween().tween_property(%Flash, "modulate:a", 0.0, 0.2)` },
      { t: "Esperar a que termine", d: "Un Tween emite finished al acabar: con await tu función continúa justo después, sin Timers.", file: "puerta.gd", code: `func abrir() -> void:
    var t := create_tween()
    t.tween_property($Puerta, "position:y", -64.0, 0.5).as_relative()
    await t.finished
    $Colision.set_deferred("disabled", true)` },
    ],
    tips: ["Si llamas a la misma animación muchas veces, guarda el Tween anterior y haz kill() antes de crear otro, o pelearán entre sí.", "En menús de pausa, el Tween hereda el process_mode del nodo que lo creó.", "Para animaciones complejas o que el diseñador quiera ajustar, usa AnimationPlayer; para efectos rápidos, Tween."],
  },
  {
    id: "raycast", title: "Raycasts: ver, apuntar y disparar",
    lead: "Detectar suelo, láseres visibles, línea de visión y disparos instantáneos, con nodo RayCast2D y por código.",
    img: DOC("raycast_projection.png"),
    tree: [
      ["CharacterBody2D", "Jugador", 0, "CharacterBody2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["RayCast2D", "Laser", 1, "RayCast2D"],
      ["Line2D", "Line2D", 2, "Line2D"],
      ["Marker2D", "Impacto", 1, "Marker2D"],
    ],
    need: [
      ["RayCast2D", "El rayo como nodo: lo configuras en el editor y lo consultas cada frame."],
      ["Line2D", "Dibuja el láser desde el origen hasta donde choca el rayo."],
      ["Capas de colisión", "El collision_mask del rayo decide qué cosas puede tocar (paredes, enemigos…)."],
      ["direct_space_state", "Para lanzar rayos puntuales por código sin crear nodos."],
    ],
    steps: [
      { t: "Un láser visible", d: "El RayCast2D apunta hacia target_position. Si choca, recortamos la línea en el punto de choque y dañamos lo que toca. to_local convierte el punto global del choque a coordenadas del rayo.", file: "laser.gd", code: `extends RayCast2D  # target_position = (600, 0)

@onready var linea: Line2D = $Line2D

func _physics_process(_delta: float) -> void:
    var fin := target_position
    if is_colliding():
        fin = to_local(get_collision_point())
        var obj = get_collider()
        if obj.has_method("recibir_dano"):
            obj.recibir_dano(1, get_collision_point())
    linea.points = PackedVector2Array([Vector2.ZERO, fin])` },
      { t: "Línea de visión por código", d: "Para preguntas puntuales ('¿hay una pared entre A y B?') no hace falta un nodo: pides al espacio físico que lance un rayo. Si el resultado está vacío, no hay nada en medio.", file: "enemigo.gd", code: `func hay_linea_de_vision(desde: Vector2, hasta: Vector2) -> bool:
    var espacio := get_world_2d().direct_space_state
    var consulta := PhysicsRayQueryParameters2D.create(desde, hasta)
    consulta.collision_mask = 1        # solo la capa 1 (paredes)
    consulta.exclude = [get_rid()]     # que no choque consigo mismo
    return espacio.intersect_ray(consulta).is_empty()` },
      { t: "Disparo instantáneo (hitscan)", d: "Lanzamos un rayo de 800 px hacia el mouse. El resultado es un diccionario con position (dónde chocó), normal y collider (qué tocó).", file: "jugador.gd", code: `func disparar() -> void:
    var desde := global_position
    var hasta := desde + desde.direction_to(get_global_mouse_position()) * 800
    var consulta := PhysicsRayQueryParameters2D.create(desde, hasta, 0b110)  # capas 2 y 3
    var r := get_world_2d().direct_space_state.intersect_ray(consulta)
    if r:
        $Impacto.global_position = r.position
        if r.collider.has_method("recibir_dano"):
            r.collider.recibir_dano(2, r.position)` },
      { t: "Detectar bordes y suelo", d: "Un RayCast2D apuntando hacia abajo y un poco adelante del enemigo deja de tocar cuando hay un precipicio. Muévelo de lado al girar.", file: "enemigo.gd", code: `@onready var borde: RayCast2D = $DetectorBorde  # target_position = (0, 24), position.x = 12

func _physics_process(delta: float) -> void:
    velocity += get_gravity() * delta
    if is_on_floor() and not borde.is_colliding():
        direccion *= -1
        borde.position.x = 12 * direccion
    velocity.x = direccion * 60.0
    move_and_slide()` },
    ],
    tips: ["Lanza rayos dentro de _physics_process: fuera de él el estado físico puede estar a medias.", "Si mueves el RayCast2D y necesitas el resultado en la misma función, llama a force_raycast_update().", "El láser del paso A daña en cada frame: añade un cooldown o un Timer si no quieres eso."],
  },
  {
    id: "tilemaps", title: "TileMaps a fondo",
    lead: "Colisiones, terrenos automáticos, datos propios en cada tile (daño, hielo), romper bloques y generar niveles por código.",
    img: DOC("using_tilemaps_terrain_select_connect_mode.webp"),
    tree: [
      ["Node2D", "Nivel", 0, "Node2D"],
      ["TileMapLayer", "Suelo", 1, "Node2D"],
      ["TileMapLayer", "Peligros", 1, "Node2D"],
      ["CharacterBody2D", "Jugador", 1, "CharacterBody2D"],
    ],
    need: [
      ["TileSet", "El recurso con las imágenes. Ahí se configuran colisiones, terrenos y datos propios."],
      ["Physics Layer", "Para que los tiles sólidos choquen."],
      ["Terrain Set", "Para pintar con autotile: bordes y esquinas se eligen solos."],
      ["Custom Data Layers", "Datos tuyos por tile: dano (int), resbaladizo (bool)…"],
    ],
    steps: [
      { t: "Configura el TileSet", d: "Todo lo que un tile 'sabe' vive en el TileSet. Primero creas las capas en el Inspector y luego las pintas sobre los tiles en la pestaña TileSet → Pintar.", file: null, code: `# Selecciona el TileMapLayer → Inspector → Tile Set → el recurso:
#  Physics Layers      → Add Element        (luego pinta las formas de colisión)
#  Terrain Sets        → Add Element        (modo: Match Corners and Sides)
#      Terrains        → Add Element        ("Tierra", un color)
#  Custom Data Layers  → Add Element ×2     ("dano": int, "resbaladizo": bool)
# Pestaña TileSet → Pintar → elige la propiedad y haz clic en cada tile.` },
      { t: "Lee los datos del tile que pisas", d: "Convertimos la posición de los pies en una celda y pedimos sus datos. get_cell_tile_data devuelve null si la celda está vacía, por eso lo comprobamos.", file: "jugador.gd", code: `@onready var suelo: TileMapLayer = $"../Suelo"

func tile_bajo_los_pies() -> TileData:
    var celda := suelo.local_to_map(suelo.to_local(global_position + Vector2(0, 10)))
    return suelo.get_cell_tile_data(celda)

func _physics_process(delta: float) -> void:
    var datos := tile_bajo_los_pies()
    var friccion := 1200.0
    if datos and datos.get_custom_data("resbaladizo"):
        friccion = 150.0          # hielo
    if datos and datos.get_custom_data("dano") > 0:
        recibir_dano(datos.get_custom_data("dano"), global_position)
    var dir := Input.get_axis("izquierda", "derecha")
    velocity.x = move_toward(velocity.x, dir * 200.0, friccion * delta)
    velocity += get_gravity() * delta
    move_and_slide()` },
      { t: "Rompe y construye bloques", d: "erase_cell vacía una celda y set_cell la llena con un tile del atlas: source_id es el atlas (0 si solo hay uno) y atlas_coords la columna y fila del tile en la imagen.", file: "nivel.gd", code: `@onready var suelo: TileMapLayer = $Suelo

func romper(pos_mundo: Vector2) -> void:
    var celda := suelo.local_to_map(suelo.to_local(pos_mundo))
    if suelo.get_cell_source_id(celda) != -1:
        suelo.erase_cell(celda)

func construir(pos_mundo: Vector2) -> void:
    var celda := suelo.local_to_map(suelo.to_local(pos_mundo))
    suelo.set_cell(celda, 0, Vector2i(1, 0))` },
      { t: "Genera un nivel por código", d: "FastNoiseLite da un relieve suave y aleatorio. Juntamos las celdas sólidas y set_cells_terrain_connect las pinta eligiendo bordes y esquinas según el terreno.", file: "generador.gd", code: `extends TileMapLayer

@export var ancho := 60
@export var alto := 20

func _ready() -> void:
    var ruido := FastNoiseLite.new()
    ruido.seed = randi()
    var celdas: Array[Vector2i] = []
    for x in ancho:
        var altura := int(alto / 2.0 + ruido.get_noise_1d(x * 0.1) * 6)
        for y in range(altura, alto):
            celdas.append(Vector2i(x, y))
    set_cells_terrain_connect(celdas, 0, 0)  # terrain_set 0, terrain 0` },
    ],
    tips: ["Usa capas separadas (Suelo, Peligros, Decoración): cada una con su colisión activada o no.", "El daño por tile del paso B se aplica cada frame: el sistema de vida con invencibilidad lo limita.", "Guarda la seed del ruido para poder repetir un nivel generado."],
  },
  {
    id: "game-feel", title: "Game feel: temblor, hit stop y destellos",
    lead: "Los trucos que hacen que un golpe se sienta fuerte: sacudir la cámara, congelar un instante, destello blanco y squash & stretch.",
    img: null,
    tree: [
      ["CharacterBody2D", "Jugador", 0, "CharacterBody2D"],
      ["Sprite2D", "Sprite2D", 1, "Sprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["Camera2D", "Camara", 1, "Camera2D"],
    ],
    need: [
      ["Camera2D con script", "Guarda el 'trauma' y tiembla según él."],
      ["Autoload Juego", "Para el hit stop, que afecta a todo el juego."],
      ["ShaderMaterial en el Sprite2D", "Con el shader de destello. Marca 'Local to Scene' para que cada enemigo tenga el suyo."],
    ],
    steps: [
      { t: "Temblor de cámara con trauma", d: "Cada golpe suma trauma (0 a 1) y el trauma baja solo con el tiempo. El temblor usa trauma al cuadrado: los golpes pequeños apenas mueven la cámara y los grandes la sacuden mucho.", file: "camara.gd", code: `extends Camera2D

@export var decaimiento := 1.5           # trauma que se pierde por segundo
@export var max_offset := Vector2(16, 12)
var trauma := 0.0

func agregar_trauma(cantidad: float) -> void:
    trauma = min(trauma + cantidad, 1.0)

func _process(delta: float) -> void:
    trauma = max(trauma - decaimiento * delta, 0.0)
    var fuerza := trauma * trauma
    offset = Vector2(randf_range(-1, 1) * max_offset.x, randf_range(-1, 1) * max_offset.y) * fuerza` },
      { t: "Hit stop", d: "Ralentizar todo el juego durante unas centésimas al conectar un golpe le da peso. El último true del timer hace que ignore time_scale, si no tardaría muchísimo.", file: "juego.gd (Autoload)", code: `func hit_stop(duracion := 0.06) -> void:
    Engine.time_scale = 0.05
    await get_tree().create_timer(duracion, true, false, true).timeout
    Engine.time_scale = 1.0` },
      { t: "Destello blanco con un shader", d: "Un shader mezcla el color del sprite con blanco según 'intensidad'. Lo subimos a 1 y lo bajamos con un tween_method.", file: "flash.gdshader", code: `shader_type canvas_item;
uniform float intensidad : hint_range(0.0, 1.0) = 0.0;

void fragment() {
    vec4 c = texture(TEXTURE, UV);
    COLOR = vec4(mix(c.rgb, vec3(1.0), intensidad), c.a);
}` },
      { t: "Squash & stretch y todo junto", d: "Aplastar el sprite al aterrizar y estirarlo al saltar da elasticidad. Al recibir un golpe juntamos todos los efectos: destello, temblor, hit stop y empujón.", file: "jugador.gd", code: `func flash() -> void:
    var mat := $Sprite2D.material as ShaderMaterial
    mat.set_shader_parameter("intensidad", 1.0)
    create_tween().tween_method(
        func(v): mat.set_shader_parameter("intensidad", v), 1.0, 0.0, 0.15)

func squash(escala: Vector2) -> void:
    $Sprite2D.scale = escala
    create_tween().tween_property($Sprite2D, "scale", Vector2.ONE, 0.15).set_trans(Tween.TRANS_BACK)

# al saltar:     squash(Vector2(0.8, 1.2))
# al aterrizar:  squash(Vector2(1.25, 0.8))

func recibir_dano(cantidad: int, desde: Vector2) -> void:
    $Salud.recibir_dano(cantidad)
    flash()
    var camara = get_viewport().get_camera_2d()
    camara.agregar_trauma(0.5)
    Juego.hit_stop()
    velocity = desde.direction_to(global_position) * 300.0` },
    ],
    tips: ["Ofrece una opción para desactivar el temblor de pantalla: a algunas personas les marea.", "Menos es más: un hit stop de 0.05 s se nota; de 0.3 s parece un error.", "Combina con partículas y sonido con pitch aleatorio para el efecto completo."],
  },
  {
    id: "ia-movimiento", title: "IA de movimiento (steering)",
    lead: "Comportamientos clásicos de movimiento: perseguir, huir, llegar frenando, deambular y patrullar, combinables entre sí.",
    img: null,
    tree: [
      ["CharacterBody2D", "Enemigo", 0, "CharacterBody2D"],
      ["Sprite2D", "Sprite2D", 1, "Sprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["Marker2D", "Punto1 (en el nivel)", 0, "Marker2D"],
      ["Marker2D", "Punto2 (en el nivel)", 0, "Marker2D"],
    ],
    need: [
      ["CharacterBody2D (Floating)", "Ejemplo top-down: motion_mode = Floating."],
      ["Marker2D de patrulla", "Puntos en el nivel que arrastras a la lista 'puntos' del Inspector."],
      ["Un objetivo", "El jugador, asignado por código o por un Area2D de detección."],
    ],
    steps: [
      { t: "La base: velocidad deseada", d: "Cada comportamiento solo calcula hacia dónde QUERRÍA ir (la velocidad deseada). steer() acerca la velocidad real a esa deseada poco a poco, y así los giros son suaves en vez de instantáneos.", file: "ia_movimiento.gd", code: `extends CharacterBody2D

@export var max_vel := 160.0
@export var fuerza := 400.0   # cuánto puede cambiar la velocidad por segundo
var objetivo: Node2D

func steer(deseada: Vector2, delta: float) -> void:
    velocity = velocity.move_toward(deseada, fuerza * delta)
    move_and_slide()` },
      { t: "Perseguir y huir", d: "Seek: ve directo hacia el punto a máxima velocidad. Flee: lo contrario.", file: "ia_movimiento.gd", code: `func seek(punto: Vector2) -> Vector2:
    return global_position.direction_to(punto) * max_vel

func flee(punto: Vector2) -> Vector2:
    return -seek(punto)` },
      { t: "Llegar frenando", d: "Arrive es seek que reduce la velocidad dentro de un radio: no se pasa de largo ni tiembla en el destino.", file: "ia_movimiento.gd", code: `func arrive(punto: Vector2, radio_frenado := 80.0) -> Vector2:
    var distancia := global_position.distance_to(punto)
    var vel := max_vel * clampf(distancia / radio_frenado, 0.0, 1.0)
    return global_position.direction_to(punto) * vel` },
      { t: "Deambular y patrullar", d: "Wander cambia el rumbo un poco al azar cada frame: parece un animal paseando. Patrullar recorre una lista de puntos y vuelve a empezar.", file: "ia_movimiento.gd", code: `var angulo_wander := 0.0
@export var puntos: Array[Marker2D] = []
var indice := 0

func wander(delta: float) -> Vector2:
    angulo_wander += randf_range(-3.0, 3.0) * delta
    return Vector2.RIGHT.rotated(angulo_wander) * max_vel * 0.5

func patrullar() -> Vector2:
    var p := puntos[indice].global_position
    if global_position.distance_to(p) < 8:
        indice = (indice + 1) % puntos.size()
    return arrive(p, 40)` },
      { t: "Decide qué hacer", d: "Elegimos el comportamiento según la situación: si el jugador está cerca lo persigue; si hay puntos, patrulla; si no, deambula. Para huir cuando tiene poca vida bastaría otro if con flee().", file: "ia_movimiento.gd", code: `func _physics_process(delta: float) -> void:
    var deseada := Vector2.ZERO
    if objetivo and global_position.distance_to(objetivo.global_position) < 250:
        deseada = seek(objetivo.global_position)
    elif not puntos.is_empty():
        deseada = patrullar()
    else:
        deseada = wander(delta)
    steer(deseada, delta)` },
    ],
    tips: ["Para evitar paredes de forma inteligente, combina esto con NavigationAgent2D: usa get_next_path_position() como punto de seek.", "Sumar varias velocidades deseadas (seek + flee de los compañeros) crea grupos que no se amontonan.", "En plataformas, aplica solo el eje x del resultado y deja la gravedad aparte."],
  },
  {
    id: "ia-vision", title: "IA con visión (cono y línea de visión)",
    lead: "Un guardia que patrulla, te ve solo si estás en su cono y no hay paredes en medio, te persigue y busca donde te vio por última vez.",
    img: null,
    tree: [
      ["CharacterBody2D", "Guardia", 0, "CharacterBody2D"],
      ["Sprite2D", "Sprite2D", 1, "Sprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["Node2D", "Ojos", 1, "Node2D"],
      ["Area2D", "Vision", 2, "Area2D"],
      ["CollisionPolygon2D", "Cono", 3, "CollisionPolygon2D"],
      ["RayCast2D", "LineaVision", 2, "RayCast2D"],
      ["Timer", "Olvidar", 1, "Timer"],
      ["Label", "Alerta", 1, "Label"],
    ],
    need: [
      ["Node2D Ojos", "Gira hacia donde camina el guardia, llevando el cono y el rayo con él."],
      ["Area2D + CollisionPolygon2D", "El cono de visión: un triángulo con puntos (0,0), (220,-90) y (220,90). Máscara: capa del jugador."],
      ["RayCast2D LineaVision", "Comprueba que no haya paredes. Máscara: paredes y jugador."],
      ["Timer Olvidar", "One shot. Si pasa este tiempo sin verte, vuelve a patrullar."],
      ["Label Alerta", "Muestra ! al verte y ? cuando te busca."],
    ],
    steps: [
      { t: "¿Está en el cono?", d: "El Area2D solo sabe si el jugador está dentro del triángulo. Guardamos la referencia al entrar y la soltamos al salir. Todavía no significa que lo vea: puede haber una pared.", file: "guardia.gd", code: `extends CharacterBody2D

enum Estado { PATRULLA, PERSECUCION, BUSQUEDA }
var estado := Estado.PATRULLA
var jugador: Node2D
var ultima_posicion := Vector2.ZERO
@export var puntos: Array[Marker2D] = []
var indice := 0

@onready var vision: Area2D = $Ojos/Vision
@onready var rayo: RayCast2D = $Ojos/LineaVision

func _ready() -> void:
    vision.body_entered.connect(_on_vision_entra)
    vision.body_exited.connect(_on_vision_sale)
    $Olvidar.timeout.connect(_on_olvidar)

func _on_vision_entra(body: Node2D) -> void:
    if body.is_in_group("jugador"):
        jugador = body

func _on_vision_sale(body: Node2D) -> void:
    if body == jugador:
        jugador = null` },
      { t: "¿Lo ve de verdad?", d: "Apuntamos el rayo al jugador y lo actualizamos al momento. Si lo primero que toca es el jugador, no hay paredes en medio: lo ve.", file: "guardia.gd", code: `func puede_ver_jugador() -> bool:
    if jugador == null:
        return false
    rayo.target_position = rayo.to_local(jugador.global_position)
    rayo.force_raycast_update()
    return rayo.get_collider() == jugador` },
      { t: "Estados: patrullar, perseguir, buscar", d: "Mientras te ve, guarda tu posición y reinicia el Timer. Si te pierde, va al último sitio donde te vio y allí te busca. Si el Timer termina sin volver a verte, regresa a patrullar.", file: "guardia.gd", code: `func _physics_process(delta: float) -> void:
    if puede_ver_jugador():
        estado = Estado.PERSECUCION
        ultima_posicion = jugador.global_position
        $Olvidar.start(3.0)
        $Alerta.text = "!"
    match estado:
        Estado.PATRULLA:
            patrullar()
        Estado.PERSECUCION, Estado.BUSQUEDA:
            ir_hacia(ultima_posicion, 140.0)
            if global_position.distance_to(ultima_posicion) < 10:
                estado = Estado.BUSQUEDA
                $Alerta.text = "?"

func _on_olvidar() -> void:
    estado = Estado.PATRULLA
    $Alerta.text = ""` },
      { t: "Moverse y mirar", d: "Al moverse, los Ojos giran hacia la dirección de la velocidad: el cono siempre mira hacia donde camina el guardia.", file: "guardia.gd", code: `func ir_hacia(punto: Vector2, rapidez: float) -> void:
    velocity = global_position.direction_to(punto) * rapidez
    if global_position.distance_to(punto) < 4:
        velocity = Vector2.ZERO
    move_and_slide()
    if velocity.length() > 1:
        $Ojos.rotation = velocity.angle()

func patrullar() -> void:
    if puntos.is_empty():
        return
    var p := puntos[indice].global_position
    ir_hacia(p, 70.0)
    if global_position.distance_to(p) < 8:
        indice = (indice + 1) % puntos.size()` },
    ],
    tips: ["Añade un 'oído': un Area2D circular que pone al guardia en BUSQUEDA hacia un ruido sin verlo.", "Dibuja el cono con un Polygon2D semitransparente para que el jugador sepa dónde no meterse.", "Recuerda poner el jugador en el grupo \"jugador\" y las paredes en la máscara del RayCast2D."],
  },
  {
    id: "dialogos", title: "Diálogos con opciones",
    lead: "Conversaciones ramificadas escritas en un archivo JSON, con caja de diálogo, opciones elegibles y acciones (comprar, dar objetos).",
    img: DOC("bbcode_in_richtextlabel_effect_tornado.webp"),
    tree: [
      ["CanvasLayer", "Dialogo (Autoload)", 0, "CanvasLayer"],
      ["PanelContainer", "Panel", 1, "PanelContainer"],
      ["VBoxContainer", "VBoxContainer", 2, "VBoxContainer"],
      ["Label", "Nombre", 3, "Label"],
      ["RichTextLabel", "Texto", 3, "RichTextLabel"],
      ["VBoxContainer", "Opciones", 3, "VBoxContainer"],
    ],
    need: [
      ["Archivo JSON por conversación", "Cada nodo del diálogo tiene un id, quién habla, el texto y las opciones que llevan a otro id."],
      ["Escena Dialogo como Autoload", "Así cualquier NPC puede llamar a Dialogo.empezar(). process_mode = Always para que funcione con el juego en pausa."],
      ["Nombres únicos (%)", "Marca Nombre, Texto y Opciones con 'Acceso como nombre único'."],
      ["Filtro de exportación", "Proyecto → Exportar → Recursos → filtro de archivos no-recurso: *.json"],
    ],
    steps: [
      { t: "Escribe el diálogo como datos", d: "Separar el texto del código permite escribir conversaciones sin programar. Cada clave es un 'nodo' de la conversación; ir indica a cuál saltar y accion avisa al juego de que pase algo.", file: "res://dialogos/herrero.json", code: `{
  "inicio": {
    "quien": "Herrero",
    "texto": "¿Vienes por una espada?",
    "opciones": [
      {"texto": "Sí, ¿cuánto cuesta?", "ir": "precio"},
      {"texto": "Solo miraba.", "ir": "fin"}
    ]
  },
  "precio": {
    "quien": "Herrero",
    "texto": "50 monedas. ¿Trato?",
    "opciones": [
      {"texto": "Trato.", "ir": "fin", "accion": "comprar_espada"},
      {"texto": "Muy caro.", "ir": "fin"}
    ]
  },
  "fin": {"quien": "Herrero", "texto": "¡Vuelve cuando quieras!"}
}` },
      { t: "La caja de diálogo", d: "mostrar() pinta un nodo de la conversación: nombre, texto con efecto máquina de escribir y un botón por opción. Si un nodo no tiene opciones, se añade 'Continuar' que cierra el diálogo.", file: "dialogo.gd", code: `extends CanvasLayer

signal terminado
signal accion(nombre: String)

var datos: Dictionary
@onready var nombre: Label = %Nombre
@onready var texto: RichTextLabel = %Texto
@onready var opciones: VBoxContainer = %Opciones

func _ready() -> void:
    hide()

func empezar(ruta_json: String) -> void:
    datos = JSON.parse_string(FileAccess.get_file_as_string(ruta_json))
    show()
    get_tree().paused = true
    mostrar("inicio")

func mostrar(id: String) -> void:
    var nodo: Dictionary = datos[id]
    nombre.text = nodo.quien
    texto.text = nodo.texto
    texto.visible_ratio = 0.0
    create_tween().tween_property(texto, "visible_ratio", 1.0, 0.03 * nodo.texto.length())
    for b in opciones.get_children():
        b.queue_free()
    var lista: Array = nodo.get("opciones", [{"texto": "Continuar", "ir": ""}])
    for op in lista:
        var boton := Button.new()
        boton.text = op.texto
        boton.pressed.connect(_elegir.bind(op))
        opciones.add_child(boton)
    await get_tree().process_frame
    opciones.get_child(0).grab_focus()` },
      { t: "Elegir una opción", d: "Al pulsar una opción, si trae una acción se emite la señal accion; después saltamos al siguiente nodo o cerramos.", file: "dialogo.gd", code: `func _elegir(op: Dictionary) -> void:
    if op.has("accion"):
        accion.emit(op.accion)
    if op.ir == "" or not datos.has(op.ir):
        cerrar()
    else:
        mostrar(op.ir)

func cerrar() -> void:
    hide()
    get_tree().paused = false
    terminado.emit()` },
      { t: "Hablar con un NPC", d: "El NPC escucha las acciones solo mientras dura su conversación y decide qué significan.", file: "npc.gd", code: `func hablar() -> void:
    Dialogo.accion.connect(_on_accion)
    Dialogo.empezar("res://dialogos/herrero.json")
    await Dialogo.terminado
    Dialogo.accion.disconnect(_on_accion)

func _on_accion(nombre: String) -> void:
    if nombre == "comprar_espada" and Juego.monedas >= 50:
        Juego.monedas -= 50
        Inventario.agregar(preload("res://items/espada.tres"))` },
    ],
    tips: ["Sin el filtro *.json en la exportación, el juego exportado no encontrará los diálogos.", "Para condiciones (\"solo si tienes la llave\"), añade un campo si a la opción y compruébalo antes de crear el botón.", "Hay plugins completos de diálogo en la AssetLib (Dialogue Manager, Dialogic) si el proyecto crece."],
  },
  {
    id: "checkpoints", title: "Checkpoints y reaparecer",
    lead: "Banderas que guardan tu progreso en el nivel, zona de muerte y reaparición tras una animación.",
    img: null,
    tree: [
      ["Node", "Juego (Autoload)", 0, "Node"],
      ["Area2D", "Checkpoint", 0, "Area2D"],
      ["AnimatedSprite2D", "AnimatedSprite2D", 1, "AnimatedSprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["Area2D", "ZonaMuerte", 0, "Area2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
    ],
    need: [
      ["Autoload Juego", "Recuerda el último checkpoint aunque la escena se recargue."],
      ["Area2D Checkpoint", "Bandera con animaciones apagado y encendido."],
      ["Area2D ZonaMuerte", "Un rectángulo largo bajo el nivel (o sobre pinchos)."],
      ["Método morir() en el jugador", "Animación, recarga de escena y reaparición."],
    ],
    steps: [
      { t: "Memoria que sobrevive", d: "Al recargar la escena todo vuelve a empezar, salvo los Autoloads. Por eso el último checkpoint se guarda ahí.", file: "juego.gd (Autoload)", code: `extends Node

var checkpoint := Vector2.ZERO
var tiene_checkpoint := false` },
      { t: "La bandera", d: "Al tocarla se activa una sola vez y guarda su posición. En _ready comprueba si ya era el checkpoint activo, para mostrarse encendida tras recargar.", file: "checkpoint.gd", code: `extends Area2D

var activo := false

func _ready() -> void:
    body_entered.connect(_on_body_entered)
    if Juego.tiene_checkpoint and Juego.checkpoint == global_position:
        activo = true
        $AnimatedSprite2D.play("encendido")

func _on_body_entered(body: Node2D) -> void:
    if activo or not body.is_in_group("jugador"):
        return
    activo = true
    Juego.checkpoint = global_position
    Juego.tiene_checkpoint = true
    $AnimatedSprite2D.play("encendido")` },
      { t: "Morir y reaparecer", d: "Al morir se congela el movimiento, suena la animación y se recarga el nivel. En _ready el jugador se coloca en el checkpoint si existe.", file: "jugador.gd", code: `func _ready() -> void:
    if Juego.tiene_checkpoint:
        global_position = Juego.checkpoint

func morir() -> void:
    set_physics_process(false)
    $AnimatedSprite2D.play("morir")
    await $AnimatedSprite2D.animation_finished
    get_tree().reload_current_scene()` },
      { t: "La zona de muerte", d: "Cualquier cuerpo con un método morir() que entre aquí, muere.", file: "zona_muerte.gd", code: `extends Area2D

func _ready() -> void:
    body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node2D) -> void:
    if body.has_method("morir"):
        body.morir()` },
    ],
    tips: ["Al cambiar de nivel, pon Juego.tiene_checkpoint = false o aparecerás en el checkpoint del nivel anterior.", "Marca la posición un poco por encima del suelo para no reaparecer dentro de él.", "Combínalo con la receta de transición para un fundido a negro al morir."],
  },
  {
    id: "opciones", title: "Menú de opciones que se guarda",
    lead: "Volumen de música y efectos y pantalla completa, aplicados al instante y recordados entre partidas.",
    img: DOC("audio_buses2.webp"),
    tree: [
      ["Node", "Ajustes (Autoload)", 0, "Node"],
      ["Control", "Opciones", 0, "Control"],
      ["VBoxContainer", "VBoxContainer", 1, "VBoxContainer"],
      ["HSlider", "Musica", 2, "HSlider"],
      ["HSlider", "Efectos", 2, "HSlider"],
      ["CheckBox", "PantallaCompleta", 2, "CheckBox"],
      ["Button", "Volver", 2, "Button"],
    ],
    need: [
      ["Buses de audio Musica y Efectos", "Panel Audio (abajo) → Añadir bus. Cada AudioStreamPlayer elige su bus."],
      ["Autoload Ajustes", "Carga los ajustes al arrancar el juego y los aplica."],
      ["HSlider", "min_value 0, max_value 1, step 0.05."],
      ["ConfigFile", "Formato sencillo tipo .ini, ideal para opciones."],
    ],
    steps: [
      { t: "Ajustes globales", d: "Un Autoload guarda los valores, los aplica (volumen de cada bus, modo de ventana) y los lee o escribe en user://. Si es la primera vez y no hay archivo, usa los valores por defecto.", file: "ajustes.gd (Autoload)", code: `extends Node

const RUTA := "user://ajustes.cfg"
var musica := 0.8
var efectos := 0.8
var pantalla_completa := false

func _ready() -> void:
    cargar()
    aplicar()

func aplicar() -> void:
    AudioServer.set_bus_volume_db(AudioServer.get_bus_index("Musica"), linear_to_db(musica))
    AudioServer.set_bus_volume_db(AudioServer.get_bus_index("Efectos"), linear_to_db(efectos))
    DisplayServer.window_set_mode(
        DisplayServer.WINDOW_MODE_FULLSCREEN if pantalla_completa else DisplayServer.WINDOW_MODE_WINDOWED)

func guardar() -> void:
    var cfg := ConfigFile.new()
    cfg.set_value("audio", "musica", musica)
    cfg.set_value("audio", "efectos", efectos)
    cfg.set_value("video", "pantalla_completa", pantalla_completa)
    cfg.save(RUTA)

func cargar() -> void:
    var cfg := ConfigFile.new()
    if cfg.load(RUTA) != OK:
        return
    musica = cfg.get_value("audio", "musica", musica)
    efectos = cfg.get_value("audio", "efectos", efectos)
    pantalla_completa = cfg.get_value("video", "pantalla_completa", pantalla_completa)` },
      { t: "El menú", d: "Al abrirse, los controles muestran los valores actuales. Cada cambio se aplica al momento para que el jugador lo oiga, y se guarda al pulsar Volver.", file: "opciones.gd", code: `extends Control

func _ready() -> void:
    %Musica.value = Ajustes.musica
    %Efectos.value = Ajustes.efectos
    %PantallaCompleta.button_pressed = Ajustes.pantalla_completa
    %Musica.value_changed.connect(_on_musica)
    %Efectos.value_changed.connect(_on_efectos)
    %PantallaCompleta.toggled.connect(_on_pantalla)
    %Volver.pressed.connect(_on_volver)

func _on_musica(v: float) -> void:
    Ajustes.musica = v
    Ajustes.aplicar()

func _on_efectos(v: float) -> void:
    Ajustes.efectos = v
    Ajustes.aplicar()

func _on_pantalla(on: bool) -> void:
    Ajustes.pantalla_completa = on
    Ajustes.aplicar()

func _on_volver() -> void:
    Ajustes.guardar()
    hide()` },
    ],
    tips: ["linear_to_db(0) da -inf: el bus queda en silencio, que es justo lo que quieres con el slider al mínimo.", "Reproduce un sonido de prueba al soltar el slider de efectos para que el jugador oiga el volumen.", "Añade más opciones (idioma, sensibilidad) siguiendo el mismo patrón: variable, aplicar, guardar, cargar."],
  },
);

RECIPE_GROUPS.push(
  ["Técnicas", ["animaciones", "tweens", "raycast", "tilemaps", "game-feel"]],
  ["Inteligencia artificial", ["ia-movimiento", "ia-vision"]],
);
RECIPE_GROUPS.find(([g]) => g === "Sistemas de juego")[1].push("dialogos", "checkpoints", "opciones");

Object.assign(RECIPE_META, {
  animaciones: ["2D", "Intermedio", null],
  tweens: ["2D", "Básico", null],
  raycast: ["2D", "Intermedio", null],
  tilemaps: ["2D", "Intermedio", null],
  "game-feel": ["2D", "Básico", null],
  "ia-movimiento": ["2D", "Intermedio", null],
  "ia-vision": ["2D", "Avanzado", null],
  dialogos: ["UI", "Intermedio", null],
  checkpoints: ["2D", "Básico", null],
  opciones: ["UI", "Básico", null],
});

Object.assign(RECIPE_HOW, {
  animaciones: ["Una animación es una lista de keyframes: 'en el segundo X, esta propiedad vale Y'. Godot rellena el resto.", "AnimationPlayer puede animar cualquier cosa a la vez: el cuadro del sprite, si la hitbox está activa o llamar a una función. Así todo queda sincronizado.", "AnimationTree se pone por encima y decide qué animación toca y cómo pasar de una a otra, para que tu código solo diga 've a correr'."],
  tweens: ["Un Tween dice 'lleva esta propiedad de su valor actual a este otro en X segundos'.", "Se encadenan uno tras otro, o en paralelo con parallel(), y pueden repetirse o llamar funciones.", "Son ideales para efectos rápidos que no merecen una animación en el editor: aparecer, desvanecer, contar números."],
  raycast: ["Un raycast lanza una línea invisible y te dice qué es lo primero que toca y dónde.", "Con el nodo RayCast2D el rayo vive en la escena y se consulta cada frame; con intersect_ray lanzas uno puntual desde código.", "Las capas de colisión deciden qué puede tocar el rayo: así ignoras lo que no importa."],
  tilemaps: ["El TileSet es el catálogo de piezas y guarda todo lo que cada pieza sabe: colisión, terreno y tus propios datos.", "El TileMapLayer coloca piezas en una cuadrícula. Desde código conviertes posiciones del mundo en celdas para leer o cambiar tiles.", "Los terrenos eligen solos la pieza correcta según los vecinos, también cuando generas el nivel por código."],
  "game-feel": ["El game feel no cambia las reglas del juego, cambia cómo se sienten.", "Un golpe se nota más si la cámara tiembla, el tiempo se congela un instante, el sprite destella y el enemigo sale empujado.", "Cada efecto es pequeño; juntos convierten un golpe flojo en uno satisfactorio."],
  "ia-movimiento": ["Cada comportamiento calcula una 'velocidad deseada': hacia dónde querría ir y a qué velocidad.", "La velocidad real se acerca a la deseada poco a poco, por eso el movimiento parece natural y no robótico.", "Combinando comportamientos (perseguir, huir, patrullar, deambular) obtienes enemigos variados con muy poco código."],
  "ia-vision": ["Ver tiene dos partes: estar dentro del campo de visión (el cono) y que no haya obstáculos en medio (el rayo).", "Con eso el guardia pasa por tres estados: patrullar, perseguir mientras te ve y buscar donde te vio por última vez.", "Un Timer decide cuándo se rinde y vuelve a su ruta."],
  dialogos: ["El texto vive en un archivo JSON aparte del código: puedes escribir conversaciones sin programar.", "La caja de diálogo lee un nodo de la conversación, lo muestra y crea un botón por cada opción.", "Las opciones llevan a otro nodo o disparan acciones (comprar, dar objetos) que el NPC interpreta."],
  checkpoints: ["Al morir se recarga la escena y todo vuelve a su estado inicial, menos los Autoloads.", "Por eso el último checkpoint tocado se guarda en un Autoload.", "Al cargar el nivel, el jugador mira si hay un checkpoint guardado y aparece allí."],
  opciones: ["Los ajustes viven en un Autoload que se carga al arrancar el juego y los aplica.", "El menú solo cambia esos valores y pide aplicarlos: el jugador oye el cambio al momento.", "Al salir se guardan en user:// con ConfigFile, así se recuerdan en la próxima partida."],
});

/* =========================================================
   NODOS
   ========================================================= */
NODES.push(
  {
    name: "TextureButton", cat: "ui", icon: "TextureButton",
    short: "Botón hecho solo con imágenes: una para normal, otra al pulsar, otra al pasar el mouse.",
    use: "Botones con arte propio (pixel art, iconos grandes) sin el estilo de los botones normales.",
    props: ["texture_normal", "texture_pressed", "texture_hover", "ignore_texture_size", "stretch_mode"],
    methods: [],
    signals: ["pressed", "toggled(toggled_on)"],
    code: `$Jugar.texture_normal = preload("res://ui/jugar.png")
$Jugar.texture_hover = preload("res://ui/jugar_hover.png")
$Jugar.pressed.connect(empezar)`,
  },
  {
    name: "TouchScreenButton", cat: "ui", icon: "TouchScreenButton",
    short: "Botón táctil para móviles que puede disparar una acción del Input Map.",
    use: "Controles en pantalla para móvil: flechas, saltar, disparar. El código sigue usando Input como con teclado.",
    props: ["texture_normal", "action", "visibility_mode", "shape"],
    methods: [],
    signals: ["pressed", "released"],
    code: `# Botón táctil con action = "saltar":
# tu código no cambia, Input.is_action_just_pressed("saltar") funciona igual.
# visibility_mode = Touchscreen Only → solo se ve en dispositivos táctiles.`,
  },
  {
    name: "VisibleOnScreenEnabler2D", cat: "util", icon: "VisibleOnScreenEnabler2D",
    short: "Activa o pausa automáticamente un nodo según esté en pantalla o no.",
    use: "Enemigos y trampas que solo funcionan cuando el jugador puede verlos. Ahorra rendimiento en niveles grandes.",
    props: ["enable_mode", "enable_node_path", "rect"],
    methods: [],
    signals: ["screen_entered", "screen_exited"],
    code: `# Hijo del enemigo, enable_node_path = ".." :
# fuera de pantalla el enemigo deja de procesarse; al volver, sigue.`,
  },
  {
    name: "DirectionalLight2D", cat: "2d", icon: "DirectionalLight2D",
    short: "Luz 2D que ilumina toda la escena desde una dirección, como el sol.",
    use: "Luz ambiental con sombras largas en todo el nivel, ciclos día/noche en 2D.",
    props: ["energy", "color", "shadow_enabled", "height"],
    methods: [],
    signals: [],
    code: `func atardecer() -> void:
    create_tween().tween_property($Sol, "color", Color(1.0, 0.6, 0.4), 5.0)`,
  },
  {
    name: "NavigationAgent3D", cat: "3d", icon: "NavigationAgent3D",
    short: "Pathfinding en 3D: calcula el camino hacia un destino sobre un NavigationMesh.",
    use: "Enemigos y NPCs que caminan por escenarios 3D evitando obstáculos.",
    props: ["target_position", "path_desired_distance", "avoidance_enabled"],
    methods: ["get_next_path_position()", "is_navigation_finished()"],
    signals: ["navigation_finished", "velocity_computed(safe_velocity)"],
    code: `func _physics_process(_delta: float) -> void:
    $Agente.target_position = jugador.global_position
    if $Agente.is_navigation_finished():
        return
    var siguiente: Vector3 = $Agente.get_next_path_position()
    velocity = global_position.direction_to(siguiente) * 4.0
    move_and_slide()`,
  },
  {
    name: "NavigationRegion3D", cat: "3d", icon: "NavigationRegion3D",
    short: "Zona caminable en 3D: genera un NavigationMesh a partir de la geometría del nivel.",
    use: "Selecciónalo, crea un NavigationMesh y pulsa 'Bake NavigationMesh'. Las mallas hijas definen el suelo caminable.",
    props: ["navigation_mesh", "enabled"],
    methods: ["bake_navigation_mesh()"],
    signals: ["bake_finished"],
    code: `# Si el nivel cambia en tiempo de ejecución (puerta abierta, muro roto):
$NavigationRegion3D.bake_navigation_mesh()`,
  },
  {
    name: "GPUParticles3D", cat: "3d", icon: "GPUParticles3D",
    short: "Partículas en 3D: humo, fuego, chispas, lluvia.",
    use: "Igual que en 2D, pero cada partícula necesita una malla (draw_pass_1), por ejemplo un QuadMesh con billboard.",
    props: ["amount", "lifetime", "one_shot", "emitting", "process_material", "draw_pass_1"],
    methods: ["restart()"],
    signals: ["finished"],
    code: `func impacto(pos: Vector3) -> void:
    $Chispas.global_position = pos
    $Chispas.restart()`,
  },
  {
    name: "Skeleton3D + BoneAttachment3D", cat: "3d", icon: "Skeleton3D",
    short: "El esqueleto de un modelo animado y un nodo que se pega a uno de sus huesos.",
    use: "Poner un arma en la mano del personaje, un sombrero en la cabeza o partículas en el pie, siguiendo la animación.",
    props: ["bone_name"],
    methods: ["find_bone(nombre)", "get_bone_global_pose(i)"],
    signals: [],
    code: `# Personaje.glb
#  └─ Skeleton3D
#      └─ BoneAttachment3D (bone_name = "mano.R")
#          └─ Espada (MeshInstance3D)`,
  },
  {
    name: "VehicleBody3D", cat: "3d", icon: "VehicleBody3D",
    short: "Coche con física: motor, frenos, dirección y ruedas con suspensión (VehicleWheel3D).",
    use: "Juegos de carreras, vehículos conducibles en mundo abierto.",
    props: ["engine_force", "brake", "steering", "use_as_traction", "use_as_steering", "suspension_stiffness"],
    methods: [],
    signals: [],
    code: `extends VehicleBody3D

func _physics_process(delta: float) -> void:
    steering = move_toward(steering, Input.get_axis("derecha", "izquierda") * 0.4, delta * 2)
    engine_force = Input.get_axis("frenar", "acelerar") * 300.0`,
  },
  {
    name: "Path3D + PathFollow3D", cat: "3d", icon: "PathFollow3D",
    short: "Una curva en 3D y un nodo que viaja por ella.",
    use: "Cámaras de cinemática, trenes, enemigos voladores con ruta fija.",
    props: ["curve", "progress", "progress_ratio", "loop"],
    methods: [],
    signals: [],
    code: `func _process(delta: float) -> void:
    $Path3D/PathFollow3D.progress += 3.0 * delta`,
  },
  {
    name: "Decal", cat: "3d", icon: "Decal",
    short: "Proyecta una imagen sobre las superficies 3D, como una pegatina.",
    use: "Agujeros de bala, manchas, grafitis, sombras falsas bajo personajes.",
    props: ["texture_albedo", "size", "upper_fade", "cull_mask"],
    methods: [],
    signals: [],
    code: `const AGUJERO := preload("res://efectos/agujero_decal.tscn")

# Un Decal proyecta hacia su -Y local: tal cual, pinta sobre el suelo
func agujero_en_suelo(pos: Vector3) -> void:
    var d: Decal = AGUJERO.instantiate()
    get_tree().current_scene.add_child(d)
    d.global_position = pos
    d.rotate_y(randf() * TAU)  # variación`,
  },
  {
    name: "MultiMeshInstance3D", cat: "3d", icon: "MultiMeshInstance3D",
    short: "Dibuja miles de copias de la misma malla con un solo draw call.",
    use: "Hierba, árboles, rocas o asteroides en grandes cantidades sin hundir los FPS.",
    props: ["multimesh", "instance_count"],
    methods: ["set_instance_transform(i, t)"],
    signals: [],
    code: `func _ready() -> void:
    var mm: MultiMesh = $Hierba.multimesh
    mm.instance_count = 2000
    for i in mm.instance_count:
        var pos := Vector3(randf_range(-50, 50), 0, randf_range(-50, 50))
        mm.set_instance_transform(i, Transform3D(Basis(), pos))`,
  },
);

Object.assign(NODE_IDEAS, {
  "TextureButton": { like: "Un botón que es solo un dibujo, con una versión para cada estado.", games: ["Botones de menú pixel art.", "Iconos de habilidades en la barra de acción.", "Mapa del mundo con niveles clicables."] },
  "TouchScreenButton": { like: "Una tecla pintada en la pantalla del móvil.", games: ["Cruceta y botón de salto en un plataformas móvil.", "Botón de pausa táctil.", "Botón de disparo que se mantiene pulsado."] },
  "VisibleOnScreenEnabler2D": { like: "Un interruptor automático que apaga lo que nadie está mirando.", games: ["Enemigos que no se mueven hasta que entran en cámara.", "Trampas que solo se activan cerca del jugador.", "Niveles enormes que siguen fluidos."] },
  "DirectionalLight2D": { like: "El sol de un mundo 2D.", games: ["Ciclo de día y noche.", "Sombras largas al atardecer.", "Tormenta con relámpagos animando energy."] },
  "NavigationAgent3D": { like: "El GPS de un personaje 3D.", games: ["Zombis que te persiguen por un edificio.", "Aldeanos que van a trabajar y vuelven a casa.", "Unidades de un RTS 3D."] },
  "NavigationRegion3D": { like: "El plano de las zonas por donde se puede caminar en 3D.", games: ["Suelo de una mazmorra 3D.", "Calles de una ciudad para los NPC.", "Recalcular rutas al derribar un muro."] },
  "GPUParticles3D": { like: "La máquina de confeti en 3D.", games: ["Humo de una chimenea.", "Chispas de un impacto de bala.", "Nieve cayendo sobre el mapa."] },
  "Skeleton3D + BoneAttachment3D": { like: "El esqueleto de un muñeco y un velcro pegado a uno de sus huesos.", games: ["Espada en la mano que sigue la animación.", "Linterna en la cabeza.", "Polvo saliendo del pie al pisar."] },
  "VehicleBody3D": { like: "Un coche de juguete con motor, volante y amortiguadores.", games: ["Juego de carreras.", "Vehículo para recorrer un mundo abierto.", "Kart con derrapes."] },
  "Path3D + PathFollow3D": { like: "Las vías de un tren en 3D y el vagón que las recorre.", games: ["Cámara de cinemática que sobrevuela el nivel.", "Montaña rusa.", "Dragón que vuela en círculos sobre el castillo."] },
  "Decal": { like: "Una pegatina proyectada sobre las paredes.", games: ["Agujeros de bala.", "Manchas de sangre o pintura.", "Marcas de neumático en el suelo."] },
  "MultiMeshInstance3D": { like: "Una fotocopiadora de mallas que dibuja miles de copias de golpe.", games: ["Campo de hierba.", "Bosque de árboles.", "Campo de asteroides."] },
});

// Miembros nuevos para que las fichas de estos nodos sean clicables
P("texture_normal", "Imagen del botón en reposo.", "Es la única obligatoria; las demás son opcionales.", null);
P("texture_pressed", "Imagen mientras se mantiene pulsado.", null, null);
P("texture_hover", "Imagen al pasar el mouse por encima.", null, null);
P("ignore_texture_size", "Permite que el botón tenga otro tamaño que el de su imagen.", "Actívalo junto con stretch_mode para escalarlo.", null);
P("action", "Acción del Input Map que dispara el botón táctil.", "Así el resto del código no sabe si fue teclado o pantalla.", `action = "saltar"`);
P("visibility_mode", "Cuándo se ve el botón táctil: siempre o solo en pantallas táctiles.", null, null);
P("enable_mode", "Si pausar el nodo heredando, siempre o al quedar fuera de pantalla.", null, null);
P("enable_node_path", "El nodo que se activa y desactiva según la visibilidad.", null, `enable_node_path = NodePath("..")`);
P("height", "Altura de la luz direccional 2D: afecta a la forma de las sombras con normal maps.", null, null);
P("navigation_mesh", "La malla de navegación 3D con la zona caminable.", null, null);
P("draw_pass_1", "Malla con la que se dibuja cada partícula 3D.", "Un QuadMesh con material billboard es lo más común.", null);
P("bone_name", "Hueso al que se pega el BoneAttachment3D.", "Los nombres vienen del modelo importado.", `bone_name = "mano.R"`);
P("engine_force", "Fuerza del motor. Positiva acelera, negativa da marcha atrás.", null, `engine_force = 300.0`);
P("brake", "Fuerza de frenado.", null, `brake = 5.0`);
P("steering", "Ángulo de giro de las ruedas en radianes.", null, `steering = 0.3`);
P("use_as_traction", "La rueda recibe la fuerza del motor (tracción).", null, null);
P("use_as_steering", "La rueda gira con la dirección.", null, null);
P("suspension_stiffness", "Dureza de la suspensión: alto = coche de carreras, bajo = todoterreno.", null, null);
P("texture_albedo", "Imagen que proyecta el Decal.", null, null);
P("upper_fade", "Cuánto se difumina el Decal hacia arriba.", null, null);
P("cull_mask", "Capas visuales sobre las que se proyecta.", null, null);
P("multimesh", "Recurso MultiMesh con la malla y las transformaciones de todas las copias.", null, null);
P("instance_count", "Número de copias que dibuja el MultiMesh.", null, `multimesh.instance_count = 1000`);
M("bake_navigation_mesh", "Recalcula la malla de navegación 3D.", null, null);
M("find_bone", "Índice de un hueso a partir de su nombre, o -1.", null, `var i: int = $Skeleton3D.find_bone("cabeza")`);
M("get_bone_global_pose", "Transformación global de un hueso.", null, null);
M("set_instance_transform", "Coloca la copia número i del MultiMesh.", null, `mm.set_instance_transform(0, Transform3D(Basis(), Vector3(2, 0, 0)))`);
S("released", "Se soltó el botón táctil.", "Para acciones que se cargan mientras se mantiene pulsado.", null);

/* =========================================================
   SEÑALES
   ========================================================= */
SIGNALS.push(
  {
    node: "CollisionObject2D", signal: "input_event(viewport, event, shape_idx)", when: "Se hace clic o toque sobre un cuerpo o área con input_pickable = true.", example: "Seleccionar unidades o recoger objetos con el mouse.",
    params: [["viewport", "Node", "El viewport que recibió el evento."], ["event", "InputEvent", "El evento (clic, movimiento, toque)."], ["shape_idx", "int", "Índice de la forma de colisión tocada."]],
    code: `extends Area2D  # objeto_clicable.gd  (input_pickable = true)

func _ready() -> void:
    input_event.connect(_on_input_event)

func _on_input_event(_viewport: Node, event: InputEvent, _shape_idx: int) -> void:
    if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
        recoger()`,
  },
  {
    node: "NavigationAgent2D", signal: "velocity_computed(safe_velocity)", when: "Con avoidance activado, tras pedir una velocidad con set_velocity().", example: "Grupos de enemigos que se esquivan entre sí.",
    params: [["safe_velocity", "Vector2", "Velocidad ajustada para no chocar con otros agentes."]],
    code: `extends CharacterBody2D  # enemigo_grupo.gd

func _ready() -> void:
    $NavigationAgent2D.avoidance_enabled = true
    $NavigationAgent2D.velocity_computed.connect(_on_velocity_computed)

func _physics_process(_delta: float) -> void:
    var siguiente: Vector2 = $NavigationAgent2D.get_next_path_position()
    $NavigationAgent2D.set_velocity(global_position.direction_to(siguiente) * 120.0)

func _on_velocity_computed(safe_velocity: Vector2) -> void:
    velocity = safe_velocity
    move_and_slide()`,
  },
  {
    node: "AnimatedSprite2D", signal: "frame_changed", when: "Cambia el cuadro mostrado.", example: "Sonido de pasos en cuadros concretos.",
    params: [],
    code: `extends AnimatedSprite2D  # pasos.gd

func _ready() -> void:
    frame_changed.connect(_on_frame_changed)

func _on_frame_changed() -> void:
    if animation == "correr" and frame in [1, 4]:
        $Paso.pitch_scale = randf_range(0.9, 1.1)
        $Paso.play()`,
  },
  {
    node: "VisibleOnScreenNotifier2D", signal: "screen_entered", when: "Entra en pantalla.", example: "Despertar a un enemigo cuando aparece en cámara.",
    params: [],
    code: `extends CharacterBody2D  # enemigo.gd

func _ready() -> void:
    set_physics_process(false)
    $VisibleOnScreenNotifier2D.screen_entered.connect(_on_screen_entered)

func _on_screen_entered() -> void:
    set_physics_process(true)
    $AnimatedSprite2D.play("despertar")`,
  },
  {
    node: "Control", signal: "focus_entered", when: "El control recibe el foco del teclado o mando.", example: "Sonido y resaltado al navegar el menú con mando.",
    params: [],
    code: `extends Button  # boton_menu.gd

func _ready() -> void:
    focus_entered.connect(_on_focus_entered)

func _on_focus_entered() -> void:
    $SonidoNavegar.play()
    create_tween().tween_property(self, "scale", Vector2(1.05, 1.05), 0.08)`,
  },
  {
    node: "RichTextLabel", signal: "meta_clicked(meta)", when: "Se hace clic en un enlace [url] del texto.", example: "Palabras clave clicables en un diálogo o un códice.",
    params: [["meta", "Variant", "Lo que pusiste dentro de [url=...]. Normalmente un String."]],
    code: `extends RichTextLabel  # codice.gd

func _ready() -> void:
    bbcode_enabled = true
    text = "Busca la [url=espada_antigua]Espada Antigua[/url] en el templo."
    meta_clicked.connect(_on_meta_clicked)

func _on_meta_clicked(meta: Variant) -> void:
    mostrar_entrada(str(meta))`,
  },
  {
    node: "ItemList / OptionButton", signal: "item_selected(index)", when: "Se elige un ítem de la lista o del desplegable.", example: "Elegir idioma o nivel.",
    params: [["index", "int", "Posición del ítem elegido (empieza en 0)."]],
    code: `extends Control  # selector_idioma.gd

const IDIOMAS := ["es", "en", "pt"]

func _ready() -> void:
    $Idioma.item_selected.connect(_on_idioma_selected)

func _on_idioma_selected(index: int) -> void:
    TranslationServer.set_locale(IDIOMAS[index])`,
  },
  {
    node: "AcceptDialog / ConfirmationDialog", signal: "confirmed", when: "Se pulsa Aceptar.", example: "Confirmar salir sin guardar.",
    params: [],
    code: `extends Control  # menu_pausa.gd

func _ready() -> void:
    $Salir.pressed.connect($Confirmar.popup_centered)
    $Confirmar.confirmed.connect(_on_confirmado)

func _on_confirmado() -> void:
    get_tree().paused = false
    get_tree().change_scene_to_file("res://menu.tscn")`,
  },
  {
    node: "Viewport", signal: "size_changed", when: "Cambia el tamaño de la ventana o del viewport.", example: "Recolocar elementos o ajustar el zoom al cambiar de resolución.",
    params: [],
    code: `extends Camera2D  # camara_adaptable.gd

func _ready() -> void:
    get_viewport().size_changed.connect(_on_size_changed)
    _on_size_changed()

func _on_size_changed() -> void:
    var alto := get_viewport_rect().size.y
    zoom = Vector2.ONE * (alto / 360.0)`,
  },
  {
    node: "TouchScreenButton", signal: "released", when: "Se suelta el botón táctil.", example: "Soltar un ataque cargado.",
    params: [],
    code: `extends TouchScreenButton  # boton_carga.gd

var inicio := 0

func _ready() -> void:
    pressed.connect(func(): inicio = Time.get_ticks_msec())
    released.connect(_on_released)

func _on_released() -> void:
    var cargado := (Time.get_ticks_msec() - inicio) / 1000.0
    owner.disparar_cargado(min(cargado, 2.0))`,
  },
  {
    node: "Area2D / Area3D", signal: "area_exited(area)", when: "Otra Area sale de esta.", example: "Dejar de estar en una zona de curación.",
    params: [["area", "Area2D (Area3D en 3D)", "El área que salió."]],
    code: `extends Area2D  # zona_curacion.gd

var dentro: Array[Area2D] = []

func _ready() -> void:
    area_entered.connect(func(a): dentro.append(a))
    area_exited.connect(_on_area_exited)

func _on_area_exited(area: Area2D) -> void:
    dentro.erase(area)`,
  },
  {
    node: "Tu propio script", signal: "vida_cambio(actual, maxima)", when: "Cuando tú la emites con emit(). Las señales propias se declaran con signal.", example: "Avisar al HUD de que cambió la vida sin que el jugador conozca al HUD.",
    params: [["actual", "int", "Lo que tú decidas enviar: aquí, la vida actual."], ["maxima", "int", "Puedes declarar tantos parámetros como quieras."]],
    code: `# jugador.gd
signal vida_cambio(actual: int, maxima: int)

var vida := 5

func recibir_dano(n: int) -> void:
    vida -= n
    vida_cambio.emit(vida, 5)

# hud.gd
func _ready() -> void:
    $"../Jugador".vida_cambio.connect(_on_vida_cambio)

func _on_vida_cambio(actual: int, maxima: int) -> void:
    %BarraVida.max_value = maxima
    %BarraVida.value = actual`,
  },
);

Object.assign(SIGNAL_IDEAS, {
  "CollisionObject2D · input_event(viewport, event, shape_idx)": ["Hacer clic en un cofre para abrirlo.", "Seleccionar tropas en un juego de estrategia.", "Puzles de point & click."],
  "NavigationAgent2D · velocity_computed(safe_velocity)": ["Hordas que no se amontonan en un pasillo.", "Tráfico de NPCs en una ciudad.", "Unidades de un RTS que se apartan entre sí."],
  "AnimatedSprite2D · frame_changed": ["Pasos sincronizados con la animación.", "Activar la hitbox justo en el cuadro del golpe.", "Soltar polvo en el cuadro en que aterriza."],
  "VisibleOnScreenNotifier2D · screen_entered": ["El jefe ruge al aparecer en pantalla.", "Activar enemigos cuando entran en cámara.", "Empezar la música de una zona."],
  "Control · focus_entered": ["Sonido al moverse por el menú con mando.", "Mostrar la descripción de la opción elegida.", "Hacer scroll hasta el botón enfocado."],
  "RichTextLabel · meta_clicked(meta)": ["Palabras clave clicables en un diálogo.", "Enlaces en los créditos.", "Glosario dentro del juego."],
  "ItemList / OptionButton · item_selected(index)": ["Cambiar el idioma.", "Elegir la resolución.", "Seleccionar una partida guardada."],
  "AcceptDialog / ConfirmationDialog · confirmed": ["Salir sin guardar.", "Borrar una partida.", "Comprar algo caro."],
  "Viewport · size_changed": ["Ajustar el zoom a la resolución.", "Recolocar el HUD en pantallas ultrapanorámicas.", "Pausar si la ventana se hace muy pequeña."],
  "TouchScreenButton · released": ["Soltar un ataque cargado.", "Dejar de correr al levantar el dedo.", "Terminar de apuntar con un arco."],
  "Area2D / Area3D · area_exited(area)": ["Salir de una zona de curación.", "El escudo deja de proteger a un aliado.", "Un proyectil sale del radio de un imán."],
  "Tu propio script · vida_cambio(actual, maxima)": ["Actualizar la barra de vida del HUD.", "Pantalla roja cuando queda poca vida.", "Logros que escuchan eventos del juego."],
});

/* =========================================================
   FUNCIONES
   ========================================================= */
FUNCTIONS.push(
  { name: "get_node_or_null()", group: "Nodos", desc: "Como get_node(), pero devuelve null en vez de dar error si el nodo no existe.", code: `var jefe = get_node_or_null("Jefe")\nif jefe:\n    jefe.enfadar()` },
  { name: "is_instance_valid()", group: "Nodos", desc: "Comprueba que un objeto existe y no fue borrado. Imprescindible antes de usar referencias guardadas.", code: `if is_instance_valid(objetivo):\n    mirar(objetivo.global_position)` },
  { name: "get_tree().create_timer()", group: "Escenas", desc: "Crea un temporizador de usar y tirar, sin añadir un nodo Timer.", code: `await get_tree().create_timer(1.5).timeout\nexplotar()` },
  { name: "get_tree().get_nodes_in_group()", group: "Nodos", desc: "Todos los nodos de un grupo.", code: `for e in get_tree().get_nodes_in_group("enemigos"):\n    e.queue_free()` },
  { name: "get_tree().call_group()", group: "Nodos", desc: "Llama a una función en todos los nodos de un grupo a la vez.", code: `get_tree().call_group("enemigos", "congelar", 2.0)` },
  { name: "Input.is_action_pressed()", group: "Input", desc: "true mientras se mantiene pulsada la acción (no solo el primer frame).", code: `if Input.is_action_pressed("disparar"):\n    arma.disparar(dir)` },
  { name: "get_global_mouse_position()", group: "Input", desc: "Posición del mouse en coordenadas del mundo, teniendo en cuenta la cámara.", code: `look_at(get_global_mouse_position())` },
  { name: "Vector2.angle() / rotated()", group: "Matemática", desc: "angle(): ángulo de un vector en radianes. rotated(): el vector girado un ángulo.", code: `rotation = velocity.angle()\nvar abanico := dir.rotated(deg_to_rad(15))` },
  { name: "deg_to_rad() / rad_to_deg()", group: "Matemática", desc: "Convierte entre grados y radianes. Godot usa radianes internamente.", code: `rotation = deg_to_rad(90)\nprint(rad_to_deg(rotation))  # 90` },
  { name: "has_method() / call()", group: "GDScript", desc: "Pregunta si un objeto tiene una función y la llama por su nombre.", code: `if body.has_method("recibir_dano"):\n    body.call("recibir_dano", 1)` },
  { name: "JSON.stringify() / parse_string()", group: "Datos", desc: "Convierte datos a texto JSON y al revés. Base de guardados y diálogos.", code: `var texto := JSON.stringify({"vida": 3})\nvar datos = JSON.parse_string(texto)` },
  { name: "Array.pick_random() / shuffle()", group: "Datos", desc: "pick_random(): un elemento al azar. shuffle(): desordena el array.", code: `var botin = ["oro", "pocion", "llave"].pick_random()\nmazo.shuffle()` },
  { name: "Dictionary.get() / has()", group: "Datos", desc: "get(clave, por_defecto): lee sin error si no existe. has(clave): comprueba si existe.", code: `var vida = datos.get("vida", 3)\nif datos.has("arma"): equipar(datos.arma)` },
  { name: "wrapi() / wrapf()", group: "Matemática", desc: "Mantiene un número dentro de un rango dando la vuelta: después del máximo vuelve al mínimo.", code: `indice = wrapi(indice + 1, 0, armas.size())` },
  { name: "intersect_ray()", group: "Física", desc: "Lanza un rayo por código, sin nodo RayCast2D.", code: `var q := PhysicsRayQueryParameters2D.create(a, b)\nvar r := get_world_2d().direct_space_state.intersect_ray(q)` },
  { name: "print() / push_warning()", group: "Depuración", desc: "print escribe en la salida; push_warning y push_error además aparecen en el panel Depurador con su línea.", code: `print("vida: ", vida)\npush_warning("Ruta de diálogo no encontrada")` },
);

Object.assign(FN_SIG, {
  "get_node_or_null()": { p: [["path", "NodePath", "Ruta del nodo."]], r: ["Node", "El nodo, o null si no existe."] },
  "is_instance_valid()": { p: [["instance", "Variant", "El objeto a comprobar."]], r: ["bool", "true si existe y no fue liberado."] },
  "get_tree().create_timer()": { p: [["time_sec", "float", "Segundos a esperar."], ["process_always", "bool = true", "Si sigue contando con el juego en pausa."], ["process_in_physics", "bool = false", "Si cuenta en los pasos de física."], ["ignore_time_scale", "bool = false", "Si ignora Engine.time_scale."]], r: ["SceneTreeTimer", "Un temporizador con la señal timeout. Se borra solo."] },
  "get_tree().get_nodes_in_group()": { p: [["group", "StringName", "Nombre del grupo."]], r: ["Array[Node]", "Los nodos del grupo en el árbol (puede estar vacío)."] },
  "get_tree().call_group()": { p: [["group", "StringName", "Nombre del grupo."], ["method", "StringName", "Función a llamar."], ["...args", "Variant", "Argumentos de la función."]], r: ["void", "Nada. Los nodos sin esa función se ignoran."] },
  "Input.is_action_pressed()": { p: [["action", "StringName", "Nombre de la acción."], ["exact_match", "bool = false", "Opcional. Ignorar si hay modificadores extra."]], r: ["bool", "true mientras se mantiene pulsada."] },
  "get_global_mouse_position()": { p: [], r: ["Vector2", "Posición del mouse en el mundo 2D."] },
  "Vector2.angle() / rotated()": { p: [["angle (solo rotated)", "float", "Ángulo en radianes a girar."]], r: ["float / Vector2", "angle(): radianes entre -π y π. rotated(): un vector nuevo girado."] },
  "deg_to_rad() / rad_to_deg()": { p: [["valor", "float", "Ángulo en grados o en radianes."]], r: ["float", "El mismo ángulo en la otra unidad."] },
  "has_method() / call()": { p: [["method", "StringName", "Nombre de la función."], ["...args (solo call)", "Variant", "Argumentos a pasar."]], r: ["bool / Variant", "has_method devuelve si existe; call devuelve lo que devuelva la función."] },
  "JSON.stringify() / parse_string()": { p: [["data / json_string", "Variant / String", "Los datos a convertir, o el texto JSON a leer."], ["indent (solo stringify)", "String = \"\"", "Opcional. Por ejemplo \"  \" para que el texto quede legible."]], r: ["String / Variant", "stringify: el texto. parse_string: Dictionary o Array, o null si el texto es inválido."] },
  "Array.pick_random() / shuffle()": { p: [], r: ["Variant / void", "pick_random: un elemento al azar (null si está vacío). shuffle: nada, desordena el propio array."] },
  "Dictionary.get() / has()": { p: [["key", "Variant", "La clave a buscar."], ["default (solo get)", "Variant = null", "Valor si la clave no existe."]], r: ["Variant / bool", "get: el valor o el valor por defecto. has: true si la clave existe."] },
  "wrapi() / wrapf()": { p: [["value", "int / float", "Valor a ajustar."], ["min", "int / float", "Mínimo (incluido)."], ["max", "int / float", "Máximo (excluido)."]], r: ["int / float", "El valor dentro del rango, dando la vuelta."] },
  "intersect_ray()": { p: [["parameters", "PhysicsRayQueryParameters2D", "Origen, destino, máscara y objetos a excluir."]], r: ["Dictionary", "Vacío si no tocó nada; si no: position, normal, collider, collider_id, rid, shape."] },
  "print() / push_warning()": { p: [["...args", "Variant", "Lo que quieras mostrar; print acepta varios valores."]], r: ["void", "Nada."] },
});

/* =========================================================
   DICCIONARIO
   ========================================================= */
GLOSSARY.push(
  { term: "Steering behaviors", tag: "IA", def: "Técnica de movimiento para IA: cada comportamiento (perseguir, huir, deambular) calcula una velocidad deseada y el personaje gira hacia ella poco a poco. Se pueden sumar para mezclar comportamientos." },
  { term: "Seek / Flee / Arrive", tag: "IA", def: "Los steering más básicos: Seek va hacia un punto, Flee se aleja y Arrive llega frenando sin pasarse.", code: `var deseada := global_position.direction_to(objetivo) * max_vel\nvelocity = velocity.move_toward(deseada, fuerza * delta)` },
  { term: "Wander", tag: "IA", def: "Deambular: cambiar el rumbo un poco al azar cada frame para que un personaje parezca pasear sin destino." },
  { term: "Línea de visión", tag: "IA", def: "Comprobar si entre dos puntos no hay obstáculos, normalmente con un raycast. Sin ella, los enemigos te 'ven' a través de las paredes." },
  { term: "Cono de visión", tag: "IA", def: "Zona en forma de triángulo delante de un enemigo donde puede ver. Se hace con un Area2D y un CollisionPolygon2D, y se confirma con línea de visión." },
  { term: "Trauma (screen shake)", tag: "Game feel", def: "Valor de 0 a 1 que suman los golpes y baja con el tiempo. El temblor de cámara usa trauma al cuadrado para que los golpes pequeños apenas se noten." },
  { term: "Custom data (tiles)", tag: "Niveles", def: "Datos propios guardados en cada tile del TileSet (daño, hielo, sonido de pasos). Se leen con get_cell_tile_data().get_custom_data()." },
  { term: "Diálogo ramificado", tag: "Diseño", def: "Conversación donde las respuestas del jugador llevan a distintas ramas. Suele guardarse como datos (JSON, Resources) en vez de código." },
  { term: "Blend space", tag: "Animación", def: "Nodo del AnimationTree que mezcla o elige animaciones según uno o dos valores, por ejemplo la dirección de movimiento para caminar en 8 direcciones." },
  { term: "Keyframe de método", tag: "Animación", def: "Pista del AnimationPlayer que llama a una función de tu script en un instante exacto de la animación: sonidos, partículas, activar hitboxes." },
);
