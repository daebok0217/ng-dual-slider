# ng-dual-slider
================

# ng-dual-slider directive on Angular &amp; Bootstrap 3

This direcitve support single slider or dual range slider.

To use, include "ng-dual-slider" as a dependency in your angular module. You can now use the "ng-dual-slider" directive as an attribute on ng-dual-slider elements.

# HOW TO USE

var app = angular.module('modulename', ['ng-dual-slider']);


<div class="row">

	<div class="col-sm-12">

		<div ng-dual-slider ranges="range.ranges" labels="hourLabel" expression="hourExpression" click-range="callbackClickRange" ispopover="true" editmode="range.editmode" min="0" max="24" step="0.5"></div>

	</div>

</div>

## labels

$scope.hourLabel = ['12a','','1a','','2a','','3a','','4a', '','5a','','6a','','7a','','8a','','9a', '', '10a','','11a','','12p','','1p','','2p','','3p','','4p','','5p','','6p','','7p','','8p','','9p','','10p','','11p','','12a'];

## expression
hourExpression = function(value){

    var hours = Math.floor(value),

        half = hours > 12 ? hours - 12 : hours,

        isHalf = (value - hours) > 0 ? true : false,

        ampm = (hours < 12) ? " am" : " pm";

    return (half === 0 ? 12 : half) + (isHalf ? ':30 ' : ' ') + ampm;

};

## click-range

callback function

## properties

ispopover = true or false

editmode = 'default'

min = minimum value

max = maximum value

step = step for the range





