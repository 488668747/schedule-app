import React, { useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Icon from './Icon'
import { compressImage, isLocalImage } from '../utils/richText'

const extensions = [StarterKit.configure({ link: false, underline: false, heading: { levels: [2, 3] } }), Image.configure({ allowBase64: true })]

export default function RichTextEditor({ document, onChange, onImageBusy, readOnly = false }) {
  const fileRef = useRef(null)
  const insertRef = useRef(null)
  const pending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const editor = useEditor({
    extensions,
    content: document,
    editable: !readOnly,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor }) => onChange?.(editor.getJSON(), editor.getText()),
    editorProps: {
      attributes: { class: 'rich-content', role: readOnly ? 'document' : 'textbox', 'aria-label': '需求描述', 'aria-multiline': 'true' },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files || [])
        if (!readOnly && files.length) { event.preventDefault(); insertRef.current(files); return true }
        return false
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files || [])
        if (!readOnly && files.length) {
          event.preventDefault()
          const position = view.posAtCoords({ left: event.clientX, top: event.clientY })
          if (position) editor?.commands.setTextSelection(position.pos)
          insertRef.current(files)
          return true
        }
        return false
      },
      transformPastedHTML: (html) => {
        const parsed = new DOMParser().parseFromString(html, 'text/html')
        parsed.querySelectorAll('img').forEach(image => {
          if (!isLocalImage(image.getAttribute('src'))) image.replaceWith(parsed.createTextNode('[图片请使用上传或截图粘贴]'))
        })
        return parsed.body.innerHTML
      }
    }
  })

  insertRef.current = async (files) => {
    if (pending.current || !editor || editor.isDestroyed) return
    pending.current = true
    setBusy(true)
    onImageBusy?.(true)
    setError('')
    try {
      for (const file of files) {
        const source = await compressImage(file)
        if (editor.isDestroyed) return
        editor.chain().focus().setImage({ src: source, alt: file.name || '需求截图' }).run()
      }
    } catch (error) {
      setError(error.message)
    } finally {
      pending.current = false
      setBusy(false)
      onImageBusy?.(false)
    }
  }

  if (!editor) return null
  const controls = [
    ['粗体', 'B', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run()],
    ['斜体', 'I', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run()],
    ['二级标题', 'H2', editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run()],
    ['无序列表', '• 列表', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run()],
    ['有序列表', '1. 列表', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run()],
    ['引用', '引用', editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run()],
    ['代码块', '</>', editor.isActive('codeBlock'), () => editor.chain().focus().toggleCodeBlock().run()]
  ]
  return <div className={`rich-editor ${readOnly ? 'read-only' : ''}`}>
    {!readOnly && <div className="rich-toolbar" role="toolbar" aria-label="文字格式">
      {controls.map(([label, text, active, action]) => <button type="button" key={label} aria-label={label} title={label} aria-pressed={active} disabled={busy} onClick={action}>{text}</button>)}
      <button type="button" disabled={busy} onClick={() => fileRef.current.click()}><Icon name="image" size={16} />{busy ? '处理图片中…' : '插入图片'}</button>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden aria-label="上传需求图片" onChange={event => { insertRef.current(Array.from(event.target.files)); event.target.value = '' }} />
      <button type="button" aria-label="撤销" disabled={busy || !editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>撤销</button>
      <button type="button" aria-label="重做" disabled={busy || !editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>重做</button>
    </div>}
    <EditorContent editor={editor} />
    {!readOnly && <p className="rich-hint">支持截图粘贴、拖入或上传图片；图片自动压缩，最长边 1600px。选中图片后按删除键可移除。</p>}
    {error && <p className="editor-error" role="alert">{error}</p>}
  </div>
}
