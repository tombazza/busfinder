(function($) {
	var defaultSearchText = 'Enter your location...',
			geocoder,
			searchBox,
			map,
			location,
			mapOptions = {
				zoom: 10,
				center: new google.maps.LatLng(51.516281, -0.132945),
				styles: [
					{"featureType": "poi", "stylers": [{"visibility": "off"}]},
					{"featureType": "poi.park", "elementType": "geometry", "stylers": [{"visibility": "on"}]},
					{"featureType": "poi.park", "elementType": "labels.text", "stylers": [{"visibility": "on"}]},
					{"featureType": "transit.station.bus", "stylers": [{"visibility": "off"}]}
				],
				disableDefaultUI: true
			};

	function init() {
		geocoder = new google.maps.Geocoder();
		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		registerHandlers();
	}

	function processSearch(e) {
		e.preventDefault();
		geocoder.geocode({'address': searchBox.val() + ', UK'}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				processCoords(results[0].geometry.location);
			} else {
				alert(address + ' not recognized.');
			}
		});

		return false;
	}

	function processNavigatorCoords(coords) {
		
	}
	
	function processCoords(coord) {
		console.log(coord);
		console.log(typeof coord);
	}
	
	function searchByCoords(lat, long) {
		
	}
	
	

	function handleLocationLookup(e) {
		e.preventDefault();
		navigator.geolocation.getCurrentPosition(processNavigatorCoords, errorHandler, {
			enableHighAccuracy: true, timeout: 10000, maximumAge: 300000
		});
		return false;
	}

	function registerHandlers() {
		searchBox = $('#search input.search');
		$('.location').click(handleLocationLookup);
		$('#search').submit(processSearch);

		searchBox.blur(function(e) {
			if (searchBox.val() == '') {
				searchBox.val(defaultSearchText);
			}
		}).focus(function(e) {
			if (searchBox.val() == defaultSearchText) {
				searchBox.val('');
			}
		});
		
		$('.stops li').click(function() {
			$(this).toggleClass('open');
		});
	}

	function errorHandler(error) {
		console.log(error);
		switch (error.code) {
			case error.PERMISSION_DENIED:
				alert("Could not get position as permission was denied.");
				break;
			case error.POSITION_UNAVAILABLE:
				alert("Could not get position as this information is not available at this time.");
				break;
			case error.TIMEOUT:
				alert("Attempt to get position timed out.");
				break;
			default:
				alert("Sorry, an error occurred. Code: " + error.code + " Message: " + error.message);
				break;
		}
	}

	$(document).ready(init);
})(jQuery);
