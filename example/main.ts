import { createWorker } from "../src/index"
import type { Actions } from './worker'
const worker = createWorker<Actions>('worker.ts', { type: 'module' })

for (let i = 0; i < 10; i++) {
  worker.exec('sum', { a: i, b: i + 2 }).then((result) => {
    const div = document.createElement("div")
    div.id = `worker-result-${i}`
    div.textContent = `${result}`
    document.body.append(div)
  })
}