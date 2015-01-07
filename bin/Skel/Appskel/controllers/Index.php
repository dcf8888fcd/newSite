<?php 
class IndexController extends Yaf_Controller_Abstract {
    public function init() {
        Yaf_Dispatcher::getInstance()->disableView();
    }

    public function indexAction () {
        var_dump("hello world");
        $param1 = $this->_request->get('param1');
        if ($param1) {
            var_dump("the param1 is :" . $param1);
        }
    }
}
