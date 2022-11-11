import { NodeType } from './NodeType.js'

export class GenericType extends NodeType {

  constructor (public genericName: string, public subType: NodeType) {
    super()
  }

  toString (): string {
    return `${this.genericName}<${this.subType.toString()}>`;
  }

}
