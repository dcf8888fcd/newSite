<?php
    /**
     * Api_Test
     */

    class Api_User extends YarApi {

        /**
         * @param $name
         * @param $pwd
         */

        public function add($name, $pwd){
            try {
                $userModel = new UserModel();
                $data = array(
                    'uName' => $name,
                    'uPwd' => md5($pwd),
                );
                return $userModel->add($data);
            } catch (Exception $e) {
                throw new Yar_Server_Exception($e->getMessage());
            }
        }
    }
