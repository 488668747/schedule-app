import test from 'node:test'
import assert from 'node:assert/strict'
import { formatFullChineseDate, toDateString } from './date.js'

test('日期按中文年月日显示，跨年与个位月份不带英文或补零', () => {
  assert.equal(formatFullChineseDate('2026-11-02'), '2026年11月2日')
  assert.equal(formatFullChineseDate('2027-01-01'), '2027年1月1日')
})

test('当天日期使用设备本地日期，午夜附近也不会转换成 UTC 的前一天', () => {
  const earlyMorning = new Date(2026, 10, 2, 0, 15)
  const lateNight = new Date(2026, 10, 2, 23, 45)
  assert.equal(toDateString(earlyMorning), '2026-11-02')
  assert.equal(toDateString(lateNight), '2026-11-02')
  assert.equal(formatFullChineseDate(toDateString(earlyMorning)), '2026年11月2日')
})
