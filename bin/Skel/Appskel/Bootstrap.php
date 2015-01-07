<?php 
class Bootstrap extends Yaf_Bootstrap_Abstract {

    private $_config;

    /*get a copy of the config*/
    public function _initBootstrap(){
        $this->_config = Yaf_Application::app()->getConfig();
        Yaf_Registry::set('application', $this->_config);
    }

    /**
     * Custom init file for modules.
     *
     * Allows to load extra settings per module, like routes etc.
     */
    public function _initModules(Yaf_Dispatcher $dispatcher)
    {
        $app = $dispatcher->getApplication();

        $modules = $app->getModules();
        foreach ($modules as $module) {
            if ('index' == strtolower($module)) continue;

            require_once( $app->getAppDirectory() . "/modules" . "/$module" . "/_init.php");
        }
    }

    //注册本地类前缀 
    public function _initLoader ($dispatcher) {

        //指定本地加载目录：App/src/, _global_library 由application.ini指定
        Yaf_Loader::getInstance(APP_PATH . "src")->registerLocalNameSpace(array('entity', 'dao'));
	} 

    public function _initRoutes() {
        
        //加载路由
        $routes = Config::get(Bootstrap_Env::get('app_name').'.route.test.regex');
        if (is_array( $routes)) {
            foreach ($routes as $k=>$v) {
                Yaf_Dispatcher::getInstance()->getRouter()->addRoute($k, new Yaf_Route_Regex($v['match'],$v['route'], $v['map']));
            }
        }

    }

}
