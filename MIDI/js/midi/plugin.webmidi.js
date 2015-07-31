/*
	----------------------------------------------------------------------
	Web MIDI API - Native Soundbanks
	----------------------------------------------------------------------
	http://webaudio.github.io/web-midi-api/
	----------------------------------------------------------------------
	Modified by @xiaosquared to work with Yamaha Disklavier output, 7/29/15
*/

(function(root) { 'use strict';

	var plugin = null;
	var output = null;
	var channels = [];
	var midi = root.WebMIDI = {api: 'webmidi'};

	var scheduledTimeouts = [];

	midi.send = function(data, delay) { // set channel volume
		setTimeout(function() {
			if (player.playing)
				output.send(data);
			}, delay * 1000);
	};

	midi.setController = function(channel, type, value, delay) {
		//console.log("controller message- channel " + channel + " type, " + type + ", value: " + value);
		var timeoutId = setTimeout(function() {
			if (player.playing)
				output.send([0xB0 + channel, type, value]);
		}, delay * 1000);
		scheduledTimeouts.push(timeoutId);
	};

	midi.setVolume = function(channel, volume, delay) { // set channel volume
		setTimeout(function() {
			if (player.playing)
				output.send([0xB0 + channel, 0x07, volume]);
		}, delay * 1000);
	};

	midi.programChange = function(channel, program, delay) { // change patch (instrument)
		setTimeout(function() {
			if (player.playing)
				output.send([0xC0 + channel, program]);
		}, delay * 1000);
	};

	midi.pitchBend = function(channel, program, delay) { // pitch bend
		setTimeout(function() {
			if (player.playing)
				output.send([0xE0 + channel, program]);
		}, delay * 1000);
	};

	midi.noteOn = function(channel, note, velocity, delay) {
		//console.log("note ON " + note + ", " + velocity);
		console.log(" delay: " + delay);
		var timeoutId = setTimeout(function() {
			if (player.playing)
				output.send([0x90 + channel, note, velocity]);
		}, delay * 1000);
		scheduledTimeouts.push(timeoutId);
		console.log("timeout id " + timeoutId);
	};

	midi.noteOff = function(channel, note, delay) {
		//console.log("note OFF " + note);
		var timeoutId = setTimeout(function() {
			if (player.playing) {
				for (var i = 0; i < 10; i++)
					output.send([0x80 + channel, note, 0]);
			}
		}, delay * 1000);
		scheduledTimeouts.push(timeoutId);
	};

	midi.clearAll = function() {
		// reset timeouts
		scheduledTimeouts.map(function(elt) {
			clearTimeout(elt);
		});
		scheduledTimeouts.length = 0;

		// clear notes
		for (var i = 0; i < 10; i ++) {
			for (var note = 0; note < 89; note++) {
				output.send([0x80, note + 21, 0]);
			}
		}
		// clear pedal
		output.send([0xB0, 64, 0]); 	// damper (right pedal)
		output.send([0xB0, 67, 0]);		// una corda (left pedal)
	}

	midi.chordOn = function(channel, chord, velocity, delay) {
		setTimeout(function() {
			if (player.playing) {
				for (var n = 0; n < chord.length; n ++) {
					var note = chord[n];
					output.send([0x90 + channel, note, velocity]);
				}
			}
		},  delay * 1000);

	};

	midi.chordOff = function(channel, chord, delay) {
		setTimeout(function() {
			if (player.playing) {
				for (var i = 0; i < 10; i++) {
					for (var n = 0; n < chord.length; n ++) {
						var note = chord[n];
						output.send([0x80 + channel, note, 0]);
					}
				}
			}
		}, delay * 1000);
	};

	midi.stopAllNotes = function() {
		output.cancel();
		for (var channel = 0; channel < 16; channel ++) {
			output.send([0xB0 + channel, 0x7B, 0]);
			output.send([0xB0 + channel, 0x7B, 0]);
			output.send([0xB0 + channel, 0x7B, 0]);
			output.send([0xB0 + channel, 0x7B, 0]);
			output.send([0xB0 + channel, 0x7B, 0]);
			output.send([0xB0 + channel, 0x7B, 0]);
		}
	};


	var disklavier = false;
	midi.disklavier = function() {
		return disklavier;
	}

	midi.connect = function(opts) {
		root.setDefaultPlugin(midi);
		var errFunction = function(err) { // well at least we tried!
			if (window.AudioContext) { // Chrome
				opts.api = 'webaudio';
			} else if (window.Audio) { // Firefox
				opts.api = 'audiotag';
			} else { // no support
				return;
			}
			root.loadPlugin(opts);
		};
		///
		navigator.requestMIDIAccess().then(function(access) {
			plugin = access;
			var pluginOutputs = plugin.outputs;
			if (typeof pluginOutputs == 'function') { // Chrome pre-43
				output = pluginOutputs()[0];
			} else { // Chrome 44 is what I'm using -xx
				// THIS SETS OUTPUT TO DISKLAVIER!
				output = pluginOutputs.values().next().value;
				if (output)
					disklavier = true;
			}
			if (output === undefined) { // nothing there...
				disklavier = false;
				errFunction();
			} else {
				opts.onsuccess && opts.onsuccess();
			}
		}, errFunction);
	};


})(MIDI);
