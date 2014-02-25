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
	$('#search').submit(function(e) {
		var query = $('#search input.search').text();
		
		return false;
	});
}

$(document).ready(loadScript);
})(jQuery);
