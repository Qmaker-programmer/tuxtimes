<div align="center">

```
████████╗██╗   ██╗██╗  ██╗    ████████╗██╗███╗   ███╗███████╗███████╗
╚══██╔══╝██║   ██║╚██╗██╔╝       ██╔══╝██║████╗ ████║██╔════╝██╔════╝
   ██║   ██║   ██║ ╚███╔╝        ██║   ██║██╔████╔██║█████╗  ███████╗
   ██║   ██║   ██║ ██╔██╗        ██║   ██║██║╚██╔╝██║██╔══╝  ╚════██║
   ██║   ╚██████╔╝██╔╝ ██╗       ██║   ██║██║ ╚═╝ ██║███████╗███████║
   ╚═╝    ╚═════╝ ╚═╝  ╚═╝       ╚═╝   ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝
```

# 🐧 TuxTimes

<br/>

![TuxTimes Preview](preview.png)

<br/>

### *El lector de noticias Linux que nació de la rabia pura y el odio a los paywalls arcaicos*

[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![GPLv2](https://img.shields.io/badge/Licencia-GPLv2-red?style=for-the-badge&logo=gnu&logoColor=white)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html)
[![LWN](https://img.shields.io/badge/Anti--Paywall-LWN.net%20%F0%9F%96%95-orange?style=for-the-badge)](https://lwn.net)
[![Estado](https://img.shields.io/badge/Estado-Prod%20pero%20sin%20paginaci%C3%B3n-critical?style=for-the-badge)](.)
[![Builds](https://img.shields.io/badge/Builds-Solo%20cuando%20quiere-lightgrey?style=for-the-badge)](.)

<br/>

> *"Nació porque estaba enojado con páginas con paywalls arcaicos (te hablo a ti → lwn.net ←)"*
>
> — El autor, comentario en el código, línea 8

<br/>

🐧 **Un pingüino rebelde · Una app de Vue · Un grito de independencia informativa** 🐧

</div>

---

## 📖 ¿Qué es TuxTimes?

TuxTimes es una plataforma de noticias y artículos sobre Linux y software libre, construida con **Vue 3 + Firebase**, que nació de un momento de frustración completamente comprensible:

> *LWN.net, el legendario e históricamente arcaico portal de noticias del kernel Linux, lleva décadas siendo uno de los recursos más valiosos de la comunidad libre... escondido detrás de un paywall que parece diseñado en 1998 y actualizado nunca.*

Así que alguien dijo **"suficiente"**, abrió el editor, y construyó TuxTimes. Todo en un solo `App.vue` de 1900+ líneas. **¿Por qué?** Porque estaba enojado. **¿Funciona?** Perfectamente. **¿Es buena arquitectura?** El autor lo sabe. El autor no pregunta.

La licencia es **GPLv2**. También por enojo.

> ese "alguien" soy **yo** — **Qmaker** (Andres / Andresuno) 🫡

---

## 🌐 El Contexto Histórico: LWN.net y el Gran Paywall del Kernel

Para entender TuxTimes, hay que entender a su némesis: **LWN.net**.

### 📜 Historia de LWN (contada con todo el respeto que se merece, que es mucho, pero aún así)

**LWN.net** (*Linux Weekly News*) es uno de los portales de noticias técnicas sobre el kernel Linux más respetados del planeta. Desde **1998**. Sí, lleva más años en internet que la mayoría de sus lectores en el mercado laboral.

```
1998 ─────────────────────────────────────────────────────── HOY
 │                                                              │
 └─ LWN nace          LWN sigue igual de arcaico ─────────────┘
    Google no existe   (el CSS tampoco ha cambiado mucho)
```

**Lo que LWN hace bien:**

- Cobertura técnica **profundísima** del kernel Linux
- Artículos sobre FOSS, seguridad, distribuciones
- Reportajes que NADIE más hace con esa profundidad
- Una comunidad de comentaristas absolutamente brillante
- Existe y sobrevive desde antes que muchos frameworks JS

**Lo que LWN hace... así:**

- Paywall de suscripción ($7/mes o $35/año)
- Los artículos se liberan UNA SEMANA DESPUÉS de publicarse
- La interfaz parece diseñada por un monje benedictino en el año 2003
- El CSS parece escrito directamente en piedra
- No hay dark mode (el crimen supremo)
- Los comentarios tienen IDs numéricos de 7 cifras como en el año del señor

### 🤔 ¿Entonces cuál era el problema real?

No era el contenido. Era **todo lo demás.**

**1. 💸 El conocimiento no debería tener paywall**

LWN cobra suscripción para leer artículos recientes. El problema filosófico no es que cobren — es que el conocimiento técnico sobre software *libre* quede encerrado detrás de un muro de pago. El kernel Linux es GPL. Los artículos que lo explican... no tanto. Hay algo irónico en eso que no se puede ignorar.

**2. 🔒 No cualquiera puede publicar**

LWN es un medio cerrado. Solo sus editores escriben. No hay comunidad que aporte, no hay forma de compartir tu descubrimiento sobre un bug raro del kernel, no hay espacio para el conocimiento colectivo. Es un canal de bajada, no una plaza.

**3. 🗞️ La interfaz parece un periódico de 1994**

Y no en el sentido nostálgico bonito. En el sentido de que literalmente parece que nadie tocó el CSS desde que Clinton era presidente. Sin dark mode. Sin diseño responsivo decente. Tipografía de sistema. Densidad de información al estilo "muro de texto sin respiro". Funciona, sí. ¿Pero tiene que doler usarlo?

**4. 🗂️ La organización deja que desear**

Encontrar algo específico en LWN es una aventura. El sistema de categorías es básico, la búsqueda es limitada, y navegar por temas sin saber exactamente qué buscas es frustrante. No hay tags, no hay filtros modernos, no hay forma fácil de descubrir contenido relacionado.

---

**TuxTimes nació para ser lo opuesto:**
- 🆓 Gratis. Siempre.
- ✍️ Cualquiera con cuenta puede publicar
- 🌙 Dark mode, Light mode y ⚡ High Contrast desde el día uno
- 🔍 Búsqueda con tags, categorías y texto libre — todo a la vez
- 📱 Responsive de verdad, no de mentira
- 🐧 Y con un pingüino que bouncea en la esquina porque podemos

---

## ✨ Features (o: "lo que hace mientras Firebase no cobra demasiado")

### 🏠 Feed Principal

- **Grid de posts** con tarjetas visuales, categorías y tags
- **Búsqueda inteligente** que soporta texto libre + `#tags` en la misma query
- **Filtro por categorías** múltiples simultáneas (AND lógico entre categorías, OR entre textos)
- Ordenamiento por fecha (más nuevo primero, siempre)

### 🎨 Sistema de Temas

Tres temas seleccionables desde Configuración, guardados en cookie (sin Firebase, es tuyo):

| Tema | Descripción |
|------|-------------|
| 🌑 **Dark** | El clásico. Oscuro como el terminal. |
| ☀️ **Light** | Para los valientes que usan el PC de día. |
| ⚡ **High Contrast** | Azul neón sobre negro total. Inspirado en VSCodium. El usuario se siente hackeando la NASA. |

### 🥚 Easter Egg: El BSOD de Linux

Busca `windows` en el buscador. Te lo mereces.

```javascript
// EASTER EGG: si el usuario busca "windows" → BSoD de Linux. porque somos así.
// (si alguien reporta esto como bug, es que no entiende la cultura)
watch(searchQuery, (v) => { showWindowsEgg.value = v.toLowerCase().includes('windows'); });
```

### 🔐 Autenticación

- **Google OAuth** via popup (COOP que llore lo que quiera) — el modal se cierra solo al entrar ✅
- **Email + contraseña** con registro y login tradicional
- **Perfil de usuario** con bio, foto, URL personalizada, nickname
- Modo "esconder email" porque la privacidad existe

### ✍️ Editor de Posts

- **Markdown completo** renderizado en tiempo real con `marked`
- **Preview side-by-side** (split view) mientras escribes
- **Borrador persistente** en `localStorage` para el usuario que cierra la pestaña sin querer
- Soporte de categorías y tags

### 💬 Sistema de Comentarios (la obra de ingeniería más dramática)

```
Comentario raíz
├── Respuesta A (depth: 1)
│   ├── Respuesta A1 (depth: 2)
│   │   └── Respuesta A1a (depth: 3) ← hasta depth 5, luego se aplana
│   └── [Este comentario fue eliminado] ← soft-delete preservando el árbol
│       └── Respuesta A2 (hijo de fantasma, sigue vivo)
└── Respuesta B
```

**El Algoritmo de Poda de Fantasmas™**: cuando borras un comentario con respuestas hace soft-delete preservando el árbol; si no tiene hijos hace purga física; y luego sube por el árbol eliminando en cascada los padres fantasmas que quedaron vacíos.

### ⭐ Favoritos · 👤 Perfiles · 🗺️ Hash Routing · 🤖 TuxPit

- Feed de favoritos con los mismos filtros del feed principal
- Perfiles públicos de autor con grid de sus posts y contador de estrellas
- Enrutamiento completo por `#hash` sin ningún router externo
- Pingüino flotante animado en la esquina que bouncea eternamente

---

## 🏗️ Arquitectura (o: "todo en un archivo, no preguntes")

```
tuxtimes/
├── src/
│   ├── App.vue              ← TODO. 1900+ líneas. El monolito supremo.
│   │                           CSS incluido. Lógica incluida. Dignidad: negociable.
│   ├── components/
│   │   └── CommentNode.vue  ← El componente recursivo. Se llama a sí mismo.
│   └── firebase.js          ← La santísima trinidad: auth, provider, db
├── public/
│   ├── tux.png              ← El señor Tux. El verdadero MVP.
│   ├── tuxsobrero.gif       ← Tux con sombrero (click en el logo)
│   ├── tuxpc.gif            ← Tux en la PC (TuxPit)
│   ├── github-cat.gif       ← El Octocat en la esquina del logo 🐱
│   └── preview.png          ← Screenshot para este README
└── package.json
```

### Stack Tecnológico

| Tecnología | Por qué |
|-----------|---------|
| **Vue 3** Composition API | Porque Options API es 2020 |
| **Firebase Auth** v9 | Google OAuth sin servidores propios |
| **Firestore** NoSQL | La BD que cobra por query (no hagas queries en bucles) |
| **marked** | Markdown → HTML. Magia negra controlada. |
| **Vite** | Porque webpack es un recuerdo doloroso |
| **GPLv2** | Por coherencia ideológica y enojo |

---

## 🚀 Instalación

```bash
git clone https://github.com/Qmaker-programmer/tuxtimes.git
cd tuxtimes
npm install
cp src/firebase.example.js src/firebase.js
# Edita firebase.js con tus credenciales
npm run dev
```

> ⚠️ **Para contribuidores:** usa tu propia clave de Firebase mientras desarrollas. No uses las llaves oficiales para no ensuciar la BD de producción. Cuando tu PR esté listo, se probará con las llaves reales antes de fusionar.

---

## 🐛 Notas del Desarrollador

*(Extraídas de los comentarios del código. Sin editar.)*

> *"El futuro nosotros nos odiará."* — sobre la falta de paginación

> *"Si alguna vez tiene más de 10 elementos, el usuario está perdido. Y tú también."* — sobre el navStack

> *"fui yo."* — sobre quién intentó borrar un import

> *"JSON.parse falló. alguien metió la mano en el localStorage."*

---

## 🤝 Contribuir

```bash
git checkout -b feature/tu-mejora
git commit -m "feat: descripción épica"
git push origin feature/tu-mejora
# Abre el PR → se testea → si funciona, se fusiona 🐧
```

**Ideas bienvenidas:** paginación, tests, notificaciones en tiempo real, PWA, búsqueda full-text, más easter eggs.

---

## ⚖️ Licencia

**GPLv2** — Porque si vas a hacer algo en nombre de la libertad del software, al menos sé coherente con la licencia. No versión 3. Versión 2. Por razones filosóficas que no vamos a debatir aquí.

---

## Créditos

- **Linus Torvalds** — por el kernel que inspiró todo, incluyendo el nombre
- **Tux** — el pingüino. El verdadero protagonista.
- **LWN.net** — por el paywall que desató esta cadena de eventos. Sin ti, esto no existiría.
- **Firebase** — por cobrar por cada query y enseñarnos eficiencia a la fuerza
- **VSCodium** — por el High Contrast theme que inspiró el modo hacker ⚡
- **La Comunidad Linux** — por existir y merecer una plataforma libre

---

<div align="center">

```
         .--.
        |o_o |
        |:_/ |
       //   \ \
      (|     | )
     /'\_   _/`\
     \___)=(___/
```

**TuxTimes** — *Porque la información libre no debería costar $35 al año*

🐧 *Hecho con mucho té, enojo productivo y amor por el software libre* 🐧

*por **Qmaker** (Andres / Andresuno) — el único loco que hizo esto en un solo App.vue de 2229 líneas en 5/4 dias(la version beta 1.0.0)* 🫡

[⬆ Volver arriba](#-tuxtimes)

</div>