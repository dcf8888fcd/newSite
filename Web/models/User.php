<?php

/**
 * 会员
 */
class UserModel extends BaseModel {

    public function add($data) {
        $uName = $data['uName'];
        if (!$uName) {
            throw new LogicException("用户名不能为空");
        }
        if (!$data['uPwd']) {
            throw new LogicException("密码不能为空");
        }
        
        try {
            $user = $this->getByName($uName);
        } catch (Exception$e){
            throw Exception('数据异常');
        }
        if ($user) {
            throw new LogicException("该用户名已经存在");
        }
        return parent::add($data);
    } 

    public function getByName($uName) {
        try {
            $list= $this->dao->listByConditions(array('uName = ?' , $uName));
        } catch (Exception $e){
            throw new Exception('系统错误');
        }

        if ($list) {
            $list = $list[0];
        }

        return $list;

    }
}
