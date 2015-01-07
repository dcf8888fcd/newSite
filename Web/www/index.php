<?php
//测试
error_reporting(E_ALL^E_STRICT^E_NOTICE);
define("DS", '/');
$dirArr = explode(DS, dirname(__FILE__));
$appName = $dirArr[count($dirArr)-2];
define("APP_NAME", $appName);
define("APP_PATH",  dirname(__FILE__).DS.'..'.DS.'..'.DS. APP_NAME .DS);
define("ROOT_PATH",  dirname(__FILE__).DS.'..'.DS.'..'.DS);
$app  = new Yaf_Application(APP_PATH . 'config/application.ini', $_SERVER['RUN_MODE']);
try {
    $app->bootstrap();
    $app->run();
} catch (Exception $e) {
    var_dump($e);
    //Logger::error($e);
}

