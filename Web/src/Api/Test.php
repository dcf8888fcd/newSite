<?php
    /**
     * Api_Test
     */

    class Api_Test extends YarApi {

        /**
         *  text
         */
        const TYPE_TEXT = 1;

        /**
         *
         * image
         */

        const TYPE_IMAGE = 2;

        /**
         * @param $id int
         */

        public function add($id, $name){
            try {
                return $id . '_'. $name;
            } catch (Exception $e) {
                throw new Yar_Server_Exception($e);
            }
        }

        /**
         * @param $id int
         */
        public function get($id) {

        }


    }
