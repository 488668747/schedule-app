export function toDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDate(value) {
  return new Date(`${value}T00:00:00`)
}

export function formatChineseDate(value) {
  const date = parseDate(value)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export function formatFullChineseDate(value) {
  const date = parseDate(value)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export function formatMonth(monthValue) {
  const [year, month] = monthValue.split('-')
  return `${year}年${Number(month)}月`
}

export function shiftMonth(monthValue, offset) {
  const [year, month] = monthValue.split('-').map(Number)
  const date = new Date(year, month - 1 + offset, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function getMonthDays(monthValue) {
  const [year, month] = monthValue.split('-').map(Number)
  const count = new Date(year, month, 0).getDate()
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(year, month - 1, index + 1)
    return {
      date: toDateString(date),
      day: index + 1,
      weekday: date.toLocaleDateString('zh-CN', { weekday: 'short' })
    }
  })
}

export function daysBetween(start, end) {
  const milliseconds = parseDate(end).getTime() - parseDate(start).getTime()
  return Math.round(milliseconds / 86400000) + 1
}

export function taskInMonth(task, monthValue) {
  const [year, month] = monthValue.split('-').map(Number)
  const first = toDateString(new Date(year, month - 1, 1))
  const last = toDateString(new Date(year, month, 0))
  return task.end >= first && task.start <= last
}

export function taskPosition(task, monthValue) {
  const days = getMonthDays(monthValue)
  const monthStart = days[0].date
  const monthEnd = days.at(-1).date
  const visibleStart = task.start < monthStart ? monthStart : task.start
  const visibleEnd = task.end > monthEnd ? monthEnd : task.end
  const startIndex = days.findIndex((item) => item.date === visibleStart)
  const endIndex = days.findIndex((item) => item.date === visibleEnd)
  return {
    start: Math.max(startIndex + 1, 1),
    span: Math.max(endIndex - startIndex + 1, 1)
  }
}
