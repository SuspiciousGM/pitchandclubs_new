# Plan funcional: integración con la Federación (FCPP / pitch.cat)

> Documento de producto. Describe **qué verá el usuario y qué funcionalidades/vistas** habrá.
> La implementación técnica (Vault, Edge Functions, esquema) se detalla aparte.

## 1. La idea en una frase

Que el jugador tenga **todo su golf en un solo sitio**: sus partidas amistosas (las que ya registra a mano en la app) **y** sus partidas oficiales de la federación (torneos y vueltas de hándicap), con estadísticas unificadas y su evolución de hándicap.

## 2. Conceptos nuevos para el usuario

- **Dos tipos de partida:**
  - **Amistosa**: la que se apunta a mano en la app (lo actual).
  - **Oficial**: importada automáticamente de la federación (torneos, vueltas homologadas).
- **Conectar la federación**: el usuario vincula una vez su cuenta de pitch.cat (licencia + contraseña) y a partir de ahí la app trae sus resultados oficiales sola.
- **Jugador verificado**: insignia para quien ha conectado la federación. Sus datos oficiales son la fuente "de confianza" del ranking.

## 3. Flujos de usuario

### 3.1 Conectar la federación
Dos puntos de entrada:
- **Al registrarse**: paso opcional "¿Eres federado? Conecta tu cuenta y trae todo tu historial" (se puede saltar).
- **Desde el Perfil**: sección "Federació" con botón *Connectar*.

Pantalla de conexión:
1. Explicación clara del beneficio (traer historial oficial + stats).
2. Campos: **licencia** y **contraseña** de la federación.
3. **Texto de consentimiento explícito** (qué hacemos con la credencial, que se guarda cifrada, que el usuario autoriza el acceso en su nombre) + checkbox de aceptación.
4. Al pulsar *Connectar*: la app comprueba que el login funciona → si va, muestra "Connectat ✓" y arranca la primera importación.

### 3.2 Importación / sincronización
- **Primera vez:** importa todo el histórico oficial. Pantalla con progreso ("Important les teves voltes… 12/40") porque puede tardar.
- **Después:** sincronización automática periódica en segundo plano. El usuario no hace nada.
- **Manual:** botón *Sincronitzar ara* en el Perfil, con marca de tiempo ("Última sincro: fa 2h ✓").
- **Detección de partida nueva:** cuando la federación publica un resultado nuevo, la app lo importa y avisa: notificación/banner "Tens una volta nova a [Camp]". Aparece como una partida más en el historial y el feed.

### 3.3 Desconectar
- Botón *Desconnectar la federació* en el Perfil → borra la credencial guardada y detiene la sincronización.
- Opción de **eliminar también los datos importados** (derecho de supresión).

## 4. Vistas nuevas y cambios en las existentes

### Nuevas
- **Pantalla "Connectar federació"**: formulario + consentimiento (§3.1).
- **Dashboard de estadísticas ("Les meves estadístiques")**: versión interactiva del informe PDF que ya existe: KPIs (partidas, golpes medios, hándicap, birdies, aces, % par…), evolución de resultados, distribución de resultados (HiO→triple), rendimiento por hoyo (por longitud y por dificultad), campos más jugados, mejores vueltas y récords.
- **Gráfica de evolución del hándicap**: el hándicap exacto a lo largo del tiempo (con línea de tendencia). Puede vivir dentro del dashboard.
- **Detalle de ronda oficial**: tarjeta hoyo a hoyo con metros y dificultad (stroke index) de cada hoyo; datos que la partida manual no tiene.

### Cambiadas
- **Historial de partidas (Perfil / Home)**: filtro con 3 pestañas o segmentado: **Totes · Oficials · Amistoses**. Cada partida muestra su tipo con un icono.
- **Perfil**: nueva sección "Federació" (estado de conexión, última sincro, badge verificado, botones sincronizar/desconectar) y acceso al dashboard de estadísticas.
- **Home**: banner/aviso cuando hay voltas nuevas importadas.
- **Ranking**: badge **verificado ✓** junto a los jugadores conectados; posibilidad de filtrar "solo verificados". Las estadísticas del ranking se apoyan en datos oficiales cuando existen.
- **Feed / Live**: las partidas oficiales importadas también pueden aparecer en el feed de actividad, marcadas como oficiales.

## 5. Estados y casos que el usuario debe ver

- **Sin conectar:** todo funciona como hoy (solo amistosas); CTA para conectar.
- **Conectando / importando:** progreso visible.
- **Conectado y al día:** "Última sincro fa Xh ✓".
- **Error de login** (cambió la contraseña en la federación): aviso claro "No hem pogut accedir, revisa les teves credencials" + botón para reintroducirlas.
- **Federación caída / cambió su web:** mensaje honesto "La federació no respon ara mateix, ho tornarem a provar" (la sincro es intrínsecamente algo frágil; se comunica sin alarmar).
- **Sin partidas oficiales:** estado vacío explicativo.

## 6. Cómo encaja con lo que ya existe

- **Dos fuentes, un historial:** amistosas y oficiales conviven en la misma lista, diferenciadas por el icono/filtro.
- **Antifraude:** las oficiales son verificadas por definición → no pasan por los controles antifraude (esos siguen aplicando solo a las amistosas). Esto convierte el problema de confianza en una ventaja.
- **Puntos y niveles:** decisión de producto a cerrar → probablemente las oficiales cuentan (y quizá pesan distinto) para reforzar que el ranking "de verdad" se basa en datos oficiales. A concretar en Fase 3.

## 7. Fuera de alcance (de momento)

- Inscribirse a torneos desde la app (la federación gestiona eso).
- Editar o borrar rondas oficiales (son de solo lectura; son la verdad de la federación).
- Datos oficiales de otros jugadores sin su consentimiento (cada uno conecta lo suyo).

## 8. Faseado funcional

1. **Fase 1: conectar + traer historial. Implementada.** Pantalla de conexión con consentimiento, importación del histórico, y las partidas oficiales visibles en el historial con su filtro Totes/Oficials/Amistoses. *Resultado tangible: "conecto y veo todos mis torneos dentro de la app".*
2. **Fase 2: estadísticas unificadas.** Dashboard interactivo + evolución de hándicap + detalle de ronda oficial.
3. **Fase 3: automático + confianza.** Sincronización automática periódica, aviso de partida nueva, badge verificado e integración en el ranking.
