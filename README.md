# 🐧 TuxTimes

> **El periódico de la comunidad Linux. Hecho con amor, código y mucho café.**
> Licenciado bajo GPLv2 — porque el software libre no es una opción, es una forma de vida.

---

## 📋 Tabla de Contenidos

1. [¿Qué es TuxTimes?](#qué-es-tuxtimes)
2. [Características](#características)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Requisitos](#requisitos)
5. [Instalación y Configuración](#instalación-y-configuración)
6. [Firebase Setup](#firebase-setup)
7. [Estructura del Proyecto](#estructura-del-proyecto)
8. [Características Especiales](#características-especiales)
9. [Atajos de Teclado](#atajos-de-teclado)
10. [Easter Eggs](#easter-eggs)
11. [Contribuir](#contribuir)
12. [Licencia](#licencia)

---

## ¿Qué es TuxTimes?

TuxTimes es una plataforma de noticias y artículos técnicos centrada en el ecosistema Linux y el
software libre. Pensada para que la comunidad comparta conocimiento: desde parches del kernel hasta
consejos de seguridad, pasando por reviews de distros y tutoriales de bash.

Cualquier usuario puede leer. Solo los que inician sesión pueden publicar, comentar y dar estrellas.

---

## Características

### 📰 Tuxposts (Artículos)
- Redacción completa en **Markdown** con editor split-screen (escritura + preview en tiempo real)
- Barra de herramientas Markdown visual: negrita, cursiva, headings, listas, código, links e imágenes
- **Categorías técnicas** (20+): Gestión de Memoria, Virus & Malware, Kernel & Syscalls, Docker, IA, etc.
- **Tags** predefinidos y personalizados para cada Tuxpost
- Vista expandida del Tuxpost al hacer clic — ocupa todo el espacio disponible con animación
- Los autores pueden **editar** y **borrar** sus propios Tuxposts
- Borrado con confirmación de seguridad: debes escribir el título exacto para confirmar
- Usuarios no-autores pueden dar ⭐ **estrella** a los Tuxposts que les gusten

### 🔍 Búsqueda y Filtros
- **Barra de búsqueda** en tiempo real: filtra por título, autor, categoría y tags
- **Easter Egg**: busca "windows" y descubre algo 😏
- Filtro por categoría desde la sidebar

### 👤 Perfiles de Autor
- Vista de perfil completa al hacer clic en el autor de cualquier Tuxpost
- Muestra: foto, apodo (Tuxnick), bio, URL personalizada, estrellas totales y todos sus Tuxposts
- Cuadrícula de Tuxposts del autor — clic en cualquiera para abrirlo (navegación en pila)

### 🗺️ Navegación en Pila (History Stack)
- Cada acción (abrir post, ver autor, abrir post desde autor) se apila como el historial del navegador
- Botón **Volver** y tecla **Escape** retroceden un nivel
- Breadcrumb visible cuando hay más de 2 niveles de profundidad
- Al ir a Configuración, Nuevo Tuxpost, etc., se limpia la pila automáticamente

### 💬 Comentarios Recursivos (Árbol Infinito)
- Cada Tuxpost tiene sección de comentarios al expandirlo
- Puedes **responder a cualquier comentario**, formando un árbol de profundidad infinita
- Indentación visual por nivel (máx. visual: 5 niveles, estructura sin límite)
- Atajo de teclado: **Ctrl+Enter** para enviar comentario

### ⭐ Favoritos
- Sección **Favoritos** en la sidebar (solo visible si tienes sesión)
- Lista todos los Tuxposts a los que diste estrella
- Persistido en Firestore por usuario

### ⚙️ Configuración de Cuenta
- **Tuxnick**: apodo que reemplaza tu nombre real en la plataforma
- **Bio / Descripción**: texto libre visible en tu perfil público
- **URL personalizada**: `tuxtimes.tux/tu-nombre`
- **Privacidad**:
  - Ocultar correo electrónico del perfil público
  - Ocultar nombre real (solo se muestra el Tuxnick)
- **Avatar personalizable**: sube tu propia imagen de perfil
- Clic en tu cuenta en la sidebar → va directo a Configuración

### 🔐 Autenticación
- **Google** OAuth con un clic
- **Email + Contraseña** para los puristas que no quieren dar sus datos a Google 🐧
- Modal de login elegante con ambas opciones

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| **Vue 3** | ^3.5 | Framework frontend (Composition API + `<script setup>`) |
| **Vite** | ^8.0 | Build tool y dev server ultrarrápido |
| **Firebase** | ^12.0 | Auth, Firestore (base de datos), Storage (avatares) |
| **marked** | ^18.0 | Renderizado de Markdown a HTML |
| **GPLv2** | — | Licencia del proyecto |

---

## Requisitos

- **Node.js** 20+ (recomendado: usar `nvm`)
- **npm** 9+ o **pnpm** 8+
- Cuenta en **Firebase** (plan Spark gratuito es suficiente para empezar)
- Navegador moderno (Chrome, Firefox, Librewolf, etc. — no IE, obviamente 🐧)

---

## Instalación y Configuración

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/tuxtimes.git
cd tuxtimes

# 2. Instala dependencias
npm install

# 3. Copia las variables de entorno
cp .env.example .env

# 4. Edita .env con tus credenciales de Firebase
#    (ver sección Firebase Setup abajo)

# 5. Inicia el servidor de desarrollo
npm run dev

# 6. Build para producción
npm run build

# 7. Preview del build
npm run preview
```

---

## Firebase Setup

### 1. Crear proyecto

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un proyecto nuevo (nombre sugerido: `tuxtimes`)
3. Desactiva Google Analytics si no la necesitas

### 2. Habilitar Authentication

1. Authentication → Sign-in method
2. Habilita **Google**
3. Habilita **Email/Password**

### 3. Crear Firestore

1. Firestore Database → Crear base de datos
2. Empieza en **modo producción**
3. Elige la región más cercana a tus usuarios

### 4. Configurar Storage (para avatares)

1. Storage → Comenzar
2. Configura las reglas (ver más abajo)

### 5. Reglas de Firestore

Copia las reglas del archivo `firestore.rules` incluido en el repositorio.
Las reglas garantizan que:
- Cualquiera puede leer posts y perfiles
- Solo usuarios autenticados pueden crear posts con su propio UID
- Solo el autor puede editar/borrar sus posts
- Cada usuario solo puede escribir su propio perfil

### 6. Variables de entorno

Crea un archivo `.env` en la raíz:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tuxtimes.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tuxtimes
VITE_FIREBASE_STORAGE_BUCKET=tuxtimes.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## Estructura del Proyecto

```
tuxtimes/
├── public/
│   ├── tux.png              # Mascota principal 🐧
│   ├── tuxsobrero.gif       # Easter egg del sombrero 🎩
│   └── tuxpc.gif            # Tux en la PC
├── src/
│   ├── App.vue              # Componente raíz (toda la app)
│   ├── firebase.js          # Configuración de Firebase
│   ├── main.js              # Entry point
│   └── style.css            # Estilos globales (reset)
├── index.html               # HTML principal
├── vite.config.js           # Configuración de Vite
├── package.json
├── firestore.rules          # Reglas de seguridad Firestore
└── README.md                # Este archivo 🐧
```

---

## Características Especiales

### 🐧📎 Tuxpit (Easter Egg — homenaje a Clippit)

Al empezar a escribir tu primer Tuxpost, aparece **Tuxpit** en la esquina inferior derecha:
> *"Parece que estás escribiendo un Tuxpost... ¿Quieres que te ayude? 🐧"*

Es un guiño directo al infame asistente de Microsoft Office. Excepto que Tuxpit corre en Linux.

### 🎩 Tux con Sombrero

Haz clic en el logo de Tux en la sidebar. Solo una vez. Solo por un momento. Ya sabes qué pasa.

### 🪟 Easter Egg de Windows

Escribe "windows" en la barra de búsqueda. TuxTimes tiene una opinión muy clara al respecto.

---

## Atajos de Teclado

| Atajo | Acción |
|---|---|
| `Escape` | Cerrar modal / Retroceder en la pila de navegación |
| `Ctrl + Enter` | Enviar comentario |
| `Alt + ←` | (navegador) Retroceder |
| `Alt + →` | (navegador) Avanzar |

En el editor Markdown, todos los botones de la toolbar aplican al texto seleccionado.

---

## Easter Eggs

| Easter Egg | Cómo activarlo |
|---|---|
| 🎩 Tux con sombrero | Clic en el logo de Tux en la sidebar |
| 🐧📎 Tuxpit | Escribe la primera letra en el editor de Tuxpost |
| 🪟 Error 404 Windows | Busca "windows" en el buscador de Tuxposts |

---

## Contribuir

TuxTimes es software libre. Las contribuciones son bienvenidas:

```bash
# Haz un fork, crea tu rama
git checkout -b feature/mi-nueva-feature

# Haz tus cambios, commitea
git commit -m "feat: añadir soporte para LaTeX en posts"

# Push y abre un Pull Request
git push origin feature/mi-nueva-feature
```

Por favor mantén el código limpio, comentado y en español donde sea posible.
Los commits en inglés también están bien (convención estándar).

---

## Licencia

```
TuxTimes — El periódico de la comunidad Linux
Copyright (C) 2025 — Contribuidores de TuxTimes

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; version 2 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
```

---

*Hecho con 🐧 y mucho `sudo` — porque los mejores proyectos nacen en una terminal.*
