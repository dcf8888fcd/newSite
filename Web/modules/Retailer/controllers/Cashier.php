<?php
/**
 * Retailer 会员管理
 */

require_once dirname(__FILE__) . '/Base.php';
class CashierController extends Retailer_BaseController {
    

    /**
     * 列表
     */
    function indexAction(){
        $params = $this->_request->getRequest();
        $retailer = $this->_getCurrentRetailer();
        try {
            $dao = new DAO_Cashier();
            $conditions = array();

            $pageOptions = array(
                'perPage' => 2,
                'urlVar' => 'currentPage',
                'delta' => 5,
                'currentPage'  => $this->_request->get('currentPage',1),
            );

            $where = array('rid = ?');
            $conditions = array($retailer['rid']);

            if ($params['cName']) {
                $where[] = 'cName LIKE ?';
                $conditions[] = $params['uName'] . '%';
            }

            if ($params['cPhone']) {
                $where[] = 'cPhone LIKE ?';
                $conditions[] = $params['uPhone'] . '%';
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
    }

    /**
     * 添加
     */
    public function addAction() {
        $retailer = $this->_getCurrentRetailer();
        // 表单提交
        if ($this->_request->isPost()) {
            $data = $this->_request->getPost();
            try {
                $dao = new DAO_Cashier();
                $data['rid'] = $retailer['rid'];
                $data['cPwd'] = md5($data['cPwd']);
                $list= $dao->listByConditions(array('cName = ?' , $data['cName']));
                if ($list) {
                    throw new Exception('已经存在相同名称的管理员'); 
                }
                $result = $dao->add($data); 
            } catch (Exception $e){
                return $this->_errorMessage($e->getMessage());
            }
            return $this->_successMessage('操作成功');
        }

        $this->_view->assign('action', $this->_request->getActionName());
        $this->_view->assign('data', array());

    }

    /**
     * 编辑
     */
    public function editAction() {
        $id = $this->_request->get('id');

        if (!$id) {
            return $this->_errorMessage('您访问的网址不合法');
        }

        $retailer = $this->_getCurrentRetailer();
        $dao = new DAO_Cashier();
        // 表单提交
        if ($this->_request->isPost()) {
            $data = $this->_request->getPost();
            $data['rid'] = $retailer['rid'];
            try {
                $data['cPwd'] = md5($data['cPwd']);
                $result = $dao->modify($data['cid'], $data); 
            } catch (Exception $e){
                return $this->_errorMessage($e->getMessage());
            }
            return $this->_successMessage('操作成功');
        }

        $this->_view->assign('data', $data);
        $this->_view->assign('action', $this->_request->getActionName());
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
            $dao = new DAO_Cashier();
            $dao->remove($id); 
        } catch (Exception $e){
            return $this->_errorMessage($e->getMessage());
        }

        return $this->_successMessage('操作成功');
    }
}
