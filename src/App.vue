<script setup>
// ══════════════════════════════════════════════════════════════════
//  IMPORTS
// ══════════════════════════════════════════════════════════════════
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { marked } from 'marked';
import { auth, provider, db } from './firebase';
import {
  signInWithPopup, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import {
  collection, addDoc, getDocs, getDoc, doc, query, orderBy,
  serverTimestamp, updateDoc, deleteDoc, arrayUnion, arrayRemove, setDoc
} from 'firebase/firestore';

// importando componente de Comentarios!
import CommentNode from './components/CommentNode.vue';

// ══════════════════════════════════════════════════════════════════
//  NAVEGACIÓN — pila de estados
// ══════════════════════════════════════════════════════════════════
const navStack    = ref([{ type: 'feed' }]);
const currentNav  = computed(() => navStack.value[navStack.value.length - 1]);
const pushNav     = (e) => navStack.value.push(e);
const popNav      = () => { if (navStack.value.length > 1) navStack.value.pop(); };
const resetNav    = () => { navStack.value = [{ type: 'feed' }]; };
const showOverlay = computed(() => navStack.value.length > 1 && view.value === 'feed');

// Vista activa
const view = ref('feed'); // 'feed'|'new-post'|'settings'|'favorites'|'myposts'
watch(view, (v) => { if (v !== 'feed') resetNav(); });

// ══════════════════════════════════════════════════════════════════
//  AUTH (Corregido e inmune a bloqueos COOP)
// ══════════════════════════════════════════════════════════════════
import { signInWithRedirect, getRedirectResult } from 'firebase/auth'; // 👈 Asegúrate de añadir estos dos a tus imports de firebase/auth arriba

const user          = ref(null);
const showAuthModal = ref(false);
const authMode      = ref('login');
const authEmail     = ref('');
const authPassword  = ref('');
const authName      = ref('');
const authError     = ref('');
const authLoading   = ref(false);

onMounted(async () => {
  // 1. Capturar el resultado del login por redirección si venimos volviendo de Google
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      user.value = result.user;
      showAuthModal.value = false;
    }
  } catch (error) {
    console.error("Error al procesar el retorno de Google:", error);
    authError.value = 'Error al procesar el inicio de sesión 🐧';
  }

  // 2. Escuchar de forma segura los cambios de estado del usuario
  onAuthStateChanged(auth, u => { 
    user.value = u; 
    fetchPosts(); 
  });

  // Listener para cerrar modales con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (showDeleteModal.value) { showDeleteModal.value = false; return; }
      if (showWindowsEgg.value) { showWindowsEgg.value = false; return; }
      if (showAuthModal.value)  { showAuthModal.value  = false; return; }
      popNav();
    }
  });
});

// 👇 CAMBIADO DE POPUP A REDIRECT PARA EVITAR COMPLICACIONES DE NAVEGADOR
const loginGoogle = async () => {
  authError.value = '';
  try { 
    await signInWithRedirect(auth, provider); 
  }
  catch { 
    authError.value = 'Error al conectar con Google 🐧'; 
  }
};

const loginEmail = async () => {
  authError.value = ''; authLoading.value = true;
  try {
    await signInWithEmailAndPassword(auth, authEmail.value, authPassword.value);
    showAuthModal.value = false; authEmail.value = ''; authPassword.value = '';
  } catch { authError.value = 'Correo o contraseña incorrectos 🐧'; }
  authLoading.value = false;
};

const registerEmail = async () => {
  authError.value = ''; authLoading.value = true;
  if (!authName.value.trim()) { authError.value = 'Escribe tu nombre 🐧'; authLoading.value = false; return; }
  try {
    const cred = await createUserWithEmailAndPassword(auth, authEmail.value, authPassword.value);
    await updateProfile(cred.user, { displayName: authName.value.trim() });
    showAuthModal.value = false; authEmail.value = ''; authPassword.value = ''; authName.value = '';
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') authError.value = 'Ese correo ya está registrado 🐧';
    else if (e.code === 'auth/weak-password')   authError.value = 'Contraseña muy débil (mín. 6 car.) 🐧';
    else authError.value = 'Error al registrarse 🐧';
  }
  authLoading.value = false;
};

const logout = () => { auth.signOut(); view.value = 'feed'; resetNav(); };


// ══════════════════════════════════════════════════════════════════
//  POSTS
// ══════════════════════════════════════════════════════════════════
const posts = ref([]);

