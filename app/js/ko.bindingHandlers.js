ko.bindingHandlers.datePicker = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        //var unwrap = ko.utils.unwrapObservable;
        var dataSource = valueAccessor();
        var binding = allBindingsAccessor();
        var options = {
            keyboardNavigation: true,
            todayHighlight: true,
            autoclose: true,
            daysOfWeekDisabled: [0, 6],
            format: 'mm/dd/yyyy'
        };
        if (binding.datePickerOptions) {
            options = $.extend(options, binding.datePickerOptions);
        }
        $(element).datepicker(options);
        $(element).datepicker('update', dataSource());
        $(element)
            .on("changeDate",
                function(ev) {
                    var observable = valueAccessor();
                    if ($(element).is(':focus')) {
                        // Don't update while the user is in the field...
                        // Instead, handle focus loss
                        $(element)
                            .one('blur',
                                function(ev) {
                                    var dateVal = $(element).datepicker("getDate");
                                    observable(dateVal);
                                });
                    } else {
                        observable(ev.date);
                    }
                });
        //handle removing an element from the dom
        ko.utils.domNodeDisposal.addDisposeCallback(element,
            function() {
                $(element).datepicker('remove');
            });
    },
    update: function(element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element).datepicker('update', value);
    }
};

//https://github.com/kutase123/knockout-dropzone
ko.bindingHandlers.dropzone = {
    init: function(el, opts, allBindingsAccessor, viewModel) {
        window.test = el;
        opts = opts() || {};

        var deleteImageOnServer = function(imageUrl) {
            return $.ajax({
                    url: imageUrl,
                    type: 'DELETE'
                })
                .fail(function(xhr, textStatus, errorThrown) {
                    console.error('dropzone@err:', errorThrown);
                });
        };

        var dropzoneInit = function() {
            this.on('success',
                function(file, resp) {
                    if (Array.isArray(opts.value())) // check observableArray
                        opts.value.push(resp);
                    else
                        opts.value(resp);
                });

            this.on('error',
                function(file, err) {
                    console.error('dropzone@err:', err);
                });

            this.on('removedfile',
                function(file) {
                    var imageUrl = file.xhr.response;
                    if (Array.isArray(opts.value())) { // check observableArray
                        opts.value.remove(imageUrl);
                        deleteImageOnServer(imageUrl)
                            .done(function(resp) {

                            });
                    } else {
                        opts.value('');
                        deleteImageOnServer(imageUrl)
                            .done(function(resp) {

                            });
                    }
                });
        };

        $.extend(opts,
        {
            acceptedFiles: 'image/*',
            addRemoveLinks: true,
            init: dropzoneInit
        });

        $(el).dropzone(opts);
    },
    update: function(el, valueAccessor) {

    }
};


//Debounce for scrolling
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

ko.bindingHandlers.scroll = {
    updating: true,

    init: function(element, valueAccessor, allBindingsAccessor) {
        var self = this;
        self.updating = true;
        ko.utils.domNodeDisposal.addDisposeCallback(element,
            function() {
                $(window).off('scroll.ko.scrollHandler');
                self.updating = false;
            });
    },

    update: function(element, valueAccessor, allBindingsAccessor) {
        var props = allBindingsAccessor().scrollOptions,
            offset = props.offset ? props.offset : 0,
            loadFunc = props.loadFunc,
            load = ko.utils.unwrapObservable(valueAccessor()),
            self = this,
            $element = $(element);


        //Debounce for scrolling
        function debounce(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        };

        //jquery on uses the first part of the string for the event.
        //so, scroll.ko.scrollHandler attaches to the scroll event.
        //that's how this thing works
        if (load) {
            //console.log('load');
            $(window)
                .on('scroll.ko.scrollHandler',
                    debounce(function() {
                            //console.log('on scroll.ko.scrollHandler');
                            if (($(document).height() - offset <= $(window).height() + $(window).scrollTop())) {
                                if (self.updating) {
                                    loadFunc();
                                    self.updating = false;
                                }
                            } else {
                                self.updating = true;
                            }
                        },
                        10));

        } else {
            element.style.display = 'none';
            $(window).off('scroll.ko.scrollHandler');
            self.updating = false;
        }
    }
};