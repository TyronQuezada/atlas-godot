// Contenido del atlas. Para agregar algo nuevo basta con sumar un objeto al arreglo correspondiente.
// "Sprite2D" → editor/icons; "modules/csg/icons/CSGBox3D" → ruta completa en el repo
const ICON = (n) => `https://raw.githubusercontent.com/godotengine/godot/master/${n.includes("/") ? n : "editor/icons/" + n}.svg`;
const DOC = (f) => `https://docs.godotengine.org/en/stable/_images/${f}`;
const DOCS = "https://docs.godotengine.org/en/stable/classes/class_";

const CATEGORIES = {
  base: { label: "Base", color: "var(--c-node)" },
  "2d": { label: "2D", color: "var(--c-2d)" },
  fisica: { label: "Física", color: "var(--c-phys)" },
  "3d": { label: "3D", color: "var(--c-3d)" },
  ui: { label: "Interfaz", color: "var(--c-ui)" },
  anim: { label: "Animación", color: "var(--c-anim)" },
  audio: { label: "Audio", color: "var(--c-audio)" },
  util: { label: "Utilidad", color: "var(--c-util)" },
};

const NODES = [
  {
    name: "Node", cat: "base", icon: "Node",
    short: "El ladrillo de todo. Cualquier cosa en Godot es un Node o hereda de él.",
    use: "Úsalo como contenedor lógico sin posición: gestores de juego, controladores, máquinas de estados, nodos 'carpeta'.",
    props: ["name", "process_mode (pausa)", "owner"],
    methods: ["add_child(node)", "get_node(path) / $Nodo", "queue_free()", "get_tree()", "add_to_group(nombre)"],
    signals: ["ready", "tree_entered", "tree_exited", "child_entered_tree(node)"],
    img: DOC("nodes_and_scenes_nodes.webp"),
    code: `extends Node

func _ready() -> void:
    print("Estoy listo y mis hijos también")
    var enemigo = preload("res://enemy.tscn").instantiate()
    add_child(enemigo)`,
  },
  {
    name: "Node2D", cat: "2d", icon: "Node2D",
    short: "Nodo con posición, rotación y escala en 2D. Padre de todos los nodos 2D.",
    use: "Agrupa objetos 2D que deben moverse juntos o sirve como raíz de una escena 2D sin física.",
    props: ["position", "rotation / rotation_degrees", "scale", "global_position", "z_index"],
    methods: ["look_at(punto)", "to_local(v)", "to_global(v)", "translate(v)"],
    signals: ["(hereda las de Node)"],
    code: `extends Node2D

func _process(delta: float) -> void:
    rotation += 2.0 * delta          # gira 2 rad/s
    look_at(get_global_mouse_position())`,
  },
  {
    name: "Sprite2D", cat: "2d", icon: "Sprite2D",
    short: "Muestra una imagen (textura) en 2D.",
    use: "El 'cuerpo visible' de un personaje, objeto o fondo. Con hframes/vframes recorre una hoja de sprites.",
    props: ["texture", "flip_h / flip_v", "hframes / vframes", "frame", "centered", "offset", "modulate"],
    methods: ["get_rect()", "is_pixel_opaque(pos)"],
    signals: ["texture_changed"],
    img: DOC("player_scale.webp"),
    code: `@onready var sprite: Sprite2D = $Sprite2D

func _physics_process(_delta: float) -> void:
    if velocity.x != 0:
        sprite.flip_h = velocity.x < 0   # mira hacia donde camina`,
  },
  {
    name: "AnimatedSprite2D", cat: "anim", icon: "AnimatedSprite2D",
    short: "Sprite con animaciones por cuadros (SpriteFrames): idle, correr, saltar…",
    use: "La forma más rápida de animar personajes pixel-art. Cada animación es una lista de imágenes.",
    props: ["sprite_frames", "animation", "autoplay", "speed_scale", "flip_h"],
    methods: ["play(&\"correr\")", "stop()", "pause()", "is_playing()"],
    signals: ["animation_finished", "animation_looped", "frame_changed"],
    img: DOC("2d_animation_run_preview.gif"),
    code: `@onready var anim: AnimatedSprite2D = $AnimatedSprite2D

func actualizar_animacion() -> void:
    if not is_on_floor():
        anim.play("saltar")
    elif abs(velocity.x) > 10:
        anim.play("correr")
    else:
        anim.play("idle")`,
  },
  {
    name: "CharacterBody2D", cat: "fisica", icon: "CharacterBody2D",
    short: "Cuerpo físico que TÚ controlas por código. Ideal para jugadores y enemigos.",
    use: "Personajes de plataformas, top-down o cualquier cosa que deba moverse con precisión y chocar con paredes.",
    props: ["velocity", "up_direction", "floor_max_angle", "motion_mode (grounded / floating)"],
    methods: ["move_and_slide()", "is_on_floor()", "is_on_wall()", "is_on_ceiling()", "get_slide_collision(i)", "get_gravity()"],
    signals: ["(no tiene propias; usa un Area2D hija para detectar)"],
    img: DOC("k2d_platform.gif"),
    code: `extends CharacterBody2D

const SPEED := 220.0
const JUMP := -420.0

func _physics_process(delta: float) -> void:
    if not is_on_floor():
        velocity += get_gravity() * delta
    if Input.is_action_just_pressed("ui_accept") and is_on_floor():
        velocity.y = JUMP
    velocity.x = Input.get_axis("ui_left", "ui_right") * SPEED
    move_and_slide()`,
  },
  {
    name: "RigidBody2D", cat: "fisica", icon: "RigidBody2D",
    short: "Cuerpo movido por el motor de física: gravedad, rebotes, empujes.",
    use: "Cajas que caen, pelotas, escombros, ragdolls. No le asignes posición a mano: aplícale fuerzas.",
    props: ["mass", "gravity_scale", "linear_velocity", "physics_material_override", "freeze", "contact_monitor + max_contacts_reported"],
    methods: ["apply_impulse(v)", "apply_central_force(v)", "apply_torque(t)"],
    signals: ["body_entered(body)", "body_exited(body)", "sleeping_state_changed"],
    img: DOC("k2d_compare.gif"),
    code: `extends RigidBody2D

func explotar(origen: Vector2) -> void:
    var dir := (global_position - origen).normalized()
    apply_central_impulse(dir * 600.0)`,
  },
  {
    name: "StaticBody2D", cat: "fisica", icon: "StaticBody2D",
    short: "Cuerpo que no se mueve: suelos, paredes, plataformas fijas.",
    use: "Todo lo sólido e inmóvil del nivel. Si una plataforma se mueve, usa AnimatableBody2D.",
    props: ["physics_material_override", "constant_linear_velocity (cintas transportadoras)"],
    methods: [],
    signals: ["input_event", "mouse_entered", "mouse_exited"],
    code: `# Normalmente no necesita script.
# Estructura:
# StaticBody2D
#  ├─ Sprite2D
#  └─ CollisionShape2D (RectangleShape2D)`,
  },
  {
    name: "AnimatableBody2D", cat: "fisica", icon: "AnimatableBody2D",
    short: "Cuerpo sólido que se mueve por animación o código y arrastra a quien está encima.",
    use: "Plataformas móviles, ascensores, puertas que empujan.",
    props: ["sync_to_physics"],
    methods: [],
    signals: [],
    code: `extends AnimatableBody2D

func _ready() -> void:
    var t := create_tween().set_loops()
    t.tween_property(self, "position:x", position.x + 200, 2.0)
    t.tween_property(self, "position:x", position.x, 2.0)`,
  },
  {
    name: "Area2D", cat: "fisica", icon: "Area2D",
    short: "Zona invisible que detecta cuando algo entra o sale. No choca, solo avisa.",
    use: "Monedas, hitboxes, zonas de daño, triggers de diálogo, detectores de visión de enemigos.",
    props: ["monitoring", "monitorable", "collision_layer / collision_mask", "gravity_space_override"],
    methods: ["get_overlapping_bodies()", "get_overlapping_areas()", "has_overlapping_bodies()"],
    signals: ["body_entered(body)", "body_exited(body)", "area_entered(area)", "area_exited(area)"],
    img: DOC("player_signals.webp"),
    code: `extends Area2D  # moneda.gd

signal recogida

func _ready() -> void:
    body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node2D) -> void:
    if body.is_in_group("jugador"):
        recogida.emit()
        queue_free()`,
  },
  {
    name: "CollisionShape2D", cat: "fisica", icon: "CollisionShape2D",
    short: "Le da FORMA física a un cuerpo o área (rectángulo, círculo, cápsula…).",
    use: "Obligatorio como hijo de CharacterBody2D, RigidBody2D, StaticBody2D o Area2D. Sin él, nada colisiona.",
    props: ["shape (RectangleShape2D, CircleShape2D, CapsuleShape2D…)", "disabled", "one_way_collision"],
    methods: ["set_deferred(\"disabled\", true)"],
    signals: [],
    img: DOC("player_coll_shape1.webp"),
    code: `# Desactivar una colisión de forma segura durante la física:
$CollisionShape2D.set_deferred("disabled", true)`,
  },
  {
    name: "CollisionPolygon2D", cat: "fisica", icon: "CollisionPolygon2D",
    short: "Forma de colisión dibujada punto por punto.",
    use: "Terrenos irregulares, rocas, rampas raras donde un rectángulo no encaja.",
    props: ["polygon", "build_mode (sólido / segmentos)", "one_way_collision"],
    methods: [],
    signals: [],
    code: `# Dibuja los puntos en el editor con la herramienta de polígono.`,
  },
  {
    name: "RayCast2D", cat: "fisica", icon: "RayCast2D",
    short: "Un 'láser' invisible que te dice qué toca en una dirección.",
    use: "Detectar bordes para que un enemigo no se caiga, línea de visión, apuntar armas, comprobar el suelo.",
    props: ["target_position", "enabled", "collision_mask", "collide_with_areas"],
    methods: ["is_colliding()", "get_collider()", "get_collision_point()", "force_raycast_update()"],
    signals: [],
    img: DOC("raycast_projection.png"),
    code: `@onready var borde: RayCast2D = $DetectorBorde

func _physics_process(_delta: float) -> void:
    if not borde.is_colliding():   # no hay suelo delante
        direccion *= -1`,
  },
  {
    name: "Camera2D", cat: "2d", icon: "Camera2D",
    short: "La cámara 2D. Si es hija del jugador, lo sigue automáticamente.",
    use: "Seguir al personaje, hacer zoom, limitar la vista al tamaño del nivel, temblor de pantalla.",
    props: ["zoom", "position_smoothing_enabled", "limit_left/right/top/bottom", "drag_horizontal_enabled", "offset"],
    methods: ["make_current()", "reset_smoothing()"],
    signals: [],
    code: `extends Camera2D

var shake := 0.0

func temblar(fuerza: float) -> void:
    shake = fuerza

func _process(delta: float) -> void:
    shake = move_toward(shake, 0.0, 30.0 * delta)
    offset = Vector2(randf_range(-shake, shake), randf_range(-shake, shake))`,
  },
  {
    name: "TileMapLayer", cat: "2d", icon: "Node2D", // el ícono propio no está en editor/icons
    short: "Pinta niveles con cuadritos (tiles) de un TileSet. Reemplaza al viejo TileMap desde Godot 4.3.",
    use: "Construir niveles rápido con colisiones, terrenos autoconectables y navegación ya incluidos en el TileSet.",
    props: ["tile_set", "collision_enabled", "y_sort_enabled", "navigation_enabled"],
    methods: ["set_cell(coords, source_id, atlas_coords)", "get_cell_source_id(coords)", "local_to_map(pos)", "map_to_local(coords)", "set_cells_terrain_connect()"],
    signals: ["changed"],
    img: DOC("using_tilemaps_bucket_fill.webp"),
    code: `@onready var suelo: TileMapLayer = $Suelo

func romper_bloque(pos_mundo: Vector2) -> void:
    var celda := suelo.local_to_map(suelo.to_local(pos_mundo))
    suelo.erase_cell(celda)`,
  },
  {
    name: "Parallax2D", cat: "2d", icon: "Parallax2D",
    short: "Capa de fondo que se mueve más lento que la cámara para dar profundidad.",
    use: "Fondos de montañas, nubes y cielo en juegos de scroll lateral. Sustituye a ParallaxBackground (4.3+).",
    props: ["scroll_scale", "repeat_size", "autoscroll", "repeat_times"],
    methods: [],
    signals: [],
    img: DOC("2d_parallax_scroll.gif"),
    code: `# Parallax2D (scroll_scale = 0.3, repeat_size = 512x0)
#  └─ Sprite2D (montañas)`,
  },
  {
    name: "Marker2D", cat: "2d", icon: "Marker2D",
    short: "Un punto marcado en el espacio. Solo posición, nada más.",
    use: "Puntos de aparición, cañón del arma, puntos de patrulla, checkpoints.",
    props: ["gizmo_extents"],
    methods: [],
    signals: [],
    code: `@onready var canon: Marker2D = $Canon

func disparar() -> void:
    var bala = BALA.instantiate()
    bala.global_position = canon.global_position
    get_tree().current_scene.add_child(bala)`,
  },
  {
    name: "Path2D + PathFollow2D", cat: "2d", icon: "PathFollow2D",
    short: "Una curva (Path2D) y un nodo que viaja por ella (PathFollow2D).",
    use: "Enemigos que siguen una ruta fija, plataformas en circuito, puntos aleatorios de aparición en un borde.",
    props: ["curve", "progress", "progress_ratio", "loop", "rotates"],
    methods: [],
    signals: [],
    img: DOC("draw_path2d.gif"),
    code: `@onready var follow: PathFollow2D = $Path2D/PathFollow2D

func _process(delta: float) -> void:
    follow.progress += 80.0 * delta`,
  },
  {
    name: "Line2D", cat: "2d", icon: "Line2D",
    short: "Dibuja una línea con grosor, color y textura a partir de puntos.",
    use: "Estelas, cuerdas, rayos láser, trayectorias de apuntado.",
    props: ["points", "width", "default_color", "gradient", "texture"],
    methods: ["add_point(p)", "clear_points()"],
    signals: [],
    code: `func _process(_delta: float) -> void:
    $Estela.add_point(global_position)
    if $Estela.get_point_count() > 20:
        $Estela.remove_point(0)`,
  },
  {
    name: "PointLight2D", cat: "2d", icon: "PointLight2D",
    short: "Luz 2D con forma de textura. Puede proyectar sombras.",
    use: "Antorchas, linternas, ambientes oscuros. Combínalo con CanvasModulate para oscurecer la escena.",
    props: ["texture", "energy", "color", "shadow_enabled", "texture_scale"],
    methods: [],
    signals: [],
    img: DOC("2d_lights_and_shadows_enabled.webp"),
    code: `# Escena oscura:
# CanvasModulate (color gris oscuro)
# PointLight2D (textura circular, shadow_enabled = true)
# LightOccluder2D en paredes para generar sombras`,
  },
  {
    name: "GPUParticles2D", cat: "2d", icon: "GPUParticles2D",
    short: "Sistema de partículas: chispas, humo, polvo, sangre, magia.",
    use: "Efectos visuales (juice). Usa CPUParticles2D si apuntas a móviles viejos o web.",
    props: ["amount", "lifetime", "one_shot", "emitting", "process_material", "explosiveness"],
    methods: ["restart()"],
    signals: ["finished"],
    img: DOC("paranim14.gif"),
    code: `func explosion(pos: Vector2) -> void:
    var p = PARTICULAS.instantiate()
    p.global_position = pos
    p.one_shot = true
    p.emitting = true
    p.finished.connect(p.queue_free)
    add_child(p)`,
  },
  {
    name: "VisibleOnScreenNotifier2D", cat: "util", icon: "VisibleOnScreenNotifier2D",
    short: "Avisa cuando su rectángulo entra o sale de la pantalla.",
    use: "Borrar balas o enemigos que salieron de la vista para ahorrar recursos.",
    props: ["rect"],
    methods: ["is_on_screen()"],
    signals: ["screen_entered", "screen_exited"],
    code: `func _on_visible_on_screen_notifier_2d_screen_exited() -> void:
    queue_free()`,
  },
  {
    name: "Timer", cat: "util", icon: "Timer",
    short: "Cuenta regresiva que emite una señal al terminar.",
    use: "Cooldowns de ataque, oleadas de enemigos, invencibilidad temporal, coyote time.",
    props: ["wait_time", "one_shot", "autostart", "time_left"],
    methods: ["start(tiempo)", "stop()", "is_stopped()"],
    signals: ["timeout"],
    code: `@onready var cooldown: Timer = $Cooldown

func atacar() -> void:
    if not cooldown.is_stopped():
        return
    cooldown.start(0.4)
    # ... lógica del ataque

# Alternativa sin nodo:
await get_tree().create_timer(1.0).timeout`,
  },
  {
    name: "AnimationPlayer", cat: "anim", icon: "AnimationPlayer",
    short: "Anima CUALQUIER propiedad en una línea de tiempo: posición, color, frames, llamadas a funciones.",
    use: "Ataques, cinemáticas, puertas, UI animada, flashes de daño. La navaja suiza de la animación.",
    props: ["current_animation", "autoplay", "speed_scale", "libraries"],
    methods: ["play(\"nombre\")", "play_backwards()", "stop()", "queue(\"siguiente\")", "seek(t)"],
    signals: ["animation_finished(anim_name)", "animation_started(anim_name)"],
    img: DOC("animation_animation_panel_overview.webp"),
    code: `@onready var ap: AnimationPlayer = $AnimationPlayer

func recibir_dano() -> void:
    ap.play("parpadeo")
    await ap.animation_finished
    print("terminó el parpadeo")`,
  },
  {
    name: "AnimationTree", cat: "anim", icon: "AnimationTree",
    short: "Mezcla y transiciona animaciones de un AnimationPlayer con máquinas de estados o blend spaces.",
    use: "Personajes con muchas animaciones (caminar en 8 direcciones, mezclar correr+disparar).",
    props: ["anim_player", "tree_root", "active", "parameters/…"],
    methods: ["get(\"parameters/playback\")"],
    signals: ["animation_finished(anim_name)"],
    img: DOC("animtree_blend2.gif"),
    code: `@onready var tree: AnimationTree = $AnimationTree
@onready var sm = tree.get("parameters/playback")

func _physics_process(_d: float) -> void:
    tree.set("parameters/Mover/blend_position", input_dir)
    sm.travel("Mover" if input_dir else "Idle")`,
  },
  {
    name: "Tween", cat: "anim", icon: "Tween",
    short: "Animación creada por código que interpola un valor de A a B. No es un nodo: se crea con create_tween().",
    use: "Barras de vida suaves, objetos que aparecen escalando, fundidos, movimientos rápidos sin abrir el editor.",
    props: [],
    methods: ["tween_property(obj, \"prop\", final, seg)", "set_trans()", "set_ease()", "set_parallel()", "tween_callback(f)"],
    signals: ["finished", "step_finished"],
    code: `func aparecer() -> void:
    scale = Vector2.ZERO
    var t := create_tween()
    t.tween_property(self, "scale", Vector2.ONE, 0.35)\\
        .set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)`,
  },
  {
    name: "AudioStreamPlayer", cat: "audio", icon: "AudioStreamPlayer",
    short: "Reproduce sonido sin posición (música, UI). Las versiones 2D/3D atenúan según distancia.",
    use: "Música de fondo, efectos de botones (AudioStreamPlayer), disparos y pasos posicionales (AudioStreamPlayer2D).",
    props: ["stream", "volume_db", "pitch_scale", "autoplay", "bus"],
    methods: ["play()", "stop()", "is_playing()"],
    signals: ["finished"],
    img: DOC("audio_buses2.webp"),
    code: `@onready var sfx: AudioStreamPlayer2D = $Salto

func saltar() -> void:
    sfx.pitch_scale = randf_range(0.9, 1.1)  # variación natural
    sfx.play()`,
  },
  {
    name: "NavigationAgent2D", cat: "util", icon: "NavigationAgent2D",
    short: "Calcula el camino hacia un objetivo esquivando obstáculos (pathfinding).",
    use: "Enemigos que persiguen al jugador por un laberinto. Necesita un NavigationRegion2D o un TileMapLayer con navegación.",
    props: ["target_position", "path_desired_distance", "avoidance_enabled"],
    methods: ["get_next_path_position()", "is_navigation_finished()"],
    signals: ["navigation_finished", "velocity_computed(safe_velocity)"],
    img: DOC("nav_2d_min_setup_step3.webp"),
    code: `@onready var agente: NavigationAgent2D = $NavigationAgent2D

func _physics_process(_d: float) -> void:
    agente.target_position = jugador.global_position
    if agente.is_navigation_finished():
        return
    var siguiente := agente.get_next_path_position()
    velocity = global_position.direction_to(siguiente) * 120.0
    move_and_slide()`,
  },
  {
    name: "CanvasLayer", cat: "ui", icon: "CanvasLayer",
    short: "Capa de dibujo independiente de la cámara.",
    use: "El HUD (vida, puntos) que NO debe moverse cuando la cámara sigue al jugador. Menús de pausa.",
    props: ["layer", "follow_viewport_enabled", "visible"],
    methods: [],
    signals: ["visibility_changed"],
    img: DOC("completed_main_scene.webp"),
    code: `# HUD (CanvasLayer)
#  └─ MarginContainer
#      └─ HBoxContainer
#          ├─ TextureRect (corazón)
#          └─ Label (puntos)`,
  },
  {
    name: "Control", cat: "ui", icon: "Control",
    short: "Base de todo nodo de interfaz. Usa anclas (anchors) en vez de posición libre.",
    use: "Raíz de menús y pantallas. Entender anchors y size_flags es la clave de una UI que se adapta.",
    props: ["anchors_preset", "size_flags_horizontal/vertical", "custom_minimum_size", "theme", "mouse_filter", "focus_mode"],
    methods: ["grab_focus()", "set_anchors_preset()"],
    signals: ["gui_input(event)", "mouse_entered", "focus_entered", "resized"],
    img: DOC("ui_anchor.webp"),
    code: `func _ready() -> void:
    $Menu/Jugar.grab_focus()  # para navegar con mando/teclado`,
  },
  {
    name: "Label", cat: "ui", icon: "Label",
    short: "Muestra texto simple.",
    use: "Puntaje, nombre, contadores, títulos. Para texto con formato usa RichTextLabel.",
    props: ["text", "horizontal_alignment", "autowrap_mode", "label_settings", "visible_ratio (efecto máquina de escribir)"],
    methods: [],
    signals: [],
    img: DOC("nodes_and_scenes_11_final_result.webp"),
    code: `@onready var puntos: Label = $Puntos

func actualizar(valor: int) -> void:
    puntos.text = "Puntos: %d" % valor`,
  },
  {
    name: "RichTextLabel", cat: "ui", icon: "RichTextLabel",
    short: "Texto con BBCode: colores, negritas, imágenes, efectos ondulantes.",
    use: "Diálogos, tooltips, créditos.",
    props: ["bbcode_enabled", "text", "visible_characters", "fit_content"],
    methods: ["append_text(bb)", "clear()"],
    signals: ["meta_clicked(meta)"],
    code: `$Dialogo.text = "[wave]¡Hola![/wave] Soy el [color=gold]herrero[/color]."`,
  },
  {
    name: "Button", cat: "ui", icon: "Button",
    short: "Botón clicable con texto y/o ícono.",
    use: "Menús, opciones, inventarios.",
    props: ["text", "icon", "disabled", "toggle_mode", "flat"],
    methods: [],
    signals: ["pressed", "toggled(toggled_on)", "button_down", "button_up"],
    img: DOC("signals_11_pressed_signals.webp"),
    code: `func _ready() -> void:
    $Jugar.pressed.connect(func(): get_tree().change_scene_to_file("res://nivel_1.tscn"))
    $Salir.pressed.connect(get_tree().quit)`,
  },
  {
    name: "TextureRect", cat: "ui", icon: "TextureRect",
    short: "Muestra una imagen dentro de la interfaz.",
    use: "Íconos de HUD, retratos, logos, fondos de menú.",
    props: ["texture", "expand_mode", "stretch_mode"],
    methods: [],
    signals: [],
    code: `$Retrato.texture = load("res://ui/retrato_feliz.png")`,
  },
  {
    name: "ProgressBar", cat: "ui", icon: "ProgressBar",
    short: "Barra que se llena según un valor. TextureProgressBar permite usar imágenes.",
    use: "Barras de vida, energía, carga, experiencia.",
    props: ["min_value", "max_value", "value", "show_percentage", "fill_mode"],
    methods: [],
    signals: ["value_changed(value)"],
    code: `func set_vida(v: float) -> void:
    create_tween().tween_property($BarraVida, "value", v, 0.25)`,
  },
  {
    name: "Containers (VBox, HBox, Margin, Grid)", cat: "ui", icon: "VBoxContainer",
    short: "Acomodan automáticamente a sus hijos: en columna, en fila, en cuadrícula o con márgenes.",
    use: "Nunca posiciones botones a mano: mételos en un VBoxContainer y se alinean solos.",
    props: ["separation (theme)", "alignment", "columns (Grid)"],
    methods: [],
    signals: ["sort_children"],
    img: DOC("godot_containers.png"),
    code: `# MenuPrincipal (Control, preset Full Rect)
#  └─ CenterContainer
#      └─ VBoxContainer
#          ├─ Button "Jugar"
#          ├─ Button "Opciones"
#          └─ Button "Salir"`,
  },
  {
    name: "Node3D", cat: "3d", icon: "Node3D",
    short: "Nodo con transformación 3D (posición, rotación, escala). Padre de todo lo 3D.",
    use: "Raíz de escenas 3D, pivotes de cámara, agrupar objetos.",
    props: ["position", "rotation", "basis", "global_transform"],
    methods: ["look_at(objetivo)", "rotate_y(rad)", "translate(v)"],
    signals: ["visibility_changed"],
    code: `func _process(delta: float) -> void:
    rotate_y(1.5 * delta)`,
  },
  {
    name: "CharacterBody3D", cat: "3d", icon: "CharacterBody3D",
    short: "Igual que su versión 2D pero en tres dimensiones.",
    use: "Personajes en primera o tercera persona.",
    props: ["velocity", "floor_max_angle", "up_direction"],
    methods: ["move_and_slide()", "is_on_floor()"],
    signals: [],
    img: DOC("squash-the-creeps-final.gif"),
    code: `extends CharacterBody3D

const SPEED := 6.0

func _physics_process(delta: float) -> void:
    if not is_on_floor():
        velocity += get_gravity() * delta
    var input := Input.get_vector("izq", "der", "arriba", "abajo")
    var dir := (transform.basis * Vector3(input.x, 0, input.y)).normalized()
    velocity.x = dir.x * SPEED
    velocity.z = dir.z * SPEED
    move_and_slide()`,
  },
  {
    name: "MeshInstance3D", cat: "3d", icon: "MeshInstance3D",
    short: "Muestra un modelo 3D (malla).",
    use: "Personajes, escenarios, props. Puede usar primitivas (cubo, esfera) para prototipar.",
    props: ["mesh", "material_override", "cast_shadow"],
    methods: [],
    signals: [],
    code: `$Cubo.mesh = BoxMesh.new()`,
  },
  {
    name: "Camera3D", cat: "3d", icon: "Camera3D",
    short: "La cámara del mundo 3D.",
    use: "Primera persona (hija de la cabeza), tercera persona (con SpringArm3D), cenital.",
    props: ["fov", "projection", "current", "near / far"],
    methods: ["project_ray_origin(pos)", "unproject_position(p3d)"],
    signals: [],
    img: DOC("10.camera_perspective.png"),
    code: `# Tercera persona:
# Pivote (Node3D)
#  └─ SpringArm3D (evita atravesar paredes)
#      └─ Camera3D`,
  },
  {
    name: "DirectionalLight3D", cat: "3d", icon: "DirectionalLight3D",
    short: "Luz tipo sol: ilumina todo desde una dirección.",
    use: "Luz principal de escenas exteriores. Usa OmniLight3D para focos puntuales.",
    props: ["light_energy", "light_color", "shadow_enabled"],
    methods: [],
    signals: [],
    code: `# Rota el nodo para cambiar la hora del día.`,
  },
  {
    name: "WorldEnvironment", cat: "3d", icon: "WorldEnvironment",
    short: "Define cielo, niebla, glow, tonemap y post-procesado de la escena.",
    use: "Darle 'look' cinematográfico al juego.",
    props: ["environment", "camera_attributes"],
    methods: [],
    signals: [],
    code: `# Environment → Glow: activa para brillos tipo bloom.`,
  },
  {
    name: "SubViewport", cat: "util", icon: "SubViewport",
    short: "Una 'pantalla dentro de la pantalla' que renderiza su propio mundo.",
    use: "Minimapas, pantallas split-screen, renderizar 3D dentro de UI, efectos pixel-perfect.",
    props: ["size", "render_target_update_mode", "transparent_bg"],
    methods: ["get_texture()"],
    signals: [],
    img: DOC("subviewportnode.webp"),
    code: `# SubViewportContainer
#  └─ SubViewport
#      └─ Camera2D (zoom lejano) → minimapa`,
  },
  {
    name: "HTTPRequest", cat: "util", icon: "HTTPRequest",
    short: "Hace peticiones web (APIs, rankings online).",
    use: "Tablas de puntuación, descargar contenido, telemetría.",
    props: ["timeout", "download_file"],
    methods: ["request(url)"],
    signals: ["request_completed(result, code, headers, body)"],
    code: `func _ready() -> void:
    $HTTPRequest.request_completed.connect(_on_done)
    $HTTPRequest.request("https://api.ejemplo.com/ranking")

func _on_done(_r, code, _h, body) -> void:
    if code == 200:
        var datos = JSON.parse_string(body.get_string_from_utf8())`,
  },

  /* ---- 2D extra ---- */
  {
    name: "CPUParticles2D", cat: "2d", icon: "CPUParticles2D",
    short: "Partículas calculadas en el procesador. Mismo uso que GPUParticles2D pero más compatibles.",
    use: "Juegos web, móviles de gama baja o cuando necesitas pocas partículas con control fino.",
    props: ["amount", "lifetime", "one_shot", "emitting", "direction", "spread", "gravity", "color_ramp"],
    methods: ["restart()", "convert_from_particles(nodo)"],
    signals: ["finished"],
    code: `# Polvo al aterrizar
func _on_aterrizar() -> void:
    $Polvo.restart()   # one_shot = true, explosiveness = 0.9`,
  },
  {
    name: "CanvasModulate", cat: "2d", icon: "CanvasModulate",
    short: "Tiñe todo el lienzo 2D de un color. La forma estándar de oscurecer una escena.",
    use: "Noche, cuevas, flashbacks en sepia. Junto con PointLight2D crea iluminación dinámica.",
    props: ["color"],
    methods: [],
    signals: [],
    code: `func anochecer() -> void:
    create_tween().tween_property($CanvasModulate, "color", Color(0.15, 0.15, 0.3), 3.0)`,
  },
  {
    name: "LightOccluder2D", cat: "2d", icon: "LightOccluder2D",
    short: "Polígono que bloquea la luz 2D y genera sombras.",
    use: "Paredes, columnas y personajes que deben proyectar sombra con PointLight2D (shadow_enabled).",
    props: ["occluder (OccluderPolygon2D)", "occluder_light_mask", "sdf_collision"],
    methods: [],
    signals: [],
    img: DOC("2d_lights_and_shadows_hard_shadow.webp"),
    code: `# Pared
#  ├─ Sprite2D
#  ├─ CollisionShape2D
#  └─ LightOccluder2D  ← dibuja el polígono encima del muro`,
  },
  {
    name: "Polygon2D", cat: "2d", icon: "Polygon2D",
    short: "Dibuja un polígono relleno con color o textura.",
    use: "Prototipos rápidos sin arte, terrenos de colores, recortes deformables con huesos.",
    props: ["polygon", "color", "texture", "uv", "skeleton"],
    methods: [],
    signals: [],
    code: `$Forma.polygon = PackedVector2Array([Vector2(0, 0), Vector2(64, 0), Vector2(32, -48)])
$Forma.color = Color.TOMATO`,
  },
  {
    name: "RemoteTransform2D", cat: "2d", icon: "RemoteTransform2D",
    short: "Copia su posición/rotación/escala a otro nodo que NO es su hijo.",
    use: "Cámara que sigue al jugador sin ser su hija, armas que siguen una mano, UI que sigue un objeto.",
    props: ["remote_path", "update_position", "update_rotation", "update_scale", "use_global_coordinates"],
    methods: ["force_update_cache()"],
    signals: [],
    code: `# Jugador
#  └─ RemoteTransform2D (remote_path = ../../Camera2D)
# La cámara vive fuera del jugador: no se destruye si el jugador muere.`,
  },
  {
    name: "Skeleton2D + Bone2D", cat: "anim", icon: "Skeleton2D",
    short: "Esqueleto 2D: huesos que deforman o mueven partes de un personaje.",
    use: "Animación cutout (estilo marioneta): personajes hechos de piezas que se animan con AnimationPlayer.",
    props: ["rest (Bone2D)", "length", "modification_stack"],
    methods: ["get_bone(i)", "apply_rest()"],
    signals: ["bone_setup_changed"],
    img: DOC("tuto_cutout_walk.gif"),
    code: `# Skeleton2D
#  └─ Bone2D "Cadera"
#      ├─ Bone2D "Torso"
#      │   └─ Bone2D "Brazo"
#      └─ Bone2D "Pierna"
# Cada Sprite2D se pone como hijo del hueso que lo mueve.`,
  },

  /* ---- Física extra ---- */
  {
    name: "ShapeCast2D", cat: "fisica", icon: "ShapeCast2D",
    short: "Como un RayCast2D, pero lanza una FORMA completa en vez de una línea.",
    use: "Comprobar si cabe el personaje antes de levantarse, ataques en área, detección de suelo más fiable.",
    props: ["shape", "target_position", "collision_mask", "max_results"],
    methods: ["is_colliding()", "get_collision_count()", "get_collider(i)", "force_shapecast_update()"],
    signals: [],
    code: `# ¿Hay techo encima? Entonces no puede dejar de agacharse.
func puede_levantarse() -> bool:
    $ChequeoTecho.force_shapecast_update()
    return not $ChequeoTecho.is_colliding()`,
  },
  {
    name: "PinJoint2D", cat: "fisica", icon: "PinJoint2D",
    short: "Une dos cuerpos físicos por un punto, como un clavo que permite girar.",
    use: "Péndulos, cadenas, puentes colgantes, ragdolls 2D. Hay más: GrooveJoint2D y DampedSpringJoint2D.",
    props: ["node_a", "node_b", "softness", "angular_limit_enabled"],
    methods: [],
    signals: [],
    code: `# Ancla (StaticBody2D)
# PinJoint2D (node_a = Ancla, node_b = Pendulo)
# Pendulo (RigidBody2D)`,
  },

  /* ---- Interfaz extra ---- */
  {
    name: "Panel / PanelContainer", cat: "ui", icon: "PanelContainer",
    short: "Fondo con estilo (StyleBox). PanelContainer además ajusta su tamaño al contenido.",
    use: "Cajas de diálogo, ventanas de inventario, tarjetas, tooltips.",
    props: ["theme_override_styles/panel"],
    methods: [],
    signals: [],
    img: DOC("themecheck.webp"),
    code: `var estilo := StyleBoxFlat.new()
estilo.bg_color = Color(0, 0, 0, 0.8)
estilo.set_corner_radius_all(8)
$CajaDialogo.add_theme_stylebox_override("panel", estilo)`,
  },
  {
    name: "NinePatchRect", cat: "ui", icon: "NinePatchRect",
    short: "Imagen que se estira sin deformar las esquinas (9-slice).",
    use: "Marcos de diálogo pixel-art, botones con borde, paneles de cualquier tamaño a partir de una imagen pequeña.",
    props: ["texture", "patch_margin_left/top/right/bottom", "axis_stretch_horizontal"],
    methods: [],
    signals: ["texture_changed"],
    code: `# Imagen de 24×24 con márgenes de 8 px:
# las 4 esquinas no se estiran, los bordes solo en una dirección.`,
  },
  {
    name: "ColorRect", cat: "ui", icon: "ColorRect",
    short: "Un rectángulo de un color sólido.",
    use: "Fundidos a negro, fondos de menú, overlays de pausa, base para shaders de pantalla completa.",
    props: ["color", "mouse_filter"],
    methods: [],
    signals: [],
    code: `func fundido_a_negro() -> void:
    $Negro.modulate.a = 0.0
    await create_tween().tween_property($Negro, "modulate:a", 1.0, 0.4).finished`,
  },
  {
    name: "LineEdit", cat: "ui", icon: "LineEdit",
    short: "Campo de texto de una línea. TextEdit es la versión multilínea.",
    use: "Nombre del jugador, códigos, chat, consola de trucos.",
    props: ["text", "placeholder_text", "max_length", "secret", "editable"],
    methods: ["clear()", "grab_focus()", "select_all()"],
    signals: ["text_changed(new_text)", "text_submitted(new_text)"],
    code: `func _ready() -> void:
    $Nombre.text_submitted.connect(func(t): Juego.nombre = t.strip_edges())`,
  },
  {
    name: "Slider, CheckBox y OptionButton", cat: "ui", icon: "HSlider",
    short: "Los controles típicos de un menú de opciones: deslizador, casilla y desplegable.",
    use: "Volumen, pantalla completa, idioma, calidad gráfica.",
    props: ["value / min_value / max_value (Slider)", "button_pressed (CheckBox)", "selected (OptionButton)"],
    methods: ["add_item(texto) (OptionButton)", "get_item_text(i)"],
    signals: ["value_changed(value)", "toggled(toggled_on)", "item_selected(index)"],
    code: `func _ready() -> void:
    $Volumen.value_changed.connect(func(v):
        AudioServer.set_bus_volume_db(0, linear_to_db(v)))
    $PantallaCompleta.toggled.connect(func(on):
        DisplayServer.window_set_mode(
            DisplayServer.WINDOW_MODE_FULLSCREEN if on else DisplayServer.WINDOW_MODE_WINDOWED))`,
  },
  {
    name: "ScrollContainer", cat: "ui", icon: "ScrollContainer",
    short: "Muestra barras de desplazamiento cuando su hijo es más grande que él.",
    use: "Listas largas: inventarios, créditos, registros de misiones.",
    props: ["horizontal_scroll_mode", "vertical_scroll_mode", "follow_focus"],
    methods: ["ensure_control_visible(c)", "get_v_scroll_bar()"],
    signals: ["scroll_started", "scroll_ended"],
    img: DOC("containers_scroll.png"),
    code: `# ScrollContainer (tamaño fijo)
#  └─ VBoxContainer (size_flags_horizontal = Expand)
#      └─ ...muchos elementos`,
  },
  {
    name: "TabContainer", cat: "ui", icon: "TabContainer",
    short: "Pestañas: cada hijo es una página y solo se ve una a la vez.",
    use: "Menús de opciones (Audio / Video / Controles), inventario por categorías.",
    props: ["current_tab", "tabs_visible", "tab_alignment"],
    methods: ["set_tab_title(i, t)", "get_current_tab_control()"],
    signals: ["tab_changed(tab)", "tab_selected(tab)"],
    img: DOC("containers_tab_click.gif"),
    code: `$Opciones.set_tab_title(0, "Audio")
$Opciones.set_tab_title(1, "Video")`,
  },
  {
    name: "ItemList", cat: "ui", icon: "ItemList",
    short: "Lista seleccionable de elementos con texto e ícono.",
    use: "Inventarios simples, selección de nivel, lista de partidas guardadas.",
    props: ["select_mode", "max_columns", "icon_mode", "fixed_icon_size"],
    methods: ["add_item(texto, icono)", "clear()", "get_selected_items()"],
    signals: ["item_selected(index)", "item_activated(index)"],
    code: `for item in inventario:
    $Lista.add_item(item.nombre, item.icono)
$Lista.item_activated.connect(func(i): usar(inventario[i]))`,
  },
  {
    name: "AcceptDialog / ConfirmationDialog", cat: "ui", icon: "ConfirmationDialog",
    short: "Ventanas emergentes listas con botones Aceptar (y Cancelar).",
    use: "“¿Seguro que quieres salir?”, “Partida guardada”, avisos de error.",
    props: ["title", "dialog_text", "ok_button_text", "exclusive"],
    methods: ["popup_centered()", "get_ok_button()"],
    signals: ["confirmed", "canceled"],
    code: `func _on_salir_pressed() -> void:
    $Confirmar.dialog_text = "¿Salir sin guardar?"
    $Confirmar.popup_centered()

func _ready() -> void:
    $Confirmar.confirmed.connect(get_tree().quit)`,
  },
  {
    name: "VideoStreamPlayer", cat: "ui", icon: "VideoStreamPlayer",
    short: "Reproduce video (formato .ogv / Theora) dentro de la interfaz.",
    use: "Intros, cinemáticas pregrabadas, fondos animados de menú.",
    props: ["stream", "autoplay", "expand", "loop", "volume_db"],
    methods: ["play()", "stop()", "is_playing()"],
    signals: ["finished"],
    code: `func _ready() -> void:
    $Intro.finished.connect(func(): get_tree().change_scene_to_file("res://menu.tscn"))`,
  },

  /* ---- 3D extra ---- */
  {
    name: "CollisionShape3D", cat: "3d", icon: "CollisionShape3D",
    short: "La forma física de un cuerpo 3D: caja, esfera, cápsula, cilindro o malla.",
    use: "Obligatorio como hijo de cualquier cuerpo o área 3D.",
    props: ["shape (BoxShape3D, SphereShape3D, CapsuleShape3D…)", "disabled"],
    methods: [],
    signals: [],
    img: DOC("08.create_box_shape3D.webp"),
    code: `# Para personajes: CapsuleShape3D (radius 0.4, height 1.8)
# Para el suelo: BoxShape3D o "Crear colisión" desde la malla`,
  },
  {
    name: "StaticBody3D", cat: "3d", icon: "StaticBody3D",
    short: "Cuerpo 3D inmóvil: suelo, paredes, edificios.",
    use: "Todo el escenario sólido. Selecciona una malla → Malla → Crear hermano de colisión.",
    props: ["physics_material_override", "constant_linear_velocity"],
    methods: [],
    signals: [],
    img: DOC("06.staticbody_node.webp"),
    code: `# Suelo (StaticBody3D)
#  ├─ MeshInstance3D (PlaneMesh)
#  └─ CollisionShape3D (BoxShape3D)`,
  },
  {
    name: "RigidBody3D", cat: "3d", icon: "RigidBody3D",
    short: "Objeto 3D que obedece la física: cae, rueda, rebota.",
    use: "Cajas, barriles, pelotas, escombros, objetos que el jugador puede empujar o lanzar.",
    props: ["mass", "gravity_scale", "linear_velocity", "freeze", "contact_monitor"],
    methods: ["apply_impulse(v)", "apply_central_impulse(v)", "apply_torque_impulse(v)"],
    signals: ["body_entered(body)", "sleeping_state_changed"],
    code: `func lanzar(direccion: Vector3) -> void:
    freeze = false
    apply_central_impulse(direccion * 8.0)`,
  },
  {
    name: "Area3D", cat: "3d", icon: "Area3D",
    short: "Volumen invisible que detecta cuerpos y áreas 3D.",
    use: "Zonas de muerte bajo el mapa, triggers de cinemáticas, recoger objetos, zonas de agua con gravedad propia.",
    props: ["monitoring", "collision_layer / mask", "gravity_space_override", "gravity"],
    methods: ["get_overlapping_bodies()"],
    signals: ["body_entered(body)", "body_exited(body)", "area_entered(area)"],
    code: `# ZonaMuerte bajo el nivel
func _on_body_entered(body: Node3D) -> void:
    if body.is_in_group("jugador"):
        body.global_position = $"../Checkpoint".global_position`,
  },
  {
    name: "RayCast3D", cat: "3d", icon: "RayCast3D",
    short: "Rayo 3D que detecta el primer objeto en su camino.",
    use: "Mirar e interactuar en primera persona, disparos hitscan, detectar suelo.",
    props: ["target_position", "collision_mask", "collide_with_areas", "enabled"],
    methods: ["is_colliding()", "get_collider()", "get_collision_point()", "get_collision_normal()"],
    signals: [],
    code: `# Hijo de la cámara, target_position = (0, 0, -3)
if $Mira.is_colliding() and Input.is_action_just_pressed("interactuar"):
    var obj = $Mira.get_collider()
    if obj.has_method("usar"):
        obj.usar()`,
  },
  {
    name: "SpringArm3D", cat: "3d", icon: "SpringArm3D",
    short: "Brazo que se acorta si choca con algo. La cámara en su punta nunca atraviesa paredes.",
    use: "Cámaras en tercera persona.",
    props: ["spring_length", "shape", "collision_mask", "margin"],
    methods: ["get_hit_length()"],
    signals: [],
    img: DOC("spring_arm_camera_collision.webp"),
    code: `# Pivote (Node3D) ← rota con el mouse
#  └─ SpringArm3D (spring_length = 4)
#      └─ Camera3D`,
  },
  {
    name: "OmniLight3D / SpotLight3D", cat: "3d", icon: "OmniLight3D",
    short: "Luces 3D locales: Omni ilumina en todas direcciones (bombilla), Spot en cono (linterna).",
    use: "Antorchas, lámparas, linternas del jugador, faros.",
    props: ["light_energy", "light_color", "omni_range / spot_range", "spot_angle", "shadow_enabled"],
    methods: [],
    signals: [],
    img: DOC("light_omni.png"),
    code: `# Antorcha que parpadea
func _process(_delta: float) -> void:
    $Fuego.light_energy = 1.0 + randf_range(-0.15, 0.15)`,
  },
  {
    name: "Sprite3D / Label3D", cat: "3d", icon: "Label3D",
    short: "Imagen o texto 2D colocados dentro del mundo 3D. Pueden mirar siempre a la cámara (billboard).",
    use: "Nombres sobre personajes, números de daño, vegetación tipo cartel, juegos 2.5D.",
    props: ["texture / text", "billboard", "pixel_size", "no_depth_test"],
    methods: [],
    signals: [],
    img: DOC("label_3d.png"),
    code: `func mostrar_dano(n: int) -> void:
    var l := Label3D.new()
    l.text = str(n)
    l.billboard = BaseMaterial3D.BILLBOARD_ENABLED
    add_child(l)
    var t := create_tween()
    t.tween_property(l, "position:y", 1.5, 0.6)
    t.tween_callback(l.queue_free)`,
  },
  {
    name: "GridMap", cat: "3d", icon: "modules/gridmap/icons/GridMap",
    short: "El TileMap del 3D: construye niveles colocando bloques de una MeshLibrary.",
    use: "Mazmorras, ciudades por bloques, niveles estilo voxel o low-poly modulares.",
    props: ["mesh_library", "cell_size", "collision_layer"],
    methods: ["set_cell_item(pos, id)", "get_cell_item(pos)", "local_to_map(p)", "map_to_local(c)"],
    signals: ["changed"],
    img: DOC("gridmap_panel.webp"),
    code: `# Poner un bloque por código
$GridMap.set_cell_item(Vector3i(2, 0, 5), 0)`,
  },
  {
    name: "CSG (CSGBox3D, CSGCombiner3D…)", cat: "3d", icon: "modules/csg/icons/CSGBox3D",
    short: "Formas 3D que se suman, restan o intersectan para prototipar niveles sin salir de Godot.",
    use: "Blockout: diseñar el nivel con cajas y agujeros antes de tener modelos finales.",
    props: ["operation (union / intersection / subtraction)", "use_collision", "size"],
    methods: [],
    signals: [],
    img: DOC("csg_nodes.png"),
    code: `# CSGCombiner3D (use_collision = true)
#  ├─ CSGBox3D "Pared"
#  └─ CSGBox3D "Puerta" (operation = Subtraction)`,
  },

  /* ---- Utilidad extra ---- */
  {
    name: "NavigationRegion2D", cat: "util", icon: "NavigationRegion2D",
    short: "Define la zona por donde los NavigationAgent2D pueden caminar.",
    use: "Dibujas el polígono navegable y luego 'Bake' para recortar los obstáculos.",
    props: ["navigation_polygon", "enabled", "navigation_layers"],
    methods: ["bake_navigation_polygon()"],
    signals: ["bake_finished", "navigation_polygon_changed"],
    img: DOC("nav_2d_min_setup_step2.png"),
    code: `# Si cambias el nivel en tiempo de ejecución:
$NavigationRegion2D.bake_navigation_polygon()`,
  },
  {
    name: "MultiplayerSpawner / Synchronizer", cat: "util", icon: "modules/multiplayer/icons/MultiplayerSpawner",
    short: "Replican nodos y propiedades entre servidor y clientes en red.",
    use: "Spawner: crea en todos los clientes lo que el servidor instancia. Synchronizer: mantiene posiciones y vidas iguales.",
    props: ["spawn_path", "_spawnable_scenes (Spawner)", "replication_config (Synchronizer)"],
    methods: ["spawn(data)"],
    signals: ["spawned(node)", "synchronized"],
    code: `func hospedar() -> void:
    var peer := ENetMultiplayerPeer.new()
    peer.create_server(7000)
    multiplayer.multiplayer_peer = peer

func unirse(ip: String) -> void:
    var peer := ENetMultiplayerPeer.new()
    peer.create_client(ip, 7000)
    multiplayer.multiplayer_peer = peer`,
  },
];

