import { ref } from 'vue';

type EventCallback = (payload?: any) => void;

class EventBus {
    private listeners: Record<string, EventCallback[]> = {};

    on(event: string, callback: EventCallback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event: string, callback: EventCallback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event: string, payload?: any) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(payload));
    }
}

export const globalEventBus = new EventBus();

// Event Constants
export const EVENTS = {
    SHIFT_REQUIRED: 'shift:required',
    SUBSCRIPTION_EXPIRED: 'subscription:expired',
    UNAUTHORIZED: 'auth:unauthorized',
};
