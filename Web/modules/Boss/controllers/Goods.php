<?php
/**
 * Boss后台 会员管理
 */

require_once dirname(__FILE__) . '/Base.php';
class GoodsController extends Boss_BaseController {
        

    public function init(){
        parent::init();
    }

    /**
     * 列表
     */
    function indexAction(){
        $params = $this->_request->getRequest();
        try {
            $dao = new DAO_Goods();
            $conditions = array();


            $pageOptions = array(
                'perPage' => 2,
                'urlVar' => 'currentPage',
                'delta' => 5,
                'currentPage'  => $this->_request->get('currentPage',1),
            );
            if ($params['gName']) {
                $conditions = array('gName LIKE ?' , $params['gName'].'%');
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
        $this->_view->assign('types', DAO_Goods::getTypes());
    }

    /**
     * 添加
     */
    public function addAction() {
        // 表单提交
        if ($this->_request->isPost()) {
            $data = $this->_request->getPost();
            try {
                $dao = new DAO_Goods();
                $result = $dao->add($data); 
            } catch (Exception $e){
                return $this->_errorMessage($e->getMessage());
            }
            return $this->_successMessage('操作成功');
        }

        $this->_view->assign('types', DAO_Goods::getTypes());
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

        $dao = new DAO_Goods();
        // 表单提交
        if ($this->_request->isPost()) {
            $data = $this->_request->getPost();
            try {
                $result = $dao->modify($data['gid'], $data); 
            } catch (Exception $e){
                return $this->_errorMessage($e->getMessage());
            }
            return $this->_successMessage('操作成功');
        }

        $data = $dao->get($id);
        $this->_view->assign('types', DAO_Goods::getTypes());
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
            $dao = new DAO_Goods();
            $dao->remove($id); 
        } catch (Exception $e){
            return $this->_errorMessage($e->getMessage());
        }

        return $this->_successMessage('操作成功');
    }
}
