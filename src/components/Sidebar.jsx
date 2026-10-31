import React from 'react'
import Icon from './Icon'

export default function Sidebar({ projects, selectedProject, onSelectProject, taskCounts, onAddTask }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Icon name="spark" size={20} /></div>
        <div><strong>节奏</strong><span>RHYTHM</span></div>
      </div>

      <nav className="main-nav" aria-label="主导航">
        <button className="nav-item active"><Icon name="grid" /><span>排期总览</span></button>
        <button className="nav-item"><Icon name="calendar" /><span>我的日历</span><span className="nav-soon">即将上线</span></button>
      </nav>

      <div className="sidebar-section">
        <div className="section-label"><span>我的项目</span><button className="icon-button tiny" onClick={onAddTask} aria-label="新增需求"><Icon name="plus" size={16} /></button></div>
        <div className="project-list">
          <button className={`project-item ${selectedProject === 'all' ? 'selected' : ''}`} onClick={() => onSelectProject('all')}>
            <span className="project-dot all-dot"><Icon name="grid" size={13} /></span><span>全部需求</span><em>{taskCounts.all}</em>
          </button>
          {projects.map((project) => (
            <button key={project.id} className={`project-item ${selectedProject === project.id ? 'selected' : ''}`} onClick={() => onSelectProject(project.id)}>
              <span className="project-dot" style={{ background: project.color }}>{project.short.slice(0, 1)}</span><span>{project.name}</span><em>{taskCounts[project.id] || 0}</em>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="tip-card"><div className="tip-icon"><Icon name="spark" size={15} /></div><div><strong>保持节奏</strong><p>把想法放进日程，专注当下。</p></div></div>
        <div className="profile"><div className="avatar">Y</div><div><strong>你自己</strong><span>前端开发</span></div><Icon name="more" size={17} className="profile-more" /></div>
      </div>
    </aside>
  )
}