const LIFECYCLE = [
  { name: "_init()", when: "Al crear el objeto en memoria, antes de entrar al árbol.", tip: "Aún no existen los hijos ni $Nodos. Úsalo solo para valores iniciales.", code: `func _init() -> void:\n    vida = 100` },
  { name: "_enter_tree()", when: "Cuando el nodo se agrega al árbol de escena.", tip: "Se llama de padre a hijos. Útil para registrarse en gestores.", code: `func _enter_tree() -> void:\n    GameManager.registrar(self)` },
  { name: "_ready()", when: "Una sola vez, cuando el nodo y TODOS sus hijos ya están en el árbol.", tip: "El lugar ideal para conectar señales y leer otros nodos. Se llama de hijos a padre.", code: `func _ready() -> void:\n    $Timer.timeout.connect(_on_timeout)` },
  { name: "_process(delta)", when: "Cada fotograma dibujado (60, 144… veces por segundo, variable).", tip: "Lógica visual: animaciones, UI, cámaras. Multiplica por delta.", code: `func _process(delta: float) -> void:\n    $Label.text = str(Engine.get_frames_per_second())` },
  { name: "_physics_process(delta)", when: "A ritmo fijo (60 veces/s por defecto), sincronizado con la física.", tip: "Movimiento, move_and_slide(), colisiones y lectura de input de juego.", code: `func _physics_process(delta: float) -> void:\n    move_and_slide()` },
  { name: "_input(event)", when: "Cada vez que ocurre un evento de entrada (tecla, mouse, mando).", tip: "Llega primero a todos los nodos. Para jugabilidad prefiere _unhandled_input.", code: `func _input(event: InputEvent) -> void:\n    if event.is_action_pressed("pausa"):\n        get_tree().paused = not get_tree().paused` },
  { name: "_unhandled_input(event)", when: "Eventos que la UI no consumió.", tip: "Así un clic sobre un botón no dispara también el arma del jugador.", code: `func _unhandled_input(event: InputEvent) -> void:\n    if event.is_action_pressed("disparar"):\n        disparar()` },
  { name: "_exit_tree()", when: "Cuando el nodo sale del árbol (queue_free, cambio de escena).", tip: "Limpieza: guardar, desregistrarse, soltar recursos.", code: `func _exit_tree() -> void:\n    GameManager.quitar(self)` },
];

