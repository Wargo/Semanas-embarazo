define(
	["Ti/_/browser", "Ti/_/css", "Ti/_/declare", "Ti/_/dom", "Ti/_/event", "Ti/_/lang", "Ti/_/style", "Ti/_/Evented",
	"Ti/UI", "Ti/_/Gestures/DoubleTap","Ti/_/Gestures/LongPress","Ti/_/Gestures/Pinch","Ti/_/Gestures/SingleTap",
	"Ti/_/Gestures/Swipe","Ti/_/Gestures/TouchCancel","Ti/_/Gestures/TouchEnd","Ti/_/Gestures/TouchMove",
	"Ti/_/Gestures/TouchStart","Ti/_/Gestures/TwoFingerTap"],
	function(browser, css, declare, dom, event, lang, style, Evented, UI,
		DoubleTap, LongPress, Pinch, SingleTap, Swipe, TouchCancel, TouchEnd, TouchMove, TouchStart, TwoFingerTap) {

	var undef,
		unitize = dom.unitize,
		computeSize = dom.computeSize,
		on = require.on,
		setStyle = style.set,
		isDef = lang.isDef,
		val = lang.val,
		is = require.is,
		transitionEvents = {
			webkit: "webkitTransitionEnd",
			trident: "msTransitionEnd",
			gecko: "transitionend",
			presto: "oTransitionEnd"
		},
		transitionEnd = transitionEvents[browser.runtime] || "transitionEnd",
		curves = ["ease", "ease-in", "ease-in-out", "ease-out", "linear"],
		postDoBackground = {
			post: "_doBackground"
		},
		postLayoutProp = {
			post: function() {
				this._parent && this._parent._triggerLayout();
			}
		};

	return declare("Ti._.UI.Element", Evented, {

		domType: null,
		domNode: null,
		_alive: 1,

		constructor: function(args) {
			var self = this,

				node = this.domNode = this._setFocusNode(dom.create(this.domType || "div", {
					className: "TiUIElement " + css.clean(this.declaredClass),
					"data-widget-id": this.widgetId
				})),

				// Handle click/touch/gestures
				recognizers = this._gestureRecognizers = {
					Pinch: new Pinch,
					Swipe: new Swipe,
					TwoFingerTap: new TwoFingerTap,
					DoubleTap: new DoubleTap,
					LongPress: new LongPress,
					SingleTap: new SingleTap,
					TouchStart: new TouchStart,
					TouchEnd: new TouchEnd,
					TouchMove: new TouchMove,
					TouchCancel: new TouchCancel
				},

				// Each event could require a slightly different precedence of execution, which is why we have these separate lists.
				// For now they are the same, but I suspect they will be different once the android-iphone parity is determined.
				touchRecognizers = {
					Start: recognizers,
					Move: recognizers,
					End: recognizers,
					Cancel: recognizers
				},

				useTouch = "ontouchstart" in window,
				bg = lang.hitch(this, "_doBackground");

			require.has("devmode") && args && args._debug && dom.attr.set(node, "data-debug", args._debug);

			function processTouchEvent(eventType, evt) {
				var i,
					gestureRecognizers = touchRecognizers[eventType],
					eventType = "Touch" + eventType + "Event",
					touches = evt.changedTouches;
				if (this._preventDefaultTouchEvent) {
					this._preventDefaultTouchEvent && evt.preventDefault && evt.preventDefault();
					for (i in touches) {
						touches[i].preventDefault && touches[i].preventDefault();
					}
				}
				useTouch || require.mix(evt, {
					touches: evt.type === "mouseup" ? [] : [evt],
					targetTouches: [],
					changedTouches: [evt]
				});
				for (i in gestureRecognizers) {
					gestureRecognizers[i]["process" + eventType](evt, self);
				}
				for (i in gestureRecognizers) {
					gestureRecognizers[i]["finalize" + eventType]();
				}
			}

			this._touching = false;

			on(this.domNode, useTouch ? "touchstart" : "mousedown", function(evt){
				var handles = [
					on(window, useTouch ? "touchmove" : "mousemove", function(evt){
						(useTouch || self._touching) && processTouchEvent("Move", evt);
					}),
					on(window, useTouch ? "touchend" : "mouseup", function(evt){
						self._touching = false;
						processTouchEvent("End", evt);
						event.off(handles);
					}),
					useTouch && on(window, "touchcancel", function(evt){
						processTouchEvent("Cancel", evt);
						event.off(handles);
					})
				];
				self._touching = true;
				processTouchEvent("Start", evt);
			});

			this.addEventListener("touchstart", bg);
			this.addEventListener("touchend", bg);

			// TODO: mixin JSS rules (http://jira.appcelerator.org/browse/TIMOB-6780)
		},

		destroy: function() {
			if (this._alive) {
				this.parent && this.parent.remove(this);
				if (this.domNode) {
					dom.destroy(this.domNode);
					this.domNode = null;
				}
			}
			Evented.destroy.apply(this, arguments);
		},
		
		_markedForLayout: false,
		
		_triggerLayout: function(force) {
			
			if (this._markedForLayout && !force) {
				return;
			}
			
			// If this element is not attached to an active window, skip the calculation
			var isAttachedToActiveWin = false,
				node = this;
			while(node) {
				if (node === UI._container) {
					isAttachedToActiveWin = true;
					break;
				}
				node = node._parent;
			}
			if (!isAttachedToActiveWin) {
				return;
			}
			
			// Find the top most node that needs to be layed out.
			var rootLayoutNode = this;
			while(rootLayoutNode._parent != null && rootLayoutNode._hasAutoDimensions()) {
				rootLayoutNode = rootLayoutNode._parent;
			}
			rootLayoutNode._markedForLayout = true;
			
			// Let the UI know that a layout needs to be performed.
			UI._triggerLayout(force);
		},
		
		_triggerParentLayout: function() {
			this._parent && this._parent._triggerLayout();
		},
		
		_hasAutoDimensions: function() {
			return (this.width === "auto" || (!isDef(this.width) && this._defaultWidth === "auto")) || 
				(this.height === "auto" || (!isDef(this.height) && this._defaultHeight === "auto"));
		},

		_doLayout: function(originX, originY, parentWidth, parentHeight, centerHDefault, centerVDefault) {
			this._originX = originX;
			this._originY = originY;
			this._centerHDefault = centerHDefault;
			this._centerVDefault = centerVDefault;

			var dimensions = this._computeDimensions(
					parentWidth,
					parentHeight,
					this.left,
					this.top,
					this.right,
					this.bottom,
					this.center && this.center.x,
					this.center && this.center.y,
					this.width,
					this.height,
					this.borderWidth
				),
				styles;

			// Set and store the dimensions
			styles = {
				zIndex: this.zIndex | 0
			};
			if (this._measuredLeft != dimensions.left) {
				this._measuredLeft = dimensions.left;
				isDef(this._measuredLeft) && (styles.left = unitize(this._measuredLeft));
			}
			if (this._measuredTop != dimensions.top) {
				this._measuredTop = dimensions.top
				isDef(this._measuredTop) && (styles.top = unitize(this._measuredTop));
			}
			if (this._measuredWidth != dimensions.width) {
				this._measuredWidth = dimensions.width
				isDef(this._measuredWidth) && (styles.width = unitize(this._measuredWidth));
			}
			if (this._measuredHeight != dimensions.height) {
				this._measuredHeight = dimensions.height
				isDef(this._measuredHeight) && (styles.height = unitize(this._measuredHeight));
			}
			this._measuredRightPadding = dimensions.rightPadding;
			this._measuredBottomPadding = dimensions.bottomPadding;
			this._measuredBorderWidth = dimensions.borderWidth;
			setStyle(this.domNode, styles);
			
			this._markedForLayout = false;
			
			// Run the post-layout animation, if needed
			if (this._doAnimationAfterLayout) {
				this._doAnimationAfterLayout = false;
				this._doAnimation();
			}
		},

		_computeDimensions: function(parentWidth, parentHeight, left, top, originalRight, originalBottom, centerX, centerY, width, height, borderWidth) {
			
			// Compute as many sizes as possible, should be everything except auto
			left = computeSize(left, parentWidth, 1);
			top = computeSize(top, parentHeight, 1);
			originalRight = computeSize(originalRight, parentWidth);
			originalBottom = computeSize(originalBottom, parentHeight);
			centerX = centerX && computeSize(centerX, parentWidth, 1);
			centerY = centerY && computeSize(centerY, parentHeight, 1);
			width = computeSize(width, parentWidth);
			height = computeSize(height, parentHeight);

			// Convert right/bottom coordinates to be with respect to (0,0)
			var right = isDef(originalRight) ? (parentWidth - originalRight) : undef,
				bottom = isDef(originalBottom) ? (parentHeight - originalBottom) : undef;

			// Unfortunately css precidence doesn't match the titanium, so we have to handle precedence and default setting ourselves
			if (isDef(width)) {
				if (isDef(left)) {
					right = undef;
				} else if (isDef(centerX)){
					if (width === "auto") {
						left = "calculateAuto";
					} else {
						left = centerX - width / 2;
						right = undef;
					}
				} else if (isDef(right)) {
					// Do nothing
				} else {
					// Set the default position
					left = "calculateAuto";
				}
			} else {
				if (isDef(centerX)) {
					if (isDef(left)) {
						width = (centerX - left) * 2;
						right = undef;
					} else if (isDef(right)) {
						width = (right - centerX) * 2;
					} else {
						// Set the default width
						width = computeSize(this._defaultWidth,parentWidth);
					}
				} else {
					if (isDef(left) && isDef(right)) {
						// Do nothing
					} else {
						width = computeSize(this._defaultWidth,parentWidth);
						if(!isDef(left) && !isDef(right)) {
							// Set the default position
							left = "calculateAuto";
						}
					}
				}
			}
			if (isDef(height)) {
				if (isDef(top)) {
					bottom = undef;
				} else if (isDef(centerY)){
					if(height === "auto") {
						top = "calculateAuto";
					} else {
						top = centerY - height / 2;
						bottom = undef;
					}
				} else if (isDef(bottom)) {
					// Do nothing
				} else {
					// Set the default position
					top = "calculateAuto";
				}
			} else {
				if (isDef(centerY)) {
					if (isDef(top)) {
						height = (centerY - top) * 2;
						bottom = undef;
					} else if (isDef(bottom)) {
						height = (bottom - centerY) * 2;
					} else {
						// Set the default height
						height = computeSize(this._defaultHeight,parentHeight);
					}
				} else {
					if (isDef(top) && isDef(bottom)) {
						// Do nothing
					} else {
						// Set the default height
						height = computeSize(this._defaultHeight,parentHeight);
						if(!isDef(top) && !isDef(bottom)) {
							// Set the default position
							top = "calculateAuto";
						}
					}
				}
			}

			// Calculate the width/left properties if width is NOT auto
			var borderWidth = computeSize(borderWidth),
				calculateWidthAfterAuto = false,
				calculateHeightAfterAuto = false;
			borderWidth = is(borderWidth,"Number") ? borderWidth: 0;
			if (width != "auto") {
				if (isDef(right)) {
					if (isDef(left)) {
						width = right - left;
					} else {
						left = right - width;
					}
				}
				width -= borderWidth * 2;
			} else if(isDef(right)) {
				calculateWidthAfterAuto = true;
			}
			if (height != "auto") {
				if (isDef(bottom)) {
					if (isDef(top)) {
						height = bottom - top;
					} else {
						top = bottom - height;
					}
				}
				height -= borderWidth * 2;
			} else if(isDef(bottom)) {
				calculateHeightAfterAuto = true;
			}

			// TODO change this once we re-architect the inheritence so that widgets don't have add/remove/layouts
			if (this._getContentWidth) {
				width == "auto" && (width = this._getContentWidth());
				height == "auto" && (height = this._getContentHeight());
			} else {
				var computedSize = this._layout._doLayout(this,is(width,"Number") ? width : parentWidth,is(height,"Number") ? height : parentHeight);
				width == "auto" && (width = computedSize.width);
				height == "auto" && (height = computedSize.height);
			}
			
			if (calculateWidthAfterAuto) {
				if (isDef(right)) {
					if (isDef(left)) {
						width = right - left;
					} else {
						left = right - width;
					}
				}
				width -= borderWidth * 2;
			}
			if (calculateHeightAfterAuto) {
				if (isDef(bottom)) {
					if (isDef(top)) {
						height = bottom - top;
					} else {
						top = bottom - height;
					}
				}
				height -= borderWidth * 2;
			}

			// Set the default top/left if need be
			if (left == "calculateAuto") {
				left = this._centerHDefault && parentWidth !== "auto" ? computeSize("50%",parentWidth) - (is(width,"Number") ? width + borderWidth * 2 : 0) / 2 : 0;
			}
			if (top == "calculateAuto") {
				top = this._centerVDefault && parentHeight !== "auto" ? computeSize("50%",parentHeight) - (is(height,"Number") ? height + borderWidth * 2 : 0) / 2 : 0;
			}

			// Apply the origin and border width
			left += this._originX;
			top += this._originY;
			var rightPadding = is(originalRight,"Number") ? originalRight : 0,
				bottomPadding = is(originalBottom,"Number") ? originalBottom : 0;

			if(!is(left,"Number") || !is(top,"Number") || !is(rightPadding,"Number")
				 || !is(bottomPadding,"Number") || !is(width,"Number") || !is(height,"Number")) {
			 	throw "Invalid layout";
			}

			return {
				left: left,
				top:top,
				rightPadding: rightPadding,
				bottomPadding: bottomPadding,
				width: width,
				height: height,
				borderWidth: borderWidth
			};
		},

		// This method returns the offset of the content relative to the parent's location. 
		// This is useful for controls like ScrollView that can move the children around relative to itself.
		_getContentOffset: function(){
			return {x: 0, y: 0};
		},
		
		_preventDefaultTouchEvent: true,

		_isGestureBlocked: function(gesture) {
			for (var recognizer in this._gestureRecognizers) {
				var blockedGestures = this._gestureRecognizers[recognizer].blocking;
				for (var blockedGesture in blockedGestures) {
					if (gesture === blockedGestures[blockedGesture]) {
						return true;
					}
				}
			}
			return false;
		},

		_handleTouchEvent: function(type, e) {
			this.enabled && this.fireEvent(type, e);
		},

		_doBackground: function(evt) {
			var evt = evt || {},
				m = (evt.type || "").match(/mouse(over|out)/),
				node = this._focus.node,
				bi = this.backgroundImage || "none",
				bc = this.backgroundColor;

			if (this._touching) {
				bc = this.backgroundSelectedColor || bc;
				bi = this.backgroundSelectedImage || bi;
			}

			m && (this._over = m[1] === "over");
			if (!this._touching && this.focusable && this._over) {
				bc = this.backgroundFocusedColor || bc;
				bi = this.backgroundFocusedImage || bi;
			}

			if (!this.enabled) {
				bc = this.backgroundDisabledColor || bc;
				bi = this.backgroundDisabledImage || bi;
			}

			setStyle(node, {
				backgroundColor: bc || (bi && bi !== "none" ? "transparent" : ""),
				backgroundImage: style.url(bi)
			});
		},

		_setFocusNode: function(node) {
			var f = this._focus = this._focus || {};

			if (f.node !== node) {
				if (f.node) {
					event.off(f.evts);
					event.off(f.evtsMore);
				}
				f.node = node;
				f.evts = [
					on(node, "focus", this, "_doBackground"),
					on(node, "blur", this, "_doBackground") /*,
					on(node, "mouseover", this, function() {
						this._doBackground();
						f.evtsMore = [
							on(node, "mousemove", this, "_doBackground"),
							on(node, "mouseout", this, function() {
								this._doBackground();
								event.off(f.evtsMore);
								f.evtsMore = [];
							})
						];
					})*/
				];
			}

			return node;
		},

		show: function() {
			this.visible = true;
			//this.fireEvent("ti:shown");
		},

		hide: function() {
			this.visible = false;
			//obj.fireEvent("ti:hidden");
		},

		animate: function(anim, callback) {
			this._animationData = anim;
			this._animationCallback = callback;
			
			if (UI._layoutInProgress) {
				this._doAnimationAfterLayout = true;
			} else {
				this._doAnimation();
			}
		},
		
		_doAnimation: function() {
			
			var anim = this._animationData || {},
				callback = this._animationCallback;
				curve = curves[anim.curve] || "ease",
				fn = lang.hitch(this, function() {
					var transformCss = "";

					// Set the color and opacity properties
					anim.backgroundColor !== undef && (obj.backgroundColor = anim.backgroundColor);
					anim.opacity !== undef && setStyle(this.domNode, "opacity", anim.opacity);
					setStyle(this.domNode, "display", anim.visible !== undef && !anim.visible ? "none" : "");

					// Set the position and size properties
					var dimensions = this._computeDimensions(
						this._parent ? this._parent._measuredWidth : "auto", 
						this._parent ? this._parent._measuredHeight : "auto", 
						val(anim.left, this.left),
						val(anim.top, this.top),
						val(anim.right, this.right),
						val(anim.bottom, this.bottom),
						isDef(anim.center) ? anim.center.x : isDef(this.center) ? this.center.x : undef,
						isDef(anim.center) ? anim.center.y : isDef(this.center) ? this.center.y : undef,
						val(anim.width, this.width),
						val(anim.height, this.height),
						val(anim.borderWidth, this.borderWidth)
					);

					setStyle(this.domNode, {
						left: unitize(dimensions.left),
						top: unitize(dimensions.top),
						width: unitize(dimensions.width),
						height: unitize(dimensions.height),
						borderWidth: unitize(dimensions.borderWidth)
					});

					// Set the z-order
					!isDef(anim.zIndex) && setStyle(this.domNode, "zIndex", anim.zIndex);

					// Set the transform properties
					if (anim.transform) {
						this._curTransform = this._curTransform ? this._curTransform.multiply(anim.transform) : anim.transform;
						transformCss = this._curTransform.toCSS();
					}

					setStyle(this.domNode, "transform", transformCss);
				});

			anim.duration = anim.duration || 0;
			anim.delay = anim.delay || 0;
			anim.transform && setStyle("transform", "");
			anim.start && anim.start();

			if (anim.duration > 0) {
				// Create the transition, must be set before setting the other properties
				setStyle(this.domNode, "transition", "all " + anim.duration + "ms " + curve + (anim.delay ? " " + anim.delay + "ms" : ""));
				on.once(window, transitionEnd, lang.hitch(this, function(e) {
					if (!this._destroyed) {
						// Clear the transform so future modifications in these areas are not animated
						setStyle(this.domNode, "transition", "");
						is(anim.complete, "Function") && anim.complete();
						is(callback, "Function") && callback();
					}
				}));
				setTimeout(fn, 0);
			} else {
				fn();
				is(anim.complete, "Function") && anim.complete();
				is(callback, "Function") && callback();
			}
		},

		_setTouchEnabled: function(value) {
			setStyle(this.domNode, "pointerEvents", value ? "auto" : "none");
			if (!value) {
				for (var i in this.children) {
					this.children[i]._setTouchEnabled(value);
				}
			}
		},

		_measuredLeft: 0,
		_measuredTop: 0,
		_measuredRightPadding: 0,
		_measuredBottomPadding: 0,
		_measuredWidth: 0,
		_measuredHeight: 0,

		properties: {
			backgroundColor: postDoBackground,

			backgroundDisabledColor: postDoBackground,

			backgroundDisabledImage: postDoBackground,

			backgroundFocusedColor: postDoBackground,

			backgroundFocusedImage: postDoBackground,

			backgroundGradient: {
				set: function(value) {
					var value = value || {},
						output = [],
						colors = value.colors || [],
						type = value.type,
						start = value.startPoint,
						end = value.endPoint;

					if (type === "linear") {
						start && end && start.x != end.x && start.y != end.y && output.concat([
							unitize(value.startPoint.x) + " " + unitize(value.startPoint.y),
							unitize(value.endPoint.x) + " " + unitize(value.startPoint.y)
						]);
					} else if (type === "radial") {
						start = value.startRadius;
						end = value.endRadius;
						start && end && output.push(unitize(start) + " " + unitize(end));
						output.push("ellipse closest-side");
					} else {
						setStyle(this.domNode, "backgroundImage", "none");
						return;
					}

					require.each(colors, function(c) {
						output.push(c.color ? c.color + " " + (c.position * 100) + "%" : c);
					});

					output = type + "-gradient(" + output.join(",") + ")";

					require.each(require.config.vendorPrefixes.css, function(p) {
						setStyle(this.domNode, "backgroundImage", p + output);
					});

					return value;
				}
			},

			backgroundImage: postDoBackground,

			backgroundSelectedColor: postDoBackground,

			backgroundSelectedImage: postDoBackground,

			borderColor: {
				set: function(value) {
					if (setStyle(this.domNode, "borderColor", value)) {
						this.borderWidth | 0 || (this.borderWidth = 1);
						setStyle(this.domNode, "borderStyle", "solid");
					} else {
						this.borderWidth = 0;
					}
					return value;
				}
			},

			borderRadius: {
				set: function(value) {
					setStyle(this.domNode, "borderRadius", unitize(value));
					return value;
				}
			},

			borderWidth: {
				set: function(value) {
					var s = {
						borderWidth: unitize(value),
						borderStyle: "solid"
					};
					this.borderColor || (s.borderColor = "black");
					setStyle(this.domNode, s);
					return value;
				}
			},

			bottom: postLayoutProp,

			center: postLayoutProp,

			color: {
				set: function(value) {
					return setStyle(this.domNode, "color", value);
				}
			},

			enabled: {
				post: "_doBackground",
				set: function(value) {
					this._focus.node.disabled = !value;
					return value;
				},
				value: true
			},

			focusable: {
				value: false,
				set: function(value) {
					dom.attr[value ? "add" : "remove"](this._focus.node, "tabindex", 0);
					return value;
				}
			},

			height: postLayoutProp,

			left: postLayoutProp,

			opacity: {
				set: function(value) {
					return setStyle(this.domNode, "opacity", value);
				}
			},

			visible: {
				set: function(value, orig) {
					if (value !== orig) {
						!value && (this._lastDisplay = style.get(this.domNode, "display"));
						setStyle(this.domNode, "display", !!value ? this._lastDisplay || "" : "none");
						!!value && this._triggerLayout();
					}
					return value;
				}
			},

			right: postLayoutProp,

			size: {
				set: function(value) {
					console.debug('Property "Titanium._.UI.Element#.size" is not implemented yet.');
					return value;
				}
			},

			touchEnabled: {
				set: function(value) {
					this._setTouchEnabled(value);
					return value;
				},
				value: true
			},

			top: postLayoutProp,

			transform: {
				set: function(value) {
					setStyle(this.domNode, "transform", value.toCSS());
					return this._curTransform = value;
				}
			},

			width: postLayoutProp,

			zIndex: postLayoutProp
		}

	});

});