# SDK7 Template Library

## Conecepts

### Engine Param
You need to pass the engine so you reference always the same engine in the lib & in the scene.

### Components
In order to use an ecs component, you need to import it and pass the engine, so both the library and the scene are talking about the same component instance.
```ts
import * as components from '@dcl/ecs/dist/components'
const Transform = components.Transform(engine)
Transform.getOrNull(entity)
```

### Publish
Set your NPM_TOKEN on github secrets and the lib will automatically be deployed to npm registry.
Be sure to set the package.json#name property with your library name.
See .github/workflows/ci.yml file.


### Development
`npm run dev` to start the typescript compiler.
`npm run start` to start the library as a scene.