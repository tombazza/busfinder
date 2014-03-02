<?php
ini_set('display_errors', true);
error_reporting(E_ALL);

require_once 'vendor/autoload.php';

class RedisCache {

	private $redis;

	public function __construct() {
		$this->redis = new Predis\Client();
	}

	public function getCacheData($keyName) {
		$result = $this->redis->get($keyName);
		if ($result !== null) {
			return base64_decode($result);
		}
		return false;
	}

	public function setCacheData($keyName, $data, $expires = 0) {
		$this->redis->set($keyName, base64_encode($data));
		if ($expires > 0) {
			$this->redis->expire($keyName, $expires);
		}
	}
}

class Busfinder {

	private $redis;
	private $tflDataPath = 'http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1';

	public function __construct() {
		$this->redis = new RedisCache();
	}

	

	function postcodeToCoord($postcode) {
		$postcode_clean = strtolower(preg_replace("/[^a-z0-9.]+/i", "", $postcode));
		$url = "http://api.postcodes.io/postcodes/".$postcode_clean;
		$key = 'busfinder_pc_'.$postcode_clean;
		$data = $this->redis->getCacheData($key);
		if($data) {
			return json_decode($data, true);
		} else {
			$response = $this->loadUrl($url);
			$this->redis->setCacheData($key, $response, 86400);
			return json_decode($response, true);
		}
	}

	public function byPostcode($postcode) {
		$coords = $this->postcodeToCoord($postcode);
		return $this->getBusData($coords['result']['latitude'], $coords['result']['longitude']);
	}

	private function getBusData($lat, $long) {
		$fields = 'StopCode1,StopPointIndicator,StopPointName,LineName,EstimatedTime,Latitude,Longitude,DirectionID,DestinationName,ExpireTime';
		$url = "http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?Circle=".$lat.",".$long.",500&ReturnList=".$fields;
		$key = 'busfinder_data_'.md5($url);
		$data = $this->redis->getCacheData($key);
		if($data) {
			return json_decode($data, true);
		} else {
			$response = $this->loadUrl($url);
			$newData = $this->parseResponseData($response);
			$this->redis->setCacheData($key, json_encode($newData), 30);
			return $newData;
		}
	}

	private function parseResponseData($data) {
		$parts = explode("\n", $data);
		$i = 0;
		$stops = array();
		foreach($parts as $part) {
			if($i == 0) {
				//print_r($part);
				$i++;
			} else {
				$part = json_decode($part, true);
				$expected = round((($part[9] / 1000) - time()) / 60);
				$stops[$part[1]][$part[3]]['data'] = array(
					'lat' => $part[4],
					'lon' => $part[5],
					'flag' => $part[3],
					'code' => $part[2],
					'name' => $part[1]
				);
				$stops[$part[1]][$part[3]]['buses'][] = array(
					'route' => $part[6],
					'destination' => $part[8],
					'expected' => $expected,
					'actual_expected' => ($part[9] / 1000)
				);
			}
		}
		return $stops;
	}

	/**
	 * Calculates the great-circle distance between two points, with
	 * the Vincenty formula.
	 * @param float $latitudeFrom Latitude of start point in [deg decimal]
	 * @param float $longitudeFrom Longitude of start point in [deg decimal]
	 * @param float $latitudeTo Latitude of target point in [deg decimal]
	 * @param float $longitudeTo Longitude of target point in [deg decimal]
	 * @param float $earthRadius Mean earth radius in [m]
	 * @return float Distance between points in [m] (same as earthRadius)
	 */
	private function vincentyGreatCircleDistance($latitudeFrom, $longitudeFrom, $latitudeTo, $longitudeTo, $earthRadius = 6371000) {
		// convert from degrees to radians
		$latFrom = deg2rad($latitudeFrom);
		$lonFrom = deg2rad($longitudeFrom);
		$latTo = deg2rad($latitudeTo);
		$lonTo = deg2rad($longitudeTo);

		$lonDelta = $lonTo - $lonFrom;
		$a = pow(cos($latTo) * sin($lonDelta), 2) + pow(cos($latFrom) * sin($latTo) - sin($latFrom) * cos($latTo) * cos($lonDelta), 2);
		$b = sin($latFrom) * sin($latTo) + cos($latFrom) * cos($latTo) * cos($lonDelta);

		$angle = atan2(sqrt($a), $b);
		return $angle * $earthRadius;
	}

