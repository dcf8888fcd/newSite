<?php
/**
 * Boss后台 首页
 */
require_once dirname(__FILE__) . '/Base.php';
class IndexController extends Boss_BaseController {

    public function indexAction () {

        $url = '/' . $this->_request->getModuleName() . '/user/index';
        if ($this->_getCurrentManager()) {
            //已登录 则跳转到消费页
            return $this->_redirect($url);
        }

        //如果为post请求 则为登陆操作        
        if ($this->_request->isPost()){
            $name = trim($this->_request->getPost('name'));
            $pwd = $this->_request->getPost('pwd');
            $managerDao = new DAO_Manager();
            $conditions = array('mName = ? AND mPwd = ?', $name, md5($pwd));
            $pageOptions = array();
            $managers = $managerDao->listByConditions($conditions, $pageOptions, array('mName','mid',));
            if (!$managers) {
                return $this->_errorMessage('账号密码不正确');
            }

            $manager = $managers[0]->to_array();
            $cookieData = array(
                'manager' => $manager,
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
