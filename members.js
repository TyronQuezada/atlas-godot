// Explicaciones de propiedades, métodos y señales que aparecen en las fichas de nodos.
// La clave es el nombre tal como se lista en NODES (sin paréntesis ni argumentos).
// d = qué es / para qué sirve, u = cómo se usa o consejo, c = ejemplo propio (opcional:
// si falta, app.js genera uno básico con el nombre del nodo).
const MEMBERS = { prop: {}, method: {}, signal: {} };
const P = (k, d, u, c) => (MEMBERS.prop[k] = { d, u, c });
const M = (k, d, u, c) => (MEMBERS.method[k] = { d, u, c });
const S = (k, d, u, c) => (MEMBERS.signal[k] = { d, u, c });

/* ================= PROPIEDADES ================= */

// Node / transformaciones
P("name", "Nombre del nodo en el árbol. Es lo que usas en rutas como $Jugador.", "Evita espacios y nombres repetidos entre hermanos: Godot les añade un número.", `print(name)          # "Jugador"\nname = "Jefe"`);
P("process_mode", "Decide si el nodo sigue funcionando cuando el juego está en pausa.", "Inherit copia al padre. Usa Always en menús de pausa y Pausable en el juego.", `process_mode = Node.PROCESS_MODE_ALWAYS  # sigue con get_tree().paused = true`);
P("owner", "El nodo raíz de la escena guardada a la que pertenece este nodo.", "Importa cuando creas nodos por código y quieres que se guarden con la escena (herramientas @tool).", `nuevo.owner = get_tree().edited_scene_root`);
P("position", "Posición relativa al nodo padre (en píxeles en 2D, metros en 3D).", "Si el padre se mueve, el hijo se mueve con él. Para coordenadas del mundo usa global_position.", `position = Vector2(100, 50)\nposition.x += 10`);
P("rotation", "Rotación en radianes. rotation_degrees es la misma rotación en grados.", "Positivo gira en sentido horario en 2D. Usa deg_to_rad() / rad_to_deg() para convertir.", `rotation_degrees = 90\nrotation += PI * delta  # media vuelta por segundo`);
P("scale", "Escala del nodo y de todos sus hijos. Vector2(1, 1) es el tamaño normal.", "Escala negativa en x voltea el nodo, pero en cuerpos físicos es mejor usar flip_h en el sprite.", `scale = Vector2(2, 2)   # el doble de grande`);
P("global_position", "Posición en coordenadas del mundo, sin importar quién sea el padre.", "Úsala para comparar posiciones de nodos que están en ramas distintas del árbol.", `var dist := global_position.distance_to(jugador.global_position)`);
P("z_index", "Orden de dibujo en 2D: valores mayores se dibujan encima.", "Rango -4096 a 4096. z_as_relative hace que se sume al z_index del padre.", `z_index = 10  # encima del resto`);

// Sprites
P("texture", "La imagen que muestra el nodo.", "Arrastra un PNG desde el panel Sistema de archivos al Inspector, o cárgala por código.", `texture = preload("res://jugador.png")`);
P("flip_h", "Voltea la imagen horizontalmente (espejo). flip_v la voltea en vertical.", "La forma estándar de que un personaje mire a izquierda o derecha sin tocar la física.", `$Sprite2D.flip_h = velocity.x < 0`);
P("hframes", "Número de columnas de la hoja de sprites. vframes es el número de filas.", "Con hframes/vframes configurados, frame elige qué cuadro mostrar.", `hframes = 6\nvframes = 1`);
P("frame", "Índice del cuadro que se muestra (empieza en 0).", "En Sprite2D lo animas con AnimationPlayer; en AnimatedSprite2D cambia solo al reproducir.", `frame = (frame + 1) % hframes`);
P("centered", "Si está activo, la imagen se dibuja centrada en la posición del nodo.", "Desactívalo si quieres que la esquina superior izquierda esté en la posición (útil en tiles y UI).", null);
P("offset", "Desplazamiento del dibujo respecto a la posición del nodo. En Camera2D, desplaza la vista.", "Útil para ajustar los pies del personaje al origen, o para hacer screen shake en la cámara.", `offset = Vector2(0, -16)`);
P("modulate", "Color que multiplica al nodo y a sus hijos. El canal a (alpha) controla la transparencia.", "self_modulate afecta solo a este nodo, no a los hijos.", `modulate = Color.RED\nmodulate.a = 0.5   # semitransparente`);
P("sprite_frames", "Recurso SpriteFrames con todas las animaciones (cada una es una lista de imágenes).", "Clic en él en el Inspector para abrir el panel de SpriteFrames y añadir cuadros.", null);
P("animation", "Nombre de la animación actual de un AnimatedSprite2D.", "Cambiarla no la reproduce: llama a play() para eso.", `print(animation)  # "correr"`);
P("autoplay", "Animación que empieza sola al cargar la escena.", "En AnimationPlayer se marca con el botón 'A' del panel de animación.", null);
P("speed_scale", "Multiplicador de velocidad de reproducción. 2 = el doble de rápido.", "Útil para que la animación de correr vaya acorde a la velocidad real.", `speed_scale = abs(velocity.x) / SPEED`);

// Cuerpos físicos
P("velocity", "Velocidad actual del CharacterBody en píxeles (o metros) por segundo.", "Tú la modificas y luego llamas a move_and_slide(), que la usa y la ajusta tras los choques.", `velocity.x = dir * SPEED\nvelocity.y += gravedad * delta\nmove_and_slide()`);
P("up_direction", "Qué dirección se considera 'arriba' para saber qué es suelo, pared o techo.", "Por defecto Vector2.UP. Cámbiala para juegos con gravedad invertida.", `up_direction = Vector2.DOWN  # gravedad invertida`);
P("floor_max_angle", "Ángulo máximo de una pendiente para seguir contando como suelo.", "Por defecto 45°. Más alto permite subir rampas más empinadas.", `floor_max_angle = deg_to_rad(60)`);
P("motion_mode", "Grounded: con suelo, paredes y techo (plataformas). Floating: todo es pared (top-down, naves).", "En juegos top-down usa Floating para que no haya 'suelo'.", `motion_mode = CharacterBody2D.MOTION_MODE_FLOATING`);
P("mass", "Masa del cuerpo rígido. Afecta cómo responde a impulsos y choques.", "Un objeto pesado empuja más y se mueve menos al recibir el mismo impulso.", `mass = 5.0`);
P("gravity_scale", "Multiplicador de la gravedad para este cuerpo. 0 = flota.", "Valores negativos lo hacen caer hacia arriba (globos).", `gravity_scale = 0.3  # cae lento, como una pluma`);
P("linear_velocity", "Velocidad actual de un RigidBody.", "Puedes leerla siempre; escribirla de forma directa solo con cuidado (mejor usa impulsos).", `if linear_velocity.length() > 500: romper()`);
P("physics_material_override", "Material físico: fricción, rebote (bounce) y aspereza.", "Crea un PhysicsMaterial nuevo y sube bounce para pelotas o baja friction para hielo.", `var mat := PhysicsMaterial.new()\nmat.bounce = 0.8\nphysics_material_override = mat`);
P("freeze", "Congela el RigidBody: deja de simularse y se comporta como estático o cinemático.", "Útil para objetos que el jugador sostiene y luego lanza.", `freeze = true   # lo agarra\nfreeze = false  # lo suelta`);
P("contact_monitor", "Activa el registro de contactos para que el RigidBody emita body_entered.", "Obligatorio junto con max_contacts_reported mayor que 0, o las señales no llegan.", `contact_monitor = true\nmax_contacts_reported = 4`);
P("constant_linear_velocity", "Velocidad que un StaticBody 'transmite' a lo que está encima sin moverse él.", "El truco clásico para cintas transportadoras.", `constant_linear_velocity = Vector2(80, 0)`);
P("sync_to_physics", "Sincroniza el movimiento animado con el paso de física.", "Déjalo activado en plataformas móviles para que el jugador no tiemble encima.", null);

