
enum WorkerType {
    Dedicated = 'dedicated'
}

type ActionsHandlingMap = Record<string, (payload: any) => any>
type MainMessages = {
    type: keyof ActionsHandlingMap,
    params: Parameters<ActionsHandlingMap[MainMessages['type']]>[0]
}
export function createWorker(scriptPath: string | URL, options?: WorkerOptions) {
    let worker: Worker | null
    worker = new Worker(scriptPath, options)

    function exec<TActionType extends keyof ActionsHandlingMap>(
        type: TActionType,
        params: Parameters<ActionsHandlingMap[TActionType]>[0]
    ) {

        const promise = new Promise<ReturnType<ActionsHandlingMap[TActionType]>>((resolve, reject) => {
            if (worker instanceof Worker) {

                const message = { type, params }
                worker.onmessage = (ev) => {
                    const result = ev.data;
                    resolve(result);
                }
                worker.onerror = (error) => {
                    reject(error);
                }
                worker.postMessage(message)
            }
        })

        return promise;
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
    onmessage = async (ev: MessageEvent<MainMessages>) => {
        const data = ev.data;
        const handler = actionsHandlings[data.type];
        const res = await handler(data.params)
        postMessage(res)
    }
}