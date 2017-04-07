//Bader Rutter Analytics Gatherer Thingy
/**
 * Created by dirk on 1/30/2017
 */
br = window.br || {};
br.analytics = (function($, ga, undefined) {
    'use strict';
    var app = {};
    
    function setUpAnalytics() {
        $('a')
            .on('click',
                function(e) {
                    //send the click to google analytics
                    var $this = $(this),
                        action = e.type, //click
                        category = 'link',
                        label = $this.text().trim() || '',
                        urlChecker = new RegExp('/' + window.location.host + '/', 'ig'),
                        href = (this.href) ? this.href.toLowerCase().trim() : '';

                    //clean label text
                    //remove extra whitespace and weird characters like >
                    label = label.replace(/[\s]+/ig, ' ').replace(/[^\w \\.]/ig, '').trim();

                    //no label? use the title attribute
                    if (label.length === 0 && this.title) {
                        label = this.title.replace(/[\s]+/ig, ' ').replace(/[^\w \\.]/ig, '').trim();
                    }

                    //still no label? use the href attribute
                    if (label.length === 0 && this.href) {
                        label = this.href.trim();
                    }

                    if (href.indexOf('http') === 0 && !urlChecker.test(href)) {
                        //starts with http and is not a local url
                        category = 'external-link';
                    } else if ($this.attr('data-track')) {
                        //if the data-track attribute was set, use the text
                        category = $this.attr('data-track').toLowerCase();
                    } else if (/(\.doc|\.pdf|\.xls)/ig.test(href)) {
                        //if the href contains a familar file extension
                        category = 'file-download';
                    }

                    trackEvent(category, action, label);
                });

    } //end tracking events setup

    /** @description Sends a tracking event to Google Analytics
     * @param {string} interactionObject Category or the object that was interacted with (e.g. button)
     * @param {string} actionType The type of interaction (e.g. click)
     * @param {string} label Useful for categorizing events (e.g. nav buttons)
     * @return nothing
     */
    function trackEvent(interactionObject, actionType, label) {
        if (ga) {
            ga('send', 'event', interactionObject, actionType, label);
        }
        ////to debug, comment out the window.ga('send'... line and put this in instead:
        //console.log('TRACKING: object: ' + interactionObject + ', type: ' + actionType + ', label: ' + label);
    }

    //open it to the outside
    app.trackEvent = trackEvent;

    app.init = function() {
        //log('init tracking');
        setUpAnalytics();
    };

    //jquery doc ready load
    jQuery(app.init);

    return app;
}(jQuery, window.ga));