// Áreas y colisión
P("monitoring", "Si el Area detecta a otros cuerpos y áreas.", "Desactívala para apagar una zona temporalmente (usa set_deferred dentro de señales de física).", `set_deferred("monitoring", false)`);
P("monitorable", "Si otras áreas pueden detectar a esta.", "Una hitbox necesita ser monitorable para que la hurtbox la detecte.", null);
P("collision_layer", "En qué capas de física EXISTE este objeto.", "Ponle nombre a las capas en Proyecto → Configuración → Layer Names → 2D Physics.", `set_collision_layer_value(2, true)  # capa 2 = enemigos`);
P("collision_mask", "Qué capas DETECTA o con cuáles choca este objeto.", "Un enemigo con máscara en la capa 1 (jugador) detecta al jugador pero no a otros enemigos.", `set_collision_mask_value(1, true)`);
P("gravity_space_override", "Hace que el Area cambie la gravedad de los cuerpos que están dentro.", "Combine suma a la gravedad global; Replace la sustituye. Útil para agua o zonas de baja gravedad.", `gravity_space_override = Area2D.SPACE_OVERRIDE_REPLACE\ngravity = 200`);
P("shape", "La forma de colisión: rectángulo, círculo, cápsula, etc.", "Haz clic en <vacío> en el Inspector y elige 'Nuevo RectangleShape2D'. Luego ajústala con los puntos naranjas.", `var c := CircleShape2D.new()\nc.radius = 16\n$CollisionShape2D.shape = c`);
P("disabled", "Desactiva la forma de colisión.", "Durante la física cámbiala con set_deferred, nunca directo.", `$CollisionShape2D.set_deferred("disabled", true)`);
P("one_way_collision", "La colisión solo bloquea desde un lado (por defecto, desde arriba).", "Plataformas que se atraviesan saltando desde abajo.", null);
P("polygon", "Lista de puntos que forman el polígono.", "Se edita en el editor con la herramienta de polígono; por código es un PackedVector2Array.", `polygon = PackedVector2Array([Vector2(0,0), Vector2(32,0), Vector2(16,-32)])`);
P("build_mode", "Solids: el polígono es sólido. Segments: solo sus bordes chocan.", "Segments sirve para contornos de terreno sin rellenar el interior.", null);

// Rayos
P("target_position", "Hacia dónde apunta el rayo/forma (relativo al nodo). En NavigationAgent, el destino a alcanzar.", "En RayCast2D, Vector2(0, 50) apunta 50 px hacia abajo.", `$RayCast2D.target_position = Vector2(40, 0)`);
P("enabled", "Activa o desactiva el nodo (rayo, cámara, región…).", "Un RayCast desactivado no detecta nada hasta que lo vuelvas a activar.", `$RayCast2D.enabled = false`);
P("collide_with_areas", "Si el rayo también detecta Areas, no solo cuerpos.", "Por defecto solo detecta cuerpos físicos.", null);

// Cámara
P("zoom", "Acercamiento de la Camera2D. Vector2(2, 2) muestra todo al doble de tamaño.", "En Godot 4, valores mayores acercan (al revés que en Godot 3).", `create_tween().tween_property($Camera2D, "zoom", Vector2(1.5, 1.5), 0.4)`);
P("position_smoothing_enabled", "La cámara sigue a su objetivo de forma suave en vez de pegada.", "Ajusta position_smoothing_speed para más o menos retraso.", `position_smoothing_enabled = true\nposition_smoothing_speed = 6.0`);
P("limit_left/right/top/bottom", "Bordes que la cámara nunca sobrepasa (en píxeles del mundo).", "Ponlos al tamaño del nivel para no mostrar el vacío fuera del mapa.", `limit_left = 0\nlimit_right = 3200\nlimit_bottom = 720`);
P("drag_horizontal_enabled", "Zona muerta horizontal: el jugador se mueve un poco sin que la cámara lo siga.", "drag_left_margin / drag_right_margin definen el tamaño de esa zona.", null);

// TileMap
P("tile_set", "El recurso TileSet con las imágenes, colisiones y terrenos de los tiles.", "Comparte el mismo .tres entre capas y niveles.", null);
P("collision_enabled", "Si los tiles de esta capa generan colisiones.", "Desactívalo en capas de fondo o decoración.", null);
P("y_sort_enabled", "Ordena el dibujo por la posición Y: lo que está más abajo se dibuja encima.", "Clave en juegos top-down para que el jugador pase detrás de árboles.", null);
P("navigation_enabled", "Si los tiles de esta capa aportan polígonos de navegación.", "Requiere una capa de navegación configurada en el TileSet.", null);

// Parallax
P("scroll_scale", "Qué tan rápido se mueve la capa respecto a la cámara. 0.5 = a la mitad de velocidad.", "Valores bajos para fondos lejanos (montañas), cercanos a 1 para lo cercano.", `scroll_scale = Vector2(0.3, 1)`);
P("repeat_size", "Tamaño tras el cual la capa se repite para crear un fondo infinito.", "Suele ser el ancho de la imagen del fondo.", `repeat_size = Vector2(512, 0)`);
P("autoscroll", "Velocidad de desplazamiento automático en píxeles por segundo.", "Nubes que se mueven aunque la cámara esté quieta.", `autoscroll = Vector2(-20, 0)`);
P("repeat_times", "Cuántas copias extra se dibujan para tapar huecos.", "Súbelo si al hacer zoom out ves los bordes del fondo.", null);
P("gizmo_extents", "Tamaño de la cruz que dibuja el Marker2D en el editor.", "Solo visual: no afecta al juego.", null);

