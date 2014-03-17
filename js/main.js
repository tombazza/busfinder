(function($, tpl) {
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
		templates = {},
		stopAnimationFinished = true,
		stopRenderTimer,
		stopUpdateTimer,
		locationAccuracy = false,
		locationRadius = false;

	function init() {
		geocoder = new google.maps.Geocoder();
		loadTemplates();
		registerHandlers();
		
		if(window.navigator.standalone) {
			$('.header').css('padding-top', '15px');
		}
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
		locationAccuracy = false;
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
				content: tpl.render(templates.mapMarker, stop),
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
				html += tpl.render(templates.stopListItem, stop);
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
		if(locationAccuracy) {
			locationRadius = new google.maps.Circle({
				strokeColor: '#9C1216',
				strokeOpacity: 0.7,
				strokeWeight: 0.5,
				fillColor: '#9C1216',
				fillOpacity: 0.35,
				map: map,
				center: location,
				radius: parseInt(locationAccuracy)
			});
		}
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
		if(locationRadius) {
			bounds.union(locationRadius.getBounds());
		}
		map.setCenter(bounds.getCenter());
		map.setZoom(15);
	}
		
	function closeAllOpenStops() {
		var stopsOpen = $('.stops li.open .times');
		if(stopsOpen.length > 0) {
			showAllStops();
			$('.stops li').removeClass('open');
			stopAnimationFinished = false;
			stopsOpen.slideUp({
				duration: 250,
				complete: function() {
					$('.stops li').not('.open').find('.times').remove();
					stopAnimationFinished = true;
				}
			});
		}
	}
	
	function retreiveStopData(stop, update) {
		var	parentLi = stop.parent('li'),
			stopId = parentLi.attr('data-stopid'),
			url = dataUrl + '?mode=buses&stopid=' + stopId;
		
		showLoading();
		$.getJSON(url, function(response) {
			$.each(response, function(key, bus) {
				if(bus.expected < 1) {
					response[key].expected = 'Due';
				} else {
					response[key].expected = bus.expected + 'min';
				}
			});
			
			var html = tpl.render(templates.busTimeEntry, { buses: response }),
				bounds = new google.maps.LatLngBounds(),
				stopEntry;

			if(update) {
				parentLi.find('.times').remove();
				parentLi.append(html);
				hideLoading();
			} else {
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
				if(locationRadius) {
					bounds.union(locationRadius.getBounds());
				}
				map.fitBounds(bounds);
				
				stopRenderTimer = setInterval(function() {
					if(stopAnimationFinished) {
						parentLi.addClass('open');
						parentLi.append(html);
						$('.stops').animate({ scrollTop: $('.stops').scrollTop() + parentLi.position().top });
						clearInterval(stopRenderTimer);
						hideLoading();
					}
				}, 20);
			}
			
			stopUpdateTimer = setTimeout(function() {
				retreiveStopData(stop, true);
			}, 15000);
		});
	}

	function loadStopData(e) {
		var stop = $(this),
			preventLoading = stop.parent('li').hasClass('open');
	
		clearTimeout(stopUpdateTimer);
		closeAllOpenStops();
		if(!preventLoading) {
			retreiveStopData(stop, false);
		}
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
		navigator.geolocation.getCurrentPosition(function(position) {
			var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			locationAccuracy = position.coords.accuracy;
			console.log(locationAccuracy);
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
		$(document).on('click', '.map .markercontainer', function() {
			$('.stops li[data-stopid="'+$(this).attr('data-stopid')+'"] .stop').trigger('click');
		});
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
})(jQuery, Mustache);