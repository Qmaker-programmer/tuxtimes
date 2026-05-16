<script setup>
import { computed } from 'vue'

// 1. Recibimos los mismos parámetros exactos que pasas en tu App.vue
const props = defineProps({
  comment:      { type: Object,   required: true },
  postId:       { type: String,   required: true },
  user:         { type: Object,   default: null  },
  commentInput: { type: Object,   required: true },
  replyingTo:   { type: Object,   required: true },
  depth:        { type: Number,   default: 0     },
  getAvatar:    { type: Function, required: true },
})

// 2. Declaramos los eventos personalizados que devolverán la acción a App.vue
const emit = defineEmits(['reply', 'send'])

// 3. Tu lógica original para dar formato regional a las marcas de tiempo de Firebase
const fmt = (ts) => {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
}

// 4. Tus estilos matemáticos inline que identan visualmente las respuestas en cascada
const nodeStyle = computed(() => ({
  marginLeft: `${Math.min(props.depth, 5) * 18}px`,
  borderLeft: props.depth > 0 ? '2px solid var(--border)' : 'none',
  paddingLeft: props.depth > 0 ? '12px' : '0'
}))
</script>

<template>
  <div class="comment-node" :style="nodeStyle">
    <div class="comment-bubble">
      <div class="comment-header">
        <img v-if="comment.authorPhoto" :src="getAvatar(comment.authorPhoto)" class="comment-avatar-sm"/>
        <span v-else style="font-size:18px">🐧</span>
        <span class="comment-author">{{ comment.author }}</span>
        <span class="comment-date">{{ fmt(comment.createdAt) }}</span>
      </div>
      <div class="comment-text">{{ comment.text }}</div>
      
      <button v-if="user" class="reply-btn" @click="emit('reply', postId, comment.id)">
        ↩ Responder
      </button>
    </div>

    <CommentNode
      v-for="child in comment.children" 
      :key="child.id"
      :comment="child" 
      :post-id="postId" 
      :user="user"
      :comment-input="commentInput" 
      :replying-to="replyingTo"
      :depth="depth + 1" 
      :get-avatar="getAvatar"
      @reply="(pid, cid) => emit('reply', pid, cid)"
      @send="(pid, par) => emit('send', pid, par)"
    />
  </div>
</template>