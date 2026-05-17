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

### *El lector de noticias Linux que nació de la rabia pura y el odio a los paywalls arcaicos*

[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![GPLv2](https://img.shields.io/badge/Licencia-GPLv2-red?style=for-the-badge&logo=gnu&logoColor=white)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html)
[![LWN](https://img.shields.io/badge/Anti--Paywall-LWN.net%20%F0%9F%96%95-orange?style=for-the-badge)](https://lwn.net)
[![Estado](https://img.shields.io/badge/Estado-Prod%20pero%20sin%20pagiaci%C3%B3n-critical?style=for-the-badge)](.)
[![Builds](https://img.shields.io/badge/Builds-Solo%20cuando%20quiere-lightgrey?style=for-the-badge)](.)

<br/>

> *"Nació porque estaba enojado con páginas con paywalls arcaicos (te hablo a ti → lwn.net ←)"*
> 
> — El autor, comentario en el código, línea 8

<br/>

🐧 **Un pengüino rebelde · Una app de Vue · Un grito de independencia informativa** 🐧

</div>

---

## 📖 ¿Qué es TuxTimes?

TuxTimes es una plataforma de noticias y artículos sobre Linux y software libre, construida con **Vue 3 + Firebase**, que nació de un momento de frustración completamente comprensible:

> *LWN.net, el legendario e historicamente arcaico portal de noticias del kernel Linux, lleva décadas siendo uno de los recursos más valiosos de la comunidad libre... escondido detrás de un paywall que parece diseñado en 1998 y actualizado nunca.*

Así que alguien dijo **"suficiente"**, abrió el editor, y construyó TuxTimes. Todo en un solo `App.vue` de 1900+ líneas. **¿Por qué?** Porque estaba enojado. **¿Funciona?** Perfectamente. **¿Es buena arquitectura?** El autor lo sabe. El autor no pregunta.

La licencia es **GPLv2**. También por enojo.

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
- La interfaz web podría haber sido diseñada por un monje benedictino en el año 2003
- El CSS parece escrito directamente en piedra
- No hay dark mode (el crimine supremo)
- Los comentarios tienen IDs numéricos de 7 cifras como en el año del señor

### 🤔 ¿LWN es malo entonces?

**NO.** LWN es genuinamente excelente. Jonathan Corbet y compañía hacen un trabajo periodístico sobre el mundo Linux que es irreemplazable. Merecen ser pagados. El contenido justifica la suscripción.

El problema es que en el año 2024+, una plataforma que:

- No tiene modo oscuro
- Requiere suscripción para leer artículos de la semana
- Tiene la UX de una página PHP de 2001
- No es fácilmente navegable sin bookmarks manuales

...genera en ciertos desarrolladores una reacción alérgica que solo puede resolverse con **código**, **café**, y **una licencia GPLv2 por pura coherencia ideológica**.

TuxTimes es esa reacción alérgica. Y es gloriosa.

---

## ✨ Features (o: "lo que hace mientras Firebase no cobra demasiado")

### 🏠 Feed Principal

- **Grid de posts** con tarjetas visuales, categorías y tags
- **Búsqueda inteligente** que soporta texto libre + `#tags` en la misma query
- **Filtro por categorías** múltiples simultáneas (AND lógico entre categorías, OR entre textos)
- Ordenamiento por fecha (más nuevo primero, siempre)

### 🥚 Easter Egg: El BSOD de Linux

Busca `windows` en el buscador. Te lo mereces.

```javascript
// EASTER EGG: si el usuario busca "windows" → BSoD de Linux. porque somos así.
// (si alguien reporta esto como bug, es que no entiende la cultura)
watch(searchQuery, (v) => { showWindowsEgg.value = v.toLowerCase().includes('windows'); });
```

### 🔐 Autenticación

- **Google OAuth** via popup (COOP que llore lo que quiera)
- **Email + contraseña** con registro y login tradicional
- **Perfil de usuario** con bio, foto, URL personalizada, nickname
- Modo "esconder email" porque la privacidad existe
- Validaciones de contraseña débil ("mín. 6 car. 🐧")

### ✍️ Editor de Posts

- **Markdown completo** renderizado en tiempo real con `marked`
- **Preview side-by-side** (split view) mientras escribes
- **Borrador persistente** en `localStorage` para el usuario que cierra la pestaña sin querer (todos lo hemos hecho)
- Soporte de categorías y tags
- Edición de posts existentes con historial de cambios

### 💬 Sistema de Comentarios (la obra de ingeniería más dramática)

El sistema de comentarios merece su propio apartado porque es, honestamente, notable:

```
Comentario raíz
├── Respuesta A (depth: 1)
│   ├── Respuesta A1 (depth: 2)
│   │   └── Respuesta A1a (depth: 3) ← hasta depth 5, luego se aplana
│   └── [Este comentario fue eliminado] ← soft-delete preservando el árbol
│       └── Respuesta A2 (hijo de fantasma, sigue vivo)
└── Respuesta B
```

**El Algoritmo de Poda de Fantasmas™** (línea 688 del código):

Cuando borras un comentario que tiene respuestas:

1. Si tiene hijos vivos → **soft delete**: convierte en `[Este comentario ha sido eliminado por el autor]`
2. Si no tiene hijos → **purga física** de Firestore
3. **Recolector de basura en cascada reversa**: sube por el árbol eliminando padres fantasmas que ya no tienen descendencia útil

```javascript
// RECOLECTOR DE BASURA EN CASCADA REVERSA (Limpieza de ancestros fantasmas)
let currentParentId = currentComment?.parentId;
while (currentParentId) {
  // Si el padre ya era fantasma y no le quedó nada útil... ¡exterminado!
  if (!parentHasLiveChildren) {
    await deleteDoc(parentRef);
    currentParentId = parentNode.parentId; // subimos un nivel más
    continue;
  }
  break; // si el padre está vivo, nos detenemos
}
```

Es el sistema de gestión de comentarios más cuidadoso que vas a encontrar en un proyecto Vue personal. Sin excepción.

### ⭐ Sistema de Favoritos

- Guarda posts con estrella en Firestore
- Feed dedicado de favoritos con los mismos filtros del feed principal
- `arrayUnion` / `arrayRemove` de Firestore para concurrencia correcta

### 👤 Perfiles de Autor

- Perfil público con posts del autor
- Mini grid de sus publicaciones
- Contador total de estrellas recibidas
- Accesible directamente desde cualquier post

### 🗺️ Enrutamiento por Hash

Sin React Router. Sin Vue Router. Solo `window.location.hash` y orgullo.

| Hash                   | Vista                           |
| ---------------------- | ------------------------------- |
| `#reciente` o `#feed`  | Feed principal                  |
| `#configuracion`       | Ajustes de cuenta               |
| `#favoritos`           | Posts guardados                 |
| `#mistuxpost`          | Mis publicaciones               |
| `#nuevopost`           | Editor                          |
| `#signin`              | Modal de login                  |
| `#post-{ID}`           | Post específico (¡compartible!) |
| `#cualquier-otra-cosa` | Filtra el feed por ese tag      |

> *"React Router llorando en un rincón. Ventaja: sin SSR, sin 404s, sin drama. Solo un # y listo."*
> 
> — Comentario en el código, línea 59

### 🗑️ Borrado con Confirmación

Para borrar un post, el usuario debe escribir el **título exacto**. 

```
¿Seguro que quieres borrar "Compilando el kernel a las 3am"?
Escribe el título exactamente: [________________]
                                ↑ sí, molesto a propósito
```

No se puede pegar. No hay atajo. Así de deliberado es el borrado.

### 🤖 TuxPit (el asistente pingüino)

Un pingüino flotante en la esquina que aparece con mensajes contextuales. Bouncea infinitamente. No tiene vergüenza.

---

## 🏗️ Arquitectura (o: "todo en un archivo, no preguntes")

```
tuxtimes/
├── src/
│   ├── App.vue              ← TODO. 1900+ líneas. El monolito supremo.
│   │                           CSS incluido. Lógica incluida. Dignidad: negociable.
│   ├── components/
│   │   └── CommentNode.vue  ← El componente recursivo. Se llama a sí mismo.
│   │                           Sí, da miedo. No, no está roto (ahora).
│   └── firebase.js          ← La santísima trinidad: auth, provider, db
├── public/
│   └── tux.png              ← El señor Tux. El verdadero MVP.
└── package.json
```

### Stack Tecnológico

| Tecnología        | Versión         | Por qué                                                   |
| ----------------- | --------------- | --------------------------------------------------------- |
| **Vue 3**         | Composition API | Porque Options API es 2020                                |
| **Firebase Auth** | v9 modular      | Google OAuth sin servidores propios                       |
| **Firestore**     | NoSQL           | La BD que cobra por query (⚠️ no hagas queries en bucles) |
| **marked**        | latest          | Markdown → HTML. Magia negra controlada.                  |
| **Vite**          | latest          | Porque webpack es un recuerdo doloroso                    |
| **GPLv2**         | la original     | Por coherencia ideológica y enojo                         |

### Modelo de Datos en Firestore

```
firestore/
├── posts/
│   └── {postId}/
│       ├── title, content, category, tags[]
│       ├── author, authorUid, authorPhoto
│       ├── createdAt, updatedAt
│       ├── stars[] (UIDs que dieron estrella)
│       └── comments/           ← subcolección
│           └── {commentId}/
│               ├── text, author, authorUid
│               ├── parentId (null = raíz)
│               ├── createdAt, editedAt
│               └── isDeleted (soft-delete flag)
└── profiles/
    └── {uid}/
        ├── displayName, photoURL, bio
        ├── nickname, customUrl
        └── hideEmail, hideName
```

---

## 🚀 Instalación y Configuración

- Node.js 18+
- Una cuenta de Firebase (gratis tier suficiente para empezar)
- Ganas de contribuir a la causa anti-paywall
- Opcional: rabia acumulada contra LWN (mejora el rendimiento del developer)

### Setup

```bash
# Clonar el repositorio
git clone https://github.com/Qmaker-programmer/tuxtimes.git
cd tuxtimes

# Instalar dependencias
npm install

# Configurar Firebase (crea src/firebase.js)
cp src/firebase.example.js src/firebase.js
# Edita con tus credenciales de Firebase Console
```

### Configuración de Firebase (`src/firebase.js`)

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app      = initializeApp(firebaseConfig);
export const auth     = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db       = getFirestore(app);
```

### Reglas de Firestore recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ══════════════════════════════════════════════════════════════
    //  HELPER FUNCTIONS
    // ══════════════════════════════════════════════════════════════

    function isAuth() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return isAuth() && request.auth.uid == uid;
    }

    function isCreatingOwnPost() {
      return isAuth() && request.resource.data.authorUid == request.auth.uid;
    }

    function isPostOwner() {
      return isAuth() && resource.data.authorUid == request.auth.uid;
    }

    function onlyStarsChanged() {
      return request.resource.data.keys().hasOnly(['stars']) 
        || request.resource.data.diff(resource.data).affectedKeys().hasOnly(['stars']);
    }

    // ══════════════════════════════════════════════════════════════
    //  PERFILES DE USUARIO
    // ══════════════════════════════════════════════════════════════
    match /profiles/{userId} {
      allow read: if true;
      allow create, update: if isOwner(userId)
        && request.resource.data.keys().hasOnly([
            'uid', 'displayName', 'photoURL', 'nickname',
            'bio', 'customUrl', 'hideEmail', 'hideName',
            'avatarUrl', 'createdAt', 'updatedAt'
          ]);
      allow delete: if isOwner(userId);
    }

    // ══════════════════════════════════════════════════════════════
    //  POSTS / TUXPOSTS
    // ══════════════════════════════════════════════════════════════
    match /posts/{postId} {
      allow read: if true;

      allow create: if isCreatingOwnPost()
        && request.resource.data.keys().hasAll(['title', 'content', 'authorUid', 'author', 'createdAt'])
        && request.resource.data.stars == [];

      allow update: if isPostOwner() 
        || (isAuth() && onlyStarsChanged());

      allow delete: if isPostOwner();

      // ══════════════════════════════════════════════════════════
      //  COMENTARIOS (subcolección)
      // ══════════════════════════════════════════════════════════
      match /comments/{commentId} {
        allow read: if true;

        // Crear: Obligatorio estar logueado y que el autor coincida con tu UID
        allow create: if isAuth()
          && request.resource.data.authorUid == request.auth.uid
          && request.resource.data.text != null
          && request.resource.data.text.trim().size() > 0;

        // Actualizar: El autor puede modificar su texto O realizar un soft-delete
        allow update: if isAuth()
          && resource.data.authorUid == request.auth.uid 
          && (
            // CASO 1: Edición normal de Markdown (se mantiene el UID)
            (
              request.resource.data.authorUid == request.auth.uid
              && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['text', 'editedAt'])
            ) 
            || 
            // CASO 2: Borrado lógico comunitario (El Pingüino pasa a null)
            (
              request.resource.data.isDeleted == true
              && request.resource.data.authorUid == null
              && request.resource.data.diff(resource.data).affectedKeys().hasAny(['text', 'isDeleted', 'author', 'authorUid', 'authorPhoto'])
            )
          );
          
        // 🔥 BORRAR CORREGIDO: Permite borrar si eres el dueño original O si el nodo ya es un residuo fantasma
        allow delete: if isAuth() && (
          resource.data.authorUid == request.auth.uid || 
          resource.data.isDeleted == true
        );
      }
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Ejecutar en desarrollo

```bash
npm run dev
# → http://localhost:5173
# → Abre el navegador
# → Prueba buscar "windows" para el easter egg
# → Profit
```

### Build de producción

**si quieres contribuir, usa tu clave de firebase temporalmente, la llave de TuxTimes no es para usar en todas parte; por seguridad a no dejar basura de datos en la base de datos. despues cuando termines y funcione, cambia a las llaves oficiales, sera testeado y si funciona se fusionara*

```bash
npm run build
# → dist/
# Despliega donde quieras. Firebase Hosting, Vercel, Netlify, un NAS en el clóset...
# TuxTimes no discrimina infraestructura.
```

---

## 🐛 Notas Conocidas del Desarrollador

*(Extraídas directamente de los comentarios del código. Sin editar. Con todo el amor.)*

> *"Sí, trae TODOS los posts. No hay paginación. Si la comunidad crece mucho... bueno, ese será el problema del futuro nosotros. El futuro nosotros nos odiará."*

> *"Si alguna vez [el navStack] tiene más de 10 elementos, el usuario está perdido. Y tú también. Buena suerte."*

> *"No le digas cuál es el error real. Seguridad."* (sobre mensajes de login)

> *"fui yo."* (sobre quién intentó borrar un import)

> *"JSON.parse falló. alguien metió la mano en el localStorage."*

> *"COOP = Cross-Origin-Opener-Policy. el navegador siendo el navegador."*

> *"el spinner de 'por favor espera, Firebase está pensando'"*

---

## 🤝 Contribuir

Las contribuciones son bienvenidas, especialmente si incluyen:

- ✅ Paginación (el futuro nosotros te lo agradecerá)
- ✅ Tests unitarios para el algoritmo de poda de comentarios
- ✅ Dark mode para el resto de elementos (ya existe, pero siempre puede ser más oscuro)
- ✅ Más Easter Eggs relacionados con Linux
- ✅ Integración con RSS feeds de noticias Linux libres
- ✅ Sistema de notificaciones en tiempo real (Firestore `onSnapshot`)
- ✅ Búsqueda full-text con Algolia (o TypeSense si prefieres el camino libre)
- ✅ Separar el monolito App.vue en componentes más pequeños (si tienes tiempo y valentía)
- ✅ PWA support para leer offline
- ✅ Exportar posts en formato EPUB/PDF para llevar en el e-reader

### ¿Cómo contribuir?

```bash
# Fork → Clone → Branch → Code → PR
# El flujo de siempre. Ya sabes.
git checkout -b feature/paginacion-por-favor
# Haz tu magia
git commit -m "feat: añade paginación antes de que el futuro nosotros nos odie"
git push origin feature/paginacion-por-favor
# Abre el PR
```

---

## ⚖️ Licencia

**GPLv2** — GNU General Public License version 2.

Porque si vas a hacer algo en nombre de la libertad del software, al menos sé coherente con la licencia.

```
Copyright (C) TuxTimes Contributors

Este programa es software libre: puedes redistribuirlo y/o modificarlo
bajo los términos de la Licencia Pública General GNU, tal como fue publicada
por la Free Software Foundation, versión 2 de la Licencia.

(Nota: no versión 3. Versión 2. Por razones filosóficas que no vamos a debatir aquí.)
```

---

## Créditos y Reconocimientos

- **Linus Torvalds** — por el kernel que inspiró todo esto, incluyendo el nombre
- **Tux** — el pingüino. El verdadero protagonista.
- **LWN.net** — por el paywall que desató esta cadena de eventos. Sin ti, esto no existiría. En serio.
- **Firebase** — por cobrar por cada query y enseñarnos a escribir código eficiente a la fuerza
- **Vue 3** — por hacer que escribir 1900 líneas en un archivo se sienta bien
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

🐧 *Hecho con mucho Tè, y amor por el software libre* 🐧

[⬆ Volver arriba](#-tuxtimes)

</div>