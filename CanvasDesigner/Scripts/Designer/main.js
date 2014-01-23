require.config({
   
    paths: {
        'angular': '../angular'
    },
    shim: {
        'angular': {
            exports: 'angular'
        }
    }
});

define(['angular', 'app', 'designerController'], function() {
    angular.bootstrap(document, ['designerApp']);
})