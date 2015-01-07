<?php 
class Bootstrap extends Yaf_Bootstrap_Abstract {

    private $_config;

    /*get a copy of the config*/
    public function _initBootstrap(){
        $this->_config = Yaf_Application::app()->getConfig();
        Yaf_Registry::set('application', $this->_config);
		//var_dump($this->_config['application']['rest']);
        //exit;
    }

        //注册本地类前缀 
    public function _initLoader ($dispatcher) {

        //指定本地加载目录：App/src/, _global_library 由application.ini指定
        Yaf_Loader::getInstance(APP_PATH . "src")->registerLocalNameSpace(array("Api", "DAO", "Helper"));
    }

    public function _initRoutes(){
        
        $config = new Yaf_Config_Ini(APP_PATH . 'config/route.ini', $_SERVER['RUN_MODE']);
        $routeConfig = $config->get('routes')->toArray();
        if ($routeConfig) {
            $routerServer = Yaf_Dispatcher::getInstance()->getRouter();
            foreach ($routeConfig as $name => $route) {
                if ($route['type'] == 'regex') {
                    $router = new Yaf_Route_Regex($route['match'], $route['route'], $route['map']);
                    $routerServer->addRoute($name, $router);
                }
            }
        }
    }


}
