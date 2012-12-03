/**
 * jquery.stackslider.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2012, Codrops
 * http://www.codrops.com
 */
;( function( $, window, undefined ) {
	
	'use strict';

	/*
	* debouncedresize: special jQuery event that happens once after a window resize
	*
	* latest version and complete README available on Github:
	* https://github.com/louisremi/jquery-smartresize/blob/master/jquery.debouncedresize.js
	*
	* Copyright 2011 @louis_remi
	* Licensed under the MIT license.
	*/
	var $event = $.event,
	$special,
	resizeTimeout;

	$special = $event.special.debouncedresize = {
		setup: function() {
			$( this ).on( "resize", $special.handler );
		},
		teardown: function() {
			$( this ).off( "resize", $special.handler );
		},
		handler: function( event, execAsap ) {
			// Save the context
			var context = this,
				args = arguments,
				dispatch = function() {
					// set correct event type
					event.type = "debouncedresize";
					$event.dispatch.apply( context, args );
				};

			if ( resizeTimeout ) {
				clearTimeout( resizeTimeout );
			}

			execAsap ?
				dispatch() :
				resizeTimeout = setTimeout( dispatch, $special.threshold );
		},
		threshold: 150
	};

	// ======================= imagesLoaded Plugin ===============================
	// https://github.com/desandro/imagesloaded

	// $('#my-container').imagesLoaded(myFunction)
	// execute a callback when all images have loaded.
	// needed because .load() doesn't work on cached images

	// callback function gets image collection as argument
	//  this is the container

	// original: mit license. paul irish. 2010.
	// contributors: Oren Solomianik, David DeSandro, Yiannis Chatzikonstantinou

	// blank image data-uri bypasses webkit log warning (thx doug jones)
	var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

	$.fn.imagesLoaded = function( callback ) {
		var $this = this,
			deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
			hasNotify = $.isFunction(deferred.notify),
			$images = $this.find('img').add( $this.filter('img') ),
			loaded = [],
			proper = [],
			broken = [];

		// Register deferred callbacks
		if ($.isPlainObject(callback)) {
			$.each(callback, function (key, value) {
				if (key === 'callback') {
					callback = value;
				} else if (deferred) {
					deferred[key](value);
				}
			});
		}

		function doneLoading() {
			var $proper = $(proper),
				$broken = $(broken);

			if ( deferred ) {
				if ( broken.length ) {
					deferred.reject( $images, $proper, $broken );
				} else {
					deferred.resolve( $images );
				}
			}

			if ( $.isFunction( callback ) ) {
				callback.call( $this, $images, $proper, $broken );
			}
		}

		function imgLoaded( img, isBroken ) {
			// don't proceed if BLANK image, or image is already loaded
			if ( img.src === BLANK || $.inArray( img, loaded ) !== -1 ) {
				return;
			}

			// store element in loaded images array
			loaded.push( img );

			// keep track of broken and properly loaded images
			if ( isBroken ) {
				broken.push( img );
			} else {
				proper.push( img );
			}

			// cache image and its state for future calls
			$.data( img, 'imagesLoaded', { isBroken: isBroken, src: img.src } );

			// trigger deferred progress method if present
			if ( hasNotify ) {
				deferred.notifyWith( $(img), [ isBroken, $images, $(proper), $(broken) ] );
			}

			// call doneLoading and clean listeners if all images are loaded
			if ( $images.length === loaded.length ){
				setTimeout( doneLoading );
				$images.unbind( '.imagesLoaded' );
			}
		}

		// if no images, trigger immediately
		if ( !$images.length ) {
			doneLoading();
		} else {
			$images.bind( 'load.imagesLoaded error.imagesLoaded', function( event ){
				// trigger imgLoaded
				imgLoaded( event.target, event.type === 'error' );
			}).each( function( i, el ) {
				var src = el.src;

				// find out if this image has been already checked for status
				// if it was, and src has not changed, call imgLoaded on it
				var cached = $.data( el, 'imagesLoaded' );
				if ( cached && cached.src === src ) {
					imgLoaded( el, cached.isBroken );
					return;
				}

				// if complete is true and browser supports natural sizes, try
				// to check for image status manually
				if ( el.complete && el.naturalWidth !== undefined ) {
					imgLoaded( el, el.naturalWidth === 0 || el.naturalHeight === 0 );
					return;
				}

				// cached images don't fire load sometimes, so we reset src, but only when
				// dealing with IE, or image is complete (loaded) and failed manual check
				// webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
				if ( el.readyState || el.complete ) {
					el.src = BLANK;
					el.src = src;
				}
			});
		}

		return deferred ? deferred.promise( $this ) : $this;
	};

	// global
	var $window = $(window),
		$document = $(document),
		Modernizr = window.Modernizr;

	$.StackSlider = function( options, element ) {	
		this.$stack = $( element ).hide();
		this._init( options );
	};

	// the options
	$.StackSlider.defaults = {
		// default transition speed
		speed : 600,
		// default transition easing
		easing : 'ease-in-out',
		// render both piles
		piles : true
	};

	$.StackSlider.prototype = {

		_init : function( options ) {
			
			// options
			this.options = $.extend( true, {}, $.StackSlider.defaults, options );

			// support css transitions and 3d transforms
			this.support = Modernizr.csstransitions && Modernizr.csstransforms3d;
			var transProperties = {
				'WebkitTransition' : { transitionEndEvent : 'webkitTransitionEnd', tranformName : '-webkit-transform' },
				'MozTransition' : { transitionEndEvent : 'transitionend', tranformName : '-moz-transform' },
				'OTransition' : { transitionEndEvent : 'oTransitionEnd', tranformName : '-o-transform' },
				'msTransition' : { transitionEndEvent : 'MSTransitionEnd', tranformName : '-ms-transform' },
				'transition' : { transitionEndEvent : 'transitionend', tranformName : 'transform' }
			};
			
			if( this.support ) {
				this.transEndEventName = transProperties[ Modernizr.prefixed( 'transition' ) ].transitionEndEvent + '.stackslider';
				this.transformName = transProperties[ Modernizr.prefixed( 'transition' ) ].tranformName;
			}

			this.current = 0;

			var self = this;
			this.$stack.imagesLoaded( function() {
				
				self._layout();
				if( self.itemsCount === 0 ) {
					return false;
				}
				self._initEvents();

			} );

		},
		_layout : function() {

			// items
			var $items = this.$stack.children( 'li' );
			// total items
			this.itemsCount = $items.length;
			
			// main wrapper
			this.$wrapper = $( '<div class="st-wrapper"></div>' );
			
			// add 2 piles
			if( this.options.piles ) {
				this.$lPile = $( '<div class="st-stack st-stack-left"></div>' );
				this.$rPile = $( '<div class="st-stack st-stack-right"></div>' );
				this.$wrapper.append( this.$lPile, this.$rPile );
			}
			
			// add title
			this.$title = $( '<div class="st-title"></div>' ).appendTo( this.$wrapper );

			// add navigation
			if( this.itemsCount > 1 ) {

				this.$navigation = $( '<nav><span>Previous</span><span>Next</span></nav>' );
				this.$wrapper.append( this.$navigation );

			}

			var html = '';
			$items.each( function() {
				var $this = $( this );
				html += '<div class="st-item" data-title="' + $this.children( 'div.st-title' ).html() + '">' + $this.children( 'div.st-item' ).html() + '</div>';
			} );
			this.$listitems = $( '<div></div>' ).html( html );
			this.$items = this.$listitems.children( 'div' ).hide();
			this.$wrapper.insertAfter( this.$stack ).prepend( this.$listitems );
			this.$stack.remove();

			if( this.options.piles ) {			
				this.$rPile.css( 'height', '+=' + ( this.itemsCount - 1 ) * 5 );
			}

			this._setSize();
			this._initItems();

		},
		_setSize : function() {

			// todo: factor should depend on the perspective value. The lower the perpsective value, the higher the width..
			var itemH = this.$items.height(),
				pileW = 1.25 * itemH;
			// distance between one pile's center point to the center of the wrapper
			this.radius = this.$wrapper.width() / 2 - pileW / 2;
			if( this.options.piles ) {
				this.$lPile.css( 'width', pileW );
				this.$rPile.css( 'width', pileW );
			}

		},
		_initEvents : function( position ) {

			var self = this;

			this.$navigation.children( 'span:last' ).on( {
				'mousedown.stackslider' : function() {

					self._navigate( 'next' );
					self.startflowtimeout = setTimeout( function() {
						self.flow = true;
						self._flow( 'next' );
					}, 600 );

				}, 
				'mouseup.stackslider mouseleave.stackslider' : function() {
					self._mouseup( 'next' );
				}
			} ).end().children( 'span:first' ).on( {
				'mousedown.stackslider' : function() {

					self._navigate( 'prev' );
					self.startflowtimeout = setTimeout( function() {
						self.flow = true;
						self._flow( 'prev' );
					}, 600 );

				},
				'mouseup.stackslider mouseleave.stackslider' : function() {
					self._mouseup( 'prev' );
				}
			} );

			$window.on( 'debouncedresize.stackslider', function() {

				self._setSize();
				self._initItems();

			} );

		},
		_mouseup : function( dir ) {

			var self = this;
			clearTimeout( this.startflowtimeout );
			clearTimeout( this.flowtimeout );
			if( this.flow ) {
				setTimeout( function() {
					
					if( self.current !== 0 && self.current !== self.itemsCount - 1 ) {
						self._navigate( dir );
					}

				}, 100 );
				this.flow = false;
			}

		},
		_flow : function( dir ) {

			var self = this;
			this._navigate( dir, true );
			this.flowtimeout = setTimeout( function() { 
				self._flow( dir );
			}, 150 );

		},
		_navigate : function( dir, flow ) {

			var self = this,
				classes = 'st-left st-center st-right st-leftflow st-rightflow', dirclass, posclass, pileOut, pileIn,
				$currentItem = this.$items.eq( this.current );

			if( dir === 'next' && this.current < this.itemsCount - 1 ) {

				++this.current;
				posclass = 'st-left';
				dirclass = flow ? 'st-leftflow' : posclass;
				pileOut = 'right';
				pileIn = 'left';
				
			}
			else if( dir === 'prev' && this.current > 0 ) {

				--this.current;
				posclass = 'st-right';
				dirclass = flow ? 'st-rightflow' : posclass;
				pileOut = 'left';
				pileIn = 'right';
				
			}
			else {
				return false;
			}

			this._updatePile( pileOut, 'out' );

			var $nextItem = this.$items.eq( this.current );

			$currentItem.removeClass( classes ).addClass( dirclass );

			if( this.support ) {
				$currentItem.on( this.transEndEventName , function() {

					$( this ).removeClass( classes ).addClass( posclass ).off( self.transEndEventName );
					self._updatePile( pileIn, 'in' );

				} );
			}
			else {
				$currentItem.removeClass( classes ).addClass( posclass );
				this._updatePile( pileIn, 'in' );
			}

			$nextItem.show();
			
			setTimeout( function() {
				
				if( ( flow && ( self.current === 0 || self.current === self.itemsCount - 1 ) ) || !flow ) {
					$nextItem.removeClass( classes ).addClass( 'st-center' );
				}

			}, 25 );

			clearTimeout( this.titletimeout );
			var time = this.support ? this.options.speed : 0;
			this.titletimeout = setTimeout( function() {
				self.$title.html( $nextItem.data( 'title' ) );
			}, time );

		},
		_updatePile : function( pile, action ) {

			if( !this.options.piles ) {
				return false;
			}

			if( pile === 'right' ) {
				this.$rPile.css( 'height', action === 'in' ? '+=5' : '-=5' );
			}
			else if( pile === 'left' ) {
				this.$lPile.css( 'height', action === 'in' ? '+=5' : '-=5' );
			}

		},
		_initItems : function() {

			var self = this,
				wrapperW = this.$wrapper.width(), wrapperH = this.$wrapper.height(),
				$currentItem = this.$items.eq( this.current ).addClass( 'st-center' ).show(),
				pileHFactor = this.options.piles ? Math.max( this.$lPile.height(), this.$rPile.height() ) / 2 : 0;

			this.$title.html( $currentItem.data( 'title' ) );

			this.$items.each( function( i ) {

				var $item = $( this ),
					itemH = $item.height(), itemW = $item.width(),
					itemTop = wrapperH - self.radius - itemH / 2;

				if( $item.index() !== self.current ) {
					$item.addClass( 'st-right' );
				}

				if( self.support ) {
					$item.css( {
						transition : self.transformName + ' ' + self.options.speed + 'ms ' + self.options.easing + ', opacity ' + self.options.speed + 'ms ' + self.options.easing,
						transformOrigin : '50% ' + ( self.radius + itemH / 2 - pileHFactor ) + 'px'
					} );					
				}

				$item.css( {
					left : wrapperW / 2 - itemW / 2,
					top : itemTop
				} );

			} );

		}

	};
	
	var logError = function( message ) {

		if ( window.console ) {

			window.console.error( message );
		
		}

	};
	
	$.fn.stackslider = function( options ) {

		var instance = $.data( this, 'stackslider' );
		
		if ( typeof options === 'string' ) {
			
			var args = Array.prototype.slice.call( arguments, 1 );
			
			this.each(function() {
			
				if ( !instance ) {

					logError( "cannot call methods on stackslider prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				
				}
				
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {

					logError( "no such method '" + options + "' for stackslider instance" );
					return;
				
				}
				
				instance[ options ].apply( instance, args );
			
			});
		
		} 
		else {
		
			this.each(function() {
				
				if ( instance ) {

					instance._init();
				
				}
				else {

					instance = $.data( this, 'stackslider', new $.StackSlider( options, this ) );
				
				}

			});
		
		}
		
		return instance;
		
	};
	
} )( jQuery, window );
