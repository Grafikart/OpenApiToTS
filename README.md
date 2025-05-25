# @grafikart/o2ts

Un outil simple et puissant pour convertir des spécifications OpenAPI 3.0/3.1 en fichiers TypeScript avec des types utilisables.

## Installation

```bash
npm i -D @grafikart/o2ts
yarn add -D @grafikart/o2ts
pnpm add -D @grafikart/o2ts
```

## Utilisation basique

Ajoutez le script suivant à votre `package.json` :

```json
{
  "scripts": {
    "openapi": "o2ts ./openapi.yml"
  }
}
```

Puis exécutez :

```bash
npm run openapi
```

Par défaut, `o2ts` générera un fichier TypeScript avec le même nom que votre fichier OpenAPI (en remplaçant l'extension `.yml` ou `.yaml` par `.ts`).

## Utilisation avancée

### Spécifier un nom de fichier de sortie

```bash
o2ts ./openapi.yml ./types/api.ts
```

### Utiliser avec différentes sources OpenAPI

Le package peut traiter les spécifications OpenAPI depuis :

- Un fichier local : `o2ts ./path/to/openapi.yml`
- Un URL (bientôt disponible) : `o2ts https://example.com/api/openapi.json`

## Configuration

@grafikart/o2ts est configurable pour s'adapter à vos besoins. Vous pouvez configurer l'outil de deux façons :

### 1. Fichier `.o2tsrc.json`

Créez un fichier `.o2tsrc.json` à la racine de votre projet :

```json
{
  "format": {
    "semi": true,
    "tabWidth": 4,
    "singleQuote": false,
    "trailingComma": false
  },
  "generator": {
    "typePrefix": "MyAPI",
    "includeExamples": true
  }
}
```

### 2. Section dans `package.json`

Ou ajoutez une section `o2ts` dans votre `package.json` :

```json
{
  "name": "votre-projet",
  "version": "1.0.0",
  "o2ts": {
    "format": {
      "semi": true,
      "singleQuote": false
    },
    "generator": {
      "typePrefix": "MyAPI"
    }
  }
}
```

### Options de configuration disponibles

#### Format du code généré

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `format.semi` | `boolean` | `false` | Ajouter des points-virgules à la fin des lignes |
| `format.tabWidth` | `number` | `2` | Largeur d'indentation |
| `format.singleQuote` | `boolean` | `true` | Utiliser des guillemets simples au lieu de doubles |
| `format.trailingComma` | `boolean` | `true` | Ajouter des virgules finales |

#### Options du générateur

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `generator.typePrefix` | `string` | `"API"` | Préfixe pour les types générés |
| `generator.includeExamples` | `boolean` | `false` | Inclure les exemples de requête dans les commentaires |
| `generator.includeRequestBodies` | `boolean` | `true` | Générer des types pour les corps de requête |
| `generator.includeResponses` | `boolean` | `true` | Générer des types pour les réponses |

## Exemples d'utilisation

### Exemple basique

Voici un exemple simple d'utilisation des types générés :

```typescript
import type { APIPaths, APIRequests, APIResponse } from './openapi'

export async function fetchAPI<
  Path extends APIPaths,
  Options extends APIRequests<Path>
>(path: Path, options: Options): Promise<APIResponse<Path, Options['method']>> {
  // Votre code ici
}
```

### Exemple avec Axios

```typescript
import axios from 'axios'
import type { APIPaths, APIRequest, APIResponse } from './openapi'

export async function apiCall<
  Path extends APIPaths,
  Method extends string | undefined = undefined
>(
  path: Path, 
  options?: APIRequest<Path, Method>
): Promise<APIResponse<Path, Method>> {
  const method = (options?.method ?? 'get').toLowerCase()
  const config = {
    params: options?.query,
    data: options?.body
  }
  
  const response = await axios.request({
    url: path,
    method,
    ...config
  })
  
  return response.data
}

// Utilisation
const users = await apiCall('/users')
const user = await apiCall('/users/{id}', { 
  method: 'get',
  urlParams: { id: 123 } 
})
const newUser = await apiCall('/users', { 
  method: 'post',
  body: { name: 'John' } 
})
```

### Exemple avec React Query

```typescript
import { useQuery } from 'react-query'
import type { APIPaths, APIRequest, APIResponse } from './openapi'

// Fonction API de base
const apiCall = async<
  Path extends APIPaths,
  Method extends string | undefined = undefined
>(
  path: Path, 
  options?: APIRequest<Path, Method>
): Promise<APIResponse<Path, Method>> => {
  // Implémentation de l'appel API
}

// Hook personnalisé pour React Query
export function useApiQuery<
  Path extends APIPaths,
  Method extends 'get' | undefined = 'get'
>(
  path: Path,
  options?: APIRequest<Path, Method>,
  queryOptions?: any
) {
  return useQuery(
    [path, options],
    () => apiCall(path, { method: 'get', ...options } as any),
    queryOptions
  )
}

// Utilisation
function UserComponent({ userId }: { userId: number }) {
  const { data, isLoading } = useApiQuery('/users/{id}', {
    urlParams: { id: userId }
  })
  
  if (isLoading) return <div>Loading...</div>
  
  return <div>{data.name}</div>
}
```

## Types générés

L'outil génère les types suivants :

- `APIPaths`: Union des chemins d'API disponibles
- `APIRequests<Path>`: Type pour les options de requête pour un chemin donné
- `APIMethods<Path>`: Union des méthodes HTTP disponibles pour un chemin donné
- `APIRequest<Path, Method>`: Type pour une requête complète avec une méthode spécifique
- `APIResponse<Path, Method>`: Type pour la réponse d'une requête avec une méthode spécifique

D'autres types générés incluent :
- `APISchemas`: Types pour tous les schémas définis dans les `components.schemas`
- `APIParameters`: Types pour tous les paramètres définis dans les `components.parameters`
- `APIResponses`: Types pour toutes les réponses définies dans les `components.responses`

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request sur [le dépôt GitHub](https://github.com/Grafikart/OpenApiToTS).

## Licence

ISC
