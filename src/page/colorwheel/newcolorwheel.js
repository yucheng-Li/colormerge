import * as d3 from 'd3'
import tinycolor from 'tinycolor2'

class ColorWheel {
    constructor() {
        var self = this;
        this.options = {
            container    : document.getElementById("setwheel"),
            radius       : 175,
            margin       : 40, // space around the edge of the wheel
            markerWidth  : 40,
            defaultSlice : 20,
            initRoot     : 'green',
            initMode     : ColorWheel.modes.CUSTOM,
            baseClassName: 'colorwheel',
        };
        var diameter = this.options.radius * 2;
        this.currentMode = this.options.initMode;
        this.container = d3.select(this.options.container);
        this.container = this.container
        this.slice = this.options.defaultSlice;
        this.$ = {};
        // D3 开始基础配置
        this.$.wheel = this.container.append('svg').attr({
          'class': this.options.baseClassName,
          width: diameter,
          height: diameter,
          viewBox: [
            -1 * this.options.margin,
            -1 * this.options.margin,
            diameter + 2 * this.options.margin,
            diameter + 2 * this.options.margin
          ].join(' ')
        });
          // 创建圆形
        this.$.wheel.append('circle').attr({
          fill     : 'black',
          r        : this.options.radius,
          cx       : this.options.radius,
          cy       : this.options.radius,
          transform: 'translate(4, 4)'
        });

          // 添加色轮背景图
        this.$.wheel.append('image').attr({
          width: diameter,
          height: diameter,
          'xlink:href': 'http://benknight.github.io/kuler-d3/wheel.png'
        });
        // D3 中的 g 相当于一个div
        this.$.markerTrails = this.$.wheel.append('g');
        this.$.markers = this.$.wheel.append('g');
    
        // --- Events ---
        // Dispatching(分发)是一个用来降低代码耦合度的便捷方式

        this.dispatch = d3.dispatch(
          // Markers datum has changed, so redraw as necessary, etc.
          // Markers的数据已经改变，因此需要重新绘制
          'markersUpdated',
    
          // "updateEnd" means the state of the ColorWheel has been finished updating.
          'updateEnd',
    
          // Initial data was successfully bound.
          'bindData',
    
          // The mode was changed
          'modeChanged'
        );
    
        this.dispatch.on('bindData.default', function () {
          self.setHarmony();
        });
    
        this.dispatch.on('markersUpdated.default', function () {
          self.getMarkers().attr({
            transform: function (d) {
              var hue = ColorWheel.scientificToArtisticSmooth(d.color.h);
              var p = self.getSVGPositionFromHS(d.color.h, d.color.s);
              return ['translate(' + [p.x, p.y].join() + ')'].join(' ');
            },
            visibility: function (d) {
              return d.show ? 'visible' : 'hidden';
            }
          }).select('circle').attr({
            fill: function (d) {
              return ColorWheel.hexFromHS(d.color.h, d.color.s);
            }
          });
    
          self.container.selectAll(self.selector('marker-trail')).attr({
            'x2': function (d) {
              var p = self.getSVGPositionFromHS(d.color.h, d.color.s);
              return p.x;
            },
            'y2': function (d) {
              var p = self.getSVGPositionFromHS(d.color.h, d.color.s);
              return p.y;
            },
            visibility: function (d) {
              return d.show ? 'visible' : 'hidden';
            }
          });
        });
    
        this.dispatch.on('modeChanged.default', function () {
          self.container.attr('data-mode', self.currentMode);
        });
    
    
        // --- Plugins ---
    
        for (var pluginId in ColorWheel.plugins) {
          if (typeof ColorWheel.plugins[pluginId] == 'function') {
            ColorWheel.plugins[pluginId](this);
          }
        }
    }
}

