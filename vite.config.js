import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // 1. Desactivamos el "mangling" (el proceso que cambia nombres de variables a letras aleatorias)
    minify: 'terser',
    terserOptions: {
      mangle: false, // 👈 ¡AQUÍ ESTÁ LA MAGIA! Mantiene tus nombres de funciones y variables intactos
      compress: {
        drop_console: false, // Mantiene tus console.log si los necesitas para debuguear en producción
        dead_code: true,     // Elimina código muerto que no uses para optimizar peso
      },
      format: {
        beautify: true,      // 👈 Si quieres que el código final tenga saltos de línea y sea 100% legible
        comments: 'all'      // Preserva tus comentarios épicos (¡como el de React Router llorando!)
      }
    },
    // 2. Opcional: Si quieres quitarle el hash aleatorio a los nombres de tus archivos generados
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
