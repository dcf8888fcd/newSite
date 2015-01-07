<?php
/**
 * Boss后台 会员管理
 */

require_once dirname(__FILE__) . '/Base.php';
class OrderController extends Retailer_BaseController {
        

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
            $dao = new DAO_Order();
            $pageOptions = array(
                'perPage' => 2,
                'urlVar' => 'currentPage',
                'delta' => 5,
                'currentPage'  => $this->_request->get('currentPage',1),
            );

            $where = array('rid = ?');
            $conditions = array($retailer['rid']);

            if ($params['oSn']) {
                $where[] = ' oSn LIKE ?';
                $conditions[] = $params['oSn'] . '%';
            }

            if ($conditions) {
                array_unshift($conditions, implode(' AND ', $where));
            }
            $list= $dao->listByConditions($conditions, $pageOptions);

            $gids = array();
            foreach ($list as $order) {
                $gids[] = $order->gid;
            }

            $goods = array();
            if ($gids) {
                $goodsDao = new DAO_Goods();
                $goodsList = $goodsDao->get($gids);
                foreach ($goodsList as $good) {
                    $goods[$good->gid] = $good;
                }
            }
            $retailerDao = new DAO_Retailer();
            $retailers = $retailerDao->listByConditions();
            $pager = Pager::factory($pageOptions);
            $links = $pager->getLinks();
        } catch (Exception $e){
            return $this->_errorMessage($e->getMessage());
        }

        $this->_view->assign('totalItems', $pager->numItems());
        $this->_view->assign('links', $links);
        $this->_view->assign('goods', $goods);
        $this->_view->assign('retailers', $retailers);
        $this->_view->assign('list', $list);
        $this->_view->assign('params', $params);
    }

    /**
     * 添加
     */
    public function addAction() {
        // 表单提交
        if ($this->_request->isPost()) {
            $data = $this->_request->getPost();
            try {
                $dao = new DAO_Order();
                $data['mPwd'] = md5($data['mPwd']);
                $list= $dao->listByConditions(array('mName = ?' , $data['mName']));
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

        $dao = new DAO_Order();
        // 表单提交
        if ($this->_request->isPost()) {
            $data = $this->_request->getPost();
            try {
                $data['mPwd'] = md5($data['mPwd']);
                $result = $dao->modify($data['mid'], $data); 
            } catch (Exception $e){
                return $this->_errorMessage($e->getMessage());
            }
            return $this->_successMessage('操作成功');
        }

        $data = $dao->get($id);
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
            $dao = new DAO_Order();
            $dao->remove($id); 
        } catch (Exception $e){
            return $this->_errorMessage($e->getMessage());
        }

        return $this->_successMessage('操作成功');
    }
}
