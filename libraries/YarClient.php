<?php
    class YarClient {

        public static function call($url, $method, $params = array(), $options = array()) {
            try {
                $yarClient = new Yar_Client($url);

                if (!isset($options[YAR_OPT_PACKAGER])) {
                    $options[YAR_OPT_PACKAGER] = 'json';
                }

                if (!isset($options[YAR_OPT_TIMEOUT])){
                    $options[YAR_OPT_TIMEOUT] = 1;
                }

                if (!isset($options[YAR_OPT_CONNECT_TIMEOUT])){
                    $options[YAR_OPT_CONNECT_TIMEOUT] = 1;
                }

                foreach ($options as $name => $value) {
                    $yarClient->setOpt($name, $value);
                }

                return call_user_func_array(array($yarClient, $method), $params);
            } catch (Exception $e) {
                throw new Yar_Client_Exception($e);
            }
        }

        /**
         * 同步调用
         *
         */
        public static function sync($url, $method, $params, $options = array()){
            return self::call($url, $method, $params, $options);
        }

        /**
         * 异步调用
         */
        public static function ansync($url, $method, $params = array(), $atOnce = true, $callback = null, $error_callback = null, $options = array()){

            if (!$callback) {
                $callback = 'YarServer::callback';
            }

            if (!$error_callback) {
                $error_callback = 'YarServer::errorCallback';
            }

            if (!isset($options[YAR_OPT_PACKAGER])) {
                $options[YAR_OPT_PACKAGER] = 'json';
            }

            if (!isset($options[YAR_OPT_TIMEOUT])){
                $options[YAR_OPT_TIMEOUT] = 1;
            }

            if (!isset($options[YAR_OPT_CONNECT_TIMEOUT])){
                $options[YAR_OPT_CONNECT_TIMEOUT] = 1;
            }

            try {
                Yar_Concurrent_Client::call($url, $method, $params, $callback, $error_callback, $options);

                if ($atOnce){
                    return self::loop($callback, $error_callback);
                }

            } catch (Exception $e) {
                throw new Yar_Client_Exception($e);
            }

        }

        public static function loop($callback = null, $error_callback = null){
            if (!$callback) {
                $callback = 'YarServer::callback';
            }

            if (!$error_callback) {
                $error_callback = 'YarServer::errorCallback';
            }

            try {
                return Yar_Concurrent_Client::loop($callback, $error_callback);

            } catch (Exception $e) {
                throw new Yar_Client_Exception($e);
            }
        }

        public static function callback($retval, $callinfo){

        }

        public static function errorCallback($type, $error, $callinfo) {

        }
    }
