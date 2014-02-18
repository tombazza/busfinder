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
	$response = loadUrl($url);
	print_r(json_decode($response, true));
}



$coord = postcodeToCoord($_GET['pc']);

$urlPart = "http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?Circle=".$coord['result']['latitude'].",".$coord['result']['longitude'].",500&ReturnList=StopPointName,LineName,EstimatedTime,Latitude,Longitude,DirectionID,DestinationText,DestinationName";

$data = '[4,"1.0",1392739080102]
[1,"Park Road","XD",51.523923,-0.426862,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392739520000]
[1,"Park Road","XD",51.523923,-0.426862,"427",1,"Acton High St","Acton, High Street",1392739536000]
[1,"Park Road","XD",51.523923,-0.426862,"427",1,"Ealing Broadway","Ealing Broadway",1392739174000]
[1,"Park Road","XD",51.523923,-0.426862,"427",1,"Acton High St","Acton, High Street",1392740081000]
[1,"Park Road","XD",51.523923,-0.426862,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392739991000]
[1,"Park Road","XD",51.523923,-0.426862,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392740496000]
[1,"Park Road","XD",51.523923,-0.426862,"427",1,"Acton High St","Acton, High Street",1392740441000]
[1,"Park Road","XD",51.523923,-0.426862,"427",1,"Acton High St","Acton, High Street",1392740798000]
[1,"Wood End Green Road","XP",51.523094,-0.435453,"H98",1,"Hayes End","Hayes End",1392739134000]
[1,"Wood End Green Road","XP",51.523094,-0.435453,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392739200000]
[1,"Wood End Green Road","XP",51.523094,-0.435453,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392739680000]
[1,"Wood End Green Road","XP",51.523094,-0.435453,"H98",1,"Hayes End","Hayes End",1392739689000]
[1,"Wood End Green Road","XP",51.523094,-0.435453,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392740160000]
[1,"Wood End Green Road","XP",51.523094,-0.435453,"H98",1,"Hayes End","Hayes End",1392740202000]
[1,"Wood End Green Road","XP",51.523094,-0.435453,"H98",1,"Hayes End","Hayes End",1392740460000]
[1,"Wood End Green Road","XP",51.523094,-0.435453,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392740640000]
[1,"Hayes End","XF",51.524727,-0.431808,"607",2,"Uxbridge","Uxbridge",1392739139000]
[1,"Hayes End","XF",51.524727,-0.431808,"H98",1,"Hayes End","Hayes End",1392739464000]
[1,"Hayes End","XF",51.524727,-0.431808,"607",2,"Uxbridge","Uxbridge",1392739564000]
[1,"Hayes End","XF",51.524727,-0.431808,"427",2,"Uxbridge","Uxbridge",1392739802000]
[1,"Hayes End","XF",51.524727,-0.431808,"427",2,"Uxbridge","Uxbridge",1392739962000]
[1,"Hayes End","XF",51.524727,-0.431808,"427",2,"Uxbridge","Uxbridge",1392739816000]
[1,"Hayes End","XF",51.524727,-0.431808,"427",2,"Uxbridge","Uxbridge",1392739983000]
[1,"Hayes End","XF",51.524727,-0.431808,"H98",1,"Hayes End","Hayes End",1392739981000]
[1,"Hayes End","XF",51.524727,-0.431808,"H98",1,"Hayes End","Hayes End",1392740277000]
[1,"Hayes End","XF",51.524727,-0.431808,"607",2,"Uxbridge","Uxbridge",1392740332000]
[1,"Hayes End","XF",51.524727,-0.431808,"H98",1,"Hayes End","Hayes End",1392740608000]
[1,"Hayes End","XF",51.524727,-0.431808,"427",2,"Uxbridge","Uxbridge",1392740794000]
[1,"Hanover Circle","XN",51.522984,-0.437359,"H98",1,"Hayes End","Hayes End",1392739126000]
[1,"Hanover Circle","XN",51.522984,-0.437359,"H98",1,"Hayes End","Hayes End",1392739671000]
[1,"Hanover Circle","XN",51.522984,-0.437359,"H98",1,"Hayes End","Hayes End",1392740185000]
[1,"Hanover Circle","XN",51.522984,-0.437359,"H98",1,"Hayes End","Hayes End",1392740445000]
[1,"Park Road","XE",51.523764,-0.42704,"H98",1,"Hayes End","Hayes End",1392739403000]
[1,"Park Road","XE",51.523764,-0.42704,"427",2,"Uxbridge","Uxbridge",1392739745000]
[1,"Park Road","XE",51.523764,-0.42704,"427",2,"Uxbridge","Uxbridge",1392739905000]
[1,"Park Road","XE",51.523764,-0.42704,"427",2,"Uxbridge","Uxbridge",1392739758000]
[1,"Park Road","XE",51.523764,-0.42704,"427",2,"Uxbridge","Uxbridge",1392739927000]
[1,"Park Road","XE",51.523764,-0.42704,"H98",1,"Hayes End","Hayes End",1392739922000]
[1,"Park Road","XE",51.523764,-0.42704,"H98",1,"Hayes End","Hayes End",1392740219000]
[1,"Park Road","XE",51.523764,-0.42704,"H98",1,"Hayes End","Hayes End",1392740552000]
[1,"Park Road","XE",51.523764,-0.42704,"427",2,"Uxbridge","Uxbridge",1392740757000]
[1,"Hewens Road","XA",51.526892,-0.439071,"427",1,"Acton High St","Acton, High Street",1392739540000]
[1,"Hewens Road","XA",51.526892,-0.439071,"427",1,"Acton High St","Acton, High Street",1392739847000]
[1,"Hewens Road","XA",51.526892,-0.439071,"427",1,"Acton High St","Acton, High Street",1392740271000]
[1,"Hewens Road","XA",51.526892,-0.439071,"427",1,"Acton High St","Acton, High Street",1392740692000]
[1,"Hanover Circle","XQ",51.522933,-0.438226,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392739241000]
[1,"Hanover Circle","XQ",51.522933,-0.438226,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392739722000]
[1,"Hanover Circle","XQ",51.522933,-0.438226,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392740199000]
[1,"Hanover Circle","XQ",51.522933,-0.438226,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392740680000]
[1,"York Avenue","XR",51.522981,-0.439767,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392739259000]
[1,"York Avenue","XR",51.522981,-0.439767,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392739741000]
[1,"York Avenue","XR",51.522981,-0.439767,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392740219000]
[1,"York Avenue","XR",51.522981,-0.439767,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392740700000]
[1,"Hayes Police Station","XB",51.525377,-0.434063,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392739431000]
[1,"Hayes Police Station","XB",51.525377,-0.434063,"427",1,"Acton High St","Acton, High Street",1392739610000]
[1,"Hayes Police Station","XB",51.525377,-0.434063,"427",1,"Acton High St","Acton, High Street",1392739877000]
[1,"Hayes Police Station","XB",51.525377,-0.434063,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392739907000]
[1,"Hayes Police Station","XB",51.525377,-0.434063,"427",1,"Acton High St","Acton, High Street",1392740324000]
[1,"Hayes Police Station","XB",51.525377,-0.434063,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392740412000]
[1,"Hayes Police Station","XB",51.525377,-0.434063,"427",1,"Acton High St","Acton, High Street",1392740721000]
[1,"New Road","XK",51.526074,-0.439099,"H98",1,"Hayes End","Hayes End",1392739543000]
[1,"New Road","XK",51.526074,-0.439099,"H98",1,"Hayes End","Hayes End",1392740046000]
[1,"New Road","XK",51.526074,-0.439099,"H98",1,"Hayes End","Hayes End",1392740359000]
[1,"New Road","XK",51.526074,-0.439099,"U7",2,"Uxbridge","Uxbridge",1392740667000]
[1,"New Road","XK",51.526074,-0.439099,"H98",1,"Hayes End","Hayes End",1392740692000]
[1,"York Avenue","XM",51.523084,-0.440124,"H98",1,"Hayes End","Hayes End",1392739626000]
[1,"York Avenue","XM",51.523084,-0.440124,"H98",1,"Hayes End","Hayes End",1392740130000]
[1,"York Avenue","XM",51.523084,-0.440124,"H98",1,"Hayes End","Hayes End",1392740403000]
[1,"York Avenue","XM",51.523084,-0.440124,"H98",1,"Hayes End","Hayes End",1392740868000]
[1,"New Road","XT",51.525965,-0.439694,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392739363000]
[1,"New Road","XT",51.525965,-0.439694,"U7",1,"Hayes Sainsbury","Hayes, Sainsbury\'s",1392739516000]
[1,"New Road","XT",51.525965,-0.439694,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392739837000]
[1,"New Road","XT",51.525965,-0.439694,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392740323000]
[1,"New Road","XT",51.525965,-0.439694,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392740812000]
[1,"Hayes End","XC",51.524647,-0.430556,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392739476000]
[1,"Hayes End","XC",51.524647,-0.430556,"427",1,"Acton High St","Acton, High Street",1392739643000]
[1,"Hayes End","XC",51.524647,-0.430556,"427",1,"Ealing Broadway","Ealing Broadway",1392739125000]
[1,"Hayes End","XC",51.524647,-0.430556,"607",1,"White City","White City",1392739826000]
[1,"Hayes End","XC",51.524647,-0.430556,"427",1,"Acton High St","Acton, High Street",1392739922000]
[1,"Hayes End","XC",51.524647,-0.430556,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392739950000]
[1,"Hayes End","XC",51.524647,-0.430556,"427",1,"Acton High St","Acton, High Street",1392740428000]
[1,"Hayes End","XC",51.524647,-0.430556,"H98",2,"Hounslow Bus St","Hounslow, Bus Station",1392740457000]
[1,"Hayes End","XC",51.524647,-0.430556,"607",1,"White City","White City",1392740633000]
[1,"Hayes End","XC",51.524647,-0.430556,"427",1,"Acton High St","Acton, High Street",1392740788000]
[1,"Hayes End","XC",51.524647,-0.430556,"607",1,"White City","White City",1392739777000]
[1,"Morgans Lane","XH",51.525505,-0.436192,"H98",1,"Hayes End","Hayes End",1392739522000]
[1,"Morgans Lane","XH",51.525505,-0.436192,"427",2,"Uxbridge","Uxbridge",1392739861000]
[1,"Morgans Lane","XH",51.525505,-0.436192,"427",2,"Uxbridge","Uxbridge",1392740071000]
[1,"Morgans Lane","XH",51.525505,-0.436192,"427",2,"Uxbridge","Uxbridge",1392739895000]
[1,"Morgans Lane","XH",51.525505,-0.436192,"H98",1,"Hayes End","Hayes End",1392740017000]
[1,"Morgans Lane","XH",51.525505,-0.436192,"427",2,"Uxbridge","Uxbridge",1392740058000]
[1,"Morgans Lane","XH",51.525505,-0.436192,"H98",1,"Hayes End","Hayes End",1392740313000]
[1,"Morgans Lane","XH",51.525505,-0.436192,"H98",1,"Hayes End","Hayes End",1392740658000]
[1,"Morgans Lane","XH",51.525505,-0.436192,"427",2,"Uxbridge","Uxbridge",1392740829000]';

$parts = explode("\n", $data);
$i = 0;

$stops = array();
foreach($parts as $part) {
	if($i == 0) {
		//print_r($part);
		$i++;
	} else {
		$part = json_decode($part, true);
		$stopName = $part[1]." (".$part[2].")";
		$stops[$stopName]['data'] = array(
			'lat' => $part[3],
			'lon' => $part[4]
		);
		$stops[$stopName]['buses'][] = array(
			'route' => $part[5],
			'destination' => $part[7],
			'expected' => ($part[9] / 1000)
		);
	}
}


print_r($stops);
