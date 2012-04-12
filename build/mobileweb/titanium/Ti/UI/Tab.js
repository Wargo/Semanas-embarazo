define(["Ti/_/declare", "Ti/_/lang", "Ti/UI/View", "Ti/_/dom"],
	function(declare, lang, View, dom) {

	return declare("Ti.UI.Tab", View, {

		constructor: function(args) {
			this._windows = [];

			this._contentContainer = dom.create("div", {
				className: "TiUIButtonContentContainer",
				style: {
					width: "100%",
					height: "100%",
					display: ["-webkit-box", "-moz-box"],
					boxOrient: "horizontal",
					boxPack: "center",
					boxAlign: "center"
				}
			}, this.domNode);

			this._tabIcon = dom.create("img", {
				className: "TiUIButtonImage"
			}, this._contentContainer);

			this._tabTitle = dom.create("div", {
				className: "TiUIButtonTitle",
				style: {
					whiteSpace: "nowrap"
				}
			}, this._contentContainer);

			require.on(this.domNode, "click", this, function(e) {
				this._tabGroup && this._tabGroup.setActiveTab(this);
			});
		},

		open: function(win, args) {
			win = win || this.window;
			this._windows.push(win);
			win.activeTab = this;

			// Apply a background if one is not already set
			lang.isDef(win.backgroundColor) || (win.backgroundColor = "white");

			// Open the window and animate it in
			var originalOpacity = lang.isDef(win.opacity) ? win.opacity : 1;
			win.opacity = 0;
			win.open(args);
			win.animate({opacity: originalOpacity, duration: 250}, function(){
				win.opacity = originalOpacity;
			});
		},

		close: function(args) {
			var win = this._windows.pop();
			win && win.animate({opacity: 0, duration: 250}, function(){
				win.close(args);
			});
		},

		_defaultWidth: "auto",
		_defaultHeight: "auto",
		_tabGroup: null,
		_tabWidth: "100%",

		properties: {
			active: {
				get: function(value) {
					return this._tabGroup && this._tabGroup.activeTab === this;
				}
			},

			icon: {
				set: function(value) {
					return this._tabIcon.src = value;
				}
			},

			title: {
				set: function(value) {
					return this._tabTitle.innerHTML = value;
				}
			},

			titleid: {
				get: function(value) {
					// TODO
					console.debug('Property "Titanium.UI.Tab#.titleid" is not implemented yet.');
					return value;
				},
				set: function(value) {
					console.debug('Property "Titanium.UI.Tab#.titleid" is not implemented yet.');
					return value;
				}
			},

			// Override width and height
			width: function(value) {
				return this._tabWidth;
			},

			// Override width and height
			height: function(value) {
				return "100%";
			},

			window: {
				get: function(value) {
					var w = this._windows;
					return value ? value : w.length ? w[0] : null;
				},
				set: function(value) {
					this._windows.unshift(value);
					return value;
				}
			}
		}

	});

});
