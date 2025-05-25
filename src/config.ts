import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

export interface O2TSConfig {
  /**
   * Format du code généré
   */
  format?: {
    /**
     * Ajouter des points-virgules à la fin des lignes
     * @default false
     */
    semi?: boolean
    /**
     * Largeur d'indentation
     * @default 2
     */
    tabWidth?: number
    /**
     * Utiliser des simples quotes au lieu de doubles
     * @default true
     */
    singleQuote?: boolean
    /**
     * Ajouter des virgules finales
     * @default true
     */
    trailingComma?: boolean
  }
  /**
   * Options du générateur
   */
  generator?: {
    /**
     * Préfixe pour les types générés
     * @default "API"
     */
    typePrefix?: string
    /**
     * Inclure les exemples de requête dans les commentaires
     * @default false
     */
    includeExamples?: boolean
    /**
     * Générer des types pour les corps de requête
     * @default true
     */
    includeRequestBodies?: boolean
    /**
     * Générer des types pour les réponses
     * @default true
     */
    includeResponses?: boolean
  }
}

export const DEFAULT_CONFIG: O2TSConfig = {
  format: {
    semi: false,
    tabWidth: 2,
    singleQuote: true,
    trailingComma: true
  },
  generator: {
    typePrefix: 'API',
    includeExamples: false,
    includeRequestBodies: true,
    includeResponses: true
  }
}

/**
 * Récupère la configuration de o2ts
 *
 * Cherche dans l'ordre:
 * 1. Fichier .o2tsrc.json à la racine du projet
 * 2. Section "o2ts" dans package.json
 * 3. Configuration par défaut
 */
export function getConfig(basePath: string = process.cwd()): O2TSConfig {
  // Chercher un fichier de configuration .o2tsrc.json
  const configPath = path.join(basePath, '.o2tsrc.json')
  if (existsSync(configPath)) {
    try {
      const configContent = readFileSync(configPath, 'utf-8')
      return mergeConfig(JSON.parse(configContent))
    } catch (error) {
      console.warn(`Erreur lors de la lecture du fichier .o2tsrc.json: ${error}`)
    }
  }

  // Chercher une section o2ts dans package.json
  const packagePath = path.join(basePath, 'package.json')
  if (existsSync(packagePath)) {
    try {
      const packageContent = readFileSync(packagePath, 'utf-8')
      const packageData = JSON.parse(packageContent)
      if (packageData.o2ts && typeof packageData.o2ts === 'object') {
        return mergeConfig(packageData.o2ts)
      }
    } catch (error) {
      console.warn(`Erreur lors de la lecture de la configuration dans package.json: ${error}`)
    }
  }

  return DEFAULT_CONFIG
}

/**
 * Fusionne la configuration utilisateur avec la configuration par défaut
 */
function mergeConfig(userConfig: Partial<O2TSConfig>): O2TSConfig {
  return {
    format: {
      ...DEFAULT_CONFIG.format,
      ...userConfig.format
    },
    generator: {
      ...DEFAULT_CONFIG.generator,
      ...userConfig.generator
    }
  }
}
