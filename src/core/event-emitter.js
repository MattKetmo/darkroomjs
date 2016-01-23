export class EventEmitter {

  constructor() {
    this.listeners = [];
  }

  /**
   * Publish event.
   *
   * @param {string} eventName Name of the event
   * @param {object} payload   Payload of the event
   */
  publish(eventName, payload) {
    if (!this.listeners[eventName]) {
      return;
    }

    this.listeners[eventName].forEach((listener) => {
      listener(payload);
    });
  }

  /**
   * Subscribe to an event.
   *
   * @param {string} eventName The event to subscribe
   * @param {function} listener  The callback to execute on event
   *
   * @return {function} Callback to unsubscribe
   */
  subscribe(eventName, listener) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(listener);

    return () => {
      this.listeners[eventName] = this.listeners[eventName]
        .filter((element) => listener !== element);
    };
  }
}
