angular.module('kotei')
    .directive('koCalendar', function () {
        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                id:      '@',
                date:    '=model',
                minDate: '=',
                maxDate: '=',
                format:  '@',
                enableTime: '='
            },
            controller: function () {

                this.dateOptions = {
                    formatYear: 'yy',
                    startingDay: 1
                }

                this.timeOptions = {
                    readonlyInput: false,
                    showMeridian: false
                }

                this.open = ($event) => {
                    $event.preventDefault()
                    $event.stopPropagation()

                    this.opened = true
                }
            },
            controllerAs: 'koCalendar',
            templateUrl: 'common-directives/calendar.html'
        }
    })
