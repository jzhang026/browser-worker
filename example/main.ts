import { createWorker } from "../src/index"

const worker = createWorker('worker.ts', { type: 'module' })

worker.exec('sum', { a: 5, b: 6 }).then((result) => {
  const div = document.createElement("div")
  div.id = "worker-result"
  div.textContent = `${result}`
  document.body.append(div)
})