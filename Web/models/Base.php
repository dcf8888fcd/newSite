<?php

class BaseModel {

    protected static $_instance;

    protected $dao = null;

    public function __construct($shardKey = array()){
        if (!$this->dao) {
            $daoName = 'DAO_' . str_replace('Model', '', get_called_class());

            if ($shardKey) {
                $daoName::$shardKey = $shardKey;
            }

            $this->dao = new $daoName();
        }
    }

    public static function getInstance($shardKey = array()){
        if (! self::$_instance) {
            self::$_instance = new self($shardKey);
        }

        return self::$_instance;
    }

    /**
     * @param array $data
     * return Model
     */
    public function add($data) {
        try {
            return $this->dao->add($data);
        } catch (Exception $e) {
           throw new Exception('系统异常'); 
        }
    }

    /**
     * @param mixed $key array|string
     */
    public function get($key, $field = array()){
        try {
            return $this->dao->get($key);
        } catch (Exception $e) {
           throw new Exception('系统异常'); 
        }
    }

    public function update($key, $data) {
        try {
            return $this->dao->modify($key, $data);
        } catch (Exception $e) {
           throw new Exception('系统异常'); 
        }
    }

    public function updateByConditions($condition, $data){
        try {
            return $this->dao->updateByConditions($condition, $data);
        } catch (Exception $e) {
           throw new Exception('系统异常'); 
        }
    }

    public function remove($key) {
        try {
            return $this->dao->remove($key);
        } catch (Exception $e) {
           throw new Exception('系统异常'); 
        }
    }

    public function listByCondition($conditions = array(),  &$pageOptions = array(), $field = array(),  $order = null, $group = null) {
        try {
            return $this->dao->listByCondition($conditions, $pageOptions, $field, $order, $group);
        } catch (Exception $e) {
           throw new Exception('系统异常'); 
        }
    }
}
