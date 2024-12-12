import { useEffect } from "react";

import EventEmitter, { EventHandler } from "./event-emitter";

const events = new EventEmitter();

export default events;

export function useEventBus<T = any>(event: string, cb: EventHandler<T>) {
  useEffect(() => {
    events.on(event, cb);
    return () => {
      events.off(event, cb);
    };
  });
}
