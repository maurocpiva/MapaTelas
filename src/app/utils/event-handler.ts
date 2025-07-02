export function handleEvent(eventHandler: string | Function, eventName: string) {
    if (typeof eventHandler === 'string') {
        try {
            const handlerFunction = new Function(eventHandler);
            handlerFunction();
        } catch (error) {
            console.error(`Error executing ${eventName} function:`, error);
        }
    } else if (typeof eventHandler === 'function') {
        eventHandler();
    } else {
        console.warn(`No valid ${eventName} handler provided`);
    }
}
