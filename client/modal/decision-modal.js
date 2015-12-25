angular.module('kotei')
    .controller('DescisionModalController', function (title, question, yesButtonTitle, noButtonTitle, $uibModalInstance) {
        this.title = title
        this.question = question
        this.yesButtonTitle = yesButtonTitle
        this.noButtonTitle = noButtonTitle
        this.yes = () => {
            $uibModalInstance.close()
        }
        this.no = () => {
            $uibModalInstance.dismiss('no')
        }
    })