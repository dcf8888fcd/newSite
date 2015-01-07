<?php
/**
 * Pos后台 会员管理
 */

require_once dirname(__FILE__) . '/Base.php';
class UserController extends Pos_BaseController {
    

    /**
     * 列表
     */
    function indexAction(){
        if ($this->_request->isPost()) {
            $data = $this->_request->getPost();
            $number = $this->_request->getPost('number', 1);
            try {
                $user = $this->_getByUNo($data['uNo']);
                $goods = $this->_getGoodsByCode($data['gLineCode']);
                $cashier = $this->_getCurrentCashier();

                $userLevel = $user->uLevel;
                $price = $goods->gMarketPrice;
                if ($userLevel == DAO_User::LEVEL_ONE) {
                    $price = $goods->gOneLevelPrice;
                }

                if ($userLevel == DAO_User::LEVEL_TWO) {
                    $price = $goods->gTwoLevelPrice;
                }

                if($price > $user->uBalance) {
                    return $this->_errorMessage('余额不足');
                }

                DAO_Order::transaction(function() use ($user, $goods, $cashier, $number, $price){
                    //扣钱
                    $totalPrice = intval($price * 100) * intval($number);
                    //这里应该先加个锁
                    $userDao = new DAO_User();
                    $userDao->modify($user->uid, 'uBalance = uBalance - '. $totalPrice);
                    //这里解锁
                    $orderData = array();
                    $orderData['oSn'] = Helper_Key::generateOSn();
                    $orderData['uid'] = $user->uid;
                    $orderData['gid'] = $goods->gid;
                    $orderData['rid'] = $cashier->rid;
                    $orderData['cid'] = $cashier->cid;
                    $orderData['oPrice'] = $price;
                    $orderData['oNumber'] = $number;
                    $orderData['oTotalPrice'] = $totalPrice;
                    $orderDao = new DAO_Order();
                    $orderDao->add($orderData);

                    //加入销售结算历史表
                    //$profitShareHistory = new DAO_ProfitShareHistory();


                });
            } catch (Exception $e){
                return $this->_errorMessage($e->getMessage());
            }
            return $this->_successMessage('操作成功');
        } 
    }

    public function getUserAction(){
        $uNo = $this->_request->getPost('uNo');
        $gLineCode = $this->_request->getPost('gLineCode');
        
        try {
            $goods = $this->_getGoodsByCode($gLineCode);
        } catch (Exception $e) {
            return $this->_ajaxMessage(1, $e->getMessage());
        }

        try {
            $user = $this->_getByUNo($uNo);
        } catch (Exception $e) {
            return $this->_ajaxMessage(1, $e->getMessage());
        }

        $userLevel = $user->uLevel;
        $price = $goods->gMarketPrice;
        if ($userLevel == DAO_User::LEVEL_ONE) {
            $price = $goods->gOneLevelPrice;
        }

        if ($userLevel == DAO_User::LEVEL_TWO) {
            $price = $goods->gTwoLevelPrice;
        }

        if($price > $user->uBalance) {
            return $this->_ajaxMessage(1, '余额不足');
        }


        return $this->_ajaxMessage(0, '', $user->to_array());
    }

    public function _getByUNo($uNo){
        try {
            $dao = new DAO_User();
            $conditions = array();

            $pageOptions = array(
                'perPage' => 1,
                'urlVar' => 'currentPage',
                'delta' => 1,
                'currentPage'  => 1,
            );

            $conditions = array('uNo = ?', $uNo);

            $user= $dao->listByConditions($conditions, $pageOptions);
            if(!$user) {
                throw new Exception('不存在此用户');
            }

            $user = $user[0];

            return $user;

        } catch (Exception $e){
            throw new Exception($e);
        }

    }


    public function getGoodsAction(){
        $gLineCode = $this->_request->getPost('gLineCode');
        try {
            $goods = $this->_getGoodsByCode($gLineCode);
        } catch (Exception $e) {
            return $this->_ajaxMessage(1, $e->getMessage());
        }

        return $this->_ajaxMessage(0, '', $goods->to_array());
    }

    public function _getGoodsByCode($gLineCode = 0){
        try {
            $dao = new DAO_Goods();
            $conditions = array();

            $pageOptions = array(
                'perPage' => 1,
                'urlVar' => 'currentPage',
                'delta' => 1,
                'currentPage'  => 1,
            );

            $conditions = array('gLineCode = ?', $gLineCode);

            $goods = $dao->listByConditions($conditions, $pageOptions);
            if(!$goods) {
                throw new Exception('不存在此商品');
            }

            $goods = $goods[0];

            return $goods;

        } catch (Exception $e){
            throw new Exception($e);
        }
    }
}
