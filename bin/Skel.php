<?php
/**
 * Skel
 *
 *     作者: 石瑞 (shirui@comsenz.com)
 * 创建时间: 2010-07-05 10:03:00
 * 修改记录:
 *
 * $Id: Skel.php 76 2011-04-22 06:48:34Z wendaming $
 */

define('ROOT_PATH' , dirname(dirname(__FILE__)) );
define('BIN_PATH' , dirname(__FILE__));
error_reporting(E_ALL & (~E_NOTICE) & (~E_DEPRECATED) & (~E_WARNING));
//require_once(ROOT_PATH . '/libraries/Bootstrap.php');

class Skel {

    /**
     * _instance
     *
     * @object
     */
    public static $_instance;

    /**
     * _config
     *
     * @array
     */
    public static $_config;

    /**
     * _appskel
     *
     * @var string
     */
    protected $_appskel;

    /**
     * _bootstrap
     *
     * @var object
     */
    protected $_bootstrap;

    /**
     * main
     * 入口
     *
     * @return void
     */
    public static function main() {

        try {
            $skel = self::getInstance();
            $skel->exec();
        } catch(Exception $e) {
            printf("\033[1;37;41mAn Error Has Occurred\033[0m" . PHP_EOL);
            printf($e->getMessage() . PHP_EOL);
        }
    }

    /**
     * getInstance
     *
     * @return object
     */
    public static function getInstance() {

        if (!(self::$_instance instanceof self)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * __construct
     *
     * @return void
     */
    public function __construct() {

        $this->_appskel = BIN_PATH . '/Skel/Appskel';
    }

    /**
     * exec
     * 执行
     *
     * @return void
     */
    public function exec() {

        define("APP_PATH",  BIN_PATH.'/');
        try {
            $app  = new Yaf_Application(BIN_PATH . "/config/application.ini");
            $app->bootstrap();
           // $app->run();
        } catch (Exception $e) {
            var_dump($e);
        }

        list($model, $action, $params) = $this->_parseParams();
        $appName = $this->_getParams('app', $params);
        //Bootstrap_Env::set('app_name', $appName);
        Yaf_Registry::set('Env.app_name', $appName);
        list($className, $methodName) = $this->_dispatch($model, $action);

        $this->callback($className, $methodName, $params);
    }

    /**
     * callback
     * 调用方法
     *
     * @param  string $className
     * @param  string $methodName
     * @param  array $params
     * @return mixed
     */
    public function callback($className, $methodName, $params = array()) {

        $model = new $className($params);
        return call_user_func_array(array($model, $methodName), array($params));
    }

    /**
     * _dispatch
     *
     * @param  string $model
     * @param  string $action
     * @return array
     */
    protected function _dispatch($model, $action = null) {

        // sh skel.sh [model] [action]

        $this->_checkParamsAvailable($model, $action);

        $routes = array(
                        'app' => 'Skel_Model_App',
                        'dao' => 'Skel_Model_DAO',
                        'entity' => 'Skel_Model_Entity',
                        'service' => 'Skel_Model_Service',
                        'controller' => 'Skel_Model_Controller',
                        'action' => 'Skel_Model_Action',
                        'backend_task' => 'Skel_Model_BackendTask',
                        'backend_tool' => 'Skel_Model_BackendTool',
                        'backend_cron' => 'Skel_Model_BackendCron',
                        'scaffolding' => 'Skel_Model_Scaffolding',
                        'config' => 'Skel_Model_Config',
                        'help' => 'Skel_Model_Help',
                        'testcase_dao' => 'Skel_Model_TestcaseDAO',
                        );

        if (!array_key_exists($model, $routes)) {
            throw new Skel_Exception('Invalid params');
        }

        $class = $routes[$model];

        if (!$action) {
            $action = 'index';
        }
        $method = Skel_Inflector::camelize($action) . 'Action';

        return array($class, $method);
    }

    /**
     * _checkParamsAvailable
     *
     * @param  string $model
     * @param  string $action
     * @return boolean
     */
    protected function _checkParamsAvailable($model, $action = null) {

        $allowed = array(
                         'app' => array('create', 'show'),
                         'dao' => array('create'),
                         'entity' => array('create'),
                         'service' => array('create'),
                         'controller' => array('create'),
                         'action' => array('create'),
                         'backend_task' => array('create'),
                         'backend_tool' => array('create'),
                         'backend_cron' => array('create'),
                         'scaffolding' => array('create'),
                         'config' => array('create'),
                         'testcase_dao' => array('create'),
                         'help' => array('', 'app', 'dao', 'service', 'controller', 'action', 'scaffolding',
                                         'backend_task', 'backend_tool', 'backend_cron', 'config', 'testcase_dao'),
                        );

        if (!array_key_exists($model, $allowed)) {
            throw new Skel_Exception('Unknown model: ' . $model);
        }

        if (!in_array('', $allowed[$model])) {
            if (!$action) {
                throw new Skel_Exception('Missing action. See "skel help ' . $model . '" for more information');
            }
        }

        if ($action && !in_array($action, $allowed[$model])) {
            throw new Skel_Exception('Unknown action: ' . $action);
        }

        return true;
    }

    /**
     * _parseParams
     * 分析参数
     *
     * @return void
     */
    protected function _parseParams() {

        $params = $_SERVER['argv'];

        $filename = array_shift($params);

        $model = array_shift($params);
        $model = trim($model, "\"'");

        $action = array_shift($params);
        $action = trim($action, "\"'");

        if (!$model) {
            $model = 'help';
        }

        return array($model, $action, $params);
    }

    /**
     *  没用了---bhy
     * _registAutoload
     *
     * @return void
     */
    protected function _registAutoload() {

        spl_autoload_register(array('Skel', 'autoload'));
    }

    /**
     *  没用了---bhy
     * autoload
     *
     * @param  mixed $class
     * @return void
     */
    public static function autoload($class) {

        $file = BIN_PATH . '/' . str_replace('_', '/', $class) . '.php';
        require_once($file);
    }

    /**
     * getConfig
     *
     * @param  mixed $key
     * @return void
     */
    public static function getConfig($key = null) {

        if (!self::$_config) {
            self::$_config = include(BIN_PATH . '/Skel/config.php');
        }

        if (!$key) {
            return self::$_config;
        }
        return self::$_config[$key];
    }

    private function _getParams($key = null, $params) {

        if (!$params) {
            return false;
        }

        $result = array();
        foreach ($params as $value) {
            if (substr($value, 0, 2) == '--') {
                $value = substr($value, 2);
                if (strpos($value, '=') !== false) {
                    list($k, $v) = explode('=', $value);
                    $result[$k] = $v;
                }
            }
        }

        if (!$key) {
            return $result;
        }

        return $result[$key];
    }

}

Skel::main();
