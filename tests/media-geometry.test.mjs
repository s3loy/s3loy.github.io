import test from 'node:test'
import assert from 'node:assert/strict'
import { fitScale, zoomAt } from '../src/scripts/media-geometry.ts'
test('fit uses intrinsic dimensions and never magnifies a small image', () => {
  assert.equal(fitScale(200, 100, 1000, 800), 1)
  assert.equal(fitScale(1000, 2000, 448, 848), 0.4)
})
test('fit remains stable after repeated zoom/reset and viewport changes', () => {
  const initial = fitScale(1200, 800, 448, 848)
  const zoomed = zoomAt(initial, 2, 0, 0, 100, 60)
  assert.equal(zoomed.scale, 2)
  assert.equal(fitScale(1200, 800, 448, 848), initial)
  assert.ok(fitScale(1200, 800, 1000, 800) > initial)
})
test('invalid or zero dimensions never produce NaN/Infinity', () => {
  for (const value of [0, -1, NaN, Infinity])
    assert.equal(fitScale(value, 100, 390, 600), 1)
})
test('cursor-anchored zoom preserves the same artwork point under the cursor', () => {
  const result = zoomAt(0.5, 1, 10, 20, 100, 80)
  assert.equal((100 - result.x) / result.scale, (100 - 10) / 0.5)
  assert.equal((80 - result.y) / result.scale, (80 - 20) / 0.5)
})
