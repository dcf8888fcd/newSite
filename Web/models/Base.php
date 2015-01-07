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
        return $this->dao->add($data);
    }

    /**
     * @param mixed $key array|string
     */
    public function get($key, $field = array()){
        return $this->dao->get($key);
    }

    public function update($key, $data) {
        return $this->dao->modify($key, $data);
    }

    public function updateByConditions($condition, $data){
        return $this->dao->updateByConditions($condition, $data);
    }

    public function remove($key) {
        return $this->dao->remove($key);
    }

    public function listByCondition($conditions = array(),  &$pageOptions = array(), $field = array(),  $order = null, $group = null) {
        return $this->dao->listByCondition($conditions, $pageOptions, $field, $order, $group);
    }
}