// Path
P("curve", "La curva (puntos y tangentes) que define el recorrido del Path.", "Se dibuja en el editor con los botones de la barra superior al seleccionar el Path2D.", null);
P("progress", "Distancia recorrida a lo largo del camino, en píxeles.", "Súmale velocidad * delta para avanzar.", `$PathFollow2D.progress += 100 * delta`);
P("progress_ratio", "Progreso entre 0 (inicio) y 1 (final) del camino.", "Con randf() obtienes un punto aleatorio del recorrido.", `$PathFollow2D.progress_ratio = randf()`);
P("loop", "Si la animación, el video o el recorrido vuelve a empezar al terminar.", "En PathFollow2D, al pasar del final vuelve al inicio.", null);
P("rotates", "Si el PathFollow2D gira para mirar en la dirección de la curva.", "Desactívalo si el objeto debe mantenerse derecho.", null);

// Line2D
P("points", "Lista de puntos de la línea.", "Se añaden con add_point() o asignando un PackedVector2Array.", `points = PackedVector2Array([Vector2.ZERO, Vector2(100, 0)])`);
P("width", "Grosor de la línea en píxeles.", "width_curve permite que se adelgace hacia la punta (estelas).", `width = 4.0`);
P("default_color", "Color de la línea cuando no hay gradiente.", null, `default_color = Color.CYAN`);
P("gradient", "Degradado de color a lo largo de la línea.", "Perfecto para estelas que se desvanecen.", null);

// Luces 2D
P("energy", "Intensidad de la luz.", "Anímala con un Tween para parpadeos.", `energy = 1.5`);
P("color", "Color del nodo (luz, rectángulo, polígono, tinte del CanvasModulate).", "Usa Color(r, g, b, a) con valores de 0 a 1, o constantes como Color.RED.", `color = Color(0.2, 0.2, 0.4)`);
P("shadow_enabled", "Si la luz proyecta sombras.", "En 2D necesita LightOccluder2D en los objetos que deben hacer sombra.", null);
P("texture_scale", "Escala de la textura de la luz: el tamaño del círculo iluminado.", null, `texture_scale = 3.0`);

// Partículas
P("amount", "Número de partículas vivas a la vez.", "Muchas partículas grandes cuestan rendimiento (overdraw).", `amount = 32`);
P("lifetime", "Segundos que vive cada partícula.", null, `lifetime = 0.6`);
P("one_shot", "Emite una sola ráfaga y se detiene. Si no, emite continuamente. En Timer, cuenta una sola vez.", "Explosiones y polvo = one_shot. Humo y fuego = continuo.", `one_shot = true`);
P("emitting", "Si está emitiendo partículas ahora.", "Ponlo en true para lanzar una ráfaga one_shot.", `$Chispas.emitting = true`);
P("process_material", "ParticleProcessMaterial: define dirección, velocidad, gravedad, color y escala de las partículas.", "Clic en él para abrir todas las opciones de comportamiento.", null);
P("explosiveness", "0 = partículas repartidas en el tiempo; 1 = todas salen a la vez.", "Súbelo a 1 para explosiones.", `explosiveness = 1.0`);
P("direction", "Dirección principal en la que salen las partículas.", null, `direction = Vector2(0, -1)`);
P("spread", "Ángulo de dispersión en grados alrededor de la dirección.", "180 = salen en todas direcciones.", `spread = 45.0`);
P("gravity", "Gravedad aplicada a las partículas, o la fuerza de gravedad de un Area con override.", null, `gravity = Vector2(0, 400)`);
P("color_ramp", "Degradado de color que recorre la partícula durante su vida.", "Úsalo para que el fuego pase de amarillo a rojo y desaparezca.", null);

// Notificador
P("rect", "Rectángulo que se comprueba contra la pantalla.", "Ajústalo al tamaño del objeto en el editor con los puntos naranjas.", null);

// Timer
P("wait_time", "Duración del Timer en segundos.", "start(t) también permite pasar la duración en el momento.", `$Timer.wait_time = 1.5`);
P("autostart", "El Timer empieza solo al entrar en la escena.", null, null);
P("time_left", "Segundos que le quedan al Timer.", "Ideal para mostrar una cuenta regresiva en la UI.", `$Label.text = "%.1f" % $Timer.time_left`);

// Animación
P("current_animation", "Nombre de la animación que se está reproduciendo ahora.", "Vacío si no hay ninguna.", `if $AnimationPlayer.current_animation != "atacar": ...`);
P("libraries", "Bibliotecas de animaciones del AnimationPlayer.", "Permite compartir animaciones entre escenas (por ejemplo, las de un modelo importado).", null);
P("anim_player", "Ruta al AnimationPlayer del que el AnimationTree toma las animaciones.", null, null);
P("tree_root", "El nodo raíz del árbol de animación: máquina de estados, blend tree, blend space…", "Se edita en el panel inferior AnimationTree.", null);
P("active", "Si el AnimationTree está procesando. Mientras esté activo, controla al AnimationPlayer.", null, `$AnimationTree.active = true`);
P("parameters/…", "Los parámetros del AnimationTree: posiciones de blend, condiciones, la máquina de estados.", "Copia la ruta exacta desde el Inspector con clic derecho.", `$AnimationTree.set("parameters/Mover/blend_position", dir)`);

// Audio
P("stream", "El archivo de audio o video a reproducir.", "WAV para efectos cortos, OGG para música.", `$Sonido.stream = preload("res://sfx/salto.wav")`);
P("volume_db", "Volumen en decibelios. 0 = original, -6 ≈ la mitad, -80 = silencio.", "Para convertir de 0..1 usa linear_to_db().", `volume_db = linear_to_db(0.5)`);
P("pitch_scale", "Tono y velocidad del sonido. 1 = normal.", "Variarlo un poco al azar evita que los sonidos repetidos cansen.", `pitch_scale = randf_range(0.9, 1.1)`);
P("bus", "Bus de audio por el que sale el sonido (Master, Musica, SFX…).", "Crea los buses en el panel Audio de abajo.", `bus = &"SFX"`);

// Navegación
P("path_desired_distance", "Distancia a la que el agente considera alcanzado cada punto intermedio del camino.", "Si el agente gira en círculos, súbela un poco.", null);
P("avoidance_enabled", "Activa la evasión: los agentes se esquivan entre sí.", "La velocidad segura llega por la señal velocity_computed.", null);

