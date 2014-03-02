(function($) {
	var map,
		mapOptions = {
		zoom: 10,
		center: new google.maps.LatLng(51.516281, -0.132945),
		styles: [
			{"featureType": "poi","stylers": [{"visibility": "off"}]},
			{"featureType": "poi.park","elementType": "geometry","stylers": [{"visibility": "on"}]},
			{"featureType": "poi.park","elementType": "labels.text","stylers": [{"visibility": "on"}]},
			{"featureType": "transit.station.bus","stylers": [{"visibility": "off"}]}
		],
		disableDefaultUI: true
	};

	function loadMap() {
		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	}


	function init() {
		loadMap();
		$('.stops li').click(function() {
			$(this).toggleClass('open');
		});
	}

function registerHandlers() {

/*
Processing logic:
	postcode supplied:
		validate postcode
		if valid, take postcode and pass to search handler
	no postcode supplied:
		get nearest postcode using gps coordinates
		pass lat/long to search handler
*/
	$('#search').submit(function(e) {
		var query = $('#search input.search').text();
		
		return false;
	});
}

$(document).ready(init);
})(jQuery);