const FUNCTIONS = [
  { name: "move_and_slide()", group: "Física", desc: "Mueve un CharacterBody según su velocity y lo desliza contra paredes y suelos.", code: `velocity.x = dir * SPEED\nmove_and_slide()` },
  { name: "is_on_floor()", group: "Física", desc: "true si el CharacterBody está tocando el suelo tras el último move_and_slide().", code: `if is_on_floor() and Input.is_action_just_pressed("saltar"):\n    velocity.y = JUMP` },
  { name: "get_gravity()", group: "Física", desc: "Devuelve la gravedad que afecta al cuerpo (Godot 4.3+). Respeta Areas que la modifiquen.", code: `velocity += get_gravity() * delta` },
  { name: "Input.get_axis(neg, pos)", group: "Input", desc: "Devuelve -1, 0 o 1 (o intermedio con joystick) según dos acciones opuestas.", code: `var dir := Input.get_axis("izquierda", "derecha")` },
  { name: "Input.get_vector(…)", group: "Input", desc: "Vector2 normalizado a partir de 4 acciones. Perfecto para top-down.", code: `var v := Input.get_vector("izq", "der", "arriba", "abajo")\nvelocity = v * SPEED` },
  { name: "Input.is_action_just_pressed()", group: "Input", desc: "true solo en el fotograma en que se presionó la acción. is_action_pressed() es mientras se mantiene.", code: `if Input.is_action_just_pressed("atacar"):\n    atacar()` },
  { name: "preload() / load()", group: "Escenas", desc: "Carga un recurso. preload lo hace al compilar (rápido, ruta fija); load en tiempo de ejecución.", code: `const BALA := preload("res://bala.tscn")\nvar tex = load("res://items/" + nombre + ".png")` },
  { name: "instantiate()", group: "Escenas", desc: "Crea una copia viva de una PackedScene (.tscn).", code: `var e = ENEMIGO.instantiate()\ne.position = Vector2(100, 50)\nadd_child(e)` },
  { name: "add_child(nodo)", group: "Escenas", desc: "Mete un nodo en el árbol como hijo. Hasta entonces no se procesa ni se dibuja.", code: `get_tree().current_scene.add_child(bala)` },
  { name: "queue_free()", group: "Escenas", desc: "Borra el nodo de forma segura al final del fotograma.", code: `func morir() -> void:\n    queue_free()` },
  { name: "get_tree().change_scene_to_file()", group: "Escenas", desc: "Cambia toda la escena actual por otra (nuevo nivel, menú).", code: `get_tree().change_scene_to_file("res://niveles/nivel_2.tscn")` },
  { name: "get_tree().reload_current_scene()", group: "Escenas", desc: "Reinicia el nivel actual. Clásico al morir.", code: `get_tree().reload_current_scene()` },
  { name: "$Nodo / get_node()", group: "Nodos", desc: "Obtiene un nodo por su ruta en el árbol. %Nodo usa nombres únicos de escena.", code: `@onready var sprite = $Sprite2D\n@onready var hud = %HUD` },
  { name: "@export", group: "GDScript", desc: "Expone una variable en el Inspector para ajustarla sin tocar código.", code: `@export var velocidad := 200.0\n@export var bala_escena: PackedScene` },
  { name: "@onready", group: "GDScript", desc: "Asigna la variable justo antes de _ready(), cuando los hijos ya existen.", code: `@onready var anim: AnimationPlayer = $AnimationPlayer` },
  { name: "signal / emit() / connect()", group: "Señales", desc: "Declara, emite y escucha eventos propios.", code: `signal murio(puntos: int)\n\nmurio.emit(150)\n\nenemigo.murio.connect(_on_enemigo_murio)` },
  { name: "await", group: "GDScript", desc: "Pausa la función hasta que ocurra una señal, sin congelar el juego.", code: `await get_tree().create_timer(0.5).timeout\nawait $AnimationPlayer.animation_finished` },
  { name: "create_tween()", group: "Animación", desc: "Crea un Tween para interpolar propiedades por código.", code: `create_tween().tween_property($Sprite2D, "modulate:a", 0.0, 0.3)` },
  { name: "lerp(a, b, t)", group: "Matemática", desc: "Interpolación lineal: valor entre a y b según t (0..1).", code: `position = position.lerp(objetivo, 10.0 * delta)` },
  { name: "move_toward(desde, hasta, paso)", group: "Matemática", desc: "Avanza un valor hacia otro sin pasarse. Ideal para aceleración y fricción.", code: `velocity.x = move_toward(velocity.x, dir * MAX, ACCEL * delta)` },
  { name: "clamp(v, min, max)", group: "Matemática", desc: "Limita un valor a un rango.", code: `vida = clamp(vida - dano, 0, vida_max)` },
  { name: "randf_range() / randi_range()", group: "Matemática", desc: "Números aleatorios en un rango (float / int).", code: `var x := randf_range(-50.0, 50.0)\nvar dado := randi_range(1, 6)` },
  { name: "direction_to() / distance_to()", group: "Matemática", desc: "Dirección normalizada y distancia entre dos posiciones.", code: `var dir := global_position.direction_to(jugador.global_position)\nif global_position.distance_to(jugador.global_position) < 100: atacar()` },
  { name: "add_to_group() / is_in_group()", group: "Nodos", desc: "Etiqueta nodos para encontrarlos o filtrarlos (jugador, enemigos, interactuables).", code: `add_to_group("enemigos")\nget_tree().call_group("enemigos", "congelar")` },
  { name: "set_deferred() / call_deferred()", group: "Física", desc: "Aplica cambios al final del fotograma. Obligatorio al tocar colisiones dentro de una señal de física.", code: `$CollisionShape2D.set_deferred("disabled", true)` },
  { name: "FileAccess / ConfigFile", group: "Guardado", desc: "Leer y escribir archivos en user:// para guardar partidas u opciones.", code: `var cfg := ConfigFile.new()\ncfg.set_value("audio", "musica", 0.8)\ncfg.save("user://opciones.cfg")` },
];
// Qué recibe y qué devuelve cada función de LIFECYCLE y FUNCTIONS (la clave es su "name").
// p = [nombre, tipo, descripción]; r = [tipo, descripción]
const FN_SIG = {
  // Ciclo de vida: Godot las llama solo, ninguna devuelve valor
  "_init()": { p: [["(opcional) tus argumentos", "cualquiera", "Solo si los declaras; se pasan al crear el objeto con .new(a, b)."]], r: ["void", "Nada."] },
  "_enter_tree()": { p: [], r: ["void", "Nada."] },
  "_ready()": { p: [], r: ["void", "Nada."] },
  "_process(delta)": { p: [["delta", "float", "Segundos desde el frame anterior (≈0.016 a 60 FPS). Varía según los FPS."]], r: ["void", "Nada."] },
  "_physics_process(delta)": { p: [["delta", "float", "Segundos del paso de física: fijo, 1/60 ≈ 0.0167 por defecto."]], r: ["void", "Nada."] },
  "_input(event)": { p: [["event", "InputEvent", "El evento: tecla (InputEventKey), clic (InputEventMouseButton), mando, toque…"]], r: ["void", "Nada. Para frenar el evento llama a get_viewport().set_input_as_handled()."] },
  "_unhandled_input(event)": { p: [["event", "InputEvent", "Evento que ningún Control de la UI consumió."]], r: ["void", "Nada."] },
  "_exit_tree()": { p: [], r: ["void", "Nada."] },

  // Funciones de uso diario
  "move_and_slide()": { p: [], r: ["bool", "true si chocó con algo durante el movimiento. Lee la velocity actual y la modifica tras los choques."] },
  "is_on_floor()": { p: [], r: ["bool", "true si tocó suelo en el último move_and_slide()."] },
  "get_gravity()": { p: [], r: ["Vector2", "La gravedad en píxeles/s² (Vector3 en 3D), incluyendo Areas que la cambien."] },
  "Input.get_axis(neg, pos)": { p: [["negative_action", "StringName", "Acción que da -1 (ej. \"izquierda\")."], ["positive_action", "StringName", "Acción que da +1 (ej. \"derecha\")."]], r: ["float", "Entre -1 y 1. 0 si no se pulsa ninguna o ambas. Con joystick da valores intermedios."] },
  "Input.get_vector(…)": { p: [["negative_x", "StringName", "Izquierda."], ["positive_x", "StringName", "Derecha."], ["negative_y", "StringName", "Arriba."], ["positive_y", "StringName", "Abajo."], ["deadzone", "float = -1.0", "Opcional. Zona muerta del joystick; -1 usa la de las acciones."]], r: ["Vector2", "Dirección con longitud máxima 1 (ya normalizada en diagonal)."] },
  "Input.is_action_just_pressed()": { p: [["action", "StringName", "Nombre de la acción del Input Map."], ["exact_match", "bool = false", "Opcional. Si es true, ignora la tecla si hay modificadores extra (Ctrl, Shift)."]], r: ["bool", "true solo en el frame exacto en que se pulsó."] },
  "preload() / load()": { p: [["path", "String", "Ruta del recurso, ej. \"res://bala.tscn\". En preload debe ser un texto fijo."]], r: ["Resource", "El recurso cargado (PackedScene, Texture2D, AudioStream…). load() devuelve null si no existe."] },
  "instantiate()": { p: [["edit_state", "int = 0", "Opcional, casi nunca se usa (para herramientas del editor)."]], r: ["Node", "El nodo raíz de la copia nueva de la escena, todavía fuera del árbol."] },
  "add_child(nodo)": { p: [["node", "Node", "El nodo a añadir como hijo."], ["force_readable_name", "bool = false", "Opcional. Pone nombres legibles a nodos creados por código (más lento)."]], r: ["void", "Nada."] },
  "queue_free()": { p: [], r: ["void", "Nada. El nodo se borra al final del frame."] },
  "get_tree().change_scene_to_file()": { p: [["path", "String", "Ruta de la escena .tscn a cargar."]], r: ["Error", "OK (0) si pudo cargarla; otro código si la ruta está mal."] },
  "get_tree().reload_current_scene()": { p: [], r: ["Error", "OK (0) si pudo recargar."] },
  "$Nodo / get_node()": { p: [["path", "NodePath", "Ruta relativa (\"Sprite2D\", \"../Jugador\") o absoluta (\"/root/Juego\")."]], r: ["Node", "El nodo encontrado. Si no existe da error; usa get_node_or_null() para recibir null."] },
  "@export": { p: [["(opcional) parámetros", "según la variante", "Algunas variantes reciben datos: @export_range(0, 100, 1), @export_enum(\"A\", \"B\"), @export_file(\"*.tscn\")."]], r: ["—", "Es una anotación, no una función: marca la variable para que aparezca en el Inspector."] },
  "@onready": { p: [], r: ["—", "Es una anotación: retrasa la asignación de la variable hasta justo antes de _ready()."] },
  "signal / emit() / connect()": { p: [["emit(...args)", "Variant", "Los valores que la señal declara, en el mismo orden."], ["connect(callable, flags)", "Callable, int = 0", "La función que escuchará y opciones como CONNECT_ONE_SHOT o CONNECT_DEFERRED."]], r: ["void / Error", "emit() no devuelve nada. connect() devuelve OK (0) o un error si ya estaba conectada."] },
  "await": { p: [["señal o función", "Signal o corrutina", "Lo que hay que esperar: un timeout, animation_finished, otra función con await…"]], r: ["Variant", "Lo que trae la señal: nada si no tiene argumentos, el valor si tiene uno, un Array si tiene varios. Con una función, su return."] },
  "create_tween()": { p: [], r: ["Tween", "Un Tween nuevo ligado a este nodo: se detiene solo si el nodo se borra."] },
  "lerp(a, b, t)": { p: [["from", "float / Vector2 / Color…", "Valor inicial."], ["to", "mismo tipo", "Valor final."], ["weight", "float", "0 = from, 1 = to, 0.5 = la mitad."]], r: ["mismo tipo", "El valor intermedio. Para vectores usa a.lerp(b, t)."] },
  "move_toward(desde, hasta, paso)": { p: [["from", "float", "Valor actual."], ["to", "float", "Valor al que quieres llegar."], ["delta", "float", "Cuánto avanzar como máximo esta vez."]], r: ["float", "El nuevo valor, sin pasarse de to. Vector2 tiene su propio .move_toward()."] },
  "clamp(v, min, max)": { p: [["value", "Variant", "El valor a limitar."], ["min", "Variant", "Mínimo permitido."], ["max", "Variant", "Máximo permitido."]], r: ["mismo tipo", "value recortado al rango. clampi() y clampf() son las versiones tipadas."] },
  "randf_range() / randi_range()": { p: [["from", "float / int", "Mínimo."], ["to", "float / int", "Máximo (incluido en randi_range)."]], r: ["float / int", "Un número aleatorio en el rango."] },
  "direction_to() / distance_to()": { p: [["to", "Vector2", "La posición destino (llamado sobre la posición de origen)."]], r: ["Vector2 / float", "direction_to: vector de longitud 1 hacia el destino. distance_to: distancia en píxeles."] },
  "add_to_group() / is_in_group()": { p: [["group", "StringName", "Nombre del grupo, ej. \"enemigos\"."], ["persistent", "bool = false", "Solo add_to_group: si se guarda con la escena."]], r: ["void / bool", "add_to_group no devuelve nada; is_in_group devuelve true si pertenece."] },
  "set_deferred() / call_deferred()": { p: [["property / method", "StringName", "Propiedad a cambiar o función a llamar."], ["value / args", "Variant", "Valor nuevo o argumentos de la función."]], r: ["void", "Nada: el cambio ocurre al final del frame."] },
  "FileAccess / ConfigFile": { p: [["path", "String", "Ruta del archivo, normalmente en user://."], ["flags", "FileAccess.ModeFlags", "Solo FileAccess.open: READ, WRITE o READ_WRITE."]], r: ["FileAccess / Error", "FileAccess.open devuelve el archivo abierto o null si falla (mira FileAccess.get_open_error()). ConfigFile.save/load devuelven OK o un error."] },
};


