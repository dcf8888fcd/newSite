<?php
/**
 * Boss后台 会员管理
 */

require_once dirname(__FILE__) . '/Base.php';
class UserController extends Boss_BaseController {

    /**
     * 列表
     */
    function indexAction(){
        $params = $this->_request->getRequest();
        try {
            $dao = new DAO_User();
            $conditions = array();


            $pageOptions = array(
                'perPage' => 2,
                'urlVar' => 'currentPage',
                'delta' => 5,
                'currentPage'  => $this->_request->get('currentPage',1),
            );
            if ($params['uName']) {
                $conditions = array('uName LIKE ?' , $params['uName'].'%');
            }
            $list= $dao->listByConditions($conditions, $pageOptions);
            $pager = Pager::factory($pageOptions);
            $links = $pager->getLinks();
        } catch (Exception $e){
            return $this->_errorMessage($e->getMessage());
        }

        $this->_view->assign('totalItems', $pager->numItems());
        $this->_view->assign('links', $links);
        $this->_view->assign('list', $list);
        $this->_view->assign('params', $params);
        $this->_view->assign('levels', DAO_User::getLevels());
        $this->_view->assign('sexes', DAO_User::getSexes());
    }

    /**
     * 添加
     */
    public function addAction() {
        // 表单提交
        if ($this->_request->isPost()) {
            $data = $this->_request->getPost();
            try {
                $dao = new DAO_User();
                $data['uPwd'] = md5($data['uPwd']);
                $data['uBalance'] = intval($data['uBalance'] * 100);
                $list= $dao->listByConditions(array('uName = ?' , $data['uName']));
                if ($list) {
                    throw new Exception('已经存在相同名称的会员'); 
                }
                $result = $dao->add($data); 

                try {
                    //请求ecshop 添加用户
                    $get = array('method' => 'add_user', 'phone'=> $data['uPhone'], 'password' => $data['uPwd']);
                    ksort($get, SORT_STRING);
                    $str = implode($get);
                    $get['sign'] = md5($str . Helper_Curl::$signStr);
                    $result =  Helper_Curl::get(Helper_Curl::$url, $get);
                    if ($data['uBalance']) {
                        //请求ecshop 添加余额
                        $get = array('method' => 'add_user_account', 'phone'=> $data['uPhone'],'money' => $data['uBalance'] / 100);
                        ksort($get, SORT_STRING);
                        $str = implode($get);
                        $get['sign'] = md5($str . Helper_Curl::$signStr);
                        $result =  Helper_Curl::get(Helper_Curl::$url, $get);
                    }
                } catch (Exception $e){
                    throw new Exception($e->getMessage()); 
                }

            } catch (Exception $e){
                return $this->_errorMessage($e->getMessage());
            }
            return $this->_successMessage('操作成功');
        }
        
        try {
            $cityDao = new DAO_City();
            $pageOptions = array();
            $cities = $cityDao->listByConditions(array(), $pageOptions, array(), 'cNamePy ASC');
        } catch (Exception $e) {
            return $this->_errorMessage($e->getMessage());
        }

        $this->_view->assign('cities', $cities);
        $this->_view->assign('action', $this->_request->getActionName());
        $this->_view->assign('data', array());
        $this->_view->assign('levels', DAO_User::getLevels());
        $this->_view->assign('sexes', DAO_User::getSexes());

    }

    /**
     * 编辑
     */
    public function editAction() {
        $id = $this->_request->get('id');

        if (!$id) {
            return $this->_errorMessage('您访问的网址不合法');
        }

        $dao = new DAO_User();
        // 表单提交
        if ($this->_request->isPost()) {
            $data = $this->_request->getPost();
            try {
                $data['uPwd'] = md5($data['uPwd']);
                $result = $dao->modify($data['uid'], $data); 
            } catch (Exception $e){
                return $this->_errorMessage($e->getMessage());
            }
            return $this->_successMessage('操作成功');
        }

        try {
            $data = $dao->get($id);
            $cityDao = new DAO_City();
            $pageOptions = array();
            $cities = $cityDao->listByConditions(array(), $pageOptions, array(), 'cNamePy ASC');
        } catch (Exception $e) {
            return $this->_errorMessage($e->getMessage());
        }

        $this->_view->assign('cities', $cities);
        $this->_view->assign('data', $data);
        $this->_view->assign('action', $this->_request->getActionName());
        $this->_view->assign('levels', DAO_User::getLevels());
        $this->_view->assign('sexes', DAO_User::getSexes());
        $this->_display($this->_request->getControllerName() .'/add');
    }

    /**
     * 删除
     */

    public function removeAction(){
        $id = $this->_request->get('id');

        if (!$id) {
            return $this->_errorMessage('您访问的网址不合法');
        }
        try {
            $dao = new DAO_User();
            $dao->remove($id); 
        } catch (Exception $e){
            return $this->_errorMessage($e->getMessage());
        }

        return $this->_successMessage('操作成功');
    }
}
