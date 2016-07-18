angular.module('superadmin')
    .controller('InfoModalController', function (title, content, $uibModalInstance) {
        this.title = title
        this.content = content
        this.ok = () => {
            $uibModalInstance.close()
        }
    })