// params: [nombre, tipo, qué contiene]. La función conectada a una señal nunca devuelve valor (void).
const SIGNALS = [
  {
    node: "Area2D / Area3D", signal: "body_entered(body)", when: "Un cuerpo físico entra en el área.", example: "Recoger monedas, recibir daño, activar trampas.",
    params: [["body", "Node2D (Node3D en 3D)", "El cuerpo que entró: CharacterBody, RigidBody, StaticBody o un TileMapLayer con colisión."]],
    code: `extends Area2D  # trampa.gd

func _ready() -> void:
    body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node2D) -> void:
    if body.is_in_group("jugador"):
        body.recibir_dano(1, global_position)`,
  },
  {
    node: "Area2D / Area3D", signal: "body_exited(body)", when: "El cuerpo sale del área.", example: "Ocultar el aviso “Pulsa E para hablar”.",
    params: [["body", "Node2D (Node3D en 3D)", "El cuerpo que salió."]],
    code: `extends Area2D  # zona_hablar.gd

func _ready() -> void:
    body_entered.connect(_on_body_entered)
    body_exited.connect(_on_body_exited)

func _on_body_entered(body: Node2D) -> void:
    if body.is_in_group("jugador"):
        $Aviso.show()

func _on_body_exited(body: Node2D) -> void:
    if body.is_in_group("jugador"):
        $Aviso.hide()`,
  },
  {
    node: "Area2D / Area3D", signal: "area_entered(area)", when: "Otra Area entra en esta.", example: "La hitbox de la espada toca la hurtbox del enemigo.",
    params: [["area", "Area2D (Area3D en 3D)", "El área que entró. Suele ser una hitbox de otro personaje."]],
    code: `extends Area2D  # hurtbox.gd

func _ready() -> void:
    area_entered.connect(_on_area_entered)

func _on_area_entered(area: Area2D) -> void:
    if area.is_in_group("hitbox"):
        owner.recibir_dano(area.dano, area.global_position)`,
  },
  {
    node: "Timer", signal: "timeout", when: "El tiempo llegó a cero.", example: "Generar enemigos cada 2 s, fin de la invencibilidad.",
    params: [],
    code: `extends Node2D  # oleadas.gd

@onready var timer: Timer = $Timer

func _ready() -> void:
    timer.wait_time = 2.0
    timer.timeout.connect(_on_timer_timeout)
    timer.start()

func _on_timer_timeout() -> void:
    generar_enemigo()   # se repite cada 2 s si one_shot = false`,
  },
  {
    node: "Button / BaseButton", signal: "pressed", when: "El botón se pulsó y se soltó encima.", example: "Jugar, Salir, Comprar.",
    params: [],
    code: `extends Control  # menu.gd

func _ready() -> void:
    $Jugar.pressed.connect(_on_jugar_pressed)

func _on_jugar_pressed() -> void:
    get_tree().change_scene_to_file("res://nivel_1.tscn")`,
  },
  {
    node: "Button / BaseButton", signal: "toggled(toggled_on)", when: "Cambia un botón tipo interruptor (toggle_mode o CheckBox).", example: "Activar o desactivar la música.",
    params: [["toggled_on", "bool", "true si quedó activado, false si quedó desactivado."]],
    code: `extends Control  # opciones.gd

func _ready() -> void:
    $Musica.toggled.connect(_on_musica_toggled)

func _on_musica_toggled(toggled_on: bool) -> void:
    var bus := AudioServer.get_bus_index("Musica")
    AudioServer.set_bus_mute(bus, not toggled_on)`,
  },
  {
    node: "AnimatedSprite2D", signal: "animation_finished", when: "Termina una animación que no está en bucle.", example: "Volver a idle tras atacar.",
    params: [],
    code: `extends CharacterBody2D

@onready var anim: AnimatedSprite2D = $AnimatedSprite2D

func _ready() -> void:
    anim.animation_finished.connect(_on_animation_finished)

func _on_animation_finished() -> void:
    if anim.animation == "atacar":
        anim.play("idle")`,
  },
  {
    node: "AnimationPlayer", signal: "animation_finished(anim_name)", when: "Termina una animación.", example: "Cambiar de escena al acabar una cinemática.",
    params: [["anim_name", "StringName", "Nombre de la animación que terminó."]],
    code: `extends Node  # cinematica.gd

func _ready() -> void:
    $AnimationPlayer.animation_finished.connect(_on_animation_finished)
    $AnimationPlayer.play("intro")

func _on_animation_finished(anim_name: StringName) -> void:
    if anim_name == &"intro":
        get_tree().change_scene_to_file("res://menu.tscn")`,
  },
  {
    node: "VisibleOnScreenNotifier2D", signal: "screen_exited", when: "Sale de la pantalla.", example: "Borrar balas perdidas.",
    params: [],
    code: `extends Area2D  # bala.gd

func _ready() -> void:
    $VisibleOnScreenNotifier2D.screen_exited.connect(_on_screen_exited)

func _on_screen_exited() -> void:
    queue_free()`,
  },
  {
    node: "RigidBody2D", signal: "body_entered(body)", when: "Choca con otro cuerpo (requiere contact_monitor = true y max_contacts_reported > 0).", example: "Sonido de impacto de una caja.",
    params: [["body", "Node", "El cuerpo con el que chocó."]],
    code: `extends RigidBody2D  # caja.gd

func _ready() -> void:
    contact_monitor = true
    max_contacts_reported = 2
    body_entered.connect(_on_body_entered)

func _on_body_entered(_body: Node) -> void:
    if linear_velocity.length() > 150:
        $Golpe.play()`,
  },
  {
    node: "Range (Slider, ProgressBar)", signal: "value_changed(value)", when: "Cambia su valor.", example: "Slider de volumen.",
    params: [["value", "float", "El nuevo valor, entre min_value y max_value."]],
    code: `extends Control  # opciones.gd

func _ready() -> void:
    $Volumen.value_changed.connect(_on_volumen_changed)

func _on_volumen_changed(value: float) -> void:
    AudioServer.set_bus_volume_db(0, linear_to_db(value))`,
  },
  {
    node: "LineEdit", signal: "text_submitted(new_text)", when: "Se pulsa Enter en el campo.", example: "Escribir el nombre del jugador.",
    params: [["new_text", "String", "El texto escrito en el campo."]],
    code: `extends Control  # nombre.gd

func _ready() -> void:
    $Nombre.text_submitted.connect(_on_text_submitted)

func _on_text_submitted(new_text: String) -> void:
    Juego.nombre = new_text.strip_edges()
    hide()`,
  },
  {
    node: "Control", signal: "gui_input(event)", when: "Recibe un evento de entrada sobre él.", example: "Arrastrar ítems en un inventario.",
    params: [["event", "InputEvent", "El evento: clic (InputEventMouseButton), movimiento, tecla, toque…"]],
    code: `extends TextureRect  # casilla.gd

func _ready() -> void:
    gui_input.connect(_on_gui_input)

func _on_gui_input(event: InputEvent) -> void:
    if event is InputEventMouseButton and event.pressed:
        if event.button_index == MOUSE_BUTTON_RIGHT:
            usar_objeto()`,
  },
  {
    node: "Control / CollisionObject2D", signal: "mouse_entered", when: "El cursor pasa por encima.", example: "Resaltar una carta o un botón.",
    params: [],
    code: `extends TextureRect  # carta.gd

func _ready() -> void:
    mouse_entered.connect(_on_mouse_entered)
    mouse_exited.connect(func(): scale = Vector2.ONE)

func _on_mouse_entered() -> void:
    create_tween().tween_property(self, "scale", Vector2(1.1, 1.1), 0.1)`,
  },
  {
    node: "AudioStreamPlayer", signal: "finished", when: "Termina de sonar.", example: "Encadenar la siguiente pista.",
    params: [],
    code: `extends AudioStreamPlayer  # musica.gd

var pistas: Array[AudioStream] = [preload("res://m1.ogg"), preload("res://m2.ogg")]
var i := 0

func _ready() -> void:
    finished.connect(_on_finished)
    play()

func _on_finished() -> void:
    i = (i + 1) % pistas.size()
    stream = pistas[i]
    play()`,
  },
  {
    node: "GPUParticles2D", signal: "finished", when: "Termina un sistema one_shot.", example: "Liberar la explosión.",
    params: [],
    code: `extends GPUParticles2D  # explosion.gd

func _ready() -> void:
    one_shot = true
    emitting = true
    finished.connect(_on_finished)

func _on_finished() -> void:
    queue_free()`,
  },
  {
    node: "Tween", signal: "finished", when: "Terminan todas sus animaciones.", example: "Habilitar el botón tras la animación de entrada.",
    params: [],
    code: `extends Control  # pantalla_titulo.gd

func _ready() -> void:
    $Jugar.disabled = true
    var t := create_tween()
    t.tween_property($Logo, "modulate:a", 1.0, 0.8)
    t.finished.connect(_on_intro_finished)

func _on_intro_finished() -> void:
    $Jugar.disabled = false
    $Jugar.grab_focus()`,
  },
  {
    node: "NavigationAgent2D", signal: "navigation_finished", when: "El agente llegó a su destino.", example: "El enemigo empieza a atacar.",
    params: [],
    code: `extends CharacterBody2D  # guardia.gd

func _ready() -> void:
    $NavigationAgent2D.navigation_finished.connect(_on_navigation_finished)

func _on_navigation_finished() -> void:
    velocity = Vector2.ZERO
    $AnimatedSprite2D.play("vigilar")`,
  },
  {
    node: "HTTPRequest", signal: "request_completed(result, response_code, headers, body)", when: "La petición web respondió.", example: "Mostrar el ranking online.",
    params: [
      ["result", "int", "Resultado de la conexión. HTTPRequest.RESULT_SUCCESS (0) si llegó respuesta."],
      ["response_code", "int", "Código HTTP del servidor: 200 = OK, 404 = no existe, 500 = error del servidor."],
      ["headers", "PackedStringArray", "Cabeceras de la respuesta."],
      ["body", "PackedByteArray", "Contenido en bytes. Conviértelo con get_string_from_utf8()."],
    ],
    code: `extends Node  # ranking.gd

func _ready() -> void:
    $HTTPRequest.request_completed.connect(_on_request_completed)
    $HTTPRequest.request("https://api.ejemplo.com/ranking")

func _on_request_completed(result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
    if result != HTTPRequest.RESULT_SUCCESS or response_code != 200:
        push_warning("No se pudo cargar el ranking")
        return
    var datos = JSON.parse_string(body.get_string_from_utf8())
    print(datos)`,
  },
  {
    node: "Node", signal: "ready", when: "El nodo terminó su _ready().", example: "Esperar a que otro nodo esté listo: await nodo.ready.",
    params: [],
    code: `extends Node  # nivel.gd

func _ready() -> void:
    var jefe = preload("res://jefe.tscn").instantiate()
    jefe.ready.connect(_on_jefe_ready.bind(jefe))
    add_child(jefe)

func _on_jefe_ready(jefe: Node) -> void:
    $HUD.mostrar_barra_jefe(jefe)`,
  },
  {
    node: "Node", signal: "tree_exited", when: "El nodo salió del árbol.", example: "Contar enemigos restantes.",
    params: [],
    code: `extends Node2D  # arena.gd

var vivos := 0

func registrar(enemigo: Node) -> void:
    vivos += 1
    enemigo.tree_exited.connect(_on_enemigo_tree_exited)

func _on_enemigo_tree_exited() -> void:
    vivos -= 1
    if vivos == 0:
        abrir_puerta()`,
  },
  {
    node: "SceneTree", signal: "process_frame", when: "Antes de procesar cada fotograma.", example: "Esperar un frame: await get_tree().process_frame.",
    params: [],
    code: `extends Control  # lista.gd

func rellenar() -> void:
    for item in datos:
        $VBox.add_child(crear_fila(item))
    # Espera un frame para que los contenedores calculen su tamaño
    await get_tree().process_frame
    $Scroll.ensure_control_visible($VBox.get_child(-1))`,
  },
];

