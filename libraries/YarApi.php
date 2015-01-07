<?php
    class YarApi {

        /**
         * $constant string 
         *
         */
        public function getConstant($constant) {
            $classname = get_called_class();
            $obj =new reflectionClass($classname);
            if ($obj->hasConstant($constant)) {
                $result = $obj->getConstant($constant);
                return $result;
            }

            list($entityName, $constantName) = explode('::', $constant);

            if (!class_exists($entityName)) {
                throw new Yar_Server_Exception('not exists this class name :' . $entityName);
            }

            $obj = new reflectionClass($entityName);

            if (!$obj->hasConstant($constantName)) {
                throw new Yar_Server_Exception('not exists this constant name :' . $constant);
            }

            return $obj->getConstant($constantName);
        }

        /**
         * ²âÊÔ
         * */
        public function listConstants(){
            $classname = get_called_class();
            $obj =new reflectionClass($classname);
            return $obj->getConstants();
        }
    }