// CanvasLayer y Control
P("layer", "Orden de la capa. Mayor = se dibuja encima.", "HUD en 1, menú de pausa en 10, transiciones en 100.", `layer = 100`);
P("follow_viewport_enabled", "Hace que el CanvasLayer siga a la cámara como si fuera parte del mundo.", "Útil para efectos de parallax hechos a mano.", null);
P("visible", "Si el nodo (y sus hijos) se dibuja.", "Un nodo invisible sigue procesándose; show()/hide() son atajos.", `$Menu.visible = not $Menu.visible`);
P("anchors_preset", "Plantilla de anclaje: esquinas, centro, pantalla completa (Full Rect)…", "Se elige en el botón de anclas de la barra superior al seleccionar un Control.", `set_anchors_preset(Control.PRESET_FULL_RECT)`);
P("size_flags_horizontal/vertical", "Cómo se comporta el Control dentro de un contenedor: Fill, Expand, Shrink Center…", "Expand hace que ocupe el espacio sobrante.", `size_flags_horizontal = Control.SIZE_EXPAND_FILL`);
P("custom_minimum_size", "Tamaño mínimo que el contenedor debe respetar.", "Útil para botones que deben medir al menos 200 px de ancho.", `custom_minimum_size = Vector2(200, 48)`);
P("theme", "Recurso Theme con fuentes, colores y estilos. Se hereda a todos los hijos.", "Asígnalo a la raíz de la UI y todo cambia de una vez.", null);
P("mouse_filter", "Stop: atrapa el ratón. Pass: lo usa y lo pasa. Ignore: no lo recibe.", "Pon Ignore en overlays decorativos o bloquearán los clics.", `mouse_filter = Control.MOUSE_FILTER_IGNORE`);
P("focus_mode", "Si el Control puede recibir el foco del teclado o mando.", "Necesario para navegar menús con flechas.", null);

// Texto
P("text", "El texto que muestra el control.", "Para números usa str() o el operador %.", `$Label.text = "Vidas: %d" % vidas`);
P("horizontal_alignment", "Alineación horizontal del texto: izquierda, centro, derecha.", null, `horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER`);
P("autowrap_mode", "Salto de línea automático cuando el texto no cabe.", "Necesita un ancho definido (custom_minimum_size o un contenedor).", `autowrap_mode = TextServer.AUTOWRAP_WORD_SMART`);
P("label_settings", "Recurso con fuente, tamaño, color, contorno y sombra del Label.", "Más cómodo que un Theme para un único Label con estilo especial.", null);
P("visible_ratio", "Porcentaje del texto visible (0 a 1).", "Anímalo para el efecto máquina de escribir.", `create_tween().tween_property($Label, "visible_ratio", 1.0, 1.0)`);
P("bbcode_enabled", "Permite usar etiquetas BBCode: [b], [color], [wave], [img]…", null, `bbcode_enabled = true\ntext = "[b]Hola[/b] [color=red]mundo[/color]"`);
P("visible_characters", "Cuántos caracteres se muestran. -1 = todos.", "Equivalente a visible_ratio pero en número de letras.", `visible_characters += 1`);
P("fit_content", "El RichTextLabel crece en alto para que quepa todo el texto.", null, null);
P("placeholder_text", "Texto gris de ejemplo que se ve cuando el campo está vacío.", "No sustituye a una etiqueta visible: úsalo como pista.", `placeholder_text = "Tu nombre…"`);
P("max_length", "Número máximo de caracteres que se pueden escribir.", null, `max_length = 12`);
P("secret", "Oculta el texto con asteriscos (contraseñas).", null, null);
P("editable", "Si el usuario puede escribir en el campo.", null, null);

// Botones
P("icon", "Imagen que acompaña al texto del botón o del ítem.", null, `icon = preload("res://ui/play.svg")`);
P("toggle_mode", "El botón queda pulsado o suelto en cada clic (interruptor).", "Usa la señal toggled para saber el estado.", null);
P("flat", "Botón sin fondo: solo texto o ícono.", null, null);
P("button_pressed", "Estado actual de un botón tipo interruptor o CheckBox.", null, `$PantallaCompleta.button_pressed = true`);
P("selected", "Índice del ítem elegido en un OptionButton.", null, `$Idioma.selected = 1`);

// TextureRect
P("expand_mode", "Si la textura puede hacerse más pequeña que su tamaño original para ajustarse.", "Usa Ignore Size para controlar el tamaño desde el Control.", null);
P("stretch_mode", "Cómo se ajusta la imagen: estirar, mantener proporción, centrar, repetir (tile)…", "Keep Aspect Centered es lo más común para retratos e íconos.", null);

// Rangos
P("min_value", "Valor mínimo de la barra, slider o spinbox.", null, `min_value = 0`);
P("max_value", "Valor máximo.", null, `max_value = vida_max`);
P("value", "Valor actual. Al cambiarlo se emite value_changed.", null, `$BarraVida.value = vida`);
P("show_percentage", "Muestra el porcentaje como texto sobre la barra.", null, null);
P("fill_mode", "Dirección en la que se llena la barra: izquierda a derecha, de abajo arriba, radial…", null, null);

// Contenedores
P("separation", "Espacio entre hijos de un Box. Es una constante del tema.", "Se cambia en Theme Overrides → Constants.", `add_theme_constant_override("separation", 16)`);
P("alignment", "Alineación de los hijos dentro del contenedor (inicio, centro, final).", null, `alignment = BoxContainer.ALIGNMENT_CENTER`);
P("columns", "Número de columnas de un GridContainer.", null, `columns = 4`);

// 3D
P("basis", "Los tres ejes (x, y, z) del nodo en 3D: rotación y escala.", "transform.basis * dirección convierte una dirección local a global.", `var adelante := -transform.basis.z`);
P("global_transform", "Posición, rotación y escala completas en coordenadas del mundo.", null, `var pos := global_transform.origin`);
P("mesh", "La malla 3D que se dibuja.", "Puedes usar primitivas (BoxMesh, SphereMesh) para prototipar.", `mesh = SphereMesh.new()`);
P("material_override", "Material que reemplaza a todos los de la malla.", "Útil para efectos temporales como un flash rojo al recibir daño.", null);
P("cast_shadow", "Si el objeto proyecta sombra.", "Desactívalo en objetos pequeños para ganar rendimiento.", null);
P("fov", "Campo de visión de la cámara 3D en grados.", "70–90 en primera persona. Subirlo al correr da sensación de velocidad.", `fov = 75`);
P("projection", "Perspectiva (normal) u ortogonal (sin profundidad, estilo isométrico).", null, null);
P("current", "Si esta es la cámara activa del viewport.", "Solo una cámara puede ser current a la vez.", `$Camera3D.current = true`);
P("near", "Distancia mínima (near) y máxima (far) que la cámara dibuja.", "Un near muy pequeño causa z-fighting.", null);
P("light_energy", "Intensidad de una luz 3D.", null, `light_energy = 2.0`);
P("light_color", "Color de una luz 3D.", null, `light_color = Color(1, 0.8, 0.6)`);
P("environment", "Recurso Environment: cielo, niebla, glow, ajustes de color.", null, null);
P("camera_attributes", "Exposición y profundidad de campo de la cámara.", null, null);

