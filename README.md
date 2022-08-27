

# browser-worker


## Run the example
```
npm run example
```

### create a worker ./main.ts
```ts
import { createWorker } from "../src/index"
import type { Actions } from './worker'
const worker = createWorker<Actions>('worker.ts', { type: 'module' })

worker.exec('sum', { a: 5, b: 6 }).then((result) => {
  const div = document.createElement("div")
  div.id = "worker-result"
  div.textContent = `${result}`
  document.body.append(div)
})
```

### ./worker.ts

```ts
import { registerActions } from '../src'
export const actions = {
    sum(payload: { a: number; b: number }) {
        return new Promise<number>(res => {
            const p = Date.now()
            setTimeout(() => {
                console.log(`resolved after ${Date.now() - p}`)
                res(payload.a + payload.b)
            }, 2000)
        })

    },
}

export type Actions = typeof actions
registerActions(actions)
```
