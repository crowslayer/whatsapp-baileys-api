import { FlowMapper } from '../../../src/application/bot/FlowMapper'

describe('FlowMapper', () => {
  test('should convert message nodes to domain format', () => {
    const nodes = [
      { id: 'n1', type: 'message', position: { x: 0, y: 0 }, data: { text: 'Hello' } },
      { id: 'n2', type: 'message', position: { x: 100, y: 0 }, data: { text: 'World' } },
    ]
    const edges = [{ source: 'n1', target: 'n2' }]

    const result = FlowMapper.toDomain(nodes, edges)
    expect(result.start).toBe('n1')
    expect(result.nodes!['n1']).toEqual({
      id: 'n1', type: 'message', text: 'Hello', next: 'n2',
    })
    expect(result.nodes!['n2']).toEqual({
      id: 'n2', type: 'message', text: 'World', next: null,
    })
    expect(result.flowId).toBeDefined()
  })

  test('should convert input nodes', () => {
    const nodes = [
      { id: 'in1', type: 'input', position: { x: 0, y: 0 }, data: { variable: 'color' } },
    ]
    const result = FlowMapper.toDomain(nodes, [])
    expect(result.nodes!['in1']).toEqual({
      id: 'in1', type: 'input', variable: 'color', next: null,
    })
  })

  test('should convert ai nodes', () => {
    const nodes = [
      { id: 'ai1', type: 'ai', position: { x: 0, y: 0 }, data: { prompt: 'Say hello' } },
    ]
    const result = FlowMapper.toDomain(nodes, [])
    expect(result.nodes!['ai1']).toEqual({
      id: 'ai1', type: 'ai', prompt: 'Say hello', next: null,
    })
  })

  test('should return empty flow when nodes array is empty', () => {
    const result = FlowMapper.toDomain([], [])
    expect(result.start).toBe('')
    expect(result.nodes).toEqual({})
    expect(result.flowId).toBeDefined()
  })
})
