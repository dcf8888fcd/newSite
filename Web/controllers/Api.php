<?php
    class ApiController extends Yaf_Controller_Abstract {

        function init(){
            Yaf_Dispatcher::getInstance()->disableView();
        }

        function indexAction(){
            $server = $this->_request->getParam('server');
            $server = 'Api_'. $server;
            $class = new $server;
            $api = new Yar_Server($class);
            $api->handle();
        }
    }
