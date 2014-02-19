var googleApiKey = 'AIzaSyDi6HPUir9lIRMhFAPKg14wRk5UBSVGh78';
function initialize() {
  var mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(-34.397, 150.644)
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
}

function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&' +
      'callback=initialize&key=' + googleApiKey;
  document.body.appendChild(script);
}

$(document).ready(loadScript);
