import { NodeType } from './NodeType.js'

export class UnionType extends NodeType {

  constructor (public subTypes: NodeType[] = []) {
    super()
  }

  addSubtype (type: NodeType) {
    this.subTypes.push(type)
  }

  toString (): string {
    return this.subTypes.map(v => v.toString()).join('|')
  }

}
