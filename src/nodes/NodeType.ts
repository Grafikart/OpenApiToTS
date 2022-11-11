export class NodeType {

  private infos: {format?: string, example?: string, description?: string} = {}

  toString (): string {
    return '';
  }

  toComment (): string {
    const lines = []
    const {format, example, description} = this.infos
    if (description) {
      lines.push(description)
    }
    if (format) {
      lines.push(`Format: ${format}`)
    }
    if (example) {
      lines.push(`@example ${example}`)
    }
    if (lines.length === 0) {
      return ''
    }
    if (lines.length === 1) {
      return `\n/* ${lines.join('')} */\n`
    }
    return `/*\n * ${lines.join("\n * ")} \n */\n`
  }

  with (infos: {format?: string, example?: string, description?: string}) {
    this.infos = infos
    return this
  }

}
