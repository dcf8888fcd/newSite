<?php
/**
 * 后台程序入口
 *
 *      作者: 温达明 (wendaming@comsenz.com)
 * 创建时间: 2012-12-27 11:53:00
 * 修改记录:
 *
 * 后台入口程序，由 cron / tool / task 引入调用
 *
 * $Id: cmd.php 14701 2014-03-03 10:53:31Z dingjing $
 */


    /**
     * _parseParameters
     * 分析从命令行传入的参数
     *
     * 支持的类型：
     * -e
     * -e <value>
     * --long-param
     * --long-param=<value>
     * --long-param <value>
     * <value>
     *
     * @return array
     */
    function _parseParameters() {

        $result = array();
        $params = $GLOBALS['argv'];

        reset($params);

        while (list($tmp, $p) = each($params)) {
            if ($p{0} == '-') {
                $pname = substr($p, 1);
                $value = true;

                if ($pname{0} == '-') {

                    // long-opt (--<param>)
                    $pname = substr($pname, 1);

                    // 使用'='链接的long-opt: --<param>=<value>
                    if (strpos($p, '=') !== false) {
                        list($pname, $value) = explode('=', substr($p, 2), 2);
                    }
                }

                // 下一个参数
                $nextParm = current($params);
                if ($value === true && $nextParm !== false && $nextParm{0} != '-') {
                    list($tmp, $value) = each($params);
                }

                $result[$pname] = $value;
            } else {
                // 不以'-'或'--'开头的opt
                $result[] = $p;
            }
        }

        return $result;
    }





//////////////now begin/////////////////////

error_reporting(E_ALL^E_STRICT^E_NOTICE^E_WARNING);
//error_reporting(E_ALL &(^E_NOTICE) & (^E_WARNING));
if (!defined('CLI_CMD')) {
    echo 'Can not call itself.' . PHP_EOL;
    exit;
}

// 设置运行环境
$_SERVER['RUN_MODE'] = 'development';
//$_SERVER['RUN_MODE'] = 'production';

define("DS", '/');
define("APP_PATH",  dirname(__FILE__).DS.'..'.DS.'..'.DS.'WeLife'.DS);
define("ROOT_PATH",  dirname(__FILE__).DS.'..'.DS.'..'.DS);
try {
    $appName = basename(APP_PATH);
    $ctlName = '';
    for ($ai = 0; $ai < count($argv); ++ $ai) {
        if ($argv[$ai] == '-n' || $argv['ai'] == '--n') {
            $ctlName = $argv[$ai + 1];
        }
    }

///*
try {
    $ctlName = 'Backend_' . CLI_CMD . '_' . $ctlName;
    $params = _parseParameters();

    $app  = new Yaf_Application(APP_PATH . "config/application.ini");
    $app->bootstrap();

    $queue = new $ctlName($params);
    $queue->main();
} catch (Exception $e) {
    //对于不是指向默认模板文件/views/controllerName/actionName.phtml的，会报错  ----bhy
    var_dump($e);
}
////////////////////end//////////////////////
} catch(Exception $e) {
    echo 'ERROR: ' . $e->getMessage();
    echo "\n";
    exit;
}
