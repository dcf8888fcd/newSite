<?php
/**
 * Boss后台 会员管理
 */

require_once dirname(__FILE__) . '/Base.php';
class SalecardController extends Retailer_BaseController {
        

    public function init(){
        parent::init();
    }

    /**
     * 列表
     */
    function indexAction(){
        $params = $this->_request->getRequest();
        $retailer = $this->_getCurrentRetailer();
        try {
            $dao = new DAO_SaleCard();
            $conditions = array();

            $pageOptions = array(
                'perPage' => 2,
                'urlVar' => 'currentPage',
                'delta' => 5,
                'currentPage'  => $this->_request->get('currentPage',1),
            );

            $where = array('rid = ?');
            $conditions = array($retailer['rid']);
 
            if ($conditions) {
                array_unshift($conditions, implode(' AND ', $where));
            }

            //找出列表用户
            $list= $dao->listByConditions($conditions, $pageOptions);

            $uids = array();
            foreach ($list as  $row) {
                $uids[] = $row->uid;
            }

            $userDao = new DAO_User();
            $userList = $userDao->listByConditions(array('uid IN (?)', $uids));
            $users = array();
            foreach ($userList as $user) {
                $users[$user->uid] = $user;
            }
            
            $pager = Pager::factory($pageOptions);
            $links = $pager->getLinks();
        } catch (Exception $e){
            return $this->_errorMessage($e->getMessage());
        }

        $this->_view->assign('totalItems', $pager->numItems());
        $this->_view->assign('links', $links);
        $this->_view->assign('list', $list);
        $this->_view->assign('users', $users);
        $this->_view->assign('params', $params);
        $this->_view->assign('amounts', DAO_SaleCard::getAmounts());
    }

    /**
     * 添加
     */
    public function addAction() {
        $retailer = $this->_getCurrentRetailer();
        $userDao = new DAO_User();
        // 表单提交
        if ($this->_request->isPost()) {
            $data = $this->_request->getPost();
            try {
                $userDao = new DAO_User();
                $user = $userDao->get($data['uid']);

                try {
                    //请求ecshop 添加余额
                    $get = array('method' => 'add_user_account', 'phone'=> $user->uPhone, 'money' => $data['scAmount']);
                    ksort($get, SORT_STRING);
                    $str = implode($get);
                    $get['sign'] = md5($str . Helper_Curl::$signStr);
                    $result =  Helper_Curl::get(Helper_Curl::$url, $get);
                } catch (Exception $e){
                    throw new Exception($e->getMessage()); 
                }

                $uBalance = $result;

                $rid = $retailer['rid'];
                $data['scAmount'] = $data['scAmount'] * 100;
                $userDao->modify($data['uid'], 'uBalance = '. intval($uBalance * 100));
                $dao = new DAO_SaleCard();
                $data['rid'] = $rid;
                $dao->add($data); 
            } catch (Exception $e){
                return $this->_errorMessage($e->getMessage());
            }
            return $this->_successMessage('操作成功');
        }

        try {
            $users = $userDao->listByConditions();
        } catch (Exception $e) {
        
        }

        $this->_view->assign('users', $users);
        $this->_view->assign('action', $this->_request->getActionName());
        $this->_view->assign('data', array());
        $this->_view->assign('amounts', DAO_SaleCard::getAmounts());

    }

    /**
     * 编辑
     */
    public function editAction() {
        $id = $this->_request->get('id');

        if (!$id) {
            return $this->_errorMessage('您访问的网址不合法');
        }

        $dao = new DAO_SaleCard();
        // 表单提交
        if ($this->_request->isPost()) {
            $data = $this->_request->getPost();
            try {
                $result = $dao->modify($data['scid'], $data); 
            } catch (Exception $e){
                return $this->_errorMessage($e->getMessage());
            }
            return $this->_successMessage('操作成功');
        }

        try {
            $data = $dao->get($id);
        } catch (Exception $e) {
            return $this->_errorMessage($e->getMessage());
        }

        $this->_view->assign('data', $data);
        $this->_view->assign('action', $this->_request->getActionName());
        $this->_view->assign('amounts', DAO_SaleCard::getAmounts());
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
            $dao = new DAO_SaleCard();
            $dao->remove($id); 
        } catch (Exception $e){
            return $this->_errorMessage($e->getMessage());
        }

        return $this->_successMessage('操作成功');
    }
}
