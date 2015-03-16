<?php
    /**
     * Api_Test
     */

    class Api_User extends YarApi {

        private $model;

        public function __construct(){
            $this->model = new UserModel();
        }

        /**
         * 添加用户
         * @param $name
         * @param $pwd
         */

        public function add($phone, $pwd){
            try {
                $data = array(
                    'uName' => $phone,
                    'uPhone' => $uPhone,
                    'uPwd' => md5($pwd),
                );
                return $this->model->add($data);
            } catch (Exception $e) {
                throw new Yar_Server_Exception($e->getMessage());
            }
        }

        /**
         * 同步余额
         * $name
         * $balance
         * $pwd
         */
        public function syncBalance($name, $balance, $pwd) {
            try {
                $user = $this->model->getByName($name); 
                if (!$user) {
                    throw new Exception('不存在的用户');
                }

                if ($user['uPwd'] != $pwd) {
                    throw new Exception('账号验证不正确');
                }

                $data = array(
                    'uBalance' => $balance,
                );

                $result = $this->model->modify($user['uid'], $data);

            } catch (Exception $e) {
                throw new Yar_Server_Exception($e->getMessage());
            }

            return $result;
        }
    }