// Viewport
P("size", "Tamaño en píxeles del viewport o del control.", null, `$SubViewport.size = Vector2i(320, 180)`);
P("render_target_update_mode", "Cuándo se actualiza la imagen del SubViewport: siempre, una vez, nunca, cuando es visible.", "Una vez es útil para capturas o miniaturas.", null);
P("transparent_bg", "El fondo del SubViewport es transparente.", null, null);

// HTTPRequest
P("timeout", "Segundos máximos de espera antes de cancelar la petición.", "0 = sin límite.", `$HTTPRequest.timeout = 10.0`);
P("download_file", "Ruta donde se guarda directamente la respuesta.", "Útil para descargar archivos grandes a user://.", null);

// Luz 2D extra
P("occluder", "Polígono OccluderPolygon2D que bloquea la luz.", null, null);
P("occluder_light_mask", "Qué luces bloquea este ocluder (por capas).", null, null);
P("sdf_collision", "Si el ocluder participa en el campo de distancia usado por partículas con colisión.", null, null);
P("uv", "Coordenadas de textura de cada punto del polígono.", null, null);
P("skeleton", "Ruta al Skeleton2D que deforma este polígono.", null, null);

// RemoteTransform
P("remote_path", "Ruta al nodo que será controlado.", null, `remote_path = NodePath("../../Camera2D")`);
P("update_position", "Si se copia la posición al nodo remoto.", null, null);
P("update_rotation", "Si se copia la rotación.", null, null);
P("update_scale", "Si se copia la escala.", null, null);
P("use_global_coordinates", "Copia la transformación global en vez de la local.", null, null);

// Huesos
P("rest", "Pose de reposo del hueso: la posición a la que vuelve.", null, null);
P("length", "Largo del hueso.", null, null);
P("modification_stack", "Modificaciones como IK (cinemática inversa) aplicadas al esqueleto.", null, null);

// ShapeCast / joints
P("max_results", "Número máximo de colisiones que registra el ShapeCast.", null, null);
P("node_a", "Primer cuerpo unido por la articulación.", null, null);
P("node_b", "Segundo cuerpo unido por la articulación.", null, null);
P("softness", "Cuánto se pueden separar los cuerpos unidos.", null, null);
P("angular_limit_enabled", "Limita cuánto puede girar la articulación.", null, null);

// UI extra
P("theme_override_styles/panel", "StyleBox de fondo del panel solo para este nodo, sin tocar el Theme.", null, `add_theme_stylebox_override("panel", estilo)`);
P("patch_margin_left/top/right/bottom", "Márgenes en píxeles que no se estiran (las esquinas del 9-slice).", null, null);
P("axis_stretch_horizontal", "Cómo se rellena el centro y los bordes: estirar o repetir (tile).", null, null);
P("horizontal_scroll_mode", "Si aparece la barra horizontal: auto, siempre, nunca o desactivada.", null, null);
P("vertical_scroll_mode", "Lo mismo para la barra vertical.", null, null);
P("follow_focus", "Desplaza automáticamente para mostrar el control con el foco.", "Imprescindible en menús navegables con mando.", null);
P("current_tab", "Índice de la pestaña visible.", null, `$Opciones.current_tab = 2`);
P("tabs_visible", "Si se muestra la barra de pestañas.", null, null);
P("tab_alignment", "Alineación de las pestañas.", null, null);
P("select_mode", "Selección simple, múltiple o con toggle.", null, null);
P("max_columns", "Columnas de la lista. 0 = sin límite.", null, null);
P("icon_mode", "Ícono encima del texto o a la izquierda.", null, null);
P("fixed_icon_size", "Fuerza un tamaño para todos los íconos.", null, null);
P("title", "Título de la ventana del diálogo.", null, `title = "Confirmar"`);
P("dialog_text", "Mensaje que muestra el diálogo.", null, `dialog_text = "¿Salir del juego?"`);
P("ok_button_text", "Texto del botón Aceptar.", null, `ok_button_text = "Sí, salir"`);
P("exclusive", "Bloquea la interacción con el resto mientras el diálogo está abierto.", null, null);
P("expand", "El video se estira para llenar el control.", null, null);

// 3D extra
P("spring_length", "Largo máximo del SpringArm3D (distancia de la cámara).", null, `spring_length = 4.0`);
P("margin", "Distancia de seguridad para no quedar pegado a la pared.", null, null);
P("omni_range", "Radio de alcance de la OmniLight3D. spot_range es el equivalente de la SpotLight3D.", null, `omni_range = 6.0`);
P("spot_angle", "Apertura del cono de la SpotLight3D en grados.", null, `spot_angle = 30.0`);
P("billboard", "El sprite o texto siempre mira hacia la cámara.", null, `billboard = BaseMaterial3D.BILLBOARD_ENABLED`);
P("pixel_size", "Tamaño de cada píxel en metros. Controla la escala del Sprite3D/Label3D.", null, null);
P("no_depth_test", "Se dibuja encima de todo aunque haya objetos delante.", "Útil para nombres o marcadores que deben verse siempre.", null);
P("mesh_library", "Biblioteca de bloques que usa el GridMap.", "Se crea desde una escena con varias mallas: Escena → Exportar como MeshLibrary.", null);
P("cell_size", "Tamaño de cada celda del GridMap.", null, null);
P("operation", "Cómo se combina la forma CSG con las anteriores: unión, intersección o resta.", null, null);
P("use_collision", "Genera colisión automática para las formas CSG.", null, null);
P("navigation_polygon", "Polígono que define la zona caminable.", null, null);
P("navigation_layers", "Capas de navegación: permiten que distintos agentes usen zonas distintas.", null, null);
P("spawn_path", "Nodo bajo el que el MultiplayerSpawner busca y replica las escenas.", null, null);
P("_spawnable_scenes", "Lista de escenas que el spawner puede crear en red.", "Se configura en el Inspector, no por código.", null);
P("replication_config", "Qué propiedades sincroniza el MultiplayerSynchronizer.", "Se edita en el panel Replicación que aparece abajo.", null);

