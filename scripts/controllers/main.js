angular.module('MyApp')
	.controller('MainCtrl', ['$scope', '$rootScope', '$route', '$window', '$routeParams', 'ngProgress', '$http', function ($scope, $rootScope, $route, $window, $routeParams, ngProgress, $http) {
		//from Lyon3
		//https://api.lafranceinsoumise.fr/legacy/events/?order_by_distance_to=[4.877817,45.728113]
		$rootScope.baseApiUrl = 'https://api.lafranceinsoumise.fr/legacy/';
		$scope.distance = 15000;
		$scope.point = {
			lon : "4.877817",
			lat : "45.728113"
		};
		$scope.events = [];
		$scope.evenements = [];
		$scope.uiConfig = {
			calendar: {
				editable: false,
				header: {
					left: 'month agendaWeek agendaDay',
					center: 'title',
					right: 'today prev,next'
				},
				onEventClick: function (args) {
					console.log(args);
				},
				eventClicked: function (args) {
					console.log(args);
				}
				/*eventDrop: $scope.alertOnDrop,
				eventResize: $scope.alertOnResize*/
			}
		};
		$scope.uiConfig.calendar.dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
		$scope.uiConfig.calendar.dayNamesShort = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
		$scope.uiConfig.calendar.monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
		$scope.uiConfig.calendar.monthNamesShort = ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."];

		getEvents();

		$scope.zoomOnEvent = function (id) {
			document.getElementById('mapframe').src = "https://carte.lafranceinsoumise.fr/?&event_id=" + id + ",events";
		};
		$scope.reloadIframe = function (zipcode) {
			document.getElementById('mapframe').src = "https://carte.lafranceinsoumise.fr/?zipcode=" + zipcode + "&event_type=evenements_locaux,reunions_circonscription";
		};

		$scope.resetAgenda = function (geoloc) {
			if (geoloc) {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(reload);
				}
				else {
					$dialog.messageBox("Geolocation is not supported by this browser.");
				}
			}
			else {
				reload();
			}
		};

		function reload(position) {
			if (position) {
				$scope.latitude = position.coords.latitude;
				$scope.longitude = position.coords.longitude;
				//get codepostal from position put after
				//reloadIframe(codePostal);
				reloadAgenda();
			}
			else {
				reloadIframe($scope.codePostal);
				reloadAgenda();
			}

		}

		function reloadAgenda() {
			$scope.evenements = [];
			$scope.events = [];
			getEvents();
		}

		function getEvents() {
			$http.get($rootScope.baseApiUrl + '/events/?max_results=100&close_to={"max_distance":"'+$scope.distance+'","coordinates":["'+ $scope.point.lon+'","'+ $scope.point.lat+'"]}')
				.success(function (data) {
					for (var i = 0, len = data._items.length; i < len; i++) {
						var event = data._items[i];
						event.start = data._items[i].start_time;
						event.end = data._items[i].end_time;
						event.title = data._items[i].name;
						event.url = "https://www.lafranceinsoumise.fr/" + data._items[i].path;
						$scope.events.push(event);
					}
					$scope.evenements.push({events: $scope.events, color: '#0098b6', textColor: '#fcfcfc'});
				})
				.error(function () {
					var btns = [
						{result: 'close', label: 'Fermer', cssClass: 'btn-success'}
					];
					$dialog.messageBox("Erreur", "Impossible de charger la liste des evenements", btns).open();
				});
		}
	}]);
