
enum WorkerType {
    Dedicated = 'dedicated'
}

type ActionsHandlingMap = Record<string, (payload: any) => any>
type MainMessages = {
    execId: string,
    type: keyof ActionsHandlingMap | WorkerType,
    params?: Parameters<ActionsHandlingMap[MainMessages['type']]>[0]
}

type WorkerMessages<T> = {
    execId: string,
    result?: T,
    error?: Error
}

declare global {
    interface ErrorEvent {
        execId: string
    }
}
const uuid = () => globalThis.crypto.randomUUID()
export function createWorker<TActions extends ActionsHandlingMap>(scriptPath: string | URL, options?: WorkerOptions) {
    let worker: Worker | null
    worker = new Worker(scriptPath, options)

    const promiseMap = new Map<string, { resolve: (any?: any) => void, reject: (any: any) => void }>()
    let workerReadyResolve: (any?: any) => any;
    const workerReady = new Promise(res => workerReadyResolve = res)
    worker.onmessage = (ev: MessageEvent<MainMessages>) => {
        if (ev.data.type === WorkerType.Dedicated) workerReadyResolve()
    }

    async function exec<TActionType extends keyof TActions>(
        type: TActionType,
        params: Parameters<TActions[TActionType]>[0]
    ) {
        await workerReady;

        type ActionResultType = Awaited<ReturnType<TActions[TActionType]>>
        const promise = new Promise<ActionResultType>((resolve, reject) => {
            if (worker instanceof Worker) {
                const execId = uuid()
                promiseMap.set(execId, { resolve, reject })
                const message = { execId, type, params }
                worker.onmessage = (ev: MessageEvent<ActionResultType>) => {
                    const messageFromWorker = ev.data;
                    const execId = messageFromWorker.execId;
                    const res = promiseMap.get(execId)
                    res && res.resolve(messageFromWorker.result);
                }
                worker.onerror = (error) => {
                    const execId = error.execId;
                    const res = promiseMap.get(execId)
                    res && res.reject(error);
                }
                worker.postMessage(message)
            }
        })

        const result = await promise
        return result;
    }
    function terminate() {
        if (worker instanceof Worker) {
            worker.terminate();
            worker = null
        }
    }
    return {
        exec,
        terminate
    }
}

export function registerActions(actionsHandlings: ActionsHandlingMap) {
    postMessage({
        type: WorkerType.Dedicated
    })

    onmessage = async (ev: MessageEvent<MainMessages>) => {
        const data = ev.data;
        const handler = actionsHandlings[data.type];
        if (typeof handler === 'function') {
            try {
                const res = await handler(data.params)
                postMessage({
                    execId: data.execId,
                    result: res
                } as WorkerMessages<any>)
            } catch (error) {
                if (error instanceof Error) {
                    error.message = `$--$${data.execId}$--$` + error.message
                    postMessage({
                        execId: data.execId,
                        result: error
                    } as WorkerMessages<any>)
                }
            }

        }
    }
}