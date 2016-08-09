/* ng-dual-slider - v1.0.0 - 02/12/2015 */
(function() {
    'use strict';

    angular.module('ng-dual-slider', []).directive('ngDualSlider', ['$compile', function($compile) {
        // test for mouse, pointer or touch
        var actions = window.navigator.pointerEnabled ? {
          start: 'pointerdown',
          move: 'pointermove',
          end: 'pointerup',
          over: 'pointerdown',
          out: 'mouseout'
        } : window.navigator.msPointerEnabled ? {
          start: 'MSPointerDown',
          move: 'MSPointerMove',
          end: 'MSPointerUp',
          over: 'MSPointerDown',
          out: 'mouseout'
        } : {
          start: 'mousedown touchstart',
          move: 'mousemove touchmove',
          end: 'mouseup touchend',
          over: 'mouseover touchstart',
          out: 'mouseout'
        },
        onEvent = actions.start,
        moveEvent = actions.move,
        offEvent = actions.end,
        overEvent = actions.over,
        outEvent = actions.out,

        // get standarised clientX and clientY
        client = function(f) {
            try {
                return [(f.clientX || f.originalEvent.clientX || f.originalEvent.touches[0].clientX), (f.clientY || f.originalEvent.clientY || f.originalEvent.touches[0].clientY)];
            } catch (e) {
                return ['x', 'y'];
            }
        },

        isNumber = function(n) {
            // console.log(n);
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        scopeOptions = {
            labels: '=labels', // to show labels (optional)
            ranges: '=ranges', // to set ranges
            expression: '=expression', // to display popover text,
            editmode: '=editmode', // click action whether it is to add or to remove or to move,
            clickRange: '=clickRange' // callback for mouse click event
        };

        var linker = function($scope, element, attributes){
          $scope.ispopover = false;
          $scope.callExpression = function(value){
            if(!angular.isDefined($scope.expression)){
              return value;
            }else{
              return $scope.expression(value);
            }
          };

          $scope.callClickRange = function(editmode, value){
            if(!angular.isDefined($scope.clickRange)){
              return null;
            }else{
              return $scope.clickRange(editmode, value);
            }
          };

          var ngdr_setting = {
              percentage:0,
              clickable:0,
              step: 1,
              total: 100,
              editmode: 'default',
              positions: []
          },

          // set options like step, min, max
          setOption = function(){
            var prev_step = ngdr_setting.step,
              prev_percentage = ngdr_setting.percentage;

            if(attributes.step !== prev_step || ngdr_setting.total !== (attributes.max - attributes.min)){
              ngdr_setting.step = attributes.step;
              ngdr_setting.total = (attributes.max - attributes.min) / attributes.step;
              ngdr_setting.percentage = 100 / ngdr_setting.total;
              ngdr_setting.clickable = 100 / (ngdr_setting.total + 1);
              
              // set padding to wrapper
              var $wrapper = angular.element(element.find('.ngdr-slider-wrapper'));
              $wrapper.css({
                padding: '0 ' + ngdr_setting.percentage / 2 + '%'
              });

              // attach graduations
              var $graduations = angular.element(element.find('.ngdr-slider-graduations')),
                graduations_percentage = 100 / (ngdr_setting.total + 1);
              $graduations.empty();
              for(var i = 0; i <= ngdr_setting.total; i++){
                var template = '<div class="ngdr-slider-graduation">';
                if (angular.isDefined($scope.labels))
                {
                  if (angular.isDefined($scope.labels[i]) && $scope.labels[i].length > 0)
                  {
                    template += '<div class="ngdr-slider-graduation-ruler"></div>' + $scope.labels[i];  
                  }
                }else{
                  template += '<div class="ngdr-slider-graduation-ruler"></div>' + (i / ngdr_setting.step);  
                }
                template += '</div>';
                $graduations.append(template);
              }

              // set width for each graduation
              var $graduation = angular.element($graduations.find('.ngdr-slider-graduation'));
              $graduation.css({
                width: graduations_percentage + '%'
              });
              changeValue();
            }
          },

          // changed range value
          changeValue = function(){
            // unbind events
            angular.element(element.find('.ngdr-slider-handler')).off(onEvent).off(overEvent).off(outEvent);

            // calculate position
            ngdr_setting.positions = [];
            angular.forEach($scope.ranges, function(key, value){
              var position = {
                start: key.start / ngdr_setting.step * ngdr_setting.percentage,
                end: key.end / ngdr_setting.step * ngdr_setting.percentage,
              }
              ngdr_setting.positions.push(position);
            });

            // bind events
            angular.element(element.find('.ngdr-slider-handler')).bind(onEvent, function(event){
              angular.element(event.target).addClass('ngdr-slider-active');
            }).bind(overEvent, function(event){
              angular.element('.ngdr-slider-hover').removeClass('ngdr-slider-hover');
              angular.element(event.target).addClass('ngdr-slider-hover');
            }).bind(outEvent, function(event){
              angular.element('.ngdr-slider-hover').removeClass('ngdr-slider-hover');
            });

            if(ngdr_setting.ispopover){
              angular.element(element.find('.ngdr-slider-handler'));
            }
          },

          // get handlers'info like index and mode('start' or 'mode')
          getHandlerInfo = function(elem){
            if(elem.length){
              var $parent = angular.element(elem.parent());
              if($parent.hasClass('ngdr-slider-range')){
                var info = {
                  index: parseInt($parent.attr('ng-index')),
                  mode: elem.hasClass('ngdr-slider-start') ? 'start' : 'end'
                }
                return info;  
              }
            }
            return null;
          };

          // get halders position
          $scope.getPosition = function(index){
            var css = {
              left: ngdr_setting.positions[index].start + '%',
              width: ngdr_setting.positions[index].end - ngdr_setting.positions[index].start + '%',
            }
            return css;
          };

          // observe min
          attributes.$observe('min', function(val) {
              if (angular.isDefined(val)) {
                setOption();
              }
          });

          // observe max
          attributes.$observe('max', function(val) {
              if (angular.isDefined(val)) {
                setOption();
              }
          });

          // observe step
          attributes.$observe('step', function(val) {
              if (angular.isDefined(val)) {
                setOption();
              }
          });

          // observe popover
          attributes.$observe('ispopover', function(val) {
              if (angular.isDefined(val)) {
                $scope.ispopover = val;
              }
          });

          // changed editmode
          $scope.$watch('editmode', function(val){
              ngdr_setting.editmode = val;
          });

          // changed range value
          $scope.$watch('ranges', changeValue, true);

          element.addClass('ngdr-slider');

          // cancel to drag text or to select text
          angular.element('body').bind('selectstart', function() {
              return false;
          });

          // detect mousemove event and move range's value when handler is hovered
          angular.element('body').bind(moveEvent, function(event){
            var $handler = angular.element(element.find('.ngdr-slider-active'));
            if($handler.length){
              var $slider = angular.element(element.find('.ngdr-slider-bar')),
                currentClick = client(event),
                currentStep = 0;

              var sliderWidth = $slider.outerWidth(),
                currentStep =Math.floor(((currentClick[0] - $slider.offset().left) / sliderWidth * 100) / ngdr_setting.clickable);
                
              if(currentStep < 0 || isNaN(currentStep)){
                currentStep = 0;
              }else if( currentStep > ngdr_setting.total){
                currentStep = ngdr_setting.total;
              }
              var info = getHandlerInfo($handler);
              if(info){
                var start = $scope.ranges[info.index].start / ngdr_setting.step,
                    end = $scope.ranges[info.index].end / ngdr_setting.step;

                switch(info.mode){
                  case 'start':
                    if(currentStep >= (end - 1)){
                      currentStep = end - 1;
                    }
                    if(currentStep == ngdr_setting.total){
                      currentStep = ngdr_setting.total - 1;
                    }
                    if (angular.isDefined($scope.ranges[info.index - 1])) {
                      var prevEnd = ($scope.ranges[info.index - 1].end / ngdr_setting.step) + 1;
                      if(currentStep < prevEnd){
                        currentStep = prevEnd;
                      }
                    }
                    break;  
                  case 'end':
                    if(currentStep < (start + 1)){
                      currentStep = start + 1;
                    }
                    if (angular.isDefined($scope.ranges[info.index + 1])) {
                      var nextStart = ($scope.ranges[info.index + 1].start / ngdr_setting.step - 1);
                      if(currentStep > nextStart){
                        currentStep = nextStart;
                      }
                    }
                    break;
                }
                ngdr_setting.positions[info.index][info.mode] = currentStep * ngdr_setting.percentage;
                $scope.ranges[info.index][info.mode] = currentStep * ngdr_setting.step;

                $scope.$apply();
              }
            }
          })
          // detect mouseup and clear hanlder's hover and hide popover
          .bind(offEvent, function(event){
            angular.element('.ngdr-slider-active').removeClass('ngdr-slider-active');
          })
          // detect mouseup and clear hanlder's hover and hide popover
          .bind('mouseleave', function(event){
            angular.element('.ngdr-slider-active').removeClass('ngdr-slider-active');
          });

          // detect mouseup for bar and move range's value
          angular.element(element.find('.ngdr-slider-bar')).bind(offEvent, function(event){
            var $handler = angular.element(element.find('.ngdr-slider-active'));
            if($handler.length == 0){
              var $slider = angular.element(element.find('.ngdr-slider-bar')),
                sliderWidth = $slider.outerWidth(),
                currentClick = client(event),
                currentStep = Math.floor(((currentClick[0] - $slider.offset().left) / sliderWidth * 100) / ngdr_setting.clickable),
                currentGap,
                info = {
                  index: 0,
                  mode: 'start'
                },
                handler = -1;

              if(currentStep < 0){
                currentStep = 0;
              }

              angular.forEach($scope.ranges, function(key, value){
                var start_gap = Math.abs((key.start / ngdr_setting.step) - currentStep);
                var end_gap = Math.abs((key.end / ngdr_setting.step) - currentStep);
                if(!currentGap || currentGap > start_gap || currentGap > end_gap){
                  if(start_gap > end_gap){
                    info.mode = 'end';
                    currentGap = end_gap;
                  }else{
                    info.mode = 'start';
                    currentGap = start_gap;
                  }
                  info.index = value;
                }
                if(currentStep >= Math.abs(key.start / ngdr_setting.step) && currentStep <= Math.abs(key.end / ngdr_setting.step)){
                  handler = value;
                }
              });
              var editmode = ngdr_setting.editmode;
              // add range mode
              if(ngdr_setting.editmode == 'add'){
                if(handler < 0){
                  var new_range = {
                    start: ((currentStep >= ngdr_setting.total) ? ngdr_setting.total - 1 : currentStep) * ngdr_setting.step,
                    end: ((currentStep + 2 > ngdr_setting.total) ? ngdr_setting.total : currentStep + 2)  * ngdr_setting.step
                  };
                  if($scope.ranges && $scope.ranges[info.index]){
                    if(new_range.start < $scope.ranges[info.index][info.mode]){
                      // insert new range before the range
                      if($scope.ranges[info.index].start < new_range.end){
                        new_range.end = $scope.ranges[info.index].start;
                      }
                      $scope.ranges.splice(info.index, 0, new_range);
                    }else if(new_range.start > $scope.ranges[info.index][info.mode]){
                      // insert new range after the range
                      if($scope.ranges[info.index+1]){
                        if(new_range.end > $scope.ranges[info.index+1].start){
                          new_range.end = $scope.ranges[info.index+1].start;
                        }
                      }
                      if(new_range.end > ngdr_setting.total){
                        new_range.end = ngdr_setting.total;
                      } 
                      $scope.ranges.splice(info.index + 1, 0, new_range);
                    }
                  }else{
                    // insert new range the position
                    $scope.ranges = [];
                    if(new_range.end > ngdr_setting.total){
                      new_range.end = ngdr_setting.total;
                    }
                    $scope.ranges.push(new_range);
                  }
                  $scope.editmode = 'default';
                }
              // remove range mode
              }else if(ngdr_setting.editmode == 'remove'){
                if(handler >= 0){
                  ngdr_setting.positions.splice(info.index, 1);
                  $scope.ranges.splice(handler, 1);
                  if($scope.ranges.length == 0){
                    $scope.ranges = null;
                  }
                  $scope.editmode = 'default';
                }
              // click and move the range handler
              }else{
                // check the value whether it is same or less than previous range's end. if it is, set the value as previous range's end + 1.
                if($scope.ranges[info.index-1] && currentStep <= ($scope.ranges[info.index-1].end / ngdr_setting.step)){
                  currentStep = ($scope.ranges[info.index-1].end / ngdr_setting.step) + 1;
                }
                ngdr_setting.positions[info.index][info.mode] = currentStep * ngdr_setting.percentage;
                $scope.ranges[info.index][info.mode] = currentStep * ngdr_setting.step;
              }
              $scope.$apply();
              // callback for event
              $scope.callClickRange(editmode, currentStep);
            }
          });

          $scope.$on("destroy", function(){
            angular.element(element.find('.ngdr-slider-bar')).off(offEvent);
            angular.element(element.find('.ngdr-slider-handler')).off(onEvent).off(overEvent).off(outEvent);
            angular.element('body').off('selectstart').off(moveEvent).off(offEvent).off('mouseleave');
          });
        }

        return {
            restrict: 'A',
            template: ['<div class="ngdr-slider-wrapper">',
                '<div class="ngdr-slider-bar">',
                  '<div class="ngdr-slider-range" ng-repeat="range in ranges" ng-index={{$index}} ng-style="getPosition($index)">',
                    '<div class="ngdr-slider-handler ngdr-slider-start">',
                      '<div class="popover top in fade" ng-if="ispopover" ng-dual-slider-popover-size>',
                        '<div class="arrow"></div>',
                        '<div class="popover-inner">',
                          '<div class="popover-content" ng-bind="callExpression(range.start)"></div>',
                        '</div>',
                      '</div>',
                    '</div>',
                    '<div class="ngdr-slider-handler ngdr-slider-end">',
                      '<div class="popover top in fade" ng-if="ispopover" ng-dual-slider-popover-size>',
                        '<div class="arrow"></div>',
                        '<div class="popover-inner">',
                          '<div class="popover-content" ng-bind="callExpression(range.end)"></div>',
                        '</div>',
                      '</div>',
                    '</div>',
                  '</div>',
                '</div>',
                '</div>',
                '<div class="ngdr-slider-graduations">',
                '</div>'
            ].join(''),
            scope: scopeOptions,
            link: linker
        };
    }]).directive("ngDualSliderPopoverSize",['$window', function($window) {
      // resize for popover
      return{
        link:function($scope, element, attributes){
          $scope.width = 0;
          $scope.$watch(function(){
            var width = element.width();
            if(width > 0){
              $scope.width = width;
              element.css('margin-left', '-' + width / 2 + 'px');
            }
          });
        }        
      }
    }]);
}());

