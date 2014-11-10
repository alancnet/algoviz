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
     * @property {boolean} running - Is the animation running.
     */
    var ctrl = angular.extend(this, 
    {
        // Properties
        vizs: [],
        interval: 10,
        step: 0.05,
        elapsed: 0,
        steps: 2,
        frames: ['references'],
        byOperation: true,
        scripts: [],
        async: true,
        running: false,
        clear: clear,
        
        // Methods
        start: start,
        stop: stop
    });
    var timer;
    init();
    return ctrl;
    /** @description Fire things off */
    function init() {
        initAudio();
        record();
    }
    
    function record() {
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
        
    }
    
    function clear() {
        //stop();
        ctrl.scripts = null;
        ctrl.vizs = [];
    }
    /** @description Start animation, and continue animation. Called per frame. */
    function start() {
        ctrl.running = true
        if (!ctrl.scripts) record();
        if (play()) {
            timer = $timeout(function() {
                 start(); 
            }, ctrl.interval);
        }
        else stop();
    }

    /** @description Occurs at the end of the animation. Stops audio */
    function stop() {
        running = false;
        $timeout.cancel(timer);
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


