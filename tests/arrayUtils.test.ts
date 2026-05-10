import { dedupe } from '../src/utils/arrayUtils'

describe('arrayUtils.dedupe', () => {
  test('removes duplicates from number array', () => {
    expect(dedupe([1, 1, 2, 3, 2, 4])).toEqual([1, 2, 3, 4])
  })
  test('preserves order of first occurrences', () => {
    expect(dedupe(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c'])
  })
  test('returns empty array when input is empty', () => {
    expect(dedupe([])).toEqual([])
  })
  test('dedup with mixed duplicates retains first occurrences', () => {
    expect(dedupe(['x', 'y', 'x', 'z', 'y', 'z'])).toEqual(['x', 'y', 'z'])
  })
})
