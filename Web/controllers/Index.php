<?php
class IndexController extends BaseController {
        function init(){
            //Yaf_Dispatcher::getInstance()->disableView();
            $this->_response->setHeader("Content-type","text/html; charset=utf-8");
        }
        function indexAction(){
            $this->_view->assign('user', 'dcf');
            return $this->_display('index/index');
            //
            $url ='http://yaf/Test';
            $data = YarClient::sync($url, 'add', array(1, 'dcf'));
            $const = YarClient::sync($url, 'getConstant', array('TestModel::STATUS_NORMAL'));
            $const = YarClient::sync($url, 'listConstants', array());
            $model = AdminUserModel::getInstance(array('uId' => 1));
            $key = 3;
            $result = $model->updateByConditions(array('user_id' =>$key), array('last_ip' => '127.1.1.3'));
            print_r($result);
            echo 'hello world!';
        }

        public function addAction() {
            
        }

    }
