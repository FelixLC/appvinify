;
window.ionic = {
  controllers: {},
  views: {}
};
;
(function (ionic) {
  var bezierCoord = function (x, y) {
    if (!x)
      var x = 0;
    if (!y)
      var y = 0;
    return {
      x: x,
      y: y
    };
  };
  function B1(t) {
    return t * t * t;
  }
  function B2(t) {
    return 3 * t * t * (1 - t);
  }
  function B3(t) {
    return 3 * t * (1 - t) * (1 - t);
  }
  function B4(t) {
    return (1 - t) * (1 - t) * (1 - t);
  }
  ionic.Animator = {
    getQuadraticBezier: function (percent, C1, C2, C3, C4) {
      var pos = new bezierCoord();
      pos.x = C1.x * B1(percent) + C2.x * B2(percent) + C3.x * B3(percent) + C4.x * B4(percent);
      pos.y = C1.y * B1(percent) + C2.y * B2(percent) + C3.y * B3(percent) + C4.y * B4(percent);
      return pos;
    },
    getCubicBezier: function (x1, y1, x2, y2, duration) {
      epsilon = 1000 / 60 / duration / 4;
      var curveX = function (t) {
        var v = 1 - t;
        return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
      };
      var curveY = function (t) {
        var v = 1 - t;
        return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
      };
      var derivativeCurveX = function (t) {
        var v = 1 - t;
        return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (-t * t * t + 2 * v * t) * x2;
      };
      return function (t) {
        var x = t, t0, t1, t2, x2, d2, i;
        for (t2 = x, i = 0; i < 8; i++) {
          x2 = curveX(t2) - x;
          if (Math.abs(x2) < epsilon)
            return curveY(t2);
          d2 = derivativeCurveX(t2);
          if (Math.abs(d2) < 0.000001)
            break;
          t2 = t2 - x2 / d2;
        }
        t0 = 0, t1 = 1, t2 = x;
        if (t2 < t0)
          return curveY(t0);
        if (t2 > t1)
          return curveY(t1);
        while (t0 < t1) {
          x2 = curveX(t2);
          if (Math.abs(x2 - x) < epsilon)
            return curveY(t2);
          if (x > x2)
            t0 = t2;
          else
            t1 = t2;
          t2 = (t1 - t0) * 0.5 + t0;
        }
        return curveY(t2);
      };
    },
    animate: function (element, className, fn) {
      return {
        leave: function () {
          var endFunc = function () {
            element.classList.remove('leave');
            element.classList.remove('leave-active');
            element.removeEventListener('webkitTransitionEnd', endFunc);
            element.removeEventListener('transitionEnd', endFunc);
          };
          element.addEventListener('webkitTransitionEnd', endFunc);
          element.addEventListener('transitionEnd', endFunc);
          element.classList.add('leave');
          element.classList.add('leave-active');
          return this;
        },
        enter: function () {
          var endFunc = function () {
            element.classList.remove('enter');
            element.classList.remove('enter-active');
            element.removeEventListener('webkitTransitionEnd', endFunc);
            element.removeEventListener('transitionEnd', endFunc);
          };
          element.addEventListener('webkitTransitionEnd', endFunc);
          element.addEventListener('transitionEnd', endFunc);
          element.classList.add('enter');
          element.classList.add('enter-active');
          return this;
        }
      };
    }
  };
}(ionic));
;
(function (ionic) {
  ionic.DomUtil = {
    getTextBounds: function (textNode) {
      if (document.createRange) {
        var range = document.createRange();
        range.selectNodeContents(textNode);
        if (range.getBoundingClientRect) {
          var rect = range.getBoundingClientRect();
          var sx = window.scrollX;
          var sy = window.scrollY;
          return {
            top: rect.top + sy,
            left: rect.left + sx,
            right: rect.left + sx + rect.width,
            bottom: rect.top + sy + rect.height,
            width: rect.width,
            height: rect.height
          };
        }
      }
      return null;
    },
    getChildIndex: function (element, type) {
      if (type) {
        var ch = element.parentNode.children;
        var c;
        for (var i = 0, k = 0, j = ch.length; i < j; i++) {
          c = ch[i];
          if (c.nodeName && c.nodeName.toLowerCase() == type) {
            if (c == element) {
              return k;
            }
            k++;
          }
        }
      }
      return Array.prototype.slice.call(element.parentNode.children).indexOf(element);
    },
    swapNodes: function (src, dest) {
      dest.parentNode.insertBefore(src, dest);
    },
    getParentWithClass: function (e, className) {
      while (e.parentNode) {
        if (e.parentNode.classList && e.parentNode.classList.contains(className)) {
          return e.parentNode;
        }
        e = e.parentNode;
      }
      return null;
    },
    getParentOrSelfWithClass: function (e, className) {
      while (e) {
        if (e.classList && e.classList.contains(className)) {
          return e;
        }
        e = e.parentNode;
      }
      return null;
    }
  };
}(window.ionic));
;
(function (ionic) {
  if (!window.CustomEvent) {
    (function () {
      var CustomEvent;
      CustomEvent = function (event, params) {
        var evt;
        params = params || {
          bubbles: false,
          cancelable: false,
          detail: undefined
        };
        evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
      };
      CustomEvent.prototype = window.Event.prototype;
      window.CustomEvent = CustomEvent;
    }());
  }
  ionic.EventController = {
    VIRTUALIZED_EVENTS: [
      'tap',
      'swipe',
      'swiperight',
      'swipeleft',
      'drag',
      'hold',
      'release'
    ],
    trigger: function (eventType, data) {
      var event = new CustomEvent(eventType, { detail: data });
      data && data.target && data.target.dispatchEvent(event) || window.dispatchEvent(event);
    },
    on: function (type, callback, element) {
      var e = element || window;
      for (var i = 0, j = this.VIRTUALIZED_EVENTS.length; i < j; i++) {
        if (type == this.VIRTUALIZED_EVENTS[i]) {
          var gesture = new ionic.Gesture(element);
          gesture.on(type, callback);
          return gesture;
        }
      }
      e.addEventListener(type, callback);
    },
    off: function (type, callback, element) {
      element.removeEventListener(type, callback);
    },
    onGesture: function (type, callback, element) {
      var gesture = new ionic.Gesture(element);
      gesture.on(type, callback);
      return gesture;
    },
    offGesture: function (gesture, type, callback) {
      gesture.off(type, callback);
    },
    handlePopState: function (event) {
    }
  };
  ionic.on = function () {
    ionic.EventController.on.apply(ionic.EventController, arguments);
  };
  ionic.off = function () {
    ionic.EventController.off.apply(ionic.EventController, arguments);
  };
  ionic.trigger = function () {
    ionic.EventController.trigger.apply(ionic.EventController.trigger, arguments);
  };
  ionic.onGesture = function () {
    return ionic.EventController.onGesture.apply(ionic.EventController.onGesture, arguments);
  };
  ionic.offGesture = function () {
    return ionic.EventController.offGesture.apply(ionic.EventController.offGesture, arguments);
  };
}(window.ionic));
;
(function (ionic) {
  ionic.Gesture = function (element, options) {
    return new ionic.Gestures.Instance(element, options || {});
  };
  ionic.Gestures = {};
  ionic.Gestures.defaults = {
    stop_browser_behavior: {
      userSelect: 'none',
      touchAction: 'none',
      touchCallout: 'none',
      contentZooming: 'none',
      userDrag: 'none',
      tapHighlightColor: 'rgba(0,0,0,0)'
    }
  };
  ionic.Gestures.HAS_POINTEREVENTS = window.navigator.pointerEnabled || window.navigator.msPointerEnabled;
  ionic.Gestures.HAS_TOUCHEVENTS = 'ontouchstart' in window;
  ionic.Gestures.MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android|silk/i;
  ionic.Gestures.NO_MOUSEEVENTS = ionic.Gestures.HAS_TOUCHEVENTS && window.navigator.userAgent.match(ionic.Gestures.MOBILE_REGEX);
  ionic.Gestures.EVENT_TYPES = {};
  ionic.Gestures.DIRECTION_DOWN = 'down';
  ionic.Gestures.DIRECTION_LEFT = 'left';
  ionic.Gestures.DIRECTION_UP = 'up';
  ionic.Gestures.DIRECTION_RIGHT = 'right';
  ionic.Gestures.POINTER_MOUSE = 'mouse';
  ionic.Gestures.POINTER_TOUCH = 'touch';
  ionic.Gestures.POINTER_PEN = 'pen';
  ionic.Gestures.EVENT_START = 'start';
  ionic.Gestures.EVENT_MOVE = 'move';
  ionic.Gestures.EVENT_END = 'end';
  ionic.Gestures.DOCUMENT = window.document;
  ionic.Gestures.plugins = {};
  ionic.Gestures.READY = false;
  function setup() {
    if (ionic.Gestures.READY) {
      return;
    }
    ionic.Gestures.event.determineEventTypes();
    for (var name in ionic.Gestures.gestures) {
      if (ionic.Gestures.gestures.hasOwnProperty(name)) {
        ionic.Gestures.detection.register(ionic.Gestures.gestures[name]);
      }
    }
    ionic.Gestures.event.onTouch(ionic.Gestures.DOCUMENT, ionic.Gestures.EVENT_MOVE, ionic.Gestures.detection.detect);
    ionic.Gestures.event.onTouch(ionic.Gestures.DOCUMENT, ionic.Gestures.EVENT_END, ionic.Gestures.detection.detect);
    ionic.Gestures.READY = true;
  }
  ionic.Gestures.Instance = function (element, options) {
    var self = this;
    if (element === null) {
      console.error('Null element passed to gesture (element does not exist). Not listening for gesture');
      return;
    }
    setup();
    this.element = element;
    this.enabled = true;
    this.options = ionic.Gestures.utils.extend(ionic.Gestures.utils.extend({}, ionic.Gestures.defaults), options || {});
    if (this.options.stop_browser_behavior) {
      ionic.Gestures.utils.stopDefaultBrowserBehavior(this.element, this.options.stop_browser_behavior);
    }
    ionic.Gestures.event.onTouch(element, ionic.Gestures.EVENT_START, function (ev) {
      if (self.enabled) {
        ionic.Gestures.detection.startDetect(self, ev);
      }
    });
    return this;
  };
  ionic.Gestures.Instance.prototype = {
    on: function onEvent(gesture, handler) {
      var gestures = gesture.split(' ');
      for (var t = 0; t < gestures.length; t++) {
        this.element.addEventListener(gestures[t], handler, false);
      }
      return this;
    },
    off: function offEvent(gesture, handler) {
      var gestures = gesture.split(' ');
      for (var t = 0; t < gestures.length; t++) {
        this.element.removeEventListener(gestures[t], handler, false);
      }
      return this;
    },
    trigger: function triggerEvent(gesture, eventData) {
      var event = ionic.Gestures.DOCUMENT.createEvent('Event');
      event.initEvent(gesture, true, true);
      event.gesture = eventData;
      var element = this.element;
      if (ionic.Gestures.utils.hasParent(eventData.target, element)) {
        element = eventData.target;
      }
      element.dispatchEvent(event);
      return this;
    },
    enable: function enable(state) {
      this.enabled = state;
      return this;
    }
  };
  var last_move_event = null;
  var enable_detect = false;
  var touch_triggered = false;
  ionic.Gestures.event = {
    bindDom: function (element, type, handler) {
      var types = type.split(' ');
      for (var t = 0; t < types.length; t++) {
        element.addEventListener(types[t], handler, false);
      }
    },
    onTouch: function onTouch(element, eventType, handler) {
      var self = this;
      this.bindDom(element, ionic.Gestures.EVENT_TYPES[eventType], function bindDomOnTouch(ev) {
        var sourceEventType = ev.type.toLowerCase();
        if (sourceEventType.match(/mouse/) && touch_triggered) {
          return;
        } else if (sourceEventType.match(/touch/) || sourceEventType.match(/pointerdown/) || sourceEventType.match(/mouse/) && ev.which === 1) {
          enable_detect = true;
        } else if (sourceEventType.match(/mouse/) && ev.which !== 1) {
          enable_detect = false;
        }
        if (sourceEventType.match(/touch|pointer/)) {
          touch_triggered = true;
        }
        var count_touches = 0;
        if (enable_detect) {
          if (ionic.Gestures.HAS_POINTEREVENTS && eventType != ionic.Gestures.EVENT_END) {
            count_touches = ionic.Gestures.PointerEvent.updatePointer(eventType, ev);
          } else if (sourceEventType.match(/touch/)) {
            count_touches = ev.touches.length;
          } else if (!touch_triggered) {
            count_touches = sourceEventType.match(/up/) ? 0 : 1;
          }
          if (count_touches > 0 && eventType == ionic.Gestures.EVENT_END) {
            eventType = ionic.Gestures.EVENT_MOVE;
          } else if (!count_touches) {
            eventType = ionic.Gestures.EVENT_END;
          }
          if (count_touches || last_move_event === null) {
            last_move_event = ev;
          }
          handler.call(ionic.Gestures.detection, self.collectEventData(element, eventType, self.getTouchList(last_move_event, eventType), ev));
          if (ionic.Gestures.HAS_POINTEREVENTS && eventType == ionic.Gestures.EVENT_END) {
            count_touches = ionic.Gestures.PointerEvent.updatePointer(eventType, ev);
          }
        }
        if (!count_touches) {
          last_move_event = null;
          enable_detect = false;
          touch_triggered = false;
          ionic.Gestures.PointerEvent.reset();
        }
      });
    },
    determineEventTypes: function determineEventTypes() {
      var types;
      if (ionic.Gestures.HAS_POINTEREVENTS) {
        types = ionic.Gestures.PointerEvent.getEvents();
      } else if (ionic.Gestures.NO_MOUSEEVENTS) {
        types = [
          'touchstart',
          'touchmove',
          'touchend touchcancel'
        ];
      } else {
        types = [
          'touchstart mousedown',
          'touchmove mousemove',
          'touchend touchcancel mouseup'
        ];
      }
      ionic.Gestures.EVENT_TYPES[ionic.Gestures.EVENT_START] = types[0];
      ionic.Gestures.EVENT_TYPES[ionic.Gestures.EVENT_MOVE] = types[1];
      ionic.Gestures.EVENT_TYPES[ionic.Gestures.EVENT_END] = types[2];
    },
    getTouchList: function getTouchList(ev) {
      if (ionic.Gestures.HAS_POINTEREVENTS) {
        return ionic.Gestures.PointerEvent.getTouchList();
      } else if (ev.touches) {
        return ev.touches;
      } else {
        ev.indentifier = 1;
        return [ev];
      }
    },
    collectEventData: function collectEventData(element, eventType, touches, ev) {
      var pointerType = ionic.Gestures.POINTER_TOUCH;
      if (ev.type.match(/mouse/) || ionic.Gestures.PointerEvent.matchType(ionic.Gestures.POINTER_MOUSE, ev)) {
        pointerType = ionic.Gestures.POINTER_MOUSE;
      }
      return {
        center: ionic.Gestures.utils.getCenter(touches),
        timeStamp: new Date().getTime(),
        target: ev.target,
        touches: touches,
        eventType: eventType,
        pointerType: pointerType,
        srcEvent: ev,
        preventDefault: function () {
          if (this.srcEvent.preventManipulation) {
            this.srcEvent.preventManipulation();
          }
          if (this.srcEvent.preventDefault) {
          }
        },
        stopPropagation: function () {
          this.srcEvent.stopPropagation();
        },
        stopDetect: function () {
          return ionic.Gestures.detection.stopDetect();
        }
      };
    }
  };
  ionic.Gestures.PointerEvent = {
    pointers: {},
    getTouchList: function () {
      var self = this;
      var touchlist = [];
      Object.keys(self.pointers).sort().forEach(function (id) {
        touchlist.push(self.pointers[id]);
      });
      return touchlist;
    },
    updatePointer: function (type, pointerEvent) {
      if (type == ionic.Gestures.EVENT_END) {
        this.pointers = {};
      } else {
        pointerEvent.identifier = pointerEvent.pointerId;
        this.pointers[pointerEvent.pointerId] = pointerEvent;
      }
      return Object.keys(this.pointers).length;
    },
    matchType: function (pointerType, ev) {
      if (!ev.pointerType) {
        return false;
      }
      var types = {};
      types[ionic.Gestures.POINTER_MOUSE] = ev.pointerType == ev.MSPOINTER_TYPE_MOUSE || ev.pointerType == ionic.Gestures.POINTER_MOUSE;
      types[ionic.Gestures.POINTER_TOUCH] = ev.pointerType == ev.MSPOINTER_TYPE_TOUCH || ev.pointerType == ionic.Gestures.POINTER_TOUCH;
      types[ionic.Gestures.POINTER_PEN] = ev.pointerType == ev.MSPOINTER_TYPE_PEN || ev.pointerType == ionic.Gestures.POINTER_PEN;
      return types[pointerType];
    },
    getEvents: function () {
      return [
        'pointerdown MSPointerDown',
        'pointermove MSPointerMove',
        'pointerup pointercancel MSPointerUp MSPointerCancel'
      ];
    },
    reset: function () {
      this.pointers = {};
    }
  };
  ionic.Gestures.utils = {
    extend: function extend(dest, src, merge) {
      for (var key in src) {
        if (dest[key] !== undefined && merge) {
          continue;
        }
        dest[key] = src[key];
      }
      return dest;
    },
    hasParent: function (node, parent) {
      while (node) {
        if (node == parent) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    },
    getCenter: function getCenter(touches) {
      var valuesX = [], valuesY = [];
      for (var t = 0, len = touches.length; t < len; t++) {
        valuesX.push(touches[t].pageX);
        valuesY.push(touches[t].pageY);
      }
      return {
        pageX: (Math.min.apply(Math, valuesX) + Math.max.apply(Math, valuesX)) / 2,
        pageY: (Math.min.apply(Math, valuesY) + Math.max.apply(Math, valuesY)) / 2
      };
    },
    getVelocity: function getVelocity(delta_time, delta_x, delta_y) {
      return {
        x: Math.abs(delta_x / delta_time) || 0,
        y: Math.abs(delta_y / delta_time) || 0
      };
    },
    getAngle: function getAngle(touch1, touch2) {
      var y = touch2.pageY - touch1.pageY, x = touch2.pageX - touch1.pageX;
      return Math.atan2(y, x) * 180 / Math.PI;
    },
    getDirection: function getDirection(touch1, touch2) {
      var x = Math.abs(touch1.pageX - touch2.pageX), y = Math.abs(touch1.pageY - touch2.pageY);
      if (x >= y) {
        return touch1.pageX - touch2.pageX > 0 ? ionic.Gestures.DIRECTION_LEFT : ionic.Gestures.DIRECTION_RIGHT;
      } else {
        return touch1.pageY - touch2.pageY > 0 ? ionic.Gestures.DIRECTION_UP : ionic.Gestures.DIRECTION_DOWN;
      }
    },
    getDistance: function getDistance(touch1, touch2) {
      var x = touch2.pageX - touch1.pageX, y = touch2.pageY - touch1.pageY;
      return Math.sqrt(x * x + y * y);
    },
    getScale: function getScale(start, end) {
      if (start.length >= 2 && end.length >= 2) {
        return this.getDistance(end[0], end[1]) / this.getDistance(start[0], start[1]);
      }
      return 1;
    },
    getRotation: function getRotation(start, end) {
      if (start.length >= 2 && end.length >= 2) {
        return this.getAngle(end[1], end[0]) - this.getAngle(start[1], start[0]);
      }
      return 0;
    },
    isVertical: function isVertical(direction) {
      return direction == ionic.Gestures.DIRECTION_UP || direction == ionic.Gestures.DIRECTION_DOWN;
    },
    stopDefaultBrowserBehavior: function stopDefaultBrowserBehavior(element, css_props) {
      var prop, vendors = [
          'webkit',
          'khtml',
          'moz',
          'Moz',
          'ms',
          'o',
          ''
        ];
      if (!css_props || !element.style) {
        return;
      }
      for (var i = 0; i < vendors.length; i++) {
        for (var p in css_props) {
          if (css_props.hasOwnProperty(p)) {
            prop = p;
            if (vendors[i]) {
              prop = vendors[i] + prop.substring(0, 1).toUpperCase() + prop.substring(1);
            }
            element.style[prop] = css_props[p];
          }
        }
      }
      if (css_props.userSelect == 'none') {
        element.onselectstart = function () {
          return false;
        };
      }
    }
  };
  ionic.Gestures.detection = {
    gestures: [],
    current: null,
    previous: null,
    stopped: false,
    startDetect: function startDetect(inst, eventData) {
      if (this.current) {
        return;
      }
      this.stopped = false;
      this.current = {
        inst: inst,
        startEvent: ionic.Gestures.utils.extend({}, eventData),
        lastEvent: false,
        name: ''
      };
      this.detect(eventData);
    },
    detect: function detect(eventData) {
      if (!this.current || this.stopped) {
        return;
      }
      eventData = this.extendEventData(eventData);
      var inst_options = this.current.inst.options;
      for (var g = 0, len = this.gestures.length; g < len; g++) {
        var gesture = this.gestures[g];
        if (!this.stopped && inst_options[gesture.name] !== false) {
          if (gesture.handler.call(gesture, eventData, this.current.inst) === false) {
            this.stopDetect();
            break;
          }
        }
      }
      if (this.current) {
        this.current.lastEvent = eventData;
      }
      if (eventData.eventType == ionic.Gestures.EVENT_END && !eventData.touches.length - 1) {
        this.stopDetect();
      }
      return eventData;
    },
    stopDetect: function stopDetect() {
      this.previous = ionic.Gestures.utils.extend({}, this.current);
      this.current = null;
      this.stopped = true;
    },
    extendEventData: function extendEventData(ev) {
      var startEv = this.current.startEvent;
      if (startEv && (ev.touches.length != startEv.touches.length || ev.touches === startEv.touches)) {
        startEv.touches = [];
        for (var i = 0, len = ev.touches.length; i < len; i++) {
          startEv.touches.push(ionic.Gestures.utils.extend({}, ev.touches[i]));
        }
      }
      var delta_time = ev.timeStamp - startEv.timeStamp, delta_x = ev.center.pageX - startEv.center.pageX, delta_y = ev.center.pageY - startEv.center.pageY, velocity = ionic.Gestures.utils.getVelocity(delta_time, delta_x, delta_y);
      ionic.Gestures.utils.extend(ev, {
        deltaTime: delta_time,
        deltaX: delta_x,
        deltaY: delta_y,
        velocityX: velocity.x,
        velocityY: velocity.y,
        distance: ionic.Gestures.utils.getDistance(startEv.center, ev.center),
        angle: ionic.Gestures.utils.getAngle(startEv.center, ev.center),
        direction: ionic.Gestures.utils.getDirection(startEv.center, ev.center),
        scale: ionic.Gestures.utils.getScale(startEv.touches, ev.touches),
        rotation: ionic.Gestures.utils.getRotation(startEv.touches, ev.touches),
        startEvent: startEv
      });
      return ev;
    },
    register: function register(gesture) {
      var options = gesture.defaults || {};
      if (options[gesture.name] === undefined) {
        options[gesture.name] = true;
      }
      ionic.Gestures.utils.extend(ionic.Gestures.defaults, options, true);
      gesture.index = gesture.index || 1000;
      this.gestures.push(gesture);
      this.gestures.sort(function (a, b) {
        if (a.index < b.index) {
          return -1;
        }
        if (a.index > b.index) {
          return 1;
        }
        return 0;
      });
      return this.gestures;
    }
  };
  ionic.Gestures.gestures = ionic.Gestures.gestures || {};
  ionic.Gestures.gestures.Hold = {
    name: 'hold',
    index: 10,
    defaults: {
      hold_timeout: 500,
      hold_threshold: 1
    },
    timer: null,
    handler: function holdGesture(ev, inst) {
      switch (ev.eventType) {
      case ionic.Gestures.EVENT_START:
        clearTimeout(this.timer);
        ionic.Gestures.detection.current.name = this.name;
        this.timer = setTimeout(function () {
          if (ionic.Gestures.detection.current.name == 'hold') {
            inst.trigger('hold', ev);
          }
        }, inst.options.hold_timeout);
        break;
      case ionic.Gestures.EVENT_MOVE:
        if (ev.distance > inst.options.hold_threshold) {
          clearTimeout(this.timer);
        }
        break;
      case ionic.Gestures.EVENT_END:
        clearTimeout(this.timer);
        break;
      }
    }
  };
  ionic.Gestures.gestures.Tap = {
    name: 'tap',
    index: 100,
    defaults: {
      tap_max_touchtime: 250,
      tap_max_distance: 10,
      tap_always: true,
      doubletap_distance: 20,
      doubletap_interval: 300
    },
    handler: function tapGesture(ev, inst) {
      if (ev.eventType == ionic.Gestures.EVENT_END) {
        var prev = ionic.Gestures.detection.previous, did_doubletap = false;
        if (ev.deltaTime > inst.options.tap_max_touchtime || ev.distance > inst.options.tap_max_distance) {
          return;
        }
        if (prev && prev.name == 'tap' && ev.timeStamp - prev.lastEvent.timeStamp < inst.options.doubletap_interval && ev.distance < inst.options.doubletap_distance) {
          inst.trigger('doubletap', ev);
          did_doubletap = true;
        }
        if (!did_doubletap || inst.options.tap_always) {
          ionic.Gestures.detection.current.name = 'tap';
          inst.trigger(ionic.Gestures.detection.current.name, ev);
        }
      }
    }
  };
  ionic.Gestures.gestures.Swipe = {
    name: 'swipe',
    index: 40,
    defaults: {
      swipe_max_touches: 1,
      swipe_velocity: 0.7
    },
    handler: function swipeGesture(ev, inst) {
      if (ev.eventType == ionic.Gestures.EVENT_END) {
        if (inst.options.swipe_max_touches > 0 && ev.touches.length > inst.options.swipe_max_touches) {
          return;
        }
        if (ev.velocityX > inst.options.swipe_velocity || ev.velocityY > inst.options.swipe_velocity) {
          inst.trigger(this.name, ev);
          inst.trigger(this.name + ev.direction, ev);
        }
      }
    }
  };
  ionic.Gestures.gestures.Drag = {
    name: 'drag',
    index: 50,
    defaults: {
      drag_min_distance: 10,
      correct_for_drag_min_distance: true,
      drag_max_touches: 1,
      drag_block_horizontal: true,
      drag_block_vertical: true,
      drag_lock_to_axis: false,
      drag_lock_min_distance: 25
    },
    triggered: false,
    handler: function dragGesture(ev, inst) {
      if (ionic.Gestures.detection.current.name != this.name && this.triggered) {
        inst.trigger(this.name + 'end', ev);
        this.triggered = false;
        return;
      }
      if (inst.options.drag_max_touches > 0 && ev.touches.length > inst.options.drag_max_touches) {
        return;
      }
      switch (ev.eventType) {
      case ionic.Gestures.EVENT_START:
        this.triggered = false;
        break;
      case ionic.Gestures.EVENT_MOVE:
        if (ev.distance < inst.options.drag_min_distance && ionic.Gestures.detection.current.name != this.name) {
          return;
        }
        if (ionic.Gestures.detection.current.name != this.name) {
          ionic.Gestures.detection.current.name = this.name;
          if (inst.options.correct_for_drag_min_distance) {
            var factor = Math.abs(inst.options.drag_min_distance / ev.distance);
            ionic.Gestures.detection.current.startEvent.center.pageX += ev.deltaX * factor;
            ionic.Gestures.detection.current.startEvent.center.pageY += ev.deltaY * factor;
            ev = ionic.Gestures.detection.extendEventData(ev);
          }
        }
        if (ionic.Gestures.detection.current.lastEvent.drag_locked_to_axis || inst.options.drag_lock_to_axis && inst.options.drag_lock_min_distance <= ev.distance) {
          ev.drag_locked_to_axis = true;
        }
        var last_direction = ionic.Gestures.detection.current.lastEvent.direction;
        if (ev.drag_locked_to_axis && last_direction !== ev.direction) {
          if (ionic.Gestures.utils.isVertical(last_direction)) {
            ev.direction = ev.deltaY < 0 ? ionic.Gestures.DIRECTION_UP : ionic.Gestures.DIRECTION_DOWN;
          } else {
            ev.direction = ev.deltaX < 0 ? ionic.Gestures.DIRECTION_LEFT : ionic.Gestures.DIRECTION_RIGHT;
          }
        }
        if (!this.triggered) {
          inst.trigger(this.name + 'start', ev);
          this.triggered = true;
        }
        inst.trigger(this.name, ev);
        inst.trigger(this.name + ev.direction, ev);
        if (inst.options.drag_block_vertical && ionic.Gestures.utils.isVertical(ev.direction) || inst.options.drag_block_horizontal && !ionic.Gestures.utils.isVertical(ev.direction)) {
          ev.preventDefault();
        }
        break;
      case ionic.Gestures.EVENT_END:
        if (this.triggered) {
          inst.trigger(this.name + 'end', ev);
        }
        this.triggered = false;
        break;
      }
    }
  };
  ionic.Gestures.gestures.Transform = {
    name: 'transform',
    index: 45,
    defaults: {
      transform_min_scale: 0.01,
      transform_min_rotation: 1,
      transform_always_block: false
    },
    triggered: false,
    handler: function transformGesture(ev, inst) {
      if (ionic.Gestures.detection.current.name != this.name && this.triggered) {
        inst.trigger(this.name + 'end', ev);
        this.triggered = false;
        return;
      }
      if (ev.touches.length < 2) {
        return;
      }
      if (inst.options.transform_always_block) {
        ev.preventDefault();
      }
      switch (ev.eventType) {
      case ionic.Gestures.EVENT_START:
        this.triggered = false;
        break;
      case ionic.Gestures.EVENT_MOVE:
        var scale_threshold = Math.abs(1 - ev.scale);
        var rotation_threshold = Math.abs(ev.rotation);
        if (scale_threshold < inst.options.transform_min_scale && rotation_threshold < inst.options.transform_min_rotation) {
          return;
        }
        ionic.Gestures.detection.current.name = this.name;
        if (!this.triggered) {
          inst.trigger(this.name + 'start', ev);
          this.triggered = true;
        }
        inst.trigger(this.name, ev);
        if (rotation_threshold > inst.options.transform_min_rotation) {
          inst.trigger('rotate', ev);
        }
        if (scale_threshold > inst.options.transform_min_scale) {
          inst.trigger('pinch', ev);
          inst.trigger('pinch' + (ev.scale < 1 ? 'in' : 'out'), ev);
        }
        break;
      case ionic.Gestures.EVENT_END:
        if (this.triggered) {
          inst.trigger(this.name + 'end', ev);
        }
        this.triggered = false;
        break;
      }
    }
  };
  ionic.Gestures.gestures.Touch = {
    name: 'touch',
    index: -Infinity,
    defaults: {
      prevent_default: false,
      prevent_mouseevents: false
    },
    handler: function touchGesture(ev, inst) {
      if (inst.options.prevent_mouseevents && ev.pointerType == ionic.Gestures.POINTER_MOUSE) {
        ev.stopDetect();
        return;
      }
      if (inst.options.prevent_default) {
        ev.preventDefault();
      }
      if (ev.eventType == ionic.Gestures.EVENT_START) {
        inst.trigger(this.name, ev);
      }
    }
  };
  ionic.Gestures.gestures.Release = {
    name: 'release',
    index: Infinity,
    handler: function releaseGesture(ev, inst) {
      if (ev.eventType == ionic.Gestures.EVENT_END) {
        inst.trigger(this.name, ev);
      }
    }
  };
}(window.ionic));
;
(function (ionic) {
  ionic.Platform = {
    detect: function () {
      var platforms = [];
      this._checkPlatforms(platforms);
      for (var i = 0; i < platforms.length; i++) {
        document.body.classList.add('platform-' + platforms[i]);
      }
    },
    _checkPlatforms: function (platforms) {
      if (this.isCordova()) {
        platforms.push('cordova');
      }
      if (this.isIOS7()) {
        platforms.push('ios7');
      }
    },
    isCordova: function () {
      return window.cordova || window.PhoneGap || window.phonegap;
    },
    isIOS7: function () {
      if (!window.device) {
        return false;
      }
      return parseFloat(window.device.version) >= 7;
    }
  };
  ionic.Platform.detect();
}(window.ionic));
;
(function (window, document, ionic) {
  'use strict';
  window.rAF = function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  }();
  ionic.CSS = {};
  (function () {
    var d = document.createElement('div');
    var keys = [
        'webkitTransform',
        'transform',
        '-webkit-transform',
        'webkit-transform',
        '-moz-transform',
        'moz-transform',
        'MozTransform',
        'mozTransform'
      ];
    for (var i = 0; i < keys.length; i++) {
      if (d.style[keys[i]] !== undefined) {
        ionic.CSS.TRANSFORM = keys[i];
        break;
      }
    }
  }());
  function inputTapPolyfill(ele, e) {
    if (ele.type === 'radio' || ele.type === 'checkbox') {
    } else if (ele.type === 'submit' || ele.type === 'button') {
      ionic.trigger('click', { target: ele });
    } else {
      ele.focus();
    }
    e.stopPropagation();
    e.preventDefault();
    return false;
  }
  function tapPolyfill(e) {
    if (!e.gesture || e.gesture.pointerType !== 'touch' || !e.gesture.srcEvent)
      return;
    if (e.alreadyHandled) {
      return;
    }
    e = e.gesture.srcEvent;
    var ele = e.target;
    while (ele) {
      if (ele.tagName === 'INPUT' || ele.tagName === 'TEXTAREA' || ele.tagName === 'SELECT') {
        return inputTapPolyfill(ele, e);
      } else if (ele.tagName === 'LABEL') {
        if (ele.control) {
          return inputTapPolyfill(ele.control, e);
        }
      } else if (ele.tagName === 'A' || ele.tagName === 'BUTTON') {
        ionic.trigger('click', { target: ele });
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
      ele = ele.parentElement;
    }
    var activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT')) {
      activeElement.blur();
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
  }
  ionic.on('tap', tapPolyfill, window);
}(this, document, ionic));
;
(function (ionic) {
  ionic.Utils = {
    arrayMove: function (arr, old_index, new_index) {
      if (new_index >= arr.length) {
        var k = new_index - arr.length;
        while (k-- + 1) {
          arr.push(undefined);
        }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr;
    },
    proxy: function (func, context) {
      var args = Array.prototype.slice.call(arguments, 2);
      return function () {
        return func.apply(context, args.concat(Array.prototype.slice.call(arguments)));
      };
    },
    debounce: function (func, wait, immediate) {
      var timeout, args, context, timestamp, result;
      return function () {
        context = this;
        args = arguments;
        timestamp = new Date();
        var later = function () {
          var last = new Date() - timestamp;
          if (last < wait) {
            timeout = setTimeout(later, wait - last);
          } else {
            timeout = null;
            if (!immediate)
              result = func.apply(context, args);
          }
        };
        var callNow = immediate && !timeout;
        if (!timeout) {
          timeout = setTimeout(later, wait);
        }
        if (callNow)
          result = func.apply(context, args);
        return result;
      };
    },
    throttle: function (func, wait, options) {
      var context, args, result;
      var timeout = null;
      var previous = 0;
      options || (options = {});
      var later = function () {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
      };
      return function () {
        var now = Date.now();
        if (!previous && options.leading === false)
          previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    },
    inherit: function (protoProps, staticProps) {
      var parent = this;
      var child;
      if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
      } else {
        child = function () {
          return parent.apply(this, arguments);
        };
      }
      ionic.extend(child, parent, staticProps);
      var Surrogate = function () {
        this.constructor = child;
      };
      Surrogate.prototype = parent.prototype;
      child.prototype = new Surrogate();
      if (protoProps)
        ionic.extend(child.prototype, protoProps);
      child.__super__ = parent.prototype;
      return child;
    },
    extend: function (obj) {
      var args = Array.prototype.slice.call(arguments, 1);
      for (var i = 0; i < args.length; i++) {
        var source = args[i];
        if (source) {
          for (var prop in source) {
            obj[prop] = source[prop];
          }
        }
      }
      return obj;
    }
  };
  ionic.inherit = ionic.Utils.inherit;
  ionic.extend = ionic.Utils.extend;
  ionic.throttle = ionic.Utils.throttle;
  ionic.proxy = ionic.Utils.proxy;
  ionic.debounce = ionic.Utils.debounce;
}(window.ionic));
;
(function (ionic) {
  'use strict';
  ionic.views.View = function () {
    this.initialize.apply(this, arguments);
  };
  ionic.views.View.inherit = ionic.inherit;
  ionic.extend(ionic.views.View.prototype, {
    initialize: function () {
    }
  });
}(window.ionic));
;
(function (global) {
  var time = Date.now || function () {
      return +new Date();
    };
  var desiredFrames = 60;
  var millisecondsPerSecond = 1000;
  var running = {};
  var counter = 1;
  if (!global.core) {
    global.core = { effect: {} };
  } else if (!core.effect) {
    core.effect = {};
  }
  core.effect.Animate = {
    requestAnimationFrame: function () {
      var requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame;
      var isNative = !!requestFrame;
      if (requestFrame && !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test(requestFrame.toString())) {
        isNative = false;
      }
      if (isNative) {
        return function (callback, root) {
          requestFrame(callback, root);
        };
      }
      var TARGET_FPS = 60;
      var requests = {};
      var requestCount = 0;
      var rafHandle = 1;
      var intervalHandle = null;
      var lastActive = +new Date();
      return function (callback, root) {
        var callbackHandle = rafHandle++;
        requests[callbackHandle] = callback;
        requestCount++;
        if (intervalHandle === null) {
          intervalHandle = setInterval(function () {
            var time = +new Date();
            var currentRequests = requests;
            requests = {};
            requestCount = 0;
            for (var key in currentRequests) {
              if (currentRequests.hasOwnProperty(key)) {
                currentRequests[key](time);
                lastActive = time;
              }
            }
            if (time - lastActive > 2500) {
              clearInterval(intervalHandle);
              intervalHandle = null;
            }
          }, 1000 / TARGET_FPS);
        }
        return callbackHandle;
      };
    }(),
    stop: function (id) {
      var cleared = running[id] != null;
      if (cleared) {
        running[id] = null;
      }
      return cleared;
    },
    isRunning: function (id) {
      return running[id] != null;
    },
    start: function (stepCallback, verifyCallback, completedCallback, duration, easingMethod, root) {
      var start = time();
      var lastFrame = start;
      var percent = 0;
      var dropCounter = 0;
      var id = counter++;
      if (!root) {
        root = document.body;
      }
      if (id % 20 === 0) {
        var newRunning = {};
        for (var usedId in running) {
          newRunning[usedId] = true;
        }
        running = newRunning;
      }
      var step = function (virtual) {
        var render = virtual !== true;
        var now = time();
        if (!running[id] || verifyCallback && !verifyCallback(id)) {
          running[id] = null;
          completedCallback && completedCallback(desiredFrames - dropCounter / ((now - start) / millisecondsPerSecond), id, false);
          return;
        }
        if (render) {
          var droppedFrames = Math.round((now - lastFrame) / (millisecondsPerSecond / desiredFrames)) - 1;
          for (var j = 0; j < Math.min(droppedFrames, 4); j++) {
            step(true);
            dropCounter++;
          }
        }
        if (duration) {
          percent = (now - start) / duration;
          if (percent > 1) {
            percent = 1;
          }
        }
        var value = easingMethod ? easingMethod(percent) : percent;
        if ((stepCallback(value, now, render) === false || percent === 1) && render) {
          running[id] = null;
          completedCallback && completedCallback(desiredFrames - dropCounter / ((now - start) / millisecondsPerSecond), id, percent === 1 || duration == null);
        } else if (render) {
          lastFrame = now;
          core.effect.Animate.requestAnimationFrame(step, root);
        }
      };
      running[id] = true;
      core.effect.Animate.requestAnimationFrame(step, root);
      return id;
    }
  };
}(this));
var Scroller;
(function (ionic) {
  var NOOP = function () {
  };
  var easeOutCubic = function (pos) {
    return Math.pow(pos - 1, 3) + 1;
  };
  var easeInOutCubic = function (pos) {
    if ((pos /= 0.5) < 1) {
      return 0.5 * Math.pow(pos, 3);
    }
    return 0.5 * (Math.pow(pos - 2, 3) + 2);
  };
  ionic.views.Scroll = ionic.views.View.inherit({
    initialize: function (options) {
      this.__container = options.el;
      this.__content = options.el.firstElementChild;
      this.options = {
        scrollingX: false,
        scrollingY: true,
        animating: true,
        animationDuration: 250,
        bouncing: true,
        locking: true,
        paging: false,
        snapping: false,
        zooming: false,
        minZoom: 0.5,
        maxZoom: 3,
        speedMultiplier: 1,
        scrollingComplete: NOOP,
        penetrationDeceleration: 0.03,
        penetrationAcceleration: 0.08
      };
      for (var key in options) {
        this.options[key] = options[key];
      }
      this.__callback = this.getRenderFn();
      this.__initEventHandlers();
      this.resize();
    },
    __isSingleTouch: false,
    __isTracking: false,
    __didDecelerationComplete: false,
    __isGesturing: false,
    __isDragging: false,
    __isDecelerating: false,
    __isAnimating: false,
    __clientLeft: 0,
    __clientTop: 0,
    __clientWidth: 0,
    __clientHeight: 0,
    __contentWidth: 0,
    __contentHeight: 0,
    __snapWidth: 100,
    __snapHeight: 100,
    __refreshHeight: null,
    __refreshActive: false,
    __refreshActivate: null,
    __refreshDeactivate: null,
    __refreshStart: null,
    __zoomLevel: 1,
    __scrollLeft: 0,
    __scrollTop: 0,
    __maxScrollLeft: 0,
    __maxScrollTop: 0,
    __scheduledLeft: 0,
    __scheduledTop: 0,
    __scheduledZoom: 0,
    __lastTouchLeft: null,
    __lastTouchTop: null,
    __lastTouchMove: null,
    __positions: null,
    __minDecelerationScrollLeft: null,
    __minDecelerationScrollTop: null,
    __maxDecelerationScrollLeft: null,
    __maxDecelerationScrollTop: null,
    __decelerationVelocityX: null,
    __decelerationVelocityY: null,
    __initEventHandlers: function () {
      var self = this;
      var container = this.__container;
      if ('ontouchstart' in window) {
        container.addEventListener('touchstart', function (e) {
          if (e.target.tagName.match(/input|textarea|select/i)) {
            return;
          }
          self.doTouchStart(e.touches, e.timeStamp);
          e.preventDefault();
        }, false);
        document.addEventListener('touchmove', function (e) {
          if (e.defaultPrevented) {
            return;
          }
          self.doTouchMove(e.touches, e.timeStamp);
        }, false);
        document.addEventListener('touchend', function (e) {
          self.doTouchEnd(e.timeStamp);
        }, false);
      } else {
        var mousedown = false;
        container.addEventListener('mousedown', function (e) {
          if (e.target.tagName.match(/input|textarea|select/i)) {
            return;
          }
          self.doTouchStart([{
              pageX: e.pageX,
              pageY: e.pageY
            }], e.timeStamp);
          mousedown = true;
        }, false);
        document.addEventListener('mousemove', function (e) {
          if (!mousedown || e.defaultPrevented) {
            return;
          }
          self.doTouchMove([{
              pageX: e.pageX,
              pageY: e.pageY
            }], e.timeStamp);
          mousedown = true;
        }, false);
        document.addEventListener('mouseup', function (e) {
          if (!mousedown) {
            return;
          }
          self.doTouchEnd(e.timeStamp);
          mousedown = false;
        }, false);
      }
    },
    resize: function () {
      this.setDimensions(Math.min(this.__container.clientWidth, this.__container.parentElement.clientWidth), Math.min(this.__container.clientHeight, this.__container.parentElement.clientHeight), this.__content.offsetWidth, this.__content.offsetHeight + 20);
    },
    getRenderFn: function () {
      var content = this.__content;
      var docStyle = document.documentElement.style;
      var engine;
      if ('MozAppearance' in docStyle) {
        engine = 'gecko';
      } else if ('WebkitAppearance' in docStyle) {
        engine = 'webkit';
      } else if (typeof navigator.cpuClass === 'string') {
        engine = 'trident';
      }
      var vendorPrefix = {
          trident: 'ms',
          gecko: 'Moz',
          webkit: 'Webkit',
          presto: 'O'
        }[engine];
      var helperElem = document.createElement('div');
      var undef;
      var perspectiveProperty = vendorPrefix + 'Perspective';
      var transformProperty = vendorPrefix + 'Transform';
      if (helperElem.style[perspectiveProperty] !== undef) {
        return function (left, top, zoom) {
          content.style[transformProperty] = 'translate3d(' + -left + 'px,' + -top + 'px,0) scale(' + zoom + ')';
        };
      } else if (helperElem.style[transformProperty] !== undef) {
        return function (left, top, zoom) {
          content.style[transformProperty] = 'translate(' + -left + 'px,' + -top + 'px) scale(' + zoom + ')';
        };
      } else {
        return function (left, top, zoom) {
          content.style.marginLeft = left ? -left / zoom + 'px' : '';
          content.style.marginTop = top ? -top / zoom + 'px' : '';
          content.style.zoom = zoom || '';
        };
      }
    },
    setDimensions: function (clientWidth, clientHeight, contentWidth, contentHeight) {
      var self = this;
      if (clientWidth === +clientWidth) {
        self.__clientWidth = clientWidth;
      }
      if (clientHeight === +clientHeight) {
        self.__clientHeight = clientHeight;
      }
      if (contentWidth === +contentWidth) {
        self.__contentWidth = contentWidth;
      }
      if (contentHeight === +contentHeight) {
        self.__contentHeight = contentHeight;
      }
      self.__computeScrollMax();
      self.scrollTo(self.__scrollLeft, self.__scrollTop, true);
    },
    setPosition: function (left, top) {
      var self = this;
      self.__clientLeft = left || 0;
      self.__clientTop = top || 0;
    },
    setSnapSize: function (width, height) {
      var self = this;
      self.__snapWidth = width;
      self.__snapHeight = height;
    },
    activatePullToRefresh: function (height, activateCallback, deactivateCallback, startCallback) {
      var self = this;
      self.__refreshHeight = height;
      self.__refreshActivate = activateCallback;
      self.__refreshDeactivate = deactivateCallback;
      self.__refreshStart = startCallback;
    },
    triggerPullToRefresh: function () {
      this.__publish(this.__scrollLeft, -this.__refreshHeight, this.__zoomLevel, true);
      if (this.__refreshStart) {
        this.__refreshStart();
      }
    },
    finishPullToRefresh: function () {
      var self = this;
      self.__refreshActive = false;
      if (self.__refreshDeactivate) {
        self.__refreshDeactivate();
      }
      self.scrollTo(self.__scrollLeft, self.__scrollTop, true);
    },
    getValues: function () {
      var self = this;
      return {
        left: self.__scrollLeft,
        top: self.__scrollTop,
        zoom: self.__zoomLevel
      };
    },
    getScrollMax: function () {
      var self = this;
      return {
        left: self.__maxScrollLeft,
        top: self.__maxScrollTop
      };
    },
    zoomTo: function (level, animate, originLeft, originTop) {
      var self = this;
      if (!self.options.zooming) {
        throw new Error('Zooming is not enabled!');
      }
      if (self.__isDecelerating) {
        core.effect.Animate.stop(self.__isDecelerating);
        self.__isDecelerating = false;
      }
      var oldLevel = self.__zoomLevel;
      if (originLeft == null) {
        originLeft = self.__clientWidth / 2;
      }
      if (originTop == null) {
        originTop = self.__clientHeight / 2;
      }
      level = Math.max(Math.min(level, self.options.maxZoom), self.options.minZoom);
      self.__computeScrollMax(level);
      var left = (originLeft + self.__scrollLeft) * level / oldLevel - originLeft;
      var top = (originTop + self.__scrollTop) * level / oldLevel - originTop;
      if (left > self.__maxScrollLeft) {
        left = self.__maxScrollLeft;
      } else if (left < 0) {
        left = 0;
      }
      if (top > self.__maxScrollTop) {
        top = self.__maxScrollTop;
      } else if (top < 0) {
        top = 0;
      }
      self.__publish(left, top, level, animate);
    },
    zoomBy: function (factor, animate, originLeft, originTop) {
      var self = this;
      self.zoomTo(self.__zoomLevel * factor, animate, originLeft, originTop);
    },
    scrollTo: function (left, top, animate, zoom) {
      var self = this;
      if (self.__isDecelerating) {
        core.effect.Animate.stop(self.__isDecelerating);
        self.__isDecelerating = false;
      }
      if (zoom != null && zoom !== self.__zoomLevel) {
        if (!self.options.zooming) {
          throw new Error('Zooming is not enabled!');
        }
        left *= zoom;
        top *= zoom;
        self.__computeScrollMax(zoom);
      } else {
        zoom = self.__zoomLevel;
      }
      if (!self.options.scrollingX) {
        left = self.__scrollLeft;
      } else {
        if (self.options.paging) {
          left = Math.round(left / self.__clientWidth) * self.__clientWidth;
        } else if (self.options.snapping) {
          left = Math.round(left / self.__snapWidth) * self.__snapWidth;
        }
      }
      if (!self.options.scrollingY) {
        top = self.__scrollTop;
      } else {
        if (self.options.paging) {
          top = Math.round(top / self.__clientHeight) * self.__clientHeight;
        } else if (self.options.snapping) {
          top = Math.round(top / self.__snapHeight) * self.__snapHeight;
        }
      }
      left = Math.max(Math.min(self.__maxScrollLeft, left), 0);
      top = Math.max(Math.min(self.__maxScrollTop, top), 0);
      if (left === self.__scrollLeft && top === self.__scrollTop) {
        animate = false;
      }
      self.__publish(left, top, zoom, animate);
    },
    scrollBy: function (left, top, animate) {
      var self = this;
      var startLeft = self.__isAnimating ? self.__scheduledLeft : self.__scrollLeft;
      var startTop = self.__isAnimating ? self.__scheduledTop : self.__scrollTop;
      self.scrollTo(startLeft + (left || 0), startTop + (top || 0), animate);
    },
    doMouseZoom: function (wheelDelta, timeStamp, pageX, pageY) {
      var self = this;
      var change = wheelDelta > 0 ? 0.97 : 1.03;
      return self.zoomTo(self.__zoomLevel * change, false, pageX - self.__clientLeft, pageY - self.__clientTop);
    },
    doTouchStart: function (touches, timeStamp) {
      if (touches.length == null) {
        throw new Error('Invalid touch list: ' + touches);
      }
      if (timeStamp instanceof Date) {
        timeStamp = timeStamp.valueOf();
      }
      if (typeof timeStamp !== 'number') {
        throw new Error('Invalid timestamp value: ' + timeStamp);
      }
      var self = this;
      self.__interruptedAnimation = true;
      if (self.__isDecelerating) {
        core.effect.Animate.stop(self.__isDecelerating);
        self.__isDecelerating = false;
        self.__interruptedAnimation = true;
      }
      if (self.__isAnimating) {
        core.effect.Animate.stop(self.__isAnimating);
        self.__isAnimating = false;
        self.__interruptedAnimation = true;
      }
      var currentTouchLeft, currentTouchTop;
      var isSingleTouch = touches.length === 1;
      if (isSingleTouch) {
        currentTouchLeft = touches[0].pageX;
        currentTouchTop = touches[0].pageY;
      } else {
        currentTouchLeft = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
        currentTouchTop = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
      }
      self.__initialTouchLeft = currentTouchLeft;
      self.__initialTouchTop = currentTouchTop;
      self.__zoomLevelStart = self.__zoomLevel;
      self.__lastTouchLeft = currentTouchLeft;
      self.__lastTouchTop = currentTouchTop;
      self.__lastTouchMove = timeStamp;
      self.__lastScale = 1;
      self.__enableScrollX = !isSingleTouch && self.options.scrollingX;
      self.__enableScrollY = !isSingleTouch && self.options.scrollingY;
      self.__isTracking = true;
      self.__didDecelerationComplete = false;
      self.__isDragging = !isSingleTouch;
      self.__isSingleTouch = isSingleTouch;
      self.__positions = [];
    },
    doTouchMove: function (touches, timeStamp, scale) {
      if (touches.length == null) {
        throw new Error('Invalid touch list: ' + touches);
      }
      if (timeStamp instanceof Date) {
        timeStamp = timeStamp.valueOf();
      }
      if (typeof timeStamp !== 'number') {
        throw new Error('Invalid timestamp value: ' + timeStamp);
      }
      var self = this;
      if (!self.__isTracking) {
        return;
      }
      var currentTouchLeft, currentTouchTop;
      if (touches.length === 2) {
        currentTouchLeft = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
        currentTouchTop = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
      } else {
        currentTouchLeft = touches[0].pageX;
        currentTouchTop = touches[0].pageY;
      }
      var positions = self.__positions;
      if (self.__isDragging) {
        var moveX = currentTouchLeft - self.__lastTouchLeft;
        var moveY = currentTouchTop - self.__lastTouchTop;
        var scrollLeft = self.__scrollLeft;
        var scrollTop = self.__scrollTop;
        var level = self.__zoomLevel;
        if (scale != null && self.options.zooming) {
          var oldLevel = level;
          level = level / self.__lastScale * scale;
          level = Math.max(Math.min(level, self.options.maxZoom), self.options.minZoom);
          if (oldLevel !== level) {
            var currentTouchLeftRel = currentTouchLeft - self.__clientLeft;
            var currentTouchTopRel = currentTouchTop - self.__clientTop;
            scrollLeft = (currentTouchLeftRel + scrollLeft) * level / oldLevel - currentTouchLeftRel;
            scrollTop = (currentTouchTopRel + scrollTop) * level / oldLevel - currentTouchTopRel;
            self.__computeScrollMax(level);
          }
        }
        if (self.__enableScrollX) {
          scrollLeft -= moveX * this.options.speedMultiplier;
          var maxScrollLeft = self.__maxScrollLeft;
          if (scrollLeft > maxScrollLeft || scrollLeft < 0) {
            if (self.options.bouncing) {
              scrollLeft += moveX / 2 * this.options.speedMultiplier;
            } else if (scrollLeft > maxScrollLeft) {
              scrollLeft = maxScrollLeft;
            } else {
              scrollLeft = 0;
            }
          }
        }
        if (self.__enableScrollY) {
          scrollTop -= moveY * this.options.speedMultiplier;
          var maxScrollTop = self.__maxScrollTop;
          if (scrollTop > maxScrollTop || scrollTop < 0) {
            if (self.options.bouncing) {
              scrollTop += moveY / 2 * this.options.speedMultiplier;
              if (!self.__enableScrollX && self.__refreshHeight != null) {
                if (!self.__refreshActive && scrollTop <= -self.__refreshHeight) {
                  self.__refreshActive = true;
                  if (self.__refreshActivate) {
                    self.__refreshActivate();
                  }
                } else if (self.__refreshActive && scrollTop > -self.__refreshHeight) {
                  self.__refreshActive = false;
                  if (self.__refreshDeactivate) {
                    self.__refreshDeactivate();
                  }
                }
              }
            } else if (scrollTop > maxScrollTop) {
              scrollTop = maxScrollTop;
            } else {
              scrollTop = 0;
            }
          }
        }
        if (positions.length > 60) {
          positions.splice(0, 30);
        }
        positions.push(scrollLeft, scrollTop, timeStamp);
        self.__publish(scrollLeft, scrollTop, level);
      } else {
        var minimumTrackingForScroll = self.options.locking ? 3 : 0;
        var minimumTrackingForDrag = 5;
        var distanceX = Math.abs(currentTouchLeft - self.__initialTouchLeft);
        var distanceY = Math.abs(currentTouchTop - self.__initialTouchTop);
        self.__enableScrollX = self.options.scrollingX && distanceX >= minimumTrackingForScroll;
        self.__enableScrollY = self.options.scrollingY && distanceY >= minimumTrackingForScroll;
        positions.push(self.__scrollLeft, self.__scrollTop, timeStamp);
        self.__isDragging = (self.__enableScrollX || self.__enableScrollY) && (distanceX >= minimumTrackingForDrag || distanceY >= minimumTrackingForDrag);
        if (self.__isDragging) {
          self.__interruptedAnimation = false;
        }
      }
      self.__lastTouchLeft = currentTouchLeft;
      self.__lastTouchTop = currentTouchTop;
      self.__lastTouchMove = timeStamp;
      self.__lastScale = scale;
    },
    doTouchEnd: function (timeStamp) {
      if (timeStamp instanceof Date) {
        timeStamp = timeStamp.valueOf();
      }
      if (typeof timeStamp !== 'number') {
        throw new Error('Invalid timestamp value: ' + timeStamp);
      }
      var self = this;
      if (!self.__isTracking) {
        return;
      }
      self.__isTracking = false;
      if (self.__isDragging) {
        self.__isDragging = false;
        if (self.__isSingleTouch && self.options.animating && timeStamp - self.__lastTouchMove <= 100) {
          var positions = self.__positions;
          var endPos = positions.length - 1;
          var startPos = endPos;
          for (var i = endPos; i > 0 && positions[i] > self.__lastTouchMove - 100; i -= 3) {
            startPos = i;
          }
          if (startPos !== endPos) {
            var timeOffset = positions[endPos] - positions[startPos];
            var movedLeft = self.__scrollLeft - positions[startPos - 2];
            var movedTop = self.__scrollTop - positions[startPos - 1];
            self.__decelerationVelocityX = movedLeft / timeOffset * (1000 / 60);
            self.__decelerationVelocityY = movedTop / timeOffset * (1000 / 60);
            var minVelocityToStartDeceleration = self.options.paging || self.options.snapping ? 4 : 1;
            if (Math.abs(self.__decelerationVelocityX) > minVelocityToStartDeceleration || Math.abs(self.__decelerationVelocityY) > minVelocityToStartDeceleration) {
              if (!self.__refreshActive) {
                self.__startDeceleration(timeStamp);
              }
            }
          } else {
            self.options.scrollingComplete();
          }
        } else if (timeStamp - self.__lastTouchMove > 100) {
          self.options.scrollingComplete();
        }
      }
      if (!self.__isDecelerating) {
        if (self.__refreshActive && self.__refreshStart) {
          self.__publish(self.__scrollLeft, -self.__refreshHeight, self.__zoomLevel, true);
          if (self.__refreshStart) {
            self.__refreshStart();
          }
        } else {
          if (self.__interruptedAnimation || self.__isDragging) {
            self.options.scrollingComplete();
          }
          self.scrollTo(self.__scrollLeft, self.__scrollTop, true, self.__zoomLevel);
          if (self.__refreshActive) {
            self.__refreshActive = false;
            if (self.__refreshDeactivate) {
              self.__refreshDeactivate();
            }
          }
        }
      }
      self.__positions.length = 0;
    },
    __publish: function (left, top, zoom, animate) {
      var self = this;
      var wasAnimating = self.__isAnimating;
      if (wasAnimating) {
        core.effect.Animate.stop(wasAnimating);
        self.__isAnimating = false;
      }
      if (animate && self.options.animating) {
        self.__scheduledLeft = left;
        self.__scheduledTop = top;
        self.__scheduledZoom = zoom;
        var oldLeft = self.__scrollLeft;
        var oldTop = self.__scrollTop;
        var oldZoom = self.__zoomLevel;
        var diffLeft = left - oldLeft;
        var diffTop = top - oldTop;
        var diffZoom = zoom - oldZoom;
        var step = function (percent, now, render) {
          if (render) {
            self.__scrollLeft = oldLeft + diffLeft * percent;
            self.__scrollTop = oldTop + diffTop * percent;
            self.__zoomLevel = oldZoom + diffZoom * percent;
            if (self.__callback) {
              self.__callback(self.__scrollLeft, self.__scrollTop, self.__zoomLevel);
            }
          }
        };
        var verify = function (id) {
          return self.__isAnimating === id;
        };
        var completed = function (renderedFramesPerSecond, animationId, wasFinished) {
          if (animationId === self.__isAnimating) {
            self.__isAnimating = false;
          }
          if (self.__didDecelerationComplete || wasFinished) {
            self.options.scrollingComplete();
          }
          if (self.options.zooming) {
            self.__computeScrollMax();
          }
        };
        self.__isAnimating = core.effect.Animate.start(step, verify, completed, self.options.animationDuration, wasAnimating ? easeOutCubic : easeInOutCubic);
      } else {
        self.__scheduledLeft = self.__scrollLeft = left;
        self.__scheduledTop = self.__scrollTop = top;
        self.__scheduledZoom = self.__zoomLevel = zoom;
        if (self.__callback) {
          self.__callback(left, top, zoom);
        }
        if (self.options.zooming) {
          self.__computeScrollMax();
        }
      }
    },
    __computeScrollMax: function (zoomLevel) {
      var self = this;
      if (zoomLevel == null) {
        zoomLevel = self.__zoomLevel;
      }
      self.__maxScrollLeft = Math.max(self.__contentWidth * zoomLevel - self.__clientWidth, 0);
      self.__maxScrollTop = Math.max(self.__contentHeight * zoomLevel - self.__clientHeight, 0);
    },
    __startDeceleration: function (timeStamp) {
      var self = this;
      if (self.options.paging) {
        var scrollLeft = Math.max(Math.min(self.__scrollLeft, self.__maxScrollLeft), 0);
        var scrollTop = Math.max(Math.min(self.__scrollTop, self.__maxScrollTop), 0);
        var clientWidth = self.__clientWidth;
        var clientHeight = self.__clientHeight;
        self.__minDecelerationScrollLeft = Math.floor(scrollLeft / clientWidth) * clientWidth;
        self.__minDecelerationScrollTop = Math.floor(scrollTop / clientHeight) * clientHeight;
        self.__maxDecelerationScrollLeft = Math.ceil(scrollLeft / clientWidth) * clientWidth;
        self.__maxDecelerationScrollTop = Math.ceil(scrollTop / clientHeight) * clientHeight;
      } else {
        self.__minDecelerationScrollLeft = 0;
        self.__minDecelerationScrollTop = 0;
        self.__maxDecelerationScrollLeft = self.__maxScrollLeft;
        self.__maxDecelerationScrollTop = self.__maxScrollTop;
      }
      var step = function (percent, now, render) {
        self.__stepThroughDeceleration(render);
      };
      var minVelocityToKeepDecelerating = self.options.snapping ? 4 : 0.1;
      var verify = function () {
        var shouldContinue = Math.abs(self.__decelerationVelocityX) >= minVelocityToKeepDecelerating || Math.abs(self.__decelerationVelocityY) >= minVelocityToKeepDecelerating;
        if (!shouldContinue) {
          self.__didDecelerationComplete = true;
        }
        return shouldContinue;
      };
      var completed = function (renderedFramesPerSecond, animationId, wasFinished) {
        self.__isDecelerating = false;
        if (self.__didDecelerationComplete) {
          self.options.scrollingComplete();
        }
        self.scrollTo(self.__scrollLeft, self.__scrollTop, self.options.snapping);
      };
      self.__isDecelerating = core.effect.Animate.start(step, verify, completed);
    },
    __stepThroughDeceleration: function (render) {
      var self = this;
      var scrollLeft = self.__scrollLeft + self.__decelerationVelocityX;
      var scrollTop = self.__scrollTop + self.__decelerationVelocityY;
      if (!self.options.bouncing) {
        var scrollLeftFixed = Math.max(Math.min(self.__maxDecelerationScrollLeft, scrollLeft), self.__minDecelerationScrollLeft);
        if (scrollLeftFixed !== scrollLeft) {
          scrollLeft = scrollLeftFixed;
          self.__decelerationVelocityX = 0;
        }
        var scrollTopFixed = Math.max(Math.min(self.__maxDecelerationScrollTop, scrollTop), self.__minDecelerationScrollTop);
        if (scrollTopFixed !== scrollTop) {
          scrollTop = scrollTopFixed;
          self.__decelerationVelocityY = 0;
        }
      }
      if (render) {
        self.__publish(scrollLeft, scrollTop, self.__zoomLevel);
      } else {
        self.__scrollLeft = scrollLeft;
        self.__scrollTop = scrollTop;
      }
      if (!self.options.paging) {
        var frictionFactor = 0.95;
        self.__decelerationVelocityX *= frictionFactor;
        self.__decelerationVelocityY *= frictionFactor;
      }
      if (self.options.bouncing) {
        var scrollOutsideX = 0;
        var scrollOutsideY = 0;
        var penetrationDeceleration = self.options.penetrationDeceleration;
        var penetrationAcceleration = self.options.penetrationAcceleration;
        if (scrollLeft < self.__minDecelerationScrollLeft) {
          scrollOutsideX = self.__minDecelerationScrollLeft - scrollLeft;
        } else if (scrollLeft > self.__maxDecelerationScrollLeft) {
          scrollOutsideX = self.__maxDecelerationScrollLeft - scrollLeft;
        }
        if (scrollTop < self.__minDecelerationScrollTop) {
          scrollOutsideY = self.__minDecelerationScrollTop - scrollTop;
        } else if (scrollTop > self.__maxDecelerationScrollTop) {
          scrollOutsideY = self.__maxDecelerationScrollTop - scrollTop;
        }
        if (scrollOutsideX !== 0) {
          if (scrollOutsideX * self.__decelerationVelocityX <= 0) {
            self.__decelerationVelocityX += scrollOutsideX * penetrationDeceleration;
          } else {
            self.__decelerationVelocityX = scrollOutsideX * penetrationAcceleration;
          }
        }
        if (scrollOutsideY !== 0) {
          if (scrollOutsideY * self.__decelerationVelocityY <= 0) {
            self.__decelerationVelocityY += scrollOutsideY * penetrationDeceleration;
          } else {
            self.__decelerationVelocityY = scrollOutsideY * penetrationAcceleration;
          }
        }
      }
    }
  });
}(ionic));
;
(function (ionic) {
  'use strict';
  ionic.views.ActionSheet = ionic.views.View.inherit({
    initialize: function (opts) {
      this.el = opts.el;
    },
    show: function () {
      this.el.offsetWidth;
      this.el.classList.add('active');
    },
    hide: function () {
      this.el.offsetWidth;
      this.el.classList.remove('active');
    }
  });
}(ionic));
;
(function (ionic) {
  'use strict';
  ionic.views.HeaderBar = ionic.views.View.inherit({
    initialize: function (opts) {
      this.el = opts.el;
      ionic.extend(this, { alignTitle: 'center' }, opts);
      this.align();
    },
    align: function () {
      var _this = this;
      window.rAF(ionic.proxy(function () {
        var i, c, childSize;
        var childNodes = this.el.childNodes;
        var title = this.el.querySelector('.title');
        if (!title) {
          return;
        }
        var leftWidth = 0;
        var rightWidth = 0;
        var titlePos = Array.prototype.indexOf.call(childNodes, title);
        for (i = 0; i < titlePos; i++) {
          childSize = null;
          c = childNodes[i];
          if (c.nodeType == 3) {
            childSize = ionic.DomUtil.getTextBounds(c);
          } else if (c.nodeType == 1) {
            childSize = c.getBoundingClientRect();
          }
          if (childSize) {
            leftWidth += childSize.width;
          }
        }
        for (i = titlePos + 1; i < childNodes.length; i++) {
          childSize = null;
          c = childNodes[i];
          if (c.nodeType == 3) {
            childSize = ionic.DomUtil.getTextBounds(c);
          } else if (c.nodeType == 1) {
            childSize = c.getBoundingClientRect();
          }
          if (childSize) {
            rightWidth += childSize.width;
          }
        }
        var margin = Math.max(leftWidth, rightWidth) + 10;
        if (this.alignTitle == 'center') {
          if (margin > 10) {
            title.style.left = margin + 'px';
            title.style.right = margin + 'px';
          }
          if (title.offsetWidth < title.scrollWidth) {
            if (rightWidth > 0) {
              title.style.right = rightWidth + 5 + 'px';
            }
          }
        } else if (this.alignTitle == 'left') {
          title.classList.add('title-left');
          if (leftWidth > 0) {
            title.style.left = leftWidth + 15 + 'px';
          }
        } else if (this.alignTitle == 'right') {
          title.classList.add('title-right');
          if (rightWidth > 0) {
            title.style.right = rightWidth + 15 + 'px';
          }
        }
      }, this));
    }
  });
}(ionic));
;
(function (ionic) {
  'use strict';
  var ITEM_CLASS = 'item';
  var ITEM_CONTENT_CLASS = 'item-content';
  var ITEM_SLIDING_CLASS = 'item-sliding';
  var ITEM_OPTIONS_CLASS = 'item-options';
  var ITEM_PLACEHOLDER_CLASS = 'item-placeholder';
  var ITEM_REORDERING_CLASS = 'item-reordering';
  var ITEM_DRAG_CLASS = 'item-drag';
  var DragOp = function () {
  };
  DragOp.prototype = {
    start: function (e) {
    },
    drag: function (e) {
    },
    end: function (e) {
    }
  };
  var SlideDrag = function (opts) {
    this.dragThresholdX = opts.dragThresholdX || 10;
    this.el = opts.el;
  };
  SlideDrag.prototype = new DragOp();
  SlideDrag.prototype.start = function (e) {
    var content, buttons, offsetX, buttonsWidth;
    if (e.target.classList.contains(ITEM_CONTENT_CLASS)) {
      content = e.target;
    } else if (e.target.classList.contains(ITEM_CLASS)) {
      content = e.target.querySelector('.' + ITEM_CONTENT_CLASS);
    }
    if (!content) {
      return;
    }
    content.classList.remove(ITEM_SLIDING_CLASS);
    offsetX = parseFloat(content.style.webkitTransform.replace('translate3d(', '').split(',')[0]) || 0;
    buttons = content.parentNode.querySelector('.' + ITEM_OPTIONS_CLASS);
    if (!buttons) {
      return;
    }
    buttonsWidth = buttons.offsetWidth;
    this._currentDrag = {
      buttonsWidth: buttonsWidth,
      content: content,
      startOffsetX: offsetX
    };
  };
  SlideDrag.prototype.drag = function (e) {
    var _this = this, buttonsWidth;
    window.rAF(function () {
      if (!_this._currentDrag) {
        return;
      }
      if (!_this._isDragging && (Math.abs(e.gesture.deltaX) > _this.dragThresholdX || Math.abs(_this._currentDrag.startOffsetX) > 0)) {
        _this._isDragging = true;
      }
      if (_this._isDragging) {
        buttonsWidth = _this._currentDrag.buttonsWidth;
        var newX = Math.min(0, _this._currentDrag.startOffsetX + e.gesture.deltaX);
        if (newX < -buttonsWidth) {
          newX = Math.min(-buttonsWidth, -buttonsWidth + (e.gesture.deltaX + buttonsWidth) * 0.4);
        }
        _this._currentDrag.content.style.webkitTransform = 'translate3d(' + newX + 'px, 0, 0)';
      }
    });
  };
  SlideDrag.prototype.end = function (e, doneCallback) {
    var _this = this;
    if (!this._currentDrag) {
      doneCallback && doneCallback();
      return;
    }
    var restingPoint = -this._currentDrag.buttonsWidth;
    if (e.gesture.deltaX > -(this._currentDrag.buttonsWidth / 2)) {
      if (e.gesture.direction == 'left' && Math.abs(e.gesture.velocityX) < 0.3) {
        restingPoint = 0;
      } else if (e.gesture.direction == 'right') {
        restingPoint = 0;
      }
    }
    var content = this._currentDrag.content;
    var onRestingAnimationEnd = function (e) {
      if (e.propertyName == '-webkit-transform') {
        content.classList.remove(ITEM_SLIDING_CLASS);
      }
      e.target.removeEventListener('webkitTransitionEnd', onRestingAnimationEnd);
    };
    window.rAF(function () {
      var currentX = parseFloat(_this._currentDrag.content.style.webkitTransform.replace('translate3d(', '').split(',')[0]) || 0;
      if (currentX !== restingPoint) {
        _this._currentDrag.content.classList.add(ITEM_SLIDING_CLASS);
        _this._currentDrag.content.addEventListener('webkitTransitionEnd', onRestingAnimationEnd);
      }
      _this._currentDrag.content.style.webkitTransform = 'translate3d(' + restingPoint + 'px, 0, 0)';
      _this._currentDrag = null;
      doneCallback && doneCallback();
    });
  };
  var ReorderDrag = function (opts) {
    this.dragThresholdY = opts.dragThresholdY || 0;
    this.onReorder = opts.onReorder;
    this.el = opts.el;
  };
  ReorderDrag.prototype = new DragOp();
  ReorderDrag.prototype.start = function (e) {
    var content;
    var offsetY = this.el.offsetTop;
    var startIndex = ionic.DomUtil.getChildIndex(this.el, this.el.nodeName.toLowerCase());
    var placeholder = this.el.cloneNode(true);
    placeholder.classList.add(ITEM_PLACEHOLDER_CLASS);
    this.el.parentNode.insertBefore(placeholder, this.el);
    this.el.classList.add(ITEM_REORDERING_CLASS);
    this._currentDrag = {
      startOffsetTop: offsetY,
      startIndex: startIndex,
      placeholder: placeholder
    };
  };
  ReorderDrag.prototype.drag = function (e) {
    var _this = this;
    window.rAF(function () {
      if (!_this._currentDrag) {
        return;
      }
      if (!_this._isDragging && Math.abs(e.gesture.deltaY) > _this.dragThresholdY) {
        _this._isDragging = true;
      }
      if (_this._isDragging) {
        var newY = _this._currentDrag.startOffsetTop + e.gesture.deltaY;
        _this.el.style.top = newY + 'px';
        _this._currentDrag.currentY = newY;
        _this._reorderItems();
      }
    });
  };
  ReorderDrag.prototype._reorderItems = function () {
    var placeholder = this._currentDrag.placeholder;
    var siblings = Array.prototype.slice.call(this._currentDrag.placeholder.parentNode.children);
    siblings.splice(siblings.indexOf(this.el), 1);
    var index = siblings.indexOf(this._currentDrag.placeholder);
    var topSibling = siblings[Math.max(0, index - 1)];
    var bottomSibling = siblings[Math.min(siblings.length, index + 1)];
    var thisOffsetTop = this._currentDrag.currentY;
    if (topSibling && thisOffsetTop < topSibling.offsetTop + topSibling.offsetHeight / 2) {
      ionic.DomUtil.swapNodes(this._currentDrag.placeholder, topSibling);
      return index - 1;
    } else if (bottomSibling && thisOffsetTop > bottomSibling.offsetTop + bottomSibling.offsetHeight / 2) {
      ionic.DomUtil.swapNodes(bottomSibling, this._currentDrag.placeholder);
      return index + 1;
    }
  };
  ReorderDrag.prototype.end = function (e, doneCallback) {
    if (!this._currentDrag) {
      doneCallback && doneCallback();
      return;
    }
    var placeholder = this._currentDrag.placeholder;
    this.el.classList.remove(ITEM_REORDERING_CLASS);
    this.el.style.top = 0;
    var finalPosition = ionic.DomUtil.getChildIndex(placeholder, placeholder.nodeName.toLowerCase());
    placeholder.parentNode.insertBefore(this.el, placeholder);
    placeholder.parentNode.removeChild(placeholder);
    this.onReorder && this.onReorder(this.el, this._currentDrag.startIndex, finalPosition);
    this._currentDrag = null;
    doneCallback && doneCallback();
  };
  ionic.views.ListView = ionic.views.View.inherit({
    initialize: function (opts) {
      var _this = this;
      opts = ionic.extend({
        onReorder: function (el, oldIndex, newIndex) {
        },
        virtualRemoveThreshold: -200,
        virtualAddThreshold: 200
      }, opts);
      ionic.extend(this, opts);
      if (!this.itemHeight && this.listEl) {
        this.itemHeight = this.listEl.children[0] && parseInt(this.listEl.children[0].style.height, 10);
      }
      this.onRefresh = opts.onRefresh || function () {
      };
      this.onRefreshOpening = opts.onRefreshOpening || function () {
      };
      this.onRefreshHolding = opts.onRefreshHolding || function () {
      };
      window.ionic.onGesture('touch', function (e) {
        _this._handleTouch(e);
      }, this.el);
      window.ionic.onGesture('release', function (e) {
        _this._handleTouchRelease(e);
      }, this.el);
      this._initDrag();
    },
    stopRefreshing: function () {
      var refresher = this.el.querySelector('.list-refresher');
      refresher.style.height = '0px';
    },
    didScroll: function (e) {
      if (this.isVirtual) {
        var itemHeight = this.itemHeight;
        var totalItems = this.listEl.children.length;
        var scrollHeight = e.target.scrollHeight;
        var viewportHeight = this.el.parentNode.offsetHeight;
        var scrollTop = e.scrollTop;
        var highWater = Math.max(0, e.scrollTop + this.virtualRemoveThreshold);
        var lowWater = Math.min(scrollHeight, Math.abs(e.scrollTop) + viewportHeight + this.virtualAddThreshold);
        var itemsPerViewport = Math.floor((lowWater - highWater) / itemHeight);
        var first = parseInt(Math.abs(highWater / itemHeight), 10);
        var last = parseInt(Math.abs(lowWater / itemHeight), 10);
        this._virtualItemsToRemove = Array.prototype.slice.call(this.listEl.children, 0, first);
        var nodes = Array.prototype.slice.call(this.listEl.children, first, first + itemsPerViewport);
        this.renderViewport && this.renderViewport(highWater, lowWater, first, last);
      }
    },
    didStopScrolling: function (e) {
      if (this.isVirtual) {
        for (var i = 0; i < this._virtualItemsToRemove.length; i++) {
          var el = this._virtualItemsToRemove[i];
          this.didHideItem && this.didHideItem(i);
        }
      }
    },
    _initDrag: function () {
      this._dragOp = null;
    },
    _getItem: function (target) {
      while (target) {
        if (target.classList.contains(ITEM_CLASS)) {
          return target;
        }
        target = target.parentNode;
      }
      return null;
    },
    _startDrag: function (e) {
      var _this = this;
      this._isDragging = false;
      if (ionic.DomUtil.getParentOrSelfWithClass(e.target, ITEM_DRAG_CLASS) && (e.gesture.direction == 'up' || e.gesture.direction == 'down')) {
        var item = this._getItem(e.target);
        if (item) {
          this._dragOp = new ReorderDrag({
            el: item,
            onReorder: function (el, start, end) {
              _this.onReorder && _this.onReorder(el, start, end);
            }
          });
          this._dragOp.start(e);
          e.preventDefault();
          return;
        }
      } else if ((e.gesture.direction == 'left' || e.gesture.direction == 'right') && Math.abs(e.gesture.deltaX) > 5) {
        this._dragOp = new SlideDrag({ el: this.el });
        this._dragOp.start(e);
        e.preventDefault();
        return;
      }
    },
    _handleEndDrag: function (e) {
      var _this = this;
      if (!this._dragOp) {
        return;
      }
      this._dragOp.end(e, function () {
        _this._initDrag();
      });
    },
    _handleDrag: function (e) {
      var _this = this, content, buttons;
      if (Math.abs(e.gesture.deltaX) > 10 || Math.abs(e.gesture.deltaY) > 10) {
        clearTimeout(this._touchTimeout);
      }
      clearTimeout(this._touchTimeout);
      if (!this.isDragging && !this._dragOp) {
        this._startDrag(e);
      }
      if (!this._dragOp) {
        return;
      }
      e.preventDefault();
      this._dragOp.drag(e);
    },
    _handleTouch: function (e) {
      var _this = this;
      var item = ionic.DomUtil.getParentOrSelfWithClass(e.target, ITEM_CLASS);
      if (!item) {
        return;
      }
      this._touchTimeout = setTimeout(function () {
        var items = _this.el.querySelectorAll('.item');
        for (var i = 0, l = items.length; i < l; i++) {
          items[i].classList.remove('active');
        }
        item.classList.add('active');
      }, 250);
    },
    _handleTouchRelease: function (e) {
      var _this = this;
      clearTimeout(this._touchTimeout);
      var items = _this.el.querySelectorAll('.item');
      for (var i = 0, l = items.length; i < l; i++) {
        items[i].classList.remove('active');
      }
    }
  });
}(ionic));
;
(function (ionic) {
  'use strict';
  ionic.views.Loading = ionic.views.View.inherit({
    initialize: function (opts) {
      var _this = this;
      this.el = opts.el;
      this.maxWidth = opts.maxWidth || 200;
      this._loadingBox = this.el.querySelector('.loading');
    },
    show: function () {
      var _this = this;
      if (this._loadingBox) {
        var lb = _this._loadingBox;
        var width = Math.min(_this.maxWidth, Math.max(window.outerWidth - 40, lb.offsetWidth));
        lb.style.width = width;
        lb.style.marginLeft = -lb.offsetWidth / 2 + 'px';
        lb.style.marginTop = -lb.offsetHeight / 2 + 'px';
        _this.el.classList.add('active');
      }
    },
    hide: function () {
      this.el.offsetWidth;
      this.el.classList.remove('active');
    }
  });
}(ionic));
;
(function (ionic) {
  'use strict';
  ionic.views.Modal = ionic.views.View.inherit({
    initialize: function (opts) {
      opts = ionic.extend({
        focusFirstInput: false,
        unfocusOnHide: true
      }, opts);
      ionic.extend(this, opts);
      this.el = opts.el;
    },
    show: function () {
      this.el.classList.add('active');
      if (this.focusFirstInput) {
        var input = this.el.querySelector('input, textarea');
        input && input.focus && input.focus();
      }
    },
    hide: function () {
      this.el.classList.remove('active');
      if (this.unfocusOnHide) {
        var inputs = this.el.querySelectorAll('input, textarea');
        for (var i = 0; i < inputs.length; i++) {
          inputs[i].blur && inputs[i].blur();
        }
      }
    }
  });
}(ionic));
;
(function (ionic) {
  'use strict';
  ionic.views.NavBar = ionic.views.View.inherit({
    initialize: function (opts) {
      this.el = opts.el;
      this._titleEl = this.el.querySelector('.title');
      if (opts.hidden) {
        this.hide();
      }
    },
    hide: function () {
      this.el.classList.add('hidden');
    },
    show: function () {
      this.el.classList.remove('hidden');
    },
    shouldGoBack: function () {
    },
    setTitle: function (title) {
      if (!this._titleEl) {
        return;
      }
      this._titleEl.innerHTML = title;
    },
    showBackButton: function (shouldShow) {
      var _this = this;
      if (!this._currentBackButton) {
        var back = document.createElement('a');
        back.className = 'button back';
        back.innerHTML = 'Back';
        this._currentBackButton = back;
        this._currentBackButton.onclick = function (event) {
          _this.shouldGoBack && _this.shouldGoBack();
        };
      }
      if (shouldShow && !this._currentBackButton.parentNode) {
        this.el.insertBefore(this._currentBackButton, this.el.firstChild);
      } else if (!shouldShow && this._currentBackButton.parentNode) {
        this._currentBackButton.parentNode.removeChild(this._currentBackButton);
      }
    }
  });
}(ionic));
;
(function (ionic) {
  'use strict';
  ionic.views.Popup = ionic.views.View.inherit({
    initialize: function (opts) {
      var _this = this;
      this.el = opts.el;
    },
    setTitle: function (title) {
      var titleEl = el.querySelector('.popup-title');
      if (titleEl) {
        titleEl.innerHTML = title;
      }
    },
    alert: function (message) {
      var _this = this;
      window.rAF(function () {
        _this.setTitle(message);
        _this.el.classList.add('active');
      });
    },
    hide: function () {
      this.el.offsetWidth;
      this.el.classList.remove('active');
    }
  });
}(ionic));
;
(function (ionic) {
  'use strict';
  ionic.views.SideMenu = ionic.views.View.inherit({
    initialize: function (opts) {
      this.el = opts.el;
      this.width = opts.width;
      this.isEnabled = opts.isEnabled || true;
    },
    getFullWidth: function () {
      return this.width;
    },
    setIsEnabled: function (isEnabled) {
      this.isEnabled = isEnabled;
    },
    bringUp: function () {
      this.el.style.zIndex = 0;
    },
    pushDown: function () {
      this.el.style.zIndex = -1;
    }
  });
  ionic.views.SideMenuContent = ionic.views.View.inherit({
    initialize: function (opts) {
      var _this = this;
      ionic.extend(this, {
        animationClass: 'menu-animated',
        onDrag: function (e) {
        },
        onEndDrag: function (e) {
        }
      }, opts);
      ionic.onGesture('drag', ionic.proxy(this._onDrag, this), this.el);
      ionic.onGesture('release', ionic.proxy(this._onEndDrag, this), this.el);
    },
    _onDrag: function (e) {
      this.onDrag && this.onDrag(e);
    },
    _onEndDrag: function (e) {
      this.onEndDrag && this.onEndDrag(e);
    },
    disableAnimation: function () {
      this.el.classList.remove(this.animationClass);
    },
    enableAnimation: function () {
      this.el.classList.add(this.animationClass);
    },
    getTranslateX: function () {
      return parseFloat(this.el.style.webkitTransform.replace('translate3d(', '').split(',')[0]);
    },
    setTranslateX: function (x) {
      this.el.style.webkitTransform = 'translate3d(' + x + 'px, 0, 0)';
    }
  });
}(ionic));
;
(function (ionic) {
  'use strict';
  ionic.views.SlideBox = ionic.views.View.inherit({
    initialize: function (opts) {
      var _this = this;
      this.slideChanged = opts.slideChanged || function () {
      };
      this.el = opts.el;
      this.pager = this.el.querySelector('.slide-box-pager');
      this.dragThresholdX = opts.dragThresholdX || 10;
      this.velocityXThreshold = opts.velocityXThreshold || 0.3;
      this.slideIndex = 0;
      this._updatePager();
      window.ionic.onGesture('drag', function (e) {
        _this._handleDrag(e);
        e.gesture.srcEvent.preventDefault();
      }, this.el);
      window.ionic.onGesture('release', function (e) {
        _this._handleEndDrag(e);
      }, this.el);
    },
    update: function () {
      this._updatePager();
    },
    prependSlide: function (el) {
      var content = this.el.firstElementChild;
      if (!content) {
        return;
      }
      var slideWidth = content.offsetWidth;
      var offsetX = parseFloat(content.style.webkitTransform.replace('translate3d(', '').split(',')[0]) || 0;
      var newOffsetX = Math.min(0, offsetX - slideWidth);
      content.insertBefore(el, content.firstChild);
      content.classList.remove('slide-box-animating');
      content.style.webkitTransform = 'translate3d(' + newOffsetX + 'px, 0, 0)';
      this._prependPagerIcon();
      this.slideIndex = (this.slideIndex + 1) % content.children.length;
      this._updatePager();
    },
    appendSlide: function (el) {
      var content = this.el.firstElementChild;
      if (!content) {
        return;
      }
      content.classList.remove('slide-box-animating');
      content.appendChild(el);
      this._appendPagerIcon();
      this._updatePager();
    },
    removeSlide: function (index) {
      var content = this.el.firstElementChild;
      if (!content) {
        return;
      }
      var items = this.el.firstElementChild;
      items.removeChild(items.firstElementChild);
      var slideWidth = content.offsetWidth;
      var offsetX = parseFloat(content.style.webkitTransform.replace('translate3d(', '').split(',')[0]) || 0;
      var newOffsetX = Math.min(0, offsetX + slideWidth);
      content.classList.remove('slide-box-animating');
      content.style.webkitTransform = 'translate3d(' + newOffsetX + 'px, 0, 0)';
      this._removePagerIcon();
      this.slideIndex = Math.max(0, (this.slideIndex - 1) % content.children.length);
      this._updatePager();
    },
    slideToSlide: function (index) {
      var content = this.el.firstElementChild;
      if (!content) {
        return;
      }
      var slideWidth = content.offsetWidth;
      var offsetX = index * slideWidth;
      var maxX = Math.max(0, content.children.length - 1) * slideWidth;
      offsetX = offsetX < 0 ? 0 : offsetX > maxX ? maxX : offsetX;
      content.classList.add('slide-box-animating');
      content.style.webkitTransform = 'translate3d(' + -offsetX + 'px, 0, 0)';
      var lastSlide = this.slideIndex;
      this.slideIndex = Math.ceil(offsetX / slideWidth);
      if (lastSlide !== this.slideIndex) {
        this.slideChanged && this.slideChanged(this.slideIndex);
      }
      this._updatePager();
    },
    getSlideIndex: function () {
      return this.slideIndex;
    },
    _appendPagerIcon: function () {
      if (!this.pager || !this.pager.children.length) {
        return;
      }
      var newPagerChild = this.pager.children[0].cloneNode();
      this.pager.appendChild(newPagerChild);
    },
    _prependPagerIcon: function () {
      if (!this.pager || !this.pager.children.length) {
        return;
      }
      var newPagerChild = this.pager.children[0].cloneNode();
      this.pager.insertBefore(newPagerChild, this.pager.firstChild);
    },
    _removePagerIcon: function () {
      if (!this.pager || !this.pager.children.length) {
        return;
      }
      this.pager.removeChild(this.pager.firstElementChild);
    },
    _updatePager: function () {
      if (!this.pager) {
        return;
      }
      var numPagerChildren = this.pager.children.length;
      if (!numPagerChildren) {
        return;
      }
      for (var i = 0, j = this.pager.children.length; i < j; i++) {
        if (i == this.slideIndex) {
          this.pager.children[i].classList.add('active');
        } else {
          this.pager.children[i].classList.remove('active');
        }
      }
    },
    _initDrag: function () {
      this._isDragging = false;
      this._drag = null;
    },
    _handleEndDrag: function (e) {
      var _this = this, finalOffsetX, content, ratio, slideWidth, totalWidth, offsetX;
      window.rAF(function () {
        if (!_this._drag) {
          _this._initDrag();
          return;
        }
        content = _this._drag.content;
        content.classList.add('slide-box-animating');
        offsetX = parseFloat(content.style.webkitTransform.replace('translate3d(', '').split(',')[0]) || 0;
        slideWidth = content.offsetWidth;
        totalWidth = content.offsetWidth * content.children.length;
        ratio = offsetX % slideWidth / slideWidth;
        if (ratio >= 0) {
          finalOffsetX = 0;
        } else if (ratio >= -0.5) {
          finalOffsetX = Math.max(0, Math.floor(Math.abs(offsetX) / slideWidth) * slideWidth);
        } else {
          finalOffsetX = Math.min(totalWidth - slideWidth, Math.ceil(Math.abs(offsetX) / slideWidth) * slideWidth);
        }
        if (e.gesture.velocityX > _this.velocityXThreshold) {
          if (e.gesture.direction == 'left') {
            _this.slideToSlide(_this.slideIndex + 1);
          } else if (e.gesture.direction == 'right') {
            _this.slideToSlide(_this.slideIndex - 1);
          }
        } else {
          _this.slideIndex = Math.ceil(finalOffsetX / slideWidth);
          content.style.webkitTransform = 'translate3d(' + -finalOffsetX + 'px, 0, 0)';
        }
        _this._initDrag();
      });
    },
    _startDrag: function (e) {
      var offsetX, content;
      this._initDrag();
      content = ionic.DomUtil.getParentOrSelfWithClass(e.target, 'slide-box-slides');
      if (!content) {
        return;
      }
      content.classList.remove('slide-box-animating');
      offsetX = parseFloat(content.style.webkitTransform.replace('translate3d(', '').split(',')[0]) || 0;
      this._drag = {
        content: content,
        startOffsetX: offsetX,
        resist: 1
      };
    },
    _handleDrag: function (e) {
      var _this = this;
      window.rAF(function () {
        var content;
        if (!_this._drag) {
          _this._startDrag(e);
        }
        if (!_this._drag) {
          return;
        }
        e.preventDefault();
        if (!_this._isDragging && Math.abs(e.gesture.deltaX) > _this.dragThresholdX) {
          _this._isDragging = true;
        }
        if (_this._isDragging) {
          content = _this._drag.content;
          var newX = _this._drag.startOffsetX + e.gesture.deltaX / _this._drag.resist;
          var rightMostX = -(content.offsetWidth * Math.max(0, content.children.length - 1));
          if (newX > 0) {
            _this._drag.resist = newX / content.offsetWidth + 1.4;
          } else if (newX < rightMostX) {
            _this._drag.resist = Math.abs(newX) / content.offsetWidth - 0.6;
          }
          _this._drag.content.style.webkitTransform = 'translate3d(' + newX + 'px, 0, 0)';
        }
      });
    }
  });
}(window.ionic));
;
(function (ionic) {
  'use strict';
  ionic.views.TabBarItem = ionic.views.View.inherit({
    initialize: function (el) {
      this.el = el;
      this._buildItem();
    },
    create: function (itemData) {
      var item = document.createElement('a');
      item.className = 'tab-item';
      if (itemData.icon) {
        var icon = document.createElement('i');
        icon.className = itemData.icon;
        item.appendChild(icon);
      }
      item.appendChild(document.createTextNode(itemData.title));
      return new ionic.views.TabBarItem(item);
    },
    _buildItem: function () {
      var _this = this, child, children = Array.prototype.slice.call(this.el.children);
      for (var i = 0, j = children.length; i < j; i++) {
        child = children[i];
        if (child.tagName.toLowerCase() == 'i' && /icon/.test(child.className)) {
          this.icon = child.className;
          break;
        }
      }
      this.title = this.el.textContent.trim();
      this._tapHandler = function (e) {
        _this.onTap && _this.onTap(e);
      };
      ionic.on('tap', this._tapHandler, this.el);
    },
    onTap: function (e) {
    },
    destroy: function () {
      ionic.off('tap', this._tapHandler, this.el);
    },
    getIcon: function () {
      return this.icon;
    },
    getTitle: function () {
      return this.title;
    },
    setSelected: function (isSelected) {
      this.isSelected = isSelected;
      if (isSelected) {
        this.el.classList.add('active');
      } else {
        this.el.classList.remove('active');
      }
    }
  });
  ionic.views.TabBar = ionic.views.View.inherit({
    initialize: function (opts) {
      this.el = opts.el;
      this.items = [];
      this._buildItems();
    },
    getItems: function () {
      return this.items;
    },
    addItem: function (item) {
      var tabItem = ionic.views.TabBarItem.prototype.create(item);
      this.appendItemElement(tabItem);
      this.items.push(tabItem);
      this._bindEventsOnItem(tabItem);
    },
    appendItemElement: function (item) {
      if (!this.el) {
        return;
      }
      this.el.appendChild(item.el);
    },
    removeItem: function (index) {
      var item = this.items[index];
      if (!item) {
        return;
      }
      item.onTap = undefined;
      item.destroy();
    },
    _bindEventsOnItem: function (item) {
      var _this = this;
      if (!this._itemTapHandler) {
        this._itemTapHandler = function (e) {
          _this.trySelectItem(this);
        };
      }
      item.onTap = this._itemTapHandler;
    },
    getSelectedItem: function () {
      return this.selectedItem;
    },
    setSelectedItem: function (index) {
      this.selectedItem = this.items[index];
      for (var i = 0, j = this.items.length; i < j; i += 1) {
        this.items[i].setSelected(false);
      }
      if (this.selectedItem) {
        this.selectedItem.setSelected(true);
      }
    },
    selectItem: function (item) {
      for (var i = 0, j = this.items.length; i < j; i += 1) {
        if (this.items[i] == item) {
          this.setSelectedItem(i);
          return;
        }
      }
    },
    trySelectItem: function (item) {
      for (var i = 0, j = this.items.length; i < j; i += 1) {
        if (this.items[i] == item) {
          this.tryTabSelect && this.tryTabSelect(i);
          return;
        }
      }
    },
    _buildItems: function () {
      var item, items = Array.prototype.slice.call(this.el.children);
      for (var i = 0, j = items.length; i < j; i += 1) {
        item = new ionic.views.TabBarItem(items[i]);
        this.items[i] = item;
        this._bindEventsOnItem(item);
      }
      if (this.items.length > 0) {
        this.selectedItem = this.items[0];
      }
    },
    destroy: function () {
      for (var i = 0, j = this.items.length; i < j; i += 1) {
        this.items[i].destroy();
      }
      this.items.length = 0;
    }
  });
}(window.ionic));
;
(function (ionic) {
  'use strict';
  ionic.views.Toggle = ionic.views.View.inherit({
    initialize: function (opts) {
      this.el = opts.el;
      this.checkbox = opts.checkbox;
      this.handle = opts.handle;
      this.openPercent = -1;
    },
    tap: function (e) {
      this.val(!this.checkbox.checked);
    },
    drag: function (e) {
      var slidePageLeft = this.checkbox.offsetLeft + this.handle.offsetWidth / 2;
      var slidePageRight = this.checkbox.offsetLeft + this.checkbox.offsetWidth - this.handle.offsetWidth / 2;
      if (e.pageX >= slidePageRight - 4) {
        this.val(true);
      } else if (e.pageX <= slidePageLeft) {
        this.val(false);
      } else {
        this.setOpenPercent(Math.round((1 - (slidePageRight - e.pageX) / (slidePageRight - slidePageLeft)) * 100));
      }
    },
    setOpenPercent: function (openPercent) {
      if (this.openPercent < 0 || (openPercent < this.openPercent - 3 || openPercent > this.openPercent + 3)) {
        this.openPercent = openPercent;
        if (openPercent === 0) {
          this.val(false);
        } else if (openPercent === 100) {
          this.val(true);
        } else {
          var openPixel = Math.round(openPercent / 100 * this.checkbox.offsetWidth - this.handle.offsetWidth);
          openPixel = openPixel < 1 ? 0 : openPixel;
          this.handle.style.webkitTransform = 'translate3d(' + openPixel + 'px,0,0)';
        }
      }
    },
    release: function (e) {
      this.val(this.openPercent >= 50);
    },
    val: function (value) {
      if (value === true || value === false) {
        if (this.handle.style.webkitTransform !== '') {
          this.handle.style.webkitTransform = '';
        }
        this.checkbox.checked = value;
        this.openPercent = value ? 100 : 0;
      }
      return this.checkbox.checked;
    }
  });
}(ionic));
;
(function (ionic) {
  'use strict';
  ionic.controllers.ViewController = function (options) {
    this.initialize.apply(this, arguments);
  };
  ionic.controllers.ViewController.inherit = ionic.inherit;
  ionic.extend(ionic.controllers.ViewController.prototype, {
    initialize: function () {
    },
    destroy: function () {
    }
  });
}(window.ionic));
;
(function (ionic) {
  'use strict';
  ionic.controllers.NavController = ionic.controllers.ViewController.inherit({
    initialize: function (opts) {
      var _this = this;
      this.navBar = opts.navBar;
      this.content = opts.content;
      this.controllers = opts.controllers || [];
      this._updateNavBar();
      this.navBar.shouldGoBack = function () {
        _this.pop();
      };
    },
    getControllers: function () {
      return this.controllers;
    },
    getTopController: function () {
      return this.controllers[this.controllers.length - 1];
    },
    push: function (controller) {
      var last = this.controllers[this.controllers.length - 1];
      this.controllers.push(controller);
      var shouldSwitch = this.switchingController && this.switchingController(controller) || true;
      if (shouldSwitch === false)
        return;
      if (last) {
        last.isVisible = false;
        last.visibilityChanged && last.visibilityChanged('push');
      }
      var next = this.controllers[this.controllers.length - 1];
      next.isVisible = true;
      next.visibilityChanged && next.visibilityChanged(last ? 'push' : 'first');
      this._updateNavBar();
      return controller;
    },
    pop: function () {
      var next, last;
      if (this.controllers.length < 2) {
        return;
      }
      last = this.controllers.pop();
      if (last) {
        last.isVisible = false;
        last.visibilityChanged && last.visibilityChanged('pop');
      }
      next = this.controllers[this.controllers.length - 1];
      next.isVisible = true;
      next.visibilityChanged && next.visibilityChanged('pop');
      this._updateNavBar();
      return last;
    },
    showNavBar: function () {
      if (this.navBar) {
        this.navBar.show();
      }
    },
    hideNavBar: function () {
      if (this.navBar) {
        this.navBar.hide();
      }
    },
    _updateNavBar: function () {
      if (!this.getTopController() || !this.navBar) {
        return;
      }
      this.navBar.setTitle(this.getTopController().title);
      if (this.controllers.length > 1) {
        this.navBar.showBackButton(true);
      } else {
        this.navBar.showBackButton(false);
      }
    }
  });
}(window.ionic));
;
(function (ionic) {
  'use strict';
  ionic.controllers.SideMenuController = ionic.controllers.ViewController.inherit({
    initialize: function (options) {
      var self = this;
      this.left = options.left;
      this.right = options.right;
      this.content = options.content;
      this.dragThresholdX = options.dragThresholdX || 10;
      this._rightShowing = false;
      this._leftShowing = false;
      this._isDragging = false;
      if (this.content) {
        this.content.onDrag = function (e) {
          self._handleDrag(e);
        };
        this.content.onEndDrag = function (e) {
          self._endDrag(e);
        };
      }
    },
    setContent: function (content) {
      var self = this;
      this.content = content;
      this.content.onDrag = function (e) {
        self._handleDrag(e);
      };
      this.content.endDrag = function (e) {
        self._endDrag(e);
      };
    },
    toggleLeft: function () {
      var openAmount = this.getOpenAmount();
      if (openAmount > 0) {
        this.openPercentage(0);
      } else {
        this.openPercentage(100);
      }
    },
    toggleRight: function () {
      var openAmount = this.getOpenAmount();
      if (openAmount < 0) {
        this.openPercentage(0);
      } else {
        this.openPercentage(-100);
      }
    },
    close: function () {
      this.openPercentage(0);
    },
    getOpenAmount: function () {
      return this.content.getTranslateX() || 0;
    },
    getOpenRatio: function () {
      var amount = this.getOpenAmount();
      if (amount >= 0) {
        return amount / this.left.width;
      }
      return amount / this.right.width;
    },
    isOpen: function () {
      return this.getOpenRatio() == 1;
    },
    getOpenPercentage: function () {
      return this.getOpenRatio() * 100;
    },
    openPercentage: function (percentage) {
      var p = percentage / 100;
      if (this.left && percentage >= 0) {
        this.openAmount(this.left.width * p);
      } else if (this.right && percentage < 0) {
        var maxRight = this.right.width;
        this.openAmount(this.right.width * p);
      }
    },
    openAmount: function (amount) {
      var maxLeft = this.left && this.left.width || 0;
      var maxRight = this.right && this.right.width || 0;
      if (!(this.left && this.left.isEnabled) && amount > 0 || !(this.right && this.right.isEnabled) && amount < 0) {
        return;
      }
      if (this._leftShowing && amount > maxLeft || this._rightShowing && amount < -maxRight) {
        return;
      }
      this.content.setTranslateX(amount);
      if (amount >= 0) {
        this._leftShowing = true;
        this._rightShowing = false;
        this.right && this.right.pushDown && this.right.pushDown();
        this.left && this.left.bringUp && this.left.bringUp();
      } else {
        this._rightShowing = true;
        this._leftShowing = false;
        this.right && this.right.bringUp();
        this.left && this.left.pushDown();
      }
    },
    snapToRest: function (e) {
      this.content.enableAnimation();
      this._isDragging = false;
      var ratio = this.getOpenRatio();
      if (ratio === 0)
        return;
      var velocityThreshold = 0.3;
      var velocityX = e.gesture.velocityX;
      var direction = e.gesture.direction;
      if (ratio > 0 && ratio < 0.5 && direction == 'right' && velocityX < velocityThreshold) {
        this.openPercentage(0);
      } else if (ratio > 0.5 && direction == 'left' && velocityX < velocityThreshold) {
        this.openPercentage(100);
      } else if (ratio < 0 && ratio > -0.5 && direction == 'left' && velocityX < velocityThreshold) {
        this.openPercentage(0);
      } else if (ratio < 0.5 && direction == 'right' && velocityX < velocityThreshold) {
        this.openPercentage(-100);
      } else if (direction == 'right' && ratio >= 0 && (ratio >= 0.5 || velocityX > velocityThreshold)) {
        this.openPercentage(100);
      } else if (direction == 'left' && ratio <= 0 && (ratio <= -0.5 || velocityX > velocityThreshold)) {
        this.openPercentage(-100);
      } else {
        this.openPercentage(0);
      }
    },
    _endDrag: function (e) {
      this.snapToRest(e);
      this._startX = null;
      this._lastX = null;
      this._offsetX = null;
    },
    _handleDrag: function (e) {
      if (!this._startX) {
        this._startX = e.gesture.touches[0].pageX;
        this._lastX = this._startX;
      } else {
        this._lastX = e.gesture.touches[0].pageX;
      }
      if (!this._isDragging && Math.abs(this._lastX - this._startX) > this.dragThresholdX) {
        this._startX = this._lastX;
        this._isDragging = true;
        this.content.disableAnimation();
        this._offsetX = this.getOpenAmount();
      }
      if (this._isDragging) {
        this.openAmount(this._offsetX + (this._lastX - this._startX));
      }
    }
  });
}(ionic));
;
(function (ionic) {
  'use strict';
  ionic.controllers.TabBarController = ionic.controllers.ViewController.inherit({
    initialize: function (options) {
      this.tabBar = options.tabBar;
      this._bindEvents();
      this.controllers = [];
      var controllers = options.controllers || [];
      for (var i = 0; i < controllers.length; i++) {
        this.addController(controllers[i]);
      }
      this.controllerWillChange = options.controllerWillChange || function (controller) {
      };
      this.controllerChanged = options.controllerChanged || function (controller) {
      };
      this.setSelectedController(0);
    },
    _bindEvents: function () {
      var _this = this;
      this.tabBar.tryTabSelect = function (index) {
        _this.setSelectedController(index);
      };
    },
    selectController: function (index) {
      var shouldChange = true;
      if (this.controllerWillChange) {
        if (this.controllerWillChange(this.controllers[index], index) === false) {
          shouldChange = false;
        }
      }
      if (shouldChange) {
        this.setSelectedController(index);
      }
    },
    setSelectedController: function (index) {
      if (index >= this.controllers.length) {
        return;
      }
      var lastController = this.selectedController;
      var lastIndex = this.selectedIndex;
      this.selectedController = this.controllers[index];
      this.selectedIndex = index;
      this._showController(index);
      this.tabBar.setSelectedItem(index);
      this.controllerChanged && this.controllerChanged(lastController, lastIndex, this.selectedController, this.selectedIndex);
    },
    _showController: function (index) {
      var c;
      for (var i = 0, j = this.controllers.length; i < j; i++) {
        c = this.controllers[i];
        c.isVisible = false;
        c.visibilityChanged && c.visibilityChanged();
      }
      c = this.controllers[index];
      c.isVisible = true;
      c.visibilityChanged && c.visibilityChanged();
    },
    _clearSelected: function () {
      this.selectedController = null;
      this.selectedIndex = -1;
    },
    getController: function (index) {
      return this.controllers[index];
    },
    getControllers: function () {
      return this.controllers;
    },
    getSelectedController: function () {
      return this.selectedController;
    },
    getSelectedControllerIndex: function () {
      return this.selectedIndex;
    },
    addController: function (controller) {
      this.controllers.push(controller);
      this.tabBar.addItem({
        title: controller.title,
        icon: controller.icon
      });
      if (!this.selectedController) {
        this.setSelectedController(0);
      }
    },
    setControllers: function (controllers) {
      this.controllers = controllers;
      this._clearSelected();
      this.selectController(0);
    }
  });
}(window.ionic));
;
angular.module('ionic.service', [
  'ionic.service.platform',
  'ionic.service.actionSheet',
  'ionic.service.gesture',
  'ionic.service.loading',
  'ionic.service.modal',
  'ionic.service.popup',
  'ionic.service.templateLoad'
]);
angular.module('ionic.ui', [
  'ionic.ui.content',
  'ionic.ui.tabs',
  'ionic.ui.navRouter',
  'ionic.ui.header',
  'ionic.ui.sideMenu',
  'ionic.ui.slideBox',
  'ionic.ui.list',
  'ionic.ui.checkbox',
  'ionic.ui.toggle',
  'ionic.ui.radio'
]);
angular.module('ionic', [
  'ionic.service',
  'ionic.ui',
  'ngAnimate',
  'ngRoute',
  'ngTouch',
  'ngSanitize'
]);
;
angular.module('ionic.service.actionSheet', [
  'ionic.service.templateLoad',
  'ionic.ui.actionSheet',
  'ngAnimate'
]).factory('ActionSheet', [
  '$rootScope',
  '$document',
  '$compile',
  '$animate',
  '$timeout',
  'TemplateLoader',
  function ($rootScope, $document, $compile, $animate, $timeout, TemplateLoader) {
    return {
      show: function (opts) {
        var scope = $rootScope.$new(true);
        angular.extend(scope, opts);
        var element = $compile('<action-sheet buttons="buttons"></action-sheet>')(scope);
        var sheetEl = angular.element(element[0].querySelector('.action-sheet'));
        var hideSheet = function (didCancel) {
          $animate.leave(sheetEl, function () {
            if (didCancel) {
              opts.cancel();
            }
          });
          $animate.removeClass(element, 'active', function () {
            scope.$destroy();
          });
        };
        scope.cancel = function () {
          hideSheet(true);
        };
        scope.buttonClicked = function (index) {
          if ((opts.buttonClicked && opts.buttonClicked(index)) === true) {
            hideSheet(false);
          }
        };
        scope.destructiveButtonClicked = function () {
          if ((opts.destructiveButtonClicked && opts.destructiveButtonClicked()) === true) {
            hideSheet(false);
          }
        };
        $document[0].body.appendChild(element[0]);
        var sheet = new ionic.views.ActionSheet({ el: element[0] });
        scope.sheet = sheet;
        $animate.addClass(element, 'active');
        $animate.enter(sheetEl, element, null, function () {
        });
        return sheet;
      }
    };
  }
]);
;
angular.module('ionic.service.gesture', []).factory('Gesture', [function () {
    return {
      on: function (eventType, cb, $element) {
        return window.ionic.onGesture(eventType, cb, $element[0]);
      },
      off: function (gesture, eventType, cb) {
        return window.ionic.offGesture(gesture, eventType, cb);
      }
    };
  }]);
;
angular.module('ionic.service.loading', ['ionic.ui.loading']).factory('Loading', [
  '$rootScope',
  '$document',
  '$compile',
  function ($rootScope, $document, $compile) {
    return {
      show: function (opts) {
        var defaults = {
            content: '',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 2000
          };
        opts = angular.extend(defaults, opts);
        var scope = $rootScope.$new(true);
        angular.extend(scope, opts);
        var existing = angular.element($document[0].querySelector('.loading-backdrop'));
        if (existing.length) {
          var scope = existing.scope();
          if (scope.loading) {
            scope.loading.show();
            return scope.loading;
          }
        }
        var element = $compile('<loading>' + opts.content + '</loading>')(scope);
        $document[0].body.appendChild(element[0]);
        var loading = new ionic.views.Loading({
            el: element[0],
            maxWidth: opts.maxWidth,
            showDelay: opts.showDelay
          });
        loading.show();
        scope.loading = loading;
        return loading;
      }
    };
  }
]);
;
angular.module('ionic.service.modal', [
  'ionic.service.templateLoad',
  'ngAnimate'
]).factory('Modal', [
  '$rootScope',
  '$document',
  '$compile',
  '$animate',
  '$q',
  'TemplateLoader',
  function ($rootScope, $document, $compile, $animate, $q, TemplateLoader) {
    var ModalView = ionic.views.Modal.inherit({
        initialize: function (opts) {
          ionic.views.Modal.prototype.initialize.call(this, opts);
          this.animation = opts.animation || 'slide-in-up';
        },
        show: function () {
          var _this = this;
          var element = angular.element(this.el);
          if (!element.parent().length) {
            angular.element($document[0].body).append(element);
            ionic.views.Modal.prototype.show.call(_this);
          }
          $animate.addClass(element, this.animation, function () {
          });
        },
        hide: function () {
          var element = angular.element(this.el);
          $animate.removeClass(element, this.animation);
          ionic.views.Modal.prototype.hide.call(this);
        },
        remove: function () {
          var element = angular.element(this.el);
          $animate.leave(angular.element(this.el), function () {
            scope.$destroy();
          });
        }
      });
    var createModal = function (templateString, options) {
      var scope = options.scope && options.scope.$new() || $rootScope.$new(true);
      var element = $compile(templateString)(scope);
      options.el = element[0];
      var modal = new ModalView(options);
      if (!options.scope) {
        scope.modal = modal;
      }
      return modal;
    };
    return {
      fromTemplate: function (templateString, options) {
        var modal = createModal(templateString, options || {});
        return modal;
      },
      fromTemplateUrl: function (url, cb, options) {
        TemplateLoader.load(url).then(function (templateString) {
          var modal = createModal(templateString, options || {});
          cb(modal);
        });
      }
    };
  }
]);
;
(function () {
  'use strict';
  angular.module('ionic.service.platform', []).provider('Platform', function () {
    var platform = 'web';
    var isPlatformReady = false;
    if (window.cordova || window.PhoneGap || window.phonegap) {
      platform = 'cordova';
    }
    var isReady = function () {
      if (platform == 'cordova') {
        return window.device || window.Cordova;
      }
      return true;
    };
    setTimeout(function afterReadyWait() {
      if (isReady()) {
        ionic.Platform.detect();
      } else {
        setTimeout(afterReadyWait, 50);
      }
    }, 10);
    return {
      setPlatform: function (p) {
        platform = p;
      },
      $get: [
        '$q',
        '$timeout',
        function ($q, $timeout) {
          return {
            onHardwareBackButton: function (cb) {
              this.ready(function () {
                document.addEventListener('backbutton', cb, false);
              });
            },
            offHardwareBackButton: function (fn) {
              this.ready(function () {
                document.removeEventListener('backbutton', fn);
              });
            },
            ready: function (cb) {
              var self = this;
              var q = $q.defer();
              $timeout(function readyWait() {
                if (isReady()) {
                  isPlatformReady = true;
                  q.resolve();
                  cb();
                } else {
                  $timeout(readyWait, 50);
                }
              }, 50);
              return q.promise;
            }
          };
        }
      ]
    };
  });
}(ionic));
;
angular.module('ionic.service.popup', ['ionic.service.templateLoad']).factory('Popup', [
  '$rootScope',
  '$document',
  '$compile',
  'TemplateLoader',
  function ($rootScope, $document, $compile, TemplateLoader) {
    var getPopup = function () {
      var existing = angular.element($document[0].querySelector('.popup'));
      if (existing.length) {
        var scope = existing.scope();
        if (scope.popup) {
          return scope;
        }
      }
    };
    return {
      alert: function (message, $scope) {
        var existing = getPopup();
        if (existing) {
          return existing.popup.alert(message);
        }
        var defaults = {
            title: message,
            animation: 'fade-in'
          };
        opts = angular.extend(defaults, opts);
        var scope = $scope && $scope.$new() || $rootScope.$new(true);
        angular.extend(scope, opts);
        var element = $compile('<popup>' + opts.content + '</popup>')(scope);
        $document[0].body.appendChild(element[0]);
        var popup = new ionic.views.Popup({ el: element[0] });
        popup.alert(message);
        scope.popup = popup;
        return popup;
      },
      confirm: function (cb) {
      },
      prompt: function (cb) {
      },
      show: function (data) {
      }
    };
  }
]);
;
angular.module('ionic.service.templateLoad', []).factory('TemplateLoader', [
  '$q',
  '$http',
  '$templateCache',
  function ($q, $http, $templateCache) {
    return {
      load: function (url) {
        var deferred = $q.defer();
        $http({
          method: 'GET',
          url: url,
          cache: $templateCache
        }).success(function (html) {
          deferred.resolve(html && html.trim());
        }).error(function (err) {
          deferred.reject(err);
        });
        return deferred.promise;
      }
    };
  }
]);
;
(function () {
  'use strict';
  angular.module('ionic.ui.actionSheet', []).directive('actionSheet', [
    '$document',
    function ($document) {
      return {
        restrict: 'E',
        scope: true,
        replace: true,
        link: function ($scope, $element) {
          var keyUp = function (e) {
            if (e.which == 27) {
              $scope.cancel();
              $scope.$apply();
            }
          };
          var backdropClick = function (e) {
            if (e.target == $element[0]) {
              $scope.cancel();
              $scope.$apply();
            }
          };
          $scope.$on('$destroy', function () {
            $element.remove();
            $document.unbind('keyup', keyUp);
          });
          $document.bind('keyup', keyUp);
          $element.bind('click', backdropClick);
        },
        template: '<div class="action-sheet-backdrop">' + '<div class="action-sheet action-sheet-up">' + '<div class="action-sheet-group">' + '<div class="action-sheet-title" ng-if="titleText">{{titleText}}</div>' + '<button class="button" ng-click="buttonClicked($index)" ng-repeat="button in buttons">{{button.text}}</button>' + '</div>' + '<div class="action-sheet-group" ng-if="destructiveText">' + '<button class="button destructive" ng-click="destructiveButtonClicked()">{{destructiveText}}</button>' + '</div>' + '<div class="action-sheet-group" ng-if="cancelText">' + '<button class="button" ng-click="cancel()">{{cancelText}}</button>' + '</div>' + '</div>' + '</div>'
      };
    }
  ]);
}());
;
(function (ionic) {
  'use strict';
  angular.module('ionic.ui.header', ['ngAnimate']).directive('headerBar', function () {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      template: '<header class="bar bar-header">                <div class="buttons">                  <button ng-repeat="button in leftButtons" class="button" ng-class="button.type" ng-click="button.tap($event, $index)" ng-bind-html="button.content">                  </button>                </div>                <h1 class="title" ng-bind-html="title"></h1>                <div class="buttons">                  <button ng-repeat="button in rightButtons" class="button" ng-class="button.type" ng-click="button.tap($event, $index)" ng-bind-html="button.content">                  </button>                </div>              </header>',
      scope: {
        leftButtons: '=',
        rightButtons: '=',
        title: '=',
        type: '@',
        alignTitle: '@'
      },
      link: function ($scope, $element, $attr) {
        var hb = new ionic.views.HeaderBar({
            el: $element[0],
            alignTitle: $scope.alignTitle || 'center'
          });
        $element.addClass($scope.type);
        $scope.headerBarView = hb;
        $scope.$watch('leftButtons', function (val) {
          hb.align();
        });
        $scope.$watch('rightButtons', function (val) {
          hb.align();
        });
        $scope.$watch('title', function (val) {
          console.log('Title changed');
          hb.align();
        });
      }
    };
  }).directive('footerBar', function () {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      template: '<footer class="bar bar-footer" ng-transclude>              </footer>',
      scope: { type: '@' },
      link: function ($scope, $element, $attr) {
        $element.addClass($scope.type);
      }
    };
  });
}(ionic));
;
(function () {
  'use strict';
  angular.module('ionic.ui.checkbox', []).directive('checkbox', function () {
    return {
      restrict: 'E',
      replace: true,
      require: '?ngModel',
      scope: {},
      transclude: true,
      template: '<label ng-click="tapHandler($event)" class="checkbox"><input type="checkbox"><div ng-transclude></div></label>',
      link: function ($scope, $element, $attr, ngModel) {
        var checkbox;
        if (!ngModel) {
          return;
        }
        checkbox = $element.children().eq(0);
        if (!checkbox.length) {
          return;
        }
        $scope.tapHandler = function (e) {
          if (e.type != 'click') {
            checkbox[0].checked = !checkbox[0].checked;
          }
          ngModel.$setViewValue(checkbox[0].checked);
          e.alreadyHandled = true;
        };
        var clickHandler = function (e) {
          checkbox[0].checked = !checkbox[0].checked;
          $scope.$apply(function () {
            ngModel.$setViewValue(checkbox[0].checked);
          });
        };
        if (ngModel) {
          ngModel.$render = function () {
            checkbox[0].checked = ngModel.$viewValue;
          };
        }
      }
    };
  });
}());
;
(function () {
  'use strict';
  angular.module('ionic.ui.content', []).directive('pane', function () {
    return {
      restrict: 'E',
      link: function (scope, element, attr) {
        element.addClass('pane');
      }
    };
  }).directive('content', [
    '$parse',
    '$timeout',
    function ($parse, $timeout) {
      return {
        restrict: 'E',
        replace: true,
        template: '<div class="scroll-content"></div>',
        transclude: true,
        scope: {
          onRefresh: '&',
          onRefreshOpening: '&',
          refreshComplete: '=',
          scroll: '@',
          hasScrollX: '@',
          hasScrollY: '@'
        },
        compile: function (element, attr, transclude) {
          return function ($scope, $element, $attr) {
            var clone, sc, sv;
            var addedPadding = false;
            var c = $element.eq(0);
            if (attr.hasHeader == 'true') {
              c.addClass('has-header');
            }
            if (attr.hasSubheader == 'true') {
              c.addClass('has-subheader');
            }
            if (attr.hasFooter == 'true') {
              c.addClass('has-footer');
            }
            if (attr.hasTabs == 'true') {
              c.addClass('has-tabs');
            }
            if ($scope.scroll === 'false') {
              clone = transclude($scope.$parent);
              $element.append(clone);
            } else if (attr.overflowScroll === 'true') {
              c.addClass('overflow-scroll');
              clone = transclude($scope.$parent);
              $element.append(clone);
            } else {
              sc = document.createElement('div');
              sc.className = 'scroll';
              if (attr.padding == 'true') {
                sc.className += ' padding';
                addedPadding = true;
              }
              $element.append(sc);
              clone = transclude($scope.$parent);
              angular.element($element[0].firstElementChild).append(clone);
              var refresher = $element[0].querySelector('.scroll-refresher');
              var refresherHeight = refresher && refresher.clientHeight || 0;
              if (attr.refreshComplete) {
                $scope.refreshComplete = function () {
                  if ($scope.scrollView) {
                    refresher && refresher.classList.remove('active');
                    $scope.scrollView.finishPullToRefresh();
                    $scope.$parent.$broadcast('scroll.onRefreshComplete');
                  }
                };
              }
              $timeout(function () {
                sv = new ionic.views.Scroll({ el: $element[0] });
                if (refresher) {
                  sv.activatePullToRefresh(refresherHeight, function () {
                    refresher.classList.add('active');
                  }, function () {
                    refresher.classList.remove('refreshing');
                    refresher.classList.remove('active');
                  }, function () {
                    refresher.classList.add('refreshing');
                    $scope.onRefresh();
                    $scope.$parent.$broadcast('scroll.onRefresh');
                  });
                }
                $scope.$parent.$on('scroll.refreshComplete', function (e) {
                  sv && sv.finishPullToRefresh();
                });
                $scope.$parent.scrollView = sv;
              }, 500);
            }
            if (attr.padding == 'true' && !addedPadding) {
              c.addClass('padding');
            }
          };
        }
      };
    }
  ]).directive('refresher', function () {
    return {
      restrict: 'E',
      replace: true,
      require: [
        '^?content',
        '^?list'
      ],
      template: '<div class="scroll-refresher"><div class="ionic-refresher-content"><i class="icon ion-arrow-down-c icon-pulling"></i><i class="icon ion-loading-d icon-refreshing"></i></div></div>',
      scope: true
    };
  }).directive('scroll-refresher', function () {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      template: '<div class="scroll-refresher"><div class="scroll-refresher-content"></div></div>'
    };
  });
}());
;
(function () {
  'use strict';
  angular.module('ionic.ui.list', ['ngAnimate']).directive('linkItem', [
    '$timeout',
    function ($timeout) {
      return {
        restrict: 'E',
        require: ['?^list'],
        replace: true,
        transclude: true,
        scope: {
          item: '=',
          onSelect: '&',
          onDelete: '&',
          canDelete: '@',
          canReorder: '@',
          canSwipe: '@',
          buttons: '=',
          type: '@',
          href: '@'
        },
        template: '<a href="{{href}}" class="item">            <div class="item-edit" ng-if="canDelete && isEditing">              <button class="button button-icon icon" ng-class="deleteIcon" ng-click="onDelete()"></button>            </div>            <div class="item-content slide-left" ng-transclude>            </div>             <div class="item-drag" ng-if="canReorder && isEditing">               <button data-ionic-action="reorder" class="button button-icon icon" ng-class="reorderIcon"></button>             </div>            <div class="item-options" ng-if="canSwipe && !isEditing && showOptions">             <button ng-click="buttonClicked(button)" class="button" ng-class="button.type" ng-repeat="button in buttons">{{button.text}}</button>           </div>          </a>',
        link: function ($scope, $element, $attr, list) {
          if (list[0]) {
            list = list[0];
          } else if (list[1]) {
            list = list[1];
          }
          $attr.$observe('href', function (value) {
            $scope.href = value;
          });
          $element.addClass($attr.type || 'item-complex');
          if ($attr.type !== 'item-complex') {
            $scope.canSwipe = false;
          }
          $scope.isEditing = false;
          $scope.deleteIcon = list.scope.deleteIcon;
          $scope.reorderIcon = list.scope.reorderIcon;
          $scope.showOptions = true;
          $scope.buttonClicked = function (button) {
            button.onButtonClicked && button.onButtonClicked($scope.item, button);
          };
          var deregisterListWatch = list.scope.$watch('isEditing', function (v) {
              $scope.isEditing = v;
              if (!v) {
                $timeout(function () {
                  $scope.showOptions = true;
                }, 200);
              } else {
                $scope.showOptions = false;
              }
            });
          $scope.$on('$destroy', function () {
            deregisterListWatch();
          });
        }
      };
    }
  ]).directive('item', [
    '$timeout',
    function ($timeout) {
      return {
        restrict: 'E',
        require: ['?^list'],
        replace: true,
        transclude: true,
        scope: {
          item: '=',
          onSelect: '&',
          onDelete: '&',
          canDelete: '@',
          canReorder: '@',
          canSwipe: '@',
          buttons: '=',
          type: '@'
        },
        template: '<li class="item">            <div class="item-edit" ng-if="canDelete && isEditing">              <button class="button button-icon icon" ng-class="deleteIcon" ng-click="onDelete()"></button>            </div>            <div class="item-content slide-left" ng-transclude>            </div>             <div class="item-drag" ng-if="canReorder && isEditing">               <button data-ionic-action="reorder" class="button button-icon"><i ng-class="reorderIcon"></i></button>             </div>            <div class="item-options" ng-if="canSwipe && !isEditing && showOptions">             <button ng-click="buttonClicked(button)" class="button" ng-class="button.type" ng-repeat="button in buttons">{{button.text}}</button>           </div>          </li>',
        link: function ($scope, $element, $attr, list) {
          if (list[0]) {
            list = list[0];
          } else if (list[1]) {
            list = list[1];
          }
          $element.addClass($attr.type || 'item-complex');
          if ($attr.type !== 'item-complex') {
            $scope.canSwipe = false;
          }
          $scope.isEditing = false;
          $scope.deleteIcon = list.scope.deleteIcon;
          $scope.reorderIcon = list.scope.reorderIcon;
          $scope.showOptions = true;
          $scope.buttonClicked = function (button) {
            button.onButtonClicked && button.onButtonClicked($scope.item, button);
          };
          var deregisterListWatch = list.scope.$watch('isEditing', function (v) {
              $scope.isEditing = v;
              if (!v) {
                $timeout(function () {
                  $scope.showOptions = true;
                }, 200);
              } else {
                $scope.showOptions = false;
              }
            });
          $scope.$on('$destroy', function () {
            deregisterListWatch();
          });
        }
      };
    }
  ]).directive('list', function () {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        isEditing: '=',
        deleteIcon: '@',
        reorderIcon: '@',
        hasPullToRefresh: '@',
        onRefresh: '&',
        onRefreshOpening: '&',
        onReorder: '&',
        refreshComplete: '='
      },
      controller: function ($scope) {
        var _this = this;
        this.scope = $scope;
        $scope.$watch('isEditing', function (v) {
          _this.isEditing = true;
        });
      },
      template: '<ul class="list" ng-class="{\'list-editing\': isEditing}" ng-transclude>              </ul>',
      link: function ($scope, $element, $attr) {
        var lv = new ionic.views.ListView({
            el: $element[0],
            listEl: $element[0].children[0],
            hasPullToRefresh: $scope.hasPullToRefresh !== 'false',
            onRefresh: function () {
              $scope.onRefresh();
              $scope.$parent.$broadcast('scroll.onRefresh');
            },
            onRefreshOpening: function (amt) {
              $scope.onRefreshOpening({ amount: amt });
              $scope.$parent.$broadcast('scroll.onRefreshOpening', amt);
            },
            onReorder: function (el, oldIndex, newIndex) {
              console.log('Moved', el, oldIndex, newIndex);
              $scope.$apply(function () {
                $scope.onReorder({
                  el: el,
                  start: oldIndex,
                  end: newIndex
                });
              });
            }
          });
        $scope.listView = lv;
        if ($attr.refreshComplete) {
          $scope.refreshComplete = function () {
            lv.doneRefreshing();
            $scope.$parent.$broadcast('scroll.onRefreshComplete');
          };
        }
        if ($attr.animation) {
          $element.addClass($attr.animation);
        }
      }
    };
  });
}());
;
(function () {
  'use strict';
  angular.module('ionic.ui.loading', []).directive('loading', function () {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      link: function ($scope, $element) {
        $element.addClass($scope.animation || '');
      },
      template: '<div class="loading-backdrop" ng-class="{enabled: showBackdrop}">' + '<div class="loading" ng-transclude>' + '</div>' + '</div>'
    };
  });
}());
;
(function () {
  'use strict';
  var actualLocation = null;
  angular.module('ionic.ui.navRouter', ['ionic.service.gesture']).run([
    '$rootScope',
    function ($rootScope) {
      $rootScope.stackCursorPosition = 0;
    }
  ]).directive('navRouter', [
    '$rootScope',
    '$timeout',
    '$location',
    '$window',
    '$route',
    function ($rootScope, $timeout, $location, $window, $route) {
      return {
        restrict: 'AC',
        controller: [
          '$scope',
          '$element',
          function ($scope, $element) {
            this.navBar = { isVisible: true };
            $scope.navController = this;
            this.goBack = function () {
              $scope.direction = 'back';
            };
          }
        ],
        link: function ($scope, $element, $attr) {
          if (!$element.length)
            return;
          $scope.animation = $attr.animation;
          $element[0].classList.add('noop-animation');
          var isFirst = true;
          var didAnimate = false;
          var initTransition = function () {
          };
          var reverseTransition = function () {
            $element[0].classList.remove('noop-animation');
            $element[0].classList.add($scope.animation);
            $element[0].classList.add('reverse');
          };
          var forwardTransition = function () {
            $element[0].classList.remove('noop-animation');
            $element[0].classList.remove('reverse');
            $element[0].classList.add($scope.animation);
          };
          $scope.$on('$routeChangeSuccess', function (e, a) {
          });
          $scope.$on('$routeChangeStart', function (e, next, current) {
            var back, historyState = $window.history.state;
            back = $scope.direction == 'back' || !!(historyState && historyState.position <= $rootScope.stackCursorPosition);
            if (isFirst || next && next.$$route && next.$$route.originalPath === '') {
              isFirst = false;
              return;
            }
            if (didAnimate || $rootScope.stackCursorPosition > 0) {
              didAnimate = true;
              if (back) {
                reverseTransition();
              } else {
                forwardTransition();
              }
            }
          });
          $scope.$on('$locationChangeSuccess', function (a, b, c) {
            $rootScope.actualLocation = $location.path();
            if (isFirst && $location.path() !== '/') {
              isFirst = false;
            }
          });
          $scope.$watch(function () {
            return $location.path();
          }, function (newLocation, oldLocation) {
            if ($rootScope.actualLocation === newLocation) {
              if (oldLocation === '') {
                return;
              }
              var back, historyState = $window.history.state;
              back = $scope.direction == 'back' || !!(historyState && historyState.position <= $rootScope.stackCursorPosition);
              if (back) {
                $rootScope.stackCursorPosition--;
              } else {
                $rootScope.stackCursorPosition++;
              }
              $scope.direction = 'forwards';
            } else {
              var currentRouteBeforeChange = $route.current;
              if (currentRouteBeforeChange) {
                $window.history.replaceState({ position: $rootScope.stackCursorPosition });
                $rootScope.stackCursorPosition++;
              }
            }
          });
        }
      };
    }
  ]).directive('navBar', [
    '$rootScope',
    '$animate',
    '$compile',
    function ($rootScope, $animate, $compile) {
      var animate = function ($scope, $element, oldTitle, data, cb) {
        var title, nTitle, oTitle, titles = $element[0].querySelectorAll('.title');
        var newTitle = data.title;
        if (!oldTitle || oldTitle === newTitle) {
          cb();
          return;
        }
        title = angular.element(titles[0]);
        oTitle = $compile('<h1 class="title ng-leave" ng-bind="oldTitle"></h1>')($scope);
        title.replaceWith(oTitle);
        nTitle = $compile('<h1 class="title ng-enter" ng-bind="currentTitle"></h1>')($scope);
        var insert = $element[0].firstElementChild || null;
        $animate.enter(nTitle, $element, insert && angular.element(insert), function () {
          cb();
        });
        $animate.leave(angular.element(oTitle), function () {
        });
      };
      return {
        restrict: 'E',
        require: '^navRouter',
        replace: true,
        scope: {
          type: '@',
          backButtonType: '@',
          backButtonLabel: '@',
          backButtonIcon: '@',
          alignTitle: '@'
        },
        template: '<header class="bar bar-header nav-bar" ng-class="{invisible: !navController.navBar.isVisible}">' + '<div class="buttons"> ' + '<button nav-back class="button" ng-if="enableBackButton && showBackButton" ng-class="backButtonClass" ng-bind-html="backButtonLabel"></button>' + '<button ng-click="button.tap($event)" ng-repeat="button in leftButtons" class="button {{button.type}}" ng-bind-html="button.content"></button>' + '</div>' + '<h1 class="title" ng-bind="currentTitle"></h1>' + '<div class="buttons" ng-if="rightButtons.length"> ' + '<button ng-click="button.tap($event)" ng-repeat="button in rightButtons" class="button {{button.type}}" ng-bind-html="button.content"></button>' + '</div>' + '</header>',
        link: function ($scope, $element, $attr, navCtrl) {
          var backButton;
          $element.addClass($attr.animation);
          $scope.enableBackButton = true;
          $scope.backButtonClass = $attr.backButtonType;
          if ($attr.backButtonIcon) {
            $scope.backButtonClass += ' icon ' + $attr.backButtonIcon;
          }
          $rootScope.$watch('stackCursorPosition', function (value) {
            if (value > 0) {
              $scope.showBackButton = true;
            } else {
              $scope.showBackButton = false;
            }
          });
          $scope.navController = navCtrl;
          var hb = new ionic.views.HeaderBar({
              el: $element[0],
              alignTitle: $scope.alignTitle || 'center'
            });
          $scope.headerBarView = hb;
          $element.addClass($scope.type);
          var updateHeaderData = function (data) {
            var oldTitle = $scope.currentTitle;
            $scope.oldTitle = oldTitle;
            if (typeof data.title !== 'undefined') {
              $scope.currentTitle = data.title;
            }
            $scope.leftButtons = data.leftButtons;
            $scope.rightButtons = data.rightButtons;
            if (typeof data.hideBackButton !== 'undefined') {
              $scope.enableBackButton = data.hideBackButton !== true;
            }
            if (data.animate !== false && typeof data.title !== 'undefined') {
              animate($scope, $element, oldTitle, data, function () {
                hb.align();
              });
            } else {
              hb.align();
            }
          };
          $scope.$parent.$on('navRouter.pageChanged', function (e, data) {
            updateHeaderData(data);
          });
          $scope.$parent.$on('navRouter.pageShown', function (e, data) {
            updateHeaderData(data);
          });
          $scope.$parent.$on('navRouter.titleChanged', function (e, data) {
            var oldTitle = $scope.currentTitle;
            $scope.oldTitle = oldTitle;
            if (typeof data.title !== 'undefined') {
              $scope.currentTitle = data.title;
            }
            if (data.animate !== false && typeof data.title !== 'undefined') {
              animate($scope, $element, oldTitle, data, function () {
                hb.align();
              });
            } else {
              hb.align();
            }
          });
          $scope.$parent.$on('navRouter.leftButtonsChanged', function (e, data) {
            $scope.leftButtons = data;
          });
          $scope.$parent.$on('navRouter.rightButtonsChanged', function (e, data) {
            $scope.rightButtons = data;
          });
          $scope.$on('$destroy', function () {
          });
        }
      };
    }
  ]).directive('navPage', [
    '$parse',
    function ($parse) {
      return {
        restrict: 'E',
        scope: true,
        require: '^navRouter',
        link: function ($scope, $element, $attr, navCtrl) {
          $element.addClass('pane');
          $scope.icon = $attr.icon;
          $scope.iconOn = $attr.iconOn;
          $scope.iconOff = $attr.iconOff;
          $scope.hideBackButton = $scope.$eval($attr.hideBackButton);
          $scope.hideNavBar = $scope.$eval($attr.hideNavBar);
          navCtrl.navBar.isVisible = !$scope.hideNavBar;
          $scope.animate = $scope.$eval($attr.animate);
          $scope.doesUpdateNavRouter = $scope.$eval($attr.doesUpdateNavRouter) || true;
          var leftButtonsGet = $parse($attr.leftButtons);
          $scope.$watch(leftButtonsGet, function (value) {
            $scope.leftButtons = value;
            if ($scope.doesUpdateNavRouter) {
              $scope.$emit('navRouter.leftButtonsChanged', $scope.leftButtons);
            }
          });
          var rightButtonsGet = $parse($attr.rightButtons);
          $scope.$watch(rightButtonsGet, function (value) {
            $scope.rightButtons = value;
            if ($scope.doesUpdateNavRouter) {
              $scope.$emit('navRouter.rightButtonsChanged', $scope.rightButtons);
            }
          });
          var titleGet = $parse($attr.title);
          $scope.$watch(titleGet, function (value) {
            $scope.title = value;
            $scope.$emit('navRouter.titleChanged', {
              title: value,
              animate: $scope.animate
            });
          });
        }
      };
    }
  ]).directive('navBack', [
    '$window',
    '$rootScope',
    'Gesture',
    function ($window, $rootScope, Gesture) {
      return {
        restrict: 'AC',
        require: '^?navRouter',
        link: function ($scope, $element, $attr, navCtrl) {
          var goBack = function (e) {
            if ($rootScope.stackCursorPosition > 0) {
              $window.history.back();
              navCtrl.goBack();
            }
            e.alreadyHandled = true;
            return false;
          };
          $element.bind('click', goBack);
        }
      };
    }
  ]);
}());
;
(function (ionic) {
  'use strict';
  angular.module('ionic.ui.radio', []).directive('radio', function () {
    return {
      restrict: 'E',
      replace: true,
      require: '?ngModel',
      scope: { value: '@' },
      transclude: true,
      template: '<label ng-click="tapHandler($event)" class="item item-radio">                <input type="radio" name="group">                <div class="item-content" ng-transclude>                </div>                <i class="radio-icon icon ion-checkmark"></i>              </label>',
      link: function ($scope, $element, $attr, ngModel) {
        var radio;
        if (!ngModel) {
          return;
        }
        radio = $element.children().eq(0);
        if (!radio.length) {
          return;
        }
        $scope.tapHandler = function (e) {
          radio[0].checked = true;
          ngModel.$setViewValue($scope.$eval($attr.ngValue));
          e.alreadyHandled = true;
        };
        var clickHandler = function (e) {
          ngModel.$setViewValue($scope.$eval($attr.ngValue));
        };
        if (ngModel) {
          $element.bind('click', clickHandler);
          ngModel.$render = function () {
            var val = $scope.$eval($attr.ngValue);
            if (val === ngModel.$viewValue) {
              radio.attr('checked', 'checked');
            } else {
              radio.removeAttr('checked');
            }
          };
        }
      }
    };
  });
}(window.ionic));
;
(function () {
  'use strict';
  angular.module('ionic.ui.sideMenu', ['ionic.service.gesture']).directive('sideMenus', function () {
    return {
      restrict: 'ECA',
      controller: [
        '$scope',
        function ($scope) {
          var _this = this;
          angular.extend(this, ionic.controllers.SideMenuController.prototype);
          ionic.controllers.SideMenuController.call(this, {
            left: { width: 270 },
            right: { width: 270 }
          });
          $scope.sideMenuContentTranslateX = 0;
          $scope.sideMenuController = this;
        }
      ],
      replace: true,
      transclude: true,
      template: '<div class="pane" ng-transclude></div>'
    };
  }).directive('sideMenuContent', [
    'Gesture',
    function (Gesture) {
      return {
        restrict: 'AC',
        require: '^sideMenus',
        scope: true,
        compile: function (element, attr, transclude) {
          return function ($scope, $element, $attr, sideMenuCtrl) {
            $element.addClass('menu-content');
            var defaultPrevented = false;
            var isDragging = false;
            ionic.on('mousedown', function (e) {
              defaultPrevented = e.defaultPrevented;
            });
            var dragFn = function (e) {
              if (defaultPrevented) {
                return;
              }
              isDragging = true;
              sideMenuCtrl._handleDrag(e);
              e.gesture.srcEvent.preventDefault();
            };
            var dragVertFn = function (e) {
              if (isDragging) {
                e.gesture.srcEvent.preventDefault();
              }
            };
            var dragRightGesture = Gesture.on('dragright', dragFn, $element);
            var dragLeftGesture = Gesture.on('dragleft', dragFn, $element);
            var dragUpGesture = Gesture.on('dragup', dragVertFn, $element);
            var dragDownGesture = Gesture.on('dragdown', dragVertFn, $element);
            var dragReleaseFn = function (e) {
              isDragging = false;
              if (!defaultPrevented) {
                sideMenuCtrl._endDrag(e);
              }
              defaultPrevented = false;
            };
            var releaseGesture = Gesture.on('release', dragReleaseFn, $element);
            sideMenuCtrl.setContent({
              onDrag: function (e) {
              },
              endDrag: function (e) {
              },
              getTranslateX: function () {
                return $scope.sideMenuContentTranslateX || 0;
              },
              setTranslateX: function (amount) {
                $scope.sideMenuContentTranslateX = amount;
                $element[0].style.webkitTransform = 'translate3d(' + amount + 'px, 0, 0)';
              },
              enableAnimation: function () {
                $scope.animationEnabled = true;
                $element[0].classList.add('menu-animated');
              },
              disableAnimation: function () {
                $scope.animationEnabled = false;
                $element[0].classList.remove('menu-animated');
              }
            });
            $scope.$on('$destroy', function () {
              Gesture.off(dragLeftGesture, 'dragleft', dragFn);
              Gesture.off(dragRightGesture, 'dragright', dragFn);
              Gesture.off(dragUpGesture, 'dragup', dragFn);
              Gesture.off(dragDownGesture, 'dragdown', dragFn);
              Gesture.off(releaseGesture, 'release', dragReleaseFn);
            });
          };
        }
      };
    }
  ]).directive('sideMenu', function () {
    return {
      restrict: 'E',
      require: '^sideMenus',
      replace: true,
      transclude: true,
      scope: true,
      template: '<div class="menu menu-{{side}}"></div>',
      compile: function (element, attr, transclude) {
        return function ($scope, $element, $attr, sideMenuCtrl) {
          $scope.side = $attr.side;
          if ($scope.side == 'left') {
            sideMenuCtrl.left.isEnabled = true;
            sideMenuCtrl.left.pushDown = function () {
              $element[0].style.zIndex = -1;
            };
            sideMenuCtrl.left.bringUp = function () {
              $element[0].style.zIndex = 0;
            };
          } else if ($scope.side == 'right') {
            sideMenuCtrl.right.isEnabled = true;
            sideMenuCtrl.right.pushDown = function () {
              $element[0].style.zIndex = -1;
            };
            sideMenuCtrl.right.bringUp = function () {
              $element[0].style.zIndex = 0;
            };
          }
          $element.append(transclude($scope));
        };
      }
    };
  });
}());
;
(function () {
  'use strict';
  angular.module('ionic.ui.slideBox', []).directive('slideBox', [
    '$compile',
    function ($compile) {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        controller: [
          '$scope',
          '$element',
          function ($scope, $element) {
            $scope.slides = [];
            this.slideAdded = function () {
              $scope.slides.push({});
            };
          }
        ],
        scope: {},
        template: '<div class="slide-box">            <div class="slide-box-slides" ng-transclude>            </div>          </div>',
        link: function ($scope, $element, $attr, slideBoxCtrl) {
          if ($attr.showPager !== 'false') {
            var childScope = $scope.$new();
            var pager = $compile('<pager></pager>')(childScope);
            $element.append(pager);
            $scope.slideBox = new ionic.views.SlideBox({
              el: $element[0],
              slideChanged: function (slideIndex) {
                $scope.$parent.$broadcast('slideBox.slideChanged', slideIndex);
              }
            });
          }
        }
      };
    }
  ]).directive('slide', function () {
    return {
      restrict: 'E',
      replace: true,
      require: '^slideBox',
      transclude: true,
      template: '<div class="slide-box-slide" ng-transclude></div>',
      compile: function (element, attr, transclude) {
        return function ($scope, $element, $attr, slideBoxCtrl) {
          slideBoxCtrl.slideAdded();
        };
      }
    };
  }).directive('pager', function () {
    return {
      restrict: 'E',
      replace: true,
      require: '^slideBox',
      template: '<div class="slide-box-pager"><span ng-repeat="slide in slides"><i class="icon ion-record"></i></span></div>'
    };
  });
}());
;
angular.module('ionic.ui.tabs', ['ngAnimate']).directive('tabs', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    transclude: true,
    controller: [
      '$scope',
      '$element',
      '$animate',
      function ($scope, $element, $animate) {
        var _this = this;
        angular.extend(this, ionic.controllers.TabBarController.prototype);
        ionic.controllers.TabBarController.call(this, {
          controllerChanged: function (oldC, oldI, newC, newI) {
            $scope.controllerChanged && $scope.controllerChanged({
              oldController: oldC,
              oldIndex: oldI,
              newController: newC,
              newIndex: newI
            });
          },
          tabBar: {
            tryTabSelect: function () {
            },
            setSelectedItem: function (index) {
            },
            addItem: function (item) {
            }
          }
        });
        this.add = function (controller) {
          this.addController(controller);
          this.select(0);
        };
        this.select = function (controllerIndex) {
          $scope.activeAnimation = $scope.animation;
          _this.selectController(controllerIndex);
        };
        $scope.controllers = this.controllers;
        $scope.tabsController = this;
      }
    ],
    template: '<div class="view"><tab-controller-bar></tab-controller-bar></div>',
    compile: function (element, attr, transclude, tabsCtrl) {
      return function ($scope, $element, $attr) {
        var tabs = $element[0].querySelector('.tabs');
        $scope.tabsType = $attr.tabsType || 'tabs-positive';
        $scope.tabsStyle = $attr.tabsStyle;
        $scope.animation = $attr.animation;
        $scope.animateNav = $scope.$eval($attr.animateNav);
        if ($scope.animateNav !== false) {
          $scope.animateNav = true;
        }
        $attr.$observe('tabsStyle', function (val) {
          if (tabs) {
            angular.element(tabs).addClass($attr.tabsStyle);
          }
        });
        $attr.$observe('tabsType', function (val) {
          if (tabs) {
            angular.element(tabs).addClass($attr.tabsType);
          }
        });
        $scope.$watch('activeAnimation', function (value) {
          $element.addClass($scope.activeAnimation);
        });
        transclude($scope, function (cloned) {
          $element.prepend(cloned);
        });
      };
    }
  };
}).directive('tab', [
  '$animate',
  '$parse',
  function ($animate, $parse) {
    return {
      restrict: 'E',
      require: '^tabs',
      scope: true,
      transclude: 'element',
      compile: function (element, attr, transclude) {
        return function ($scope, $element, $attr, tabsCtrl) {
          var childScope, childElement;
          $scope.title = $attr.title;
          $scope.icon = $attr.icon;
          $scope.iconOn = $attr.iconOn;
          $scope.iconOff = $attr.iconOff;
          $scope.hideBackButton = $scope.$eval($attr.hideBackButton);
          if ($scope.hideBackButton !== true) {
            $scope.hideBackButton = false;
          }
          $scope.animate = $scope.$eval($attr.animate);
          $scope.doesUpdateNavRouter = $scope.$eval($attr.doesUpdateNavRouter);
          if ($scope.doesUpdateNavRouter !== false) {
            $scope.doesUpdateNavRouter = true;
          }
          var leftButtonsGet = $parse($attr.leftButtons);
          $scope.$watch(leftButtonsGet, function (value) {
            $scope.leftButtons = value;
            if ($scope.doesUpdateNavRouter) {
              $scope.$emit('navRouter.leftButtonsChanged', $scope.rightButtons);
            }
          });
          var rightButtonsGet = $parse($attr.rightButtons);
          $scope.$watch(rightButtonsGet, function (value) {
            $scope.rightButtons = value;
          });
          tabsCtrl.add($scope);
          $scope.$watch('isVisible', function (value) {
            if (childElement) {
              $animate.leave(childElement);
              $scope.$broadcast('tab.hidden');
              childElement = undefined;
            }
            if (childScope) {
              childScope.$destroy();
              childScope = undefined;
            }
            if (value) {
              childScope = $scope.$new();
              transclude(childScope, function (clone) {
                childElement = clone;
                clone.addClass('pane');
                $animate.enter(clone, $element.parent(), $element);
                if ($scope.title) {
                  if ($scope.doesUpdateNavRouter) {
                    $scope.$emit('navRouter.pageShown', {
                      title: $scope.title,
                      rightButtons: $scope.rightButtons,
                      leftButtons: $scope.leftButtons,
                      hideBackButton: $scope.hideBackButton,
                      animate: $scope.animateNav
                    });
                  }
                }
                $scope.$broadcast('tab.shown');
              });
            }
          });
        };
      }
    };
  }
]).directive('tabControllerBar', function () {
  return {
    restrict: 'E',
    require: '^tabs',
    transclude: true,
    replace: true,
    scope: true,
    template: '<div class="tabs">' + '<tab-controller-item title="{{controller.title}}" icon="{{controller.icon}}" icon-on="{{controller.iconOn}}" icon-off="{{controller.iconOff}}" active="controller.isVisible" index="$index" ng-repeat="controller in controllers"></tab-controller-item>' + '</div>',
    link: function ($scope, $element, $attr, tabsCtrl) {
      $element.addClass($scope.tabsType);
      $element.addClass($scope.tabsStyle);
    }
  };
}).directive('tabControllerItem', function () {
  return {
    restrict: 'E',
    replace: true,
    require: '^tabs',
    scope: {
      title: '@',
      icon: '@',
      iconOn: '@',
      iconOff: '@',
      active: '=',
      tabSelected: '@',
      index: '='
    },
    link: function (scope, element, attrs, tabsCtrl) {
      if (attrs.icon) {
        scope.iconOn = scope.iconOff = attrs.icon;
      }
      scope.selectTab = function (index) {
        tabsCtrl.select(scope.index);
      };
    },
    template: '<a ng-class="{active:active}" ng-click="selectTab()" class="tab-item">' + '<i class="{{icon}}" ng-if="icon"></i>' + '<i class="{{iconOn}}" ng-if="active"></i>' + '<i class="{{iconOff}}" ng-if="!active"></i> {{title}}' + '</a>'
  };
}).directive('tabBar', function () {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: '<div class="tabs tabs-primary" ng-transclude>' + '</div>'
  };
});
;
(function (ionic) {
  'use strict';
  angular.module('ionic.ui.toggle', []).directive('toggle', function () {
    return {
      restrict: 'E',
      replace: true,
      require: '?ngModel',
      scope: {},
      template: '<div ng-click="toggleIt($event)" class="toggle"><input type="checkbox"><div class="track"><div class="handle"></div></div></div>',
      link: function ($scope, $element, $attr, ngModel) {
        var checkbox, handle;
        if (!ngModel) {
          return;
        }
        checkbox = $element.children().eq(0);
        handle = $element.children().eq(1);
        if (!checkbox.length || !handle.length) {
          return;
        }
        $scope.toggle = new ionic.views.Toggle({
          el: $element[0],
          checkbox: checkbox[0],
          handle: handle[0]
        });
        $scope.toggleIt = function (e) {
          $scope.toggle.tap(e);
          ngModel.$setViewValue(checkbox[0].checked);
        };
        ngModel.$render = function () {
          $scope.toggle.val(ngModel.$viewValue);
        };
      }
    };
  });
}(window.ionic));
;
(function () {
  'use strict';
  angular.module('ionic.ui.virtRepeat', []).directive('virtRepeat', function () {
    return {
      require: [
        '?ngModel',
        '^virtualList'
      ],
      transclude: 'element',
      priority: 1000,
      terminal: true,
      compile: function (element, attr, transclude) {
        return function ($scope, $element, $attr, ctrls) {
          var virtualList = ctrls[1];
          virtualList.listView.renderViewport = function (high, low, start, end) {
          };
        };
      }
    };
  });
}(ionic));
;
(function () {
  'use strict';
  function parseRepeatExpression(expression) {
    var match = expression.match(/^\s*([\$\w]+)\s+in\s+(\S*)\s*$/);
    if (!match) {
      throw new Error('Expected sfVirtualRepeat in form of \'_item_ in _collection_\' but got \'' + expression + '\'.');
    }
    return {
      value: match[1],
      collection: match[2]
    };
  }
  function isTagNameInList(element, list) {
    var t, tag = element.tagName.toUpperCase();
    for (t = 0; t < list.length; t++) {
      if (list[t] === tag) {
        return true;
      }
    }
    return false;
  }
  function findViewportAndContent(startElement) {
    var root = $rootElement[0];
    var e, n;
    for (e = startElement.parent().parent()[0]; e !== root; e = e.parentNode) {
      if (e.nodeType != 1)
        break;
      if (isTagNameInList(e, DONT_WORK_AS_VIEWPORTS))
        continue;
      if (e.childElementCount != 1)
        continue;
      if (isTagNameInList(e.firstElementChild, DONT_WORK_AS_CONTENT))
        continue;
      for (n = e.firstChild; n; n = n.nextSibling) {
        if (n.nodeType == 3 && /\S/g.test(n.textContent)) {
          break;
        }
      }
      if (n == null) {
        return {
          viewport: angular.element(e),
          content: angular.element(e.firstElementChild)
        };
      }
    }
    throw new Error('No suitable viewport element');
  }
  function setViewportCss(viewport) {
    var viewportCss = { 'overflow': 'auto' }, style = window.getComputedStyle ? window.getComputedStyle(viewport[0]) : viewport[0].currentStyle, maxHeight = style && style.getPropertyValue('max-height'), height = style && style.getPropertyValue('height');
    if (maxHeight && maxHeight !== '0px') {
      viewportCss.maxHeight = maxHeight;
    } else if (height && height !== '0px') {
      viewportCss.height = height;
    } else {
      viewportCss.height = window.innerHeight;
    }
    viewport.css(viewportCss);
  }
  function setContentCss(content) {
    var contentCss = {
        margin: 0,
        padding: 0,
        border: 0,
        'box-sizing': 'border-box'
      };
    content.css(contentCss);
  }
  function computeRowHeight(element) {
    var style = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle, maxHeight = style && style.getPropertyValue('max-height'), height = style && style.getPropertyValue('height');
    if (height && height !== '0px' && height !== 'auto') {
      $log.info('Row height is "%s" from css height', height);
    } else if (maxHeight && maxHeight !== '0px' && maxHeight !== 'none') {
      height = maxHeight;
      $log.info('Row height is "%s" from css max-height', height);
    } else if (element.clientHeight) {
      height = element.clientHeight + 'px';
      $log.info('Row height is "%s" from client height', height);
    } else {
      throw new Error('Unable to compute height of row');
    }
    angular.element(element).css('height', height);
    return parseInt(height, 10);
  }
  angular.module('ionic.ui.virtualRepeat', []).directive('virtualRepeat', [
    '$log',
    function ($log) {
      return {
        require: ['?ngModel, ^virtualList'],
        transclude: 'element',
        priority: 1000,
        terminal: true,
        compile: function (element, attr, transclude) {
          var ident = parseRepeatExpression(attr.sfVirtualRepeat);
          return function (scope, iterStartElement, attrs, ctrls, b) {
            var virtualList = ctrls[1];
            var rendered = [];
            var rowHeight = 0;
            var sticky = false;
            var dom = virtualList.element;
            var state = 'ngModel' in attrs ? scope.$eval(attrs.ngModel) : {};
            function makeNewScope(idx, collection, containerScope) {
              var childScope = containerScope.$new();
              childScope[ident.value] = collection[idx];
              childScope.$index = idx;
              childScope.$first = idx === 0;
              childScope.$last = idx === collection.length - 1;
              childScope.$middle = !(childScope.$first || childScope.$last);
              childScope.$watch(function updateChildScopeItem() {
                childScope[ident.value] = collection[idx];
              });
              return childScope;
            }
            function addElements(start, end, collection, containerScope, insPoint) {
              var frag = document.createDocumentFragment();
              var newElements = [], element, idx, childScope;
              for (idx = start; idx !== end; idx++) {
                childScope = makeNewScope(idx, collection, containerScope);
                element = linker(childScope, angular.noop);
                newElements.push(element);
                frag.appendChild(element[0]);
              }
              insPoint.after(frag);
              return newElements;
            }
            function recomputeActive() {
              var start = clip(state.firstActive, state.firstVisible - state.lowWater, state.firstVisible - state.highWater);
              var end = clip(state.firstActive + state.active, state.firstVisible + state.visible + state.lowWater, state.firstVisible + state.visible + state.highWater);
              state.firstActive = Math.max(0, start);
              state.active = Math.min(end, state.total) - state.firstActive;
            }
            function sfVirtualRepeatOnScroll(evt) {
              if (!rowHeight) {
                return;
              }
              scope.$apply(function () {
                state.firstVisible = Math.floor(evt.target.scrollTop / rowHeight);
                state.visible = Math.ceil(dom.viewport[0].clientHeight / rowHeight);
                $log.log('scroll to row %o', state.firstVisible);
                sticky = evt.target.scrollTop + evt.target.clientHeight >= evt.target.scrollHeight;
                recomputeActive();
                $log.log(' state is now %o', state);
                $log.log(' sticky = %o', sticky);
              });
            }
            function sfVirtualRepeatWatchExpression(scope) {
              var coll = scope.$eval(ident.collection);
              if (coll.length !== state.total) {
                state.total = coll.length;
                recomputeActive();
              }
              return {
                start: state.firstActive,
                active: state.active,
                len: coll.length
              };
            }
            function destroyActiveElements(action, count) {
              var dead, ii, remover = Array.prototype[action];
              for (ii = 0; ii < count; ii++) {
                dead = remover.call(rendered);
                dead.scope().$destroy();
                dead.remove();
              }
            }
            function sfVirtualRepeatListener(newValue, oldValue, scope) {
              var oldEnd = oldValue.start + oldValue.active, collection = scope.$eval(ident.collection), newElements;
              if (newValue === oldValue) {
                $log.info('initial listen');
                newElements = addElements(newValue.start, oldEnd, collection, scope, iterStartElement);
                rendered = newElements;
                if (rendered.length) {
                  rowHeight = computeRowHeight(newElements[0][0]);
                }
              } else {
                var newEnd = newValue.start + newValue.active;
                var forward = newValue.start >= oldValue.start;
                var delta = forward ? newValue.start - oldValue.start : oldValue.start - newValue.start;
                var endDelta = newEnd >= oldEnd ? newEnd - oldEnd : oldEnd - newEnd;
                var contiguous = delta < (forward ? oldValue.active : newValue.active);
                $log.info('change by %o,%o rows %s', delta, endDelta, forward ? 'forward' : 'backward');
                if (!contiguous) {
                  $log.info('non-contiguous change');
                  destroyActiveElements('pop', rendered.length);
                  rendered = addElements(newValue.start, newEnd, collection, scope, iterStartElement);
                } else {
                  if (forward) {
                    $log.info('need to remove from the top');
                    destroyActiveElements('shift', delta);
                  } else if (delta) {
                    $log.info('need to add at the top');
                    newElements = addElements(newValue.start, oldValue.start, collection, scope, iterStartElement);
                    rendered = newElements.concat(rendered);
                  }
                  if (newEnd < oldEnd) {
                    $log.info('need to remove from the bottom');
                    destroyActiveElements('pop', oldEnd - newEnd);
                  } else if (endDelta) {
                    var lastElement = rendered[rendered.length - 1];
                    $log.info('need to add to the bottom');
                    newElements = addElements(oldEnd, newEnd, collection, scope, lastElement);
                    rendered = rendered.concat(newElements);
                  }
                }
                if (!rowHeight && rendered.length) {
                  rowHeight = computeRowHeight(rendered[0][0]);
                }
                dom.content.css({ 'padding-top': newValue.start * rowHeight + 'px' });
              }
              dom.content.css({ 'height': newValue.len * rowHeight + 'px' });
              if (sticky) {
                dom.viewport[0].scrollTop = dom.viewport[0].clientHeight + dom.viewport[0].scrollHeight;
              }
            }
            state.firstActive = 0;
            state.firstVisible = 0;
            state.visible = 0;
            state.active = 0;
            state.total = 0;
            state.lowWater = state.lowWater || 100;
            state.highWater = state.highWater || 300;
            setContentCss(dom.content);
            setViewportCss(dom.viewport);
            dom.bind('momentumScrolled', sfVirtualRepeatOnScroll);
            scope.$on('$destroy', function () {
              dom.unbind('momentumScrolled', sfVirtualRepeatOnScroll);
            });
            scope.$watch(sfVirtualRepeatWatchExpression, sfVirtualRepeatListener, true);
          };
        }
      };
    }
  ]);
}(ionic));
(function (window, angular, undefined) {
  'use strict';
  var $resourceMinErr = angular.$$minErr('$resource');
  var MEMBER_NAME_REGEX = /^(\.[a-zA-Z_$][0-9a-zA-Z_$]*)+$/;
  function isValidDottedPath(path) {
    return path != null && path !== '' && path !== 'hasOwnProperty' && MEMBER_NAME_REGEX.test('.' + path);
  }
  function lookupDottedPath(obj, path) {
    if (!isValidDottedPath(path)) {
      throw $resourceMinErr('badmember', 'Dotted member path "@{0}" is invalid.', path);
    }
    var keys = path.split('.');
    for (var i = 0, ii = keys.length; i < ii && obj !== undefined; i++) {
      var key = keys[i];
      obj = obj !== null ? obj[key] : undefined;
    }
    return obj;
  }
  angular.module('ngResource', ['ng']).factory('$resource', [
    '$http',
    '$q',
    function ($http, $q) {
      var DEFAULT_ACTIONS = {
          'get': { method: 'GET' },
          'save': { method: 'POST' },
          'query': {
            method: 'GET',
            isArray: true
          },
          'remove': { method: 'DELETE' },
          'delete': { method: 'DELETE' }
        };
      var noop = angular.noop, forEach = angular.forEach, extend = angular.extend, copy = angular.copy, isFunction = angular.isFunction;
      function encodeUriSegment(val) {
        return encodeUriQuery(val, true).replace(/%26/gi, '&').replace(/%3D/gi, '=').replace(/%2B/gi, '+');
      }
      function encodeUriQuery(val, pctEncodeSpaces) {
        return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, pctEncodeSpaces ? '%20' : '+');
      }
      function Route(template, defaults) {
        this.template = template;
        this.defaults = defaults || {};
        this.urlParams = {};
      }
      Route.prototype = {
        setUrlParams: function (config, params, actionUrl) {
          var self = this, url = actionUrl || self.template, val, encodedVal;
          var urlParams = self.urlParams = {};
          forEach(url.split(/\W/), function (param) {
            if (param === 'hasOwnProperty') {
              throw $resourceMinErr('badname', 'hasOwnProperty is not a valid parameter name.');
            }
            if (!new RegExp('^\\d+$').test(param) && param && new RegExp('(^|[^\\\\]):' + param + '(\\W|$)').test(url)) {
              urlParams[param] = true;
            }
          });
          url = url.replace(/\\:/g, ':');
          params = params || {};
          forEach(self.urlParams, function (_, urlParam) {
            val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
            if (angular.isDefined(val) && val !== null) {
              encodedVal = encodeUriSegment(val);
              url = url.replace(new RegExp(':' + urlParam + '(\\W|$)', 'g'), encodedVal + '$1');
            } else {
              url = url.replace(new RegExp('(/?):' + urlParam + '(\\W|$)', 'g'), function (match, leadingSlashes, tail) {
                if (tail.charAt(0) == '/') {
                  return tail;
                } else {
                  return leadingSlashes + tail;
                }
              });
            }
          });
          url = url.replace(/\/+$/, '');
          url = url.replace(/\/\.(?=\w+($|\?))/, '.');
          config.url = url.replace(/\/\\\./, '/.');
          forEach(params, function (value, key) {
            if (!self.urlParams[key]) {
              config.params = config.params || {};
              config.params[key] = value;
            }
          });
        }
      };
      function resourceFactory(url, paramDefaults, actions) {
        var route = new Route(url);
        actions = extend({}, DEFAULT_ACTIONS, actions);
        function extractParams(data, actionParams) {
          var ids = {};
          actionParams = extend({}, paramDefaults, actionParams);
          forEach(actionParams, function (value, key) {
            if (isFunction(value)) {
              value = value();
            }
            ids[key] = value && value.charAt && value.charAt(0) == '@' ? lookupDottedPath(data, value.substr(1)) : value;
          });
          return ids;
        }
        function defaultResponseInterceptor(response) {
          return response.resource;
        }
        function Resource(value) {
          copy(value || {}, this);
        }
        forEach(actions, function (action, name) {
          var hasBody = /^(POST|PUT|PATCH)$/i.test(action.method);
          Resource[name] = function (a1, a2, a3, a4) {
            var params = {}, data, success, error;
            switch (arguments.length) {
            case 4:
              error = a4;
              success = a3;
            case 3:
            case 2:
              if (isFunction(a2)) {
                if (isFunction(a1)) {
                  success = a1;
                  error = a2;
                  break;
                }
                success = a2;
                error = a3;
              } else {
                params = a1;
                data = a2;
                success = a3;
                break;
              }
            case 1:
              if (isFunction(a1))
                success = a1;
              else if (hasBody)
                data = a1;
              else
                params = a1;
              break;
            case 0:
              break;
            default:
              throw $resourceMinErr('badargs', 'Expected up to 4 arguments [params, data, success, error], got {0} arguments', arguments.length);
            }
            var isInstanceCall = this instanceof Resource;
            var value = isInstanceCall ? data : action.isArray ? [] : new Resource(data);
            var httpConfig = {};
            var responseInterceptor = action.interceptor && action.interceptor.response || defaultResponseInterceptor;
            var responseErrorInterceptor = action.interceptor && action.interceptor.responseError || undefined;
            forEach(action, function (value, key) {
              if (key != 'params' && key != 'isArray' && key != 'interceptor') {
                httpConfig[key] = copy(value);
              }
            });
            if (hasBody)
              httpConfig.data = data;
            route.setUrlParams(httpConfig, extend({}, extractParams(data, action.params || {}), params), action.url);
            var promise = $http(httpConfig).then(function (response) {
                var data = response.data, promise = value.$promise;
                if (data) {
                  if (angular.isArray(data) !== !!action.isArray) {
                    throw $resourceMinErr('badcfg', 'Error in resource configuration. Expected ' + 'response to contain an {0} but got an {1}', action.isArray ? 'array' : 'object', angular.isArray(data) ? 'array' : 'object');
                  }
                  if (action.isArray) {
                    value.length = 0;
                    forEach(data, function (item) {
                      value.push(new Resource(item));
                    });
                  } else {
                    copy(data, value);
                    value.$promise = promise;
                  }
                }
                value.$resolved = true;
                response.resource = value;
                return response;
              }, function (response) {
                value.$resolved = true;
                (error || noop)(response);
                return $q.reject(response);
              });
            promise = promise.then(function (response) {
              var value = responseInterceptor(response);
              (success || noop)(value, response.headers);
              return value;
            }, responseErrorInterceptor);
            if (!isInstanceCall) {
              value.$promise = promise;
              value.$resolved = false;
              return value;
            }
            return promise;
          };
          Resource.prototype['$' + name] = function (params, success, error) {
            if (isFunction(params)) {
              error = success;
              success = params;
              params = {};
            }
            var result = Resource[name].call(this, params, this, success, error);
            return result.$promise || result;
          };
        });
        Resource.bind = function (additionalParamDefaults) {
          return resourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
        };
        return Resource;
      }
      return resourceFactory;
    }
  ]);
}(window, window.angular));
(function (window, angular, undefined) {
  'use strict';
  angular.module('ngCookies', ['ng']).factory('$cookies', [
    '$rootScope',
    '$browser',
    function ($rootScope, $browser) {
      var cookies = {}, lastCookies = {}, lastBrowserCookies, runEval = false, copy = angular.copy, isUndefined = angular.isUndefined;
      $browser.addPollFn(function () {
        var currentCookies = $browser.cookies();
        if (lastBrowserCookies != currentCookies) {
          lastBrowserCookies = currentCookies;
          copy(currentCookies, lastCookies);
          copy(currentCookies, cookies);
          if (runEval)
            $rootScope.$apply();
        }
      })();
      runEval = true;
      $rootScope.$watch(push);
      return cookies;
      function push() {
        var name, value, browserCookies, updated;
        for (name in lastCookies) {
          if (isUndefined(cookies[name])) {
            $browser.cookies(name, undefined);
          }
        }
        for (name in cookies) {
          value = cookies[name];
          if (!angular.isString(value)) {
            if (angular.isDefined(lastCookies[name])) {
              cookies[name] = lastCookies[name];
            } else {
              delete cookies[name];
            }
          } else if (value !== lastCookies[name]) {
            $browser.cookies(name, value);
            updated = true;
          }
        }
        if (updated) {
          updated = false;
          browserCookies = $browser.cookies();
          for (name in cookies) {
            if (cookies[name] !== browserCookies[name]) {
              if (isUndefined(browserCookies[name])) {
                delete cookies[name];
              } else {
                cookies[name] = browserCookies[name];
              }
              updated = true;
            }
          }
        }
      }
    }
  ]).factory('$cookieStore', [
    '$cookies',
    function ($cookies) {
      return {
        get: function (key) {
          var value = $cookies[key];
          return value ? angular.fromJson(value) : value;
        },
        put: function (key, value) {
          $cookies[key] = angular.toJson(value);
        },
        remove: function (key) {
          delete $cookies[key];
        }
      };
    }
  ]);
}(window, window.angular));
(function (window, angular, undefined) {
  'use strict';
  var ngRouteModule = angular.module('ngRoute', ['ng']).provider('$route', $RouteProvider);
  function $RouteProvider() {
    function inherit(parent, extra) {
      return angular.extend(new (angular.extend(function () {
      }, { prototype: parent }))(), extra);
    }
    var routes = {};
    this.when = function (path, route) {
      routes[path] = angular.extend({ reloadOnSearch: true }, route, path && pathRegExp(path, route));
      if (path) {
        var redirectPath = path[path.length - 1] == '/' ? path.substr(0, path.length - 1) : path + '/';
        routes[redirectPath] = angular.extend({ redirectTo: path }, pathRegExp(redirectPath, route));
      }
      return this;
    };
    function pathRegExp(path, opts) {
      var insensitive = opts.caseInsensitiveMatch, ret = {
          originalPath: path,
          regexp: path
        }, keys = ret.keys = [];
      path = path.replace(/([().])/g, '\\$1').replace(/(\/)?:(\w+)([\?|\*])?/g, function (_, slash, key, option) {
        var optional = option === '?' ? option : null;
        var star = option === '*' ? option : null;
        keys.push({
          name: key,
          optional: !!optional
        });
        slash = slash || '';
        return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (star && '(.+?)' || '([^/]+)') + (optional || '') + ')' + (optional || '');
      }).replace(/([\/$\*])/g, '\\$1');
      ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');
      return ret;
    }
    this.otherwise = function (params) {
      this.when(null, params);
      return this;
    };
    this.$get = [
      '$rootScope',
      '$location',
      '$routeParams',
      '$q',
      '$injector',
      '$http',
      '$templateCache',
      '$sce',
      function ($rootScope, $location, $routeParams, $q, $injector, $http, $templateCache, $sce) {
        var forceReload = false, $route = {
            routes: routes,
            reload: function () {
              forceReload = true;
              $rootScope.$evalAsync(updateRoute);
            }
          };
        $rootScope.$on('$locationChangeSuccess', updateRoute);
        return $route;
        function switchRouteMatcher(on, route) {
          var keys = route.keys, params = {};
          if (!route.regexp)
            return null;
          var m = route.regexp.exec(on);
          if (!m)
            return null;
          for (var i = 1, len = m.length; i < len; ++i) {
            var key = keys[i - 1];
            var val = 'string' == typeof m[i] ? decodeURIComponent(m[i]) : m[i];
            if (key && val) {
              params[key.name] = val;
            }
          }
          return params;
        }
        function updateRoute() {
          var next = parseRoute(), last = $route.current;
          if (next && last && next.$$route === last.$$route && angular.equals(next.pathParams, last.pathParams) && !next.reloadOnSearch && !forceReload) {
            last.params = next.params;
            angular.copy(last.params, $routeParams);
            $rootScope.$broadcast('$routeUpdate', last);
          } else if (next || last) {
            forceReload = false;
            $rootScope.$broadcast('$routeChangeStart', next, last);
            $route.current = next;
            if (next) {
              if (next.redirectTo) {
                if (angular.isString(next.redirectTo)) {
                  $location.path(interpolate(next.redirectTo, next.params)).search(next.params).replace();
                } else {
                  $location.url(next.redirectTo(next.pathParams, $location.path(), $location.search())).replace();
                }
              }
            }
            $q.when(next).then(function () {
              if (next) {
                var locals = angular.extend({}, next.resolve), template, templateUrl;
                angular.forEach(locals, function (value, key) {
                  locals[key] = angular.isString(value) ? $injector.get(value) : $injector.invoke(value);
                });
                if (angular.isDefined(template = next.template)) {
                  if (angular.isFunction(template)) {
                    template = template(next.params);
                  }
                } else if (angular.isDefined(templateUrl = next.templateUrl)) {
                  if (angular.isFunction(templateUrl)) {
                    templateUrl = templateUrl(next.params);
                  }
                  templateUrl = $sce.getTrustedResourceUrl(templateUrl);
                  if (angular.isDefined(templateUrl)) {
                    next.loadedTemplateUrl = templateUrl;
                    template = $http.get(templateUrl, { cache: $templateCache }).then(function (response) {
                      return response.data;
                    });
                  }
                }
                if (angular.isDefined(template)) {
                  locals['$template'] = template;
                }
                return $q.all(locals);
              }
            }).then(function (locals) {
              if (next == $route.current) {
                if (next) {
                  next.locals = locals;
                  angular.copy(next.params, $routeParams);
                }
                $rootScope.$broadcast('$routeChangeSuccess', next, last);
              }
            }, function (error) {
              if (next == $route.current) {
                $rootScope.$broadcast('$routeChangeError', next, last, error);
              }
            });
          }
        }
        function parseRoute() {
          var params, match;
          angular.forEach(routes, function (route, path) {
            if (!match && (params = switchRouteMatcher($location.path(), route))) {
              match = inherit(route, {
                params: angular.extend({}, $location.search(), params),
                pathParams: params
              });
              match.$$route = route;
            }
          });
          return match || routes[null] && inherit(routes[null], {
            params: {},
            pathParams: {}
          });
        }
        function interpolate(string, params) {
          var result = [];
          angular.forEach((string || '').split(':'), function (segment, i) {
            if (i === 0) {
              result.push(segment);
            } else {
              var segmentMatch = segment.match(/(\w+)(.*)/);
              var key = segmentMatch[1];
              result.push(params[key]);
              result.push(segmentMatch[2] || '');
              delete params[key];
            }
          });
          return result.join('');
        }
      }
    ];
  }
  ngRouteModule.provider('$routeParams', $RouteParamsProvider);
  function $RouteParamsProvider() {
    this.$get = function () {
      return {};
    };
  }
  ngRouteModule.directive('ngView', ngViewFactory);
  ngViewFactory.$inject = [
    '$route',
    '$anchorScroll',
    '$compile',
    '$controller',
    '$animate'
  ];
  function ngViewFactory($route, $anchorScroll, $compile, $controller, $animate) {
    return {
      restrict: 'ECA',
      terminal: true,
      priority: 400,
      transclude: 'element',
      link: function (scope, $element, attr, ctrl, $transclude) {
        var currentScope, currentElement, autoScrollExp = attr.autoscroll, onloadExp = attr.onload || '';
        scope.$on('$routeChangeSuccess', update);
        update();
        function cleanupLastView() {
          if (currentScope) {
            currentScope.$destroy();
            currentScope = null;
          }
          if (currentElement) {
            $animate.leave(currentElement);
            currentElement = null;
          }
        }
        function update() {
          var locals = $route.current && $route.current.locals, template = locals && locals.$template;
          if (template) {
            var newScope = scope.$new();
            var clone = $transclude(newScope, angular.noop);
            clone.html(template);
            $animate.enter(clone, null, currentElement || $element, function onNgViewEnter() {
              if (angular.isDefined(autoScrollExp) && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                $anchorScroll();
              }
            });
            cleanupLastView();
            var link = $compile(clone.contents()), current = $route.current;
            currentScope = current.scope = newScope;
            currentElement = clone;
            if (current.controller) {
              locals.$scope = currentScope;
              var controller = $controller(current.controller, locals);
              if (current.controllerAs) {
                currentScope[current.controllerAs] = controller;
              }
              clone.data('$ngControllerController', controller);
              clone.children().data('$ngControllerController', controller);
            }
            link(currentScope);
            currentScope.$emit('$viewContentLoaded');
            currentScope.$eval(onloadExp);
          } else {
            cleanupLastView();
          }
        }
      }
    };
  }
}(window, window.angular));
(function (window, angular, undefined) {
  'use strict';
  var ngTouch = angular.module('ngTouch', []);
  ngTouch.factory('$swipe', [function () {
      var MOVE_BUFFER_RADIUS = 10;
      function getCoordinates(event) {
        var touches = event.touches && event.touches.length ? event.touches : [event];
        var e = event.changedTouches && event.changedTouches[0] || event.originalEvent && event.originalEvent.changedTouches && event.originalEvent.changedTouches[0] || touches[0].originalEvent || touches[0];
        return {
          x: e.clientX,
          y: e.clientY
        };
      }
      return {
        bind: function (element, eventHandlers) {
          var totalX, totalY;
          var startCoords;
          var lastPos;
          var active = false;
          element.on('touchstart mousedown', function (event) {
            startCoords = getCoordinates(event);
            active = true;
            totalX = 0;
            totalY = 0;
            lastPos = startCoords;
            eventHandlers['start'] && eventHandlers['start'](startCoords, event);
          });
          element.on('touchcancel', function (event) {
            active = false;
            eventHandlers['cancel'] && eventHandlers['cancel'](event);
          });
          element.on('touchmove mousemove', function (event) {
            if (!active)
              return;
            if (!startCoords)
              return;
            var coords = getCoordinates(event);
            totalX += Math.abs(coords.x - lastPos.x);
            totalY += Math.abs(coords.y - lastPos.y);
            lastPos = coords;
            if (totalX < MOVE_BUFFER_RADIUS && totalY < MOVE_BUFFER_RADIUS) {
              return;
            }
            if (totalY > totalX) {
              active = false;
              eventHandlers['cancel'] && eventHandlers['cancel'](event);
              return;
            } else {
              event.preventDefault();
              eventHandlers['move'] && eventHandlers['move'](coords, event);
            }
          });
          element.on('touchend mouseup', function (event) {
            if (!active)
              return;
            active = false;
            eventHandlers['end'] && eventHandlers['end'](getCoordinates(event), event);
          });
        }
      };
    }]);
  ngTouch.config([
    '$provide',
    function ($provide) {
      $provide.decorator('ngClickDirective', [
        '$delegate',
        function ($delegate) {
          $delegate.shift();
          return $delegate;
        }
      ]);
    }
  ]);
  ngTouch.directive('ngClick', [
    '$parse',
    '$timeout',
    '$rootElement',
    function ($parse, $timeout, $rootElement) {
      var TAP_DURATION = 750;
      var MOVE_TOLERANCE = 12;
      var PREVENT_DURATION = 2500;
      var CLICKBUSTER_THRESHOLD = 25;
      var ACTIVE_CLASS_NAME = 'ng-click-active';
      var lastPreventedTime;
      var touchCoordinates;
      function hit(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) < CLICKBUSTER_THRESHOLD && Math.abs(y1 - y2) < CLICKBUSTER_THRESHOLD;
      }
      function checkAllowableRegions(touchCoordinates, x, y) {
        for (var i = 0; i < touchCoordinates.length; i += 2) {
          if (hit(touchCoordinates[i], touchCoordinates[i + 1], x, y)) {
            touchCoordinates.splice(i, i + 2);
            return true;
          }
        }
        return false;
      }
      function onClick(event) {
        if (Date.now() - lastPreventedTime > PREVENT_DURATION) {
          return;
        }
        var touches = event.touches && event.touches.length ? event.touches : [event];
        var x = touches[0].clientX;
        var y = touches[0].clientY;
        if (x < 1 && y < 1) {
          return;
        }
        if (checkAllowableRegions(touchCoordinates, x, y)) {
          return;
        }
        event.stopPropagation();
        event.preventDefault();
        event.target && event.target.blur();
      }
      function onTouchStart(event) {
        var touches = event.touches && event.touches.length ? event.touches : [event];
        var x = touches[0].clientX;
        var y = touches[0].clientY;
        touchCoordinates.push(x, y);
        $timeout(function () {
          for (var i = 0; i < touchCoordinates.length; i += 2) {
            if (touchCoordinates[i] == x && touchCoordinates[i + 1] == y) {
              touchCoordinates.splice(i, i + 2);
              return;
            }
          }
        }, PREVENT_DURATION, false);
      }
      function preventGhostClick(x, y) {
        if (!touchCoordinates) {
          $rootElement[0].addEventListener('click', onClick, true);
          $rootElement[0].addEventListener('touchstart', onTouchStart, true);
          touchCoordinates = [];
        }
        lastPreventedTime = Date.now();
        checkAllowableRegions(touchCoordinates, x, y);
      }
      return function (scope, element, attr) {
        var clickHandler = $parse(attr.ngClick), tapping = false, tapElement, startTime, touchStartX, touchStartY;
        function resetState() {
          tapping = false;
          element.removeClass(ACTIVE_CLASS_NAME);
        }
        element.on('touchstart', function (event) {
          tapping = true;
          tapElement = event.target ? event.target : event.srcElement;
          if (tapElement.nodeType == 3) {
            tapElement = tapElement.parentNode;
          }
          element.addClass(ACTIVE_CLASS_NAME);
          startTime = Date.now();
          var touches = event.touches && event.touches.length ? event.touches : [event];
          var e = touches[0].originalEvent || touches[0];
          touchStartX = e.clientX;
          touchStartY = e.clientY;
        });
        element.on('touchmove', function (event) {
          resetState();
        });
        element.on('touchcancel', function (event) {
          resetState();
        });
        element.on('touchend', function (event) {
          var diff = Date.now() - startTime;
          var touches = event.changedTouches && event.changedTouches.length ? event.changedTouches : event.touches && event.touches.length ? event.touches : [event];
          var e = touches[0].originalEvent || touches[0];
          var x = e.clientX;
          var y = e.clientY;
          var dist = Math.sqrt(Math.pow(x - touchStartX, 2) + Math.pow(y - touchStartY, 2));
          if (tapping && diff < TAP_DURATION && dist < MOVE_TOLERANCE) {
            preventGhostClick(x, y);
            if (tapElement) {
              tapElement.blur();
            }
            if (!angular.isDefined(attr.disabled) || attr.disabled === false) {
              element.triggerHandler('click', [event]);
            }
          }
          resetState();
        });
        element.onclick = function (event) {
        };
        element.on('click', function (event, touchend) {
          scope.$apply(function () {
            clickHandler(scope, { $event: touchend || event });
          });
        });
        element.on('mousedown', function (event) {
          element.addClass(ACTIVE_CLASS_NAME);
        });
        element.on('mousemove mouseup', function (event) {
          element.removeClass(ACTIVE_CLASS_NAME);
        });
      };
    }
  ]);
  function makeSwipeDirective(directiveName, direction, eventName) {
    ngTouch.directive(directiveName, [
      '$parse',
      '$swipe',
      function ($parse, $swipe) {
        var MAX_VERTICAL_DISTANCE = 75;
        var MAX_VERTICAL_RATIO = 0.3;
        var MIN_HORIZONTAL_DISTANCE = 30;
        return function (scope, element, attr) {
          var swipeHandler = $parse(attr[directiveName]);
          var startCoords, valid;
          function validSwipe(coords) {
            if (!startCoords)
              return false;
            var deltaY = Math.abs(coords.y - startCoords.y);
            var deltaX = (coords.x - startCoords.x) * direction;
            return valid && deltaY < MAX_VERTICAL_DISTANCE && deltaX > 0 && deltaX > MIN_HORIZONTAL_DISTANCE && deltaY / deltaX < MAX_VERTICAL_RATIO;
          }
          $swipe.bind(element, {
            'start': function (coords, event) {
              startCoords = coords;
              valid = true;
            },
            'cancel': function (event) {
              valid = false;
            },
            'end': function (coords, event) {
              if (validSwipe(coords)) {
                scope.$apply(function () {
                  element.triggerHandler(eventName);
                  swipeHandler(scope, { $event: event });
                });
              }
            }
          });
        };
      }
    ]);
  }
  makeSwipeDirective('ngSwipeLeft', -1, 'swipeleft');
  makeSwipeDirective('ngSwipeRight', 1, 'swiperight');
}(window, window.angular));
(function (window, angular, undefined) {
  'use strict';
  angular.module('ngAnimate', ['ng']).config([
    '$provide',
    '$animateProvider',
    function ($provide, $animateProvider) {
      var noop = angular.noop;
      var forEach = angular.forEach;
      var selectors = $animateProvider.$$selectors;
      var ELEMENT_NODE = 1;
      var NG_ANIMATE_STATE = '$$ngAnimateState';
      var NG_ANIMATE_CLASS_NAME = 'ng-animate';
      var rootAnimateState = { running: true };
      $provide.decorator('$animate', [
        '$delegate',
        '$injector',
        '$sniffer',
        '$rootElement',
        '$timeout',
        '$rootScope',
        '$document',
        function ($delegate, $injector, $sniffer, $rootElement, $timeout, $rootScope, $document) {
          $rootElement.data(NG_ANIMATE_STATE, rootAnimateState);
          $rootScope.$$postDigest(function () {
            $rootScope.$$postDigest(function () {
              rootAnimateState.running = false;
            });
          });
          function lookup(name) {
            if (name) {
              var matches = [], flagMap = {}, classes = name.substr(1).split('.');
              if ($sniffer.transitions || $sniffer.animations) {
                classes.push('');
              }
              for (var i = 0; i < classes.length; i++) {
                var klass = classes[i], selectorFactoryName = selectors[klass];
                if (selectorFactoryName && !flagMap[klass]) {
                  matches.push($injector.get(selectorFactoryName));
                  flagMap[klass] = true;
                }
              }
              return matches;
            }
          }
          return {
            enter: function (element, parentElement, afterElement, doneCallback) {
              this.enabled(false, element);
              $delegate.enter(element, parentElement, afterElement);
              $rootScope.$$postDigest(function () {
                performAnimation('enter', 'ng-enter', element, parentElement, afterElement, noop, doneCallback);
              });
            },
            leave: function (element, doneCallback) {
              cancelChildAnimations(element);
              this.enabled(false, element);
              $rootScope.$$postDigest(function () {
                performAnimation('leave', 'ng-leave', element, null, null, function () {
                  $delegate.leave(element);
                }, doneCallback);
              });
            },
            move: function (element, parentElement, afterElement, doneCallback) {
              cancelChildAnimations(element);
              this.enabled(false, element);
              $delegate.move(element, parentElement, afterElement);
              $rootScope.$$postDigest(function () {
                performAnimation('move', 'ng-move', element, parentElement, afterElement, noop, doneCallback);
              });
            },
            addClass: function (element, className, doneCallback) {
              performAnimation('addClass', className, element, null, null, function () {
                $delegate.addClass(element, className);
              }, doneCallback);
            },
            removeClass: function (element, className, doneCallback) {
              performAnimation('removeClass', className, element, null, null, function () {
                $delegate.removeClass(element, className);
              }, doneCallback);
            },
            enabled: function (value, element) {
              switch (arguments.length) {
              case 2:
                if (value) {
                  cleanup(element);
                } else {
                  var data = element.data(NG_ANIMATE_STATE) || {};
                  data.disabled = true;
                  element.data(NG_ANIMATE_STATE, data);
                }
                break;
              case 1:
                rootAnimateState.disabled = !value;
                break;
              default:
                value = !rootAnimateState.disabled;
                break;
              }
              return !!value;
            }
          };
          function performAnimation(animationEvent, className, element, parentElement, afterElement, domOperation, doneCallback) {
            var currentClassName = element.attr('class') || '';
            var classes = currentClassName + ' ' + className;
            var animationLookup = (' ' + classes).replace(/\s+/g, '.');
            if (!parentElement) {
              parentElement = afterElement ? afterElement.parent() : element.parent();
            }
            var matches = lookup(animationLookup);
            var isClassBased = animationEvent == 'addClass' || animationEvent == 'removeClass';
            var ngAnimateState = element.data(NG_ANIMATE_STATE) || {};
            if (animationsDisabled(element, parentElement) || matches.length === 0) {
              fireDOMOperation();
              closeAnimation();
              return;
            }
            var animations = [];
            if (!ngAnimateState.running || !(isClassBased && ngAnimateState.structural)) {
              forEach(matches, function (animation) {
                if (!animation.allowCancel || animation.allowCancel(element, animationEvent, className)) {
                  var beforeFn, afterFn = animation[animationEvent];
                  if (animationEvent == 'leave') {
                    beforeFn = afterFn;
                    afterFn = null;
                  } else {
                    beforeFn = animation['before' + animationEvent.charAt(0).toUpperCase() + animationEvent.substr(1)];
                  }
                  animations.push({
                    before: beforeFn,
                    after: afterFn
                  });
                }
              });
            }
            if (animations.length === 0) {
              fireDOMOperation();
              fireDoneCallbackAsync();
              return;
            }
            var futureClassName = ' ' + currentClassName + ' ';
            if (ngAnimateState.running) {
              $timeout.cancel(ngAnimateState.closeAnimationTimeout);
              cleanup(element);
              cancelAnimations(ngAnimateState.animations);
              if (ngAnimateState.beforeComplete) {
                (ngAnimateState.done || noop)(true);
              } else if (isClassBased && !ngAnimateState.structural) {
                futureClassName = ngAnimateState.event == 'removeClass' ? futureClassName.replace(ngAnimateState.className, '') : futureClassName + ngAnimateState.className + ' ';
              }
            }
            var classNameToken = ' ' + className + ' ';
            if (animationEvent == 'addClass' && futureClassName.indexOf(classNameToken) >= 0 || animationEvent == 'removeClass' && futureClassName.indexOf(classNameToken) == -1) {
              fireDOMOperation();
              fireDoneCallbackAsync();
              return;
            }
            element.addClass(NG_ANIMATE_CLASS_NAME);
            element.data(NG_ANIMATE_STATE, {
              running: true,
              event: animationEvent,
              className: className,
              structural: !isClassBased,
              animations: animations,
              done: onBeforeAnimationsComplete
            });
            invokeRegisteredAnimationFns(animations, 'before', onBeforeAnimationsComplete);
            function onBeforeAnimationsComplete(cancelled) {
              fireDOMOperation();
              if (cancelled === true) {
                closeAnimation();
                return;
              }
              var data = element.data(NG_ANIMATE_STATE);
              if (data) {
                data.done = closeAnimation;
                element.data(NG_ANIMATE_STATE, data);
              }
              invokeRegisteredAnimationFns(animations, 'after', closeAnimation);
            }
            function invokeRegisteredAnimationFns(animations, phase, allAnimationFnsComplete) {
              var endFnName = phase + 'End';
              forEach(animations, function (animation, index) {
                var animationPhaseCompleted = function () {
                  progress(index, phase);
                };
                if (phase == 'before' && (animationEvent == 'enter' || animationEvent == 'move')) {
                  animationPhaseCompleted();
                  return;
                }
                if (animation[phase]) {
                  animation[endFnName] = isClassBased ? animation[phase](element, className, animationPhaseCompleted) : animation[phase](element, animationPhaseCompleted);
                } else {
                  animationPhaseCompleted();
                }
              });
              function progress(index, phase) {
                var phaseCompletionFlag = phase + 'Complete';
                var currentAnimation = animations[index];
                currentAnimation[phaseCompletionFlag] = true;
                (currentAnimation[endFnName] || noop)();
                for (var i = 0; i < animations.length; i++) {
                  if (!animations[i][phaseCompletionFlag])
                    return;
                }
                allAnimationFnsComplete();
              }
            }
            function fireDoneCallbackAsync() {
              doneCallback && $timeout(doneCallback, 0, false);
            }
            function fireDOMOperation() {
              if (!fireDOMOperation.hasBeenRun) {
                fireDOMOperation.hasBeenRun = true;
                domOperation();
              }
            }
            function closeAnimation() {
              if (!closeAnimation.hasBeenRun) {
                closeAnimation.hasBeenRun = true;
                var data = element.data(NG_ANIMATE_STATE);
                if (data) {
                  if (isClassBased) {
                    cleanup(element);
                  } else {
                    data.closeAnimationTimeout = $timeout(function () {
                      cleanup(element);
                    }, 0, false);
                    element.data(NG_ANIMATE_STATE, data);
                  }
                }
                fireDoneCallbackAsync();
              }
            }
          }
          function cancelChildAnimations(element) {
            var node = element[0];
            if (node.nodeType != ELEMENT_NODE) {
              return;
            }
            forEach(node.querySelectorAll('.' + NG_ANIMATE_CLASS_NAME), function (element) {
              element = angular.element(element);
              var data = element.data(NG_ANIMATE_STATE);
              if (data) {
                cancelAnimations(data.animations);
                cleanup(element);
              }
            });
          }
          function cancelAnimations(animations) {
            var isCancelledFlag = true;
            forEach(animations, function (animation) {
              if (!animations.beforeComplete) {
                (animation.beforeEnd || noop)(isCancelledFlag);
              }
              if (!animations.afterComplete) {
                (animation.afterEnd || noop)(isCancelledFlag);
              }
            });
          }
          function cleanup(element) {
            if (element[0] == $rootElement[0]) {
              if (!rootAnimateState.disabled) {
                rootAnimateState.running = false;
                rootAnimateState.structural = false;
              }
            } else {
              element.removeClass(NG_ANIMATE_CLASS_NAME);
              element.removeData(NG_ANIMATE_STATE);
            }
          }
          function animationsDisabled(element, parentElement) {
            if (rootAnimateState.disabled)
              return true;
            if (element[0] == $rootElement[0]) {
              return rootAnimateState.disabled || rootAnimateState.running;
            }
            do {
              if (parentElement.length === 0)
                break;
              var isRoot = parentElement[0] == $rootElement[0];
              var state = isRoot ? rootAnimateState : parentElement.data(NG_ANIMATE_STATE);
              var result = state && (!!state.disabled || !!state.running);
              if (isRoot || result) {
                return result;
              }
              if (isRoot)
                return true;
            } while (parentElement = parentElement.parent());
            return true;
          }
        }
      ]);
      $animateProvider.register('', [
        '$window',
        '$sniffer',
        '$timeout',
        function ($window, $sniffer, $timeout) {
          var CSS_PREFIX = '', TRANSITION_PROP, TRANSITIONEND_EVENT, ANIMATION_PROP, ANIMATIONEND_EVENT;
          if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
            CSS_PREFIX = '-webkit-';
            TRANSITION_PROP = 'WebkitTransition';
            TRANSITIONEND_EVENT = 'webkitTransitionEnd transitionend';
          } else {
            TRANSITION_PROP = 'transition';
            TRANSITIONEND_EVENT = 'transitionend';
          }
          if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
            CSS_PREFIX = '-webkit-';
            ANIMATION_PROP = 'WebkitAnimation';
            ANIMATIONEND_EVENT = 'webkitAnimationEnd animationend';
          } else {
            ANIMATION_PROP = 'animation';
            ANIMATIONEND_EVENT = 'animationend';
          }
          var DURATION_KEY = 'Duration';
          var PROPERTY_KEY = 'Property';
          var DELAY_KEY = 'Delay';
          var ANIMATION_ITERATION_COUNT_KEY = 'IterationCount';
          var NG_ANIMATE_PARENT_KEY = '$$ngAnimateKey';
          var NG_ANIMATE_CSS_DATA_KEY = '$$ngAnimateCSS3Data';
          var NG_ANIMATE_FALLBACK_CLASS_NAME = 'ng-animate-start';
          var NG_ANIMATE_FALLBACK_ACTIVE_CLASS_NAME = 'ng-animate-active';
          var lookupCache = {};
          var parentCounter = 0;
          var animationReflowQueue = [], animationTimer, timeOut = false;
          function afterReflow(callback) {
            animationReflowQueue.push(callback);
            $timeout.cancel(animationTimer);
            animationTimer = $timeout(function () {
              forEach(animationReflowQueue, function (fn) {
                fn();
              });
              animationReflowQueue = [];
              animationTimer = null;
              lookupCache = {};
            }, 10, false);
          }
          function getElementAnimationDetails(element, cacheKey) {
            var data = cacheKey ? lookupCache[cacheKey] : null;
            if (!data) {
              var transitionDuration = 0;
              var transitionDelay = 0;
              var animationDuration = 0;
              var animationDelay = 0;
              var transitionDelayStyle;
              var animationDelayStyle;
              var transitionDurationStyle;
              var transitionPropertyStyle;
              forEach(element, function (element) {
                if (element.nodeType == ELEMENT_NODE) {
                  var elementStyles = $window.getComputedStyle(element) || {};
                  transitionDurationStyle = elementStyles[TRANSITION_PROP + DURATION_KEY];
                  transitionDuration = Math.max(parseMaxTime(transitionDurationStyle), transitionDuration);
                  transitionPropertyStyle = elementStyles[TRANSITION_PROP + PROPERTY_KEY];
                  transitionDelayStyle = elementStyles[TRANSITION_PROP + DELAY_KEY];
                  transitionDelay = Math.max(parseMaxTime(transitionDelayStyle), transitionDelay);
                  animationDelayStyle = elementStyles[ANIMATION_PROP + DELAY_KEY];
                  animationDelay = Math.max(parseMaxTime(animationDelayStyle), animationDelay);
                  var aDuration = parseMaxTime(elementStyles[ANIMATION_PROP + DURATION_KEY]);
                  if (aDuration > 0) {
                    aDuration *= parseInt(elementStyles[ANIMATION_PROP + ANIMATION_ITERATION_COUNT_KEY], 10) || 1;
                  }
                  animationDuration = Math.max(aDuration, animationDuration);
                }
              });
              data = {
                total: 0,
                transitionPropertyStyle: transitionPropertyStyle,
                transitionDurationStyle: transitionDurationStyle,
                transitionDelayStyle: transitionDelayStyle,
                transitionDelay: transitionDelay,
                transitionDuration: transitionDuration,
                animationDelayStyle: animationDelayStyle,
                animationDelay: animationDelay,
                animationDuration: animationDuration
              };
              if (cacheKey) {
                lookupCache[cacheKey] = data;
              }
            }
            return data;
          }
          function parseMaxTime(str) {
            var maxValue = 0;
            var values = angular.isString(str) ? str.split(/\s*,\s*/) : [];
            forEach(values, function (value) {
              maxValue = Math.max(parseFloat(value) || 0, maxValue);
            });
            return maxValue;
          }
          function getCacheKey(element) {
            var parentElement = element.parent();
            var parentID = parentElement.data(NG_ANIMATE_PARENT_KEY);
            if (!parentID) {
              parentElement.data(NG_ANIMATE_PARENT_KEY, ++parentCounter);
              parentID = parentCounter;
            }
            return parentID + '-' + element[0].className;
          }
          function animateSetup(element, className) {
            var cacheKey = getCacheKey(element);
            var eventCacheKey = cacheKey + ' ' + className;
            var stagger = {};
            var ii = lookupCache[eventCacheKey] ? ++lookupCache[eventCacheKey].total : 0;
            if (ii > 0) {
              var staggerClassName = className + '-stagger';
              var staggerCacheKey = cacheKey + ' ' + staggerClassName;
              var applyClasses = !lookupCache[staggerCacheKey];
              applyClasses && element.addClass(staggerClassName);
              stagger = getElementAnimationDetails(element, staggerCacheKey);
              applyClasses && element.removeClass(staggerClassName);
            }
            element.addClass(className);
            var timings = getElementAnimationDetails(element, eventCacheKey);
            var maxDuration = Math.max(timings.transitionDuration, timings.animationDuration);
            if (maxDuration === 0) {
              element.removeClass(className);
              return false;
            }
            var node = element[0];
            var activeClassName = '';
            if (timings.transitionDuration > 0) {
              element.addClass(NG_ANIMATE_FALLBACK_CLASS_NAME);
              activeClassName += NG_ANIMATE_FALLBACK_ACTIVE_CLASS_NAME + ' ';
              blockTransitions(element);
            } else {
              blockKeyframeAnimations(element);
            }
            forEach(className.split(' '), function (klass, i) {
              activeClassName += (i > 0 ? ' ' : '') + klass + '-active';
            });
            element.data(NG_ANIMATE_CSS_DATA_KEY, {
              className: className,
              activeClassName: activeClassName,
              maxDuration: maxDuration,
              classes: className + ' ' + activeClassName,
              timings: timings,
              stagger: stagger,
              ii: ii
            });
            return true;
          }
          function blockTransitions(element) {
            element[0].style[TRANSITION_PROP + PROPERTY_KEY] = 'none';
          }
          function blockKeyframeAnimations(element) {
            element[0].style[ANIMATION_PROP] = 'none 0s';
          }
          function unblockTransitions(element) {
            var node = element[0], prop = TRANSITION_PROP + PROPERTY_KEY;
            if (node.style[prop] && node.style[prop].length > 0) {
              node.style[prop] = '';
            }
          }
          function unblockKeyframeAnimations(element) {
            var node = element[0], prop = ANIMATION_PROP;
            if (node.style[prop] && node.style[prop].length > 0) {
              element[0].style[prop] = '';
            }
          }
          function animateRun(element, className, activeAnimationComplete) {
            var data = element.data(NG_ANIMATE_CSS_DATA_KEY);
            if (!element.hasClass(className) || !data) {
              activeAnimationComplete();
              return;
            }
            var node = element[0];
            var timings = data.timings;
            var stagger = data.stagger;
            var maxDuration = data.maxDuration;
            var activeClassName = data.activeClassName;
            var maxDelayTime = Math.max(timings.transitionDelay, timings.animationDelay) * 1000;
            var startTime = Date.now();
            var css3AnimationEvents = ANIMATIONEND_EVENT + ' ' + TRANSITIONEND_EVENT;
            var ii = data.ii;
            var applyFallbackStyle, style = '', appliedStyles = [];
            if (timings.transitionDuration > 0) {
              var propertyStyle = timings.transitionPropertyStyle;
              if (propertyStyle.indexOf('all') == -1) {
                applyFallbackStyle = true;
                var fallbackProperty = $sniffer.msie ? '-ms-zoom' : 'border-spacing';
                style += CSS_PREFIX + 'transition-property: ' + propertyStyle + ', ' + fallbackProperty + '; ';
                style += CSS_PREFIX + 'transition-duration: ' + timings.transitionDurationStyle + ', ' + timings.transitionDuration + 's; ';
                appliedStyles.push(CSS_PREFIX + 'transition-property');
                appliedStyles.push(CSS_PREFIX + 'transition-duration');
              }
            }
            if (ii > 0) {
              if (stagger.transitionDelay > 0 && stagger.transitionDuration === 0) {
                var delayStyle = timings.transitionDelayStyle;
                if (applyFallbackStyle) {
                  delayStyle += ', ' + timings.transitionDelay + 's';
                }
                style += CSS_PREFIX + 'transition-delay: ' + prepareStaggerDelay(delayStyle, stagger.transitionDelay, ii) + '; ';
                appliedStyles.push(CSS_PREFIX + 'transition-delay');
              }
              if (stagger.animationDelay > 0 && stagger.animationDuration === 0) {
                style += CSS_PREFIX + 'animation-delay: ' + prepareStaggerDelay(timings.animationDelayStyle, stagger.animationDelay, ii) + '; ';
                appliedStyles.push(CSS_PREFIX + 'animation-delay');
              }
            }
            if (appliedStyles.length > 0) {
              var oldStyle = node.getAttribute('style') || '';
              node.setAttribute('style', oldStyle + ' ' + style);
            }
            element.on(css3AnimationEvents, onAnimationProgress);
            element.addClass(activeClassName);
            return function onEnd(cancelled) {
              element.off(css3AnimationEvents, onAnimationProgress);
              element.removeClass(activeClassName);
              animateClose(element, className);
              for (var i in appliedStyles) {
                node.style.removeProperty(appliedStyles[i]);
              }
            };
            function onAnimationProgress(event) {
              event.stopPropagation();
              var ev = event.originalEvent || event;
              var timeStamp = ev.$manualTimeStamp || ev.timeStamp || Date.now();
              if (Math.max(timeStamp - startTime, 0) >= maxDelayTime && ev.elapsedTime >= maxDuration) {
                activeAnimationComplete();
              }
            }
          }
          function prepareStaggerDelay(delayStyle, staggerDelay, index) {
            var style = '';
            forEach(delayStyle.split(','), function (val, i) {
              style += (i > 0 ? ',' : '') + (index * staggerDelay + parseInt(val, 10)) + 's';
            });
            return style;
          }
          function animateBefore(element, className) {
            if (animateSetup(element, className)) {
              return function (cancelled) {
                cancelled && animateClose(element, className);
              };
            }
          }
          function animateAfter(element, className, afterAnimationComplete) {
            if (element.data(NG_ANIMATE_CSS_DATA_KEY)) {
              return animateRun(element, className, afterAnimationComplete);
            } else {
              animateClose(element, className);
              afterAnimationComplete();
            }
          }
          function animate(element, className, animationComplete) {
            var preReflowCancellation = animateBefore(element, className);
            if (!preReflowCancellation) {
              animationComplete();
              return;
            }
            var cancel = preReflowCancellation;
            afterReflow(function () {
              unblockTransitions(element);
              unblockKeyframeAnimations(element);
              cancel = animateAfter(element, className, animationComplete);
            });
            return function (cancelled) {
              (cancel || noop)(cancelled);
            };
          }
          function animateClose(element, className) {
            element.removeClass(className);
            element.removeClass(NG_ANIMATE_FALLBACK_CLASS_NAME);
            element.removeData(NG_ANIMATE_CSS_DATA_KEY);
          }
          return {
            allowCancel: function (element, animationEvent, className) {
              var oldClasses = (element.data(NG_ANIMATE_CSS_DATA_KEY) || {}).classes;
              if (!oldClasses || [
                  'enter',
                  'leave',
                  'move'
                ].indexOf(animationEvent) >= 0) {
                return true;
              }
              var parentElement = element.parent();
              var clone = angular.element(element[0].cloneNode());
              clone.attr('style', 'position:absolute; top:-9999px; left:-9999px');
              clone.removeAttr('id');
              clone.html('');
              forEach(oldClasses.split(' '), function (klass) {
                clone.removeClass(klass);
              });
              var suffix = animationEvent == 'addClass' ? '-add' : '-remove';
              clone.addClass(suffixClasses(className, suffix));
              parentElement.append(clone);
              var timings = getElementAnimationDetails(clone);
              clone.remove();
              return Math.max(timings.transitionDuration, timings.animationDuration) > 0;
            },
            enter: function (element, animationCompleted) {
              return animate(element, 'ng-enter', animationCompleted);
            },
            leave: function (element, animationCompleted) {
              return animate(element, 'ng-leave', animationCompleted);
            },
            move: function (element, animationCompleted) {
              return animate(element, 'ng-move', animationCompleted);
            },
            beforeAddClass: function (element, className, animationCompleted) {
              var cancellationMethod = animateBefore(element, suffixClasses(className, '-add'));
              if (cancellationMethod) {
                afterReflow(function () {
                  unblockTransitions(element);
                  unblockKeyframeAnimations(element);
                  animationCompleted();
                });
                return cancellationMethod;
              }
              animationCompleted();
            },
            addClass: function (element, className, animationCompleted) {
              return animateAfter(element, suffixClasses(className, '-add'), animationCompleted);
            },
            beforeRemoveClass: function (element, className, animationCompleted) {
              var cancellationMethod = animateBefore(element, suffixClasses(className, '-remove'));
              if (cancellationMethod) {
                afterReflow(function () {
                  unblockTransitions(element);
                  unblockKeyframeAnimations(element);
                  animationCompleted();
                });
                return cancellationMethod;
              }
              animationCompleted();
            },
            removeClass: function (element, className, animationCompleted) {
              return animateAfter(element, suffixClasses(className, '-remove'), animationCompleted);
            }
          };
          function suffixClasses(classes, suffix) {
            var className = '';
            classes = angular.isArray(classes) ? classes : classes.split(/\s+/);
            forEach(classes, function (klass, i) {
              if (klass && klass.length > 0) {
                className += (i > 0 ? ' ' : '') + klass + suffix;
              }
            });
            return className;
          }
        }
      ]);
    }
  ]);
}(window, window.angular));
(function (window, angular, undefined) {
  'use strict';
  var $sanitizeMinErr = angular.$$minErr('$sanitize');
  function $SanitizeProvider() {
    this.$get = [
      '$$sanitizeUri',
      function ($$sanitizeUri) {
        return function (html) {
          var buf = [];
          htmlParser(html, htmlSanitizeWriter(buf, function (uri, isImage) {
            return !/^unsafe/.test($$sanitizeUri(uri, isImage));
          }));
          return buf.join('');
        };
      }
    ];
  }
  function sanitizeText(chars) {
    var buf = [];
    var writer = htmlSanitizeWriter(buf, angular.noop);
    writer.chars(chars);
    return buf.join('');
  }
  var START_TAG_REGEXP = /^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/, END_TAG_REGEXP = /^<\s*\/\s*([\w:-]+)[^>]*>/, ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g, BEGIN_TAG_REGEXP = /^</, BEGING_END_TAGE_REGEXP = /^<\s*\//, COMMENT_REGEXP = /<!--(.*?)-->/g, DOCTYPE_REGEXP = /<!DOCTYPE([^>]*?)>/i, CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g, NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g;
  var voidElements = makeMap('area,br,col,hr,img,wbr');
  var optionalEndTagBlockElements = makeMap('colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr'), optionalEndTagInlineElements = makeMap('rp,rt'), optionalEndTagElements = angular.extend({}, optionalEndTagInlineElements, optionalEndTagBlockElements);
  var blockElements = angular.extend({}, optionalEndTagBlockElements, makeMap('address,article,' + 'aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,' + 'h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul'));
  var inlineElements = angular.extend({}, optionalEndTagInlineElements, makeMap('a,abbr,acronym,b,' + 'bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,' + 'samp,small,span,strike,strong,sub,sup,time,tt,u,var'));
  var specialElements = makeMap('script,style');
  var validElements = angular.extend({}, voidElements, blockElements, inlineElements, optionalEndTagElements);
  var uriAttrs = makeMap('background,cite,href,longdesc,src,usemap');
  var validAttrs = angular.extend({}, uriAttrs, makeMap('abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,' + 'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,' + 'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,' + 'scope,scrolling,shape,span,start,summary,target,title,type,' + 'valign,value,vspace,width'));
  function makeMap(str) {
    var obj = {}, items = str.split(','), i;
    for (i = 0; i < items.length; i++)
      obj[items[i]] = true;
    return obj;
  }
  function htmlParser(html, handler) {
    var index, chars, match, stack = [], last = html;
    stack.last = function () {
      return stack[stack.length - 1];
    };
    while (html) {
      chars = true;
      if (!stack.last() || !specialElements[stack.last()]) {
        if (html.indexOf('<!--') === 0) {
          index = html.indexOf('--', 4);
          if (index >= 0 && html.lastIndexOf('-->', index) === index) {
            if (handler.comment)
              handler.comment(html.substring(4, index));
            html = html.substring(index + 3);
            chars = false;
          }
        } else if (DOCTYPE_REGEXP.test(html)) {
          match = html.match(DOCTYPE_REGEXP);
          if (match) {
            html = html.replace(match[0], '');
            chars = false;
          }
        } else if (BEGING_END_TAGE_REGEXP.test(html)) {
          match = html.match(END_TAG_REGEXP);
          if (match) {
            html = html.substring(match[0].length);
            match[0].replace(END_TAG_REGEXP, parseEndTag);
            chars = false;
          }
        } else if (BEGIN_TAG_REGEXP.test(html)) {
          match = html.match(START_TAG_REGEXP);
          if (match) {
            html = html.substring(match[0].length);
            match[0].replace(START_TAG_REGEXP, parseStartTag);
            chars = false;
          }
        }
        if (chars) {
          index = html.indexOf('<');
          var text = index < 0 ? html : html.substring(0, index);
          html = index < 0 ? '' : html.substring(index);
          if (handler.chars)
            handler.chars(decodeEntities(text));
        }
      } else {
        html = html.replace(new RegExp('(.*)<\\s*\\/\\s*' + stack.last() + '[^>]*>', 'i'), function (all, text) {
          text = text.replace(COMMENT_REGEXP, '$1').replace(CDATA_REGEXP, '$1');
          if (handler.chars)
            handler.chars(decodeEntities(text));
          return '';
        });
        parseEndTag('', stack.last());
      }
      if (html == last) {
        throw $sanitizeMinErr('badparse', 'The sanitizer was unable to parse the following block ' + 'of html: {0}', html);
      }
      last = html;
    }
    parseEndTag();
    function parseStartTag(tag, tagName, rest, unary) {
      tagName = angular.lowercase(tagName);
      if (blockElements[tagName]) {
        while (stack.last() && inlineElements[stack.last()]) {
          parseEndTag('', stack.last());
        }
      }
      if (optionalEndTagElements[tagName] && stack.last() == tagName) {
        parseEndTag('', tagName);
      }
      unary = voidElements[tagName] || !!unary;
      if (!unary)
        stack.push(tagName);
      var attrs = {};
      rest.replace(ATTR_REGEXP, function (match, name, doubleQuotedValue, singleQuotedValue, unquotedValue) {
        var value = doubleQuotedValue || singleQuotedValue || unquotedValue || '';
        attrs[name] = decodeEntities(value);
      });
      if (handler.start)
        handler.start(tagName, attrs, unary);
    }
    function parseEndTag(tag, tagName) {
      var pos = 0, i;
      tagName = angular.lowercase(tagName);
      if (tagName)
        for (pos = stack.length - 1; pos >= 0; pos--)
          if (stack[pos] == tagName)
            break;
      if (pos >= 0) {
        for (i = stack.length - 1; i >= pos; i--)
          if (handler.end)
            handler.end(stack[i]);
        stack.length = pos;
      }
    }
  }
  var hiddenPre = document.createElement('pre');
  function decodeEntities(value) {
    if (!value) {
      return '';
    }
    var spaceRe = /^(\s*)([\s\S]*?)(\s*)$/;
    var parts = spaceRe.exec(value);
    parts[0] = '';
    if (parts[2]) {
      hiddenPre.innerHTML = parts[2].replace(/</g, '&lt;');
      parts[2] = hiddenPre.innerText || hiddenPre.textContent;
    }
    return parts.join('');
  }
  function encodeEntities(value) {
    return value.replace(/&/g, '&amp;').replace(NON_ALPHANUMERIC_REGEXP, function (value) {
      return '&#' + value.charCodeAt(0) + ';';
    }).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function htmlSanitizeWriter(buf, uriValidator) {
    var ignore = false;
    var out = angular.bind(buf, buf.push);
    return {
      start: function (tag, attrs, unary) {
        tag = angular.lowercase(tag);
        if (!ignore && specialElements[tag]) {
          ignore = tag;
        }
        if (!ignore && validElements[tag] === true) {
          out('<');
          out(tag);
          angular.forEach(attrs, function (value, key) {
            var lkey = angular.lowercase(key);
            var isImage = tag === 'img' && lkey === 'src' || lkey === 'background';
            if (validAttrs[lkey] === true && (uriAttrs[lkey] !== true || uriValidator(value, isImage))) {
              out(' ');
              out(key);
              out('="');
              out(encodeEntities(value));
              out('"');
            }
          });
          out(unary ? '/>' : '>');
        }
      },
      end: function (tag) {
        tag = angular.lowercase(tag);
        if (!ignore && validElements[tag] === true) {
          out('</');
          out(tag);
          out('>');
        }
        if (tag == ignore) {
          ignore = false;
        }
      },
      chars: function (chars) {
        if (!ignore) {
          out(encodeEntities(chars));
        }
      }
    };
  }
  angular.module('ngSanitize', []).provider('$sanitize', $SanitizeProvider);
  angular.module('ngSanitize').filter('linky', [
    '$sanitize',
    function ($sanitize) {
      var LINKY_URL_REGEXP = /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>]/, MAILTO_REGEXP = /^mailto:/;
      return function (text, target) {
        if (!text)
          return text;
        var match;
        var raw = text;
        var html = [];
        var url;
        var i;
        while (match = raw.match(LINKY_URL_REGEXP)) {
          url = match[0];
          if (match[2] == match[3])
            url = 'mailto:' + url;
          i = match.index;
          addText(raw.substr(0, i));
          addLink(url, match[0].replace(MAILTO_REGEXP, ''));
          raw = raw.substring(i + match[0].length);
        }
        addText(raw);
        return $sanitize(html.join(''));
        function addText(text) {
          if (!text) {
            return;
          }
          html.push(sanitizeText(text));
        }
        function addLink(url, text) {
          html.push('<a ');
          if (angular.isDefined(target)) {
            html.push('target="');
            html.push(target);
            html.push('" ');
          }
          html.push('href="');
          html.push(url);
          html.push('">');
          addText(text);
          html.push('</a>');
        }
      };
    }
  ]);
}(window, window.angular));