/* ================= MÉTODOS ================= */

M("add_child", "Añade un nodo como hijo de este. Hasta entonces el nodo no se procesa ni se dibuja.", "Para que una bala no siga al jugador, añádela a la escena actual, no al jugador.", `var bala = BALA.instantiate()\nget_tree().current_scene.add_child(bala)`);
M("get_node", "Obtiene un nodo por su ruta. $Ruta es un atajo de get_node(\"Ruta\").", "Guarda el resultado en una variable @onready en vez de buscarlo cada frame.", `@onready var sprite = $Sprite2D\nvar arma = get_node("Brazo/Arma")`);
M("queue_free", "Elimina el nodo y sus hijos de forma segura al final del frame.", "Usa is_instance_valid(nodo) si otro script podría seguir usándolo.", `func morir() -> void:\n    queue_free()`);
M("get_tree", "Devuelve el SceneTree: pausa, cambio de escena, grupos, timers.", null, `get_tree().paused = true\nget_tree().change_scene_to_file("res://menu.tscn")`);
M("add_to_group", "Añade el nodo a un grupo (etiqueta).", "Puedes hacerlo también en la pestaña Nodo → Grupos del editor.", `add_to_group("enemigos")\nfor e in get_tree().get_nodes_in_group("enemigos"): e.congelar()`);
M("look_at", "Gira el nodo para que mire hacia un punto global.", "En 2D el 'frente' es el eje X positivo (derecha). Dibuja tus sprites mirando a la derecha.", `look_at(get_global_mouse_position())`);
M("to_local", "Convierte una posición global en coordenadas locales de este nodo.", null, `var p := to_local(enemigo.global_position)`);
M("to_global", "Convierte una posición local de este nodo en global.", null, `var punta := to_global(Vector2(32, 0))`);
M("translate", "Mueve el nodo sumando un desplazamiento a su posición.", null, `translate(Vector2(5, 0))`);
M("get_rect", "Devuelve el rectángulo que ocupa el sprite en coordenadas locales.", null, `var r: Rect2 = $Sprite2D.get_rect()`);
M("is_pixel_opaque", "Indica si el píxel en esa posición local no es transparente.", "Para clics precisos sobre sprites con forma irregular.", null);
M("play", "Reproduce una animación o sonido.", "Llamarlo con la misma animación que ya suena no la reinicia.", `$AnimatedSprite2D.play("correr")\n$AudioStreamPlayer.play()`);
M("stop", "Detiene la reproducción (animación, sonido o timer).", null, `$AnimationPlayer.stop()`);
M("pause", "Pausa la animación conservando el cuadro actual.", "play() sin argumentos la continúa.", null);
M("is_playing", "true si se está reproduciendo algo.", null, `if not $Musica.is_playing(): $Musica.play()`);
M("move_and_slide", "Mueve el CharacterBody usando velocity y lo desliza por paredes y suelos al chocar.", "Llámalo una vez por frame en _physics_process, después de calcular velocity. No necesita delta.", `velocity.x = dir * SPEED\nmove_and_slide()`);
M("is_on_floor", "true si tras el último move_and_slide() el cuerpo toca el suelo.", "Solo es válido después de llamar a move_and_slide().", `if is_on_floor() and Input.is_action_just_pressed("saltar"):\n    velocity.y = JUMP`);
M("is_on_wall", "true si tocó una pared en el último movimiento.", "Base para wall jump o para que un enemigo se dé la vuelta.", `if is_on_wall(): direccion *= -1`);
M("is_on_ceiling", "true si tocó el techo.", "Útil para cortar el salto al golpear la cabeza.", `if is_on_ceiling(): velocity.y = 0`);
M("get_slide_collision", "Devuelve información del choque número i del último movimiento.", "Recorre de 0 a get_slide_collision_count() - 1.", `for i in get_slide_collision_count():\n    var c := get_slide_collision(i)\n    print(c.get_collider().name)`);
M("get_gravity", "Devuelve la gravedad que afecta a este cuerpo, incluyendo Areas que la modifiquen (Godot 4.3+).", null, `velocity += get_gravity() * delta`);
M("apply_impulse", "Aplica un golpe instantáneo en un punto del cuerpo (puede hacerlo girar).", null, `apply_impulse(Vector2(0, -300), Vector2(10, 0))`);
M("apply_central_force", "Aplica una fuerza continua en el centro. Llámalo cada frame mientras dure.", "Fuerza = empuje sostenido (motor). Impulso = golpe puntual.", `apply_central_force(Vector2(200, 0))`);
M("apply_torque", "Aplica una fuerza de giro continua.", null, `apply_torque(500.0)`);
M("apply_central_impulse", "Golpe instantáneo en el centro: cambia la velocidad sin hacer girar.", null, `apply_central_impulse(Vector3.UP * 5)`);
M("apply_torque_impulse", "Golpe de giro instantáneo.", null, null);
M("get_overlapping_bodies", "Lista de cuerpos que están dentro del Area ahora mismo.", "Se actualiza en cada paso de física, no al instante tras moverla.", `for b in $Explosion.get_overlapping_bodies():\n    if b.has_method("recibir_dano"): b.recibir_dano(3)`);
M("get_overlapping_areas", "Lista de áreas que están dentro de esta.", null, null);
M("has_overlapping_bodies", "true si hay algún cuerpo dentro.", null, `if not $ZonaSegura.has_overlapping_bodies(): ...`);
M("set_deferred", "Cambia una propiedad al final del frame en vez de al instante.", "Obligatorio para colisiones dentro de señales de física, o Godot muestra un error.", `$CollisionShape2D.set_deferred("disabled", true)`);
M("is_colliding", "true si el rayo o forma está tocando algo.", null, `if $RayCast2D.is_colliding(): ...`);
M("get_collider", "El objeto que toca el rayo o forma.", "Comprueba is_colliding() antes, o devolverá null.", `var obj = $RayCast2D.get_collider()`);
M("get_collision_point", "Punto global exacto donde el rayo toca.", "Para colocar impactos de bala o partículas.", `$Chispa.global_position = $RayCast2D.get_collision_point()`);
M("get_collision_normal", "Dirección perpendicular a la superficie tocada.", "Útil para rebotes y para orientar marcas de impacto.", null);
M("force_raycast_update", "Actualiza el rayo en este momento, sin esperar al próximo paso de física.", "Úsalo si mueves el rayo y necesitas el resultado en la misma función.", null);
M("make_current", "Convierte esta cámara en la activa.", null, `$CamaraJefe.make_current()`);
M("reset_smoothing", "Coloca la cámara de golpe en su objetivo, saltándose el suavizado.", "Úsalo tras teletransportar al jugador para que la cámara no 'viaje'.", null);
M("set_cell", "Coloca un tile en una celda del TileMapLayer.", "source_id es el atlas; atlas_coords, la posición del tile en esa imagen.", `$Suelo.set_cell(Vector2i(4, 2), 0, Vector2i(1, 0))`);
M("get_cell_source_id", "Devuelve el atlas del tile en esa celda, o -1 si está vacía.", null, `if $Suelo.get_cell_source_id(celda) == -1: print("vacío")`);
M("local_to_map", "Convierte una posición local en coordenadas de celda.", "Para posiciones globales, primero usa to_local().", `var celda: Vector2i = $Suelo.local_to_map($Suelo.to_local(global_position))`);
M("map_to_local", "Convierte una celda en la posición local de su centro.", null, `var pos: Vector2 = $Suelo.map_to_local(Vector2i(3, 5))`);
M("set_cells_terrain_connect", "Pinta celdas con un terreno conectando los bordes automáticamente.", null, null);
M("add_point", "Añade un punto al final de la línea.", null, `$Linea.add_point(global_position)`);
M("clear_points", "Borra todos los puntos de la línea.", null, null);
M("restart", "Reinicia el sistema de partículas desde cero.", null, `$Polvo.restart()`);
M("is_on_screen", "true si el rectángulo del notificador es visible en pantalla.", null, null);
M("start", "Arranca el Timer. Si le pasas un número, lo usa como duración.", null, `$Timer.start(2.0)`);
M("is_stopped", "true si el Timer no está corriendo.", "Patrón típico de cooldown: si no está detenido, no se puede repetir la acción.", `if $Cooldown.is_stopped(): disparar()`);
M("play_backwards", "Reproduce la animación al revés.", "Abrir/cerrar una puerta con la misma animación.", `$AnimationPlayer.play_backwards("abrir")`);
M("queue", "Pone una animación en cola para cuando termine la actual.", null, `$AnimationPlayer.play("atacar")\n$AnimationPlayer.queue("idle")`);
M("seek", "Salta a un segundo concreto de la animación.", null, `$AnimationPlayer.seek(0.5, true)`);
M("get", "Lee una propiedad por su nombre como texto. En AnimationTree, para leer parámetros.", null, `var sm = $AnimationTree.get("parameters/playback")\nsm.travel("Correr")`);
M("tween_property", "Anima una propiedad de un objeto hasta un valor final en X segundos.", "Puedes animar subpropiedades con ':' como \"position:x\" o \"modulate:a\".", `create_tween().tween_property($Sprite2D, "scale", Vector2(1.2, 1.2), 0.2)`);
M("set_trans", "Elige la curva de transición: LINEAR, SINE, BACK, ELASTIC, BOUNCE…", "Combínala con set_ease para la sensación final.", `.set_trans(Tween.TRANS_BACK)`);
M("set_ease", "Elige dónde se suaviza la curva: EASE_IN (al principio), EASE_OUT (al final), EASE_IN_OUT.", null, `.set_ease(Tween.EASE_OUT)`);
M("set_parallel", "Hace que las animaciones siguientes del Tween ocurran a la vez, no en secuencia.", null, `var t := create_tween().set_parallel()\nt.tween_property(self, "scale", Vector2.ZERO, 0.3)\nt.tween_property(self, "modulate:a", 0.0, 0.3)`);
M("tween_callback", "Llama a una función cuando el Tween llega a ese punto.", null, `t.tween_callback(queue_free)`);
M("get_next_path_position", "Siguiente punto del camino calculado hacia target_position.", "Muévete hacia él en cada frame de física.", `var dir := global_position.direction_to($Agente.get_next_path_position())`);
M("is_navigation_finished", "true si el agente ya llegó al destino.", null, `if $Agente.is_navigation_finished(): return`);
M("grab_focus", "Le da el foco del teclado o mando a este control.", "Llama a esto en el primer botón al abrir un menú.", `$Jugar.grab_focus()`);
M("set_anchors_preset", "Aplica una plantilla de anclaje por código.", null, `set_anchors_preset(Control.PRESET_CENTER)`);
M("append_text", "Añade texto BBCode al final del RichTextLabel.", null, `$Log.append_text("[color=gold]+10 oro[/color]\\n")`);
M("clear", "Vacía el contenido (texto, ítems o puntos).", null, null);
M("rotate_y", "Gira el nodo 3D alrededor del eje vertical.", "Para girar el cuerpo con el mouse en primera persona.", `rotate_y(-event.relative.x * 0.003)`);
M("project_ray_origin", "Origen del rayo que sale de la cámara por un punto de la pantalla.", "Con project_ray_normal haces clic en objetos 3D.", null);
M("unproject_position", "Convierte una posición 3D en coordenadas de pantalla.", "Para poner una barra de vida 2D sobre un enemigo 3D.", `$Barra.position = $Camera3D.unproject_position(enemigo.global_position)`);
M("get_texture", "Devuelve la imagen que renderiza el SubViewport.", null, `$Minimapa.texture = $SubViewport.get_texture()`);
M("request", "Lanza una petición HTTP a una URL.", "La respuesta llega por la señal request_completed.", `$HTTPRequest.request("https://api.ejemplo.com/datos")`);
M("convert_from_particles", "Copia la configuración de un GPUParticles2D a este CPUParticles2D.", null, null);
M("force_update_cache", "Vuelve a buscar el nodo remoto si cambiaste remote_path.", null, null);
M("get_bone", "Devuelve el hueso número i del esqueleto.", null, null);
M("apply_rest", "Devuelve todos los huesos a su pose de reposo.", null, null);
M("get_collision_count", "Número de objetos que toca el ShapeCast.", null, null);
M("force_shapecast_update", "Actualiza el ShapeCast al instante.", null, null);
M("select_all", "Selecciona todo el texto del campo.", null, null);
M("add_item", "Añade un ítem a la lista o desplegable.", null, `$Idioma.add_item("Español")\n$Idioma.add_item("English")`);
M("get_item_text", "Texto del ítem número i.", null, null);
M("ensure_control_visible", "Desplaza el ScrollContainer hasta que ese control se vea.", null, null);
M("get_v_scroll_bar", "Devuelve la barra vertical para controlarla o personalizarla.", null, null);
M("set_tab_title", "Cambia el título de la pestaña i.", null, `$Opciones.set_tab_title(0, "Audio")`);
M("get_current_tab_control", "El Control de la pestaña visible.", null, null);
M("get_selected_items", "Índices de los ítems seleccionados.", null, null);
M("popup_centered", "Muestra la ventana emergente centrada en pantalla.", null, `$Confirmar.popup_centered()`);
M("get_ok_button", "Devuelve el botón Aceptar para cambiar su texto o estilo.", null, null);
M("get_hit_length", "Largo real del SpringArm3D tras chocar.", null, null);
M("set_cell_item", "Coloca un bloque de la MeshLibrary en una celda del GridMap.", null, `$GridMap.set_cell_item(Vector3i(0, 0, 0), 2)`);
M("get_cell_item", "Id del bloque en esa celda, o -1 si está vacía.", null, null);
M("bake_navigation_polygon", "Recalcula la zona caminable recortando los obstáculos.", null, null);
M("spawn", "Crea en todos los peers la escena indicada (MultiplayerSpawner con spawn_function).", null, null);

