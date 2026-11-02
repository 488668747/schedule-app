import React from 'react'
import Icon from './Icon'
import { getProject, getStatus } from '../data'
import { formatMonth, getMonthDays, taskInMonth, taskPosition } from '../utils/date'

export default function Timeline({ tasks, projects, month, today, onMonthChange, onEdit, onAddTask }) {
  const days = getMonthDays(month)
  const visibleTasks = tasks.filter((task) => taskInMonth(task, month))

  return <section className="timeline-card">
    <div className="timeline-heading">
      <div><p className="eyebrow">MONTHLY PLAN</p><h2>需求排期</h2></div>
      <div className="timeline-actions">
        <div className="month-switcher"><button className="icon-button" onClick={() => onMonthChange(-1)} aria-label="上个月"><Icon name="chevronLeft" size={17} /></button><strong>{formatMonth(month)}</strong><button className="icon-button" onClick={() => onMonthChange(1)} aria-label="下个月"><Icon name="chevronRight" size={17} /></button></div>
        <button className="outline-button" onClick={onAddTask}><Icon name="plus" size={15} />新增需求</button>
      </div>
    </div>
    <div className="timeline-scroll">
      <div className="timeline-grid" style={{ '--day-count': days.length }}>
        <div className="timeline-label header-label">任务 / 日期</div>
        <div className="day-header">{days.map((day) => <div key={day.date} className={`day-cell ${day.weekday === '周六' || day.weekday === '周日' ? 'weekend' : ''} ${day.date === today ? 'today' : ''}`}><span>{day.day}</span><small>{day.weekday.replace('周', '')}</small></div>)}</div>
        {visibleTasks.length === 0 && <div className="timeline-empty"><Icon name="calendar" size={20} /><span>这个月还没有安排，添加一个需求开始吧。</span><button className="text-button" onClick={onAddTask}>添加需求</button></div>}
        {visibleTasks.map((task) => {
          const project = getProject(task.projectId, projects)
          const status = getStatus(task.status)
          const position = taskPosition(task, month)
          return <React.Fragment key={task.id}>
            <button className="timeline-label task-label" onClick={() => onEdit(task)}><span className="task-color" style={{ background: project.color }}></span><span className="task-name">{task.title}</span><small>{project.name}</small></button>
            <div className="task-track" style={{ '--task-color': project.color }}>
              <div className={`task-bar status-${task.status}`} style={{ gridColumn: `${position.start} / span ${position.span}` }} onClick={() => onEdit(task)} title={`${task.title} · ${status.label}`}><span>{task.title}</span><em>{status.label}</em></div>
            </div>
          </React.Fragment>
        })}
      </div>
    </div>
    <div className="timeline-legend"><span><i className="legend-dot blue"></i>进行中</span><span><i className="legend-dot purple"></i>待评审</span><span><i className="legend-dot gray"></i>待开始</span><span><i className="legend-dot green"></i>已完成</span></div>
  </section>
}
