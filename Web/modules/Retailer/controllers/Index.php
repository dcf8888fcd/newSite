<?php
/**
 * 零售商后台
 */
require_once dirname(__FILE__) . '/Base.php';
class IndexController extends Retailer_BaseController {

    public function indexAction () {

        $url = '/' . $this->_request->getModuleName() . '/user/index';
        if ($this->_getCurrentRetailer()) {
            //已登录 则跳转到消费页
            return $this->_redirect($url);
        }

        //如果为post请求 则为登陆操作        
        if ($this->_request->isPost()){
            $name = trim($this->_request->getPost('name'));
            $pwd = $this->_request->getPost('pwd');
            $retailerDao = new DAO_Retailer();
            $conditions = array('rName = ? AND rPwd = ?', $name, md5($pwd));
            $pageOptions = array();
            $retailers = $retailerDao->listByConditions($conditions, $pageOptions, array('rName','rid',));
            if (!$retailers) {
                return $this->_errorMessage('账号密码不正确');
            }

            $retailer = $retailers[0]->to_array();
            $cookieData = array(
                'retailer' => $retailer,
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
