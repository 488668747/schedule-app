import test from 'node:test'
import assert from 'node:assert/strict'
import { countImages, isLocalImage, noteDocument, validateRichText } from './richText.js'
import { createBackup, parseBackup } from './backup.js'

const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aH0kAAAAASUVORK5CYII='
const document = { type: 'doc', content: [
  { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '验收说明', marks: [{ type: 'bold' }] }] },
  { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '支持图文查看' }] }] }] },
  { type: 'image', attrs: { src: image, alt: '需求截图', title: null } }
] }

test('旧版纯文字备注按文字显示，不会解释其中的 HTML', () => {
  const doc = noteDocument({ note: '<script>alert(1)</script>\n第二行' })
  assert.equal(doc.content[0].content[0].text, '<script>alert(1)</script>')
  assert.equal(doc.content[1].content[0].text, '第二行')
})

test('图文备份保留格式和内嵌图片，换设备无需外部链接', () => {
  const projects = [{ id: 'p', name: '项目', short: '项', color: '#5578e7' }]
  const tasks = [{ id: 't', projectId: 'p', title: '图文需求', note: '验收说明', noteDoc: document, start: '2026-11-01', end: '2026-11-02', status: 'todo', priority: 'high' }]
  const restored = parseBackup(createBackup(projects, tasks))
  assert.deepEqual(restored.tasks[0].noteDoc, document)
  assert.equal(countImages(restored.tasks[0].noteDoc), 1)
  assert.ok(isLocalImage(image))
})

test('兼容旧版 v1 纯文字备份，导入时备注保持原样', () => {
  const backup = { app: 'rhythm-schedule', version: 1, exportedAt: '2026-11-01T00:00:00Z', projects: [{ id: 'p', name: '项目', short: '项', color: '#5578e7' }], tasks: [{ id: 't', projectId: 'p', title: '需求', note: '旧文字', start: '2026-11-01', end: '2026-11-02', status: 'todo', priority: 'high' }] }
  assert.equal(parseBackup(JSON.stringify(backup)).tasks[0].note, '旧文字')
})

test('拒绝脚本节点、危险链接、SVG、外部图片和超限图片', () => {
  for (const node of [
    { type: 'script' },
    { type: 'paragraph', content: [{ type: 'text', text: 'x', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }] },
    { type: 'image', attrs: { src: 'https://example.com/image.png' } },
    { type: 'image', attrs: { src: 'data:image/svg+xml;base64,PHN2Zz4=' } },
    { type: 'image', attrs: { src: image + 'A'.repeat(3 * 1024 * 1024) } }
  ]) assert.throws(() => validateRichText({ type: 'doc', content: [node] }))
})

test('只保留支持的文档属性，避免导入事件处理器', () => {
  const doc = structuredClone(document)
  doc.content[2].attrs.onerror = 'alert(1)'
  assert.deepEqual(validateRichText(doc), document)
})

test('拒绝错误的层级结构和过深文档', () => {
  assert.throws(() => validateRichText({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'image', attrs: { src: image } }] }] }))
  let node = { type: 'paragraph' }
  for (let i = 0; i < 40; i++) node = { type: 'blockquote', content: [node] }
  assert.throws(() => validateRichText({ type: 'doc', content: [node] }))
})
