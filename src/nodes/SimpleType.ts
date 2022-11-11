import { NodeType } from './NodeType.js'

export class SimpleType extends NodeType {

  constructor (public typeDef: string) {
    super()
  }

  toString (): string {
    return this.typeDef;
  }

}
