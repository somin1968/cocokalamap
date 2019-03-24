(function() {
  'use strict';

  var appModule = angular.module('App', ['ngRoute', 'ngAnimate', 'toastr', 'datatables', 'datatables.bootstrap', 'color.picker', 'ui.bootstrap']);

  appModule.config(function($routeProvider) {
    $routeProvider.when('/home', {
      controller: 'HomeCtrl',
      templateUrl: '/tmpl/home.html'
    }).when('/poi', {
      controller: 'POICtrl',
      templateUrl: '/tmpl/poi.html'
    }).when('/design', {
      controller: 'DesignCtrl',
      templateUrl: '/tmpl/design.html'
    }).otherwise({
      redirectTo: '/home'
    });
  });

  appModule.controller('AppCtrl', function($scope, $location) {
    $scope.location = $location;
  });

  appModule.controller('HomeCtrl', function($scope, $http, toastr) {
    var url = '/admin/api/config';
    $scope.titleOrigin = null;

    $http.get(url).success(function(response) {
      $scope.titleOrigin = response.title;
      $scope.title = response.title;
      $scope.label = response.label;
      $scope.isMaintained = response.isMaintained;
    }).error(function() {
      toastr.danger('サーバとの通信時にエラーが発生しました。');
    });

    $scope.submit = function() {
      var payload = {
        page_title: $scope.title,
        stocked_label: Number($scope.label),
        is_maintained: $scope.isMaintained == 'on'
      }
      $http.post(url, payload).success(function(response) {
        toastr.success('更新は正常に完了しました。');
        $scope.titleOrigin = $scope.title;
        $scope.refresh();
      }).error(function() {
        toastr.danger('サーバとの通信時にエラーが発生しました。');
      });
    };

    $scope.refresh = function() {
      $scope.iframeUrl = '/?embed&amp;' + (new Date()).getTime();
    };

    $scope.refresh();
  });

  appModule.controller('POICtrl', function($scope, $http, $window, filterFilter, $uibModal, toastr, DTOptionsBuilder, DTColumnDefBuilder) {
    var url = '/admin/api/poi';
    $scope.options = [
      {
        label: '配布済み',
        value: true
      },
      {
        label: '未配布',
        value: false
      }
    ];

    $scope.pois = [];

    $scope.dtOptions = DTOptionsBuilder.newOptions().withLanguage({
      processing: '',
      lengthMenu: '1ページに _MENU_ 件を表示',
      search: '絞り込み検索: ',
      zeroRecords: '条件に合うデータは見つかりませんでした',
      info: '_TOTAL_件中、_START_から_END_まで表示中',
      infoEmpty: '表示できるデータはありません',
      infoFiltered: '（全_MAX_件から絞り込み）',
      paginate: {
        previous: '前へ',
        next: '次へ'
      }
    }).withBootstrap();
    $scope.dtColumnDefs = [
      DTColumnDefBuilder.newColumnDef(0).notVisible(),
      DTColumnDefBuilder.newColumnDef(2).notSortable(),
      DTColumnDefBuilder.newColumnDef(3).notVisible(),
      DTColumnDefBuilder.newColumnDef(4).notSortable(),
      DTColumnDefBuilder.newColumnDef(5).notVisible(),
      DTColumnDefBuilder.newColumnDef(7).notSortable()
    ];

    var dtInstance = {};
    $scope.dtInstanceCallback = function(instance) {
      dtInstance = instance;
    };

    $http.get(url).success(function(response) {
      $scope.pois = response;
    }).error(function() {
      toastr.danger('サーバとの通信時にエラーが発生しました。');
    });

    $scope.search = function() {
      if (dtInstance) {
        dtInstance.DataTable.search($scope.searchString).draw();
      }
    };

    $scope.filter = function(value, num) {
      if (dtInstance) {
        value = !!value ? value : '';
        dtInstance.DataTable.column(num).search(value).draw();
      }
    };

    $scope.view = function(index) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'poi_modal',
        controller: 'ModalInstanceCtrl',
        resolve: {
          mode: function() {
            return 'view';
          },
          poi: function() {
            return angular.copy($scope.pois[index]);
          }
        }
      });
      modalInstance.result.then(upsert);
    };

    $scope.add = function(index) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'poi_modal',
        controller: 'ModalInstanceCtrl',
        resolve: {
          mode: function() {
            return 'add';
          },
          poi: function() {
            return {};
          }
        }
      });
      modalInstance.result.then(upsert);
    };

    $scope.edit = function(index) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'poi_modal',
        controller: 'ModalInstanceCtrl',
        resolve: {
          mode: function() {
            return 'edit';
          },
          poi: function() {
            return angular.copy($scope.pois[index]);
          }
        }
      });
      modalInstance.result.then(upsert);
    };

    function upsert(poi) {
      var payload = {
        title: poi.title,
        title_kana: poi.titleKana,
        address: poi.address,
        phone: poi.phone,
        description: poi.description,
        latitude: poi.latitude,
        longitude: poi.longitude,
        stocked: poi.stocked,
        is_hidden: poi.isHidden
      };
      $http.post(url + (poi.key ? '/' + poi.key : ''), payload).success(function(response) {
        toastr.success('変更は正常に完了しました。');
        if (poi.key) {
          $scope.pois[getIndexOfPOIs(poi.key)] = response;
        } else {
          $scope.pois.push(response);
        }
      }).error(function() {
        toastr.error('サーバとの通信時にエラーが発生しました。');
      });
    }

    $scope.delete = function(index) {
      var poi = $scope.pois[index];
      if ($window.confirm('「' + poi.title + '」を削除します。よろしいですか？')) {
        $http.delete(url + '/' + poi.key).success(function(response) {
          toastr.success('削除は正常に完了しました。');
          $scope.pois.splice(index, 1);
        }).error(function() {
          toastr.error('サーバとの通信時にエラーが発生しました。');
        });
      }
    };

    $scope.toggleStatus = function(index, _index) {
      var poi = $scope.pois[index];
      var payload = {
        stocked: poi.stocked
      };
      $http.post(url + '/' + poi.key, payload).success(function(response) {
        toastr.success('変更は正常に完了しました。');
      }).error(function() {
        toastr.error('サーバとの通信時にエラーが発生しました。');
        poi.stocked[_index] = !poi.stocked[_index];
      });
    };

    $scope.toggleStatusAll = function(_index, status) {
      var payload = {
        index: _index,
        status: status
      };
      $http.post('/admin/api/poi_toggle_all', payload).success(function(response) {
        toastr.success('変更は正常に完了しました。');
        angular.forEach($scope.pois, function(poi) {
          poi.stocked[_index] = status;
        });
      }).error(function() {
        toastr.error('サーバとの通信時にエラーが発生しました。');
      });
    };

    function getIndexOfPOIs(key) {
      var result = -1;
      angular.forEach($scope.pois, function(poi, index) {
        if (poi.key == key) {
          result = index;
        }
      });
      console.log(result);
      return result;
    }
  });

  appModule.controller('DesignCtrl', function($scope, $http, toastr) {
    $scope.colorPickerOptions = {
      format: 'hex',
      alpha: false,
      swatchOnly: true
    };

    var url = '/admin/api/design';

    $http.get(url).success(function(response) {
      $scope.markerColorA = response.markerColors.length > 0 ? response.markerColors[0] : null;
      $scope.markerColorB = response.markerColors.length > 1 ? response.markerColors[1] : null;
    }).error(function() {
      toastr.danger('サーバとの通信時にエラーが発生しました。');
    });

    $scope.submit = function() {
      var payload = {
        marker_colors: [$scope.markerColorA ? convertHex($scope.markerColorA) : null, $scope.markerColorB ? convertHex($scope.markerColorB) : null]
      }
      $http.post(url, payload).success(function(response) {
        toastr.success('更新は正常に完了しました。');
      }).error(function() {
        toastr.danger('サーバとの通信時にエラーが発生しました。');
      });
    };

    function convertHex(string) {
      if (string.slice(0, 1) !== '#') {
        string = '#' + string;
      }
      return string.toLowerCase();
    }
  });

  appModule.controller('ModalInstanceCtrl', function($scope, $http, $uibModalInstance, mode, poi) {
    $scope.mode = mode;
    $scope.poi = poi;

    if (mode == 'add') {
      $scope.poi.stocked = [false, false];
    }

    $scope.convert = function() {
      $http.get('/admin/api/convert_to_latlng?address=' + poi.address).success(function(response) {
        if (response.status == 'OK') {
          var latLng = response.results[0].geometry.location;
          $scope.poi.latitude = latLng.lat;
          $scope.poi.longitude = latLng.lng;
        } else {
          toastr.error('何らかの理由により緯度経度変換が実行できませんでした。');
        }
      }).error(function() {
        toastr.error('サーバとの通信時にエラーが発生しました。');
      });
    };

    $scope.apply = function() {
      $scope.error = null;
      if (!$scope.poi.title) {
        $scope.error = '店舗名は必須です。';
        return;
      }
      if (!$scope.poi.latitude || !$scope.poi.longitude) {
        $scope.error = '緯度経度は必須です。';
        return;
      }
      var lat = Number($scope.poi.latitude);
      var lng = Number($scope.poi.longitude);
      if (lat > 90 || lat < -90 || lng > 180 || lng < -180) {
        $scope.error = '緯度経度の値が不正です。';
        return;
      }
      $uibModalInstance.close($scope.poi);
    };

    $scope.close = function() {
      $uibModalInstance.dismiss();
    };
  });
}());
