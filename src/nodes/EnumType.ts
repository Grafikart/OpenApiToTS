import { NodeType } from './NodeType.js'

export class EnumType extends NodeType {

  constructor (public strings: string[]) {
    super()
  }

  toString (): string {
    return this.strings.map(v => `"${v.toString()}"`).join('|')
  }

}
