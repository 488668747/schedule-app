import React from 'react'
import Icon from './Icon'

const cards = [
  { key: 'total', label: '本月需求', icon: 'layout', accent: 'blue', suffix: ' 个' },
  { key: 'progress', label: '进行中', icon: 'clock', accent: 'orange', suffix: ' 个' },
  { key: 'upcoming', label: '即将到期', icon: 'arrowUp', accent: 'purple', suffix: ' 个', helper: '未来 7 天' },
  { key: 'done', label: '已完成', icon: 'check', accent: 'green', suffix: ' 个' }
]

export default function Stats({ stats }) {
  return <section className="stats-grid" aria-label="需求统计">
    {cards.map((card) => (
      <article className="stat-card" key={card.key}>
        <div className={`stat-icon ${card.accent}`}><Icon name={card.icon} size={17} /></div>
        <div className="stat-label">{card.label}{card.helper && <span>{card.helper}</span>}</div>
        <div className="stat-value">{stats[card.key]}<small>{card.suffix}</small></div>
      </article>
    ))}
  </section>
}
