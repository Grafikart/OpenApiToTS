import { NodeType } from './NodeType.js'

export class ObjectType extends NodeType {

  // Save the properties [propertyName, type, optional]
  properties = [] as [string, NodeType, boolean][]

  addProperty(name: string, type: NodeType, optional: boolean = false) {
    this.properties.push([name, type, optional])
  }

  toString (): string {
    if (this.properties.length === 0) {
      return '{}'
    }
    return `{` +
      this.properties.map(([name, type, optional]) => `${type.toComment()}"${name}"${optional ? '?:' : ':'}${type.toString()}`) +
    `}`
  }

}
