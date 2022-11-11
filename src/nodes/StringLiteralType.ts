import { NodeType } from './NodeType.js'

export class StringLiteralType extends NodeType {

  constructor (public str: string) {
    super()
  }

  toString (): string {
    return `"${this.str}"`;
  }

}
