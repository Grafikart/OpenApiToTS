import { NodeType } from './NodeType.js'

export class IntersectionType extends NodeType {

  constructor (public subTypes: NodeType[]) {
    super()
  }

  toString (): string {
    return this.subTypes.map(v => v.toString()).join('&')
  }

}
