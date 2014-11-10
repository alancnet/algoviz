// From: Various sources

// Home grown:
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


// Home grown:
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


// Home grown
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
  
  
