<?php
/**
 * Boss后台 会员管理
 */

require_once dirname(__FILE__) . '/Base.php';
class RetailerController extends Boss_BaseController {
        

    public function init(){
        parent::init();
    }

    /**
     * 列表
     */
    function indexAction(){
        $params = $this->_request->getRequest();
        try {
            $dao = new DAO_Retailer();
            $conditions = array();


            $pageOptions = array(
                'perPage' => 2,
                'urlVar' => 'currentPage',
                'delta' => 5,
                'currentPage'  => $this->_request->get('currentPage',1),
            );
            if ($params['mName']) {
                $conditions = array('rName LIKE ?' , $params['rName'].'%');
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
        $this->_view->assign('rateMultiple', DAO_Retailer::RATE_MULTIPLE);
        $this->_view->assign('types', DAO_Retailer::getTypes());
    }

    /**
     * 添加
     */
    public function addAction() {
        // 表单提交
        if ($this->_request->isPost()) {
            $data = $this->_request->getPost();
            try {
                $dao = new DAO_Retailer();
                $data['rPwd'] = md5($data['rPwd']);
                $data['rSaleRate'] = intval($data['rSaleRate']) * DAO_Retailer::RATE_MULTIPLE;
                $data['rSaleCardRate'] = intval($data['rSaleCardRate']) * DAO_Retailer::RATE_MULTIPLE;
                $list= $dao->listByConditions(array('rName = ?' , $data['rName']));
                if ($list) {
                    throw new Exception('已经存在相同名称的零售商'); 
                }
                $result = $dao->add($data); 
            } catch (Exception $e){
                return $this->_errorMessage($e->getMessage());
            }
            return $this->_successMessage('操作成功');
        }

        $this->_view->assign('action', $this->_request->getActionName());
        $this->_view->assign('data', array());
        $this->_view->assign('types', DAO_Retailer::getTypes());

    }

    /**
     * 编辑
     */
    public function editAction() {
        $id = $this->_request->get('id');

        if (!$id) {
            return $this->_errorMessage('您访问的网址不合法');
        }

        $dao = new DAO_Retailer();
        // 表单提交
        if ($this->_request->isPost()) {
            $data = $this->_request->getPost();
            try {
                $data['rPwd'] = md5($data['rPwd']);
                $data['rSaleRate'] = intval($data['rSaleRate']) * DAO_Retailer::RATE_MULTIPLE;
                $data['rSaleCardRate'] = intval($data['rSaleCardRate']) * DAO_Retailer::RATE_MULTIPLE;
                $result = $dao->modify($data['rid'], $data); 
            } catch (Exception $e){
                return $this->_errorMessage($e->getMessage());
            }
            return $this->_successMessage('操作成功');
        }

        $data = $dao->get($id);
        $this->_view->assign('data', $data);
        $this->_view->assign('action', $this->_request->getActionName());
        $this->_view->assign('types', DAO_Retailer::getTypes());
        $this->_view->assign('rateMultiple', DAO_Retailer::RATE_MULTIPLE);
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
            $dao = new DAO_Retailer();
            $dao->remove($id); 
        } catch (Exception $e){
            return $this->_errorMessage($e->getMessage());
        }

        return $this->_successMessage('操作成功');
    }


    //售卡结算历史
    public function calcSaleCardAction(){
        $rid = $this->_request->get('rid');
        $confirm = $this->_request->get('confirm');
        try {            
            $retailerDao = new DAO_Retailer();
            $retailer = $retailerDao->get($rid);
            
            if (!$retailer) {
                return $this->_ajaxMessage(1, '不存在此零售商');
            }
            
            //售卡列表总值
            $saleCardDao = new DAO_SaleCard();
            $startTime = Date('Y-m-d 00:00:00', strtotime('-15 days'));
            $endTime = Date('Y-m-d 00:00:00');
            $conditions = array('rid = ? AND created >= ? AND created < ? AND status = ? ',
                $rid, $startTime, $endTime, DAO_SaleCard::STATUS_NORMAL,
            );
            $pageOptions = array();
            $result = $saleCardDao->listByConditions($conditions, $pageOptions, array('sum(scAmount) as scAmount'));
            $totalMoney = intval($result[0]->scAmount);

            if (!$totalMoney) {
                return $this->_ajaxMessage(1, '账单已结算或本次无盈利');
            }

            if ($confirm == 'yes') {

                $saleCardDao->updateByConditions($conditions, array($saleCardDao->status => DAO_SaleCard::STATUS_CALCED));

                $rate = $retailer->rSaleCardRate;
                $history = array(
                    'rid' => $rid,
                    'scshAmount' => round($totalMoney * $rate / 10000),
                    'scshStartTime' => $startTime,
                    'scshEndTime' => $endTime,
                );
                $saleCardShareHistoryDao = new DAO_SaleCardShareHistory();
                $saleCardShareHistoryDao->add($history);

                return $this->_ajaxMessage(0, '', array());
            }

            return $this->_ajaxMessage(0, '', array('totalMoney' => round($totalMoney / 100, 2), 'startTime' => $startTime, 'endTime' => $endTime));
        } catch (Exception $e) {
            return $this->_ajaxMessage(1, $e->getMessage());
        }

    }

    public function calcSaleAction(){
        $rid = $this->_request->get('rid');
        $confirm = $this->_request->get('confirm');
        try {            
            $retailerDao = new DAO_Retailer();
            $retailer = $retailerDao->get($rid);
            
            if (!$retailer) {
                return $this->_ajaxMessage(1, '不存在此零售商');
            }
            
            //销售列表总值
            $orderDao = new DAO_Order();
            $startTime = Date('Y-m-d 00:00:00', strtotime('-15 days'));
            $endTime = Date('Y-m-d 00:00:00');
            $conditions = array('rid = ? AND created >= ? AND created < ? AND status = ? ',
                $rid, $startTime, $endTime, DAO_SaleCard::STATUS_NORMAL,
            );
            $pageOptions = array();
            $result = $orderDao->listByConditions($conditions, $pageOptions, array('sum(oTotalPrice) as oTotalPrice'));
            $totalMoney = intval($result[0]->oTotalPrice);

            if (!$totalMoney) {
                return $this->_ajaxMessage(1, '账单已结算或本次无盈利');
            }

            if ($confirm == 'yes') {

                $orderDao->updateByConditions($conditions, array($orderDao->status => DAO_Order::STATUS_CALCED));

                $rate = $retailer->rSaleRate;
                $history = array(
                    'rid' => $rid,
                    'pshAmount' => round($totalMoney * $rate / 10000),
                    'pshStartTime' => $startTime,
                    'pshEndTime' => $endTime,
                );
                $profitShareHistoryDao = new DAO_ProfitShareHistory();
                $profitShareHistoryDao->add($history);

                return $this->_ajaxMessage(0, '', array());
            }

            return $this->_ajaxMessage(0, '', array('totalMoney' => round($totalMoney / 100, 2), 'startTime' => $startTime, 'endTime' => $endTime));
        } catch (Exception $e) {
            return $this->_ajaxMessage(1, $e->getMessage());
        }

    }

    /**
     * 销售分成结算列表
     */
    function saleListAction(){
        $params = $this->_request->getRequest();
        try {
            $dao = new DAO_ProfitShareHistory();
            $conditions = array();


            $pageOptions = array(
                'perPage' => 2,
                'urlVar' => 'currentPage',
                'delta' => 5,
                'currentPage'  => $this->_request->get('currentPage',1),
            );
            
            $list= $dao->listByConditions($conditions, $pageOptions);

            $rids = array();

            foreach ($list as $row) {
                $rids[] = $row->rid;
            }

            $retailerDao = new DAO_Retailer();
            $retailerList = $retailerDao->get($rids);

            $retailers = array();
            foreach ($retailerList as $row) {
                $retailers[$row->rid] = $row;
            }

            $pager = Pager::factory($pageOptions);
            $links = $pager->getLinks();
        } catch (Exception $e){
            return $this->_errorMessage($e->getMessage());
        }

        $this->_view->assign('totalItems', $pager->numItems());
        $this->_view->assign('links', $links);
        $this->_view->assign('list', $list);
        $this->_view->assign('retailers', $retailers);
        $this->_view->assign('params', $params);
    }

    /**
     * 售卡分成结算列表
     */
    function saleCardListAction(){
        $params = $this->_request->getRequest();
        try {
            $dao = new DAO_SaleCardShareHistory();
            $conditions = array();


            $pageOptions = array(
                'perPage' => 2,
                'urlVar' => 'currentPage',
                'delta' => 5,
                'currentPage'  => $this->_request->get('currentPage',1),
            );
            
            $list= $dao->listByConditions($conditions, $pageOptions);

            $rids = array();

            foreach ($list as $row) {
                $rids[] = $row->rid;
            }

            $retailerDao = new DAO_Retailer();
            $retailerList = $retailerDao->get($rids);

            $retailers = array();
            foreach ($retailerList as $row) {
                $retailers[$row->rid] = $row;
            }
            $pager = Pager::factory($pageOptions);
            $links = $pager->getLinks();
        } catch (Exception $e){
            return $this->_errorMessage($e->getMessage());
        }

        $this->_view->assign('totalItems', $pager->numItems());
        $this->_view->assign('links', $links);
        $this->_view->assign('list', $list);
        $this->_view->assign('retailers', $retailers);
        $this->_view->assign('params', $params);
    }
}
