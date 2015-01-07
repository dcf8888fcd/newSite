<?php
///*
error_reporting(E_ALL^E_STRICT^E_NOTICE);
$_SERVER['RUN_MODE'] = 'development';
define("DS", '/');

$arr = explode(DS, dirname(__FILE__));
$appName = $arr[count($arr)-2];
define("APP_PATH",  dirname(__FILE__).DS.'..'.DS.'..'.DS.$appName.DS);
//define("APP_PATH",  dirname(__FILE__).DS.'..'.DS.'..'.DS.'WeLife'.DS);

define("ROOT_PATH",  dirname(__FILE__).DS.'..'.DS.'..'.DS);
$app  = new Yaf_Application(APP_PATH . "config/application.ini");
try {
    $app->bootstrap();
    $app->run();
} catch (Exception $e) {
    Logger::error($e);
}


