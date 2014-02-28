<?php
require_once 'conv.php';

$c = new ConversionsLatLong();

print_r($c->osgb36_to_wgs84(515781,174783));
