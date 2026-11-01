export const MAX_IMAGE_BYTES = 2 * 1024 * 1024
export const MAX_IMAGE_INPUT_BYTES = 20 * 1024 * 1024

const blocks = ['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote', 'codeBlock', 'horizontalRule', 'image']
const children = {
  doc: blocks, paragraph: ['text', 'hardBreak'], heading: ['text', 'hardBreak'],
  bulletList: ['listItem'], orderedList: ['listItem'], listItem: blocks,
  blockquote: blocks, codeBlock: ['text']
}
const markTypes = ['bold', 'italic', 'strike', 'code']

export function isLocalImage(source) {
  if (typeof source !== 'string' || source.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 40) return false
  const match = source.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/)
  if (!match || match[2].length % 4 !== 0) return false
  const size = match[2].length * 3 / 4 - (match[2].endsWith('==') ? 2 : match[2].endsWith('=') ? 1 : 0)
  if (size > MAX_IMAGE_BYTES) return false
  const header = atob(match[2].slice(0, 24))
  return (match[1] === 'png' && header.startsWith('\x89PNG\r\n\x1a\n')) ||
    (match[1] === 'jpeg' && header.startsWith('\xff\xd8\xff')) ||
    (match[1] === 'webp' && header.startsWith('RIFF') && header.slice(8, 12) === 'WEBP')
}

export function validateRichText(document) {
  let count = 0
  const invalid = () => { throw new Error('需求描述格式无效，请使用应用导出的图文备份。') }
  const visit = (node, depth = 0) => {
    if (++count > 10000 || depth > 32 || !node || typeof node !== 'object' || Array.isArray(node)) invalid()
    const type = node.type
    if (![...blocks, 'doc', 'listItem', 'text', 'hardBreak'].includes(type)) invalid()
    const result = { type }
    if (type === 'text') {
      if (typeof node.text !== 'string' || !node.text.length) invalid()
      result.text = node.text
      if (node.marks !== undefined) {
        if (!Array.isArray(node.marks)) invalid()
        result.marks = node.marks.map(mark => {
          if (!mark || !markTypes.includes(mark.type)) invalid()
          return { type: mark.type }
        })
      }
    }
    if (type === 'heading') {
      if (![2, 3].includes(node.attrs?.level)) invalid()
      result.attrs = { level: node.attrs.level }
    }
    if (type === 'orderedList') {
      const start = node.attrs?.start ?? 1
      if (!Number.isSafeInteger(start) || start < 1) invalid()
      result.attrs = { start }
    }
    if (type === 'codeBlock') result.attrs = { language: null }
    if (type === 'image') {
      if (!isLocalImage(node.attrs?.src)) throw new Error('描述中的图片无效：仅支持内嵌 PNG、JPEG、WebP 图片，每张不超过 2 MB。')
      result.attrs = { src: node.attrs.src, alt: typeof node.attrs.alt === 'string' ? node.attrs.alt.slice(0, 500) : null, title: typeof node.attrs.title === 'string' ? node.attrs.title.slice(0, 500) : null }
    }
    if (node.content !== undefined) {
      if (!Array.isArray(node.content) || !children[type]) invalid()
      result.content = node.content.map(child => {
        if (!children[type].includes(child?.type)) invalid()
        return visit(child, depth + 1)
      })
    }
    if (['bulletList', 'orderedList', 'listItem'].includes(type) && !result.content?.length) invalid()
    if (type === 'listItem' && result.content[0].type !== 'paragraph') invalid()
    return result
  }
  if (document?.type !== 'doc') invalid()
  return visit(document)
}

export function noteDocument(task) {
  if (task.noteDoc) return validateRichText(task.noteDoc)
  return { type: 'doc', content: (task.note || '').split('\n').map(line => ({ type: 'paragraph', ...(line ? { content: [{ type: 'text', text: line }] } : {}) })) }
}

export function countImages(document) {
  if (!document) return 0
  return (document.type === 'image' ? 1 : 0) + (document.content || []).reduce((sum, child) => sum + countImages(child), 0)
}

export async function compressImage(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('请选择 PNG、JPEG 或 WebP 图片。')
  if (file.size > MAX_IMAGE_INPUT_BYTES) throw new Error('原图不能超过 20 MB，请先缩小图片。')
  let bitmap
  try {
    bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('无法处理图片，请重试。')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const source = canvas.toDataURL('image/webp', 0.85)
    if (!isLocalImage(source)) throw new Error('图片压缩后仍超过 2 MB，请缩小后重试。')
    return source
  } catch (error) {
    throw new Error(error.message.includes('2 MB') ? error.message : '图片无法读取，请选择有效的 PNG、JPEG 或 WebP 文件。')
  } finally {
    bitmap?.close()
  }
}
