/**
 * @license Algoviz v0.1.0
 * License: MIT
 */
 var algoviz = angular.module('algoviz', []);

algoviz.controller('AlgovizController', AlgovizController);
var messageId = 0;

/**
 * @name Viz
 * @type {VizItem[]}
 * @property {number} elapsed - Time elapsed in ms.
 */
 
/**
 * @name VizItem
 * @type {object}
 * @property {boolean} read - Item has just been read.
 * @property {boolean} write - Item has just been written.
 * @property {boolean} reference - Item has just been used in a comparison.
 * @property {number} reads - Number of reads.
 * @property {number} writes - Number of writes.
 * @property {number} references - Number of times item used in a comparision.
 */
 
/**
 * @name VizScript
 * @type {VizFrame[]}
 * @property {string} name
 * @property {array} final - Array after being sorted.
 */
 
/**
 * @name VizFrame
 * @description A message that a field on an object has changed.
 * @type {object}
 * @property {number} messageId - Unique ID for frame.
 * @property {number} time - Time in ms since beginning of animation.
 * @property {number} index - Index of array for item modified.
 * @property {string} name - Property name modified.
 * @property {number} value - New value for property.
 
/**
 * @param {$q}
 * @param {$timeout}
 */
function AlgovizController($q, $timeout) {
    /**
     * @property {Viz[]} vizs - Animation state.
     * @property {number} interval - Animation delay in ms.
     * @property {number} step - By-time step in ms.
     * @property {number} elapsed - By-time animation caret.
     * @property {number} steps - By-operation steps per frame.
     * @property {string[]} frames - Event names to render frame on.
     * @property {boolean} byOperation - Animate by number of operations, or by
     *                                   time elapsed.
     * @property {VizScript[]} scripts - Scripts to be played back.
     * @property {boolean} async - Run scripts simultaneously.
     */
    var ctrl = angular.extend(this, 
    {
        vizs: [],
        interval: 10,
        step: 0.05,
        elapsed: 0,
        steps: 2,
        frames: ['references'],
        byOperation: true,
        scripts: [],
        async: true
    });
    init();
    return ctrl;
    /** @description Fire things off */
    function init() {
        initAudio();
        var seed = randomArray(100);
        ctrl.scripts = [
            captureScript('browser sort', seed, function(arr, compare) { 
                arr.sort(compare);
            }),
            captureScript('insertion sort', seed, function(arr, compare) { 
                insertion_sort(arr, compare);
            }),
            captureScript('heap sort', seed, function(arr, compare) { 
                heapSort(arr, compare);
            }),
            captureScript('quick sort', seed, function(arr, compare) { 
                quickSort(arr, compare);
            }),
            captureScript('merge sort', seed, function(arr, compare) { 
                mergeSort(arr, compare);
            }),
            captureScript('bubble sort', seed, function(arr, compare) { 
                bubbleSort(arr, compare);
            }),
            captureScript('bubble alt', seed, function(arr, compare) { 
                bubbleAlt(arr, compare);
            }),
        ];
        start();
    }
    /** @description Start animation, and continue animation. Called per frame. */
    function start() {
        $timeout(function() {
            console.log('frame');
            if (play()) start(); 
            else stop();
        }, ctrl.interval);
    }

    /** @description Occurs at the end of the animation. Stops audio */
    function stop() {
        stopTone();
    }
    /** 
     * @description Progresses visual state by one frame of animation, or up
     *      to the current time caret.
     */
    function play() {
        var count = 0;
        var soundValue = 0;
        var soundValues = [];
        ctrl.elapsed += ctrl.step;
        // For each script
        for (var s = 0; s < ctrl.scripts.length; s++) {
            if (!ctrl.async && count) break;
            var script = ctrl.scripts[s];
            
            // For by-operation, number of steps remaining.
            var steps = ctrl.steps;
            
            // Create state object if it does not exist.
            if (!ctrl.vizs[s]) {
                ctrl.vizs[s] = [];
                ctrl.vizs[s].name = script.name;
            }
            var viz = ctrl.vizs[s];
            
            // Reset the state of each item
            for (var v = 0; v < viz.length; v++) {
                var item = viz[v];
                item.read = false;
                item.write = false;
                item.reference = false;
            }
            
            // For each eligible frame
            // For by-operation, contiues until n operations occur.
            // For by-time, continues until frame time exceeds time caret.
            var f;
            for (f = 0; f < script.length; f++) {
                var frame = script[f];
                count++;
                if (ctrl.byOperation || frame.time < ctrl.elapsed) {
                    // The item to be modified. If frame index is -1, the array
                    // itself is modified.
                    var vizItem;
                    if (frame.index == -1) vizItem = viz;
                    else {
                        if (!viz[frame.index]) viz[frame.index] = {};
                        vizItem = viz[frame.index];
                    }
                    vizItem[frame.name] = frame.value;

                    // Always update elapsed time.
                    if (frame.index !== -1) {
                        viz.elapsed = frame.time;
                    }
                } else {
                    break;
                }
                var trackedFrame = frame.value && ctrl.frames.indexOf(frame.name) != -1;
                if (trackedFrame) {
                    var soundValue = vizItem.value;
                    if (!isNaN(soundValue)) {
                        soundValues.push(100 + soundValue * 10);
                    };
                }

                if (ctrl.byOperation) {
                    // Decrement step count if event type is being tracked.
                    if (trackedFrame) steps--;
                    if (f + 1 == script.length || steps == 0) {
                        f++;
                        break;
                    }
                }
            }
            
            
            // Remove played frames from the script.
            script.splice(0, f);
        }

        // play Audio
        //startTone(100 + soundValue * 10);
        queueTones(soundValues, ctrl.interval);

        
        return count;
    }
    
    /**
     * @description Creates an array, populates it with incrementing numbers,
     *      then randomizes it.
     * @param {number} size
     * @returns {number[]}
     */
    function randomArray(size){
        var arr = [];
        for (var i = 0; i < size; i++) {
            arr[i] = i;
        }
        for (var i = 0; i < size; i++) {
            var i2 = Math.floor(Math.random() * size);
            var tmp = arr[i];
            arr[i] = arr[i2];
            arr[i2] = tmp;
        }
        return arr;
    }
    

    
}

