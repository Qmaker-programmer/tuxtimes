<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  comment:      { type: Object,   required: true },
  postId:       { type: String,   required: true },
  user:         { type: Object,   default: null  },
  commentInput: { type: Object,   required: true },
  replyingTo:   { type: Object,   required: true },
  depth:        { type: Number,   default: 0     },
  getAvatar:    { type: Function, required: true },
})

// Unificado: Usamos 'edit' para guardar el cambio y 'delete' para abrir el modal
const emit = defineEmits(['reply', 'send', 'edit', 'delete', 'open-author'])

const isEditing = ref(false)
const editText = ref(props.comment.text)

const fmt = (ts) => {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
}

const nodeStyle = computed(() => ({
  marginLeft: `${Math.min(props.depth, 5) * 18}px`,
  borderLeft: props.depth > 0 ? '2px solid var(--border)' : 'none',
  paddingLeft: props.depth > 0 ? '12px' : '0'
}))

const startEdit = () => {
  editText.value = props.comment.text
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  editText.value = props.comment.text
}

const saveEdit = () => {
  if (!editText.value.trim() || editText.value.trim() === props.comment.text) {
    isEditing.value = false
    return
  }
  emit('edit', props.postId, props.comment.id, editText.value.trim())
  isEditing.value = false
}
</script>

<template>
  <div class="comment-node" :style="nodeStyle">
    <div class="comment-bubble">
      <div class="comment-header">
        <img v-if="comment?.authorPhoto" :src="getAvatar(comment.authorPhoto)" class="comment-avatar-sm"/>
        <span v-else style="font-size:18px">🐧</span>
        
        <span class="comment-author" style="cursor: pointer;" @click="emit('open-author', comment, $event)"> {{ comment?.author || 'Pingüino Anónimo' }} </span>
        
        <span class="comment-date">
          {{ fmt(comment?.createdAt) }} 
          <span v-if="comment?.editedAt" style="font-size: 10px; opacity: 0.6; font-style: italic;">(editado)</span>
        </span>
      </div>

      <div v-if="isEditing" class="comment-edit-container" style="margin-top: 6px;">
        <textarea 
          v-model="editText" 
          class="auth-input" 
          style="width: 100%; min-height: 60px; resize: vertical; margin-bottom: 6px; font-family: inherit; font-size: 14px;"
          @keydown.enter.prevent="saveEdit"
        ></textarea>
        <div style="display: flex; gap: 8px;">
          <button @click="saveEdit" style="background: #2ecc71; border: none; color: white; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">Aceptar</button>
          <button @click="cancelEdit" style="background: #7f8c8d; border: none; color: white; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">Cancelar</button>
        </div>
      </div>

      <div v-else class="comment-text">{{ comment?.text || '[Este comentario fue eliminado]' }}</div>
      
      <div v-if="!isEditing" class="comment-actions" style="display: flex; gap: 10px; margin-top: 6px;">
        <button v-if="user && !comment?.isDeleted" class="reply-btn" @click="emit('reply', postId, comment.id)">
          ↩ Responder
        </button>

        <template v-if="user && comment?.authorUid && comment.authorUid === user.uid">
          <span style="color: var(--border)">|</span>
          <button @click="startEdit" style="background:none; border:none; color:#3498db; cursor:pointer; font-size:12px; padding:0;">
            ✏️ Editar
          </button>
          <button @click="emit('delete', postId, comment.id, comment.text)" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:12px; padding:0;">
            🗑️ Borrar
          </button>
        </template>
      </div>
    </div>

    <CommentNode
      v-for="child in comment?.children || []" 
      :key="child.id"
      :comment="child"
      :post-id="postId"
      :user="user"
      :comment-input="commentInput"
      :replying-to="replyingTo"
      :depth="depth + 1"
      :get-avatar="getAvatar"
      @reply="(pId, cId) => emit('reply', pId, cId)"
      @send="(pId, text, rId) => emit('send', pId, text, rId)"
      @edit="(pId, cId, txt) => emit('edit', pId, cId, txt)"
      @delete="(pId, cId, txt) => emit('delete', pId, cId, txt)"
      @open-author="(commentData, ev) => emit('open-author', commentData, ev)" 
    />
  </div>
</template>