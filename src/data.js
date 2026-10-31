export const PROJECTS = [
  { id: 'atlas', name: 'Atlas 设计系统', short: 'AT', color: '#5578e7' },
  { id: 'northstar', name: 'Northstar 官网', short: 'NS', color: '#e58a55' },
  { id: 'portal', name: '内部工作台', short: 'IW', color: '#7a68c5' },
  { id: 'personal', name: '个人事项', short: 'PS', color: '#39a590' }
]

export const STATUS_OPTIONS = [
  { id: 'todo', label: '待开始', tone: 'neutral' },
  { id: 'progress', label: '进行中', tone: 'blue' },
  { id: 'review', label: '待评审', tone: 'purple' },
  { id: 'done', label: '已完成', tone: 'green' }
]

export const PRIORITY_OPTIONS = [
  { id: 'high', label: '高优先级', tone: 'red' },
  { id: 'medium', label: '中优先级', tone: 'orange' },
  { id: 'low', label: '低优先级', tone: 'gray' }
]

export const seedTasks = [
  {
    id: 'task-1', title: '表格组件筛选体验优化', projectId: 'atlas', start: '2026-10-28', end: '2026-11-04', status: 'progress', priority: 'high', note: '补充多选筛选、清除条件和空状态。'
  },
  {
    id: 'task-2', title: '导航组件文档整理', projectId: 'atlas', start: '2026-10-21', end: '2026-10-27', status: 'done', priority: 'medium', note: '统一组件示例和交互说明。'
  },
  {
    id: 'task-3', title: '首页首屏动效方案', projectId: 'northstar', start: '2026-11-03', end: '2026-11-11', status: 'review', priority: 'medium', note: '准备两版动效方向，周三和设计一起评审。'
  },
  {
    id: 'task-4', title: '客户案例卡片开发', projectId: 'northstar', start: '2026-11-10', end: '2026-11-20', status: 'todo', priority: 'high', note: '依赖案例内容最终确认。'
  },
  {
    id: 'task-5', title: '权限管理列表重构', projectId: 'portal', start: '2026-11-06', end: '2026-11-18', status: 'progress', priority: 'high', note: '拆分角色、成员和资源权限三个视图。'
  },
  {
    id: 'task-6', title: '工作台消息中心验收', projectId: 'portal', start: '2026-10-30', end: '2026-11-05', status: 'review', priority: 'medium', note: '检查已读、批量操作及跳转。'
  },
  {
    id: 'task-7', title: '整理季度作品集', projectId: 'personal', start: '2026-11-17', end: '2026-11-23', status: 'todo', priority: 'low', note: '收集项目截图与复盘笔记。'
  }
]

export function getProject(projectId) {
  return PROJECTS.find((project) => project.id === projectId) || PROJECTS[0]
}

export function getStatus(statusId) {
  return STATUS_OPTIONS.find((status) => status.id === statusId) || STATUS_OPTIONS[0]
}

export function getPriority(priorityId) {
  return PRIORITY_OPTIONS.find((priority) => priority.id === priorityId) || PRIORITY_OPTIONS[1]
}
