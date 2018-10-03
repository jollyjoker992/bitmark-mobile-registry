import { NativeAppEventEmitter } from 'react-native';

let EventEmitterService = {
  event_extra: {},
  events: {
    COMPONENT_MOUNTING: 'app-component-mounting',
    APP_PROCESSING: 'app-processing',
    APP_SUBMITTING: 'app-submitting',
    APP_PROCESS_ERROR: 'app-process-error',
    APP_RECEIVED_NOTIFICATION: 'app-received-notification',
    APP_TASK: 'app-task:',

    NEED_RELOAD_USER_DATA: 'need-reload-user-data',

    NEED_REFRESH_USER_COMPONENT_STATE: 'need-refresh-user-component-state',
  },
  on: (eventName, func, extra) => {
    if (extra && (!EventEmitterService.event_extra[eventName] || !EventEmitterService.event_extra[eventName][extra])) {
      if (!EventEmitterService.event_extra[eventName]) {
        EventEmitterService.event_extra[eventName] = {};
      }
      EventEmitterService.event_extra[eventName][extra] = true;
    }
    NativeAppEventEmitter.addListener(eventName + (extra || ''), func);
  },
  emit: (eventName, data) => {
    if (EventEmitterService.event_extra[eventName]) {
      for (let extra in EventEmitterService.event_extra[eventName]) {
        NativeAppEventEmitter.emit(eventName + (extra || ''), data);
      }
    }
    NativeAppEventEmitter.emit(eventName, data);
  },
  remove: (eventName, func, extra) => {
    if (extra && EventEmitterService.event_extra[eventName] && EventEmitterService.event_extra[eventName][extra]) {
      delete EventEmitterService.event_extra[eventName][extra];
    }
    if (!func) {
      NativeAppEventEmitter.removeAllListeners(eventName + (extra || ''));
    } else {
      NativeAppEventEmitter.removeListener(eventName + (extra || ''), func);
    }
  }
};

export { EventEmitterService };