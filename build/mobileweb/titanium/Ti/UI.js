define(
	["Ti/_/Evented", "Ti/_/lang", "Ti/_/ready", "Ti/_/style"],
	function(Evented, lang, ready, style) {

	var body = document.body,
		isIOS = /(iPhone|iPad)/.test(navigator.userAgent),
		modules = "2DMatrix,ActivityIndicator,AlertDialog,Animation,Button,EmailDialog,ImageView,Label,OptionDialog,ScrollableView,ScrollView,Slider,Switch,Tab,TabGroup,TableView,TableViewRow,TableViewSection,TextArea,TextField,View,WebView,Window",
		creators = {},
		setStyle = style.set;

	body.addEventListener('touchmove', function(e) {
		e.preventDefault();
	}, false);

	require.each(modules.split(','), function(name) {
		creators['create' + name] = function(args) {
			var m = require("Ti/UI/" + name);
			return new m(args);
		};
	});

	function hideAddressBar() {
		var x = 0;
		if (isIOS && !window.location.hash) {
			if (document.height <= window.outerHeight + 10) {
				setStyle(body, "height", (window.outerHeight + 60) + "px");
				x = 50;
			}
			setTimeout(function() {
				window.scrollTo(0, 1);
				window.scrollTo(0, 0);
				Ti.UI._recalculateLayout();
			}, x);
		}
	}

	if (isIOS) {
		ready(hideAddressBar);
		window.addEventListener("orientationchange", hideAddressBar);
	}

	ready(10, function() {
		body.appendChild((Ti.UI._container = Ti.UI.createView({
			left: 0,
			top: 0
		})).domNode);
		setStyle(Ti.UI._container.domNode,"overflow","hidden");
		Ti.UI._recalculateLayout();
	});

	require.on(window, "resize", function() {
		Ti.UI._recalculateLayout();
	});

	return lang.setObject("Ti.UI", Evented, creators, {

		_addWindow: function(win, set) {
			this._container.add(win);
			set && this._setWindow(win);
			return win;
		},

		_setWindow: function(win) {
			this.constants.currentWindow = win;
		},

		_removeWindow: function(win) {
			this._container.remove(win);
			return win;
		},
		
		_triggerLayout: function(force) {
			if (force) {
				clearTimeout(this._layoutTimer);
				this._layoutMarkedNodes(this._container);
				this._layoutInProgress = false;
			} else {
				if (!this._layoutInProgress) {
					this._layoutInProgress = true;
					this._layoutTimer = setTimeout(lang.hitch(this, function(){
						this._layoutMarkedNodes(this._container);
						this._layoutInProgress = false;
						this._layoutTimer = null;
					}), 25);
				}
			}
		},
		
		_layoutMarkedNodes: function(node) {
			if (node._markedForLayout) {
				node._layout && node._layout._doLayout(node, node._measuredWidth, node._measuredHeight);
			} else {
				for (var i in node.children) {
					this._layoutMarkedNodes(node.children[i]);
				}
				// Run the post-layout animation, if needed
				if (node._doAnimationAfterLayout) {
					node._doAnimationAfterLayout = false;
					node._doAnimation();
				}
			}
		},
		
		_recalculateLayout: function() {
			this._container.width = window.innerWidth;
			this._container.height = window.innerHeight;
			this._container._doLayout(0, 0, window.innerWidth, window.innerHeight, true, true);
		},

		properties: {
			backgroundColor: {
				set: function(value) {
					return setStyle(body, "backgroundColor", value);
				}
			},
			backgroundImage: {
				set: function(value) {
					return setStyle(body, "backgroundImage", value ? style.url(value) : "");
				}
			},
			currentTab: {
				get: function() {
					return (this.currentWindow || {}).activeTab;
				},
				set: function(value) {
					return (this.currentWindow || {}).activeTab = value;
				}
			}
		},

		constants: {
			currentWindow: undefined,
			UNKNOWN: 0,
			FACE_DOWN: 1,
			FACE_UP: 2,
			PORTRAIT: 3,
			UPSIDE_PORTRAIT: 4,
			LANDSCAPE_LEFT: 5,
			LANDSCAPE_RIGHT: 6,
			INPUT_BORDERSTYLE_NONE: 0,
			INPUT_BORDERSTYLE_LINE: 1,
			INPUT_BORDERSTYLE_BEZEL: 2,
			INPUT_BORDERSTYLE_ROUNDED: 3,
			INPUT_BUTTONMODE_ALWAYS: 1,
			INPUT_BUTTONMODE_NEVER: 0,
			INPUT_BUTTONMODE_ONBLUR: 0,
			INPUT_BUTTONMODE_ONFOCUS: 1,
			KEYBOARD_APPEARANCE_ALERT: 1,
			KEYBOARD_APPEARANCE_DEFAULT: 0,
			KEYBOARD_ASCII: 1,
			KEYBOARD_DEFAULT: 2,
			KEYBOARD_EMAIL: 3,
			KEYBOARD_NAMEPHONE_PAD: 4,
			KEYBOARD_NUMBERS_PUNCTUATION: 5,
			KEYBOARD_NUMBER_PAD: 6,
			KEYBOARD_PHONE_PAD: 7,
			KEYBOARD_URL: 8,
			NOTIFICATION_DURATION_LONG: 1,
			NOTIFICATION_DURATION_SHORT: 2,
			PICKER_TYPE_COUNT_DOWN_TIMER: 1,
			PICKER_TYPE_DATE: 2,
			PICKER_TYPE_DATE_AND_TIME: 3,
			PICKER_TYPE_PLAIN: 4,
			PICKER_TYPE_TIME: 5,
			RETURNKEY_DEFAULT: 0, // return
			RETURNKEY_DONE: 1, // Done
			RETURNKEY_EMERGENCY_CALL: 2, // Emergency Call
			RETURNKEY_GO: 3, // Go
			RETURNKEY_GOOGLE: 4, // Search
			RETURNKEY_JOIN: 5, // Join
			RETURNKEY_NEXT: 6, // Next
			RETURNKEY_ROUTE: 7, // Route
			RETURNKEY_SEARCH: 8, // Search
			RETURNKEY_SEND: 9, // Send
			RETURNKEY_YAHOO: 10, // Search
			TEXT_ALIGNMENT_CENTER: 1,
			TEXT_ALIGNMENT_RIGHT: 2,
			TEXT_ALIGNMENT_LEFT: 3,
			TEXT_AUTOCAPITALIZATION_ALL: 3,
			TEXT_AUTOCAPITALIZATION_NONE: 0,
			TEXT_AUTOCAPITALIZATION_SENTENCES: 2,
			TEXT_AUTOCAPITALIZATION_WORDS: 1,
			TEXT_VERTICAL_ALIGNMENT_BOTTOM: 2,
			TEXT_VERTICAL_ALIGNMENT_CENTER: 1,
			TEXT_VERTICAL_ALIGNMENT_TOP: 3,
			ANIMATION_CURVE_EASE_IN: 1,
			ANIMATION_CURVE_EASE_IN_OUT: 2,
			ANIMATION_CURVE_EASE_OUT: 3,
			ANIMATION_CURVE_LINEAR: 4
		}

	});

});