/**
 * @callback captureScript~callback
 * @param {SpyArray} array - Array to be sorted, or searched.
 * @param {function(number, number)} compare - Function to use to compare two values.
 */
/**
 * @description Creates a SpyArray based on sampleArray, then calls fn to sort
 *      or search it. Captures all frames emitted by the operation.
 * @param {string} name
 * @param {number[]} sampleArray
 * @param {captureScript~callback} fn
 * @returns {VizScript}
 */
function captureScript(name, sampleArray, fn) {
    var script = [];
    script.name = name;
    var arr = new SpyArray(sampleArray.length, function(state) {
        script.push(state);
    });
    
    // Override values in SpyArray
    for (var i = 0; i < sampleArray.length; i++) {
        arr.spy[i].value.value = sampleArray[i];
    }
    
    // Flatten time in script for prior operations
    for (var i = 0; i < script.length; i++) {
        script[i].time = 0;
    }

    // Execute and time the sort/search operation
    arr.start = performance.now();
    fn(arr, arr.compare);

    // for (var i = 0; i < arr.length - 1; i++) {
    //     arr.compare(arr[i], arr[i+1]);
    // }
    // Store the sorted array for reference.
    script.final = arr.toArray();
    return script;
}

function SpyArray(length, notify) {
    var arr = [];
    arr.spy = [];
    arr.compare = valueObjectCompare;
    arr.toArray = toArray;
    arr.start = performance.now();
    Object.defineProperties(arr, {
        compares: notifier(-1, 'compares', 0),
        reads: notifier(-1, 'reads', 0),
        writes: notifier(-1, 'writes', 0)
    })
    
    for (var i = 0; i < length; i++) {
        each(i);
    }

    return arr;
    
    function toArray() {
        var ret = [];
        for (var i = 0; i < length; i++) {
            ret[i] = arr.spy[i].value.value;
        }
        return ret;
    }
    function each(i) {
        var spy = Object.create({
            index: i
        }, {
            read: notifier(i, 'read', false),
            write: notifier(i, 'write', false),
            reference: notifier(i, 'reference', false),
            reads: notifier(i, 'reads', 0),
            writes: notifier(i, 'writes', 0),
            references: notifier(i, 'references', 0)
        });
        spy.value = new ValueObject(spy, i);
        arr.spy[i] = spy;
        Object.defineProperty(arr, i.toString(), {
            get: function() {
                spy.write = false;
                spy.reference = false;
                spy.read = true;
                spy.reads++;
                arr.reads++;
                return spy.value;
            },
            set: function(newValue) {
                spy.read = false;
                spy.reference = false;
                spy.write = true;
                spy.writes++;
                arr.writes++;
                newValue.spy = spy;
                spy.value = newValue;
                notify(angular.extend(message(), {index: i, name: 'value', value: newValue.value}));
            }
        })
    }
    function message() {
        return {
            messageId: messageId++, 
            time: performance.now() - arr.start
        };
    }
    function notifier(i, name, value) {
        var state = {
            index: i,
            name: name,
            value: value
        }
        notify(angular.extend(message(), state)); // Initial state
        return {
            get: function() {
                return state.value;
            },
            set: function(newValue) {
                if (state.value !== newValue) {
                    state.value = newValue
                    notify(angular.extend(message(), state));
                }
            }
        }
    }
    function ValueObject(spy, value) {
        return Object.create({
            spy: spy
        },{
            value: notifier(spy.index, 'value', value)
        });
    }
    
    function valueObjectCompare(a, b) {
        a.spy.reference = true;
        a.spy.references++;
        b.spy.reference = true;
        b.spy.references++;
        arr.compares++;
        var res = a.value - b.value;
        if (res < 0) return -1;
        if (res > 0) return 1;
        return 0;
    }
    
}