// Recetas: “Quiero hacer…”
const RECIPES = [
  {
    id: "plataformas", title: "Un personaje 2D de plataformas",
    lead: "Salta, corre, choca con el suelo y anima según lo que hace.",
    img: DOC("k2d_platform.gif"),
    tree: [
      ["CharacterBody2D", "Jugador", 0, "CharacterBody2D"],
      ["AnimatedSprite2D", "AnimatedSprite2D", 1, "AnimatedSprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["Camera2D", "Camera2D", 1, "Camera2D"],
      ["Timer", "CoyoteTimer", 1, "Timer"],
      ["AudioStreamPlayer2D", "SonidoSalto", 1, "AudioStreamPlayer2D"],
    ],
    need: [
      ["CharacterBody2D", "El cuerpo: da física controlada por código y move_and_slide()."],
      ["AnimatedSprite2D (o Sprite2D)", "Lo que se ve. Con animaciones idle / correr / saltar."],
      ["CollisionShape2D", "La forma física. Una cápsula funciona mejor que un rectángulo en bordes."],
      ["Un script .gd", "Lee el input, aplica gravedad y mueve el cuerpo."],
      ["Acciones de Input Map", "izquierda, derecha, saltar en Proyecto → Configuración → Mapa de entrada."],
      ["Camera2D (opcional)", "Hija del jugador para que la cámara lo siga."],
      ["Timer (opcional)", "Para coyote time: permite saltar unos ms después de dejar el borde."],
    ],
    code: `extends CharacterBody2D

@export var speed := 220.0
@export var accel := 1600.0
@export var jump_velocity := -420.0

@onready var anim: AnimatedSprite2D = $AnimatedSprite2D
@onready var coyote: Timer = $CoyoteTimer

var estaba_en_suelo := false

func _physics_process(delta: float) -> void:
    if not is_on_floor():
        velocity += get_gravity() * delta

    # Coyote time: si acabo de dejar el suelo, aún puedo saltar
    if estaba_en_suelo and not is_on_floor():
        coyote.start(0.1)

    var puede_saltar := is_on_floor() or not coyote.is_stopped()
    if Input.is_action_just_pressed("saltar") and puede_saltar:
        velocity.y = jump_velocity
        coyote.stop()

    # Salto variable: soltar corta el salto
    if Input.is_action_just_released("saltar") and velocity.y < 0:
        velocity.y *= 0.5

    var dir := Input.get_axis("izquierda", "derecha")
    velocity.x = move_toward(velocity.x, dir * speed, accel * delta)

    estaba_en_suelo = is_on_floor()
    move_and_slide()
    _animar(dir)

func _animar(dir: float) -> void:
    if dir != 0:
        anim.flip_h = dir < 0
    if not is_on_floor():
        anim.play("saltar")
    elif dir != 0:
        anim.play("correr")
    else:
        anim.play("idle")`,
    tips: ["Agrega al jugador al grupo \"jugador\" para que monedas y enemigos lo reconozcan.", "Pon la lógica de movimiento en _physics_process, no en _process.", "Ajusta speed y jump_velocity desde el Inspector gracias a @export."],
  },
  {
    id: "topdown", title: "Un personaje top-down (vista cenital)",
    lead: "Se mueve en 8 direcciones como en un RPG o un twin-stick shooter.",
    img: DOC("dodge_preview.gif"),
    tree: [
      ["CharacterBody2D", "Jugador", 0, "CharacterBody2D"],
      ["AnimatedSprite2D", "AnimatedSprite2D", 1, "AnimatedSprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["Area2D", "Hurtbox", 1, "Area2D"],
      ["CollisionShape2D", "CollisionShape2D", 2, "CollisionShape2D"],
    ],
    need: [
      ["CharacterBody2D", "Con motion_mode = Floating (no hay suelo ni gravedad)."],
      ["Sprite / AnimatedSprite2D", "Animaciones por dirección: abajo, arriba, lado."],
      ["CollisionShape2D", "Pequeña, a los pies del personaje, para que pueda pasar 'detrás' de objetos."],
      ["Area2D Hurtbox", "Detecta golpes de enemigos sin afectar el movimiento."],
      ["Script", "Input.get_vector() lo resuelve en una línea."],
    ],
    code: `extends CharacterBody2D

@export var speed := 160.0

func _physics_process(_delta: float) -> void:
    var input := Input.get_vector("izquierda", "derecha", "arriba", "abajo")
    velocity = input * speed
    move_and_slide()

    if input != Vector2.ZERO:
        $AnimatedSprite2D.play("caminar")
        $AnimatedSprite2D.flip_h = input.x < 0
    else:
        $AnimatedSprite2D.play("idle")`,
    tips: ["Activa y_sort_enabled en el padre para que los objetos se dibujen según su altura.", "get_vector ya normaliza: no corres más rápido en diagonal."],
  },
  {
    id: "enemigo", title: "Un enemigo que patrulla",
    lead: "Camina, se da la vuelta al ver un precipicio o una pared, y daña al jugador.",
    img: DOC("mob_animations.webp"),
    tree: [
      ["CharacterBody2D", "Enemigo", 0, "CharacterBody2D"],
      ["AnimatedSprite2D", "AnimatedSprite2D", 1, "AnimatedSprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["RayCast2D", "DetectorBorde", 1, "RayCast2D"],
      ["Area2D", "Hitbox", 1, "Area2D"],
      ["CollisionShape2D", "CollisionShape2D", 2, "CollisionShape2D"],
    ],
    need: [
      ["CharacterBody2D", "Para que respete el suelo y las paredes."],
      ["RayCast2D", "Apuntando hacia abajo y adelante: si deja de tocar, hay un precipicio."],
      ["Area2D Hitbox", "Hace daño al jugador al tocarlo (señal body_entered)."],
      ["Script", "Dirección, gravedad y giro."],
    ],
    code: `extends CharacterBody2D

@export var speed := 60.0
var direccion := -1.0

@onready var borde: RayCast2D = $DetectorBorde

func _ready() -> void:
    $Hitbox.body_entered.connect(_on_hitbox_body_entered)

func _physics_process(delta: float) -> void:
    velocity += get_gravity() * delta
    if is_on_wall() or not borde.is_colliding():
        direccion *= -1
        borde.position.x *= -1
        $AnimatedSprite2D.flip_h = direccion > 0
    velocity.x = direccion * speed
    move_and_slide()

func _on_hitbox_body_entered(body: Node2D) -> void:
    if body.has_method("recibir_dano"):
        body.recibir_dano(1, global_position)`,
    tips: ["has_method() evita errores si toca algo que no es el jugador.", "Separa collision_layer: jugador en capa 1, enemigos en capa 2, mundo en capa 3."],
  },
  {
    id: "moneda", title: "Un objeto coleccionable",
    lead: "Monedas, llaves, power-ups: algo que desaparece al tocarlo y suma puntos.",
    img: DOC("signals_shoot1.gif"),
    tree: [
      ["Area2D", "Moneda", 0, "Area2D"],
      ["AnimatedSprite2D", "AnimatedSprite2D", 1, "AnimatedSprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["AudioStreamPlayer2D", "Sonido", 1, "AudioStreamPlayer2D"],
    ],
    need: [
      ["Area2D", "No necesita física, solo detectar."],
      ["Sprite", "Que gire o brille para llamar la atención."],
      ["CollisionShape2D", "Un círculo un poco más grande que el dibujo: perdona al jugador."],
      ["Autoload (opcional)", "Un script global Juego.gd que guarde los puntos."],
    ],
    code: `extends Area2D

@export var valor := 1

func _ready() -> void:
    body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node2D) -> void:
    if not body.is_in_group("jugador"):
        return
    Juego.puntos += valor            # Autoload
    $CollisionShape2D.set_deferred("disabled", true)
    $Sonido.play()
    var t := create_tween()
    t.tween_property(self, "position:y", position.y - 24, 0.25)
    t.parallel().tween_property(self, "modulate:a", 0.0, 0.25)
    await $Sonido.finished
    queue_free()`,
    tips: ["Desactiva la colisión con set_deferred para que no se recoja dos veces.", "Espera al sonido antes de queue_free() o se cortará."],
  },
  {
    id: "proyectil", title: "Disparos y proyectiles",
    lead: "El jugador dispara balas que viajan, chocan y desaparecen.",
    img: DOC("signals_shoot2.gif"),
    tree: [
      ["Area2D", "Bala", 0, "Area2D"],
      ["Sprite2D", "Sprite2D", 1, "Sprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["VisibleOnScreenNotifier2D", "Notifier", 1, "VisibleOnScreenNotifier2D"],
    ],
    need: [
      ["Escena Bala (Area2D)", "Escena separada para poder instanciarla muchas veces."],
      ["VisibleOnScreenNotifier2D", "La borra cuando sale de pantalla."],
      ["Marker2D en el jugador", "Marca el cañón desde donde sale."],
      ["preload + instantiate", "Crea cada bala al disparar."],
    ],
    code: `# bala.gd
extends Area2D

@export var speed := 600.0
var direccion := Vector2.RIGHT

func _ready() -> void:
    rotation = direccion.angle()
    $Notifier.screen_exited.connect(queue_free)
    body_entered.connect(func(b):
        if b.has_method("recibir_dano"):
            b.recibir_dano(1, global_position)
        queue_free())

func _physics_process(delta: float) -> void:
    position += direccion * speed * delta

# --- en jugador.gd ---
const BALA := preload("res://bala.tscn")

func disparar() -> void:
    var b = BALA.instantiate()
    b.global_position = $Canon.global_position
    b.direccion = global_position.direction_to(get_global_mouse_position())
    get_tree().current_scene.add_child(b)`,
    tips: ["Añade la bala a la escena actual, no al jugador, o se moverá con él.", "Si disparas cientos por segundo, investiga object pooling."],
  },
  {
    id: "hud", title: "Un HUD (vida y puntos)",
    lead: "Interfaz fija en pantalla que no se mueve con la cámara.",
    img: DOC("completed_main_scene.webp"),
    tree: [
      ["CanvasLayer", "HUD", 0, "CanvasLayer"],
      ["MarginContainer", "MarginContainer", 1, "MarginContainer"],
      ["HBoxContainer", "HBoxContainer", 2, "HBoxContainer"],
      ["TextureProgressBar", "BarraVida", 3, "TextureProgressBar"],
      ["Label", "Puntos", 3, "Label"],
    ],
    need: [
      ["CanvasLayer", "Mantiene la UI quieta aunque la cámara se mueva."],
      ["Containers", "Ordenan y alinean sin posiciones a mano."],
      ["Label / ProgressBar", "Muestran los datos."],
      ["Señales", "El jugador emite vida_cambio y el HUD escucha. Así no dependen uno del otro."],
    ],
    code: `# hud.gd
extends CanvasLayer

func _ready() -> void:
    Juego.puntos_cambiaron.connect(_on_puntos)

func _on_puntos(valor: int) -> void:
    %Puntos.text = str(valor)

func set_vida(actual: int, maxima: int) -> void:
    %BarraVida.max_value = maxima
    create_tween().tween_property(%BarraVida, "value", actual, 0.2)`,
    tips: ["Marca los nodos con 'Acceso como nombre único' (%) para no depender de rutas largas.", "Usa un tema (Theme) para cambiar la fuente de toda la UI de una vez."],
  },
  {
    id: "menu", title: "Un menú principal y pausa",
    lead: "Pantalla de inicio, botones que cambian de escena y pausa que congela el juego.",
    img: DOC("container_example.gif"),
    tree: [
      ["Control", "MenuPrincipal", 0, "Control"],
      ["TextureRect", "Fondo", 1, "TextureRect"],
      ["CenterContainer", "CenterContainer", 1, "CenterContainer"],
      ["VBoxContainer", "VBoxContainer", 2, "VBoxContainer"],
      ["Button", "Jugar", 3, "Button"],
      ["Button", "Salir", 3, "Button"],
    ],
    need: [
      ["Control (Full Rect)", "Raíz que ocupa toda la pantalla."],
      ["CenterContainer + VBoxContainer", "Botones centrados y apilados."],
      ["Señal pressed", "Cada botón ejecuta una acción."],
      ["process_mode = Always", "En el menú de pausa, para que siga funcionando con el juego pausado."],
    ],
    code: `# menu_principal.gd
extends Control

func _ready() -> void:
    %Jugar.grab_focus()
    %Jugar.pressed.connect(func(): get_tree().change_scene_to_file("res://nivel_1.tscn"))
    %Salir.pressed.connect(get_tree().quit)

# menu_pausa.gd  (process_mode = Always)
extends CanvasLayer

func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed("pausa"):
        get_tree().paused = not get_tree().paused
        visible = get_tree().paused`,
    tips: ["grab_focus() permite navegar el menú con teclado o mando.", "Todo nodo con process_mode = Inherit se congela al pausar."],
  },
  {
    id: "personaje3d", title: "Un personaje 3D en tercera persona",
    lead: "Se mueve relativo a la cámara y la cámara orbita con el mouse.",
    img: DOC("squash-the-creeps-final.gif"),
    tree: [
      ["CharacterBody3D", "Jugador", 0, "CharacterBody3D"],
      ["MeshInstance3D", "Modelo", 1, "MeshInstance3D"],
      ["CollisionShape3D", "CollisionShape3D", 1, "CollisionShape3D"],
      ["Node3D", "Pivote", 1, "Node3D"],
      ["SpringArm3D", "SpringArm3D", 2, "SpringArm3D"],
      ["Camera3D", "Camera3D", 3, "Camera3D"],
    ],
    need: [
      ["CharacterBody3D", "Cuerpo controlado por código."],
      ["MeshInstance3D / modelo .glb", "Lo que se ve."],
      ["CollisionShape3D (Capsule)", "La forma física estándar para personas."],
      ["Pivote + SpringArm3D + Camera3D", "Cámara que orbita y no atraviesa paredes."],
    ],
    code: `extends CharacterBody3D

@export var speed := 6.0
@export var sens := 0.003
@onready var pivote: Node3D = $Pivote

func _ready() -> void:
    Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventMouseMotion:
        pivote.rotate_y(-event.relative.x * sens)

func _physics_process(delta: float) -> void:
    if not is_on_floor():
        velocity += get_gravity() * delta
    var input := Input.get_vector("izquierda", "derecha", "adelante", "atras")
    var dir := (pivote.global_basis * Vector3(input.x, 0, input.y))
    dir.y = 0
    dir = dir.normalized()
    velocity.x = dir.x * speed
    velocity.z = dir.z * speed
    move_and_slide()`,
    tips: ["Mueve relativo al pivote de la cámara, no al personaje, o los controles se invierten.", "Importa modelos en .glb: traen mallas, materiales y animaciones."],
  },
  {
    id: "primera-persona", title: "Un personaje 3D en primera persona",
    lead: "Mira con el mouse, camina, salta e interactúa con lo que tiene delante.",
    img: DOC("godot-tps-demo.webp"),
    tree: [
      ["CharacterBody3D", "Jugador", 0, "CharacterBody3D"],
      ["CollisionShape3D", "CollisionShape3D", 1, "CollisionShape3D"],
      ["Node3D", "Cabeza", 1, "Node3D"],
      ["Camera3D", "Camera3D", 2, "Camera3D"],
      ["RayCast3D", "Mira", 3, "RayCast3D"],
    ],
    need: [
      ["CharacterBody3D", "El cuerpo que se mueve con move_and_slide()."],
      ["CollisionShape3D (Capsule)", "Altura ~1.8 m. Sin malla visible: en primera persona no te ves."],
      ["Node3D Cabeza", "Gira arriba/abajo. El cuerpo gira a los lados. Así nunca das vueltas de campana."],
      ["Camera3D", "Hija de la cabeza, a la altura de los ojos."],
      ["RayCast3D Mira", "Apunta hacia -Z unos 3 m para detectar objetos interactuables."],
      ["Acciones de Input Map", "izquierda, derecha, adelante, atras, saltar, interactuar."],
    ],
    code: `extends CharacterBody3D

@export var speed := 5.0
@export var jump := 4.5
@export var sens := 0.0025

@onready var cabeza: Node3D = $Cabeza
@onready var mira: RayCast3D = $Cabeza/Camera3D/Mira

func _ready() -> void:
    Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventMouseMotion:
        rotate_y(-event.relative.x * sens)
        cabeza.rotate_x(-event.relative.y * sens)
        cabeza.rotation.x = clamp(cabeza.rotation.x, deg_to_rad(-89), deg_to_rad(89))
    elif event.is_action_pressed("ui_cancel"):
        Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
    elif event.is_action_pressed("interactuar") and mira.is_colliding():
        var obj = mira.get_collider()
        if obj.has_method("usar"):
            obj.usar()

func _physics_process(delta: float) -> void:
    if not is_on_floor():
        velocity += get_gravity() * delta
    elif Input.is_action_just_pressed("saltar"):
        velocity.y = jump
    var input := Input.get_vector("izquierda", "derecha", "adelante", "atras")
    var dir := (transform.basis * Vector3(input.x, 0, input.y)).normalized()
    velocity.x = dir.x * speed
    velocity.z = dir.z * speed
    move_and_slide()`,
    tips: ["Limita la rotación de la cabeza a ±89° o la cámara se da vuelta.", "Cualquier objeto con un método usar() se vuelve interactuable: puertas, palancas, cofres."],
  },
  {
    id: "npc", title: "Un NPC con diálogo",
    lead: "Te acercas, aparece “Pulsa E”, y el personaje habla línea por línea.",
    img: DOC("bbcode_in_richtextlabel_effect_wave.webp"),
    tree: [
      ["Node2D", "NPC", 0, "Node2D"],
      ["AnimatedSprite2D", "AnimatedSprite2D", 1, "AnimatedSprite2D"],
      ["Area2D", "ZonaHablar", 1, "Area2D"],
      ["CollisionShape2D", "CollisionShape2D", 2, "CollisionShape2D"],
      ["Label", "Aviso", 1, "Label"],
      ["CanvasLayer", "CajaDialogo", 1, "CanvasLayer"],
      ["PanelContainer", "Panel", 2, "PanelContainer"],
      ["RichTextLabel", "Texto", 3, "RichTextLabel"],
    ],
    need: [
      ["Area2D ZonaHablar", "Círculo grande alrededor del NPC: detecta cuando el jugador está cerca."],
      ["Label Aviso", "“Pulsa E” sobre la cabeza. Oculto hasta que el jugador entra."],
      ["CanvasLayer + PanelContainer", "La caja de diálogo fija en pantalla."],
      ["RichTextLabel", "El texto, con BBCode para colores y efectos. Marca “Acceso como nombre único”."],
      ["Acción interactuar", "Asígnale la tecla E en el Input Map."],
    ],
    code: `extends Node2D

@export var lineas: PackedStringArray = ["¡Hola, viajero!", "El puente del [color=gold]norte[/color] está roto."]

var jugador_cerca := false
var indice := -1

@onready var aviso: Label = $Aviso
@onready var caja: CanvasLayer = $CajaDialogo
@onready var texto: RichTextLabel = %Texto

func _ready() -> void:
    aviso.hide()
    caja.hide()
    $ZonaHablar.body_entered.connect(_on_entra)
    $ZonaHablar.body_exited.connect(_on_sale)

func _on_entra(body: Node2D) -> void:
    if body.is_in_group("jugador"):
        jugador_cerca = true
        aviso.show()

func _on_sale(body: Node2D) -> void:
    if body.is_in_group("jugador"):
        jugador_cerca = false
        aviso.hide()
        cerrar()

func _unhandled_input(event: InputEvent) -> void:
    if jugador_cerca and event.is_action_pressed("interactuar"):
        avanzar()

func avanzar() -> void:
    indice += 1
    if indice >= lineas.size():
        cerrar()
        return
    caja.show()
    texto.text = lineas[indice]
    texto.visible_ratio = 0.0
    create_tween().tween_property(texto, "visible_ratio", 1.0, 0.4)  # efecto máquina de escribir

func cerrar() -> void:
    indice = -1
    caja.hide()`,
    tips: ["Activa bbcode_enabled en el RichTextLabel para que funcionen [color] y [wave].", "Para diálogos largos o con ramas, guarda las líneas en un Resource o un JSON."],
  },
  {
    id: "plataforma-movil", title: "Una plataforma móvil",
    lead: "Va y viene sola, y lleva encima al jugador sin que se resbale.",
    img: DOC("animation_keyframes.webp"),
    tree: [
      ["AnimatableBody2D", "Plataforma", 0, "AnimatableBody2D"],
      ["Sprite2D", "Sprite2D", 1, "Sprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
    ],
    need: [
      ["AnimatableBody2D", "Cuerpo sólido que se mueve y arrastra lo que tiene encima."],
      ["CollisionShape2D", "Con one_way_collision = true si quieres atravesarla desde abajo."],
      ["Tween o AnimationPlayer", "Mueve la posición. Aquí por código para ajustarla desde el Inspector."],
    ],
    code: `extends AnimatableBody2D

@export var desplazamiento := Vector2(200, 0)
@export var duracion := 2.0
@export var pausa := 0.5

func _ready() -> void:
    var inicio := position
    var t := create_tween().set_loops()
    t.set_process_mode(Tween.TWEEN_PROCESS_PHYSICS)  # sincroniza con la física
    t.tween_property(self, "position", inicio + desplazamiento, duracion).set_trans(Tween.TRANS_SINE)
    t.tween_interval(pausa)
    t.tween_property(self, "position", inicio, duracion).set_trans(Tween.TRANS_SINE)
    t.tween_interval(pausa)`,
    tips: ["Deja sync_to_physics activado: evita que el jugador tiemble encima.", "No uses StaticBody2D para esto: no arrastra al jugador."],
  },
  {
    id: "nivel-tilemap", title: "Un nivel con TileMapLayer",
    lead: "Pinta el escenario con tiles que ya traen colisión y ajusta la cámara a sus bordes.",
    img: DOC("using_tilesets_create_physics_layer.webp"),
    tree: [
      ["Node2D", "Nivel1", 0, "Node2D"],
      ["TileMapLayer", "Fondo", 1, "Node2D"],
      ["TileMapLayer", "Suelo", 1, "Node2D"],
      ["TileMapLayer", "Decoracion", 1, "Node2D"],
      ["Marker2D", "Inicio", 1, "Marker2D"],
      ["CharacterBody2D", "Jugador (instancia)", 1, "CharacterBody2D"],
    ],
    need: [
      ["TileSet", "Recurso con tu imagen de tiles. En la pestaña TileSet: Physics Layers → pinta las colisiones."],
      ["TileMapLayer por capa", "Fondo (sin colisión), Suelo (con colisión), Decoración (delante o detrás)."],
      ["Terrains (opcional)", "Para que bordes y esquinas se coloquen solos al pintar."],
      ["Instancia del jugador", "Arrastra jugador.tscn al nivel."],
      ["Camera2D con límites", "Para no mostrar lo que hay fuera del mapa."],
    ],
    code: `extends Node2D

@onready var suelo: TileMapLayer = $Suelo
@onready var jugador: CharacterBody2D = $Jugador
@onready var camara: Camera2D = $Jugador/Camera2D

func _ready() -> void:
    jugador.global_position = $Inicio.global_position

    # Limita la cámara al tamaño real de lo pintado
    var rect := suelo.get_used_rect()
    var tam := suelo.tile_set.tile_size
    camara.limit_left = rect.position.x * tam.x
    camara.limit_top = rect.position.y * tam.y
    camara.limit_right = rect.end.x * tam.x
    camara.limit_bottom = rect.end.y * tam.y`,
    tips: ["Comparte el mismo TileSet (.tres) entre capas y niveles.", "Para pixel art: Proyecto → Configuración → Rendering → Textures → Default Texture Filter = Nearest."],
  },
  {
    id: "perseguidor", title: "Un enemigo que te persigue",
    lead: "Te detecta al acercarte y te busca esquivando paredes con pathfinding.",
    img: DOC("nav_2d_min_setup_step3.webp"),
    tree: [
      ["CharacterBody2D", "Perseguidor", 0, "CharacterBody2D"],
      ["AnimatedSprite2D", "AnimatedSprite2D", 1, "AnimatedSprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["NavigationAgent2D", "NavigationAgent2D", 1, "NavigationAgent2D"],
      ["Area2D", "ZonaDeteccion", 1, "Area2D"],
      ["CollisionShape2D", "CollisionShape2D", 2, "CollisionShape2D"],
      ["Timer", "RecalcularRuta", 1, "Timer"],
    ],
    need: [
      ["NavigationRegion2D en el nivel", "O un TileMapLayer con capa de navegación en su TileSet."],
      ["NavigationAgent2D", "Calcula el camino y te da el siguiente punto."],
      ["Area2D ZonaDeteccion", "Círculo de visión: al entrar el jugador, empieza la persecución."],
      ["Timer RecalcularRuta", "Actualiza el destino cada 0.2 s en vez de cada frame (autostart = true)."],
    ],
    code: `extends CharacterBody2D

@export var speed := 110.0
var objetivo: Node2D

@onready var agente: NavigationAgent2D = $NavigationAgent2D

func _ready() -> void:
    $ZonaDeteccion.body_entered.connect(_on_detectar)
    $ZonaDeteccion.body_exited.connect(_on_perder)
    $RecalcularRuta.timeout.connect(_actualizar_ruta)

func _on_detectar(body: Node2D) -> void:
    if body.is_in_group("jugador"):
        objetivo = body

func _on_perder(body: Node2D) -> void:
    if body == objetivo:
        objetivo = null

func _actualizar_ruta() -> void:
    if objetivo:
        agente.target_position = objetivo.global_position

func _physics_process(_delta: float) -> void:
    if objetivo == null or agente.is_navigation_finished():
        velocity = velocity.move_toward(Vector2.ZERO, 20.0)
    else:
        var siguiente := agente.get_next_path_position()
        velocity = global_position.direction_to(siguiente) * speed
    move_and_slide()`,
    tips: ["Este ejemplo es top-down. En plataformas usa RayCast2D y saltos en vez de navegación.", "Haz la ZonaDeteccion más grande al perseguir que al detectar para que no te suelte enseguida."],
  },
  {
    id: "vida", title: "Un sistema de vida y daño",
    lead: "Componente de salud reutilizable con invencibilidad temporal y knockback.",
    img: null,
    tree: [
      ["CharacterBody2D", "Jugador", 0, "CharacterBody2D"],
      ["AnimatedSprite2D", "AnimatedSprite2D", 1, "AnimatedSprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["Node", "Salud", 1, "Node"],
      ["AnimationPlayer", "AnimationPlayer", 1, "AnimationPlayer"],
    ],
    need: [
      ["Nodo Salud (script propio)", "Guarda la vida y emite señales. Sirve igual para jugador, enemigos y cajas."],
      ["class_name", "Te permite escribir “Salud” como tipo y verlo en el diálogo de crear nodo."],
      ["AnimationPlayer", "Animación “parpadeo” que cambia modulate:a para los i-frames."],
      ["Método recibir_dano()", "Lo que llaman las hitboxes, balas y trampas."],
    ],
    code: `# salud.gd  — componente reutilizable
class_name Salud
extends Node

signal cambio(actual: int, maxima: int)
signal murio

@export var maxima := 5
@export var invencibilidad := 0.8
@onready var actual := maxima
var _invencible := false

func recibir_dano(cantidad: int) -> void:
    if _invencible or actual <= 0:
        return
    actual = max(actual - cantidad, 0)
    cambio.emit(actual, maxima)
    if actual == 0:
        murio.emit()
        return
    _invencible = true
    await get_tree().create_timer(invencibilidad).timeout
    _invencible = false

func curar(cantidad: int) -> void:
    actual = min(actual + cantidad, maxima)
    cambio.emit(actual, maxima)

# --- en jugador.gd ---
@onready var salud: Salud = $Salud

func _ready() -> void:
    salud.murio.connect(get_tree().reload_current_scene, CONNECT_DEFERRED)

func recibir_dano(cantidad: int, desde: Vector2) -> void:
    salud.recibir_dano(cantidad)
    $AnimationPlayer.play("parpadeo")
    velocity = desde.direction_to(global_position) * 300.0  # knockback`,
    tips: ["Conecta salud.cambio al HUD para actualizar la barra sin que el HUD conozca al jugador.", "Recargar la escena con CONNECT_DEFERRED evita errores por cambiar de escena en mitad de la física."],
  },
  {
    id: "spawner", title: "Un generador de enemigos",
    lead: "Crea enemigos cada cierto tiempo en puntos aleatorios de un borde, con un máximo en pantalla.",
    img: DOC("draw_path2d.gif"),
    tree: [
      ["Node2D", "Spawner", 0, "Node2D"],
      ["Path2D", "Ruta", 1, "Path2D"],
      ["PathFollow2D", "PuntoAleatorio", 2, "PathFollow2D"],
      ["Timer", "Timer", 1, "Timer"],
    ],
    need: [
      ["Path2D", "Dibuja el borde por donde pueden aparecer (rodeando la pantalla, por ejemplo)."],
      ["PathFollow2D", "Se mueve a un punto aleatorio de la ruta antes de cada aparición."],
      ["Timer", "Marca el ritmo de las oleadas."],
      ["@export PackedScene", "Arrastra enemigo.tscn al Inspector: el mismo spawner sirve para cualquier enemigo."],
    ],
    code: `extends Node2D

@export var enemigo: PackedScene
@export var cada := 2.0
@export var max_vivos := 10

@onready var punto: PathFollow2D = $Ruta/PuntoAleatorio

func _ready() -> void:
    $Timer.wait_time = cada
    $Timer.timeout.connect(_generar)
    $Timer.start()

func _generar() -> void:
    if get_tree().get_node_count_in_group("enemigos") >= max_vivos:
        return
    punto.progress_ratio = randf()
    var e = enemigo.instantiate()
    e.global_position = punto.global_position
    e.add_to_group("enemigos")
    get_tree().current_scene.add_child(e)
    $Timer.wait_time = max(0.4, $Timer.wait_time * 0.97)  # cada vez más rápido`,
    tips: ["Bajar wait_time poco a poco es la forma más simple de subir la dificultad.", "Basado en el tutorial oficial “Dodge the Creeps”."],
  },
  {
    id: "transicion", title: "Una puerta a otro nivel con fundido",
    lead: "Al tocar la puerta la pantalla se funde a negro, carga el siguiente nivel y vuelve a aparecer.",
    img: null,
    tree: [
      ["CanvasLayer", "Transicion (Autoload)", 0, "CanvasLayer"],
      ["ColorRect", "Negro", 1, "ColorRect"],
      ["Area2D", "Puerta", 0, "Area2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
    ],
    need: [
      ["Escena transicion.tscn como Autoload", "Proyecto → Configuración → Globales. Vive entre escenas."],
      ["ColorRect Negro", "Full Rect, color negro, modulate.a = 0, mouse_filter = Ignore."],
      ["CanvasLayer con layer alto", "layer = 100 para quedar encima de todo, incluido el HUD."],
      ["Area2D Puerta", "Con @export_file para elegir el nivel destino en el Inspector."],
    ],
    code: `# transicion.gd  (Autoload "Transicion")
extends CanvasLayer

@onready var negro: ColorRect = $Negro

func cambiar_a(ruta: String) -> void:
    await create_tween().tween_property(negro, "modulate:a", 1.0, 0.3).finished
    get_tree().change_scene_to_file(ruta)
    create_tween().tween_property(negro, "modulate:a", 0.0, 0.3)

# puerta.gd
extends Area2D

@export_file("*.tscn") var destino: String

func _ready() -> void:
    body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node2D) -> void:
    if body.is_in_group("jugador"):
        set_deferred("monitoring", false)  # evita dispararla dos veces
        Transicion.cambiar_a(destino)`,
    tips: ["El Autoload no se destruye al cambiar de escena: por eso puede terminar el fundido.", "Usa el mismo patrón para la muerte: fundido → reload_current_scene()."],
  },
  {
    id: "guardar", title: "Guardar y cargar partida",
    lead: "Escribe el progreso en un archivo JSON y lo recupera al volver a jugar.",
    img: DOC("groups.webp"),
    tree: [
      ["Node", "Guardado (Autoload)", 0, "Node"],
    ],
    need: [
      ["Autoload Guardado", "Un script global accesible desde cualquier escena."],
      ["Ruta user://", "Carpeta de datos del usuario. res:// es de solo lectura en el juego exportado."],
      ["Grupo “persistente”", "Cada nodo que deba guardarse implementa guardar() → Dictionary."],
      ["FileAccess + JSON", "Leer y escribir texto plano, fácil de depurar."],
    ],
    code: `# guardado.gd  (Autoload "Guardado")
extends Node

const RUTA := "user://partida.json"

func guardar() -> void:
    var datos := {
        "nivel": get_tree().current_scene.scene_file_path,
        "puntos": Juego.puntos,
        "nodos": [],
    }
    for n in get_tree().get_nodes_in_group("persistente"):
        datos.nodos.append(n.guardar())  # cada nodo devuelve un Dictionary
    var f := FileAccess.open(RUTA, FileAccess.WRITE)
    f.store_string(JSON.stringify(datos, "  "))

func cargar() -> void:
    if not FileAccess.file_exists(RUTA):
        return
    var datos = JSON.parse_string(FileAccess.get_file_as_string(RUTA))
    if datos == null:
        push_warning("Partida corrupta")
        return
    Juego.puntos = datos.puntos
    get_tree().change_scene_to_file(datos.nivel)`,
    tips: ["JSON convierte los números a float: usa int(datos.puntos) si necesitas entero.", "Para opciones (volumen, idioma) ConfigFile es más simple que JSON."],
  },

  /* ---- Recetas paso a paso: en vez de "code" llevan "steps" ---- */
  {
    id: "estados", title: "Una máquina de estados",
    lead: "Ordena el comportamiento del personaje en estados (Idle, Correr, Saltar, Caer) para que el código no se vuelva un nudo de if.",
    img: DOC("animtree_transition.webp"),
    tree: [
      ["CharacterBody2D", "Jugador", 0, "CharacterBody2D"],
      ["AnimatedSprite2D", "AnimatedSprite2D", 1, "AnimatedSprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["Node", "MaquinaEstados", 1, "Node"],
      ["Node", "Idle", 2, "Node"],
      ["Node", "Correr", 2, "Node"],
      ["Node", "Saltar", 2, "Node"],
      ["Node", "Caer", 2, "Node"],
    ],
    need: [
      ["CharacterBody2D Jugador", "Guarda las constantes y funciones que usan todos los estados (gravedad, mover)."],
      ["Node MaquinaEstados", "Llama al estado activo cada frame y hace los cambios de estado."],
      ["Un Node por estado", "Idle, Correr, Saltar y Caer, cada uno con su script. El nombre del nodo es el nombre del estado."],
      ["Clase base Estado", "Un script con class_name que todos los estados heredan, para que tengan las mismas funciones."],
      ["AnimatedSprite2D", "Con animaciones idle, correr, saltar y caer."],
    ],
    steps: [
      { t: "La clase base Estado", d: "Define el 'contrato' que cumplen todos los estados: qué pasa al entrar, al salir y en cada frame. Las funciones están vacías; cada estado rellena solo las que necesita.", file: "estado.gd", code: `class_name Estado
extends Node

# La máquina rellena estas dos referencias al arrancar
var jugador: Jugador
var maquina: MaquinaEstados

func entrar() -> void:
    pass

func salir() -> void:
    pass

func fisica(_delta: float) -> void:
    pass` },
      { t: "La máquina de estados", d: "Al arrancar le pasa a cada estado hijo una referencia al jugador y a sí misma. Cada frame de física delega en el estado actual. cambiar_a() avisa al estado viejo que sale y al nuevo que entra.", file: "maquina_estados.gd", code: `class_name MaquinaEstados
extends Node

@export var inicial: Estado
var actual: Estado

func _ready() -> void:
    for estado in get_children():
        estado.jugador = owner
        estado.maquina = self
    await owner.ready          # espera a que el jugador termine su _ready()
    cambiar_a(inicial.name)

func cambiar_a(nombre: String) -> void:
    if actual:
        actual.salir()
    actual = get_node(nombre)
    actual.entrar()

func _physics_process(delta: float) -> void:
    if actual:
        actual.fisica(delta)` },
      { t: "El jugador con lo común", d: "El jugador ya no decide nada: solo ofrece herramientas que comparten los estados. class_name Jugador permite que los estados lo usen con autocompletado.", file: "jugador.gd", code: `class_name Jugador
extends CharacterBody2D

const VELOCIDAD := 200.0
const SALTO := -400.0
const FRICCION := 1200.0

@onready var anim: AnimatedSprite2D = $AnimatedSprite2D

func aplicar_gravedad(delta: float) -> void:
    velocity += get_gravity() * delta

func mover_horizontal() -> float:
    var dir := Input.get_axis("izquierda", "derecha")
    velocity.x = dir * VELOCIDAD
    if dir != 0:
        anim.flip_h = dir < 0
    return dir` },
      { t: "Estado Idle (quieto)", d: "Frena al personaje y vigila qué pasa: si pierde el suelo pasa a Caer, si pulsas saltar a Saltar, si te mueves a Correr. Las transiciones viven dentro de cada estado.", file: "idle.gd", code: `extends Estado

func entrar() -> void:
    jugador.anim.play("idle")

func fisica(delta: float) -> void:
    jugador.aplicar_gravedad(delta)
    jugador.velocity.x = move_toward(jugador.velocity.x, 0, jugador.FRICCION * delta)
    jugador.move_and_slide()

    if not jugador.is_on_floor():
        maquina.cambiar_a("Caer")
    elif Input.is_action_just_pressed("saltar"):
        maquina.cambiar_a("Saltar")
    elif Input.get_axis("izquierda", "derecha") != 0:
        maquina.cambiar_a("Correr")` },
      { t: "Estado Correr", d: "Mueve al personaje mientras haya input. Si sueltas las teclas vuelve a Idle.", file: "correr.gd", code: `extends Estado

func entrar() -> void:
    jugador.anim.play("correr")

func fisica(delta: float) -> void:
    jugador.aplicar_gravedad(delta)
    var dir := jugador.mover_horizontal()
    jugador.move_and_slide()

    if not jugador.is_on_floor():
        maquina.cambiar_a("Caer")
    elif Input.is_action_just_pressed("saltar"):
        maquina.cambiar_a("Saltar")
    elif dir == 0:
        maquina.cambiar_a("Idle")` },
      { t: "Estados Saltar y Caer", d: "Saltar da el impulso al entrar y, cuando empieza a bajar, cede el control a Caer. Caer espera a tocar el suelo para volver a Idle o Correr.", file: "saltar.gd + caer.gd", code: `# saltar.gd
extends Estado

func entrar() -> void:
    jugador.velocity.y = jugador.SALTO
    jugador.anim.play("saltar")

func fisica(delta: float) -> void:
    jugador.aplicar_gravedad(delta)
    jugador.mover_horizontal()
    jugador.move_and_slide()
    if jugador.velocity.y >= 0:
        maquina.cambiar_a("Caer")

# caer.gd
extends Estado

func entrar() -> void:
    jugador.anim.play("caer")

func fisica(delta: float) -> void:
    jugador.aplicar_gravedad(delta)
    var dir := jugador.mover_horizontal()
    jugador.move_and_slide()
    if jugador.is_on_floor():
        maquina.cambiar_a("Correr" if dir != 0 else "Idle")` },
      { t: "Conéctalo en el editor", d: "Adjunta cada script a su nodo. Selecciona MaquinaEstados y, en el Inspector, arrastra el nodo Idle a la propiedad Inicial. Dale a Play: el personaje funciona igual que antes, pero cada comportamiento está en su archivo.", file: null, code: null },
    ],
    tips: ["Para añadir un dash, crea dash.gd con extends Estado y llama a maquina.cambiar_a(\"Dash\") desde Correr. No tocas nada más.", "Pon un Label que muestre maquina.actual.name: depurar es mucho más fácil viendo el estado en pantalla.", "Este mismo patrón sirve para la IA de enemigos: Patrullar, Perseguir, Atacar."],
  },
  {
    id: "inventario", title: "Un inventario",
    lead: "Recoge objetos del suelo, apílalos y muéstralos en una cuadrícula que se abre con una tecla.",
    img: DOC("containers_grid.png"),
    tree: [
      ["Node", "Inventario (Autoload)", 0, "Node"],
      ["Area2D", "ItemSuelo", 0, "Area2D"],
      ["Sprite2D", "Sprite2D", 1, "Sprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["CanvasLayer", "HUD", 0, "CanvasLayer"],
      ["PanelContainer", "InventarioUI", 1, "PanelContainer"],
      ["GridContainer", "Grid", 2, "GridContainer"],
    ],
    need: [
      ["Resource ItemData", "Describe un tipo de objeto (nombre, icono, si se apila). Cada objeto del juego es un archivo .tres."],
      ["Autoload Inventario", "Guarda las casillas y avisa con la señal cambio. Accesible desde cualquier escena."],
      ["Area2D ItemSuelo", "El objeto tirado en el mundo que se recoge al tocarlo."],
      ["PanelContainer + GridContainer", "La ventana del inventario y la cuadrícula de casillas (columns = 4)."],
      ["Acción inventario", "Asigna la tecla I o Tab en el Input Map."],
    ],
    steps: [
      { t: "Define qué es un objeto", d: "Un Resource es un archivo de datos. Crea este script y luego, en el panel Sistema de archivos: clic derecho → Nuevo → Recurso → ItemData. Guárdalo como pocion.tres y rellena sus campos en el Inspector.", file: "item_data.gd", code: `class_name ItemData
extends Resource

@export var nombre := ""
@export var icono: Texture2D
@export var apilable := true
@export var max_pila := 99
@export_multiline var descripcion := ""` },
      { t: "El inventario (datos)", d: "Una lista de casillas; cada casilla es un diccionario con el objeto y la cantidad. agregar() intenta apilar primero y, si no puede, usa una casilla nueva. Devuelve false si está lleno para que el objeto se quede en el suelo.", file: "inventario.gd (Autoload)", code: `extends Node

signal cambio

const TAMANO := 12
var casillas: Array[Dictionary] = []  # [{ "item": ItemData, "cantidad": int }]

func agregar(item: ItemData, cantidad := 1) -> bool:
    if item.apilable:
        for c in casillas:
            if c.item == item and c.cantidad + cantidad <= item.max_pila:
                c.cantidad += cantidad
                cambio.emit()
                return true
    if casillas.size() >= TAMANO:
        return false  # lleno
    casillas.append({"item": item, "cantidad": cantidad})
    cambio.emit()
    return true

func quitar(indice: int, cantidad := 1) -> void:
    casillas[indice].cantidad -= cantidad
    if casillas[indice].cantidad <= 0:
        casillas.remove_at(indice)
    cambio.emit()` },
      { t: "El objeto en el suelo", d: "Arrastra un .tres al campo Item del Inspector y el objeto se dibuja con su icono. Solo desaparece si el inventario lo aceptó.", file: "item_suelo.gd", code: `extends Area2D

@export var item: ItemData
@export var cantidad := 1

func _ready() -> void:
    $Sprite2D.texture = item.icono
    body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node2D) -> void:
    if body.is_in_group("jugador") and Inventario.agregar(item, cantidad):
        queue_free()` },
      { t: "La ventana (vista)", d: "Escucha Inventario.cambio y redibuja la cuadrícula: un botón por casilla con el icono y la cantidad. Pulsar una casilla la usa (quita una unidad). La tecla inventario la abre y cierra.", file: "inventario_ui.gd", code: `extends PanelContainer

@onready var grid: GridContainer = %Grid

func _ready() -> void:
    hide()
    Inventario.cambio.connect(actualizar)
    actualizar()

func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed("inventario"):
        visible = not visible

func actualizar() -> void:
    for hijo in grid.get_children():
        hijo.queue_free()
    for i in Inventario.TAMANO:
        var boton := Button.new()
        boton.custom_minimum_size = Vector2(64, 64)
        boton.expand_icon = true
        if i < Inventario.casillas.size():
            var c: Dictionary = Inventario.casillas[i]
            boton.icon = c.item.icono
            boton.text = str(c.cantidad) if c.cantidad > 1 else ""
            boton.tooltip_text = c.item.nombre + "\\n" + c.item.descripcion
            boton.pressed.connect(Inventario.quitar.bind(i))
        grid.add_child(boton)` },
    ],
    tips: ["Compara objetos por su recurso (c.item == item): dos pociones cargadas del mismo .tres son el mismo objeto.", "Para guardar el inventario, guarda resource_path y cantidad de cada casilla, y al cargar usa load(ruta).", "Si una pila se llena, este ejemplo crea otra casilla nueva en lugar de repartir lo que sobra."],
  },
  {
    id: "armas", title: "Cambiar de armas",
    lead: "Varias armas con la misma interfaz: cámbialas con la rueda del mouse o con las teclas 1-9 y recoge armas nuevas.",
    img: DOC("signals_shoot2.gif"),
    tree: [
      ["CharacterBody2D", "Jugador", 0, "CharacterBody2D"],
      ["Sprite2D", "Sprite2D", 1, "Sprite2D"],
      ["CollisionShape2D", "CollisionShape2D", 1, "CollisionShape2D"],
      ["Node2D", "Armas", 1, "Node2D"],
      ["Node2D", "Pistola (instancia)", 2, "Node2D"],
      ["Node2D", "Escopeta (instancia)", 2, "Node2D"],
    ],
    need: [
      ["Script base Arma", "class_name Arma con disparar(): todas las armas responden igual."],
      ["Una escena por arma", "pistola.tscn, escopeta.tscn: Node2D con Sprite2D y un Marker2D llamado Canon."],
      ["Node2D Armas", "Contenedor en el jugador. Gira hacia el mouse y guarda las armas como hijos."],
      ["Escena de bala", "La bala de la receta Disparos y proyectiles (con la variable direccion)."],
      ["Acciones de Input Map", "disparar, arma_siguiente y arma_anterior (rueda del mouse o Q/E)."],
    ],
    steps: [
      { t: "La clase base Arma", d: "Controla la cadencia: si aún no pasó el tiempo entre disparos, ignora la orden. La creación de balas está en una función aparte para que cada arma la cambie.", file: "arma.gd", code: `class_name Arma
extends Node2D

@export var nombre := "Arma"
@export var cadencia := 0.3      # segundos entre disparos
@export var bala: PackedScene
var _listo := true

func disparar(direccion: Vector2) -> void:
    if not _listo:
        return
    _listo = false
    _crear_balas(direccion)
    await get_tree().create_timer(cadencia).timeout
    _listo = true

# Las armas hijas sobrescriben esto para disparar distinto
func _crear_balas(direccion: Vector2) -> void:
    _crear_bala(direccion)

func _crear_bala(direccion: Vector2) -> void:
    var b = bala.instantiate()
    b.global_position = $Canon.global_position
    b.direccion = direccion
    get_tree().current_scene.add_child(b)` },
      { t: "Un arma distinta: la escopeta", d: "La pistola usa arma.gd tal cual. La escopeta hereda de Arma y solo cambia cómo crea balas: tres en abanico. Todo lo demás (cadencia, cañón) lo hereda.", file: "escopeta.gd", code: `extends Arma

func _crear_balas(direccion: Vector2) -> void:
    for angulo in [-0.2, 0.0, 0.2]:
        _crear_bala(direccion.rotated(angulo))` },
      { t: "Equipar y cambiar en el jugador", d: "Las armas son hijas de Armas; solo la equipada es visible. equipar() cambia el índice y avisa con una señal para que el HUD muestre el nombre. wrapi() hace que después de la última vuelva a la primera.", file: "jugador.gd", code: `signal arma_cambiada(arma: Arma)

@onready var armas: Node2D = $Armas
var indice := 0

func _ready() -> void:
    equipar(0)

func arma_actual() -> Arma:
    return armas.get_child(indice) as Arma

func equipar(i: int) -> void:
    indice = wrapi(i, 0, armas.get_child_count())
    for j in armas.get_child_count():
        armas.get_child(j).visible = j == indice
    arma_cambiada.emit(arma_actual())

func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed("arma_siguiente"):
        equipar(indice + 1)
    elif event.is_action_pressed("arma_anterior"):
        equipar(indice - 1)
    elif event is InputEventKey and event.pressed and event.keycode >= KEY_1 and event.keycode <= KEY_9:
        var n: int = event.keycode - KEY_1
        if n < armas.get_child_count():
            equipar(n)

func _process(_delta: float) -> void:
    armas.look_at(get_global_mouse_position())
    if Input.is_action_pressed("disparar"):
        var dir := armas.global_position.direction_to(get_global_mouse_position())
        arma_actual().disparar(dir)` },
      { t: "Recoger armas nuevas", d: "Un Area2D en el suelo con la escena del arma. Al tocarlo, el jugador la instancia como hija de Armas y la equipa.", file: "arma_suelo.gd + jugador.gd", code: `# arma_suelo.gd
extends Area2D

@export var arma: PackedScene

func _ready() -> void:
    body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node2D) -> void:
    if body.has_method("agregar_arma"):
        body.agregar_arma(arma)
        queue_free()

# --- en jugador.gd ---
func agregar_arma(escena: PackedScene) -> void:
    armas.add_child(escena.instantiate())
    equipar(armas.get_child_count() - 1)` },
      { t: "Muéstralo en el HUD", d: "El HUD escucha arma_cambiada y escribe el nombre. Así el jugador no depende del HUD y el HUD no revisa nada cada frame.", file: "hud.gd", code: `extends CanvasLayer

func _ready() -> void:
    var jugador = get_tree().get_first_node_in_group("jugador")
    jugador.arma_cambiada.connect(_on_arma_cambiada)

func _on_arma_cambiada(arma: Arma) -> void:
    %NombreArma.text = arma.nombre` },
    ],
    tips: ["Gira el Node2D Armas hacia el mouse y voltea su escala en y cuando apunta a la izquierda para que el arma no quede boca abajo.", "Para munición, añade @export var municion a Arma y réstala en disparar().", "Si el HUD se carga antes que el jugador, conecta la señal desde el nivel o usa await jugador.ready."],
  },
];

// Orden y agrupación de las recetas en la página. Toda receta nueva debe sumarse aquí.
const RECIPE_GROUPS = [
  ["Personajes", ["plataformas", "topdown", "personaje3d", "primera-persona"]],
  ["Enemigos y combate", ["enemigo", "perseguidor", "proyectil", "vida", "spawner"]],
  ["Mundo y objetos", ["nivel-tilemap", "plataforma-movil", "moneda", "npc"]],
  ["Sistemas de juego", ["estados", "inventario", "armas"]],
  ["Interfaz y sistemas", ["hud", "menu", "transicion", "guardar"]],
];

// Ficha técnica de cada receta: [tipo, dificultad, archivo del script]
const RECIPE_META = {
  plataformas: ["2D", "Básico", "jugador.gd"],
  topdown: ["2D", "Básico", "jugador.gd"],
  personaje3d: ["3D", "Intermedio", "jugador.gd"],
  "primera-persona": ["3D", "Intermedio", "jugador.gd"],
  enemigo: ["2D", "Básico", "enemigo.gd"],
  perseguidor: ["2D", "Intermedio", "perseguidor.gd"],
  proyectil: ["2D", "Básico", "bala.gd + jugador.gd"],
  vida: ["2D", "Intermedio", "salud.gd + jugador.gd"],
  spawner: ["2D", "Básico", "spawner.gd"],
  "nivel-tilemap": ["2D", "Básico", "nivel.gd"],
  "plataforma-movil": ["2D", "Básico", "plataforma.gd"],
  moneda: ["2D", "Básico", "moneda.gd"],
  npc: ["2D", "Intermedio", "npc.gd"],
  hud: ["UI", "Básico", "hud.gd"],
  menu: ["UI", "Básico", "menu_principal.gd + menu_pausa.gd"],
  transicion: ["UI", "Intermedio", "transicion.gd + puerta.gd"],
  guardar: ["Sistema", "Intermedio", "guardado.gd"],
  estados: ["2D", "Intermedio", null],
  inventario: ["Sistema", "Intermedio", null],
  armas: ["2D", "Intermedio", null],
};

const GLOSSARY = [
  { term: "Coyote time", tag: "Game feel", def: "Ventana corta (≈0.08–0.15 s) en la que el jugador todavía puede saltar después de haber salido de una plataforma. Como el coyote de los dibujos que corre en el aire antes de caer. Hace que el juego se sienta justo.", code: `if is_on_floor(): coyote_t = 0.1\nelse: coyote_t -= delta\nif saltar and coyote_t > 0: velocity.y = JUMP` },
  { term: "Jump buffer", tag: "Game feel", def: "Recordar que el jugador pulsó saltar un instante ANTES de tocar el suelo y ejecutar el salto al aterrizar. Complemento perfecto del coyote time.", code: `if Input.is_action_just_pressed("saltar"): buffer = 0.1\nbuffer -= delta\nif is_on_floor() and buffer > 0:\n    velocity.y = JUMP\n    buffer = 0` },
  { term: "Salto variable", tag: "Game feel", def: "La altura del salto depende de cuánto mantienes el botón. Soltar antes corta la velocidad vertical.", code: `if Input.is_action_just_released("saltar") and velocity.y < 0:\n    velocity.y *= 0.5` },
  { term: "Apex hang", tag: "Game feel", def: "Reducir la gravedad en la cima del salto para dar un instante de flotación y más control en el aire." },
  { term: "Corner correction", tag: "Game feel", def: "Si el jugador golpea por poco la esquina de un techo al saltar, empujarlo unos píxeles a un lado en lugar de frenarlo en seco." },
  { term: "Delta (delta time)", tag: "Programación", def: "Tiempo en segundos desde el último fotograma. Multiplicar movimientos por delta hace que el juego vaya igual a 30 o a 144 FPS.", code: `position.x += 100 * delta  # 100 píxeles por segundo` },
  { term: "Game feel / Juice", tag: "Game feel", def: "Todo lo que hace que una acción se sienta satisfactoria: partículas, sonidos, temblor de cámara, squash & stretch, hit stop. No cambia la jugabilidad, cambia la sensación." },
  { term: "Screen shake", tag: "Game feel", def: "Temblor de cámara en impactos o explosiones. Moderarlo y permitir desactivarlo por accesibilidad." },
  { term: "Hit stop / Hit freeze", tag: "Game feel", def: "Congelar el juego unas centésimas de segundo al conectar un golpe para darle peso.", code: `Engine.time_scale = 0.05\nawait get_tree().create_timer(0.06, true, false, true).timeout\nEngine.time_scale = 1.0` },
  { term: "Squash & stretch", tag: "Animación", def: "Aplastar y estirar un sprite (escala) al saltar y aterrizar. Principio clásico de animación que da elasticidad." },
  { term: "Knockback", tag: "Combate", def: "Empuje que recibe un personaje al ser golpeado, en dirección opuesta al atacante." },
  { term: "I-frames (invencibilidad)", tag: "Combate", def: "Fotogramas de invulnerabilidad tras recibir daño o durante una esquiva. Normalmente se indica con parpadeo." },
  { term: "Hitbox", tag: "Combate", def: "Zona que HACE daño (la espada, la bala). En Godot suele ser un Area2D." },
  { term: "Hurtbox", tag: "Combate", def: "Zona que RECIBE daño (el cuerpo del personaje). Hitbox entra en Hurtbox → daño." },
  { term: "Collision layer / mask", tag: "Física", def: "Layer: en qué capas EXISTE el objeto. Mask: qué capas DETECTA. Un enemigo en la capa 2 con máscara 1 detecta al jugador (capa 1) pero no a otros enemigos." },
  { term: "Raycast", tag: "Física", def: "Rayo invisible que devuelve el primer objeto que toca. Línea de visión, disparos instantáneos, detectar suelo." },
  { term: "Tile / Tileset / Tilemap", tag: "Niveles", def: "Tile: un cuadrito de imagen. Tileset: la colección de tiles con sus colisiones. Tilemap: la cuadrícula del nivel pintada con ellos." },
  { term: "Autotile / Terrain", tag: "Niveles", def: "Tiles que eligen automáticamente su variante (borde, esquina, centro) según los vecinos. En Godot 4 se llaman Terrains." },
  { term: "Parallax", tag: "Visual", def: "Capas de fondo que se mueven a distinta velocidad para simular profundidad." },
  { term: "Sprite sheet", tag: "Visual", def: "Una sola imagen con todos los cuadros de una animación ordenados en filas y columnas." },
  { term: "9-slice / NinePatch", tag: "UI", def: "Dividir una imagen en 9 partes para escalar paneles sin deformar las esquinas. NinePatchRect en Godot." },
  { term: "Pixel perfect", tag: "Visual", def: "Renderizar pixel art sin difuminado ni píxeles de tamaños distintos. Filtro Nearest + escalado entero (stretch mode viewport, scale mode integer)." },
  { term: "Z-index / Y-sort", tag: "Visual", def: "Z-index: orden de dibujo manual. Y-sort: dibujar primero lo que está más arriba en pantalla para que el jugador pase 'detrás' de árboles." },
  { term: "Lerp", tag: "Matemática", def: "Interpolación lineal: obtener un valor intermedio entre A y B. Usado para suavizar cámaras, colores y movimientos." },
  { term: "Easing", tag: "Animación", def: "Curva de aceleración de una animación (ease in, ease out, back, elastic). Hace que los movimientos se vean naturales." },
  { term: "Tween", tag: "Animación", def: "Animación generada por código que interpola una propiedad en el tiempo." },
  { term: "Vector normalizado", tag: "Matemática", def: "Vector de longitud 1 que solo indica dirección. Evita que el movimiento diagonal sea más rápido.", code: `var dir := Vector2(1, 1).normalized()  # (0.707, 0.707)` },
  { term: "Local vs global", tag: "Programación", def: "position es relativa al padre; global_position es relativa al mundo. Confundirlas es un bug clásico." },
  { term: "Escena (Scene)", tag: "Godot", def: "Árbol de nodos guardado en un .tscn. Puede ser un nivel, un personaje o un botón. Se reutiliza instanciándola." },
  { term: "Instancia", tag: "Godot", def: "Copia viva de una escena dentro de otra. 20 enemigos = 20 instancias de enemigo.tscn." },
  { term: "Señal (Signal)", tag: "Godot", def: "Mensaje que un nodo emite cuando algo pasa para que otros reaccionen sin acoplarse. Implementa el patrón Observer." },
  { term: "Signal bus / Event bus", tag: "Arquitectura", def: "Autoload que solo contiene señales globales (jugador_murio, nivel_completado) para comunicar partes lejanas del juego." },
  { term: "Autoload / Singleton", tag: "Godot", def: "Script o escena cargada siempre y accesible desde cualquier parte por su nombre. Guarda puntos, opciones, música." },
  { term: "Recurso (Resource)", tag: "Godot", def: "Datos reutilizables guardados como .tres: texturas, sonidos, o tus propias clases (ItemData, EnemyStats)." },
  { term: "Grupos", tag: "Godot", def: "Etiquetas para nodos. Permiten preguntar is_in_group(\"enemigos\") o llamar una función a todos con call_group." },
  { term: "Máquina de estados (FSM)", tag: "Arquitectura", def: "Organizar el comportamiento en estados (Idle, Correr, Saltar, Atacar) donde solo uno está activo y hay reglas para cambiar.", code: `enum Estado { IDLE, CORRER, SALTAR }\nvar estado := Estado.IDLE\n\nmatch estado:\n    Estado.IDLE: ...\n    Estado.CORRER: ...` },
  { term: "Behavior tree", tag: "IA", def: "Árbol de decisiones para IA más compleja que una FSM: secuencias, selectores y condiciones." },
  { term: "Pathfinding / A*", tag: "IA", def: "Calcular el camino más corto evitando obstáculos. Godot lo hace con NavigationServer o la clase AStarGrid2D." },
  { term: "Navmesh", tag: "IA", def: "Malla que define por dónde se puede caminar. NavigationRegion2D/3D." },
  { term: "Object pooling", tag: "Rendimiento", def: "Reutilizar objetos (balas) en vez de crearlos y destruirlos todo el tiempo. Solo necesario cuando hay muchísimos." },
  { term: "Draw call", tag: "Rendimiento", def: "Cada orden de dibujo enviada a la GPU. Menos draw calls = más FPS. Los atlas de texturas ayudan." },
  { term: "Culling", tag: "Rendimiento", def: "No procesar ni dibujar lo que la cámara no ve." },
  { term: "FPS", tag: "Rendimiento", def: "Fotogramas por segundo. 60 es el estándar; menos de 30 se siente lento." },
  { term: "Fixed timestep", tag: "Programación", def: "La física avanza a un ritmo fijo (60 Hz en Godot) independientemente de los FPS. Por eso existe _physics_process." },
  { term: "Spawn / Despawn", tag: "General", def: "Hacer aparecer / desaparecer entidades en el mundo." },
  { term: "Checkpoint", tag: "Diseño", def: "Punto donde reaparece el jugador al morir." },
  { term: "Core loop", tag: "Diseño", def: "La acción principal que el jugador repite todo el juego (explorar → luchar → mejorar)." },
  { term: "MVP / Prototipo", tag: "Producción", def: "La versión mínima jugable para comprobar si la idea es divertida antes de invertir en arte." },
  { term: "Vertical slice", tag: "Producción", def: "Un fragmento corto del juego con calidad final para mostrar cómo será todo." },
  { term: "Placeholder / Programmer art", tag: "Producción", def: "Arte temporal (cuadrados, cápsulas) mientras se programa la jugabilidad." },
  { term: "Playtest", tag: "Producción", def: "Ver a otras personas jugar sin ayudarles para encontrar problemas reales." },
  { term: "Game jam", tag: "Comunidad", def: "Competencia de hacer un juego en poco tiempo (48 h, una semana) con un tema." },
  { term: "Softlock", tag: "Bugs", def: "El juego sigue funcionando pero el jugador no puede avanzar (atrapado en una pared, llave perdida)." },
  { term: "Hardlock / Crash", tag: "Bugs", def: "El juego se congela o se cierra." },
  { term: "Deadzone", tag: "Input", def: "Zona central del joystick que se ignora para evitar movimiento fantasma. También zona de cámara donde el jugador se mueve sin que la cámara lo siga." },
  { term: "Input map / Acción", tag: "Input", def: "Nombre abstracto (\"saltar\") asociado a varias teclas/botones. El código usa la acción, no la tecla." },
  { term: "Shader", tag: "Visual", def: "Pequeño programa que corre en la GPU para cambiar cómo se pinta algo: flash blanco al recibir daño, agua, outlines." },
  { term: "Post-procesado", tag: "Visual", def: "Efectos aplicados a toda la imagen final: bloom/glow, viñeta, corrección de color." },
  { term: "Procedural", tag: "Diseño", def: "Contenido generado por algoritmo (mazmorras, terrenos) en vez de hecho a mano. Usa una seed para poder repetirlo." },
  { term: "Seed / RNG", tag: "Programación", def: "RNG: generador de números aleatorios. Seed: valor inicial; la misma seed produce la misma secuencia." },
  { term: "Serialización / Guardado", tag: "Programación", def: "Convertir el estado del juego en datos (JSON, ConfigFile, Resource) para guardarlo y cargarlo después." },
  { term: "Cooldown", tag: "Combate", def: "Tiempo de espera antes de poder repetir una acción." },
  { term: "DPS", tag: "Combate", def: "Daño por segundo." },
  { term: "Aggro", tag: "IA", def: "Cuando un enemigo te detecta y empieza a perseguirte." },

  /* ---- Game feel y movimiento ---- */
  { term: "Aceleración y fricción", tag: "Game feel", def: "En vez de pasar de 0 a velocidad máxima de golpe, el personaje acelera y frena poco a poco. Valores altos = control preciso; bajos = sensación de hielo o peso.", code: `var objetivo := dir * MAX_SPEED\nvar tasa := ACCEL if dir != 0 else FRICTION\nvelocity.x = move_toward(velocity.x, objetivo, tasa * delta)` },
  { term: "Air control", tag: "Game feel", def: "Cuánto puede cambiar el jugador su dirección en el aire. Mucho control = plataformas modernas; poco = saltos comprometidos estilo clásico." },
  { term: "Fast fall", tag: "Game feel", def: "Caer más rápido de lo que se sube (gravedad mayor al descender, o al pulsar abajo). Hace los saltos menos 'flotantes'.", code: `var g := get_gravity()\nif velocity.y > 0:\n    g *= 1.6  # cae más rápido\nvelocity += g * delta` },
  { term: "Wall slide / Wall jump", tag: "Game feel", def: "Deslizarse lento por una pared y saltar desde ella hacia el lado contrario. En Godot: is_on_wall() y get_wall_normal().", code: `if is_on_wall() and not is_on_floor() and Input.is_action_just_pressed("saltar"):\n    velocity = Vector2(get_wall_normal().x * 300, -380)` },
  { term: "Dash", tag: "Game feel", def: "Impulso corto y rápido en una dirección, normalmente con cooldown y a veces con i-frames." },
  { term: "Doble salto", tag: "Game feel", def: "Permitir un segundo salto en el aire. Se lleva con un contador que se reinicia al tocar el suelo.", code: `if is_on_floor(): saltos = 2\nif Input.is_action_just_pressed("saltar") and saltos > 0:\n    velocity.y = JUMP\n    saltos -= 1` },
  { term: "Ledge grab", tag: "Game feel", def: "Agarrarse al borde de una plataforma al no llegar por poco. Se detecta con dos RayCast2D: uno en el pecho que choca y otro en la cabeza que no." },
  { term: "Camera lookahead", tag: "Game feel", def: "Desplazar la cámara hacia donde mira o se mueve el jugador para que vea lo que viene. Camera2D: drag margins u offset animado." },
  { term: "Camera smoothing", tag: "Game feel", def: "La cámara sigue al objetivo con retraso suave en vez de pegada. Camera2D → position_smoothing_enabled." },
  { term: "Hit flash", tag: "Game feel", def: "El sprite se pone blanco un instante al recibir daño. Se hace con un shader o con modulate.", code: `modulate = Color(10, 10, 10)  # sobre-brillo\ncreate_tween().tween_property(self, "modulate", Color.WHITE, 0.12)` },
  { term: "Input lag", tag: "Input", def: "Retraso entre pulsar un botón y ver la reacción. Se reduce leyendo input en _physics_process, evitando animaciones largas antes de la acción y desactivando V-Sync si hace falta." },
  { term: "Rebinding", tag: "Input", def: "Permitir que el jugador cambie las teclas. En Godot se modifica el InputMap en tiempo de ejecución.", code: `InputMap.action_erase_events("saltar")\nInputMap.action_add_event("saltar", evento_nuevo)` },
  { term: "Vibración (rumble)", tag: "Input", def: "Feedback háptico del mando. Corto y suave para golpes; nunca constante.", code: `Input.start_joy_vibration(0, 0.4, 0.8, 0.15)` },

  /* ---- Combate ---- */
  { term: "Hitstun", tag: "Combate", def: "Tiempo en que un personaje golpeado no puede actuar. Permite combos y da peso a los golpes." },
  { term: "Combo", tag: "Combate", def: "Cadena de ataques que se enlazan si se pulsan dentro de una ventana de tiempo. Se programa con un buffer de input y una máquina de estados." },
  { term: "Parry", tag: "Combate", def: "Bloqueo perfecto con timing preciso que anula el daño y suele dejar vulnerable al atacante." },
  { term: "Telegraph", tag: "Combate", def: "Señal previa de que viene un ataque (brillo, pose, sonido) para que el jugador pueda reaccionar. Un ataque sin telegraph se siente injusto." },
  { term: "Hitscan", tag: "Combate", def: "Disparo instantáneo calculado con un rayo (RayCast) en vez de un proyectil que viaja." },
  { term: "Crítico", tag: "Combate", def: "Golpe con probabilidad baja de hacer daño multiplicado.", code: `var dano := base * (2.0 if randf() < 0.1 else 1.0)` },
  { term: "Estado alterado (DoT)", tag: "Combate", def: "Efecto temporal: veneno, quemadura, lentitud. DoT = Damage over Time, daño repartido en el tiempo." },
  { term: "Patrón de jefe", tag: "Combate", def: "Secuencia de ataques que un jefe repite y que el jugador aprende. Suele cambiar de fase al bajar su vida." },
  { term: "Friendly fire", tag: "Combate", def: "Daño a aliados. En Godot se evita con collision layers/masks distintas para cada bando." },

  /* ---- Diseño ---- */
  { term: "Level design", tag: "Diseño", def: "Diseñar los espacios de juego: ritmo, desafíos, rutas, secretos y cómo enseñan mecánicas sin texto." },
  { term: "Curva de dificultad", tag: "Diseño", def: "Cómo sube el desafío a lo largo del juego. Ideal: en dientes de sierra, con picos (jefes) y descansos." },
  { term: "Onboarding", tag: "Diseño", def: "Cómo el juego enseña sus reglas al principio. Lo mejor: aprender haciendo, en un entorno seguro." },
  { term: "Signposting", tag: "Diseño", def: "Pistas visuales que guían al jugador: luces, colores, caminos, pintura amarilla en bordes escalables." },
  { term: "Affordance", tag: "Diseño", def: "Que un objeto comunique cómo se usa: una palanca 'pide' ser activada, una pared agrietada 'pide' romperse." },
  { term: "Feedback", tag: "Diseño", def: "Respuesta del juego a una acción del jugador (sonido, animación, número). Sin feedback, el jugador no sabe si hizo algo." },
  { term: "Riesgo-recompensa", tag: "Diseño", def: "Ofrecer premios mayores a cambio de exponerse más: un cofre sobre un pozo de pinchos." },
  { term: "Gating", tag: "Diseño", def: "Bloquear zonas hasta conseguir una habilidad o llave. Base de los Metroidvania." },
  { term: "Backtracking", tag: "Diseño", def: "Volver a zonas ya visitadas, normalmente con nuevas habilidades para acceder a lo que antes no se podía." },
  { term: "Metroidvania", tag: "Géneros", def: "Género de exploración con un mapa interconectado y progresión por habilidades que abren caminos." },
  { term: "Roguelike / Roguelite", tag: "Géneros", def: "Partidas cortas con niveles procedurales y muerte permanente. Roguelite añade mejoras que se conservan entre partidas." },
  { term: "Permadeath", tag: "Géneros", def: "Muerte permanente: al morir se pierde la partida." },
  { term: "Meta-progresión", tag: "Diseño", def: "Progreso que se conserva entre partidas (desbloqueos, mejoras permanentes)." },
  { term: "Loot table", tag: "Diseño", def: "Tabla de objetos que puede soltar un enemigo o cofre, cada uno con su probabilidad (peso).", code: `var tabla := {"moneda": 70, "pocion": 25, "espada": 5}\nfunc tirar() -> String:\n    var r := randi() % 100\n    for item in tabla:\n        r -= tabla[item]\n        if r < 0:\n            return item\n    return "moneda"` },
  { term: "Balance", tag: "Diseño", def: "Ajustar números (daño, vida, precios) para que ninguna opción sea obviamente la mejor o inútil." },
  { term: "Buff / Nerf", tag: "Diseño", def: "Buff: hacer algo más fuerte. Nerf: debilitarlo. Se usa tanto en parches como en efectos temporales." },
  { term: "Grinding", tag: "Diseño", def: "Repetir tareas para subir de nivel o conseguir recursos. Con moderación motiva; en exceso aburre." },
  { term: "Jugabilidad emergente", tag: "Diseño", def: "Situaciones que nadie programó directamente y surgen de combinar sistemas simples (física + fuego + viento)." },
  { term: "Sequence break", tag: "Diseño", def: "Hacer cosas en un orden no previsto por los diseñadores, saltándose partes. Querido por los speedrunners." },
  { term: "Cheese", tag: "Diseño", def: "Ganar con una estrategia barata que explota un fallo de diseño (atacar a un jefe desde un sitio donde no te alcanza)." },
  { term: "NPC", tag: "General", def: "Non-Player Character: cualquier personaje no controlado por el jugador (aldeanos, tenderos, enemigos)." },
  { term: "Mob", tag: "General", def: "Enemigo común, normalmente numeroso. Viene de 'mobile object'." },
  { term: "Respawn", tag: "General", def: "Reaparecer tras morir, en un checkpoint o punto de inicio." },
  { term: "Fog of war", tag: "Diseño", def: "Niebla que oculta zonas del mapa no exploradas o fuera de visión." },
  { term: "HUD", tag: "UI", def: "Heads-Up Display: información superpuesta durante el juego (vida, munición, mapa). En Godot va en un CanvasLayer." },
  { term: "Diegético", tag: "UI", def: "Interfaz que existe dentro del mundo del juego (un reloj en la muñeca del personaje) en vez de superpuesta." },
  { term: "Anchors", tag: "UI", def: "Puntos de anclaje de un Control respecto a su padre. Hacen que la UI se adapte a cualquier resolución." },

  /* ---- Programación y arquitectura ---- */
  { term: "Game loop", tag: "Programación", def: "El bucle que el motor repite cada frame: leer input → actualizar lógica → física → dibujar. En Godot lo ves a través de _process y _physics_process." },
  { term: "Composición", tag: "Arquitectura", def: "Construir comportamientos juntando piezas (nodos Salud, Hitbox, Movimiento) en vez de heredar de clases gigantes. Godot está diseñado para esto." },
  { term: "Componente", tag: "Arquitectura", def: "Nodo con una sola responsabilidad reutilizable: Salud, Hurtbox, SeguirJugador. Se arrastra a cualquier escena." },
  { term: "Acoplamiento", tag: "Arquitectura", def: "Cuánto depende un código de otro. Bajo acoplamiento = puedes cambiar una parte sin romper otras. Las señales ayudan a reducirlo." },
  { term: "Regla: señales arriba, llamadas abajo", tag: "Arquitectura", def: "Un padre puede llamar funciones de sus hijos; un hijo avisa a su padre con señales. Así los hijos no dependen de dónde están." },
  { term: "Patrón Observer", tag: "Arquitectura", def: "Un objeto notifica a quienes se suscribieron sin conocerlos. Las señales de Godot son exactamente esto." },
  { term: "Patrón Command", tag: "Arquitectura", def: "Encapsular acciones como objetos para poder guardarlas, repetirlas o deshacerlas (replays, undo, IA)." },
  { term: "Refactor", tag: "Programación", def: "Reorganizar el código sin cambiar lo que hace, para que sea más claro o fácil de extender." },
  { term: "Tipado estático", tag: "Programación", def: "Declarar el tipo de las variables en GDScript. Da autocompletado, detecta errores antes y el código corre más rápido.", code: `var vida: int = 3\nvar velocidad := 200.0   # tipo inferido: float\nfunc dano(n: int) -> void:` },
  { term: "Duck typing", tag: "Programación", def: "No importa qué tipo es un objeto, sino si tiene el método que necesitas: “si grazna como pato…”.", code: `if body.has_method("recibir_dano"):\n    body.recibir_dano(1)` },
  { term: "Callable / Lambda", tag: "Programación", def: "Callable es una referencia a una función que se puede guardar o pasar. Lambda es una función anónima escrita en línea.", code: `var f := func(x): return x * 2\nprint(f.call(4))  # 8\n$Boton.pressed.connect(func(): print("click"))` },
  { term: "Corrutina", tag: "Programación", def: "Función que se pausa y continúa después. En GDScript se logra con await." },
  { term: "Enum", tag: "Programación", def: "Lista de constantes con nombre. Ideal para estados y tipos.", code: `enum Arma { ESPADA, ARCO, MAGIA }\n@export var arma: Arma = Arma.ESPADA` },
  { term: "Diccionario", tag: "Programación", def: "Colección clave → valor. Útil para inventarios, datos de guardado y tablas.", code: `var inv := {"pocion": 3, "llave": 1}\ninv["pocion"] -= 1` },
  { term: "Null / referencia nula", tag: "Bugs", def: "Usar una variable que no apunta a nada. Error típico: “Invalid access to property on a null instance”. Revisa rutas de $Nodo y nodos ya liberados.", code: `if is_instance_valid(objetivo):\n    mirar(objetivo.global_position)` },
  { term: "Debugging", tag: "Programación", def: "Encontrar y arreglar errores. En Godot: print(), breakpoints (F9), el panel Depurador y el árbol remoto." },
  { term: "Breakpoint", tag: "Programación", def: "Marca en una línea donde el juego se pausa para inspeccionar variables. En Godot: clic a la izquierda del número de línea o F9." },
  { term: "Determinista", tag: "Programación", def: "Que con la misma entrada siempre produce el mismo resultado. Necesario para replays y multijugador por rollback." },
  { term: "Interpolación de física", tag: "Rendimiento", def: "Suavizar visualmente objetos movidos en _physics_process cuando los FPS de pantalla superan los de física. Proyecto → Física → Common → Physics Interpolation." },
  { term: "Tunneling", tag: "Bugs", def: "Un objeto muy rápido atraviesa una pared porque entre dos frames de física no llegó a tocarla. Soluciones: formas más grandes, ShapeCast o continuous_cd en RigidBody." },
  { term: "Jitter", tag: "Bugs", def: "Temblor visual, típico al mover cosas en _process y la cámara en _physics_process (o viceversa). Mueve todo lo relacionado en el mismo callback." },
  { term: "Clipping", tag: "Bugs", def: "Objetos que se atraviesan visualmente: una espada que entra en la pared, la cámara dentro de un muro." },
  { term: "Z-fighting", tag: "Bugs", def: "Parpadeo cuando dos superficies 3D están en el mismo plano y la GPU no sabe cuál va delante." },
  { term: "Memory leak / nodos huérfanos", tag: "Bugs", def: "Nodos creados con new() o instantiate() que nunca se añaden al árbol ni se liberan. Revísalo en Depurador → Monitores → Orphan Nodes." },
  { term: "Regresión", tag: "Bugs", def: "Un bug que reaparece o algo que funcionaba y se rompe tras un cambio." },

  /* ---- Godot ---- */
  { term: "SceneTree", tag: "Godot", def: "El árbol de todos los nodos activos. Se accede con get_tree(): pausar, cambiar escena, buscar grupos, crear timers." },
  { term: "Inspector", tag: "Godot", def: "Panel donde se editan las propiedades del nodo seleccionado y las variables @export." },
  { term: "res:// y user://", tag: "Godot", def: "res:// es la carpeta del proyecto (solo lectura al exportar). user:// es la carpeta de datos del jugador, donde se guardan partidas y opciones." },
  { term: ".tscn / .tres", tag: "Godot", def: ".tscn = escena guardada en texto. .tres = recurso guardado en texto. Ambos se llevan bien con Git." },
  { term: "Nombre único (%)", tag: "Godot", def: "Clic derecho en un nodo → Acceso como nombre único. Luego %Nombre lo encuentra aunque cambies la jerarquía." },
  { term: "process_mode", tag: "Godot", def: "Define si un nodo se procesa cuando el juego está pausado: Inherit, Pausable, When Paused, Always, Disabled." },
  { term: "@tool", tag: "Godot", def: "Anotación que hace que el script se ejecute también en el editor. Útil para previsualizar cambios sin darle a Play.", code: `@tool\nextends Node2D\n@export var radio := 32.0:\n    set(v):\n        radio = v\n        queue_redraw()` },
  { term: "Setter / Getter", tag: "Godot", def: "Código que se ejecuta al asignar o leer una variable. Ideal para actualizar la UI cuando cambia la vida.", code: `var vida := 3:\n    set(v):\n        vida = clamp(v, 0, 3)\n        vida_cambio.emit(vida)` },
  { term: "Exportar (build)", tag: "Godot", def: "Generar el ejecutable final para Windows, web, Android… Requiere descargar las export templates de la versión de Godot." },
  { term: "Addon / Plugin", tag: "Godot", def: "Extensión del editor o del juego que vive en res://addons. Se instalan desde la AssetLib o a mano y se activan en Proyecto → Plugins." },
  { term: "AssetLib", tag: "Godot", def: "Biblioteca oficial de recursos y plugins gratuitos accesible desde la pestaña del editor." },
  { term: "GDExtension", tag: "Godot", def: "Forma de escribir partes del juego en C++, Rust u otros lenguajes compilados y usarlas como nodos normales." },
  { term: "Theme / StyleBox", tag: "Godot", def: "Theme: recurso que define fuentes, colores y estilos de toda la UI. StyleBox: el fondo/borde de un control (plano, con textura, vacío)." },
  { term: "Renderer", tag: "Godot", def: "Forward+ (alta calidad, escritorio), Mobile (móviles y equipos modestos) y Compatibility (OpenGL, web y equipos viejos). Se elige al crear el proyecto." },
  { term: "Profiler", tag: "Rendimiento", def: "Herramienta del Depurador que muestra cuánto tarda cada función por frame. Úsala antes de optimizar a ciegas." },

  /* ---- Visual y animación ---- */
  { term: "Frame / Fotograma", tag: "Visual", def: "Cada imagen que se dibuja en pantalla, o cada cuadro de una animación." },
  { term: "Keyframe", tag: "Animación", def: "Valor clave en un momento de la línea de tiempo. El motor calcula los valores intermedios." },
  { term: "Anticipación", tag: "Animación", def: "Pequeño movimiento contrario antes de la acción (agacharse antes de saltar). Hace que la acción se lea mejor." },
  { term: "Follow-through", tag: "Animación", def: "Partes que siguen moviéndose tras la acción principal (capa, pelo, espada que termina el arco)." },
  { term: "Atlas de texturas", tag: "Rendimiento", def: "Varias imágenes en una sola textura grande. Reduce draw calls." },
  { term: "Paleta", tag: "Visual", def: "Conjunto limitado de colores que usa un juego. Una paleta coherente unifica el arte aunque sea simple." },
  { term: "Dithering", tag: "Visual", def: "Patrón de píxeles que simula más colores o degradados con una paleta limitada." },
  { term: "Normal map", tag: "Visual", def: "Textura que simula relieve para que la luz reaccione como si la superficie tuviera volumen. Funciona también en 2D con CanvasTexture." },
  { term: "Low poly", tag: "Visual", def: "Estilo 3D con pocos polígonos y colores planos. Rápido de producir y de renderizar." },
  { term: "Cel shading / Toon", tag: "Visual", def: "Sombreado en bandas planas que imita el dibujo animado. Se hace con un shader." },
  { term: "Billboard", tag: "Visual", def: "Imagen en 3D que siempre mira a la cámara. Sprite3D y Label3D lo traen como opción." },
  { term: "LOD", tag: "Rendimiento", def: "Level of Detail: usar versiones más simples de un modelo cuando está lejos. Godot genera LODs automáticos al importar." },
  { term: "Malla (mesh)", tag: "Visual", def: "Geometría 3D: vértices, aristas y caras que forman un modelo." },
  { term: "Rig", tag: "Animación", def: "Esqueleto de huesos dentro de un modelo para poder animarlo." },
  { term: "UV", tag: "Visual", def: "Coordenadas que indican qué parte de la textura va en cada cara del modelo." },
  { term: "Skybox", tag: "Visual", def: "Fondo envolvente que representa el cielo en 3D. En Godot: WorldEnvironment → Sky." },
  { term: "Overdraw", tag: "Rendimiento", def: "Dibujar varias veces el mismo píxel (capas transparentes superpuestas). Muchas partículas grandes lo provocan." },
  { term: "VRAM", tag: "Rendimiento", def: "Memoria de la tarjeta gráfica donde viven texturas y mallas. Texturas enormes la llenan rápido." },

  /* ---- Audio ---- */
  { term: "SFX / BGM", tag: "Audio", def: "SFX: efectos de sonido. BGM: música de fondo. Conviene enviarlos a buses de audio distintos." },
  { term: "Bus de audio", tag: "Audio", def: "Canal de mezcla (Master, Música, SFX) con volumen y efectos propios. Permite sliders de volumen separados.", code: `var bus := AudioServer.get_bus_index("Musica")\nAudioServer.set_bus_volume_db(bus, linear_to_db(0.5))` },
  { term: "Música adaptativa", tag: "Audio", def: "Música que cambia según la situación: capas que entran en combate, tempo que sube con el peligro." },
  { term: "Ducking", tag: "Audio", def: "Bajar automáticamente la música cuando suena un diálogo o efecto importante." },

  /* ---- Red ---- */
  { term: "Cliente / Servidor", tag: "Red", def: "El servidor tiene la verdad del juego; los clientes envían input y reciben el estado. En Godot, el peer con id 1 es el servidor." },
  { term: "RPC", tag: "Red", def: "Remote Procedure Call: llamar una función en otro equipo de la red.", code: `@rpc("any_peer", "reliable")\nfunc chat(msg: String) -> void:\n    print(msg)\n\nchat.rpc("¡hola!")` },
  { term: "Autoridad", tag: "Red", def: "Qué peer decide el estado de un nodo. set_multiplayer_authority(id) y is_multiplayer_authority() controlan quién lo mueve." },
  { term: "Latencia / Ping", tag: "Red", def: "Tiempo que tarda un mensaje en ir y volver por la red. Con latencia alta las acciones llegan tarde." },
  { term: "Desync", tag: "Red", def: "Cuando dos jugadores ven estados distintos del mismo juego." },
  { term: "Rollback", tag: "Red", def: "Técnica de netcode: se predice el input del rival y, si se equivocó, se rebobina y re-simula. Estándar en juegos de pelea." },

  /* ---- Producción ---- */
  { term: "GDD", tag: "Producción", def: "Game Design Document: documento que describe mecánicas, historia, arte y alcance del juego. Mejor corto y vivo que largo y olvidado." },
  { term: "Scope creep", tag: "Producción", def: "Cuando el proyecto crece sin control añadiendo ideas. La causa número uno de juegos sin terminar." },
  { term: "Polish", tag: "Producción", def: "Fase de pulido: juice, sonidos, transiciones, arreglar detalles. Suele llevar más tiempo del previsto." },
  { term: "Control de versiones (Git)", tag: "Producción", def: "Guardar el historial de cambios del proyecto para volver atrás y colaborar. Godot genera un .gitignore al crear el proyecto." },
  { term: "Build", tag: "Producción", def: "Versión compilada/exportada del juego lista para probar o publicar." },
  { term: "Patch / Hotfix", tag: "Producción", def: "Patch: actualización con correcciones o cambios. Hotfix: parche urgente para un error grave." },
  { term: "Localización", tag: "Producción", def: "Traducir y adaptar el juego a otros idiomas. Godot usa archivos CSV o PO y la función tr().", code: `$Label.text = tr("MENU_JUGAR")` },
  { term: "Early access", tag: "Producción", def: "Vender el juego sin terminar para financiarlo y recibir feedback mientras se desarrolla." },
  { term: "Devlog", tag: "Comunidad", def: "Diario público del desarrollo (videos, posts) para documentar el progreso y crear comunidad." },
  { term: "Postmortem", tag: "Producción", def: "Análisis al terminar un proyecto: qué salió bien, qué salió mal y qué aprender." },
  { term: "Speedrun", tag: "Comunidad", def: "Terminar un juego lo más rápido posible, a menudo aprovechando bugs y sequence breaks." },
];
