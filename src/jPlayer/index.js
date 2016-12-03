import React from "react";
import merge from "lodash.merge";
import isEqual from "lodash/isEqual";
import store from "../store";
import * as util from "../util/index";
import {keys, classNames, errors, errorMessages, errorHints, loopOptions, noFullWindowBlocks, noVolumeBlocks} from "../util/constants";
import Media from "../presentational/media";
import Gui from "../presentational/gui";
import Progress from "../presentational/progress";
import Poster from "../presentational/poster";
import Controls from "../presentational/controls";
import BrowserUnsupported from "../presentational/browserUnsupported";
import Player from "../presentational/player";
import {updateOption} from "./actions";
import convertTime from "./convertTime";
import {connect} from "react-redux";

const mapStateToProps = (state, ownProps) => {
	return {
		...state.jPlayer
	}
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    updateOption: updateOption,
})

const jPlayer = (WrappedComponent) => connect(mapStateToProps, mapDispatchToProps)(
	class extends React.Component {
		static get propTypes() {
			return {
				updateOptions: React.PropTypes.func.isRequired,
				jPlayerSelector: React.PropTypes.string,
				cssSelectorAncestor: React.PropTypes.string,
				html: React.PropTypes.objectOf(React.PropTypes.element),
				supplied: React.PropTypes.arrayOf(React.PropTypes.string),
				preload: React.PropTypes.string,
				volume: React.PropTypes.number,
				muted: React.PropTypes.bool,
				remainingDuration: React.PropTypes.bool,
				toggleDuration: React.PropTypes.bool,
				captureDuration: React.PropTypes.bool,
				playbackRate: React.PropTypes.number,
				defaultPlaybackRate: React.PropTypes.number,
				minPlaybackRate: React.PropTypes.number,
				maxPlaybackRate: React.PropTypes.number,
				stateClass: React.PropTypes.objectOf(React.PropTypes.string),
				smoothPlayBar: React.PropTypes.bool,
				fullScreen: React.PropTypes.bool,
				fullWindow: React.PropTypes.bool,
				autoHide: React.PropTypes.shape({
					restored: React.PropTypes.bool, // Controls the interface autohide feature.
					full: React.PropTypes.bool, // Controls the interface autohide feature.
					hold: React.PropTypes.number, // Milliseconds. The period of the pause before autohide beings.
				}),
				loop: React.PropTypes.string,
				nativeVideoControls: React.PropTypes.objectOf(React.PropTypes.string),
				noFullWindow: React.PropTypes.objectOf(React.PropTypes.string),
				noVolume: React.PropTypes.objectOf(React.PropTypes.string),
				timeFormat: React.PropTypes.shape({
					showHour: React.PropTypes.bool,
					showMin: React.PropTypes.bool,
					showSec: React.PropTypes.bool,
					padHour: React.PropTypes.bool,
					padMin: React.PropTypes.bool,
					padSec: React.PropTypes.bool,
					sepHour: React.PropTypes.string,
					sepMin: React.PropTypes.string,
					sepSec: React.PropTypes.string
				}),
				keyEnabled: React.PropTypes.bool,
				audioFullScreen: React.PropTypes.bool,
				keyBindings: React.PropTypes.shape({
					play: React.PropTypes.shape({
						key: React.PropTypes.number, 
						fn: React.PropTypes.func
					}),
					fullScreen: React.PropTypes.shape({
						key: React.PropTypes.number, 
						fn: React.PropTypes.func
					}),
					muted: React.PropTypes.shape({
						key: React.PropTypes.number, 
						fn: React.PropTypes.func
					}),
					volumeUp: React.PropTypes.shape({
						key: React.PropTypes.number, 
						fn: React.PropTypes.func
					}),
					volumeDown: React.PropTypes.shape({
						key: React.PropTypes.number,
						fn: React.PropTypes.func
					}),
					loop: React.PropTypes.shape({
						key: React.PropTypes.number, 
						fn: React.PropTypes.func
					})
				}),
				verticalVolume: React.PropTypes.bool,
				verticalPlaybackRate: React.PropTypes.bool,
				globalVolume: React.PropTypes.bool, // Set to make volume and muted changes affect all jPlayer instances with this option enabled
				sizeCssClass: React.PropTypes.string,
				sizeFullCssClass: React.PropTypes.string,
				shuffleAnimation: React.PropTypes.shape({
					stiffness: React.PropTypes.number, 
					damping: React.PropTypes.number, 
					precision: React.PropTypes.number
				}),
				displayAnimation: React.PropTypes.shape({
					stiffness: React.PropTypes.number, 
					damping: React.PropTypes.number, 
					precision: React.PropTypes.number
				}),
				removeAnimation: React.PropTypes.shape({
					stiffness: React.PropTypes.number, 
					damping: React.PropTypes.number, 
					precision: React.PropTypes.number
				}),
				addAnimation: React.PropTypes.shape({
					stiffness: React.PropTypes.number, 
					damping: React.PropTypes.number, 
					precision: React.PropTypes.number
				}),
				onProgress: React.PropTypes.func,
				onLoadedData: React.PropTypes.func,
				onTimeUpdate: React.PropTypes.func,
				onDurationChange: React.PropTypes.func,
				onPlay: React.PropTypes.func,
				onPlaying: React.PropTypes.func,
				onPause: React.PropTypes.func,
				onWaiting: React.PropTypes.func,
				onSeeking: React.PropTypes.func,
				onSeeked: React.PropTypes.func,
				onVolumeChange: React.PropTypes.func,
				onRateChange: React.PropTypes.func,
				onSuspend: React.PropTypes.func,
				onEnded: React.PropTypes.func,
				onError: React.PropTypes.func,
				onLoadStart: React.PropTypes.func,
				onAbort: React.PropTypes.func,
				onEmptied: React.PropTypes.func,
				onStalled: React.PropTypes.func,
				onLoadedMetadata: React.PropTypes.func,
				onCanPlay: React.PropTypes.func,
				onCanPlayThrough: React.PropTypes.func,
			}
		}
		static get defaultProps() {
			return {
				cssSelectorAncestor: "jp_container_1",
				jPlayerSelector: "jplayer_1",
				preload: "metadata", // HTML5 Spec values: none, metadata, auto.
				supplied: ["mp3"], // Defines which formats jPlayer will try and support and the priority by the order. 1st is highest,		
				captureDuration: true, // When true, clicks on the duration are captured and no longer propagate up the DOM.
				playbackRate: 1.0,
				defaultPlaybackRate: 1.0,
				minPlaybackRate: 0.5,
				maxPlaybackRate: 4,
				volume: 0.8, // The volume. Number 0 to 1.
				nativeVideoControls: {
					// Works well on standard browsers.
					// Phone and tablet browsers can have problems with the controls disappearing.
				},
				guiFadeInAnimation: {
					stiffness: 40 // Velocity of the animation (higher the faster), other properties automatically set in the Motion component
				},
				guiFadeOutAnimation: {
					stiffness: 40 
				},
				html: {},
				src: "",
				media: {},
				paused: true,
				format: {},
				formatType: "",
				waitForPlay: true, // Same as waitForLoad except in case where preloading.
				waitForLoad: true,
				srcSet: false,
				video: false, // True if playing a video
				seekPercent: 0,
				currentPercentRelative: 0,
				currentPercentAbsolute: 0,
				currentTime: 0,
				duration: 0,
				remaining: 0,
				videoWidth: 0, // Intrinsic width of the video in pixels.
				videoHeight: 0, // Intrinsic height of the video in pixels.
				readyState: 0,
				networkState: 0,
				playbackRateStatus: 1, // Warning - Now both an option and a status property
				ended: 0,
				[keys.STATE_CLASS]: []
				/*
				Persistant status properties created dynamically at _init():
				nativeVideoControls
				noFullWindow
				noVolume
				playbackRateEnabled
				*/,
				[keys.PLAY_CLASS]: [classNames.PLAY],
				[keys.PAUSE_CLASS]: [classNames.PAUSE],
				[keys.POSTER_CLASS]: [],
				[keys.VIDEO_CLASS]: [],
				[keys.VIDEO_PLAY_CLASS]: [],
				[keys.REPEAT_CLASS]: [classNames.REPEAT],
				[keys.FULL_SCREEN_CLASS]: [classNames.FULL_SCREEN],
				[keys.VOLUME_MAX_CLASS]: [classNames.VOLUME_MAX],
				[keys.VOLUME_BAR_CLASS]: [classNames.VOLUME_BAR],
				[keys.VOLUME_BAR_VALUE_CLASS]: [classNames.VOLUME_BAR_VALUE],
				[keys.PLAYBACK_RATE_BAR_CLASS]: [classNames.PLAYBACK_RATE_BAR],
				[keys.PLAYBACK_RATE_BAR_VALUE_CLASS]: [classNames.PLAYBACK_RATE_BAR_VALUE],
				[keys.SEEK_BAR_CLASS]: [classNames.SEEK_BAR],
				[keys.NO_SOLUTION_CLASS]: [classNames.NO_SOLUTION]
			};
		}
		constructor(props) {
			super(props);

			this.state = {};	

			this.assignOptions = util.assignOptions.bind(this);
			this.mergeOptions = util.mergeOptions.bind(this);
			this.modifyOptionsArray = util.modifyOptionsArray.bind(this);
			this.assignStyle = util.assignStyle.bind(this);

			this._setupInternalProperties();
			this._setupOptions();
			this._setupEvents();
		}
		_setupInternalProperties = () => {
			this.solution = "html";
			this.timeFormat = merge(util.timeFormat, this.props.timeFormat);
			this.internal = {
				// instance: undefined
				// htmlDlyCmdId: undefined
				// mouse: undefined
				// cmdsIgnored
			};
		}
		_setupOptions = () => {
			this.loopOptions = [
				loopOptions.OFF,
				loopOptions.LOOP
			].concat(this.props.loopOptions);	

			// Classes added to the cssSelectorAncestor to indicate the state.
			this.stateClass = merge({ 
				playing: classNames.states.PLAYING,
				seeking: classNames.states.SEEKING,
				muted: classNames.states.MUTED,
				looped: classNames.states.LOOPED,
				fullScreen: classNames.states.FULL_SCREEN,
				noVolume: classNames.states.NO_VOLUME,
			}, this.props[keys.STATE_CLASS]);

			this.autoHide = merge({
				restored: false, // Controls the interface autoHide feature.
				full: true, // Controls the interface autoHide feature.
				hold: 2000 // Milliseconds. The period of the pause before autoHide beings.
			}, this.props.autoHide);

			this.noFullWindow = merge({
				noFullWindowBlocks
			}, this.props.noFullWindow);

			this.noVolume = merge({
				noVolume
			}, this.props.noVolume);
			
			// The key control object, defining the key codes and the functions to execute.
			this.keyBindings = merge({
				// The parameter, f = this.focusInstance, will be checked truethy before attempting to call any of these functions.
				// Properties may be added to this object, in key/fn pairs, to enable other key controls. EG, for the playlist add-on.
				play: {
					key: 80, // p
					fn: () => this.props.updateOption("paused", !this.props.paused)
				},
				fullScreen: {
					key: 70, // f
					fn: () => {
						if(this.props.video || this.props.audioFullScreen) {
							this.props.updateOption("fullScreen", !this.props.fullScreen)
						}
					}
				},
				muted: {
					key: 77, // m
					fn: () => this.props.updateOption("muted", !this.props.muted)
				},
				volumeUp: {
					key: 190, // .
					fn: () =>  this.props.updateOption("volume", this.props.volume + 0.1)
				},
				volumeDown: {
					key: 188, // ,
					fn: () => this.props.updateOption("volume", this.props.volume - 0.1)
				},
				loop: {
					key: 76, // l
					fn: () => this.props.updateOption("loop", this._incrementCurrentLoop())
				}
			}, this.props.keyBindings);
		}
		_setupEvents = () => {
			this.mediaEvent = { 
				onProgress: () => {
					if(this.internal.cmdsIgnored && this.readyState > 0) { // Detect iOS executed the command
						this.internal.cmdsIgnored = false;
					}
					this._getHtmlStatus(this.currentMedia, null, () => {
						this._updateInterface();
						this._trigger(this.props.onProgress);
					});				
				},
				onLoadedData: () => {				
					this.androidFix.setMedia = false; // Disable the fix after the first progress event.
					if(this.androidFix.play) { // Play Android audio - performing the fix.
						this.androidFix.play = false;
						this.props.updateOption("paused", false);
						this.props.updateOption("currentTime", this.androidFix.time);
					}
					if(this.androidFix.pause) { // Pause Android audio at time - performing the fix.
						this.androidFix.pause = false;
						this.props.updateOption("paused", true);
						this.props.updateOption("currentTime", this.androidFix.time);
					}
					this._trigger(this.props.onLoadedData);
				},
				onTimeUpdate: () => {		
					this._getHtmlStatus(this.currentMedia);
					this._trigger(this.props.onTimeUpdate);
				},
				onDurationChange: () => {			
					this._getHtmlStatus(this.currentMedia);	
					this._trigger(this.props.onDurationChange);
				},
				onPlay: () => {			
					this._updateButtons(true);
					this._htmlCheckWaitForPlay(); // So the native controls update this variable and puts the hidden interface in the correct state. Affects toggling native controls.
					this._trigger(this.props.onPlay);
				},
				onPlaying: () => {			
					this._updateButtons(true);
					this._seeked();
					this._trigger(this.props.onPlaying);
				},
				onPause: () => {				
					this._updateButtons(false);
					this._trigger(this.props.onPause);
				},
				onWaiting: () => {			
					this._seeking();
					this._trigger(this.props.onWaiting);
				},
				onSeeking: () => {
					this._seeking();
					this._trigger(this.props.onSeeking);
				},
				onSeeked: () => {			
					this._seeked();
					this._trigger(this.props.onSeeked);
				},
				onVolumeChange: () => {	
					this._updateMute();
					this._updateVolume();
					this._trigger(this.props.onVolumeChange);
				},
				onRateChange: () => {				
					this._updatePlaybackRate();
					this._trigger(this.props.onRateChange);
				},
				onSuspend: () => { // Seems to be the only way of capturing that the iOS4 browser did not actually play the media from the page code. ie., It needs a user gesture.				
					this._seeked();
					this._trigger(this.props.onSuspend);
				},
				onEnded: () => {			
					// Order of the next few commands are important. Change the time and then pause.
					// Solves a bug in Firefox, where issuing pause 1st causes the media to play from the start. ie., The pause is ignored.
					if(!util.platform.webkit) { // Chrome crashes if you do this in conjunction with a setMedia command in an ended event handler. ie., The playlist demo.
						this.currentMedia.currentTime = 0; // Safari does not care about this command. ie., It works with or without this line. (Both Safari and Chrome are Webkit.)
					}
					// Pause otherwise a click on the progress bar will play from that point, when it shouldn't, since it stopped playback.
					this.props.updateOption("paused", true);
					this._updateButtons(false);
					// With override true. Otherwise Chrome leaves progress at full.
					this._getHtmlStatus(this.currentMedia, true);
					this._trigger(this.props.onEnded);
					if (this.props.loop === "loop") {	
						this._trigger(this.props.onRepeat);
					}
				},
				onError: () => {		
					this._updateButtons(false);
					this._seeked();
					if(this.props.srcSet) { // Deals with case of clearMedia() causing an error event.
						clearTimeout(this.internal.htmlDlyCmdId); // Clears any delayed commands used in the HTML solution
						this.props.updateOption("waitForLoad", true);
						this.props.updateOption("waitForPlay", true);
						
						if(this.props.video && !this.props.nativeVideoControls) {
							this.props.addClass(keys.VIDEO_CLASS, this.props[keys.VIDEO_CLASS], classNames.HIDDEN);
						}

						if(this._validString(this.props.media.poster) && !this.props.nativeVideoControls) {
							this.props.removeClass(keys.POSTER_CLASS, classNames.HIDDEN);
						}
						this.props.removeClass(keys.VIDEO_PLAY_CLASS, classNames.HIDDEN);

						this._error( {
							type: errors.URL,
							context: this.props.src, // this.src shows absolute urls. Want context to show the url given.
							message: errorMessages.URL,
							hint: errorHints.URL
						});
					}
					this._trigger(this.props.onError);
				},
				onLoadStart: () => this._trigger(this.props.onLoadStart),
				onAbort: () => this._trigger(this.props.onAbort),
				onEmptied: () => this._trigger(this.props.onEmptied),
				onStalled: () => this._trigger(this.props.onStalled),
				onLoadedMetadata: () => this._trigger(this.props.onLoadedMetadata),
				onCanPlay: () => this._trigger(this.props.onCanPlay),
				onCanPlayThrough: () => this._trigger(this.props.onCanPlayThrough)
			};
		}
		_initBeforeRender = () => {
			this.props.updateOptions((prevOptions) => merge({}, this.constructor.defaultProps, prevOptions));

			// On iOS, assume commands will be ignored before user initiates them.
			this.internal.cmdsIgnored = util.platform.ipad || util.platform.iphone || util.platform.ipod;

			// Add key bindings focusInstance to 1st jPlayer instanced with key control enabled.
			if(this.props.keyEnabled && !util.focusInstance) {
				util.focusInstance = this;
			}

			// A fix for Android where older (2.3) and even some 4.x devices fail to work when changing the *audio* SRC and then playing immediately.
			this.androidFix = {
				setMedia: false, // True when media set
				play: false, // True when a progress event will instruct the media to play
				pause: false, // True when a progress event will instruct the media to pause at a time.
				time: NaN // The play(time) parameter
			};	

			this.css = {};
			this.css.cs = {}; // Holds the css selector strings

			const updateCssClass = () => {
				const sizeClass = this.props.fullScreen ? this.props.sizeFullCssClass : this.props.sizeCssClass;
				this.props.addClass(keys.stateClass, this.props[keys.STATE_CLASS], this.stateClass[sizeClass]);
				this.props.updateOption("cssClass", sizeClass);
			};

			// Now required types are known, finish the options default settings.
			if(this.props.require.video) {	
				this.props.addClass(keys.stateClass, this.props[keys.STATE_CLASS], "jp-video");

				this.assignOptions(merge({
					sizeCssClass: "jp-video-270p",
					sizeFullCssClass: "jp-video-full"
				}, {
					sizeCssClass: this.props.sizeCssClass,
					sizeFullCssClass: this.props.sizeFullCssClass
				}), updateCssClass);		
			} else {
				this.props.addClass(keys.stateClass, this.props[keys.STATE_CLASS], "jp-audio");

				this.assignOptions({
					sizeCssClass: this.props.sizeCssClass,
					sizeFullCssClass: this.props.sizeFullCssClass
				}, updateCssClass);		
			}
			
			this._setNextProps();	
			
			this.props.addClass(keys.POSTER_CLASS, this.props[keys.POSTER_CLASS], classNames.HIDDEN);

			// Determine the status for Blocklisted options.
			this.props.updateOption("nativeVideoControls", util.uaBlocklist(this.props.nativeVideoControls));
			this.props.updateOption("noVolume", util._uaBlocklist(this.props.noVolume));
			this.props.updateOption("noFullWindow", util._uaBlocklist(this.props.noFullWindow));

			// Create event handlers if native fullscreen is supported
			if(util.nativeFeatures.fullscreen.api.fullscreenEnabled) {
				this._fullscreenAddEventListeners();
			}
		}
		_initAfterRender = () => {
			// The native controls are only for video and are disabled when audio is also used.
			this._restrictNativeVideoControls(); 	

			if (util.platform.android) {
				this.props.updateOption("preload", this.props.preload !== 'auto' ? 'metadata' : 'auto');
			}

			this.html.active = false;

			// Set up the css selectors for the control and feedback entities.
			this._cssSelectorAncestor();

			// If html is not being used by this browser, then media playback is not possible. Trigger an error event.
			if(!this.html.used) {
				this._error({
					type: errors.NO_SOLUTION, //Todo: fix errors
					context: "{solution:'" + this.props.solution + "', supplied:'" + this.props.supplied.join(", ") + "'}",
					message: errorMessages.NO_SOLUTION,
					hint: errorHints.NO_SOLUTION
				});
				this.props.removeClass(keys.NO_SOLUTION_CLASS, classNames.HIDDEN);
			} else {
				this.props.addClass(keys.NO_SOLUTION_CLASS, this.props[keys.NO_SOLUTION_CLASS], classNames.HIDDEN);
			}

			if(this.props.nativeVideoControls) {
				this.props.removeClass(keys.VIDEO_CLASS, classNames.HIDDEN);
				this.assignStyle({width: this.props.width, height: this.props.height}, "videoStyle");
			} else {
				this.props.addClass(keys.VIDEO_CLASS, this.props[keys.VIDEO_CLASS], classNames.HIDDEN);
			}
			
			// Initialize the interface components with the options.
			this._updateNativeVideoControls();
			this._updatePlaybackRate();

			// The other controls are now setup in _cssSelectorAncestor()
			this.props.addClass(keys.VIDEO_PLAY_CLASS, this.props[keys.VIDEO_PLAY_CLASS], classNames.HIDDEN);
		}	
		_restrictNativeVideoControls = () => {
			// Fallback to noFullWindow when nativeVideoControls is true and audio media is being used. Affects when both media types are used.
			if(this.props.require.audio) {
				if(this.props.nativeVideoControls) {
					this.props.updateOption("nativeVideoControls", false);
					this.props.updateOption("noFullWindow", true);
				}
			}
		}
		_updateNativeVideoControls = () => {
			if(this.html.video.available && this.html.used) {
				// Turn the HTML Video controls on/off
				this.setState({videoControls: this.props.nativeVideoControls});
				// For when option changed. The poster image is not updated, as it is dealt with in setMedia(). Acceptable degradation since seriously doubt these options will change on the fly. Can again review later.
				if(this.props.nativeVideoControls && this.props.require.video) {
					this.props.addClass(keys.POSTER_CLASS, this.props[keys.POSTER_CLASS], classNames.HIDDEN);
					this.assignStyle({width: this.props.width, height: this.props.height}, "videoStyle");
				} else if(this.props.waitForPlay && this.props.video) {
					this.props.removeClass(keys.POSTER_CLASS, classNames.HIDDEN);
					this.props.removeClass(keys.VIDEO_CLASS, classNames.HIDDEN);
				}
			}
		}
		_removeEventListeners = () => {
			//Remove the fullscreen event listeners
			var fs = util.nativeFeatures.fullscreen;

			if(this.internal.fullscreenchangeHandler) {
				document.removeEventListener(fs.event.fullscreenchange, this.internal.fullscreenchangeHandler, false);
			}
		}
		_getHtmlStatus = (media, override) => {
			let ct = 0, cpa = 0, sp = 0, cpr = 0;

			const duration = media.duration;

			ct = media.currentTime;
			cpa = (duration > 0) ? 100 * ct / duration : 0;
			if((typeof media.seekable === "object") && (media.seekable.length > 0)) {
				sp = (duration > 0) ? 100 * media.seekable.end(media.seekable.length-1) / duration : 100;
				cpr = (duration > 0) ? 100 * media.currentTime / media.seekable.end(media.seekable.length - 1) : 0; // Duration conditional for iOS duration bug. ie., seekable.end is a NaN in that case.
			} else {
				sp = 100;
				cpr = cpa;
			}

			if(override) {
				ct = 0;
				cpr = 0;
				cpa = 0;
			}

			this.props.updateOption("seekPercent", sp);
			this.props.updateOption("currentPercentRelative", cpr);
			this.props.updateOption("currentPercentAbsolute", cpa);
			this.props.updateOption("currentTime", ct);
			this.props.updateOption("remaining", duration - ct);
			// Fixes the duration bug in iOS, where the durationchange event occurs when media.duration is not always correct.
			// Fixes the initial duration bug in BB OS7, where the media.duration is infinity and displays as NaN:NaN due to Date() using inifity.
			this.props.updateOption("duration", isFinite(media.duration) ? duration : this.props.duration);
			this.props.updateOption("videoWidth", media.videoWidth);
			this.props.updateOption("videoHeight", media.videoHeight);
			this.props.updateOption("readyState", media.readyState);
			this.props.updateOption("networkState", media.networkState);
			this.props.updateOption("playbackRate", media.playbackRate);
			this.props.updateOption("ended", media.ended);
		}
		_trigger = (func, error) => {
			var jPlayerOptions = {
				version: Object.assign({}, util.version),
				element: this.currentMedia,
				html: merge({}, this.html), // Deep copy
				error: Object.assign({}, error)
			}

			if (func !== undefined) {
				func.bind(this)(jPlayerOptions);
			}
		}
		_updateButtons = (playing) => {
			if(playing === undefined) {
				playing = !this.props.paused;
			} else {
				this.props.updateOption("paused", !playing);
			}
			
			if(playing) {
				this.props.addClass(keys.stateClass, this.stateClass.playing);
			} else {
				this.props.removeClass(keys.stateClass, this.stateClass.playing);
			}
			if(!this.props.noFullWindow && this.nextProps.fullWindow) {
				this.props.addClass(keys.stateClass, this.stateClass.fullScreen);
			} else {
				this.props.removeClass(keys.stateClass, this.stateClass.fullScreen);
			}
			if(this.nextProps.loop === "loop") {
				this.props.addClass(keys.stateClass, this.stateClass.looped);
			} else {
				this.props.removeClass(keys.stateClass, this.stateClass.looped);
			}
		}
		_updateInterface = () => {
			this.assignStyle({width: `${this.props.seekPercent}%`}, "seekBarStyle");

			this.props.smoothPlayBar ? this.assignStyle({width: `${this.props.currentPercentAbsolute}%`}, "playBarStyle")
									: this.assignStyle({width: `${this.props.currentPercentRelative}%`}, "playBarStyle");
			
			var currentTimeText = convertTime(this.props.currentTime);

			this.setState({currentTimeText: currentTimeText});

			var durationText = '',
				duration = this.props.duration,
				remaining = this.props.remaining;

			if(this.props.media.duration === 'string') {
				durationText = this.props.media.duration;
			} else {
				if(this.props.media.duration === 'number') {
					duration = this.props.media.duration;
					remaining = duration - this.props.currentTime;
				}
				if(this.nextProps.remainingDuration) {
					durationText = (remaining > 0 ? '-' : '') + convertTime(remaining);
				} else {
					durationText = convertTime(duration);
				}
			}

			this.setState({durationText: durationText});
		}
		_seeking = () => {
			this.props.addClass(keys.SEEK_BAR_CLASS, this.props[keys.SEEK_BAR_CLASS], classNames.seeking);
			this.props.addClass(keys.stateClass, this.props[keys.STATE_CLASS], this.stateClass.seeking);
		}
		_seeked = () => {
			this.props.removeClass(keys.SEEK_BAR_CLASS, classNames.seeking);
			this.props.removeClass(keys.stateClass, this.stateClass.seeking);
		}
		_escapeHtml = (s) =>  s.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;').split('"').join('&quot;')
		_qualifyURL = (url) => {
			var el = document.createElement('div');
			el.innerHTML= '<a href="' + this._escapeHtml(url) + '">x</a>';
			return el.firstChild.href;
		}
		_absoluteMediaUrls = (media) => {
			for (var type in media) {
				var url = media[type];

				if(url && util.format[type] && url.substr(0, 5) !== "data:") {
					media[type] = this._qualifyURL(url);
				}
			}

			return media;
		}
		setMedia = (media) => {
			/*	media[format] = String: URL of format. Must contain all of the supplied option's video or audio formats.
			*	media.poster = String: Video poster URL.
			*	media.track = Array: Of objects defining the track element: kind, src, srclang, label, def.
			*	media.stream = Boolean: * NOT IMPLEMENTED * Designating actual media streams. ie., "false/undefined" for files.
			*/
			var	supported = false,
				posterChanged = this.props.media.poster !== media.poster; // Compare before reset. Important for OSX Safari as this.htmlElement.poster.src is absolute, even if original poster URL was relative.
				
			this._resetMedia();
			
			this.html.active = false;
						
			//Clear the Android Fix.
			this.androidFix.setMedia = false;
			this.androidFix.play = false;
			this.androidFix.pause = false;

			// Convert all media URLs to absolute URLs.
			media = this._absoluteMediaUrls(media);

			for (var formatPriority = 0; formatPriority < this.formats.length; formatPriority++) {
				var format = this.formats[formatPriority];
				var isVideo = util.format[format].media === 'video';

				if(this.html.support[format] && this._validString(media[format])) { // Format supported in solution and url given for format.

				if(isVideo) {
					this._htmlSetVideo(media);
					this.html.active = true;
					this.props.updateOption("video", true);
					this.props.removeClass(keys.VIDEO_PLAY_CLASS, classNames.HIDDEN);
				} else {
					this._htmlSetAudio(media);
					this.html.active = true;

					// Setup the Android Fix - Only for HTML audio.
					if(util.platform.android) {
						this.androidFix.setMedia = true;
					}
					this.props.updateOption("video", false);
					this.props.updateOption("media", media);
					this.props.addClass(keys.VIDEO_PLAY_CLASS, this.props[keys.VIDEO_PLAY_CLASS], classNames.HIDDEN);
				}
				supported = true;
				break;
				}
			}

			if(supported) {
				if(!(this.props.nativeVideoControls && this.html.video.gate)) {
					// Set poster IMG if native video controls are not being used
					// Note: With IE the IMG onload event occurs immediately when cached.
					// Note: Poster hidden by default in _resetMedia()
					if(this._validString(media.poster)) {
						if(posterChanged) { // Since some browsers do not generate img onload event.
							this.setState({posterSrc: media.poster});
						} else {
							this.props.removeClass(keys.POSTER_CLASS, classNames.HIDDEN);
						}
					}
				}

				if(typeof media.title === 'string') {
					this.setState({titleText: media.title});
				}
				
				this.props.updateOption("srcSet", true);
				this._updateButtons(false);
				this._trigger(this.props.onSetMedia);
			} else { // jPlayer cannot support any formats provided in this browser
				// Send an error event
				this._error( {
					type: errors.NO_SUPPORT,
					context: "{supplied:'" + this.props.supplied.join(", ") + "'}",
					message: errorMessages.NO_SUPPORT,
					hint: errorHints.NO_SUPPORT
				});
			}
		}
		_resetMedia = () => {
			this._updateButtons(false);
			this._updateInterface();
			this._seeked();
			this.props.addClass(keys.POSTER_CLASS, this.props[keys.POSTER_CLASS], classNames.HIDDEN);

			// Maintains the status properties that persist through a reset.	
		//	this.mergeOptions({status: defaultStatus});
			
			clearTimeout(this.internal.htmlDlyCmdId);

			if(this.html.active) {
				this._htmlResetMedia();
			}
		}
		clearMedia = () => {
			this._resetMedia();

			if(this.html.active) {
				this._htmlClearMedia();
			}

			this.html.active = false;
		}
		load = () => {
			if(this.props.srcSet) {
				if(this.html.active) {
					this._htmlLoad();
				}
			} else {
				this._urlNotSetError("load");
			}
		}
		focus = () => {
			if(this.props.keyEnabled) {
				util.focusInstance = this;
			}
		}
		play = (time) => {
			if(this.props.srcSet) {
				this.focus();
				if(this.html.active) {
					this._htmlPlay(time);
				}
			} else {
				this._urlNotSetError("play");
				this.props.updateOption("paused", true);
			}
		}
		pause = (time) => {
			if(this.props.srcSet) {
				if(this.html.active) {
					this._htmlPause(time);
				}
			} else {
				this._urlNotSetError("pause");
			}
		}
		stop = () => {
			if(this.props.srcSet) {
				if(this.html.active) {
					this._htmlPause(0);
				}
			} else {
				this._urlNotSetError("stop");
			}
		}
		playHead = (p) => {
			p = this._limitValue(p, 0, 100);
			if(this.props.srcSet) {
				if(this.html.active) {
					this._htmlPlayHead(p);
				}
			} else {
				this._urlNotSetError("playHead");
			}
		}
		mute = (mute) => {					
			if(this.props.muted) {
				this.props.updateOption("muted", false);
			} else {
				mute = mute === undefined ? true : !!mute;
				this.props.updateOption("muted", mute);
			}
		}
		_updateMute = (mute) => {
			if(mute === undefined) {
				mute = this.props.muted;
			}
			if(mute) {
				this.props.addClass(keys.stateClass, this.props[keys.STATE_CLASS], this.stateClass.muted);
			} else {
				this.props.removeClass(keys.stateClass, this.stateClass.muted);
			}	
		}
		_updateVolume = (v) => {
			v = this._limitValue(v, 0, 1);
			if(v === undefined) {
				v = this.props.volume;
			}
			v = this.props.muted ? 0 : v;

			if(this.props.noVolume) {
				this.props.addClass(keys.stateClass, this.props[keys.STATE_CLASS], this.stateClass.noVolume);
				this.props.addClass(keys.VOLUME_BAR_CLASS, this.props[keys.VOLUME_BAR_CLASS], classNames.HIDDEN);
				this.props.addClass(keys.VOLUME_BAR_VALUE_CLASS, this.props[keys.VOLUME_BAR_VALUE_CLASS], classNames.HIDDEN);
				this.props.addClass(keys.VOLUME_MAX_CLASS, this.props[keys.VOLUME_MAX_CLASS], classNames.HIDDEN);
			} else {
				this.props.removeClass(keys.stateClass, this.stateClass.noVolume);
				const volumeValue = (v * 100) + "%";

				this.assignStyle({
					width: !this.props.verticalVolume ? volumeValue : null,
					height: this.props.verticalVolume ? volumeValue : null
				}, "volumeBarValueStyle");

				this.props.removeClass(keys.VOLUME_BAR_CLASS, classNames.HIDDEN);
				this.props.removeClass(keys.VOLUME_BAR_VALUE_CLASS, classNames.HIDDEN);
				this.props.removeClass(keys.VOLUME_MAX_CLASS, classNames.HIDDEN);
			}
		}
		_cssSelectorAncestor = (ancestor) => {
			this.props.removeClass(keys.stateClass, this.props.cssClass);
			this.props.addClass(keys.stateClass, this.props[keys.STATE_CLASS], this.props.cssClass);
								
			// Set the GUI to the current state.
			this._updateInterface();
			this._updateButtons();
			this._updateVolume();
			this._updateMute();
		}
		duration = (e) => {
			if(this.props.toggleDuration) {
				if(this.props.captureDuration) {
					e.stopPropagation();
				}
				this.props.updateOption("remainingDuration", !this.props.remainingDuration);
			}
		}
		_updatePlaybackRate = () => {
			var pbr = this.nextProps.playbackRate,
				ratio = (pbr - this.props.minPlaybackRate) / (this.props.maxPlaybackRate - this.props.minPlaybackRate);
			if(this.props.playbackRateEnabled) {
				this.props.removeClass(keys.PLAYBACK_RATE_BAR_CLASS, classNames.HIDDEN);
				this.props.removeClass(keys.PLAYBACK_RATE_BAR_VALUE_CLASS, classNames.HIDDEN);

				const playbackRateBarValue = (ratio*100)+"%";

				this.assignStyle({
					width: !this.props.verticalPlaybackRate ? playbackRateBarValue : null,
					height: this.props.verticalPlaybackRate ? playbackRateBarValue : null
				}, "playbackRateBarValueStyle");
			} else {
				this.props.addClass(keys.PLAYBACK_RATE_BAR_CLASS, this.props[keys.PLAYBACK_RATE_BAR_CLASS], classNames.HIDDEN);
				this.props.addClass(keys.PLAYBACK_RATE_BAR_VALUE_CLASS, this.props[keys.PLAYBACK_RATE_BAR_VALUE_CLASS], classNames.HIDDEN);
			}
		}
		_incrementCurrentLoop = () => {
			var loopIndex = this.loopOptions.indexOf(this.props.loop || this.loopOptions[0]);

			if (loopIndex >= this.loopOptions.length - 1) {
				loopIndex = -1;
			}
			return this.loopOptions[++loopIndex];
		}
		_loop = () => {
			this._updateButtons(); 
			this._trigger(this.props.onRepeat);
		}
		_setNextProps = (nextProps = {}) => {
			//props that get updated within the jPlayer component as well as through props
			this.nextProps = {
				playbackRate: nextProps.playbackRate === undefined ? this.props.playbackRate : nextProps.playbackRate,
				fullWindow: nextProps.fullWindow === undefined ? this.props.fullWindow : nextProps.fullWindow,
				remainingDuration: nextProps.remainingDuration === undefined ? this.props.remainingDuration : nextProps.remainingDuration,
				loop: nextProps.loop === undefined ? this.props.loop : nextProps.loop,
				sizeCssClass: nextProps.sizeCssClass === undefined ? this.props.sizeCssClass : nextProps.sizeCssClass,
				sizeFullCssClass: nextProps.sizeFullCssClass === undefined ? this.props.sizeFullCssClass : nextProps.sizeFullCssClass
			};
		}
		_setOptions = (options) => {
			const dynamicOption = {	
				media: (value) => this.setMedia(value),
				paused: (value) => value ? this.pause(value.currentTime) : this.play(value.currentTime),
				volume: (value) => {
					if(this.html.used) {
						this.currentMedia.volume = value;
					}
				},
				muted: (value) => {	
					if(this.html.used) {
						this.currentMedia.muted = value;
					}
				},
				autoPlay: (value) => {
					if (this.html.used) {
						this.currentMedia.autoplay = value
					}
				},
				playbackRate: (value) => {
					if(this.html.used) {
						this.currentMedia.playbackRate = value;
					}
					this._setNextProps({playbackRate: value});
					this._updatePlaybackRate();
				},
				defaultPlaybackRate: (value) => { 
					if(this.html.used) {
						this.currentMedia.defaultPlaybackRate = value;
					}
					this._updatePlaybackRate();
				},
				minPlaybackRate: () => this._updatePlaybackRate(),
				maxPlaybackRate: () => this._updatePlaybackRate(),
				fullScreen: (value) => { 
					var wkv = util.nativeFeatures.fullscreen.used.webkitVideo;
					if(!wkv || wkv && !this.props.waitForPlay) {
						if(value) {
							this._requestFullscreen();
						} else {
							this._exitFullscreen();
						}
						if(!wkv) {
							this.props.updateOption("fullWindow", value);
						}
					}
				},
				fullWindow: (value) => { 
					const sizeClass = this.nextProps.fullWindow ? this.props.sizeFullCssClass : this.props.sizeCssClass;
					this.props.removeClass(keys.stateClass, this.props.cssClass);
					this.props.addClass(keys.stateClass, this.props[keys.STATE_CLASS], this.stateClass[sizeClass]);
					this._setNextProps({fullWindow: value});			
					this.props.updateOption("cssClass", sizeClass, () => this._trigger(this.props.onResize));		
				},
				loop: (value) => { 
					this._setNextProps({loop: value});
					this._loop();
				},
				remainingDuration: (value) => { 
					this._setNextProps({remainingDuration: value});
					this._updateInterface();
				},
				nativeVideoControls: () => { 
					//this.props.nativeVideoControls = util._uaBlocklist(this.props.nativeVideoControls);
					this._restrictNativeVideoControls();
				},
				noFullWindow: () => { 
					//this.props.nativeVideoControls = util._uaBlocklist(this.props.nativeVideoControls); // Need to check again as noFullWindow can depend on this flag and the restrict() can override it.
					//this.props.noFullWindow = util._uaBlocklist(this.props.noFullWindow);
					this._restrictNativeVideoControls();
				},
				noVolume: () => { 
					//this.props.noVolume = util._uaBlocklist(this.props.noVolume);
					this._updateVolume();
					this._updateMute();
				},
				keyEnabled: (value) => { 
					if(!value && this === util.focusInstance) {
						util.focusInstance = null;
					}
				}
			};

			for (let key in options) {
				let option = options[key];
				if (dynamicOption.hasOwnProperty(key) && !isEqual(this.props[key], option)) {
					dynamicOption[key](option);		
				}
			}
		}
		_updateSize = () => {
			// Video html resized if necessary at this time, or if native video controls being used.
			if(!this.props.waitForPlay && this.html.active && this.props.video
					|| this.html.video.available && this.html.used && this.props.nativeVideoControls) {
				this.assignStyle({width: this.props.width, height: this.props.height}, "videoStyle");
			}
		}
		_fullscreenAddEventListeners = () => {
			var	fs = util.nativeFeatures.fullscreen;

			if(fs.api.fullscreenEnabled) {
				if(fs.event.fullscreenchange) {
					// Create the event handler function and store it for removal.
					if(typeof this.internal.fullscreenchangeHandler !== 'function') {
						this.internal.fullscreenchangeHandler = () => {
							this._fullscreenchange();
						};
					}
					document.addEventListener(fs.event.fullscreenchange, this.internal.fullscreenchangeHandler, false);
				}
				// No point creating handler for fullscreenerror.
				// Either logic avoids fullscreen occurring (w3c/moz), or their is no event on the browser (webkit).
			}
		}
		_fullscreenchange = () => {
			// If nothing is fullscreen, then we cannot be in fullscreen mode.
			if(this.props.fullScreen && !util.nativeFeatures.fullscreen.api.fullscreenElement()) {
				this.props.updateOption("fullScreen", false);
			}
		}
		_requestFullscreen = () => {
			var e = document.querySelector(this.props.cssSelectorAncestor),
				fs = util.nativeFeatures.fullscreen;

			// This method needs the video element. For iOS and Android.
			if(fs.used.webkitVideo) {
				e = this.currentMedia;
			}

			if(fs.api.fullscreenEnabled) {
				fs.api.requestFullscreen(e);
			}
		}
		_posterLoad = () => {
			if(!this.props.video || this.props.waitForPlay) {
				this.props.removeClass(keys.POSTER_CLASS, classNames.HIDDEN);
			}
		}
		_exitFullscreen = () => {
			var fs = util.nativeFeatures.fullscreen,
				e;

			// This method needs the video element. For iOS and Android.
			if(fs.used.webkitVideo) {
				e = this.video.element();
			}

			if(fs.api.fullscreenEnabled) {
				fs.api.exitFullscreen(e);
			}
		}
		_htmlInitMedia = (media) => {
			var mediaArray = media.track || [];
			var tracks = [];

			// Create any track elements given with the media, as an Array of track Objects.
			for (var index = 0; index < mediaArray.length; index++) {
				var v = array[index];
				var vDef = undefined

				if(v.def) {
					vDef = v.def;
				}

				trackElements.push(<track kind={v.Kind} src={v.src} srclang={v.srclang} label={v.label} default={vDef}/>);
			}

			this.setState({tracks: tracks});
			this.currentMedia.src = this.props.src;

			if(this.props.preload !== 'none') {
				this._htmlLoad();
				this._trigger(this.props.onTimeUpdate)
			}
		}
		_htmlSetFormat = (media, formatSetCallback) => {
			// Always finds a format due to checks in setMedia()
			for (var priority = 0; priority < this.formats.length; priority++) {
				var format = this.formats[priority];

				if(this.html.support[format] && media[format]) {
					this.props.updateOption("src", media[format]);
					this.props.updateOption("formatType", format);
					this.props.updateOption("format", {[format]: true}, formatSetCallback);
					break;
				}
			}
		}
		_htmlSetAudio = (media) => this._htmlSetFormat(media)
		_htmlSetVideo = (media) => {
			this._htmlSetFormat(media);
			if(this.props.nativeVideoControls) {
				this.video.element().poster = this._validString(media.poster) ? media.poster : "";
			}
		}
		_htmlResetMedia = () => {
			if(this.currentMedia) {
				if(!this.props.nativeVideoControls) {
					this.props.addClass(keys.VIDEO_CLASS, this.props[keys.VIDEO_CLASS], classNames.HIDDEN);
				}
				this.currentMedia.pause();
			}
		}
		_htmlClearMedia = () => {
			if(this.currentMedia) {
				this.currentMedia.src = "about:blank";

				// The following load() is only required for Firefox 3.6 (PowerMacs).
				// Recent HTMl5 browsers only require the src change. Due to changes in W3C spec and load() effect.
				this.currentMedia.load(); // Stops an old, "in progress" download from continuing the download. Triggers the loadstart, error and emptied events, due to the empty src. Also an abort event if a download was in progress.
			}
		}
		_htmlLoad = (htmlLoadedCallback) => {
			// This function remains to allow the early HTML5 browsers to work, such as Firefox 3.6
			// A change in the W3C spec for the media.load() command means that this is no longer necessary.
			// This command should be removed and actually causes minor undesirable effects on some browsers. Such as loading the whole file and not only the metadata.
			if(this.props.waitForLoad) {
				this.currentMedia.load();
				this.props.updateOption("waitForLoad", false);
			}
			clearTimeout(this.internal.htmlDlyCmdId);
		}
		_htmlPlay = (time) => {
			this.androidFix.pause = false; // Cancel the pause fix.

			this._htmlLoad(); // Loads if required and clears any delayed commands.

			// Setup the Android Fix.
			if(this.androidFix.setMedia) {
				this.androidFix.play = true;
				this.androidFix.time = time;
			} else if(!isNaN(time)) {
				// Attempt to play it, since iOS has been ignoring commands
				if(this.internal.cmdsIgnored) {
					this.currentMedia.play();
				}
				try {
					// !this.currentMedia.seekable is for old HTML5 browsers, like Firefox 3.6.
					// Checking seekable.length is important for iOS6 to work with setMedia().play(time)
					if(!this.currentMedia.seekable || typeof this.currentMedia.seekable === "object" && this.currentMedia.seekable.length > 0) {
						this.currentMedia.currentTime = time;
						this.currentMedia.play();
					} else {
						throw 1;
					}
				} catch(err) {
					this.internal.htmlDlyCmdId = setTimeout(() => {
						this.props.updateOption("paused", false);
						this.props.updateOption("currentTime", time);
					}, 250);
					return; // Cancel execution and wait for the delayed command.
				}
			} else {
				this.currentMedia.play();
			}
		}
		_htmlPause = (time) => {
			this.androidFix.play = false; // Cancel the play fix.

			if(time > 0) { // We do not want the stop() command, which does pause(0), causing a load operation.
				this._htmlLoad();
			} else {
				clearTimeout(this.internal.htmlDlyCmdId);
			}

			// Order of these commands is important for Safari (Win) and IE9. Pause then change currentTime.
			this.currentMedia.pause();

			// Setup the Android Fix.
			if(this.androidFix.setMedia) {
				this.androidFix.pause = true;
				this.androidFix.time = time;

			} else if(!isNaN(time)) {
				try {
					if(!this.currentMedia.seekable || typeof this.currentMedia.seekable === "object" && this.currentMedia.seekable.length > 0) {
						this.currentMedia.currentTime = time;
					} else {
						throw 1;
					}
				} catch(err) {
					this.internal.htmlDlyCmdId = setTimeout(() => {
						this.props.updateOption("paused", true);
						this.props.updateOption("currentTime", time);
					}, 250);
					return; // Cancel execution and wait for the delayed command.
				}
			}
		}
		_htmlPlayHead = (percent) => {
			this._htmlLoad();

			// This playHead() method needs a refactor to apply the android fix.
			try {
				if(typeof this.currentMedia.seekable === "object" && this.currentMedia.seekable.length > 0) {
					this.currentMedia.currentTime = percent * this.currentMedia.seekable.end(this.currentMedia.seekable.length-1) / 100;
				} else if(this.currentMedia.duration > 0 && !isNaN(this.currentMedia.duration)) {
					this.currentMedia.currentTime = percent * this.currentMedia.duration / 100;
				} else {
					throw "e";
				}
			} catch(err) {
				this.internal.htmlDlyCmdId = setTimeout(() => {
					this.playHead(percent);
				}, 250);
				return; // Cancel execution and wait for the delayed command.
			}
		}
		_htmlCheckWaitForPlay = () => {
			if(this.props.waitForPlay) {
				this.props.updateOption("waitForPlay", false);
				this.props.addClass(keys.VIDEO_PLAY_CLASS, this.props[keys.VIDEO_PLAY_CLASS], classNames.HIDDEN);

				if(this.props.video) {
					this.props.addClass(keys.POSTER_CLASS, this.props[keys.POSTER_CLASS], classNames.HIDDEN);
					this.assignStyle({width: this.props.width, height: this.props.height}, "videoStyle");
				}
			}
		}
		_validString = (url) => (url && typeof url === "string"); // Empty strings return false
		_limitValue = (value, min, max) => (value < min) ? min : ((value > max) ? max : value);
		_urlNotSetError = (context) => {
			this._error( {
				type: errors.URL_NOT_SET,
				context: context,
				message: errorMessages.URL_NOT_SET,
				hint: errorHints.URL_NOT_SET
			});
		}
		_error = (error) => {
			this._trigger(this.props.onError, error);
		}
		onPlayClick = () => this.props.updateOption("paused", !this.props.paused)
		onSeekBarClick = (e) => {	
			// Using $(e.currentTarget) to enable multiple seek bars
			var bar = e.currentTarget,
				offset = util.getOffset(bar),
				x = e.pageX - offset.left,
				w = util.getWidth(bar),
				p = 100 * x / w;

			this.playHead(p);
		}
		onPlaybackRateBarClick = (e) => {
			// Using e.currentTarget to enable multiple playbackRate bars
			var bar = e.currentTarget,
				offset = util.getOffset(bar),
				x = e.pageX - offset.left,
				w = util.getWidth(bar),
				y = util.getHeight(bar) - e.pageY + offset.top,
				h = util.getHeight(bar),
				ratio,
				pbr;

			if(this.props.verticalPlaybackRate) {
				ratio = y/h;
			} else {
				ratio = x/w;
			}

			pbr = ratio * (this.props.maxPlaybackRate - this.props.minPlaybackRate) + this.props.minPlaybackRate;
			this.props.updateOption("playbackRate", pbr);
		}
		onVolumeBarClick = (e) => {
			// Using $(e.currentTarget) to enable multiple volume bars
			var bar = e.currentTarget,
				offset = util.getOffset(bar),
				x = e.pageX - offset.left,
				w = util.getWidth(bar),
				y = util.getHeight(bar) - e.pageY + offset.top,
				h = util.getHeight(bar);

			if(this.props.verticalVolume) {
				this.props.updateOption("volume", y/h);
			} else {
				this.props.updateOption("volume", x/w);
			}

			if(this.props.muted) {
				this.props.updateOption("muted", false);
			}
		}
		onVolumeMaxClick = () => {
			this.props.updateOption("volume", 1);

			if(this.props.muted) {
				this.props.updateOption("muted", false);
			}
		} 
		onVideoPlayClick = () => this.props.updateOption("paused", false)
		onMuteClick = () => this.props.updateOption("muted", !this.props.muted)
		onRepeatClick = () => this.props.updateOption("loop", this._incrementCurrentLoop())
		onFullScreenClick = () => this.props.updateOption("fullScreen", !this.props.fullScreen)
		componentWillReceiveProps(nextProps) {
			this._setOptions(nextProps);
		}	
		componentWillUnmount() {
			this._removeEventListeners();
			document.documentElement.removeEventListener("keydown", this._keyBindings);
		}
		componentWillMount() {
			//this._initBeforeRender();
		}
		componentDidMount() {
			//this._initAfterRender();
		}
		componentDidUpdate(prevProps, prevState) {
			this.currentMedia.loop = this.props.loop === "loop" ? true : false;

			if (this.props.nativeVideoControls !== prevProps.nativeVideoControls) {
				this._updateNativeVideoControls();
			}
		
			if (this.props.currentTime !== prevProps.currentTime || this.props.duration !== prevProps.duration) {
				this._updateInterface();
			}

			if (this.props.paused !== prevProps.paused || this.props.noFullWindow !== prevProps.noFullWindow || this.props.loop !== prevProps.loop ||
				this.props.sizeCssClass !== prevProps.sizeCssClass || this.props.sizeFullCssClass !== prevProps.sizeFullCssClass ||  
				this.props.fullWindow !== prevProps.fullWindow || this.props.fullScreen !== prevProps.fullScreen) {
				this._updateButtons();
			}

			if (this.props.src !== prevProps.src) {
				this._htmlInitMedia(this.props.media);
			}

			if (this.props.waitForLoad !== prevProps.waitForLoad) {
				//if(time > 0) { // Avoids a setMedia() followed by stop() or pause(0) hiding the video play button.
					this._htmlCheckWaitForPlay();
				//}
			}		
		}
		render() {
			debugger
			return (
				<WrappedComponent playd={this.play} {...this.props}>
					<div id={this.props.cssSelectorAncestor} className={this.props[keys.STATE_CLASS].join(" ")}>
						{this.props.children}
						<Media events={this.mediaEvent} updateOption={this.updateOption}>
							{this.state.tracks}
						</Media>		
						{/*<Player className={"jp-jplayer"}>
							<Poster posterClass={this.props[keys.POSTER_CLASS].join(" ")} src={this.state.posterSrc} onLoad={this._posterLoad} onClick={() => this._trigger(this.props.onClick)} /> 
							<Audio ref={(audio) => this.audio = audio} require={this.require.audio} events={this.mediaEvent}>
								{this.state.tracks}
							</Audio>
							<Video ref={(video) => this.video = video} require={this.require.video} videoClass={this.props[keys.VIDEO_CLASS].join(" ")} style={this.state.videoStyle} onClick={() => this._trigger(this.props.onClick)} events={this.mediaEvent}>
								{this.state.tracks}
							</Video>		
						</Player>
						<GUI nativeVideoControls={this.props.nativeVideoControls} fullWindow={this.props.fullWindow} autoHide={this.autoHide} fadeInConfig={this.props.guiFadeInAnimation} fadeOutConfig={this.props.guiFadeOutAnimation}>
							<Controls />
							<Progress />
						</GUI>
						<BrowserUnsupported />	*/}
					</div>
				</WrappedComponent>
			);
		}
	}
)

export default jPlayer;