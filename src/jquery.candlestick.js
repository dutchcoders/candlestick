// AngularJS directive
// <canvas ng-model='chartdata' width="800" height="340" ng-candlestick></canvas>

(function( ng ) {
  "use strict";

  ng.module('Candlestick', [])
    .directive('ngCandlestick', function($parse, $filter) {
      return {
	restrict: 'A',
	transclude: false,
	scope: { model: '=ngModel', info: '@' },
	link: function(scope, element, attrs, timeout) {
	  scope.$watch('model', function(oldValue, newValue) {
	    var candlestick= $(element).Candlestick();
	    candlestick.Candlestick('update', {data: newValue});
	  });
	}
      };
  });
})( angular );

;(function ( $, window, document, undefined ) {
                "use strict";

		var dragging = false;
		var dragX = 0;
                var offsetX = 0;
                var startOffsetX =0;
                
                var minVal = 10000;
                var maxVal = 0;
                
                var pluginName = "Candlestick";
                
                var defaults = {
                        label: {
                            color: 'darkgray',
                            font: "8pt Helvetica"                            
                        },
                        highValue: {
                            visible: true,
                            color: 'white',
                            font: '6pt Helvetica'
                        },
                        lowValue: {
                            visible: false,
                            color: 'white',
                            font: '6pt Helvetica'
                        },
                        openValue: {
                            visible: false,
                            color: 'white',
                            font: '6pt Helvetica'
                        },
                        closeValue: {
                            visible: false,
                            color: 'white',
                            font: '6pt Helvetica'
                        },
                        raise: {
                            strokeStyle: 'green',
                            fillStyle: 'darkgreen'
                        },
                        drop: {
                            strokeStyle: 'red',
                            fillStyle: 'darkred'
                        },
                        data: []
		};

                // The actual plugin constructor
                function Plugin ( element, options ) {
                                this.element = element;
			        this.options = $.extend( {}, defaults, options) ;
                                this._defaults = defaults;
                                this._name = pluginName;
                                this.init();
                }

                Plugin.prototype = {
                                init: function () {
                                    var element = this.element;
                                    var $element = $(element);
                                    var plugin = this;
                                    
                                    $element.on("mousemove", function(e) {
                                        console.debug(e);
                                        if (dragging) {
                                          offsetX=startOffsetX + (e.offsetX-dragX);
                                          plugin.draw();
                                        }
                                    }).on("mousedown", function(e) {
                                      dragging=true;
                                      startOffsetX=dragX=e.offsetX;	        
                                    }).on("mouseup", function(e) {
                                      dragging=false;
                                      console.debug(e);
                                    }).on("mouseout", function(e) {
                                      dragging=false;
                                      console.debug(e);		
                                    }).on("touchmove", function(e) {
                                      console.debug(e);
                                    }).on("touchstart", function(e) {
                                      console.debug(e);
                                    }).on("touchend", function(e) {
                                      console.debug(e);
                                    }).on("dragstart", function(e) {
                                      console.debug(e);
                                    }).on("dragover", function(e) {
                                      console.debug(e);
                                    }).on("drop", function(e) {
                                      console.debug(e);
                                    });
                                },
				update: function(options) {
				  this.options = $.extend( {}, this.options, options) ;
                                  this.draw();
				},
                                draw: function () {
				  var ctx = this.element.getContext('2d');
				  
				  var data = this.options.data;
                                
                                  // https://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/HTML-canvas-guide/CreatingChartsandGraphs/CreatingChartsandGraphs.html
                                  ctx.save()
                                  ctx.clearRect(0,0,this.element.width,this.element.height);
                                
                                    for (var i = 67; i >= 0; i--) {
                                      var j = data.length - 1 - (67 - i);
                                      
                                      if (j < 0) 
                                          continue;
                                        
                                      if (isNaN(data[j].h))
                                        continue;
                                      
                                      if (data[j].l < minVal) {
                                        minVal = data[j].l * 0.99;
                                      }
                                      
                                      if (data[j].h > maxVal) {
                                        maxVal = data[j].h * 1.01;
                                      }
                                    }
                                    
                                    var stepSize = (maxVal - minVal) / 10;
                                    var colHead = 30;
                                    var rowHead = 50;
                                    var margin = 45;
                                    
                                    var xScalar = 11; // (canvas.width - rowHead ) / (data.length );
                                    var yScalar = (this.element.height - colHead - margin) / (maxVal-minVal);
                                    
                                    ctx.lineWidth = 0.3;
                                    ctx.strokeStyle = "#bbb"; // light blue line
                                    ctx.beginPath();
                                    ctx.fillStyle = this.options.label.color;
                                    ctx.font = this.options.label.font;
                                    
                                    var count =  0;
                                    for (var scale = maxVal; scale >= minVal; scale -= stepSize) {
                                        var y = colHead + (yScalar * count * stepSize);
                                        ctx.fillText(scale.toFixed(2), this.element.width - margin + 10, y + 3);
                                        ctx.moveTo(0, y)
                                        ctx.lineTo(this.element.width - margin, y)
                                        count++;
                                    }
                                    ctx.stroke();
                                    
                                    ctx.font = this.options.label.font;
                                    ctx.textBaseline = "bottom";
                                    for (var i = 67; i >= 0; i--) {
                                        var j = data.length - 1 - (67 - i);
                                        if (j < 0) 
                                          continue;
                                        
                                        var str= "now";
                                        if (data.length -1 > j) {
                                          str = new Date(data[j].d).getMinutes();// $filter('date')(new Date(data[j].d), 'HH:mm');
                                        }
                                        
                                        if ((new Date(data[j].d).getMinutes() % 5==0 && j > 4) || data.length -1 == j ) {
                                            var centerx = ctx.measureText(str).width / 2;
                                            ctx.fillText(str, xScalar * (i + 0.4) - centerx , this.element.height - colHead + 20);
                                        }
                                    }
                                    
                                    ctx.translate(offsetX, this.element.height - rowHead);
                                    ctx.scale(1, 1);
                                    
                                    // draw bars
                                    for (var i = 67; i >= 0; i--) {
                                        var j = data.length - 1 - (67 - i);
                                        if (j < 0) 
                                          continue;
                                        
                                        if (isNaN(data[j].o) || isNaN(data[j].c) || isNaN(data[j].h) || isNaN(data[j].l)) 
                                            continue;
                                        
                                        ctx.lineWidth = 0.8;
                                        
                                        if ((data[j].o < data[j].c)) {
                                          ctx.strokeStyle = this.options.raise.strokeStyle;
                                          ctx.fillStyle = this.options.raise.fillStyle;
                                        } else {
                                          ctx.strokeStyle = this.options.drop.strokeStyle; 
                                          ctx.fillStyle = this.options.drop.fillStyle;
                                        }
                                        
                                        ctx.beginPath();
                                        ctx.moveTo((i + 0.45) * xScalar, (data[j].l-minVal) * - yScalar);
                                        ctx.lineTo((i + 0.45) * xScalar, (data[j].h-minVal) * - yScalar);
                                        ctx.closePath();
                                        ctx.stroke();
                                        
                                        if (true) {
                                          ctx.fillRect((i ) * xScalar, (data[j].o-minVal) * -yScalar, xScalar * 0.8, (data[j].c-data[j].o) * -yScalar );
                                          ctx.strokeRect((i ) * xScalar, (data[j].o-minVal) * -yScalar, xScalar * 0.8, (data[j].c-data[j].o) * -yScalar);
                                        } 
                                        
                                        if (this.options.lowValue.visible) {
                                            ctx.fillStyle = this.options.lowValue.color;
                                            ctx.font = this.options.lowValue.font;
                                            
                                            var y = ((data[j].l - minVal) * -yScalar);
                                            if (j % 2 == 0) {
                                              var centerx = ctx.measureText(data[j].l).width / 2;
                                              ctx.fillText(data[j].l,  (xScalar * (i + 0.4))  - centerx, y) ;
                                            }
                                        }
                                        
                                        if (this.options.highValue.visible) {
                                            ctx.fillStyle = this.options.highValue.color;
                                            ctx.font = this.options.highValue.font;
                                            
                                            var y = ((data[j].h - minVal) * -yScalar - 4);
                                            if (j % 2 == 0) {
                                              var centerx = ctx.measureText(data[j].h).width / 2;
                                              ctx.fillText(data[j].h,  (xScalar * (i + 0.4))  - centerx, y) ;
                                            }
                                        }
                                        
                                        if (this.options.openValue.visible) {
                                            ctx.fillStyle = this.options.openValue.color;
                                            ctx.font = this.options.openValue.font;
                                            
                                            var y = ((data[j].o - minVal) * -yScalar);
                                            var centerx = ctx.measureText(data[j].o).width / 2;
                                            ctx.fillText(data[j].o,  (xScalar * (i + 0.4))  - centerx, y) ;
                                        }
                                        
                                        if (this.options.closeValue.visible) {
                                            ctx.fillStyle = this.options.closeValue.color;
                                            ctx.font = this.options.closeValue.font;
                                            
                                            var y = ((data[j].c - minVal) * -yScalar);
                                            var centerx = ctx.measureText(data[j].c).width / 2;
                                            ctx.fillText(data[j].c,  (xScalar * (i + 0.4))  - centerx, y) ;                                            
                                        }
                                    }
                                    
                                    function drawLine(style, attr) {
                                      ctx.beginPath();
                                      ctx.strokeStyle = style;
                                      for (var i = 67; i >= 0; i--) {
                                        var j = data.length - 1 - (67 - i);
                                        if (j < 1) 
                                          continue;
                                        
                                        ctx.moveTo((i - 1 + 0.45) * xScalar, (data[j-1][attr]-minVal) * - yScalar);
                                        ctx.lineTo((i + 0.45) * xScalar, (data[j][attr]-minVal) * - yScalar);
                                      }
                                      ctx.closePath();
                                      ctx.stroke();
                                    }
                                    
                                    drawLine("pink", "ma");
                                    drawLine("yellow", "ema");
                                
				    ctx.restore();
                                }
                };

		$.fn[pluginName] = function ( options ) {
		  var args = arguments;
	  
		  // Is the first parameter an object (options), or was omitted,
		  // instantiate a new instance of the plugin.
		  if (options === undefined || typeof options === 'object') {
		      return this.each(function () {
	  
			  // Only allow the plugin to be instantiated once,
			  // so we check that the element has no plugin instantiation yet
			  if (!$.data(this, 'plugin_' + pluginName)) {
	  
			      // if it has no instance, create a new one,
			      // pass options to our plugin constructor,
			      // and store the plugin instance
			      // in the elements jQuery data object.
			      $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
			  }
		      });
	  
		  // If the first parameter is a string and it doesn't start
		  // with an underscore or "contains" the `init`-function,
		  // treat this as a call to a public method.
		  } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
	  
		      // Cache the method call
		      // to make it possible
		      // to return a value
		      var returns;
	  
		      this.each(function () {
			  var instance = $.data(this, 'plugin_' + pluginName);
	  
			  // Tests that there's already a plugin-instance
			  // and checks that the requested public method exists
			  if (instance instanceof Plugin && typeof instance[options] === 'function') {
	  
			      // Call the method of our plugin instance,
			      // and pass it the supplied arguments.
			      returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
			  }
	  
			  // Allow instances to be destroyed via the 'destroy' method
			  if (options === 'destroy') {
			    $.data(this, 'plugin_' + pluginName, null);
			  }
		      });
	  
		      // If the earlier cached method
		      // gives a value back return the value,
		      // otherwise return this to preserve chainability.
		      return returns !== undefined ? returns : this;
		  }
	      };

})( jQuery, window, document );

