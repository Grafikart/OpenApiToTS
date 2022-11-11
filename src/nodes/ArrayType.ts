import { NodeType } from './NodeType.js'

export class ArrayType extends NodeType {

  constructor (public subType: NodeType) {
    super()
  }

  toString (): string {
    return `Array<${this.subType.toString()}>`
  }

}
