(function($) {
	var defaultSearchText = 'Enter your location...',
		geocoder,
		searchBox,
		map,
		stopMarkers = [],
		markers = [],
		location,
		dataUrl = '/data.php',
		infowindow,
		mapOptions = {
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

		loadTemplates();
		registerHandlers();
	}
	
	function loadMap() {
		if(!map) {
			var mapContainer = $('#map-canvas');
			map = new google.maps.Map(mapContainer.get(0), mapOptions);
			mapContainer.addClass('show');
			resizeStopArea();
		}
	}
	
	function resizeStopArea() {
		var stops = $('.stops');
		stops.height(($('body').height() - stops.offset().top));
	}
	
	function loadTemplates() {
		templates.mapMarker = $("#map_marker").html();
		templates.stopListItem = $('#stop_li').html();
		templates.busTimeEntry = $('#bus_entry').html();
	}

	function processSearch(e) {
		showLoading();
		searchBox.blur();
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
		$.getJSON(dataUrl + '?mode=stops&lat=' + latlng.lat() + '&lng=' + latlng.lng(), function(response) {
			if(response.length == 0) {
				hideLoading();
				alert('Sorry no stops were found for that location');
				return;
			}
			hideLoading();
			var list = $('.stops ul'),
				html = '';
			stopMarkers = [];
			list.html('');
			$.each(response, function(key, stop) {
				html += Mustache.render(templates.stopListItem, stop);
				stop.latlng = new google.maps.LatLng(stop.lat, stop.lng);
				stopMarkers.push(stop);
			});
			loadMap();
			showAllStops();
			list.html(html);
			$('.stops ul li .stop').click(loadStopData);
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
		map.setCenter(bounds.getCenter());
		map.setZoom(15);
	}
	
	function loadStopData(e) {
		var stop = $(this),
			parentLi = stop.parent('li'),
			stopId = parentLi.attr('data-stopid'),
			url = dataUrl + '?mode=buses&stopid=' + stopId;
	
		if(parentLi.hasClass('open')) {
			showAllStops();
			$('.stops li.open .times').slideUp(500);
			parentLi.removeClass('open');
			$('.stops .times').remove();
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
			var html = Mustache.render(templates.busTimeEntry, { buses: response }),
				bounds = new google.maps.LatLngBounds(),
				stopEntry;
			clearAllMarkers();
			setLocationMarker();
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
			
			$('.stops li.open .times').slideUp(500);
			parentLi.removeClass('open');
			$('.stops .times').remove();
			parentLi.addClass('open');
			parentLi.append(html);
			$('.stops').scrollTop($('.stops').scrollTop() + parentLi.position().top);
			hideLoading();
		});
	}
	
	function showLoading() {
		$('.search-area').addClass('loading');
	}
	
	function hideLoading() {
		$('.search-area').removeClass('loading');
	}
	
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
		$(window).resize(resizeStopArea());
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