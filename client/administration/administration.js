angular.module('kotei')
    .config(($stateProvider) => {

        $stateProvider
            .state('administration', {
                abstract: true,
                url: '/administration'
            })
    })