	/**
	 * Calculates the great-circle distance between two points, with
	 * the Haversine formula.
	 * @param float $latitudeFrom Latitude of start point in [deg decimal]
	 * @param float $longitudeFrom Longitude of start point in [deg decimal]
	 * @param float $latitudeTo Latitude of target point in [deg decimal]
	 * @param float $longitudeTo Longitude of target point in [deg decimal]
	 * @param float $earthRadius Mean earth radius in [m]
	 * @return float Distance between points in [m] (same as earthRadius)
	 */
	private function haversineGreatCircleDistance($latitudeFrom, $longitudeFrom, $latitudeTo, $longitudeTo, $earthRadius = 6371000) {
		// convert from degrees to radians
		$latFrom = deg2rad($latitudeFrom);
		$lonFrom = deg2rad($longitudeFrom);
		$latTo = deg2rad($latitudeTo);
		$lonTo = deg2rad($longitudeTo);

		$latDelta = $latTo - $latFrom;
		$lonDelta = $lonTo - $lonFrom;

		$angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) + cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
		return $angle * $earthRadius;
	}
	
	private $hiddenStops = array('STBE','STCC','STTS','STTP','STDM','STCR','STDL','STDJ','SHCP','SHCE','SLRS');
	
	public function getStopsByCoord($lat, $lng) {
		$path = '?Circle='.$lat.','.$lng.',350&StopPointState=0&ReturnList=StopPointName,StopPointIndicator,StopPointType,Towards,Latitude,Longitude';
		$key = 'busfinder_stops_'.sha1($path);
		$data = $this->redis->getCacheData($key);
		if(!$data) {
			$response = $this->loadUrl($path);
			if($response) {
				$parts = explode("\n", $response);
				unset($parts[0]);
				$stops = array();
				foreach($parts as $stop) {
					$stop = json_decode($stop, true);
					if(!in_array($stop[2], $this->hiddenStops)) {
						$stops[] = array(
							'name' => ucwords(strtolower($stop[1])),
							'towards' => $stop[3],
							'flag' => $stop[4],
							'lat' => $stop[5],
							'lng' => $stop[6]
						);
					}
				}
				$this->redis->setCacheData($key, json_encode($stops), 60);
				return $stops;
			}
		} else {
			return json_decode($data, true);
		}
	}
	
	private function loadUrl($url) {
		$handle = new Zend\Http\Client();
		$handle->setOptions(array(
			'adapter' => 'Zend\Http\Client\Adapter\Curl',
			'curloptions' => array(
				CURLOPT_FOLLOWLOCATION => true,
				CURLOPT_MAXREDIRS => 5,
				CURLOPT_TIMEOUT => 30,
				CURLOPT_SSL_VERIFYPEER => false
			)
		));
		$request = new Zend\Http\Request();
		$url = $this->tflDataPath . $url;
		$request->setUri($url);
		$handle->setRequest($request);
		$response = $handle->dispatch($request);
		if ($response->getStatusCode() == 200) {
				return $response->getBody();
		} else {
				return false;
		}
	}
	
}

header('Content-type: application/json');
$bus = new Busfinder();

$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);

if($mode == 'stops') {
	$lat = filter_input(INPUT_GET, 'lat', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION | FILTER_FLAG_ALLOW_THOUSAND);
	$lng = filter_input(INPUT_GET, 'lng', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION | FILTER_FLAG_ALLOW_THOUSAND);
	$response = $bus->getStopsByCoord($lat, $lng);
	
} elseif($mode == 'buses') {
	
} elseif(mode == 'vehicle') {
	
} else {
	exit;
}

echo json_encode($response);


/*

Get nearest stops:
http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?Circle=51.49598,-
0.14191,250&StopPointState=0&ReturnList=StopCode1,StopPointName,Bearing,StopPointIndicator,
StopPointType,Towards,Latitude,Longitude

then load the stop data
*/
