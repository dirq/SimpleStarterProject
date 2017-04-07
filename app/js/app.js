orderPlanner = window.orderPlanner || {};
orderPlanner.performance = (function ($, ko) {
    'use strict';

    var app = {
        viewModel: {},
        zipCode: '',
        startIndex: 10,
        pageSize: 10
    },
        speed = 20;

    //knockout view model abstract object definition
    // ReSharper disable once InconsistentNaming
    function ViewModel() {
        var vm = this;

        vm.performanceTests = ko.observableArray();

        vm.loadMore = function () {

            var url = '/api/performanceTests?zip=' +
                app.zipCode +
                '&startIndex=' +
                app.startIndex +
                '&pageSize=' +
                app.pageSize;


            $.getJSON(url)
                .done(function (data) {
                    slowlyLoadRecords(data);

                    app.startIndex += app.pageSize;
                })
                .fail(function (jqxhr, textStatus) {
                    log('Error! ' + textStatus);
                });
        };

        function slowlyLoadRecords(data) {
            var queue = data;
            setTimeout(function loop() {
                vm.performanceTests.push(queue.shift());
                if (queue.length) {
                    setTimeout(loop, speed);
                }
            },
                speed);
        }

        return vm;
    }
    //end view model definition

    app.init = function (zipCode, startIndex, pageSize) {
        app.zipCode = zipCode;
        app.startIndex = startIndex;
        app.pageSize = pageSize;

        app.viewModel = new ViewModel();
        ko.applyBindings(app.viewModel);
    };

    return app;
})(jQuery, ko);