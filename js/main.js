(function($) {
	var defaultSearchText = 'Enter your location...',
		geocoder,
		searchBox,
		map,
		stopLocations = [],
		stopMarkers = [],
		markers = [],
		location,
		dataUrl = '/data.php',
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
		showLoading();
		e.preventDefault();
		geocoder.geocode({'address': searchBox.val() + ', UK'}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				searchByLatLng(results[0].geometry.location);
			} else {
				alert(address + ' not recognized.');
			}
		});

		return false;
	}
	
	function searchByLatLng(latlng) {
		location = latlng;
		var url = dataUrl + '?mode=stops&lat=' + latlng.lat() + '&lng=' + latlng.lng();
		$.getJSON(url, function(response) {
			hideLoading();
			var list = $('.stops ul'),
				html = '',
				template = $('#stop_li').html(),
				bounds = new google.maps.LatLngBounds();
			stopLocations = [];
			stopMarkers = [];
			list.html('');
			setLocationMarker();
			bounds.extend(location);
			$.each(response, function(key, stop) {
				html += Mustache.render(template, stop);
				var stopLatLng = new google.maps.LatLng(stop.lat, stop.lng);
				stopLocations['stop_'+stop.id] = stopLatLng;
				stopMarkers.push(stopLatLng);
				bounds.extend(stopLatLng);
				markers.push(new google.maps.Marker({
					position: stopLatLng,
					map: map
				}));
			});
			map.fitBounds(bounds);
			list.html(html);
			$('.stops ul li').click(getStopData);
			$('.welcome').remove();
		});
	}
	
	function clearAllMarkers() {
		$.each(markers, function(k, marker) {
			marker.setMap(null);
		});
	}
	
	function setLocationMarker() {
		markers.push(new google.maps.Marker({
			position: location,
			map: map,
			icon: '/img/gps.png'
		}));
	}
	
	function showAllStops() {
		clearAllMarkers();
		setLocationMarker();
		var bounds = new google.maps.LatLngBounds();
		bounds.extend(location);
		$.each(stopMarkers, function(k, stopLatLng) {
			markers.push(new google.maps.Marker({
				position: stopLatLng,
				map: map
			}));
			bounds.extend(stopLatLng);
		});
		map.fitBounds(bounds);
	}
	
	function getStopData(e) {
		var stop = $(this),
			stopId = stop.attr('data-stopid'),
			url = dataUrl + '?mode=buses&stopid=' + stopId,
			template = $('#bus_entry').html();
	
		if(stop.hasClass('open')) {
			showAllStops();
			stop.parent('ul').removeClass('display');
			stop.removeClass('open');
			$('.stops .buses').remove();
			return;
		}
		
		showLoading();
		$.getJSON(url, function(response) {
			var html = '<div class="buses">';
			$.each(response, function(key, stop) {
				if(stop.expected < 1) {
					stop.expected = 'Due';
				} else {
					stop.expected = stop.expected + 'min';
				}
				html += Mustache.render(template, stop);
			});
			html += '</div>';
			clearAllMarkers();
			setLocationMarker();
			var bounds = new google.maps.LatLngBounds();
			var stopLatLng = stopLocations['stop_' + stopId];
			bounds.extend(stopLatLng);
			markers.push(new google.maps.Marker({
				position: stopLatLng,
				map: map
			}));
			bounds.extend(location);
			map.fitBounds(bounds);
			$('.stops .open').removeClass('open');
			$('.stops .buses').remove();
			stop.parent('ul').addClass('display');
			stop.addClass('open');
			stop.append(html);
			hideLoading();
		});
	}
	
	function showLoading() {
		$('.search-area').addClass('loading');
	}
	
	function hideLoading() {
		$('.search-area').removeClass('loading');
	}
	
	/* TODO: add reverse geocoding for lat/lng */
	
	function handleLocationLookup(e) {
		showLoading();
		e.preventDefault();
		navigator.geolocation.getCurrentPosition(function(coords) {
			var latlng = new google.maps.LatLng(coords.coords.latitude, coords.coords.longitude);
			searchByLatLng(latlng);
		}, errorHandler, {
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