const fetchPosts = async () => {
  const q    = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  posts.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

const openPost = (post) => {
  history.pushState({ navLen: navStack.value.length + 1 }, '', `#post-${post.id}`);
  pushNav({ type: 'post', data: { ...post } });
  view.value = 'feed';
};

const openAuthor = async (post, evt) => {
  evt?.stopPropagation();
  let profile = {
    uid: post.authorUid || null, displayName: post.author,
    photoURL: post.authorPhoto || '', bio: '', nickname: '',
    customUrl: '', hideEmail: true, hideName: false
  };
  if (post.authorUid) {
    try {
      const snap = await getDoc(doc(db, 'profiles', post.authorUid));
      if (snap.exists()) {
        profile = { uid: post.authorUid, ...snap.data() };
        if (!profile.photoURL) profile.photoURL = post.authorPhoto || '';
      } else {
        profile.photoURL = post.authorPhoto || '';
      }
    } catch { profile.photoURL = post.authorPhoto || ''; }
  }
  const authorPostsList = posts.value.filter(p =>
    p.authorUid === post.authorUid || p.author === post.author
  );
  history.pushState({}, '', `#author-${post.authorUid || post.author}`);
  pushNav({ type: 'author', data: { profile, posts: authorPostsList } });
};

const closeOverlay = () => {
  popNav();
  if (navStack.value.length === 1) history.pushState({}, '', window.location.pathname);
};

const expandedPost = computed(() => currentNav.value.type === 'post'   ? currentNav.value.data : null);
const authorData   = computed(() => currentNav.value.type === 'author' ? currentNav.value.data : null);

// ══════════════════════════════════════════════════════════════════
//  FILTROS — múltiples categorías + tags + texto
// ══════════════════════════════════════════════════════════════════
const searchQuery      = ref('');
const activeCategories = ref([]);  // múltiples categorías seleccionadas
const activeTags       = ref([]);  // múltiples tags

// Parsear la búsqueda: palabras con # → tags, sin # → texto/autor/nombre
const parsedSearch = computed(() => {
  const parts = searchQuery.value.split(',').map(s => s.trim()).filter(Boolean);
  const tags  = [];
  const texts = [];
  parts.forEach(p => {
    if (p.startsWith('#')) tags.push(p.slice(1).toLowerCase());
    else texts.push(p.toLowerCase());
  });
  return { tags, texts };
});

// Ir a feed con categoría al hacer click en sidebar categoría
const goToCategory = (cat) => {
  if (!activeCategories.value.includes(cat)) activeCategories.value.push(cat);
  else activeCategories.value = activeCategories.value.filter(c => c !== cat);
  view.value = 'feed'; resetNav();
};

const toggleCategoryFilter = (cat) => {
  const i = activeCategories.value.indexOf(cat);
  if (i === -1) activeCategories.value.push(cat);
  else activeCategories.value.splice(i, 1);
};

const clearAllFilters = () => {
  searchQuery.value = ''; activeCategories.value = []; activeTags.value = [];
};

const applyPostFilter = (list) => {
  let p = list;
  // Filtro por categorías
  if (activeCategories.value.length)
    p = p.filter(x => activeCategories.value.includes(x.category));
  // Parsear búsqueda
  const { tags, texts } = parsedSearch.value;
  if (tags.length)
    p = p.filter(x => tags.every(t => (x.tags || []).some(pt => pt.toLowerCase().includes(t))));
  if (texts.length)
    p = p.filter(x => texts.some(q =>
      x.title?.toLowerCase().includes(q) ||
      x.author?.toLowerCase().includes(q) ||
      x.category?.toLowerCase().includes(q) ||
      (x.tags || []).some(t => t.toLowerCase().includes(q))
    ));
  return p;
};

const filteredPosts   = computed(() => applyPostFilter(posts.value));
const favoritePosts   = computed(() => applyPostFilter(posts.value.filter(p => hasStarred(p))));
const myPosts         = computed(() => applyPostFilter(posts.value.filter(p =>
  p.authorUid === user.value?.uid || p.author === user.value?.displayName
)));

const hasActiveFilters = computed(() =>
  searchQuery.value || activeCategories.value.length || activeTags.value.length
);

// Easter egg Windows
const showWindowsEgg = ref(false);
watch(searchQuery, (v) => { showWindowsEgg.value = v.toLowerCase().includes('windows'); });

// ══════════════════════════════════════════════════════════════════
//  MODAL BORRAR
// ══════════════════════════════════════════════════════════════════
const showDeleteModal  = ref(false);
const deleteTarget     = ref(null);
const deleteConfirmTxt = ref('');
const deleteCanDelete  = computed(() => deleteConfirmTxt.value === deleteTarget.value?.title);

const askDeletePost = (post, evt) => {
  evt?.stopPropagation();
  deleteTarget.value = post; deleteConfirmTxt.value = ''; showDeleteModal.value = true;
};
const confirmDeletePost = async () => {
  if (!deleteCanDelete.value) return;
  await deleteDoc(doc(db, 'posts', deleteTarget.value.id));
  showDeleteModal.value = false; deleteTarget.value = null;
  popNav(); fetchPosts();
};

// ══════════════════════════════════════════════════════════════════
//  COMENTARIOS — árbol infinito
// ══════════════════════════════════════════════════════════════════
const commentsByPost  = ref({});
const replyingTo      = ref({});
const commentInput    = ref({});
const loadingComments = ref({});

const fetchComments = async (postId) => {
  if (loadingComments.value[postId]) return;
  loadingComments.value[postId] = true;
  const q    = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  commentsByPost.value = { ...commentsByPost.value, [postId]: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
  loadingComments.value[postId] = false;
};

const sendComment = async (postId, parentId = null) => {
  if (!user.value) return;
  const inputId = `comment-input-${postId}`;
  const el = document.getElementById(inputId);
  if (!el) return;
  const text = el.value.trim();
  if (!text) return;

  try {
    // Forzamos un nombre válido si displayName es null o vacío
    const authorName = user.value.displayName && user.value.displayName.trim() 
      ? user.value.displayName 
      : (user.value.email ? user.value.email.split('@')[0] : 'Pingüino Anónimo');

    const commentData = {
      text: text,
      authorUid: user.value.uid,
      author: authorName,
      parentId: parentId || null,
      createdAt: serverTimestamp()
    };

    // Aseguramos también guardar la foto del autor si existe
    if (user.value.photoURL) {
      commentData.authorPhoto = user.value.photoURL;
    }

    await addDoc(collection(db, 'posts', postId, 'comments'), commentData);

    // Limpieza de inputs
    el.value = '';
    if (commentInput.value[postId]) commentInput.value[postId] = '';
    if (replyingTo.value[postId]) replyingTo.value[postId] = null;

    fetchComments(postId);
  } catch (error) {
    console.error("Error completo al enviar comentario:", error);
  }
};

const setReply = (postId, commentId) => {
  replyingTo.value = { ...replyingTo.value, [postId]: commentId };
  nextTick(() => document.getElementById(`comment-input-${postId}`)?.focus());
};

const buildTree = (comments, parentId = null) =>
  comments.filter(c => (c.parentId || null) === parentId)
          .map(c => ({ ...c, children: buildTree(comments, c.id) }));

const commentTree = (postId) => buildTree(commentsByPost.value[postId] || [], null);

watch(expandedPost, (p) => { if (p?.id && !commentsByPost.value[p.id]) fetchComments(p.id); });

// ══════════════════════════════════════════════════════════════════
//  ESTRELLAS
// ══════════════════════════════════════════════════════════════════
const toggleStar = async (post, evt) => {
  evt?.stopPropagation();
  if (!user.value) return;
  const uid   = user.value.uid;
  const stars = [...(post.stars || [])];
  const r     = doc(db, 'posts', post.id);
  const adding = !stars.includes(uid);
  try {
    if (adding) await updateDoc(r, { stars: arrayUnion(uid) });
    else        await updateDoc(r, { stars: arrayRemove(uid) });
    const newStars = adding ? [...stars, uid] : stars.filter(s => s !== uid);
    post.stars = newStars;
    const idx = posts.value.findIndex(p => p.id === post.id);
    if (idx !== -1) posts.value[idx] = { ...posts.value[idx], stars: newStars };
    const entry = navStack.value.find(e => e.type === 'post' && e.data.id === post.id);
    if (entry) entry.data = { ...post, stars: newStars };
  } catch (e) { console.error('toggleStar error:', e); }
};
const hasStarred = (post) => (post.stars || []).includes(user.value?.uid);
const starCount  = (post) => (post.stars || []).length;

// ══════════════════════════════════════════════════════════════════
//  EDITAR / PUBLICAR POST
// ══════════════════════════════════════════════════════════════════
const editingPost      = ref(null);
const title            = ref('');
const content          = ref('');
const selectedTags     = ref([]);
const selectedCategory = ref('');
const editorRef        = ref(null);
const titleError       = ref('');

const startEdit = (post, evt) => {
  evt?.stopPropagation();
  editingPost.value = post; title.value = post.title; content.value = post.content;
  selectedCategory.value = post.category || ''; selectedTags.value = [...(post.tags || [])];
  titleError.value = ''; resetNav(); view.value = 'new-post';
};

const onTitleInput = () => {
  if (title.value.includes('#')) {
    title.value = title.value.replace(/#/g, '');
    titleError.value = 'El título no puede contener #';
    setTimeout(() => { titleError.value = ''; }, 2500);
  }
};

const publish = async () => {
  if (!title.value || !content.value || !selectedCategory.value) return;
  const cleanTitle = title.value.replace(/#/g, '');
  if (editingPost.value) {
    await updateDoc(doc(db, 'posts', editingPost.value.id), {
      title: cleanTitle, content: content.value,
      category: selectedCategory.value, tags: selectedTags.value,
      updatedAt: serverTimestamp(),
    });
    editingPost.value = null;
  } else {
    await addDoc(collection(db, 'posts'), {
      title: cleanTitle, content: content.value,
      category: selectedCategory.value, tags: selectedTags.value,
      author: user.value.displayName, authorUid: user.value.uid,
      authorPhoto: user.value.photoURL || '',
      createdAt: serverTimestamp(), stars: [],
    });
  }
  title.value = ''; content.value = ''; selectedTags.value = []; selectedCategory.value = '';
  tuxpitVisible.value = false; view.value = 'feed'; fetchPosts();
};

const cancelEdit = () => {
  editingPost.value = null; title.value = ''; content.value = '';
  selectedTags.value = []; selectedCategory.value = ''; view.value = 'feed';
};

// ══════════════════════════════════════════════════════════════════
//  CONFIGURACIÓN — avatar como base64 en Firestore (sin CORS)
// ══════════════════════════════════════════════════════════════════
const settingsNickname      = ref('');
const settingsBio           = ref('');
const settingsCustomUrl     = ref('');
const settingsHideEmail     = ref(false);
const settingsHideName      = ref(false);
const settingsSaving        = ref(false);
const settingsAvatarPreview = ref('');
const settingsAvatarBase64  = ref('');  // guardamos base64 en Firestore, sin Storage

const openSettings = async () => {
  if (!user.value) return;
  settingsAvatarPreview.value = user.value.photoURL || '/tux.png';
  settingsAvatarBase64.value  = '';
  try {
    const snap = await getDoc(doc(db, 'profiles', user.value.uid));
    if (snap.exists()) {
      const d = snap.data();
      settingsNickname.value      = d.nickname  || '';
      settingsBio.value           = d.bio       || '';
      settingsCustomUrl.value     = d.customUrl || '';
      settingsHideEmail.value     = d.hideEmail ?? false;
      settingsHideName.value      = d.hideName  ?? false;
      settingsAvatarPreview.value = d.avatarB64 || user.value.photoURL || '/tux.png';
    }
  } catch {}
  resetNav(); view.value = 'settings';
};

const onAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  // Revoca el blob anterior si existe
  if (settingsAvatarPreview.value.startsWith('blob:')) URL.revokeObjectURL(settingsAvatarPreview.value);
  const reader = new FileReader();
  reader.onload = (ev) => {
    settingsAvatarBase64.value  = ev.target.result;   // data:image/...;base64,...
    settingsAvatarPreview.value = ev.target.result;
  };
  reader.readAsDataURL(file);
};

const saveSettings = async () => {
  if (!user.value) return;
  settingsSaving.value = true;
  const avatarB64 = settingsAvatarBase64.value || settingsAvatarPreview.value;
  await setDoc(doc(db, 'profiles', user.value.uid), {
    uid:         user.value.uid,
    displayName: user.value.displayName,
    photoURL:    user.value.photoURL || '',
    avatarB64,
    nickname:    settingsNickname.value.trim(),
    bio:         settingsBio.value.trim(),
    customUrl:   settingsCustomUrl.value.trim().replace(/\s+/g, '-').toLowerCase(),
    hideEmail:   settingsHideEmail.value,
    hideName:    settingsHideName.value,
    updatedAt:   serverTimestamp(),
  }, { merge: true });
  settingsSaving.value = false;
  settingsAvatarBase64.value = '';
  view.value = 'feed';
};

// Avatar display: prioriza avatarB64 del perfil
const getUserAvatar = (photoURL) => photoURL || '/tux.png';

// ══════════════════════════════════════════════════════════════════
//  TAGS / CATEGORÍAS
// ══════════════════════════════════════════════════════════════════
const POPULAR_TAGS = ['linux','kernel','bash','python','seguridad','debian','arch','ubuntu','fedora','rust','c++','systemd','git','docker','firefox'];
const CATEGORIES   = ['Gestión de Memoria','Virus & Malware','Parches & Updates','Riesgos & CVEs','Consejos & Tips','Audio & Drivers','Errores & Bugs','Kernel & Syscalls','Redes & Firewall','Cifrado & Crypto','Contenedores & Docker','Virtualización','Scripting & Bash','Compiladores','Bases de Datos','Privacidad','Hardware','Distros & Releases','Open Source','Inteligencia Artificial'];

const customTagInput = ref('');
const toggleTag      = t => { const i=selectedTags.value.indexOf(t); i===-1?selectedTags.value.push(t):selectedTags.value.splice(i,1); };
const addCustomTag   = () => { const tag=customTagInput.value.trim().toLowerCase().replace(/\s+/g,'_'); if(!tag||selectedTags.value.includes(tag)){customTagInput.value='';return;} selectedTags.value.push(tag); customTagInput.value=''; };
const removeTag      = t => { selectedTags.value=selectedTags.value.filter(x=>x!==t); };

// ══════════════════════════════════════════════════════════════════
//  TOOLBAR MARKDOWN
// ══════════════════════════════════════════════════════════════════
const MD_TOOLS = [
  {label:'B',title:'Negrita',wrap:['**','**']},{label:'I',title:'Cursiva',wrap:['*','*']},
  {label:'~~S~~',title:'Tachado',wrap:['~~','~~']},{label:'`code`',title:'Código inline',wrap:['`','`']},
  {label:'H1',title:'Heading 1',prefix:'# '},{label:'H2',title:'Heading 2',prefix:'## '},{label:'H3',title:'Heading 3',prefix:'### '},
  {label:'---',title:'Separador',insert:'\n---\n'},{label:'• Lista',title:'Lista',prefix:'- '},
  {label:'1. Lista',title:'Lista numerada',prefix:'1. '},{label:'> Cita',title:'Cita',prefix:'> '},
  {label:'```bloque',title:'Bloque código',wrap:['```\n','\n```']},
  {label:'🔗 Link',title:'Link',special:'link'},{label:'🖼 Imagen',title:'Imagen',special:'img'},
];
const applyTool = (tool) => {
  const ta=editorRef.value; if(!ta)return;
  const s=ta.selectionStart,e=ta.selectionEnd,sel=content.value.slice(s,e);
  let v=content.value,cur=s;
  if(tool.wrap){const[b,a]=tool.wrap;v=v.slice(0,s)+b+sel+a+v.slice(e);cur=s+b.length+sel.length+a.length;}
  else if(tool.prefix){const ls=v.lastIndexOf('\n',s-1)+1;v=v.slice(0,ls)+tool.prefix+v.slice(ls);cur=s+tool.prefix.length;}
  else if(tool.insert){v=v.slice(0,s)+tool.insert+v.slice(e);cur=s+tool.insert.length;}
  else if(tool.special==='link'){const ins=`[${sel||'texto'}](url)`;v=v.slice(0,s)+ins+v.slice(e);cur=s+ins.length;}
  else if(tool.special==='img'){const ins=`![alt](url)`;v=v.slice(0,s)+ins+v.slice(e);cur=s+ins.length;}
  content.value=v;
  nextTick(()=>{ta.focus();ta.setSelectionRange(cur,cur);});
};

// ══════════════════════════════════════════════════════════════════
//  TUXPIT / TUX SOMBRERO
// ══════════════════════════════════════════════════════════════════
const tuxpitVisible = ref(false);
const tuxpitTimer   = ref(null);
const onContentInput = () => {
  if(content.value.length===1){
    tuxpitVisible.value=true; clearTimeout(tuxpitTimer.value);
    tuxpitTimer.value=setTimeout(()=>{tuxpitVisible.value=false;},7000);
  }
};
const dismissTuxpit = () => { tuxpitVisible.value=false; clearTimeout(tuxpitTimer.value); };

const tuxImg      = ref('/tux.png');
const tuxClickado = ref(false);
const tuxSombrero = () => {
  if(tuxClickado.value)return;
  tuxClickado.value=true; tuxImg.value='/tuxsobrero.gif';
  setTimeout(()=>{tuxImg.value='/tux.png';tuxClickado.value=false;},2000);
};

// ══════════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════════
const canPublish  = computed(()=>title.value.trim()&&content.value.trim()&&selectedCategory.value);
const outputHtml  = computed(()=>marked(content.value,{gfm:true,breaks:true}));
const isOwner     = (post)=>user.value&&(user.value.uid===post.authorUid||user.value.displayName===post.author);
const formatDate  = ts=>{if(!ts)return'';const d=ts.toDate?ts.toDate():new Date(ts);return d.toLocaleDateString('es-CL',{day:'2-digit',month:'short',year:'numeric'});};
</script>

<template>
  <div class="shell">
    <!-- ═══════════ SIDEBAR ═══════════ -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <img :src="tuxImg" alt="Tux" class="tux-logo" @click="tuxSombrero"/>
        <span class="brand-name">TuxTimes</span>
        <span class="brand-badge">GPLv2</span>
      </div>

      <nav class="sidebar-nav">
        <button class="nav-item" :class="{active:view==='feed'&&navStack.length===1}" @click="view='feed';resetNav()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Reciente
        </button>
        <button v-if="user" class="nav-item" :class="{active:view==='new-post'&&!editingPost}" @click="cancelEdit();view='new-post'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Nuevo Tuxpost
        </button>
        <button v-if="user" class="nav-item" :class="{active:view==='myposts'}" @click="view='myposts';resetNav()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>Mis Tuxposts
        </button>
        <button v-if="user" class="nav-item" :class="{active:view==='favorites'}" @click="view='favorites';resetNav()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Favoritos
        </button>
      </nav>

      <!-- Categorías -->
      <div class="sidebar-section">
        <p class="sidebar-label">Categorías</p>
        <button v-for="cat in CATEGORIES" :key="cat" class="cat-pill"
          :class="{active:activeCategories.includes(cat)}"
          @click="goToCategory(cat)">{{ cat }}</button>
      </div>

      <!-- Footer usuario -->
      <div class="sidebar-footer">
        <template v-if="user">
          <div class="sidebar-footer-user" @click="openSettings" title="Configuración">
            <img :src="getUserAvatar(user.photoURL)" class="avatar" :alt="user.displayName"/>
            <div class="user-info">
              <span class="user-name">{{ user.displayName }}</span>
              <span class="user-email">{{ user.email }}</span>
            </div>
            <svg class="settings-icon-small" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <button @click="logout" class="logout-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Tuxsalir
          </button>
        </template>
        <button v-else @click="showAuthModal=true" class="login-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>Iniciar sesión
        </button>
      </div>
    </aside>

    <!-- ═══════════ MAIN ═══════════ -->
    <main class="main">
      <transition name="slide" mode="out-in">

        <!-- FEED / MIS POSTS / FAVORITOS — misma barra de búsqueda unificada -->
        <section v-if="view==='feed'||view==='favorites'||view==='myposts'" :key="view" class="feed-section">
          <!-- Barra de búsqueda unificada -->
          <div class="search-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="searchQuery" class="search-input"
              :placeholder="view==='feed'?'Buscar… #tag, nombre, tema (prueba: windows 😏)':view==='favorites'?'Buscar en favoritos…':'Buscar en mis Tuxposts…'"
            />
            <button v-if="hasActiveFilters" @click="clearAllFilters" class="clear-all-btn" title="Limpiar todos los filtros">✕ todo</button>
          </div>

          <!-- Tags de filtros activos (categorías seleccionadas como chips padre) -->
          <div v-if="activeCategories.length || searchQuery" class="active-filters-row">
            <!-- Chip padre que agrupa todas las categorías -->
            <div v-if="activeCategories.length" class="filter-parent-chip">
              <span class="filter-parent-label">📂 Temas</span>
              <span v-for="cat in activeCategories" :key="cat" class="filter-child-chip">
                {{ cat }}<button @click="toggleCategoryFilter(cat)" class="chip-x">×</button>
              </span>
              <button @click="activeCategories=[]" class="chip-x-all" title="Quitar todos los temas">✕</button>
            </div>
            <span v-if="searchQuery" class="filter-text-chip">
              🔍 "{{ searchQuery }}"<button @click="searchQuery=''" class="chip-x">×</button>
            </span>
          </div>

          <!-- Título de sección -->
          <div class="posts-count">
            <span v-if="view==='feed'">
              {{ filteredPosts.length }} Tuxpost{{ filteredPosts.length!==1?'s':'' }}
            </span>
            <span v-else-if="view==='favorites'">
              ⭐ {{ favoritePosts.length }} favorito{{ favoritePosts.length!==1?'s':'' }}
            </span>
            <span v-else>
              ✏️ {{ myPosts.length }} Tuxpost{{ myPosts.length!==1?'s':'' }} míos
            </span>
          </div>

          <!-- Grid de posts -->
          <div class="posts-grid">
            <template v-for="post in (view==='feed'?filteredPosts:view==='favorites'?favoritePosts:myPosts)" :key="post.id">
              <article class="post-card" @click="openPost(post)">
                <div class="post-card-header">
                  <span class="post-category-tag">{{ post.category }}</span>
                  <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                </div>
                <h2 class="post-title">{{ post.title }}</h2>
                <div class="post-content" v-html="marked(post.content)"></div>
                <footer class="post-footer">
                  <div class="post-author" @click.stop="openAuthor(post,$event)">
                    <img :src="getUserAvatar(post.authorPhoto)" class="author-avatar"/>
                    <span class="author-link">{{ post.author }}</span>
                  </div>
                  <div class="post-actions-row">
                    <button v-if="user&&!isOwner(post)" class="star-btn" :class="{starred:hasStarred(post)}" @click.stop="toggleStar(post,$event)">⭐ {{ starCount(post) }}</button>
                    <span v-else class="star-count-only">⭐ {{ starCount(post) }}</span>
                    <template v-if="isOwner(post)">
                      <button class="edit-btn" @click.stop="startEdit(post,$event)">✏️</button>
                      <button class="delete-btn" @click.stop="askDeletePost(post,$event)">🗑</button>
                    </template>
                  </div>
                </footer>
                <div v-if="post.tags?.length" class="post-tags">
                  <span v-for="tag in post.tags" :key="tag" class="tag" @click.stop="searchQuery='#'+tag">#{{ tag }}</span>
                </div>
              </article>
            </template>
            <div v-if="(view==='feed'?filteredPosts:view==='favorites'?favoritePosts:myPosts).length===0" class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <p v-if="view==='favorites'">Aún no tienes favoritos 🐧<br><small>Dale ⭐ a los Tuxposts que te gusten</small></p>
              <p v-else-if="view==='myposts'">Aún no has publicado nada 🐧</p>
              <p v-else>Sin resultados 🐧</p>
            </div>
          </div>
        </section>

        <!-- EDITOR -->
        <section v-else-if="view==='new-post'" key="editor" class="editor-section">
          <h2 class="editor-title">{{ editingPost?'✏️ Editar Tuxpost':'✍️ Redactar Tuxpost' }}</h2>
          <div style="position:relative">
            <input v-model="title" class="title-input" placeholder="Título del Tuxpost…" @input="onTitleInput"/>
            <transition name="tuxpit-pop">
              <div v-if="titleError" class="title-error">⚠️ {{ titleError }}</div>
            </transition>
          </div>

          <div class="field-group">
            <label class="field-label">Categoría <span class="required">*</span></label>
            <div class="category-grid">
              <button v-for="cat in CATEGORIES" :key="cat" class="cat-select-btn" :class="{selected:selectedCategory===cat}" @click="selectedCategory=cat">{{ cat }}</button>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Tags</label>
            <div v-if="selectedTags.length" class="selected-tags-row">
              <span v-for="tag in selectedTags" :key="tag" class="selected-tag">#{{ tag }}<button @click="removeTag(tag)" class="remove-tag">×</button></span>
            </div>
            <div class="tags-row">
              <button v-for="tag in POPULAR_TAGS" :key="tag" class="tag-select-btn" :class="{selected:selectedTags.includes(tag)}" @click="toggleTag(tag)">#{{ tag }}</button>
            </div>
            <div class="custom-tag-row">
              <input v-model="customTagInput" class="custom-tag-input" placeholder="+ Tag personalizado…" @keydown.enter.prevent="addCustomTag" maxlength="30"/>
              <button @click="addCustomTag" class="add-tag-btn">Añadir</button>
            </div>
          </div>

          <div class="md-toolbar">
            <button v-for="tool in MD_TOOLS" :key="tool.label" class="md-tool-btn" :title="tool.title" @mousedown.prevent="applyTool(tool)">{{ tool.label }}</button>
          </div>

          <div class="split">
            <div class="split-panel">
              <div class="split-label">Markdown</div>
              <textarea ref="editorRef" v-model="content" class="editor-textarea" placeholder="Escribe tu Tuxpost en Markdown…" @input="onContentInput" spellcheck="false"></textarea>
            </div>
            <div class="split-panel">
              <div class="split-label">Preview</div>
              <div class="preview-panel" v-html="outputHtml"></div>
            </div>
          </div>

          <div class="editor-actions">
            <button class="cancel-btn" @click="cancelEdit">Cancelar</button>
            <button class="publish-btn" :disabled="!canPublish" @click="publish">{{ editingPost?'💾 Guardar':'🐧 Tuxtear!' }}</button>
          </div>

          <!-- TUXPIT -->
          <transition name="tuxpit-pop">
            <div v-if="tuxpitVisible" class="tuxpit">
              <div class="tuxpit-bubble">
                <p>Parece que estás escribiendo un Tuxpost...</p>
                <p>¿Quieres que te ayude? 🐧</p>
                <div class="tuxpit-btns">
                  <button class="tuxpit-yes">Sí</button>
                  <button class="tuxpit-no" @click="dismissTuxpit">No gracias</button>
                </div>
              </div>
              <img src="/tuxpc.gif" alt="Tuxpit" class="tuxpit-img"/>
            </div>
          </transition>
        </section>

        <!-- CONFIGURACIÓN -->
        <section v-else-if="view==='settings'" key="settings" class="settings-section">
          <h2 class="editor-title">⚙️ Configuración de Tuxcuenta</h2>
          <div class="settings-card">
            <div class="settings-avatar-section">
              <div class="settings-avatar-wrap">
                <img :src="settingsAvatarPreview||'/tux.png'" class="settings-avatar-big" alt="Avatar"/>
                <label class="avatar-change-btn" title="Cambiar avatar">
                  📷<input type="file" accept="image/*" style="display:none" @change="onAvatarChange"/>
                </label>
              </div>
              <div>
                <div class="settings-real-name">{{ user?.displayName }}</div>
                <div class="settings-email-dim">{{ user?.email }}</div>
                <div class="settings-note">Haz clic en 📷 para cambiar tu avatar 🐧</div>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Tuxnick (apodo)</label>
              <input v-model="settingsNickname" class="settings-input" placeholder="Tu apodo en TuxTimes…" maxlength="30"/>
              <small class="field-hint">Si lo tienes, reemplaza tu nombre real en la plataforma</small>
            </div>

            <div class="field-group">
              <label class="field-label">URL personalizada</label>
              <div class="url-input-wrap">
                <span class="url-prefix">tuxtimes.tux/</span>
                <input v-model="settingsCustomUrl" class="url-input" placeholder="tu-nombre" maxlength="30"/>
              </div>
              <small class="field-hint">Solo letras, números y guiones</small>
            </div>

            <div class="field-group">
              <label class="field-label">Bio / Descripción</label>
              <textarea v-model="settingsBio" class="settings-bio-input" placeholder="Cuéntale a la comunidad quién eres… 🐧" maxlength="300" rows="4"></textarea>
              <span class="char-count">{{ settingsBio.length }}/300</span>
            </div>

            <div class="field-group">
              <label class="field-label">Privacidad</label>
              <div class="privacy-options">
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-title">Ocultar correo electrónico</span>
                    <span class="toggle-desc">Tu email no será visible en tu perfil público</span>
                  </div>
                  <div class="toggle-switch" :class="{on:settingsHideEmail}" @click="settingsHideEmail=!settingsHideEmail"><div class="toggle-knob"></div></div>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-title">Ocultar nombre real</span>
                    <span class="toggle-desc">Solo se mostrará tu Tuxnick (debes tener uno)</span>
                  </div>
                  <div class="toggle-switch" :class="{on:settingsHideName}" @click="settingsHideName=!settingsHideName"><div class="toggle-knob"></div></div>
                </div>
              </div>
            </div>

            <div class="editor-actions">
              <button class="cancel-btn" @click="view='feed'">Cancelar</button>
              <button class="publish-btn" :disabled="settingsSaving" @click="saveSettings">{{ settingsSaving?'Guardando…':'💾 Guardar' }}</button>
            </div>
          </div>
        </section>

      </transition>
    </main>

    <!-- ═══════ OVERLAYS ═══════ -->
    <transition name="expand">
      <div v-if="showOverlay" class="modal-overlay" @click.self="closeOverlay">

        <!-- Breadcrumb -->
        <div class="breadcrumb" v-if="navStack.length>2">
          <template v-for="(entry,i) in navStack.slice(1,-1)" :key="i">
            <button class="breadcrumb-btn" @click="navStack.splice(i+2)">
              {{ entry.type==='post'?(entry.data.title.length>22?entry.data.title.slice(0,22)+'…':entry.data.title):(entry.data?.profile?.nickname||entry.data?.profile?.displayName) }}
            </button>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </template>
        </div>

        <!-- POST EXPANDIDO -->
        <transition name="inner-slide" mode="out-in">
          <div v-if="currentNav.type==='post'" :key="'post-'+currentNav.data.id" class="modal-post">
            <div class="modal-top-bar">
              <button v-if="navStack.length>2" class="back-btn" @click="closeOverlay">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>Volver
              </button>
              <div style="flex:1"></div>
              <button class="modal-close" @click="closeOverlay">×</button>
            </div>

            <div class="modal-post-header">
              <span class="post-category-tag">{{ currentNav.data.category }}</span>
              <span class="post-date">{{ formatDate(currentNav.data.createdAt) }}</span>
            </div>
            <h1 class="modal-post-title">{{ currentNav.data.title }}</h1>
            <div class="modal-post-content" v-html="marked(currentNav.data.content)"></div>

            <div v-if="currentNav.data.tags?.length" class="modal-post-tags">
              <span v-for="tag in currentNav.data.tags" :key="tag" class="tag" @click="searchQuery='#'+tag;closeOverlay()">#{{ tag }}</span>
            </div>

            <footer class="modal-post-footer">
              <div class="post-author" @click="openAuthor(currentNav.data,$event)">
                <img :src="getUserAvatar(currentNav.data.authorPhoto)" class="author-avatar"/>
                <span class="author-link">{{ currentNav.data.author }}</span>
              </div>
              <div class="post-actions-row">
                <button v-if="user&&!isOwner(currentNav.data)" class="star-btn" :class="{starred:hasStarred(currentNav.data)}" @click.stop="toggleStar(currentNav.data,$event)">⭐ {{ starCount(currentNav.data) }}</button>
                <span v-else class="star-count-only">⭐ {{ starCount(currentNav.data) }}</span>
                <template v-if="isOwner(currentNav.data)">
                  <button class="edit-btn" @click.stop="startEdit(currentNav.data,$event)">✏️ Editar</button>
                  <button class="delete-btn" @click.stop="askDeletePost(currentNav.data,$event)">🗑 Borrar</button>
                </template>
              </div>
            </footer>

            <!-- COMENTARIOS -->
            <div class="comments-section">
              <div class="comments-title">💬 Comentarios ({{ (commentsByPost[currentNav.data.id]||[]).length }})</div>
              <div v-if="user" class="comment-input-wrap">
                <img :src="getUserAvatar(user.photoURL)" class="comment-avatar"/>
                <div class="comment-input-col">
                  <textarea :id="`comment-input-${currentNav.data.id}`"
                    v-model="commentInput[currentNav.data.id]"
                    class="comment-textarea"
                    :placeholder="replyingTo[currentNav.data.id]?'↩ Respondiendo… (Ctrl+Enter para enviar)':'Escribe un comentario… (Ctrl+Enter para enviar)'"
                    rows="2"
                    @keydown.ctrl.enter.prevent="sendComment(currentNav.data.id,replyingTo[currentNav.data.id])">
                  </textarea>
                  <div class="comment-input-actions">
                    <span v-if="replyingTo[currentNav.data.id]" class="reply-indicator">
                      ↩ Respondiendo <button @click="replyingTo[currentNav.data.id]=null" class="cancel-reply">×</button>
                    </span>
                    <button class="comment-send-btn" @click="sendComment(currentNav.data.id,replyingTo[currentNav.data.id])">Tuxomentar</button>
                  </div>
                </div>
              </div>
              <div v-else class="comment-login-prompt">
                <button class="login-btn" style="width:auto;padding:8px 20px" @click="showAuthModal=true">Inicia sesión para comentar 🐧</button>
              </div>

              <!-- Árbol de comentarios — componente inline recursivo -->
              <div class="comment-tree">
                <comment-node
                  v-for="c in commentTree(currentNav.data.id)"
                  :key="c.id"
                  :comment="c"
                  :post-id="currentNav.data.id"
                  :user="user"
                  :comment-input="commentInput"
                  :replying-to="replyingTo"
                  :depth="0"
                  :get-avatar="getUserAvatar"
                  @reply="setReply"
                  @send="sendComment"
                />
              </div>
            </div>
          </div>
        </transition>

        <!-- PERFIL AUTOR -->
        <transition name="inner-slide" mode="out-in">
          <div v-if="currentNav.type==='author'" :key="'author-'+(currentNav.data.profile.uid||currentNav.data.profile.displayName)" class="modal-author">
            <div class="modal-top-bar">
              <button v-if="navStack.length>2" class="back-btn" @click="closeOverlay">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>Volver
              </button>
              <div style="flex:1"></div>
              <button class="modal-close" @click="closeOverlay">×</button>
            </div>

            <div class="author-hero">
              <img :src="currentNav.data.profile.avatarB64||currentNav.data.profile.photoURL||'/tux.png'" class="author-hero-img"/>
              <div class="author-hero-info">
                <h2 class="author-hero-name">
                  {{ currentNav.data.profile.nickname||(currentNav.data.profile.hideName?'Anónimo 🐧':currentNav.data.profile.displayName) }}
                  <span v-if="currentNav.data.profile.nickname&&!currentNav.data.profile.hideName" class="author-real">(@{{ currentNav.data.profile.displayName }})</span>
                </h2>
                <div v-if="currentNav.data.profile.customUrl" class="author-url">🔗 tuxtimes.tux/{{ currentNav.data.profile.customUrl }}</div>
                <div v-if="!currentNav.data.profile.hideEmail&&currentNav.data.profile.email" class="author-email-pub">✉️ {{ currentNav.data.profile.email }}</div>
                <div class="author-stars-total">⭐ {{ currentNav.data.posts.reduce((a,p)=>a+(p.stars?.length||0),0) }} estrellas · {{ currentNav.data.posts.length }} Tuxposts</div>
                <p v-if="currentNav.data.profile.bio" class="author-bio">{{ currentNav.data.profile.bio }}</p>
                <p v-else class="author-bio muted">Sin descripción aún.</p>
              </div>
            </div>

            <div class="author-posts-label">Tuxposts de {{ currentNav.data.profile.nickname||currentNav.data.profile.displayName }}</div>
            <div class="author-posts-grid">
              <article v-for="p in currentNav.data.posts" :key="p.id" class="author-post-mini" @click="openPost(p)">
                <div class="author-post-mini-cat">{{ p.category }}</div>
                <div class="author-post-mini-title">{{ p.title }}</div>
                <div class="author-post-mini-stars">⭐ {{ starCount(p) }}</div>
              </article>
              <div v-if="!currentNav.data.posts.length" class="empty-state" style="padding:40px 0;grid-column:1/-1"><p>Sin Tuxposts aún 🐧</p></div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- ═══════ MODAL AUTH ═══════ -->
    <transition name="expand">
      <div v-if="showAuthModal" class="modal-overlay" @click.self="showAuthModal=false">
        <div class="auth-modal">
          <div class="modal-top-bar"><div style="flex:1"></div><button class="modal-close" @click="showAuthModal=false">×</button></div>
          <img src="/tux.png" class="auth-tux" alt="Tux"/>
          <h2 class="auth-title">{{ authMode==='login'?'Tuxcesso 🐧':'Registro 🐧' }}</h2>
          <div class="auth-tabs">
            <button :class="{active:authMode==='login'}" @click="authMode='login';authError=''">Iniciar sesión</button>
            <button :class="{active:authMode==='register'}" @click="authMode='register';authError=''">Registrarse</button>
          </div>
          <div v-if="authError" class="auth-error">{{ authError }}</div>
          <div class="auth-form">
            <input v-if="authMode==='register'" v-model="authName" class="auth-input" placeholder="Tu nombre…" @keydown.enter="registerEmail"/>
            <input v-model="authEmail" class="auth-input" type="email" placeholder="Correo electrónico…" @keydown.enter="authMode==='login'?loginEmail():registerEmail()"/>
            <input v-model="authPassword" class="auth-input" type="password" placeholder="Contraseña…" @keydown.enter="authMode==='login'?loginEmail():registerEmail()"/>
            <button class="publish-btn" style="width:100%;justify-content:center" :disabled="authLoading" @click="authMode==='login'?loginEmail():registerEmail()">
              {{ authLoading?'Cargando…':(authMode==='login'?'Entrar':'Crear cuenta') }}
            </button>
          </div>
          <div class="auth-separator"><span>o</span></div>
          <button class="google-btn" @click="loginGoogle">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuar con Google
          </button>
        </div>
      </div>
    </transition>

    <!-- ═══════ MODAL BORRAR ═══════ -->
    <transition name="expand">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal=false">
        <div class="delete-modal">
          <div class="delete-modal-icon">🗑️</div>
          <h2 class="delete-modal-title">¿Seguro que quieres borrar?</h2>
          <p class="delete-modal-desc">Esta acción es <strong>irreversible</strong>. Escribe exactamente el título para confirmar:</p>
          <div class="delete-modal-target">{{ deleteTarget?.title }}</div>
          <input v-model="deleteConfirmTxt" class="auth-input" placeholder="Escribe el título aquí…" @keydown.enter="confirmDeletePost"/>
          <div class="delete-modal-actions">
            <button class="cancel-btn" @click="showDeleteModal=false">Cancelar</button>
            <button class="delete-confirm-btn" :disabled="!deleteCanDelete" @click="confirmDeletePost">🗑 Borrar para siempre</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ═══════ EASTER EGG WINDOWS ═══════ -->
    <transition name="tuxpit-pop">
      <div v-if="showWindowsEgg" class="windows-egg-overlay" @click="showWindowsEgg=false">
        <div class="windows-egg-box" @click.stop>
          <div class="windows-egg-icon">🪟💥🐧</div>
          <h2 class="windows-egg-title">ERROR 404</h2>
          <p class="windows-egg-sub">WINDOWS OS no soportado</p>
          <p class="windows-egg-msg">¡USA MUCHA RAM y sabrás si viste esto!</p>
          <div class="windows-egg-bsod">:: KERNEL_PANIC ::<br>at 0x0000TUXTIME<br>RAM usage: 97%<br>Process: explorer.exe (CRASHED)</div>
          <button class="publish-btn" @click="showWindowsEgg=false;searchQuery=''">Usar Linux en cambio 🐧</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#app{height:100%}
body{overflow:hidden;background:#080b10}

:root{
  --sidebar-w:260px;--bg:#080b10;--surface:#0f1318;--surface2:#161c25;
  --border:#1e2633;--accent:#3b82f6;--accent-dim:rgba(59,130,246,.15);
  --yellow:#eab308;--red:#ef4444;--text:#e2e8f0;--muted:#64748b;--radius:14px;
  font-family:'JetBrains Mono','Fira Code',monospace;color:var(--text)
}
.shell{display:flex;height:100vh;width:100vw;overflow:hidden}

/* ── SIDEBAR ─── */
.sidebar{width:var(--sidebar-w);min-width:var(--sidebar-w);background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;padding-bottom:20px}
.sidebar-brand{display:flex;flex-direction:column;align-items:center;padding:28px 16px 20px;border-bottom:1px solid var(--border);gap:6px}
.tux-logo{width:72px;height:72px;object-fit:contain;cursor:pointer;filter:drop-shadow(0 0 16px rgba(59,130,246,.4));transition:transform .3s}
.tux-logo:hover{transform:rotate(-8deg) scale(1.08)}
.brand-name{font-size:1.25rem;font-weight:800;letter-spacing:-.5px;color:#fff}
.brand-badge{font-size:.6rem;background:var(--accent);color:#fff;padding:2px 8px;border-radius:100px}
.sidebar-nav{display:flex;flex-direction:column;gap:4px;padding:16px 12px;border-bottom:1px solid var(--border)}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border:none;background:transparent;color:var(--muted);border-radius:10px;cursor:pointer;font-size:.875rem;font-weight:600;text-align:left;transition:all .15s;font-family:inherit;white-space:nowrap}
.nav-item:hover{background:var(--surface2);color:var(--text)}
.nav-item.active{background:var(--accent-dim);color:var(--accent)}
.sidebar-section{padding:14px 12px;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:5px}
.sidebar-label{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:4px}
.cat-pill{padding:6px 10px;border:1px solid transparent;background:transparent;color:var(--muted);border-radius:8px;cursor:pointer;font-size:.75rem;text-align:left;transition:all .15s;font-family:inherit;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cat-pill:hover{background:var(--surface2);color:var(--text)}
.cat-pill.active{background:var(--accent-dim);color:var(--accent);border-color:rgba(59,130,246,.3)}
.sidebar-footer{margin-top:auto;padding:14px 12px 0;display:flex;flex-direction:column;gap:10px;border-top:1px solid var(--border)}
.sidebar-footer-user{display:flex;align-items:center;gap:10px;cursor:pointer;padding:6px 8px;border-radius:10px;transition:background .15s}
.sidebar-footer-user:hover{background:var(--surface2)}
.settings-icon-small{color:var(--muted);margin-left:auto;flex-shrink:0}
.avatar{width:36px;height:36px;border-radius:50%;border:2px solid var(--accent);flex-shrink:0;object-fit:cover}
.user-info{display:flex;flex-direction:column;min-width:0;flex:1}
.user-name{font-size:.8rem;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-email{font-size:.65rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.login-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:10px 14px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;transition:filter .15s}
.login-btn:hover{filter:brightness(1.15)}
.logout-btn{display:flex;align-items:center;gap:8px;width:100%;padding:10px 14px;background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.25);border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s}
.logout-btn:hover{background:rgba(239,68,68,.22);border-color:rgba(239,68,68,.5)}

/* ── MAIN ─── */
.main{flex:1;overflow-y:auto;background:var(--bg)}
.feed-section{padding:28px 32px}

/* ── BARRA BÚSQUEDA ─── */
.search-bar{display:flex;align-items:center;gap:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:12px 18px;margin-bottom:12px}
.search-bar svg{color:var(--muted);flex-shrink:0}
.search-input{flex:1;background:transparent;border:none;outline:none;color:var(--text);font-size:.95rem;font-family:inherit}
.search-input::placeholder{color:var(--muted)}
.clear-all-btn{padding:4px 10px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.25);color:#f87171;border-radius:8px;cursor:pointer;font-size:.72rem;font-weight:700;font-family:inherit;white-space:nowrap;transition:all .15s}
.clear-all-btn:hover{background:rgba(239,68,68,.22)}

/* ── FILTROS ACTIVOS ─── */
.active-filters-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;align-items:center}
.filter-parent-chip{display:flex;align-items:center;flex-wrap:wrap;gap:6px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:6px 10px}
.filter-parent-label{font-size:.7rem;font-weight:700;color:var(--muted);margin-right:2px}
.filter-child-chip{display:flex;align-items:center;gap:4px;background:var(--accent-dim);color:var(--accent);padding:3px 8px;border-radius:100px;font-size:.72rem;font-weight:700}
.chip-x{background:none;border:none;color:var(--accent);cursor:pointer;font-size:.85rem;line-height:1;padding:0;margin-left:2px}
.chip-x-all{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.25);color:#f87171;border-radius:6px;cursor:pointer;font-size:.72rem;padding:2px 7px;margin-left:4px;font-family:inherit}
.filter-text-chip{display:flex;align-items:center;gap:4px;background:var(--surface2);color:var(--text);padding:4px 10px;border-radius:8px;font-size:.75rem;border:1px solid var(--border)}

.posts-count{font-size:.8rem;color:var(--muted);margin-bottom:20px}

/* ── GRID POSTS ─── */
.posts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:20px}
.post-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:22px;display:flex;flex-direction:column;gap:12px;transition:border-color .2s,transform .2s,box-shadow .2s;cursor:pointer}
.post-card:hover{border-color:rgba(59,130,246,.45);transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.3)}
.post-card-header{display:flex;align-items:center;justify-content:space-between}
.post-category-tag{background:var(--accent-dim);color:var(--accent);font-size:.7rem;font-weight:700;padding:4px 10px;border-radius:100px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60%}
.post-date{font-size:.72rem;color:var(--muted)}
.post-title{font-size:1.1rem;font-weight:800;color:#fff;line-height:1.3}
.post-content{font-size:.85rem;line-height:1.6;color:var(--muted);max-height:90px;overflow:hidden;mask-image:linear-gradient(to bottom,black 40%,transparent)}
.post-content h1,.post-content h2,.post-content h3{color:var(--text);margin:.3em 0}
.post-content code{background:var(--surface2);padding:1px 5px;border-radius:4px;font-size:.85em}
.post-content pre{background:var(--surface2);padding:10px;border-radius:6px}
.post-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;border-top:1px solid var(--border);padding-top:10px;margin-top:auto}
.post-author{display:flex;align-items:center;gap:8px;font-size:.78rem;color:var(--text);font-weight:600;cursor:pointer}
.author-link{transition:color .15s}
.post-author:hover .author-link{color:var(--accent)}
.author-avatar{width:28px;height:28px;border-radius:50%;object-fit:cover;border:1px solid var(--border)}
.post-actions-row{display:flex;align-items:center;gap:6px}
.star-btn{display:flex;align-items:center;gap:4px;padding:4px 10px;border:1px solid var(--border);background:transparent;color:var(--muted);border-radius:8px;cursor:pointer;font-size:.75rem;font-family:inherit;transition:all .15s}
.star-btn:hover{border-color:var(--yellow);color:var(--yellow)}
.star-btn.starred{background:rgba(234,179,8,.12);border-color:var(--yellow);color:var(--yellow)}
.star-count-only{font-size:.75rem;color:var(--muted)}
.edit-btn{padding:4px 10px;border:1px solid var(--border);background:transparent;color:var(--muted);border-radius:8px;cursor:pointer;font-size:.72rem;font-family:inherit;transition:all .15s}
.edit-btn:hover{border-color:var(--accent);color:var(--accent)}
.delete-btn{padding:4px 10px;border:1px solid transparent;background:transparent;color:var(--muted);border-radius:8px;cursor:pointer;font-size:.72rem;font-family:inherit;transition:all .15s}
.delete-btn:hover{border-color:var(--red);color:var(--red)}
.post-tags{display:flex;gap:6px;flex-wrap:wrap}
.tag{font-size:.7rem;color:var(--muted);cursor:pointer;transition:color .15s}
.tag:hover{color:var(--accent)}
.empty-state{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:16px;padding:80px 0;color:var(--muted);font-size:1rem;text-align:center;line-height:1.6}

/* ── EDITOR ─── */
.editor-section{padding:28px 32px;position:relative}
.editor-title{font-size:1.5rem;font-weight:800;margin-bottom:24px;color:#fff}
.title-input{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:#fff;padding:14px 18px;font-size:1.4rem;font-weight:700;font-family:inherit;outline:none;margin-bottom:4px;transition:border-color .2s;display:block}
.title-input:focus{border-color:var(--accent)}
.title-input::placeholder{color:var(--muted)}
.title-error{color:#f87171;font-size:.78rem;margin-bottom:12px}
.field-group{margin-bottom:20px}
.field-label{display:block;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:10px}
.required{color:var(--red)}
.category-grid{display:flex;flex-wrap:wrap;gap:8px}
.cat-select-btn{padding:8px 16px;border:1px solid var(--border);background:var(--surface);color:var(--muted);border-radius:100px;cursor:pointer;font-size:.8rem;font-weight:600;font-family:inherit;transition:all .15s}
.cat-select-btn:hover{border-color:var(--accent);color:var(--text)}
.cat-select-btn.selected{background:var(--accent);border-color:var(--accent);color:#fff}
.selected-tags-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.selected-tag{display:flex;align-items:center;gap:4px;background:var(--accent-dim);color:var(--accent);padding:4px 10px;border-radius:100px;font-size:.75rem;font-weight:700}
.remove-tag{background:none;border:none;color:var(--accent);cursor:pointer;font-size:.9rem;line-height:1;padding:0}
.tags-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
.tag-select-btn{padding:6px 14px;border:1px solid var(--border);background:transparent;color:var(--muted);border-radius:8px;cursor:pointer;font-size:.78rem;font-family:inherit;transition:all .15s}
.tag-select-btn:hover{color:var(--text);border-color:var(--muted)}
.tag-select-btn.selected{background:var(--accent-dim);border-color:var(--accent);color:var(--accent)}
.custom-tag-row{display:flex;gap:8px;align-items:center}
.custom-tag-input{flex:1;max-width:220px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);padding:7px 12px;font-size:.8rem;font-family:inherit;outline:none;transition:border-color .2s}
.custom-tag-input:focus{border-color:var(--accent)}
.custom-tag-input::placeholder{color:var(--muted)}
.add-tag-btn{padding:7px 14px;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:8px;cursor:pointer;font-size:.78rem;font-weight:700;font-family:inherit;transition:all .15s}
.add-tag-btn:hover{border-color:var(--accent);color:var(--accent)}
.md-toolbar{display:flex;flex-wrap:wrap;gap:4px;background:var(--surface2);border:1px solid var(--border);border-radius:10px 10px 0 0;padding:8px 10px;border-bottom:none}
.md-tool-btn{padding:6px 11px;background:transparent;border:1px solid transparent;color:var(--muted);border-radius:6px;cursor:pointer;font-size:.78rem;font-weight:700;font-family:inherit;transition:all .12s;user-select:none}
.md-tool-btn:hover{background:var(--surface);border-color:var(--border);color:var(--text)}
.md-tool-btn:active{background:var(--accent-dim);color:var(--accent)}
.split{display:grid;grid-template-columns:1fr 1fr;gap:16px;height:calc(100vh - 500px);min-height:320px;margin-bottom:20px}
.split-panel{display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:0 0 var(--radius) var(--radius);overflow:hidden}
.split-label{padding:10px 16px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);border-bottom:1px solid var(--border);background:var(--surface2)}
.editor-textarea{flex:1;background:transparent;border:none;outline:none;padding:20px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:.92rem;line-height:1.75;resize:none}
.preview-panel{flex:1;padding:20px;overflow-y:auto;text-align:left;font-size:.92rem;line-height:1.75;color:var(--text)}
.preview-panel h1,.preview-panel h2,.preview-panel h3{color:#fff;margin:.5em 0 .3em}
.preview-panel code{background:var(--surface2);padding:2px 6px;border-radius:4px}
.preview-panel pre{background:var(--surface2);padding:14px;border-radius:8px;overflow-x:auto}
.preview-panel a{color:var(--accent)}
.editor-actions{display:flex;justify-content:flex-end;gap:12px}
.cancel-btn{padding:12px 24px;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:10px;cursor:pointer;font-size:.9rem;font-family:inherit;font-weight:600}
.publish-btn{padding:12px 32px;background:var(--accent);border:none;color:#fff;border-radius:10px;cursor:pointer;font-size:.9rem;font-family:inherit;font-weight:700;transition:filter .15s,opacity .15s;display:inline-flex;align-items:center;gap:8px}
.publish-btn:disabled{opacity:.4;cursor:not-allowed}
.publish-btn:not(:disabled):hover{filter:brightness(1.15)}

/* ── SETTINGS ─── */
.settings-section{padding:28px 32px}
.settings-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:28px;max-width:620px}
.settings-avatar-section{display:flex;align-items:center;gap:20px;margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid var(--border)}
.settings-avatar-wrap{position:relative;flex-shrink:0}
.settings-avatar-big{width:80px;height:80px;border-radius:50%;border:3px solid var(--accent);object-fit:cover}
.avatar-change-btn{position:absolute;bottom:0;right:0;background:var(--accent);color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.75rem;border:2px solid var(--bg)}
.settings-real-name{font-size:1.1rem;font-weight:800;color:#fff}
.settings-email-dim{font-size:.75rem;color:var(--muted);margin-top:2px}
.settings-note{font-size:.72rem;color:var(--muted);margin-top:6px;font-style:italic}
.settings-input{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:12px 16px;font-size:.95rem;font-family:inherit;outline:none;transition:border-color .2s}
.settings-input:focus{border-color:var(--accent)}
.settings-input::placeholder{color:var(--muted)}
.url-input-wrap{display:flex;align-items:center;background:var(--surface2);border:1px solid var(--border);border-radius:10px;overflow:hidden;transition:border-color .2s}
.url-input-wrap:focus-within{border-color:var(--accent)}
.url-prefix{padding:12px 14px;font-size:.85rem;color:var(--muted);white-space:nowrap;border-right:1px solid var(--border)}
.url-input{flex:1;background:transparent;border:none;outline:none;padding:12px 14px;color:var(--text);font-size:.9rem;font-family:inherit}
.field-hint{font-size:.7rem;color:var(--muted);margin-top:6px;display:block}
.settings-bio-input{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:12px 16px;font-size:.9rem;font-family:inherit;outline:none;resize:vertical;transition:border-color .2s;line-height:1.6}
.settings-bio-input:focus{border-color:var(--accent)}
.settings-bio-input::placeholder{color:var(--muted)}
.char-count{font-size:.7rem;color:var(--muted);display:block;text-align:right;margin-top:4px}
.privacy-options{display:flex;flex-direction:column;gap:12px}
.toggle-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 16px;background:var(--surface2);border:1px solid var(--border);border-radius:10px}
.toggle-info{display:flex;flex-direction:column;gap:3px}
.toggle-title{font-size:.85rem;font-weight:700;color:var(--text)}
.toggle-desc{font-size:.72rem;color:var(--muted)}
.toggle-switch{width:44px;height:24px;background:var(--border);border-radius:100px;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0}
.toggle-switch.on{background:var(--accent)}
.toggle-knob{position:absolute;top:3px;left:3px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .2s}
.toggle-switch.on .toggle-knob{transform:translateX(20px)}

/* ── OVERLAY ─── */
.modal-overlay{position:fixed;inset:0 0 0 var(--sidebar-w);background:rgba(8,11,16,.88);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:500;padding:24px}
.breadcrumb{position:absolute;top:16px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:100px;padding:6px 14px;font-size:.72rem;color:var(--muted);z-index:10;white-space:nowrap}
.breadcrumb-btn{background:none;border:none;color:var(--accent);cursor:pointer;font-size:.72rem;font-family:inherit}
.modal-top-bar{display:flex;align-items:center;margin-bottom:20px}
.back-btn{display:flex;align-items:center;gap:6px;background:var(--surface2);border:1px solid var(--border);color:var(--muted);padding:7px 14px;border-radius:8px;cursor:pointer;font-size:.78rem;font-family:inherit;transition:all .15s}
.back-btn:hover{border-color:var(--accent);color:var(--accent)}
.modal-close{background:var(--surface2);border:1px solid var(--border);color:var(--muted);width:36px;height:36px;border-radius:50%;font-size:1.4rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.modal-close:hover{background:rgba(239,68,68,.15);border-color:var(--red);color:var(--red)}
.modal-post{background:var(--surface);border:1px solid var(--border);border-radius:20px;width:100%;max-width:820px;max-height:92vh;overflow-y:auto;padding:36px 44px;position:relative}
.modal-post-header{display:flex;align-items:center;gap:14px;margin-bottom:14px}
.modal-post-title{font-size:1.9rem;font-weight:800;color:#fff;line-height:1.25;margin-bottom:24px}
.modal-post-content{font-size:.95rem;line-height:1.8;color:var(--text)}
.modal-post-content h1,.modal-post-content h2,.modal-post-content h3{color:#fff;margin:1em 0 .4em}
.modal-post-content code{background:var(--surface2);padding:2px 8px;border-radius:5px;font-size:.9em}
.modal-post-content pre{background:var(--surface2);padding:18px;border-radius:10px;overflow-x:auto;margin:16px 0}
.modal-post-content blockquote{border-left:3px solid var(--accent);padding-left:16px;color:var(--muted);margin:16px 0}
.modal-post-content a{color:var(--accent)}
.modal-post-content img{max-width:100%;border-radius:10px;margin:12px 0}
.modal-post-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:28px;padding-top:20px;border-top:1px solid var(--border)}
.modal-post-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)}

/* ── COMENTARIOS ─── */
.comments-section{margin-top:36px;padding-top:28px;border-top:1px solid var(--border)}
.comments-title{font-size:1rem;font-weight:800;color:#fff;margin-bottom:20px}
.comment-input-wrap{display:flex;gap:12px;margin-bottom:24px}
.comment-avatar{width:32px;height:32px;border-radius:50%;flex-shrink:0;border:2px solid var(--accent);object-fit:cover}
.comment-input-col{flex:1;display:flex;flex-direction:column;gap:8px}
.comment-textarea{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:10px 14px;font-size:.85rem;font-family:inherit;outline:none;resize:vertical;min-height:70px;transition:border-color .2s;line-height:1.5}
.comment-textarea:focus{border-color:var(--accent)}
.comment-textarea::placeholder{color:var(--muted)}
.comment-input-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px}
.reply-indicator{font-size:.75rem;color:var(--accent);display:flex;align-items:center;gap:6px}
.cancel-reply{background:none;border:none;color:var(--accent);cursor:pointer;font-size:1rem;line-height:1;padding:0}
.comment-send-btn{padding:7px 18px;background:var(--accent);border:none;color:#fff;border-radius:8px;cursor:pointer;font-size:.8rem;font-weight:700;font-family:inherit;transition:filter .15s}
.comment-send-btn:hover{filter:brightness(1.15)}
.comment-login-prompt{margin-bottom:20px}
.comment-tree{display:flex;flex-direction:column;gap:8px}
.comment-node{margin-bottom:2px}
.comment-bubble{background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:12px 16px;margin-bottom:6px}
.comment-header{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.comment-avatar-sm{width:22px;height:22px;border-radius:50%;object-fit:cover}
.comment-author{font-size:.78rem;font-weight:700;color:var(--text)}
.comment-date{font-size:.68rem;color:var(--muted);margin-left:auto}
.comment-text{font-size:.85rem;line-height:1.5;color:var(--text)}
.reply-btn{margin-top:8px;background:none;border:none;color:var(--muted);cursor:pointer;font-size:.72rem;font-family:inherit;transition:color .15s;padding:0}
.reply-btn:hover{color:var(--accent)}

/* ── PERFIL AUTOR ─── */
.modal-author{background:var(--surface);border:1px solid var(--border);border-radius:20px;width:100%;max-width:860px;max-height:92vh;overflow-y:auto;padding:36px 44px;position:relative}
.author-hero{display:flex;align-items:flex-start;gap:24px;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid var(--border)}
.author-hero-img{width:96px;height:96px;border-radius:50%;border:4px solid var(--accent);flex-shrink:0;object-fit:cover;filter:drop-shadow(0 0 20px rgba(59,130,246,.3))}
.author-hero-info{flex:1}
.author-hero-name{font-size:1.5rem;font-weight:800;color:#fff;margin-bottom:6px}
.author-real{font-size:.85rem;color:var(--muted);font-weight:400}
.author-url{font-size:.78rem;color:var(--accent);margin-bottom:6px}
.author-email-pub{font-size:.78rem;color:var(--muted);margin-bottom:6px}
.author-stars-total{font-size:.95rem;color:var(--yellow);margin-bottom:10px;font-weight:700}
.author-bio{font-size:.9rem;line-height:1.6;color:var(--text)}
.author-bio.muted{color:var(--muted);font-style:italic}
.author-posts-label{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:14px}
.author-posts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
.author-post-mini{background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:18px;cursor:pointer;transition:all .15s;display:flex;flex-direction:column;gap:10px;min-height:110px}
.author-post-mini:hover{border-color:rgba(59,130,246,.4);transform:translateY(-2px)}
.author-post-mini-cat{font-size:.65rem;font-weight:700;color:var(--accent)}
.author-post-mini-title{font-size:.88rem;font-weight:700;color:#fff;line-height:1.35;flex:1}
.author-post-mini-stars{font-size:.75rem;color:var(--yellow)}

/* ── AUTH MODAL ─── */
.auth-modal{background:var(--surface);border:1px solid var(--border);border-radius:20px;width:100%;max-width:400px;padding:32px;display:flex;flex-direction:column;gap:16px}
.auth-tux{width:56px;height:56px;margin:0 auto;object-fit:contain}
.auth-title{font-size:1.4rem;font-weight:800;color:#fff;text-align:center}
.auth-tabs{display:flex;background:var(--surface2);border-radius:10px;padding:4px;gap:4px}
.auth-tabs button{flex:1;padding:8px;border:none;background:transparent;color:var(--muted);border-radius:8px;cursor:pointer;font-size:.82rem;font-weight:600;font-family:inherit;transition:all .15s}
.auth-tabs button.active{background:var(--accent);color:#fff}
.auth-error{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);color:#f87171;border-radius:8px;padding:10px 14px;font-size:.82rem}
.auth-form{display:flex;flex-direction:column;gap:10px}
.auth-input{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:12px 16px;font-size:.9rem;font-family:inherit;outline:none;transition:border-color .2s}
.auth-input:focus{border-color:var(--accent)}
.auth-input::placeholder{color:var(--muted)}
.auth-separator{display:flex;align-items:center;gap:12px;color:var(--muted);font-size:.78rem}
.auth-separator::before,.auth-separator::after{content:'';flex:1;height:1px;background:var(--border)}
.google-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:11px 20px;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:10px;cursor:pointer;font-size:.85rem;font-weight:600;font-family:inherit;transition:all .15s}
.google-btn:hover{border-color:var(--accent);background:var(--accent-dim)}

/* ── DELETE MODAL ─── */
.delete-modal{background:var(--surface);border:1px solid rgba(239,68,68,.4);border-radius:20px;width:100%;max-width:460px;padding:32px;display:flex;flex-direction:column;gap:16px;text-align:center}
.delete-modal-icon{font-size:3rem}
.delete-modal-title{font-size:1.3rem;font-weight:800;color:#fff}
.delete-modal-desc{font-size:.88rem;color:var(--muted);line-height:1.6}
.delete-modal-desc strong{color:var(--red)}
.delete-modal-target{background:var(--surface2);border:1px dashed rgba(239,68,68,.4);border-radius:8px;padding:10px 16px;font-size:.88rem;color:#f87171;font-weight:700;word-break:break-all}
.delete-modal-actions{display:flex;gap:12px;justify-content:flex-end}
.delete-confirm-btn{padding:10px 24px;background:var(--red);border:none;color:#fff;border-radius:10px;cursor:pointer;font-size:.88rem;font-weight:700;font-family:inherit;transition:filter .15s,opacity .15s}
.delete-confirm-btn:disabled{opacity:.35;cursor:not-allowed}
.delete-confirm-btn:not(:disabled):hover{filter:brightness(1.15)}

/* ── WINDOWS EGG ─── */
.windows-egg-overlay{position:fixed;inset:0 0 0 var(--sidebar-w);background:rgba(0,0,200,.9);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:900;cursor:pointer;font-family:monospace}
.windows-egg-box{background:#000080;border:4px solid #c0c0c0;border-radius:4px;padding:36px 40px;max-width:500px;text-align:center;display:flex;flex-direction:column;gap:14px;cursor:default;box-shadow:inset -2px -2px 0 #808080,inset 2px 2px 0 #dfdfdf}
.windows-egg-icon{font-size:2.5rem}
.windows-egg-title{font-size:2rem;font-weight:900;color:#fff;letter-spacing:2px;text-shadow:2px 2px 0 #000}
.windows-egg-sub{font-size:1rem;color:#ff0;font-weight:700}
.windows-egg-msg{font-size:.9rem;color:#c0c0c0}
.windows-egg-bsod{background:#000;color:#aaa;font-size:.72rem;padding:12px;border-radius:4px;text-align:left;font-family:monospace;line-height:1.7;border:1px solid #333}

/* ── TUXPIT ─── */
.tuxpit{position:fixed;bottom:28px;right:28px;display:flex;align-items:flex-end;gap:10px;z-index:999}
.tuxpit-img{width:72px;height:72px;object-fit:contain;filter:drop-shadow(0 4px 20px rgba(59,130,246,.5));animation:bounce .55s ease infinite alternate;flex-shrink:0}
@keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-7px)}}
.tuxpit-bubble{background:var(--surface2);border:1px solid var(--accent);border-radius:14px 14px 0 14px;padding:14px 16px;max-width:210px;font-size:.82rem;line-height:1.55;color:var(--text);box-shadow:0 8px 32px rgba(59,130,246,.25)}
.tuxpit-bubble p{margin-bottom:6px}
.tuxpit-btns{display:flex;gap:8px;margin-top:10px}
.tuxpit-yes{padding:5px 14px;background:var(--accent);border:none;color:#fff;border-radius:8px;cursor:pointer;font-size:.78rem;font-weight:700;font-family:inherit}
.tuxpit-no{padding:5px 14px;background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:8px;cursor:pointer;font-size:.78rem;font-family:inherit;transition:all .15s}
.tuxpit-no:hover{border-color:var(--muted);color:var(--text)}

/* ── TRANSITIONS ─── */
.slide-enter-active,.slide-leave-active{transition:all .25s ease}
.slide-enter-from{opacity:0;transform:translateX(16px)}
.slide-leave-to{opacity:0;transform:translateX(-16px)}
.expand-enter-active{transition:opacity .3s ease}
.expand-leave-active{transition:opacity .2s ease}
.expand-enter-from,.expand-leave-to{opacity:0}
.inner-slide-enter-active{transition:all .25s cubic-bezier(.34,1.2,.64,1)}
.inner-slide-leave-active{transition:all .18s ease}
.inner-slide-enter-from{opacity:0;transform:translateX(30px) scale(.97)}
.inner-slide-leave-to{opacity:0;transform:translateX(-20px)}
.tuxpit-pop-enter-active{transition:all .35s cubic-bezier(.34,1.56,.64,1)}
.tuxpit-pop-leave-active{transition:all .2s ease}
.tuxpit-pop-enter-from,.tuxpit-pop-leave-to{opacity:0;transform:translateY(24px) scale(.8)}

/* ── SCROLLBAR ─── */
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:10px}
::-webkit-scrollbar-thumb:hover{background:var(--accent)}

/* ── RESPONSIVE ─── */
@media(max-width:768px){
  .shell{flex-direction:column}
  .sidebar{width:100%;min-width:unset;flex-direction:row;flex-wrap:wrap;height:auto}
  .sidebar-section{display:none}
  .main{flex:1}
  .feed-section,.editor-section,.settings-section{padding:16px}
  .posts-grid{grid-template-columns:1fr}
  .split{grid-template-columns:1fr;height:auto}
  .modal-overlay{inset:0}
  .modal-post,.modal-author{padding:20px 16px}
}
</style>