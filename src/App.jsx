import React, { useEffect, useMemo, useState } from 'react'
import Icon from './components/Icon'
import Sidebar from './components/Sidebar'
import Stats from './components/Stats'
import Timeline from './components/Timeline'
import TaskModal from './components/TaskModal'
import { getPriority, getProject, getStatus, PROJECTS, seedTasks, STATUS_OPTIONS } from './data'
import { formatChineseDate, formatMonth, shiftMonth, taskInMonth } from './utils/date'

const STORAGE_KEY = 'rhythm-schedule-tasks-v1'
const today = new Date()
const initialMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

function loadTasks() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : seedTasks
  } catch {
    return seedTasks
  }
}

function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [selectedProject, setSelectedProject] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [month, setMonth] = useState(initialMonth)
  const [modalTask, setModalTask] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)), [tasks])

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const matchesProject = selectedProject === 'all' || task.projectId === selectedProject
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesQuery = !query.trim() || `${task.title} ${getProject(task.projectId).name}`.toLowerCase().includes(query.trim().toLowerCase())
    return matchesProject && matchesStatus && matchesQuery
  }), [tasks, selectedProject, statusFilter, query])

  const monthTasks = tasks.filter((task) => taskInMonth(task, month))
  const taskCounts = useMemo(() => PROJECTS.reduce((result, project) => ({ ...result, [project.id]: tasks.filter((task) => task.projectId === project.id).length }), { all: tasks.length }), [tasks])
  const stats = {
    total: monthTasks.length,
    progress: monthTasks.filter((task) => task.status === 'progress').length,
    upcoming: monthTasks.filter((task) => task.status !== 'done' && task.end >= new Date().toISOString().slice(0, 10)).length,
    done: monthTasks.filter((task) => task.status === 'done').length
  }
  const listTasks = filteredTasks.filter((task) => showCompleted || task.status !== 'done').sort((a, b) => a.end.localeCompare(b.end))

  const saveTask = (nextTask) => {
    setTasks((current) => current.some((task) => task.id === nextTask.id) ? current.map((task) => task.id === nextTask.id ? nextTask : task) : [...current, nextTask])
    setModalTask(null)
  }
  const deleteTask = (task) => {
    if (window.confirm(`确认删除“${task.title}”吗？`)) {
      setTasks((current) => current.filter((item) => item.id !== task.id))
      setModalTask(null)
    }
  }
  const updateStatus = (task, status) => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status } : item))

  return <div className="app-shell">
    <Sidebar projects={PROJECTS} selectedProject={selectedProject} onSelectProject={setSelectedProject} taskCounts={taskCounts} onAddTask={() => setModalTask({})} />
    <main className="main-content">
      <header className="topbar">
        <div className="breadcrumb"><span>工作台</span><Icon name="chevronRight" size={14} /><strong>排期总览</strong></div>
        <div className="topbar-actions"><label className="search-box"><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索需求或项目" aria-label="搜索需求或项目" /></label><button className="icon-button notification" aria-label="通知"><Icon name="bell" size={18} /><i></i></button><div className="top-avatar">Y</div></div>
      </header>

      <div className="content-wrap">
        <section className="page-intro"><div><p className="eyebrow">SATURDAY, OCTOBER 31, 2026</p><h1>今天也保持好节奏<span>。</span></h1><p className="intro-copy">把每一件要做的事放进清晰的时间里，专注正在发生的事。</p></div><button className="primary-button hero-button" onClick={() => setModalTask({})}><Icon name="plus" size={17} />新建需求</button></section>
        <Stats stats={stats} />
        <Timeline tasks={monthTasks} month={month} onMonthChange={(offset) => setMonth((current) => shiftMonth(current, offset))} onEdit={setModalTask} onAddTask={() => setModalTask({})} />

        <section className="task-section">
          <div className="section-heading"><div><p className="eyebrow">TASK INBOX</p><h2>需求清单 <span>{filteredTasks.length}</span></h2></div><div className="filter-actions"><div className="filter-tabs" role="tablist" aria-label="状态筛选"><button className={statusFilter === 'all' ? 'active' : ''} onClick={() => setStatusFilter('all')}>全部</button>{STATUS_OPTIONS.slice(0, 3).map((status) => <button key={status.id} className={statusFilter === status.id ? 'active' : ''} onClick={() => setStatusFilter(status.id)}>{status.label}</button>)}</div><button className={`filter-toggle ${showCompleted ? 'active' : ''}`} onClick={() => setShowCompleted((value) => !value)}><Icon name="check" size={14} />显示已完成</button></div></div>
          <div className="task-list">{listTasks.length === 0 ? <div className="empty-list"><div className="empty-icon"><Icon name="search" size={20} /></div><strong>没有找到匹配的需求</strong><p>试试调整筛选条件，或者创建一个新的需求。</p><button className="text-button" onClick={() => { setQuery(''); setStatusFilter('all'); setSelectedProject('all') }}>清除筛选</button></div> : listTasks.map((task) => <TaskRow key={task.id} task={task} onEdit={() => setModalTask(task)} onStatusChange={(status) => updateStatus(task, status)} />)}</div>
        </section>
        <footer className="footer-note"><span>本地保存 · 数据只保存在这台设备</span><span>当前视图：{formatMonth(month)}</span></footer>
      </div>
    </main>
    {modalTask && <TaskModal task={modalTask.id ? modalTask : null} onClose={() => setModalTask(null)} onSave={saveTask} onDelete={deleteTask} />}
  </div>
}

function TaskRow({ task, onEdit, onStatusChange }) {
  const project = getProject(task.projectId)
  const priority = getPriority(task.priority)
  const status = getStatus(task.status)
  return <article className="task-row">
    <div className="task-main"><span className="task-color" style={{ background: project.color }}></span><div><h3>{task.title}</h3><p>{project.name}<span className="dot-separator">·</span>{formatChineseDate(task.start)} — {formatChineseDate(task.end)}</p></div></div>
    <div className="task-meta"><span className={`priority ${priority.tone}`}><i></i>{priority.label}</span><label className={`status-select ${status.tone}`}><span className="status-dot"></span><select value={task.status} onChange={(event) => onStatusChange(event.target.value)} aria-label={`${task.title}状态`}>{STATUS_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><Icon name="chevronDown" size={13} /></label><button className="row-edit" onClick={onEdit} aria-label={`编辑${task.title}`}><Icon name="edit" size={16} /></button></div>
  </article>
}

export default App
