<?php
require_once dirname(__FILE__) . '/Base.php';
class IndexController extends Pos_BaseController {
    public function indexAction () {

        $url = '/' . $this->_request->getModuleName() . '/user/index';
        if ($this->_getCurrentCashier()) {
            //已登录 则跳转到消费页
            return $this->_redirect($url);
        }

        //如果为post请求 则为登陆操作        
        if ($this->_request->isPost()){
            $name = trim($this->_request->getPost('name'));
            $pwd = $this->_request->getPost('pwd');
            $cashierDao = new DAO_Cashier();
            $conditions = array('cName = ? AND cPwd = ?', $name, md5($pwd));
            $pageOptions = array();
            $cashiers = $cashierDao->listByConditions($conditions, $pageOptions, array('cName','cid', 'rid'));
            if (!$cashiers) {
                return $this->_errorMessage('账号密码不正确');
            }

            $cashier = $cashiers[0]->to_array();
            $cookieData = array(
                'cashier' => $cashier,
            );
            $this->_setLogin($cookieData);  
            return $this->_redirect($url);
        }
       
    }

    public function logoutAction(){
        $this->_logout(); 
        return $this->_redirect('/' . $this->_request->getModuleName() . '/index/index');
    }
}
