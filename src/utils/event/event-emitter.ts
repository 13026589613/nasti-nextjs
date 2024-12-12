import { pull } from "lodash";

export type EventHandler<E = any> = (e: E) => void;

class EventEmitter<E = any> {
  private _events: Record<string, EventHandler<E>[]>;

  constructor() {
    this._events = {};
  }

  private _getFns(event: string) {
    return this._events[event] || (this._events[event] = []);
  }

  public on<T = E>(event: string, cb: EventHandler<T>) {
    const fns = this._getFns(event);
    fns.push(cb as any);
  }

  public off(event: string, cb?: EventHandler<E>) {
    if (cb) {
      const fns = this._getFns(event);
      pull(fns, cb);
    } else {
      delete this._events[event];
    }
  }

  public once<T = E>(event: string, cb: EventHandler<T>) {
    const fn2: EventHandler<E> = (e) => {
      this.off(event, fn2);
      cb(e as any);
    };
    this.on(event, fn2);
  }

  public emit<T = E>(event: string, param?: T) {
    const fns = this._getFns(event);
    for (let i = 0; i < fns.length; i++) {
      const fn = fns[i] as EventHandler<any>;

      fn(param);
    }
  }

  public invoke<T = E>(event: string, param?: T): Promise<any> {
    const fns = this._getFns(event);

    flag: for (let i = 0; i < fns.length; i++) {
      const fn = fns[i] as EventHandler<any>;
      return new Promise<any>((resolve, reject) => {
        resolve(fn(param));
      });
      break flag;
    }
    return Promise.reject();
  }
}

export default EventEmitter;
