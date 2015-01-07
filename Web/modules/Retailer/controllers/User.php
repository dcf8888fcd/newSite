<?php
/**
 * Retailer后台 会员管理
 */

require_once dirname(__FILE__) . '/Base.php';
class UserController extends Retailer_BaseController {

     /**
     * 列表
     */
    function indexAction(){
        $params = $this->_request->getRequest();
        $retailer = $this->_getCurrentRetailer();

        try {
            $dao = new DAO_User();
            $conditions = array();

            $pageOptions = array(
                'perPage' => 2,
                'urlVar' => 'currentPage',
                'delta' => 5,
                'currentPage'  => $this->_request->get('currentPage',1),
            );

            $where = array('rid = ?');
            $conditions = array($retailer['rid']);

            if ($params['uName']) {
                $where[] = 'uName LIKE ?';
                $conditions[] = $params['uName'] . '%';
            }

            if ($params['uPhone']) {
                $where[] = 'uPhone LIKE ?';
                $conditions[] = $params['uPhone'] . '%';
            }

            if ($params['uNo']) {
                $where[] = 'uNo LIKE ?';
                $conditions[] = $params['uNo'] . '%';
            }

            if ($conditions) {
                array_unshift($conditions, implode(' AND ', $where));
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
                $list= $dao->listByConditions(array('uName = ?' , $data['uName']));
                if ($list) {
                    throw new Exception('已经存在相同名称的管理员'); 
                }
                $result = $dao->add($data); 
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
