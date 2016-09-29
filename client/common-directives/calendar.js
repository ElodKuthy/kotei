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
                enableTime: '=',
                minMode: '@',
                datepickerMode: '@',
                change: "&"
            },
            controller: function () {

                this.dateOptions = {
                    formatYear: 'yy',
                    startingDay: 1,
                    minMode: this.minMode || 'day'                    
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