var ColorWheelMarkerDatum = function ColorWheelMarkerDatum(color, name, show) {

    // 将传入的颜色转为Hsv格式
    // 这里转换的Hsv的颜色是匹配的
    this.color = tinycolor(color).toHsv();
    console.log( this.color)
    this.name = name;
    this.show = show;
  };

  ColorWheel.prototype.bindData = function (newData) {
    var self = this;

    // Data can be passed as a whole number,
    // or an array of ColorWheelMarkerDatum.
    if (newData.constructor === Array) {
      var data = newData;
      this.setMode(ColorWheel.modes.CUSTOM);
    } else {
      // We weren't given any data so create our own.
      //调整要展示的颜色数量
      var numColors = (typeof newData === 'number') ? newData : 5;
      var data = Array.apply(null, {length: numColors}).map(function () {
        return new ColorWheelMarkerDatum(newData.color, null, true);
      });
    }

    // 定义 markerTrails 来创建一个 g 图层
    // markerTrails 是那条虚线
    var markerTrails = this.$.markerTrails.selectAll(this.selector('marker-trail')).data(data);

    markerTrails.enter().append('line').attr({
      'class': this.cx('marker-trail'),
      'x1': this.options.radius,
      'y1': this.options.radius,
      'stroke': 'white',
      'stroke-opacity': 0.75,
      'stroke-width': 3,
      'stroke-dasharray': '10, 6'
    });

    markerTrails.exit().remove();

    // marker 是那个圆圈
    var markers = this.$.markers.selectAll(this.selector('marker')).data(data);

    markers.enter()
      .append('g')
        .attr({
          'class': this.cx('marker'),
          'visibility': 'visible'
        })
      .append('circle')
        .attr({
          'r': this.options.markerWidth / 2,
          'stroke': 'white',
          'stroke-width': 2,
          'stroke-opacity': 0.9,
          'cursor': 'move'
        });

    markers.exit().remove();

    markers.append('text').text(function (d) { return d.name; }).attr({
        x: (this.options.markerWidth / 2) + 8,
        y: (this.options.markerWidth / 4) - 5,
        fill: 'white',
        'font-size': '13px',
      });
    // 给圆圈添加拖拽行为
    markers.call(this.getDragBehavior());

    this.dispatch.bindData(data);
    this.dispatch.markersUpdated();
    this.dispatch.updateEnd();

  };

  // 定义了色轮中的颜色拖拽
  ColorWheel.prototype.getDragBehavior = function () {
    var self = this;
    return d3.behavior.drag()
      .on('drag', function (d) {
        var pos, hs, p, dragHue, startingHue, theta1, theta2;
        pos = self.pointOnCircle(d3.event.x, d3.event.y);
        hs = self.getHSFromSVGPosition(pos.x, pos.y);
        d.color.h = hs.h;
        d.color.s = hs.s;
        p = self.svgToCartesian(d3.event.x, d3.event.y);
        dragHue = ((Math.atan2(p.y, p.x) * 180 / Math.PI) + 720) % 360;
        startingHue = parseFloat(d3.select(this).attr('data-startingHue'));
        theta1 = (360 + startingHue - dragHue) % 360;
        theta2 = (360 + dragHue - startingHue) % 360;
        self.updateHarmony(this, theta1 < theta2 ? -1 * theta1 : theta2);
      })
      .on('dragstart', function () {
        self.getVisibleMarkers().attr('data-startingHue', function (d) {
          return ColorWheel.scientificToArtisticSmooth(d.color.h);
        });
      })
      .on('dragend', function () {
        var visibleMarkers = self.getVisibleMarkers();
        visibleMarkers.attr('data-startingHue', null);
        if (self.currentMode === ColorWheel.modes.ANALOGOUS) {
          var rootTheta = ColorWheel.scientificToArtisticSmooth(d3.select(visibleMarkers[0][0]).datum().color.h);
          if (visibleMarkers[0].length > 1) {
            var neighborTheta = ColorWheel.scientificToArtisticSmooth(d3.select(visibleMarkers[0][1]).datum().color.h);
            self.slice = (360 + neighborTheta - rootTheta) % 360;
          }
        }
        self.dispatch.updateEnd();
      });
  };

  ColorWheel.prototype.getMarkers = function () {
    return this.container.selectAll(this.selector('marker'));
  };

  ColorWheel.prototype.getVisibleMarkers = function () {
    return this.container.selectAll(this.selector('marker') + '[visibility=visible]');
  };

  ColorWheel.prototype.getRootMarker = function () {
    return this.container.select(this.selector('marker') + '[visibility=visible]');
  };

  ColorWheel.prototype.setHarmony = function () {
    var self = this;
    // root 代表颜色色轮小圆圈
    var root = this.getRootMarker();
    var offsetFactor = 0.08;
    this.getMarkers().classed('root', false);
    if (! root.empty()) {
      console.log(root.datum())
      // Hue是色相,这里的色相是经过处理的
      var rootHue = ColorWheel.scientificToArtisticSmooth(root.datum().color.h);
      console.log(rootHue)
      // 选择不同的模式
      switch (this.currentMode) {
        case ColorWheel.modes.ANALOGOUS:
          root.classed('root', true);
          this.getVisibleMarkers().each(function (d, i) {
            console.log(d)
            var newHue = (rootHue + (ColorWheel.markerDistance(i) * self.slice) + 720) % 360;
            d.color.h = ColorWheel.artisticToScientificSmooth(newHue);
            d.color.s = 1;
            d.color.v = 1;
          });
          break;
        case ColorWheel.modes.MONOCHROMATIC:
        case ColorWheel.modes.SHADES:
          this.getVisibleMarkers().each(function (d, i) {
            d.color.h = ColorWheel.artisticToScientificSmooth(rootHue);
            if (self.currentMode == ColorWheel.modes.SHADES) {
              d.color.s = 1;
              d.color.v = 0.25 + 0.75 * Math.random();
            } else {
              d.color.s = 1 - (0.15 * i + Math.random() * 0.1);
              d.color.v = 0.75 + 0.25 * Math.random();
            }
          });
          break;
        case ColorWheel.modes.COMPLEMENTARY:
          this.getVisibleMarkers().each(function (d, i) {
            var newHue = (rootHue + ((i % 2) * 180) + 720) % 360;
            d.color.h = ColorWheel.artisticToScientificSmooth(newHue);
            d.color.s = 1 - offsetFactor * ColorWheel.stepFn(2)(i);
            d.color.v = 1;
          });
          break;
        case ColorWheel.modes.TRIAD:
          this.getVisibleMarkers().each(function (d, i) {
            var newHue = (rootHue + ((i % 3) * 120) + 720) % 360;
            d.color.h = ColorWheel.artisticToScientificSmooth(newHue);
            d.color.s = 1 - offsetFactor * ColorWheel.stepFn(3)(i);
            d.color.v = 1;
          });
          break;
        case ColorWheel.modes.TETRAD:
          this.getVisibleMarkers().each(function (d, i) {
            var newHue = (rootHue + ((i % 4) * 90) + 720) % 360;
            d.color.h = ColorWheel.artisticToScientificSmooth(newHue);
            d.color.s = 1 - offsetFactor * ColorWheel.stepFn(4)(i);
            d.color.v = 1;
          });
          break;
      }
      this.dispatch.markersUpdated();
    }
  };

  ColorWheel.prototype.updateHarmony = function (target, theta) {
    var self = this;
    var root = this.getRootMarker();
    var rootHue = ColorWheel.scientificToArtisticSmooth(root.datum().color.h);

    // Find out how far the dragging marker is from the root marker.
    var cursor = target;
    var counter = 0;
    while (cursor = cursor.previousSibling) {
      if (cursor.getAttribute('visibility') !== 'hidden') {
        counter++;
      }
    }
    var targetDistance = ColorWheel.markerDistance(counter);

    switch (this.currentMode) {
      case ColorWheel.modes.ANALOGOUS:
        this.getVisibleMarkers().each(function (d, i) {
          var startingHue = parseFloat(d3.select(this).attr('data-startingHue'));
          var slices = 1;
          if (targetDistance !== 0) {
            slices = ColorWheel.markerDistance(i) / targetDistance;
          }
          if (this !== target) {
            d.color.h = ColorWheel.artisticToScientificSmooth(
              (startingHue + (slices * theta) + 720) % 360
            );
          }
        });
        break;
      case ColorWheel.modes.MONOCHROMATIC:
      case ColorWheel.modes.COMPLEMENTARY:
      case ColorWheel.modes.SHADES:
      case ColorWheel.modes.TRIAD:
      case ColorWheel.modes.TETRAD:
        this.getVisibleMarkers().each(function (d) {
          var startingHue = parseFloat(d3.select(this).attr('data-startingHue'));
          d.color.h = ColorWheel.artisticToScientificSmooth((startingHue + theta + 720) % 360);
          if (self.currentMode == ColorWheel.modes.SHADES) {
            d.color.s = 1;
          }
        });
        break;
    }
    self.dispatch.markersUpdated();
  };


