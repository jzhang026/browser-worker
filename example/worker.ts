import { registerActions } from '../src'
export const actions = {
    sum(payload: { a: number; b: number }) {
        return new Promise(res => {
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