/* ================= SEÑALES ================= */

S("ready", "Se emite cuando el nodo terminó su _ready() y todos sus hijos están listos.", "Útil para esperar a otro nodo: await nodo.ready.", null);
S("tree_entered", "El nodo acaba de entrar al árbol de escena.", null, null);
S("tree_exited", "El nodo salió del árbol (se borró o se movió).", "Sirve para contar enemigos restantes o limpiar referencias.", `enemigo.tree_exited.connect(func(): vivos -= 1)`);
S("child_entered_tree", "Se añadió un hijo a este nodo.", null, null);
S("texture_changed", "Cambió la textura.", null, null);
S("animation_finished", "Terminó una animación que no está en bucle.", "En AnimationPlayer recibe el nombre de la animación.", `await $AnimatedSprite2D.animation_finished\n$AnimatedSprite2D.play("idle")`);
S("animation_looped", "La animación en bucle volvió a empezar.", null, null);
S("frame_changed", "Cambió el cuadro de la animación.", "Úsala para sonidos de pasos en cuadros concretos.", `func _on_frame_changed() -> void:\n    if animation == "correr" and frame in [1, 4]:\n        $Paso.play()`);
S("body_entered", "Un cuerpo físico (CharacterBody, RigidBody, StaticBody, TileMap) entró en el área o tocó el cuerpo.", "Comprueba quién es con is_in_group() o has_method() antes de actuar.", null);
S("body_exited", "Ese cuerpo salió del área.", null, null);
S("sleeping_state_changed", "El RigidBody se 'durmió' (dejó de moverse) o despertó.", null, null);
S("input_event", "Clic o toque sobre un objeto físico. Requiere input_pickable = true.", "Seleccionar unidades o recoger objetos con el ratón.", null);
S("mouse_entered", "El cursor entró sobre el objeto o control.", "Para resaltar elementos al pasar el ratón.", null);
S("mouse_exited", "El cursor salió.", null, null);
S("area_entered", "Otra Area entró en esta.", "La pareja hitbox/hurtbox se comunica por aquí.", null);
S("area_exited", "Otra Area salió.", null, null);
S("changed", "El recurso o la capa cambió de contenido.", null, null);
S("finished", "Terminó lo que estaba haciendo: sonido, partículas one_shot, video o Tween.", null, null);
S("screen_entered", "El objeto entró en pantalla.", "Activa enemigos solo cuando el jugador los ve.", null);
S("screen_exited", "El objeto salió de pantalla.", "El uso clásico es borrar balas perdidas.", `$VisibleOnScreenNotifier2D.screen_exited.connect(queue_free)`);
S("timeout", "El Timer llegó a cero.", "Si one_shot es false, se emite repetidamente cada wait_time.", null);
S("animation_started", "Empezó una animación.", null, null);
S("step_finished", "Terminó un paso del Tween.", null, null);
S("navigation_finished", "El agente llegó a su destino.", null, null);
S("velocity_computed", "Con evasión activada, entrega la velocidad segura para no chocar con otros agentes.", "Usa esa velocidad en lugar de la tuya.", `func _on_velocity_computed(v: Vector2) -> void:\n    velocity = v\n    move_and_slide()`);
S("visibility_changed", "El nodo se mostró u ocultó.", null, null);
S("gui_input", "El control recibió una entrada (clic, tecla, arrastre) estando encima.", null, `func _on_gui_input(event: InputEvent) -> void:\n    if event is InputEventMouseButton and event.pressed:\n        print("clic")`);
S("focus_entered", "El control recibió el foco del teclado o mando.", "Para reproducir un sonido al navegar el menú.", null);
S("resized", "Cambió el tamaño del control.", null, null);
S("meta_clicked", "Se hizo clic en un enlace [url] del RichTextLabel.", null, `func _on_meta_clicked(meta) -> void:\n    OS.shell_open(str(meta))`);
S("pressed", "El botón se pulsó y se soltó encima.", "La señal más usada de la interfaz.", null);
S("toggled", "Cambió el estado de un botón interruptor; recibe true o false.", null, null);
S("button_down", "El botón se acaba de presionar (sin soltar).", null, null);
S("button_up", "El botón se soltó.", null, null);
S("value_changed", "Cambió el valor del slider, barra o spinbox.", null, null);
S("sort_children", "El contenedor recolocó a sus hijos.", null, null);
S("request_completed", "Llegó la respuesta HTTP. Recibe resultado, código, cabeceras y cuerpo.", "Comprueba que el código sea 200 antes de leer los datos.", null);
S("bone_setup_changed", "Cambió la configuración de huesos.", null, null);
S("text_changed", "Cambió el texto mientras se escribe.", "Para validar o filtrar en vivo.", null);
S("text_submitted", "Se pulsó Enter en el campo.", null, null);
S("item_selected", "Se eligió un ítem; recibe su índice.", null, null);
S("scroll_started", "Empezó el desplazamiento.", null, null);
S("scroll_ended", "Terminó el desplazamiento.", null, null);
S("tab_changed", "Cambió la pestaña activa.", null, null);
S("tab_selected", "Se hizo clic en una pestaña (aunque ya estuviera activa).", null, null);
S("item_activated", "Doble clic o Enter sobre un ítem.", null, null);
S("confirmed", "Se pulsó Aceptar en el diálogo.", null, null);
S("canceled", "Se cerró el diálogo o se pulsó Cancelar.", null, null);
S("bake_finished", "Terminó de recalcularse la navegación.", null, null);
S("navigation_polygon_changed", "Cambió el polígono de navegación.", null, null);
S("spawned", "El MultiplayerSpawner creó un nodo en este peer.", null, null);
S("synchronized", "Llegó una actualización del MultiplayerSynchronizer.", null, null);