ColorWheel.prototype.svgToCartesian = function (x, y) {
    return {'x': x - this.options.radius, 'y': this.options.radius - y};
  };

  ColorWheel.prototype.cartesianToSVG = function (x, y) {
    return {'x': x + this.options.radius, 'y': this.options.radius - y};
  };

  // Given an SVG point (x, y), returns the closest point to (x, y) still in the circle.
  ColorWheel.prototype.pointOnCircle = function (x, y) {
    var p = this.svgToCartesian(x, y);
    if (Math.sqrt(p.x * p.x + p.y * p.y) <= this.options.radius) {
      return {'x': x, 'y': y};
    } else {
      var theta = Math.atan2(p.y, p.x);
      var x_ = this.options.radius * Math.cos(theta);
      var y_ = this.options.radius * Math.sin(theta);
      return this.cartesianToSVG(x_, y_);
    }
  };

  // Get a coordinate pair from hue and saturation components.
  ColorWheel.prototype.getSVGPositionFromHS = function (h, s) {
    var hue = ColorWheel.scientificToArtisticSmooth(h);
    var theta = hue * (Math.PI / 180);
    var y = Math.sin(theta) * this.options.radius * s;
    var x = Math.cos(theta) * this.options.radius * s;
    return this.cartesianToSVG(x, y);
  };

  // Inverse of getSVGPositionFromHS
  ColorWheel.prototype.getHSFromSVGPosition = function (x, y) {
    var p = this.svgToCartesian(x, y);
    var theta = Math.atan2(p.y, p.x);
    var artisticHue = (theta * (180 / Math.PI) + 360) % 360;
    var scientificHue = ColorWheel.artisticToScientificSmooth(artisticHue);
    var s = Math.min(Math.sqrt(p.x*p.x + p.y*p.y) / this.options.radius, 1);
    return {h: scientificHue, s: s};
  };

  ColorWheel.prototype._getColorsAs = function (toFunk) {
    return this.getVisibleMarkers().data()
      .sort(function (a, b) {
        return a.color.h - b.color.h;
      })
      .map(function (d) {
        return tinycolor({h: d.color.h, s: d.color.s, v: d.color.v})[toFunk]();
      });
  };

  ColorWheel.prototype.getColorsAsHEX = function () {
    return this._getColorsAs('toHexString');
  };

  ColorWheel.prototype.getColorsAsRGB = function () {
    return this._getColorsAs('toRgbString');
  };

  ColorWheel.prototype.getColorsAsHSL = function () {
    return this._getColorsAs('toHslString');
  };

  ColorWheel.prototype.getColorsAsHSV = function () {
    return this._getColorsAs('toHsvString');
  };

  ColorWheel.prototype.setMode = function (mode) {
    ColorWheel.checkIfModeExists(mode);
    this.currentMode = mode;
    this.setHarmony();
    this.dispatch.updateEnd();
    this.dispatch.modeChanged();
  };

  // Utility for building internal classname strings
  ColorWheel.prototype.cx = function (className) {
    return this.options.baseClassName + '-' + className;
  };

  ColorWheel.prototype.selector = function (className) {
    return '.' + this.cx(className);
  };

  // These modes define a relationship between the colors on a color wheel,
  // based on "science".
  ColorWheel.modes = {
    CUSTOM: 'Custom',
    ANALOGOUS: 'Analogous',
    COMPLEMENTARY: 'Complementary',
    TRIAD: 'Triad',
    TETRAD: 'Tetrad',
    MONOCHROMATIC: 'Monochromatic',
    SHADES: 'Shades',
  };

  // Simple range mapping function
  // For example, mapRange(5, 0, 10, 0, 100) = 50
  ColorWheel.mapRange =  function (value, fromLower, fromUpper, toLower, toUpper) {
    return (toLower + (value - fromLower) * ((toUpper - toLower) / (fromUpper - fromLower)));
  };

  // These two functions are ripped straight from Kuler source.
  // They convert between scientific hue to the color wheel's "artistic" hue.

  // 光滑让艺术转换到科学
  ColorWheel.artisticToScientificSmooth = function (hue) {
    return (
      hue < 60  ? hue * (35 / 60):
      hue < 122 ? this.mapRange(hue, 60,  122, 35,  60):
      hue < 165 ? this.mapRange(hue, 122, 165, 60,  120):
      hue < 218 ? this.mapRange(hue, 165, 218, 120, 180):
      hue < 275 ? this.mapRange(hue, 218, 275, 180, 240):
      hue < 330 ? this.mapRange(hue, 275, 330, 240, 300):
                  this.mapRange(hue, 330, 360, 300, 360));
  };
  // 光滑让科学转换到艺术
  ColorWheel.scientificToArtisticSmooth = function (hue) {
    console.log(hue )
    return (
      hue < 35  ? hue * (60 / 35):
      hue < 60  ? this.mapRange(hue, 35,  60,  60,  122):
      hue < 120 ? this.mapRange(hue, 60,  120, 122, 165):
      hue < 180 ? this.mapRange(hue, 120, 180, 165, 218):
      hue < 240 ? this.mapRange(hue, 180, 240, 218, 275):
      hue < 300 ? this.mapRange(hue, 240, 300, 275, 330):
                  this.mapRange(hue, 300, 360, 330, 360));
  };

  // Get a hex string from hue and sat components, with 100% brightness.
  ColorWheel.hexFromHS = function (h, s) {
    return tinycolor({h: h, s: s, v: 1}).toHexString();
  };

  // Used to determine the distance from the root marker.
  // (The first DOM node with marker class)
  // Domain: [0, 1,  2, 3,  4, ... ]
  // Range:  [0, 1, -1, 2, -2, ... ]
  ColorWheel.markerDistance = function (i) {
    return Math.ceil(i / 2) * Math.pow(-1, i + 1);
  };

  // Returns a step function with the given base.
  // e.g. with base = 3, returns a function with this domain/range:
  // Domain: [0, 1, 2, 3, 4, 5, ...]
  // Range:  [0, 0, 0, 1, 1, 1, ...]
  ColorWheel.stepFn = function (base) {
    return function (x) { return Math.floor(x / base); }
  };

  // Throw an error if someone gives us a bad mode.
  ColorWheel.checkIfModeExists = function (mode) {
    var modeExists = false;
    for (var possibleMode in ColorWheel.modes) {
      if (ColorWheel.modes[possibleMode] == mode) {
        modeExists = true;
        break;
      }
    }
    if (! modeExists) {
      throw Error('Invalid mode specified: ' + mode);
    }
    return true;
  };

  // For creating custom markers
  ColorWheel.createMarker = function (color, name, show) {
    return new ColorWheelMarkerDatum(color, name, show);
  };

  // Provide a plugin interface
  ColorWheel.plugins = {};

  ColorWheel.extend = function (pluginId, pluginFn) {
    this.plugins[pluginId] = pluginFn;
  };

  ColorWheel.extend('modeToggle', function (colorWheel) {
    var modeToggle = colorWheel.container.append('select')
      .attr('class', colorWheel.cx('mode-toggle'))
      .on('change', function () {
        colorWheel.currentMode = this.value;
        colorWheel.setHarmony();
      });
  
    for (var mode in ColorWheel.modes) {
      modeToggle.append('option').text(ColorWheel.modes[mode])
        .attr('selected', function () {
          return ColorWheel.modes[mode] == colorWheel.currentMode ? 'selected' : null;
        });
    }
  });


  //下方的颜色展示
  ColorWheel.extend('theme', function (colorWheel) {
    // 新建一个div 叫 theme
    var theme = colorWheel.container.append('div').attr('class', colorWheel.cx('theme'));

    // 创建元素
    colorWheel.dispatch.on('bindData.themeBuild', function (data) {
      var swatches = theme.selectAll(colorWheel.selector('theme-swatch')).data(data);
      var newSwatches = swatches.enter().append('div').attr('class', colorWheel.cx('theme-swatch'));
  
      // Add color
      // 创建颜色圆圈
      newSwatches.append('div').attr('class', colorWheel.cx('theme-color'));
  
      // Add sliders
      // 创建颜色调节器
      newSwatches.append('input')
        .attr('type', 'range')
        .attr('class', colorWheel.cx('theme-slider'))
        .on('input', function (d) {
          d.color.v = parseInt(this.value) / 100;
          colorWheel.dispatch.markersUpdated();
        })
        .on('change', function () {
          colorWheel.dispatch.updateEnd();
        });
  
      // Add color codes
      // 创建颜色代号
      newSwatches.append('input')
        .attr('type', 'text')
        .attr('class', colorWheel.cx('theme-value'))
        .on('focus', function () {
          // Like jQuery's .one(), attach a listener that only executes once.
          // This way the user can use the cursor normally after the initial selection.
          d3.select(this).on('mouseup', function () {
            d3.event.preventDefault();
            // Detach the listener
            d3.select(this).on('mouseup', null);
          })
          this.select();
        });
  
      swatches.exit().remove();
    });


    // 用来颜色的实时更新
    colorWheel.dispatch.on('markersUpdated.theme', function () {
      colorWheel.container.selectAll(colorWheel.selector('theme-swatch')).each(function (d, i) {
        switch (colorWheel.currentMode) {
          case ColorWheel.modes.TRIAD:
            this.style.order = this.style.webkitOrder = i % 3;
            break;
          default:
            this.style.order = this.style.webkitOrder = ColorWheel.markerDistance(i);
            break;
        }
      });

      // 色彩圆圈的颜色
      colorWheel.container.selectAll(colorWheel.selector('theme-color')).each(function (d) {
        var c = tinycolor({h: d.color.h, s: d.color.s, v: d.color.v});
        this.style.backgroundColor = c.toHexString();
      });
      // 滑动条的百分比
      colorWheel.container.selectAll(colorWheel.selector('theme-slider')).each(function (d) {
        var val = parseInt(d.color.v * 100);
        this.value = val;
        d3.select(this).attr('value', val);
      });
      // 颜色的色号
      colorWheel.container.selectAll(colorWheel.selector('theme-value')).each(function (d) {
        var c = tinycolor({h: d.color.h, s: d.color.s, v: d.color.v});
        this.value = c.toHexString();
      });
    });

  });
  
 
  export default ColorWheel