function quickSort(array, compare) {
    sort(0, array.length - 1);
    function sort(left, right) {
        if (left >= right) return;
        var wall = partition(left, right);
        sort(left, wall - 1);
        sort(wall + 1, right);
    }
    
    function partition(left, right) {
        var l = left, r = right,
            lval, rval,
            pivot = array[right];
        while (true) {
            while (l < right && compare(lval = array[l], pivot) < 0) l++;
            while (r > left && compare(rval = array[r], pivot) > 0) r--;
            if (l < r) {
                // swap
                array[l] = rval;
                array[r] = lval;
            }
            else return l;
        }
    }
    function swap(a, b) {
        var tmp = array[a];
        array[a] = array[b];
        array[b] = tmp;
    }
}


function mergeSort(array, compare) {
    var buffer = new Array(array.length);
    sort(0, array.length - 1);
    function sort(left, right) {
        if (left >= right) return;
        var mid = Math.floor((left + right) / 2);
        sort(left, mid);
        sort(mid + 1, right);
        merge(left, mid, mid + 1, right);
    }
    
    function merge(ll, lr, rl, rr) {
        var l = ll, r = rl, c = l;
        var ld = false; rd = false;
        var lv = array[l], rv = array[r];
        while (!ld || !rd) {
            if (!ld && (rd || compare(lv, rv) < 0)) {
                buffer[c++] = lv;
                if (++l > lr) {
                    ld = true;
                } else {
                    lv = array[l];
                }
            } else {
                buffer[c++] = rv;
                if (++r > rr) {
                    rd = true;
                } else {
                    rv = array[r];
                }
            }
        }
        for (var i = ll; i <= rr; i++) {
            array[i] = buffer[i];
        }
    }
}


// Heap sort - from http://jsperf.com/sorting-algorithms/9
  function heapSort(ary, cmp) {
      heapify(ary, cmp);
  
      for (var end = ary.length - 1; end > 0; end--) {
          swap(ary, end, 0);
          shiftDown(ary, 0, end - 1, cmp);
      }
  
      return ary;
  }
  
  function heapify(ary, cmp) {
      for (var start = (ary.length >> 1) - 1; start >= 0; start--) {
          shiftDown(ary, start, ary.length - 1, cmp);
      }
  }
  
  function shiftDown(ary, start, end, cmp) {
      var root = start,
          child, s;
  
      while (root * 2 + 1 <= end) {
          child = root * 2 + 1;
          s = root;
  
          if (cmp(ary[s], ary[child]) < 0) {
              s = child;
          }
  
          if (child + 1 <= end && cmp(ary[s], ary[child + 1]) < 0) {
              s = child + 1;
          }
  
          if (s !== root) {
              swap(ary, root, s);
              root = s;
          } else {
              return;
          }
      }
  }
  function swap(ary, a, b) {
      var t = ary[a];
      ary[a] = ary[b];
      ary[b] = t;
  }
  
  
// Bubble Sort - from http://jsperf.com/sorting-algorithms/9
  function bubbleAlt(ary, cmp) {
      var a, b;
      for (a = 0; a < ary.length; a++) {
          for (b = a + 1; b < ary.length; b++) {
              if (cmp(ary[a], ary[b]) > 0) {
                  swap(ary, a, b);
              }
          }
      }
  
      return ary;
  }
  
  
  //Insertion sort
  function insertion_sort(ary, cmp) {
                for(var i=1,l=ary.length;i<l;i++) {
                        var value = ary[i];
                        for(var j=i - 1;j>=0;j--) {
                                if(cmp(ary[j], value) <= 0)
                                        break;
                                ary[j+1] = ary[j];
                        }
                        ary[j+1] = value;
                }
                return ary;
  }
  
  
function bubbleSort(arr, cmp) {
    var end = arr.length;
    do {
        var lastVal = arr[0];
        var newEnd = 0;
        for (var i = 1; i < end; i++) {
            var val = arr[i];
            if (cmp(lastVal, val) > 0) {
                //swap
                arr[i - 1] = val;
                arr[i] = lastVal;
                newEnd = i;
            } else {
                lastVal = val;
            }
        }
        end = newEnd;
    } while (end);
}