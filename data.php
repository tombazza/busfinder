<?php
require_once 'vendor/autoload.php';


function loadUrl($url) {
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
        $request->setUri($url);
        $handle->setRequest($request);
        $response = $handle->dispatch($request);
        if ($response->getStatusCode() == 200) {
                return $response->getBody();
        } else {
                return false;
        }
}

function postcodeToCoord($postcode) {
	$postcode_clean = preg_replace("/[^a-z0-9.]+/i", "", $postcode);
	$url = "http://api.postcodes.io/postcodes/".$postcode_clean;
	$response = json_decode(loadUrl($url), true);
	return $response;
}



$coord = postcodeToCoord($_GET['pc']);

$fields = 'StopCode1,StopPointIndicator,StopPointName,LineName,EstimatedTime,Latitude,Longitude,DirectionID,DestinationName,ExpireTime';
$urlPart = "http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?Circle=".$coord['result']['latitude'].",".$coord['result']['longitude'].",500&ReturnList=".$fields;

$data = loadUrl($urlPart);

$parts = explode("\n", $data);
$i = 0;

$stops = array();
foreach($parts as $part) {
	if($i == 0) {
		//print_r($part);
		$i++;
	} else {
		$part = json_decode($part, true);
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
			'expected' => ($part[9] / 1000)
		);
	}
}

echo json_encode($stops);
