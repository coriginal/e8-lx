/**
 * listenerCenter: {
 *   eventType: listeners,
 *   ...
 * }
 * listeners: {
 *   identifier: taskQueue
 * }
 * eventType: String
 * identifier: String
 * taskQueue: []
 */
const listenerCenter = {}

const eventType = Object.freeze({
  refresh: 'refresh',
  appHide: 'appHide'
})

/**
 * @description
 * 添加监听者
 * 
 * @param {EventType} event - 事件类型
 * @param {String} identifier - 监听者唯一标识
 * @param {Function} task - 触发事件
 */
const addListener = function addListener(event, identifier, task) {

  if (typeof identifier !== 'string') {
    // type error
    return
  }

  // if (!eventType.hasOwnProperty(event)) {
  //   return
  // }

  const listeners = listenerCenter[event]
  if (listeners) {
    let taskQueue = listeners[identifier] || (listeners[identifier] = [])
    taskQueue.push(task)
    return
  }

  var _listeners = {}, taskQueue = []
  taskQueue.push(task)
  _listeners[identifier] = taskQueue
  listenerCenter[event] = _listeners
}

/**
 * @description
 * 移除监听者
 * 
 * @param {EventType} event - 事件类型
 * @param {String} identifier - 监听者唯一标识
 */
const removeListener = function removeListener(event, identifier) {
  if (typeof identifier !== 'string') {
    // type error
    return
  }

  // if (!eventType.hasOwnProperty(event)) {
  //   return
  // }

  const listeners = listenerCenter[event]
  if (!listeners) {
    return
  }
  const taskQueue = listeners[identifier]
  if (!taskQueue) {
    return
  }
  delete listeners[identifier]
}

/**
 * @description
 * 触发监听
 * 
 * @param {EventType} event - 事件类型
 * @param {Any} value - 触发监听事件传递的参数
 */
const emitEvent = function emitEvent(event, value) {
  // if (!eventType.hasOwnProperty(event)) {
  //   return
  // }

  const listeners = listenerCenter[event]
  if (!listeners) {
    return
  }

  for (let prop in listeners) {
    if (listeners.hasOwnProperty(prop)) {
      let taskQueue = listeners[prop]
      for (let i = 0; i < taskQueue.length; i++) {
        taskQueue[i](value)
      }
    }
  }
}

module.exports = {
  addListener,
  removeListener,
  emitEvent,
  event: eventType
}