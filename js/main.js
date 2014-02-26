(function($) {
var googleApiKey = 'AIzaSyDi6HPUir9lIRMhFAPKg14wRk5UBSVGh78';
function loadMap() {
  var mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(-34.397, 150.644)
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}


function init() {
	loadMap();
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
