/*global jQuery:false, ga:false, $:false, Modernizr:false, TimelineMax:false, TweenLite:false */
var app = (function ($, Modernizr, TimelineMax, TweenLite, undefined) {
    'use strict';

    var self = {},
        touchClick = (Modernizr.touch) ? 'touchend click' : 'click',
        chartTimeline,
        $timelineLinks,
        plusTimeline,
        $pointTitle,
        $pointDesc,
        $chart,
        $startScreen,
        $keyScreen,
        $plus,
        anyModalViewed = false,
        debug = false;

    function log(msg) {
        if (debug && typeof console !== 'undefined' && console.log) {
            console.log(msg);
        }
    }

    self.init = function () {
        $pointTitle = $('#pointTitle').first();
        $pointDesc = $('#pointDesc').first();
        $chart = $('#chart');
        $startScreen = $('#start');
        $keyScreen = $('#key');
        $plus = $('#plus');

        if (!Modernizr.inlinesvg) {
            trackEvent('FeatureCheck', 'Error', 'No Inline SVG');
            $('#start').html('<div class="layoutError">Sorry, your browser does not support this feature.<br/>You\'ll be redirected to 360YieldCenter.com in a few seconds.</div>');
            setTimeout(function () {
                window.location = window.location.protocol + '//360yieldcenter.com/blog/five-tips-for-smarter-nitrogen-management/';
            }, 5000);
            return;
        }

        $('.tapClick').text(
            ((Modernizr.touch) ? 'Tap' : 'Click') + ' to Learn More'
        );

        setupModals();

        setupCornPillars();

        setupTimelines();

        setupClicks();

        setupSwipes();
    };

    function trackEvent(interactionObject, actionType, label) {
        if (window.ga) {
            ////log('tracking: ' + interactionObject + ' ' + actionType + ' ' + label);
            window.ga('send', 'event', interactionObject, actionType, label);
        }
    }

    function setupClicks() {
        $('#home').on(touchClick, function (e) {
            e.stopPropagation(); //stop bubbles
            e.preventDefault(); //prevent the default action
            ////log('start button clicked');

            //go to the chart key screen
            goDirectlyToLabel('key');
        });

        $('.goHome').on(touchClick, function (e) {
            e.stopPropagation(); //stop bubbles
            e.preventDefault(); //prevent the default action

            goDirectlyToLabel('start');
        });

        $('#startButton').on(touchClick, function (e) {
            e.stopPropagation(); //stop bubbles
            e.preventDefault(); //prevent the default action
            //log('start button clicked');

            $(document).scrollTop(0);

            goForward(e);

            //chartTimeline.tweenFromTo(0, 'key',
            //    {
            //        immediateRender:true,
            //        onComplete:function completeStartButton(){ log('tweened from start to key complete');}
            //    });

            //updateProgressBarCallback('key', 'startButton');
        });

        $('.curtain.left .go').on(touchClick, goBack);
        $('.curtain.right .go').on(touchClick, goForward);

        //svg has to have a click event
        //no touchClick there
        $plus.on('click', function (e) {
            e.stopPropagation(); //stop bubbles
            e.preventDefault(); //prevent the default action

            //show modal
            var currentLabel = chartTimeline.currentLabel();
            //log('clicked the plus! show a modal for ' + currentLabel);

            showModal(currentLabel);
        });

        $('#contactBtn').on(touchClick, function () {
            trackEvent('goal', 'click', 'Contact');
            window.location = window.location.protocol + '//360yieldcenter.com/nitrogen-contact/';
        });

        //$('#ycBtn').on('click', function () {
        //    trackEvent('goal', 'click', '360YieldCenter.com');
        //    window.open('http://360yieldcenter.com/');
        //});

        ////resizeContainer();
        ////$window.smartResize(resizeContainer);
        //
        ////deep links checks hash on load
        //var hash = window.location.hash;
        //if (hash && hash.length > 1){
        //	var hashLabel = hash.replace('#', '').trim();
        //	log('loading via url: ' + hashLabel);
        //	goDirectlyToLabel(hashLabel);
        //}
    }

    function setupSwipes() {
        //$('.curtain.left .go').on(touchClick, goBack);
        //$('.curtain.right .go').on(touchClick, goForward);

        function swipedetect(el, callback) {
            var touchSurface = el,
                swipeDir,
                startX,
                startY,
                distX,
                distY,
                threshold = 150, //required min distance traveled to be considered swipe
                restraint = 100, // maximum distance allowed at the same time in perpendicular direction
                allowedTime = 300, // maximum time allowed to travel that distance
                elapsedTime,
                startTime,
                handleSwipe = callback || function (swipedir, e) {};

            touchSurface.addEventListener('touchstart', function (e) {

                if (!e.changedTouches){return;}


                var touchObj = e.changedTouches[0];
                swipeDir = 'none';

                startX = touchObj.pageX;
                startY = touchObj.pageY;
                startTime = new Date().getTime(); // record time when finger first makes contact with surface
            }, false);

            touchSurface.addEventListener('touchmove', function (e) {
                //e.preventDefault(); // prevent scrolling when inside DIV
            }, false);

            touchSurface.addEventListener('touchend', function (e) {
                var touchObj = e.changedTouches[0];
                distX = touchObj.pageX - startX; // get horizontal dist traveled by finger while in contact with surface
                distY = touchObj.pageY - startY; // get vertical dist traveled by finger while in contact with surface
                elapsedTime = new Date().getTime() - startTime; // get time elapsed
                if (elapsedTime <= allowedTime) { // first condition for swipe met
                    if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) { // 2nd condition for horizontal swipe met
                        swipeDir = (distX < 0) ? 'left' : 'right'; // if dist traveled is negative, it indicates left swipe
                    }
                    else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) { // 2nd condition for vertical swipe met
                        swipeDir = (distY < 0) ? 'up' : 'down'; // if dist traveled is negative, it indicates up swipe
                    }
                }
                handleSwipe(swipeDir, e);

            }, false);
        }

        //USAGE:
        /*
         var el = document.getElementById('someel')
         swipedetect(el, function(swipedir){
         swipedir contains either "none", "left", "right", "top", or "down"
         if (swipedir =='left')
         alert('You just swiped left!')
         })
         */
        var el = document.getElementsByTagName('main')[0];
        swipedetect(el, function (swipeDirection, e) {
            //log('swiped ' + swipeDirection);
            if (swipeDirection === 'right') {
                goBack(e);
                e.preventDefault();
            }
            else if (swipeDirection === 'left') {
                goForward(e);
                e.preventDefault();
            }
        });

    }

    function setupCornPillars() {

        //log('creating a right corn pillar');
        //clone the pillar
        //svg clones don't behave quite right in jQuery land
        //so use attr to set the class and id
        var $clone = $('.cornPillar')
            .clone()
            .attr('id', 'pillarRight')
            .attr('class', 'cornPillar right')
            .insertAfter($('.cornPillar'));

        //flip it so it looks different
        $clone.find('g').first().attr('transform', 'translate(140,0) scale(-1,1)');
    }

    function setupTimelines() {

        var lastLabel, tl, self = this;

        //log('window width: ' + getWindowWidth() + ', height: ' + getWindowHeight());

        //pulse the plus
        plusTimeline = new TimelineMax({paused: true});
        plusTimeline
            .fromTo($plus, 0.5, {scale: 1}, {scale: 0.9})
            .to($plus, 0.5, {scale: 1})
            .repeat(-1);
        plusTimeline.pause();

        tl = new TimelineMax({paused: true});

        //make sure the labels line up with the captions
        //#caption-LABELNAME

        //setup
        tl
            .addLabel('start', 0)
            .call(startTimelineCallback)
            .set([$plus], {opacity: 0, transformOrigin: '50% 50%'}, 0)
            .set(['#kernel', '#nitrogenBalls'], {y: -100, opacity: 0, transformOrigin: '50% 50%'}, 0)
            .set(['#cornv4', '#cornv6', '#cornv8', '#cornv10', '#cornV12'], {
                opacity: 0,
                transformOrigin: '50% 100%'
            }, 0);

        lastLabel = 'start';


        //1 key
        tl
            .set($plus, {opacity: 0}, lastLabel)

            //.set($keyScreen, {display: 'block'}, lastLabel)
            .call(function () {
                $startScreen.fadeOut();
                //log('faded startscreen');
            }, [], self, lastLabel)
            .fromTo($keyScreen, 0.5, {display: 'block', opacity: 0}, {display: 'block', opacity: 1, left: 0}, lastLabel)
            .fromTo('nav', 0.5, {top: '-200px', opacity: 0}, {top: 0, opacity: 1}, lastLabel)
            .addLabel('key', 1)
            .set($startScreen, {display: 'none'}, 'key');

        lastLabel = 'key';

        //2 guy
        tl
            .set('#main', {display: 'block', left: 0, opacity: 1}, lastLabel)
            .to($keyScreen, 0.5, {left: -getWindowWidth()}, lastLabel)
            .set($keyScreen, {display: 'none'}, lastLabel + '+=0.6')
            .fromTo('#guy', 0.5, {opacity: 0}, {opacity: 1}, lastLabel)
            .staggerFromTo(['#think1', '#think2', '#think3', '#think4'], 0.5, {opacity: 0}, {opacity: 1}, 0.2, lastLabel + '+=0.5')
            .addLabel('guy', Math.roundUp(tl.totalDuration()));

        lastLabel = 'guy';

        //3 nitrogen balls
        tl
            .to('#guy', 0.2, {opacity: 0}, lastLabel) //hide guy
            .fromTo('#nitrogenBalls', 0.5, {y: -100, opacity: 0}, {y: 0, opacity: 1}, lastLabel) //show Ns
            .addLabel('Ns', Math.roundUp(tl.totalDuration()));

        lastLabel = 'Ns';

        //4 kernel
        tl
            .to('#nitrogenBalls', 0.5, {y: 250, scale: 0.01, transformOrigin: '50% 50%'}, lastLabel)
            .set('#nitrogenBalls', {opacity: 0}, lastLabel + '+=0.5')
            .fromTo('#kernel', 0.5, {y: -100, opacity: 0}, {y: 0, opacity: 1}, lastLabel)
            .to($chart, 1, {left: getChartPosition('#dots-kernel')/*30*/}, lastLabel)
            .to('#dots-kernel', 0.5, {opacity: 1}, lastLabel + '+=0.75')
            .addLabel('kernel', Math.roundUp(tl.totalDuration()));

        lastLabel = 'kernel';

        //5 spring - kernel to corn
        //spring sidedress application
        tl
            .set('#dots-kernel', {opacity: 0}, lastLabel)
            .to('#kernel', 0.5, {y: 230, scale: 0.1, transformOrigin: '50% 50%'}, lastLabel + '+=0.2')
            .set('#kernel', {opacity: 0}, lastLabel + '+=0.9')
            .fromTo('#cornv4', 0.5, {opacity: 0, transformOrigin: '50% 100%', scale: 0.1}, {
                scale: 1,
                transformOrigin: '50% 100%',
                opacity: 1
            }, lastLabel + '+=0.9')
            .to($chart, 1, {left: getChartPosition('#dots5')/*'-180px'*/}, lastLabel)
            .to('#dots5', 0.5, {opacity: 1}, lastLabel + '+=1.2')
            .addLabel('spring', Math.roundUp(tl.totalDuration()));

        lastLabel = 'spring';

        //6 v6
        //impact of rainfall
        tl
            .set('#dots5', {opacity: 0}, lastLabel)
            .call(makeItRain, [], self, lastLabel)
            .to('#cornv4', 0.5, {opacity: 0}, lastLabel)
            .fromTo('#cornv6', 1, {opacity: 0, transformOrigin: '50% 100%', scale: 0.8}, {
                transformOrigin: '50% 100%',
                scale: 1,
                opacity: 1
            }, lastLabel + '+=0.75')
            .to($chart, 1, {left: getChartPosition('#dots6')/*'-375px'*/}, lastLabel)
            .to('#rainGauge', 0.5, {opacity: 1}, lastLabel + '+=1.2')
            .to('#rainDrop', 0.5, {opacity: 1}, lastLabel + '+=3')
            .addLabel('rain', Math.roundUp(tl.totalDuration()));

        lastLabel = 'rain';

        //7 v8
        //nitrate testing
        tl
            .call(removeRain, [], self, lastLabel)
            .set('#dots6', {opacity: 0}, lastLabel)
            .to('#cornv6', 0.5, {opacity: 0}, lastLabel)
            .fromTo('#cornv8', 1, {opacity: 0, transformOrigin: '50% 100%', scale: 0.8}, {
                scale: 1,
                transformOrigin: '50% 100%',
                opacity: 1
            }, lastLabel + '+=0.1')
            .to($chart, 1, {left: getChartPosition('#dots7')/*'-570px'*/}, lastLabel)
            .to('#dots7', 0.5, {opacity: 1}, lastLabel + '+=1.2')
            .addLabel('nTest', Math.roundUp(tl.totalDuration()));

        lastLabel = 'nTest';

        //8 revised N Rx
        //still v8
        tl
            .set('#dots7', {opacity: 0}, lastLabel)
            .to($chart, 1, {left: getChartPosition('#dots8')/*'-775px'*/}, lastLabel)
            .to('#dots8', 0.5, {opacity: 1}, lastLabel + '+=1.2')
            .addLabel('nRx', Math.roundUp(tl.totalDuration()));

        lastLabel = 'nRx';

        //9 v10
        //late season application
        tl
            .set('#dots8', {opacity: 0}, lastLabel)
            .to('#cornv8', 0.5, {opacity: 0}, lastLabel)
            .fromTo('#cornv10', 1, {opacity: 0, transformOrigin: '50% 100%', scale: 0.8}, {
                scale: 1,
                transformOrigin: '50% 100%',
                opacity: 1
            }, lastLabel + '+=0.1')
            .to($chart, 1, {left: getChartPosition('#dots9')}, lastLabel)
            .to('#dots9', 0.5, {opacity: 1}, lastLabel + '+=1.2')
            .addLabel('lateSeason', Math.roundUp(tl.totalDuration()));

        lastLabel = 'lateSeason';

        //10 N placement
        //still v10
        tl
            .set('#dots9', {opacity: 0}, lastLabel)
            .to($chart, 1, {left: getChartPosition('#dots10')/*'-1170px'*/}, lastLabel)
            .to('#dots10', 0.5, {opacity: 1}, lastLabel + '+=1.2')
            .addLabel('nPlacement', Math.roundUp(tl.totalDuration()));

        lastLabel = 'nPlacement';

        //11 harvest the difference
        tl
            .set('#dots10', {opacity: 0}, lastLabel)
            .to('#cornv10', 0.5, {opacity: 0}, lastLabel)
            .fromTo('#cornv12', 1, {opacity: 0, transformOrigin: '50% 100%', scale: 0.8}, {
                scale: 1,
                transformOrigin: '50% 100%',
                opacity: 1
            }, lastLabel + '+=0.1')
            .to($chart, 1, {left: getChartPosition('#dots11')/*'-1370px'*/}, lastLabel)
            .to('#dots11', 0.5, {opacity: 1}, lastLabel + '+=1.2')
            .addLabel('harvest', Math.roundUp(tl.totalDuration()));

        lastLabel = 'harvest';

        ////smarterN
        //tl
        //	.set('#dots11', {opacity: 0}, lastLabel)
        //	.to($chart, 1, {left: -Math.ceil($chart.width() * 0.8) /*'-1450px'*/}, lastLabel)
        //	.addLabel('smarterN', Math.roundUp(tl.totalDuration()));
        //
        //lastLabel = 'smarterN';

        //12 learn more buttons
        tl
            .to('#main', 0.5, {opacity: 0})
            .fromTo('#learnMore', 1, {left: getWindowWidth(), opacity: 0, display: 'block'}, {
                left: 0,
                opacity: 1,
                display: 'block'
            }, lastLabel)
            .addLabel('end', Math.roundUp(tl.totalDuration())); //the last one needs extra time for some reason

        //save it back to the parent variable so the rest of the app can use it
        chartTimeline = tl;

        var labels = chartTimeline.getLabelsArray();
        var $footerNav = $('footer nav');

        //go through ALL the labels in the timeline
        for (var i = 0, len = labels.length; i < len; i++) {
            var link = document.createElement('a'),
                labelName = labels[i].name;
            link.id = 'timeline-' + labelName;
            //link.href = '#' + labelName;
            link.setAttribute('data-label', labelName);
            link.label = labelName;
            if (i > 0) {
                link.title = i + ' of ' + (len - 1);
            }
            $footerNav.append(link);

            //log('adding callbacks for ' + labelName);

            chartTimeline.call(labelDoneCallback, [labelName, 'timeline'], null, labelName + '-=0.001');
            chartTimeline.addCallback(labelStartCallback, labelName, [labelName, 'timeline']);

            //log('label name: ' + labelName + ', time: ' + labels[i].time); //or in JS, console.log('label name: ' + labels[i].name + ', time: ' + labels[i].time);
        }

        ///add callbacks on the labels here

        var endLink = document.createElement('a');
        endLink.class = endLink.label = 'end';
        endLink.setAttribute('data-label', 'end');
        $footerNav.append(endLink);

        //add click events
        $timelineLinks = $('footer>nav>a');
        $timelineLinks.on(touchClick, goTo);

    }

    function startTimelineCallback() {
        setTimeout(function startTimelineTimeout() {
            //async
           //log('startTimelineCallback Timeout');

            $('.actor').css('opacity', 0);
            $('main .infoFrame').hide().css('left', getWindowWidth());
            $('#start, #start .infoFrame').show();
            $chart.css('left', getWindowWidth());
            removeRain();

        }, 0);
    }

    // shows coords relative to my svg container
    function getSVGContainerCoords(x, y, ctm) {
        var xn = ctm.e + x * ctm.a;
        var yn = ctm.f + y * ctm.d;
        return {x: xn, y: yn};
    }

    function getChartPosition(dotId) {
        var svgCircle = $(dotId + ' circle')[0];
        if (typeof undefined === svgCircle.getCTM){
            return null;
        }

        var cx = +svgCircle.getAttribute('cx');
        var cy = +svgCircle.getAttribute('cy');
        var ctm = svgCircle.getCTM();
        var coords = getSVGContainerCoords(cx, cy, ctm);

        var dotX = -(Math.ceil(coords.x));

        var offset = 30;

        var spacing = $('#actors').width() / 2;
        dotX += offset + spacing;

        //log(dotId + ' ' + dotX);

        return dotX;
    }

    //do not pass go
    //do not collect 200
    //go straight to the frame
    function goTo(e) {
        e.stopPropagation(); //stop bubbles
        e.preventDefault(); //prevent the default action

        var self = this;

        //var $this = $(self);
        var label = self.label || self.getAttribute('data-label') || '';

        goDirectlyToLabel(label);
        return false;
    }

    function goDirectlyToLabel(label) {
        label = label.trim();

        var foundPosition = -1,
            lastLabel = '',
            labels = chartTimeline.getLabelsArray();

        //make sure it's real
        //cause this can come from the url hash

        for (var i = 0, len = labels.length; i < len; i++) {
            if (labels[i].name.toLowerCase() === label.toLowerCase()) {
                label = labels[i].name; //make sure casing and such are right
                foundPosition = i;
                break;
            }
        }
        if (foundPosition < 0) {
            //log(label + ' not found');
            //window.location.hash = '';
            return false;
        }

        $plus.css('opacity', 0);
        $('#captions>div').css('opacity', 0);

        if (foundPosition === 0) {
            //back to start
            startTimelineCallback();
            lastLabel = label;
        }
        else {
            lastLabel = labels[foundPosition - 1].name + '+=0.1';
            //lastLabel = label + '-=0.25';
        }

        var tweenVars = {
            onStart: updateProgressBarCallback,
            onStartParams: [label, 'goDirectStart'],
            onComplete: updateProgressBarCallback,
            onCompleteParams: [label, 'goDirectComplete']
        };

        chartTimeline.tweenFromTo(lastLabel, label, tweenVars);

        return false;
    }

    function goBack(e) {
        e.stopPropagation(); //stop bubbles
        e.preventDefault(); //prevent the default action

        var label = chartTimeline.getLabelBefore();

        if (!label || label === null) {
            //log('going back to freakin nothin.');
            return false;
        }

        hideCaption(label);

        //log('back to ' + label);
        goDirectlyToLabel(label);

        //chartTimeline.pause(label, false);
        //updateProgressBarCallback(label, 'goBack');
        return false;
    }

    function goForward(e) {
        e.stopPropagation(); //stop bubbles
        e.preventDefault(); //prevent the default action

        //if (chartTimeline.isActive()){
        //	//still running
        //	//log('still running! pausing at ' + lbl);
        //	//chartTimeline.pause(lbl);
        //	return false;
        //}

        var lbl = chartTimeline.getLabelAfter();
        if (!lbl || lbl === null) {
            //log('no label to go forward to!');
            return false;
        }
        //if (lbl === 'end')
        //{
        //	//lbl = chartTimeline.totalDuration();
        //	//log('playing this out till the end: ' + lbl);
        //	//return false;
        //}

        var tweenVars = {
            onStart: updateProgressBarCallback,
            onStartParams: [lbl, 'goForwardStart'],
            onComplete: updateProgressBarCallback,
            onCompleteParams: [lbl, 'goForwardComplete']
        };

        //log('goForward to ' + lbl);

        //before we move, update the progress indicators
        //this will make sure the indicators change right away
        //instead of just at the end of the tween
        //updateProgressBarCallback(lbl, 'forwardClick');

        chartTimeline.tweenTo(lbl, tweenVars);

        //chartTimeline.play(null, false);
        return false;
    }

    function updateProgressBarCallback(label, type) {
        setTimeout(function async() {
            //cheap async

            //log('updateProgressBarCallback timeout: ' + type + ' - ' + label + ' - current position: ' + chartTimeline.currentLabel());

            if ($timelineLinks) {
                $timelineLinks.removeClass('on');
            }
            if (label) {
                $('#timeline-' + label).addClass('on');
            }

            if (chartTimeline.getLabelAfter() !== null) {
                $('.curtain.right .go').removeClass('off');
            }
            else {
                $('.curtain.right .go').addClass('off');
            }
            //log('updateProgressBarCallback timeout DONE');

        }, 0);
        //log('updateProgressBarCallback sync called');
        //return true;
    }

    function labelStartCallback(label, type) {
        setTimeout(function async() {
            //log('labelStartCallback ' + label + ' from ' + type);
            //cheap async
            hideCaption(label);
            plusTimeline.pause();
            if ($plus.length) {
                TweenLite.to($plus, 0.25, {opacity: 0});
            }
        }, 0);
    }

    function labelDoneCallback(label, type) {
        setTimeout(function async() {
            //log('label done ' + label + ' from ' + type);

            trackEvent('waypoint', 'view', label);

            //cheap async
            showCaption(label);
            if ($plus.length) {
                TweenLite.fromTo($plus, 0.5, {opacity: 0}, {
                    opacity: 1, onComplete: function () {
                        plusTimeline.play();
                    }
                });
            }
        }, 20); //a little after labelStart
    }

    function showCaption(label) {
        //log('showing caption for ' + label);

        if (label === 'start' || label === 'key' || label === 'end') {
            if ($plus.length){
                $plus.hide();
            }
            $('#captions').hide();
            return;
        }
        else {
            $plus.show();
            $('#captions').show();
        }

        $('#captions div').hide();

        var $caption = $('#caption-' + label);
        if ($caption.length) {
            $caption.show();
            TweenLite.fromTo($caption, 0.25, {top: '70px', opacity: 0}, {top: 0, opacity: 1});
        }

        var $flag = $('#learnMoreFlag');
        if (!anyModalViewed && label === 'guy') {
            setTimeout(function () {
                if ($flag.length) {
                    $flag.show();
                    TweenLite.fromTo($flag, 1, {left: getWindowWidth(), opacity: 0}, {left: 30, opacity: 0.9});
                }
            }, 500);
        }
        else {
            $flag.hide();
        }

        if (label === 'rain') {
            makeItRain();
        }
        else {
            removeRain();
        }
    }

    function hideCaption(label) {
        var $caption = $('#caption-' + label);
        if ($caption.length) {
            TweenLite.fromTo($caption, 0.2, {top: 0, opacity: 1}, {top: '100px', opacity: 0});
        }
    }

    function setupModals() {
        $('.modalClose').on('click', function () {
            $(this).parents('.modal').fadeOut();
        });
    }

    function showModal(label) {
        anyModalViewed = true;

        $('#learnMoreFlag').css('opacity', 0).css('left', getWindowWidth());

        var $modal = $('#modal-' + label);
        $modal.fadeIn();

        trackEvent('modal', 'view', label);
    }

    function getWindowWidth() { return Math.ceil($(window).outerWidth(true)); }

    //	function resizeContainer(){
    //		var headerHeight = $header.outerHeight(),
    //			footerHeight = $footer.outerHeight(),
    //			containerHeight = Math.floor($window.height() - headerHeight - footerHeight);
    //			//containerWidth = Math.floor($window.width());
    //
    //		log('resizing main container to ' + containerHeight);
    //		////////////$mainContainer.height(containerHeight);
    //
    //		//$chart.width(containerWidth);
    //		//$chart.height(containerHeight);
    //
    //		//var waves = SVG('waves');
    //		//waves.cx($window.width()/2);
    //
    //		//var rainPuddle = document.getElementById('rainPuddle');
    ////
    ////		var top = $('#rainPuddle').css('top');
    ////log(top);
    ////		$ground.css('top', Math.floor(top));
    ////
    ////		var puddle = SVG('rainPuddle');
    ////
    //
    //	}

    function makeItRain() {
        //log('*MAKIN IT RAIN!*');

        var $rainField = $('#rainField'),
            context = null,
            particleArray = [],
            windowWidth = getWindowWidth(),
            maxParticleCount = Math.ceil(windowWidth / 2),
            animTimerId;

        if ($rainField.length > 0) {
            //log('its already raining.');
            return;
        }

        var groundHeight = $('#ground').height();

        $rainField = $('<canvas id="rainField"></canvas>').appendTo('#main');
        context = $rainField.get(0).getContext('2d');
        context.canvas.width = windowWidth;
        context.canvas.height = $('#main').height();

        for (var i = 0; i < maxParticleCount; i++) {
            particleArray[particleArray.length] = new Particle();
        }

        //particleTimer = setInterval(addParticle, 100);
        animTimerId = window.requestAnimationFrame(animate);

        function animate() {
            update();
            paint();
            animTimerId = window.requestAnimationFrame(animate);
        }

        //function addParticle() {
        //	particleArray[particleArray.length] = new Particle();
        //	if (particleArray.length == maxParticleCount)
        //		clearInterval(particleTimer);
        //}

        function Particle() {
            this.x = Math.round(Math.random() * context.canvas.width);
            this.y = -Math.round(Math.random() * context.canvas.height);
            this.height = Math.round(Math.random() * 15) + 4;
            //this.drift = 0;
            this.speed = Math.round(Math.random() / 5) + 15;
            //this.dead = false;
        }

        function update() {
            var ch = context.canvas.height;
            //cw = context.canvas.width;

            for (var i = 0, len = particleArray.length; i < len; i++) {
                var p = particleArray[i];
                if (p.y < ch) {

                    p.y += p.speed;

                    if (p.y > ch) {
                        //p.dead = true;
                        p.y = -1;
                    }

                    //p.x += p.drift;
                    //if (p.x > cw)
                    //	p.x = 0;
                }
            }
        }

        function paint() {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            for (var i = 0, len = particleArray.length; i < len; i++) {
                var p = particleArray[i];
                context.beginPath();
                context.moveTo(p.x, p.y);
                context.lineTo(p.x, p.y + p.height);
                context.lineWidth = (windowWidth > 500) ? 2 : 1;
                context.strokeStyle = '#95C2D9';
                context.stroke();
            }
        }

        setTimeout(function puddleItUp() {
            var $puddle = $('<div>', {class: 'puddle'}).appendTo('#main');

            var puddleFillLine = Math.ceil(groundHeight * 0.98) - $puddle.height();
            //log('puddle fill line: ' + puddleFillLine);

            $puddle.animate({bottom: puddleFillLine + 'px'}, 3000, 'linear');
        }, 500);

        setTimeout(function stopRain() {
            $rainField.fadeOut(1000, function () {
                window.cancelAnimationFrame(animTimerId);
                $(this).remove();
            });
        }, 4000);
    }

    function removeRain() {
        //log('stopping the rain');

        var $rainField = $('#rainField'),
            $puddles = $('.puddle');

        $rainField.fadeOut(200, function () {
            $rainField.remove();
        });

        $puddles.fadeOut(400, function () {
            $puddles.remove();
        });
    }

    return self;
}(jQuery, Modernizr, TimelineMax, TweenLite, undefined));

//plan JS load
if (document.addEventListener) {
    //For modern browsers:
    document.addEventListener('DOMContentLoaded', app.init, false);
}
else if (document.attachEvent) {
    //For IE:
    document.attachEvent('onreadystatechange', app.init);
}

//
////jquery load
//$(app.init);
