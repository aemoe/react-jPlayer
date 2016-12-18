import React from "react";
import merge from "lodash.merge";
import isEqual from "lodash/isEqual";
import store from "../store";
import * as util from "../util/index";
import * as constants from "../util/constants";
import * as actions from "../actions/jPlayerActions";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import screenfull from "screenfull";
import Poster from "../components/poster";
import Audio from "../components/audio";
import Video from "../components/video";
import Player from "../components/player";
import BrowserUnsupported from "../components/browserUnsupported";
import {addUniqueToArray, removeFromArrayByValue} from "../reducers/index";
import * as jPlayerActions from "../actions/jPlayerActions";

const mapStateToProps = (state) => ({
	...state.jPlayer, 
	shuffled: state.jPlaylist.shuffled
});
const mapDispatchToProps = (dispatch) => (bindActionCreators(actions, dispatch));

export default connect(mapStateToProps, mapDispatchToProps)(
	class JPlayer extends React.PureComponent {
		constructor(props) {
			super(props);

			this.setFormats();
			this.setPlayableFormat();

			this.state = {
				[constants.keys.POSTER_CLASS]: [],
				[constants.keys.NO_SOLUTION_CLASS]: [constants.classNames.NO_SOLUTION]
			};
			// The key control object, defining the key codes and the functions to execute.
			this.keyBindings = merge({
				// The parameter, f = this.focusInstance, will be checked truethy before attempting to call any of these functions.
				// Properties may be added to this object, in key/fn pairs, to enable other key controls. EG, for the playlist add-on.
				play: {
					key: 80, // p
					fn: () => this.props.paused ? this.play() : this.pause()
				},
				fullScreen: {
					key: 70, // f
					fn: () => {
						if(this.props.video.available || this.props.audioFullScreen) {
							this.fullScreen(!this.props.fullScreen);
						}
					}
				},
				muted: {
					key: 77, // m
					fn: () => this.mute(!this.props.muted)
				},
				volumeUp: {
					key: 190, // .
					fn: () =>  this.volume(this.props.volume + 0.1)
				},
				volumeDown: {
					key: 188, // ,
					fn: () => this.volume(this.props.volume - 0.1)
				},
				loop: {
					key: 76, // l
					fn: () => this.incrementLoop()
				}
			}, this.props.keyBindings);
		}
		static get propTypes() {
			return {
				updateOptions: React.PropTypes.func.isRequired,
				jPlayerSelector: React.PropTypes.string,
				cssSelectorAncestor: React.PropTypes.string,
				controls: React.PropTypes.objectOf(React.PropTypes.element),
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
				smoothPlayBar: React.PropTypes.bool,
				fullScreen: React.PropTypes.bool,
				fullWindow: React.PropTypes.bool,			
				loop: React.PropTypes.string,				
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
		static get childContextTypes() {
			return {
				setMedia: React.PropTypes.func,
				clearMedia: React.PropTypes.func,
				play: React.PropTypes.func,
				pause: React.PropTypes.func,
				playHead: React.PropTypes.func,
				focus: React.PropTypes.func,
				volume: React.PropTypes.func,
				mute: React.PropTypes.func,
				unmute: React.PropTypes.func,
				incrementLoop: React.PropTypes.func,
				fullScreen: React.PropTypes.func,
				duration: React.PropTypes.func,
				playbackRate: React.PropTypes.func,
			}
		}
		getChildContext = () => ({
			setMedia: this.setMedia,
			clearMedia: this.clearMedia,
			play: this.play,
			pause: this.pause,
			playHead: this.playHead,
			focus: this.focus,
			volume: this.volume,
			mute: this.mute,
			unmute: this.unmute,
			incrementLoop: this.incrementLoop,
			fullScreen: this.fullScreen,
			duration: this.duration,
			playbackRate: this.playbackRate
		})
		setFormats = () => {
			this.mediaSettings = {
				audio: {
					formats: [], //Order defines priority.
					require: false,
					available: false,
					playableFormat: []
				},
				video: {
					formats: [],
					require: false,
					available: false,
					playableFormat: []
				}
			};
			// Create the formats array, with prority based on the order of the supplied formats string
			for (var index1 = 0; index1 < this.props.supplied.length; index1++) {
				const format = this.props.supplied[index1].replace(/^\s+|\s+$/g, ""); //trim
				const mediaConfig = this.mediaSettings[constants.formats[format].MEDIA];

				if(constants.formats[format]) { // Check format is valid.
					var dupFound = false;

					for (var index2 = 0; index2 < mediaConfig.formats.length; index2++) {
						var value2 = constants.formats[index2];

						if(format === value2) {
							dupFound = true;
							break;
						}
					}

					if(!dupFound) {
						mediaConfig.formats.push(format);
					}
				}
			}
		}
		setPlayableFormat = () => {		
			for (var mediaSetting in this.mediaSettings) {
				const mediaConfig = this.mediaSettings[mediaSetting];
				const mediaElement = document.createElement(mediaSetting);

				for (var priority in mediaConfig.formats) {
					var format = mediaConfig.formats[priority];
							
					mediaConfig.require = true;
					mediaConfig.available = mediaElement.canPlayType && util.testCanPlayType(mediaElement); // Test is for IE9 on Win Server 2008. 
					mediaConfig.playableFormat = {
						[format]: mediaConfig.available && mediaElement.canPlayType(constants.formats[format].CODEC)
					}
				}
			}
		}
		_setupOptions = () => {
			this.timeFormats = merge(constants.timeFormats, this.props.timeFormats);	

			this.loopOptions = [
				constants.loopOptions.OFF,
				constants.loopOptions.LOOP		
			].concat(this.props.loopOptions);

			this.noFullWindow = merge({
				...constants.noFullWindows
			}, this.props.noFullWindow);

			this.noVolume = merge({
				...constants.noVolumes
			}, this.props.noVolume);	
		}
		_setupEvents = () => {
			this.props.updateOption("mediaEvent", { 
				onProgress: () => {
					this._updateMediaStatus(this.currentMedia);
					this._trigger(this.props.onProgress);		
				},
				onTimeUpdate: () => {		
					this._updateMediaStatus(this.currentMedia);
					this._trigger(this.props.onTimeUpdate);
				},
				onDurationChange: () => {
					this._updateMediaStatus(this.currentMedia);
					this._trigger(this.props.onDurationChange);
				},
				onPlay: () => {
					this.props.updateOption("paused", false);
					this._trigger(this.props.onPlay);
				},
				onPlaying: () => {			
					this.props.updateOption("paused", false);
					this.props.updateOption("seeking", false);
					this._trigger(this.props.onPlaying);
				},
				onPause: () => {				
					this.props.updateOption("paused", true);
					this._trigger(this.props.onPause);
				},
				onWaiting: () => {		
					this.props.updateOption("seeking", true);		
					this._trigger(this.props.onWaiting);
				},
				onSeeking: () => {
					this.props.updateOption("seeking", true);
					this._trigger(this.props.onSeeking);
				},
				onSeeked: () => {
					this.props.updateOption("seeking", false);
					this._trigger(this.props.onSeeked);
				},
				onEnded: () => {
					// Pause otherwise a click on the progress bar will play from that point, when it shouldn't, since it stopped playback.
					this.props.updateOption("paused", true);
					// With override true. Otherwise Chrome leaves progress at full.
					this._updateMediaStatus(this.currentMedia, true);
					this._trigger(this.props.onEnded);
					if (this.props.loop === "loop") {	
						this._trigger(this.props.onRepeat);
					}
				},
				onError: () => {		
					this.props.updateOption("paused", true);
					this.props.updateOption("seeking", false);
					if(this.props.srcSet) { // Deals with case of clearMedia() causing an error event.
						this.props.updateOption("waitForLoad", true);
						this.props.updateOption("waitForPlay", true);
						
						if(this.props.video.available && !this.props.nativeVideoControls) {
							this.setState(state => addUniqueToArray(state, jPlayerActions.addUniqueToArray(constants.keys.VIDEO_CLASS, constants.classNames.HIDDEN)));
						}

						if(util.validString(this.props.media.poster) && !this.props.nativeVideoControls) {
							this.setState(state => removeFromArrayByValue(state, jPlayerActions.removeFromArrayByValue(constants.keys.POSTER_CLASS, constants.classNames.HIDDEN)));
						}
						this.setState(state => removeFromArrayByValue(state, jPlayerActions.removeFromArrayByValue(constants.keys.VIDEO_PLAY_CLASS, constants.classNames.HIDDEN)));

						this._error( {
							type: constants.errors.URL,
							context: this.props.src, // this.src shows absolute urls. Want context to show the url given.
							message: constants.errorMessages.URL,
							hint: constants.errorHints.URL
						});
					}
					this._trigger(this.props.onError);
				},
				onSuspend: () => this._trigger(this.props.onSuspend),
				onVolumeChange: () => this._trigger(this.props.onVolumeChange),
				onRateChange: () => this._trigger(this.props.onRateChange),
				onLoadedData: () => this._trigger(this.props.onLoadedData),
				onLoadStart: () => this._trigger(this.props.onLoadStart),
				onAbort: () => this._trigger(this.props.onAbort),
				onEmptied: () => this._trigger(this.props.onEmptied),
				onStalled: () => this._trigger(this.props.onStalled),
				onLoadedMetadata: () => this._trigger(this.props.onLoadedMetadata),
				onCanPlay: () => this._trigger(this.props.onCanPlay),
				onCanPlayThrough: () => this._trigger(this.props.onCanPlayThrough)
			});
			
		}
		_initBeforeRender = () => {
			this._setupOptions();
			this._setupEvents();

			// Add key bindings focusInstance to 1st jPlayer instanced with key control enabled.
			if(this.props.keyEnabled && !util.focusInstance) {
				util.focusInstance = this;
			}

			// Now required types are known, finish the options default settings.
			if(this.props.video.require) {
				this.setState(state => addUniqueToArray(state, jPlayerActions.addUniqueToArray(constants.keys.PLAYER_CLASS, "jp-video")));
				if (this.props.sizeCssClass !== undefined) {
					this.setState(state => addUniqueToArray(state, jPlayerActions.addUniqueToArray(constants.keys.SIZE_CLASS, "jp-video-270p")));
				}

				if (this.props.sizeFullCssClass !== undefined) {
					this.setState(state => addUniqueToArray(state, jPlayerActions.addUniqueToArray(constants.keys.SIZE_FULL_CLASS, "jp-video-full")));
				}		
			} else {
				this.setState(state => addUniqueToArray(state, jPlayerActions.addUniqueToArray(constants.keys.PLAYER_CLASS, "jp-audio")));
			}

			this.sizeClass = this.props.fullScreen ? this.props.sizeFullCssClass : this.props.sizeCssClass;
			if (this.sizeClass !== undefined) {
				//this.props.updateOption("cssClass", sizeClass);
			}	

			this.setState(state => addUniqueToArray(state, jPlayerActions.addUniqueToArray(constants.keys.POSTER_CLASS, constants.classNames.HIDDEN)));
			this.props.updateOption("noVolume", util.uaBlocklist(this.props.noVolume));
			this.props.updateOption("noFullWindow", util.uaBlocklist(this.props.noFullWindow));
		}
		_initAfterRender = () => {
			// If html is not being used by this browser, then media playback is not possible. Trigger an error event.
			// if(!this.html.used) {
			// 	this._error({
			// 		type: constants.errors.NO_SOLUTION,
			// 		context: "{solution:'" + this.props.solution + "', supplied:'" + this.props.supplied.join(", ") + "'}",
			// 		message: constants.errorMessages.NO_SOLUTION,
			// 		hint: constants.errorHints.NO_SOLUTION
			// 	});
			// 	this.setState(state => removeFromArrayByValue(state, jPlayerActions.removeFromArrayByValue(constants.keys.NO_SOLUTION_CLASS, constants.classNames.HIDDEN);
			// } else {
			// 	this.setState(state => addUniqueToArray(state, jPlayerActions.addUniqueToArray(constants.keys.NO_SOLUTION_CLASS, this.props[constants.keys.NO_SOLUTION_CLASS], constants.classNames.HIDDEN);
			// }

			if(this.props.nativeVideoControls) {
				this.setState(state => removeFromArrayByValue(state, removeFromArrayByValue(constants.keys.VIDEO_CLASS, constants.classNames.HIDDEN)));
				this.setState({videoStyle: {
					//width: this.props.width, 
					//height: this.props.height
				}});
			} else {
				this.setState(state => addUniqueToArray(state, jPlayerActions.addUniqueToArray(constants.keys.VIDEO_CLASS, constants.classNames.HIDDEN)));
			}

			this.setState(state => addUniqueToArray(state, jPlayerActions.addUniqueToArray(constants.keys.VIDEO_PLAY_CLASS, constants.classNames.HIDDEN)));			
		}	
		_updateMediaStatus = (media, override) => {
			let ct = 0, cpa = 0, sp = 0, cpr = 0;

			const duration = media.duration;

			ct = media.currentTime;
			cpa = (duration > 0) ? 100 * ct / duration : 0;
			if((typeof media.seekable === "object") && (media.seekable.length > 0)) {
				sp = (duration > 0) ? 100 * media.seekable.end(media.seekable.length - 1) / duration : 100;
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
			this.props.updateOption("duration", media.duration);
			this.props.updateOption("videoWidth", media.videoWidth);
			this.props.updateOption("videoHeight", media.videoHeight);
			this.props.updateOption("playbackRate", media.playbackRate);
			this.props.updateOption("ended", media.ended);
		}
		_trigger = (func, error) => {
			var jPlayerOptions = {
				version: Object.assign({}, util.version),
				element: this.currentMedia,
				error: Object.assign({}, error)
			}

			if (func !== undefined) {
				func.bind(this)(jPlayerOptions);
			}
		}
		setMedia = (media) => {
			/*	media[format] = String: URL of format. Must contain all of the supplied option's video or audio formats.
			*	media.poster = String: Video poster URL.
			*	media.track = Array: Of objects defining the track element: kind, src, srclang, label, def.
			*	media.stream = Boolean: * NOT IMPLEMENTED * Designating actual media streams. ie., "false/undefined" for files.
			*/
			var	supported = false;

			this.clearMedia();

			// Convert all media URLs to absolute URLs.
			media = util.absoluteMediaUrls(media);

			for (var mediaSetting in this.mediaSettings) {
				const mediaConfig = this.mediaSettings[mediaSetting];

				for (var priority in mediaConfig.formats) {
					const format = mediaConfig.formats[priority];
					const isVideo = mediaSetting === "video";

					if(mediaConfig.playableFormat[format] && util.validString(media[format])) { // Format supported in solution and url given for format.
						if(isVideo) {
							this._setVideo(media);
							this.props.updateOption("video", true);
							this.setState(state => removeFromArrayByValue(state, jPlayerActions.removeFromArrayByValue(constants.keys.VIDEO_PLAY_CLASS, constants.classNames.HIDDEN)));
						} else {
							this._setAudio(media);

							this.props.updateOption("video", false);
							this.props.updateOption("media", media);
							this.setState(state => addUniqueToArray(state, jPlayerActions.addUniqueToArray(constants.keys.VIDEO_PLAY_CLASS, constants.classNames.HIDDEN)));
						}
						supported = true;
						break;
					}
				}
			}
			if(supported) {
				if(!(this.props.nativeVideoControls)) {
					// Set poster IMG if native video controls are not being used
					// Note: With IE the IMG onload event occurs immediately when cached.
					// Note: Poster hidden by default in clearMedia()
					if(util.validString(media.poster)) {
						//if(posterChanged) { // Since some browsers do not generate img onload event.
						this.props.updateOption("posterSrc", media.poster);
					//	} else {
						//	this.setState(state => removeFromArrayByValue(state, removeFromArrayByValue(constants.keys.POSTER_CLASS, constants.classNames.HIDDEN);
					//	}
					}
				}

				if(typeof media.title === 'string') {
					this.props.updateOption("titleText", media.title);
				}
				
				this.props.updateOption("srcSet", true);
				this.props.updateOption("paused", true);
			} else { // jPlayer cannot support any formats provided in this browser
				// Send an error event
				this._error( {
					type: constants.errors.NO_SUPPORT,
					context: "{supplied:'" + this.props.supplied.join(", ") + "'}",
					message: constants.errorMessages.NO_SUPPORT,
					hint: constants.errorHints.NO_SUPPORT
				});
			}
		}
		clearMedia = () => {
			this.props.updateOption("seeking", false);
			this.setState(state => addUniqueToArray(state, jPlayerActions.addUniqueToArray(constants.keys.POSTER_CLASS, constants.classNames.HIDDEN)));
			
			for (var key in statusDefaultValues) {
				this.props.updateOption(key, statusDefaultValues[key]);
			}

			if(!this.props.nativeVideoControls) {
				this.setState(state => addUniqueToArray(state, jPlayerActions.addUniqueToArray(constants.keys.VIDEO_CLASS, constants.classNames.HIDDEN)));
			}
			
			this.currentMedia.pause();
		}
		play = (time) => {
			if(this.props.srcSet) {
				
				this.currentMedia.play();
				if (!isNaN(time)) {
					this.currentMedia.currentTime = time;	
				}
			} else {
				this._urlNotSetError("play");
				this.props.updateOption("paused", true);
			}
		}
		pause = (time) => {
			if(this.props.srcSet) {
				this.currentMedia.pause();
				if (!isNaN(time)) {
					this.currentMedia.currentTime = time;
				}
			} else {
				this._urlNotSetError("pause");
			}
		}
		playHead = (percent) => {
			const limitedPercent = util.limitValue(percent, 0, 100);

			if(this.props.srcSet) {
				this.currentMedia.currentTime = percent * this.currentMedia.seekable.end(this.currentMedia.seekable.length-1) / 100;	
			} else {
				this._urlNotSetError("playHead");
			}
		}
		volume = (volume) => {
			volume = util.limitValue(volume, 0, 1);
			this.props.updateOption("volume", volume);
		}
		mute = (mute) => this.props.updateOption("muted", mute);
		duration = () => this.props.updateOption("remainingDuration", !this.props.remainingDuration)
		playbackRate = (playbackRate) => this.props.updateOption("playbackRate", util.limitValue(playbackRate, this.props.minPlaybackRate, this.props.maxPlaybackRate))
		incrementLoop = () => {
			var loopIndex = this.loopOptions.indexOf(this.props.loop || this.loopOptions[0]);

			if (loopIndex >= this.loopOptions.length - 1) {
				loopIndex = -1;
			}
			this.props.updateOption("loop", this.loopOptions[++loopIndex]);
		}
		_loop = () => this._trigger(this.props.onRepeat)
		_updateSize = () => {
			// Video html resized if necessary at this time, or if native video controls being used.
			if(this.props.video.available && (!this.props.waitForPlay || this.props.nativeVideoControls)) {
				this.setState({videoStyle: {
					//width: !this.props.width,
					//height: this.props.height
				}});
			}
		}
		fullScreen = (fullScreen) => {
			fullScreen ? screenfull.request(document.getElementById(this.props.jPlayerSelector)) : screenfull.exit();
			this.props.updateOption("fullScreen", fullScreen);
			// var wkv = util.nativeFeatures.fullscreen.used.webkitVideo;
			// if(!wkv || wkv && !this.props.waitForPlay) {
			// 	if(fullScreen) {
			// 		this._requestFullscreen();
			// 	} else {
			// 		this._exitFullscreen();
			// 	}
			// 	if(!wkv) {
			// 		this.props.updateOption("fullWindow", this.props.fullScreen);
			// 	}
			// }
		}
		// fullWindow = () => {
		// 	const sizeClass = this.props.fullWindow ? this.props.sizeFullCssClass : this.props.sizeCssClass;
		// 	this.setState(state => removeFromArrayByValue(state, removeFromArrayByValue(constants.keys.PLAYER_CLASS, this.props.cssClass);
		// 	this.setState(state => addUniqueToArray(state, jPlayerActions.addUniqueToArray(constants.keys.PLAYER_CLASS, this.stateClass[sizeClass]);
		// 	//this.props.updateOption("cssClass", sizeClass, () => this._trigger(this.props.onResize));		
		// }
		// _requestFullscreen = () => {
		// 	var e = document.querySelector(this.props.cssSelectorAncestor),
		// 		fs = util.nativeFeatures.fullscreen;

		// 	// This method needs the video element. For iOS and Android.
		// 	if(fs.used.webkitVideo) {
		// 		e = this.currentMedia;
		// 	}

		// 	if(fs.api.fullscreenEnabled) {
		// 		fs.api.requestFullscreen(e);
		// 	}
		// }
		// _exitFullscreen = () => {
		// 	var fs = util.nativeFeatures.fullscreen,
		// 		e;

		// 	// This method needs the video element. For iOS and Android.
		// 	if(fs.used.webkitVideo) {
		// 		e = this.video.element();
		// 	}

		// 	if(fs.api.fullscreenEnabled) {
		// 		fs.api.exitFullscreen(e);
		// 	}
		// }
		_initMedia = (media) => {
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

			this.props.updateOption("tracks", tracks);
		}
		_setFormat = (media) => {
			for (var mediaSetting in this.mediaSettings) {
				const mediaConfig = this.mediaSettings[mediaSetting];

				for (var priority in mediaConfig.formats) {
					var format = mediaConfig.formats[priority];

					if(mediaConfig.playableFormat[format] && media[format]) {
						this.props.updateOption("src", media[format]);
						this.props.updateOption("formatType", format);
						this.props.updateOption("format", {[format]: true});
						break;
					}
				}
			}
			this._initMedia(media);
		}
		_setAudio = (media) => this._setFormat(media)
		_setVideo = (media) => {
			this._setFormat(media);
			if(this.props.nativeVideoControls) {
				this.video.element().poster = util.validString(media.poster) ? media.poster : "";
			}
		}
		_urlNotSetError = (context) => {
			this._error({
				type: constants.errors.URL_NOT_SET,
				context: context,
				message: constants.errorMessages.URL_NOT_SET,
				hint: constants.errorHints.URL_NOT_SET
			});
		}
		_error = (error) => this._trigger(this.props.onError, error);
		// updateOnOptionsChanged = (key) => {
		// 	switch (key) {
		// 		case "noVolume":
		// 			this._updateMute();
		// 			this.props.updateOption("noVolume", util.uaBlocklist(this.props.noVolume));
		// 			break;
		// 		// case "keyEnabled":
		// 		// 	if(!value && this === util.focusInstance) {
		// 		// 		util.focusInstance = null;
		// 		// 	}
		// 		// 	break;
		// 		default:
		// 			break;
		// 	}	
		// }
		onPosterLoad = () => {
			if(!this.props.video.available) {
				this.setState(state => removeFromArrayByValue(state, removeFromArrayByValue(constants.keys.POSTER_CLASS, constants.classNames.HIDDEN)));
			}
		}
		setMediaRef = (ref) => this.currentMedia = ref;
		componentWillMount() {			
			this._initBeforeRender();
		}
		componentDidMount() {
			this.props.updateOption("playbackRateEnabled", util.testPlaybackRate(this.currentMedia));  
			this._initAfterRender();
		}
		componentWillReceiveProps(nextProps) {
			// if (prevProps.width !== nextProps.width || prevProps.height !== nextProps.height) {
			// 	this.setState({playerStyle: {width: nextProps.width, height: nextProps.height}});
			// }
			//Using the audio element capabilities for playbackRate. ie., Assuming video element is the same.
			if(nextProps.playbackRateEnabled) {
				this.currentMedia.defaultPlaybackRate = nextProps.defaultPlaybackRate;
				this.currentMedia.playbackRate = nextProps.playbackRate;
			}

			if (nextProps.src !== this.props.src) {
				this.currentMedia.src = nextProps.src;
			}

			this.currentMedia.volume = nextProps.volume;
			this.currentMedia.muted = nextProps.muted;
			this.currentMedia.autoplay = nextProps.autoplay;
			this.currentMedia.loop = nextProps.loop === "loop" ? true : false;
		}
		render() {
			return (
				<Player cssSelectorAncestor={this.props.cssSelectorAncestor} sizeClass={this.sizeClass} paused={this.props.paused} noFullWindow={this.props.noFullWindow}
				fullWindow={this.props.fullWindow} noVolume={this.props.noVolume} muted={this.props.muted} seeking={this.props.seeking} loop={this.props.loop} shuffled={this.props.shuffled}>
					<WrappedComponent>
						<div className={"jp-jplayer"} style={this.state.playerStyle}>
							<Poster video={this.mediaSettings.video} posterClass={this.state[constants.keys.POSTER_CLASS].join(" ")} src={this.props.posterSrc} onClick={this.props.posterOnClick} 
								onLoad={this.onPosterLoad} />					
							<Audio mediaRef={this.setMediaRef} require={this.mediaSettings.audio.require} events={this.props.mediaEvent}>
								{this.props.tracks}
							</Audio>
							<Video mediaRef={this.setMediaRef} require={this.mediaSettings.video.require} events={this.props.mediaEvent}>
								{this.props.tracks}
								{/*<NativeVideoControls />*/}
							</Video>
						</div>
						<BrowserUnsupported noSolutionClass={this.state.noSolutionClass} />
					</WrappedComponent>
				</Player>
			);
		}
	}
)

const statusDefaultValues = {
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
    ended: 0,
    src: ""
};

export const jPlayerDefaultValues = {
    cssSelectorAncestor: "jp_container_1",
    jPlayerSelector: "jplayer_1",
    preload: "metadata", // HTML5 Spec values: none, metadata, auto.	
    captureDuration: true, // When true, clicks on the duration are captured and no longer propagate up the DOM.	
    minPlaybackRate: 0.5,
    maxPlaybackRate: 4,
    controls: {},
    supplied: ["mp3"], // Defines which formats jPlayer will try and support and the priority by the order. 1st is highest,
    loopOptions: ["loop-playlist"],
    playbackRate: 1.0,
    defaultPlaybackRate: 1.0,		
    volume: 0.8, // The volume. Number 0 to 1.
    ...statusDefaultValues
};