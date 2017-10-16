angular.module('MyApp')
	.controller('MainCtrl', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
		//from Lyon3
		//https://api.lafranceinsoumise.fr/legacy/events/?order_by_distance_to=[4.877817,45.728113]
		$rootScope.baseApiUrl = 'https://api.lafranceinsoumise.fr/legacy/';
		$scope.distance = 30000;
		$scope.codePostal = 69003;
		$scope.point = {
			lon: "4.877817",
			lat: "45.728113"
		};
		//#0098b6
		// LIST EVENEMENTS avec plus de 6 de participants
		$scope.eventsHigh = {
			events: [],
			color: '#0098b6',
			textColor: 'white'
		};
		// list avec moins de 6 participants
		$scope.eventsMiddle = {
			events: [],
			color: '#ff877a',
			textColor: 'white'
		};
		// list avec moins de 3 participants
		$scope.eventsLow = {
			events: [],
			color: '#d11dad',
			textColor: 'white'
		};
		$scope.events = [];
		$scope.evenements = [];
		$scope.evenements.push($scope.eventsHigh);
		$scope.evenements.push($scope.eventsMiddle);
		$scope.evenements.push($scope.eventsLow);

		$scope.uiConfig = {
			calendar: {
				timezone: 'local',
				editable: false,
				header: {
					left: '',
					center: 'title',
					right: 'today prev,next agendaDay,agendaWeek,month'
				},
				onEventClick: function (args) {
					console.log(args);
				},
				eventClicked: function (args) {
					console.log(args);
				}
			}
		};
		$scope.uiConfig.calendar.dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
		$scope.uiConfig.calendar.dayNamesShort = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
		$scope.uiConfig.calendar.monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
		$scope.uiConfig.calendar.monthNamesShort = ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."];

		$scope.resetAgenda = function (geoloc) {
			$scope.eventsHigh.events = [];
			$scope.eventsMiddle.events = [];
			$scope.eventsLow.events = [];

			if (geoloc) {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(reloadWithGeoloc);
				}
				else {
					alert("Geolocalisation non détecté depuis votre navigateur.");
				}
			}
			else {
				reloadWithPostalCode($scope.codePostal);
			}
		};

		function reloadWithGeoloc(position) {
			if (position) {
				$scope.point.lat = position.coords.latitude;
				$scope.point.lon = position.coords.longitude;
			}
			//get codepostal from position
			getPostalCodeFromGeoLoc($scope.point);
			getEvents();
		}
		function reloadWithPostalCode(codepostal) {
			if (!codepostal) {
				$scope.codePostal = 69003;
			}
			//get postion of codepostal
			reloadIframeOnCodePostal($scope.codePostal);
			getPositionFromPostalCode($scope.codePostal);

		}
		function getPositionFromPostalCode(codepostal) {
			var host = "https://nominatim.openstreetmap.org/";
			var route = "/search/?format=json&q=";
			var url = host + route + codepostal + ",France";
			$http.get(url).success(function(data) {
				if (data) {
					$scope.point.lon = data[0].lon;
					$scope.point.lat = data[0].lat;
					getEvents();
				}
			});
		}

		function getPostalCodeFromGeoLoc(point) {
			var host = "https://nominatim.openstreetmap.org/";
			var route = "/search/?format=json&q=";
			var cp = /((2[A|B])|[0-9]{2})[0-9]{3}/;
			var url = host + route + point.lat + ',' + point.lon;
			$http.get(url).success(function (data) {
				if (data) {
					$scope.codePostal = data[0].display_name.match(cp)[0];
					reloadIframeOnCodePostal($scope.codePostal);
				}
			});
		}
		function getEvents() {
			$http.get($rootScope.baseApiUrl + '/events/?max_results=100&close_to={"max_distance":"' + $scope.distance + '","coordinates":["' + $scope.point.lon + '","' + $scope.point.lat + '"]}')
				.success(function (data) {
					for (var i = 0, len = data._items.length; i < len; i++) {
						var event = data._items[i];
						event.start = data._items[i].start_time;
						event.end = data._items[i].end_time;
						event.title = "("+event.participants+")"+data._items[i].name;
						event.url = "https://agir.lafranceinsoumise.fr/" + data._items[i].path;
						if (event.participants < 3 || !event.participants) {
							$scope.eventsLow.events.push(event);
						}
						else if (event.participants < 6) {
							$scope.eventsMiddle.events.push(event);
						}
						else {
							$scope.eventsHigh.events.push(event);
						}
					}
				})
				.error(function () {
					var btns = [
						{result: 'close', label: 'Fermer', cssClass: 'btn-success'}
					];
					$dialog.messageBox("Erreur", "Impossible de charger la liste des evenements", btns).open();
				});
		}

		function reloadIframeOnCodePostal(zipcode) {
			console.log("reload ifram with codePostal=", zipcode);
			document.getElementById('mapframe').src = "";
			document.getElementById('mapframe').src = "https://carte.lafranceinsoumise.fr/?zipcode=" + zipcode + "&event_type=evenements_locaux,reunions_circonscription";
		}
		function reloadIframeOnIdEvent(id) {
			console.log("reload ifram on event=", id);
			document.getElementById('mapframe').src = "https://carte.lafranceinsoumise.fr/?&event_id=" + id + ",events";
		}

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(reloadWithGeoloc);
		}
		else {
			alert("Geolocalisation non détecté depuis votre navigateur.");
			reloadWithPostalCode($scope.codePostal);
		}
	}]);
