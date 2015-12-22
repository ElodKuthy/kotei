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
            }
        }
    })