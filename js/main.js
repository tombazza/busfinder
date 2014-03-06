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
		infowindow,
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
		},
		gpsMarkerIcon = {
			url: '/img/gps.png',
			size: new google.maps.Size(60, 60),
			origin: new google.maps.Point(0,0),
			anchor: new google.maps.Point(15, 15),
			scaledSize: new google.maps.Size(30, 30)
		},
		stopMarkerIcon = {
			url: '/img/marker.png',
			size: new google.maps.Size(40, 40),
			origin: new google.maps.Point(0,0),
			anchor: new google.maps.Point(10,10),
			scaledSize: new google.maps.Size(20, 20)
		},
		templates = {};

	function init() {
		geocoder = new google.maps.Geocoder();
		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		loadTemplates();
		registerHandlers();
	}
	
	function loadTemplates() {
		templates.mapMarker = $("#map_marker").html();
		templates.stopListItem = $('#stop_li').html();
		templates.busTimeEntry = $('#bus_entry').html();
	}

	function processSearch(e) {
		showLoading();
		e.preventDefault();
		geocoder.geocode({'address': searchBox.val() + ', UK'}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				searchByLatLng(results[0].geometry.location);
			} else {
				hideLoading();
				alert(address + ' not recognized.');
			}
		});

		return false;
	}
	
	function renderStopMarker(stop) {
		var stopMarker = new google.maps.Marker({
			position: stop.latlng,
			map: map,
			icon: stopMarkerIcon
		});
		google.maps.event.addListener(stopMarker, 'click', function() {
			if(infowindow) infowindow.close();
			infowindow = new google.maps.InfoWindow({
				content: Mustache.render(templates.mapMarker, stop),
				position: stop.latlng
			});
			infowindow.open(map);
		});
		markers.push(stopMarker);
	}
	
	function searchByLatLng(latlng) {
		location = latlng;
		var url = dataUrl + '?mode=stops&lat=' + latlng.lat() + '&lng=' + latlng.lng();
		$.getJSON(url, function(response) {
			if(response.length == 0) {
				hideLoading();
				alert('Sorry no stops were found for that location');
				return;
			}
			hideLoading();
			var list = $('.stops ul'),
				html = '',
				bounds = new google.maps.LatLngBounds();
			stopMarkers = [];
			list.html('');
			setLocationMarker();
			bounds.extend(location);
			$.each(response, function(key, stop) {
				html += Mustache.render(templates.stopListItem, stop);
				stop.latlng = new google.maps.LatLng(stop.lat, stop.lng);
				stopMarkers.push(stop);
				bounds.extend(stop.latlng);
				renderStopMarker(stop);
			});
			map.fitBounds(bounds);
			map.setZoom(15);
			list.html(html);
			$('.stops ul li').click(loadStopData);
			$('.welcome').remove();
		});
	}
	
	function clearAllMarkers() {
		$.each(markers, function(k, marker) {
			marker.setMap(null);
		});
		if(infowindow) infowindow.close();
	}
	
	function setLocationMarker() {
		markers.push(new google.maps.Marker({
			position: location,
			map: map,
			icon: gpsMarkerIcon,
			zIndex: 999
		}));
	}

	function showAllStops() {
		clearAllMarkers();
		setLocationMarker();
		var bounds = new google.maps.LatLngBounds();
		bounds.extend(location);
		$.each(stopMarkers, function(k, stop) {
			renderStopMarker(stop);
			bounds.extend(stop.latlng);
		});
		map.fitBounds(bounds);
		map.setZoom(15);
	}
	
	function loadStopData(e) {
		var stop = $(this),
			stopId = stop.attr('data-stopid'),
			url = dataUrl + '?mode=buses&stopid=' + stopId;
	
		if(stop.hasClass('open')) {
			showAllStops();
			stop.parent('ul').removeClass('display');
			stop.removeClass('open');
			$('.stops .buses').remove();
			return;
		}
		
		showLoading();
		$.getJSON(url, function(response) {
			$.each(response, function(key, stop) {
				if(stop.expected < 1) {
					response[key].expected = 'Due';
				} else {
					response[key].expected = stop.expected + 'min';
				}
			});
			var html = Mustache.render(templates.busTimeEntry, {buses:response});
			clearAllMarkers();
			setLocationMarker();
			var bounds = new google.maps.LatLngBounds(),
				stopEntry;
			$.each(stopMarkers, function(k, stopMarkerEntry){
				if(stopMarkerEntry.id == stopId) {
					stopEntry = stopMarkerEntry;
					return false;
				}
			});
			bounds.extend(stopEntry.latlng);
			renderStopMarker(stopEntry);
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
			codeLatLng(latlng);
			searchByLatLng(latlng);
		}, errorHandler, {
			enableHighAccuracy: true, timeout: 10000, maximumAge: 300000
		});
		return false;
	}

	function codeLatLng(latlng) {
		$.ajax({
			dataType: "jsonp",
			url: 'http://api.postcodes.io/postcodes/lon/' + latlng.lng() + '/lat/' + latlng.lat() + '?callback=?',
			cache: true,
			success: function(data) {
				if(data.result[0]) {
					searchBox.val(data.result[0].admin_district + ', ' + data.result[0].postcode);
				}
			}
		});
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
