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
            //这样能保证open模块不允许被访问吗？--bhy
            if ('index' == strtolower($module) || 'open' == strtolower($module)) continue;

            require_once( $app->getAppDirectory() . "/modules" . "/$module" . "/_init.php");
        }
    }

    //注册本地类前缀 
    public function _initLoader ($dispatcher) {

        //指定本地加载目录：App/src/, _global_library 由application.ini指定
        Yaf_Loader::getInstance(APP_PATH )->registerLocalNameSpace(array('Skel'));
	} 

    public function _initRoutes(){

        //配置test相关路由
        Yaf_Dispatcher::getInstance()->getRouter()->addRoute(
            "test",
            new Yaf_Route_Regex(
                "#^/test/testYarClient/#",
                array('controller' => "test",
                      'action' => "testYarClient"
                ),
                array()
            )
        );
        
    }

    /*
     * an example to add Plugin
     */

    public function _initPlugins(Yaf_Dispatcher $dispatcher)
    {
        return ;
        $dispatcher->registerPlugin(new LogPlugin());

        $this->_config->application->protect_from_csrf &&
            $dispatcher->registerPlugin(new AuthTokenPlugin());
    }

}
