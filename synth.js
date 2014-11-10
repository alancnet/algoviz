// Example showing how to produce a tone using Web Audio API.
// Load the file webaudio_tools.js before loading this file.
// This code will write to a DIV with an id="soundStatus".
var oscillator;
var amp;

// Create an oscillator and an amplifier.
function initAudio()
{
    // Use audioContext from webaudio_tools.js
    if( audioContext )
    {
        oscillator = audioContext.createOscillator();
        fixOscillator(oscillator);
        oscillator.frequency.value = 440;
        amp = audioContext.createGain();
        amp.gain.value = 0;
    
        // Connect oscillator to amp and amp to the mixer of the audioContext.
        // This is like connecting cables between jacks on a modular synth.
        oscillator.connect(amp);
        amp.connect(audioContext.destination);
        oscillator.start(0);
        //console.log( "soundStatus", "Audio initialized.");
    }
}

// Set the frequency of the oscillator and start it running.
function startTone( frequency )
{
    if (audioContext) {
        var now = audioContext.currentTime;
        
        oscillator.frequency.setValueAtTime(frequency, now);
        
        // Ramp up the gain so we can hear the sound.
        // We can ramp smoothly to the desired value.
        // First we should cancel any previous scheduled events that might interfere.
        amp.gain.cancelScheduledValues(now);
        // Anchor beginning of ramp at current value.
        amp.gain.setValueAtTime(amp.gain.value, now);
        amp.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0);
        
        //console.log( "soundStatus", "Play tone at frequency = " + frequency);
    }
}

// Set the frequency of the oscillator and start it running.
var lastQueue = performance.now();
function queueTones( tones )
{
        if (audioContext) {
        var perfNow = performance.now();
        var span = perfNow - lastQueue;
        lastQueue = perfNow;
        var now = audioContext.currentTime;
        amp.gain.cancelScheduledValues(now);
        for (var i = 0; i < tones.length; i++) {
            var frequency = tones[i];
            var at = ((span / 1000) / tones.length) * i;
            oscillator.frequency.setValueAtTime(frequency, now + at);
            amp.gain.setValueAtTime(0.5, now + at);
        }
        }
}


function stopTone()
{
    if (audioContext) {
        var now = audioContext.currentTime;
        amp.gain.cancelScheduledValues(now);
        amp.gain.setValueAtTime(amp.gain.value, now);
        amp.gain.linearRampToValueAtTime(0.0, audioContext.currentTime + 0);
        //console.log( "soundStatus", "Stop tone.");
    }
}
