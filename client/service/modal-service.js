angular.module('kotei')
    .service('modalService', ($uibModal) => {
        return {
            info: (title, content) => {
                return $uibModal.open({
                    templateUrl: 'modal/info-modal.html',
                    controller: 'InfoModalController as infoModal',
                    size: 'sm',
                    resolve: {
                        title: () => {
                            return title
                        },
                        content: () => {
                            return content
                        }
                    }
                }).result
            },
            decision: (title, question, yesButtonTitle, noButtonTitle) => {
                return $uibModal.open({
                    templateUrl: 'modal/decision-modal.html',
                    controller: 'DescisionModalController as decisionModal',
                    size: 'sm',
                    resolve: {
                        title: () => {
                            return title
                        },
                        question: () => {
                            return question
                        },
                        yesButtonTitle: () => {
                            return yesButtonTitle ? yesButtonTitle : 'Biztos'
                        },
                        noButtonTitle: () => {
                            return noButtonTitle ? noButtonTitle : 'Mégsem'
                        }

                    }
                }).result
            }
        }
    })