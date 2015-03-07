<?php
require_once (APP_PATH.'/../libraries/ActiveRecord.php');

class DAO_Base extends ActiveRecord\Model {

    /**
     * 正常数据
     */
    const STATUS_NORMAL = 1;

    /**
     * 删除状态数据
     */
    const STATUS_REMOVED = 9;

    /**
     * 创建数据时间
     */
    public $created_at = 'created';

    /**
     * 更新数据时间
     */
    public $updated_at = 'updated';

    /**
     * 删除数据时间
     */
    public $deleted_at = 'deleted';

    /**
     * 数据状态
     */
    public $status = 'status';

    /**
     * 分库分表的规则,类中必须含有规格方法的实现
     */
    public static $rules = array(
        'mod',     // 按字段的值求模切分
        'range',   // 按范围切分
        'direct',   // 直接按字段值切分
        'distribute',   // 根据配置按cid分库，cardid分表
    ); 

    /**
     * 如果有分库分表的配置
     */
    public static $shardConfig = array(
        'key' => array('uId'),
        'rule' => 'mod',
        'table' => 'baiguestbook_message%s',
        'dbnum' => 2,
        'tblnum' => 2,
        'dsn' => 'mysql://root:123456@%s/ecshop%s',
        'dbhosts' => array(
            'localhost',
        ),
        'irregulars' => array(),
    );

    /**
     * 分表字段
     * 如果是分库分表的调用必须像如下调用
     * DAO_Base::$shardKey = array('uId' => 333);
     * DAO_Base::find('all');
     */
    public static $shardKey = array();

    /**
     * dsn配置
     *
     */
    public static $dsn = 'mysql://root:123456@localhost/web?charset=utf8';

    /**
     * 表主键
     */
    public static $pk = 'id';

    public function __construct(array $attributes=array(), $guard_attributes=true, $instantiating_via_find=false, $new_record=true){
        if (static::$shardKey) {
            $result = static::toShard();
            static::$table_name = $result['table'];
            static::$dsn = $result['dsn'];
        }
        $config = Yaf_Registry::get('application');
        $dbConfig = $config->get('application.db');
        $dsn = $dbConfig->get('dsn');
        ActiveRecord\Config::initialize(function($cfg) use ($dsn)
        {
                $cfg->set_connections(array(
                $_SERVER['RUN_MODE'] => $dsn), $_SERVER['RUN_MODE']);
        });
        parent::__construct($attributes, $guard_attributes, $instantiating_via_find, $new_record);
    }

    /**
     * @param array $data
     * return Model
     */
    public function add($data) {
        try {
            
            if (!$data[$this->status]) {
                $data[$this->status] = self::STATUS_NORMAL;
            }

            $now = date('Y-m-d H:i:s');

            if (!$data[$this->updated_at])
                $data[$this->updated_at] = $now;

            if (!$data[$this->created_at])
                $data[$this->created_at] = $now;

            $model = static::create($data, true, false); 
        } catch (Exception $e) {
            throw new ActiveRecord\ModelException($e);
        }

        $result = $model->values_for_pk();
        
        if ($result) {
            $result = $result[static::$pk];
        }
        return $result;
    }

    /**
     * 获取记录
     * @param mixed $key 主键|数组主键
     * @return array 
     */
    public function get($key, $field = array()){
        try {

            $options = array();

            if ($field) {
                $options['select'] = $field;
            }

            if (is_array($key)) {
                $options['conditions'] = array(static::$pk . ' IN (?)', $key);
                $data = static::find('all', $options);
            } else {
                $options['conditions'] = array(static::$pk . ' =? ', $key);
                $data = static::find('first', $options);
            }


        } catch (Exception $e) {
            throw new ActiveRecord\ModelException($e);
        }

        return $data;
    }

    /**
     * @param string  $key
     * @param array  $data
     *
     * return Model
     */
    public function modify($key, $data) {
        try {
            $conditions = array(static::$pk => $key);

            if (is_string($data)){
                if (strpos($data, $this->updated_at) === false) {
                    $data .= ','.$this->updated_at . '='. date('"Y-m-d H:i:s"');
                }
            } else {
                if (!$data[$this->updated_at]) {
                    $data[$this->updated_at] = date('Y-m-d H:i:s');
                }
            }

            return $this->updateByConditions($conditions, $data);
        } catch (Exception $e) {
            throw new ActiveRecord\ModelException($e);
        }
    }

    public function updateByConditions($condition, $data){
        try {
            $options = array();
            $options['conditions'] = $condition;
            $options['set'] = $data;
            return static::update_all($options);
        } catch (Exception $e) {
            throw new ActiveRecord\ModelException($e);
        }
    }

    public function remove($key) {
        try {

            $conditions = array(static::$pk => $key);
            $data = array($this->deleted_at => Date('Y-m-d H:i:s'), $this->status => self::STATUS_REMOVED);
            return $this->updateByConditions($conditions, $data);
        } catch (Exception $e) {
            throw new ActiveRecord\ModelException($e);
        }
    }

    public function listByConditions($conditions = array(),  &$pageOptions = array(), $field = array(), $order = null, $group = null) {
         try {

            $options = array();

            if (!is_array($conditions)){
                throw new ActiveRecord\ModelException('conditions must be an array');
            }

            if ($conditions && strpos($conditions[0], $this->status) === false) {
                $conditions[0] .=  ' AND ' . $this->status . " != ? ";
                $conditions[] = self::STATUS_REMOVED;
            }

            if ($conditions) {
                $options['conditions'] = $conditions;
            } else {
                $options['conditions'] = array(1);
            }

            if ($group) {
                $options['group'] = $group;
            }

            if ($pageOptions) {

                $pageOptions['totalItems'] =  static::count($options);
                if (!$pageOptions['perPage']) {
                    $pageOptions['perPage'] = 20;
                }

                if (!$pageOptions['currentPage'] || !is_numeric($pageOptions['currentPage']) || $pageOptions['currentPage'] < 1) {
                    $pageOptions['currentPage'] = 1;
                }

                $options['limit'] = $pageOptions['perPage'];
                $options['offset'] = ($pageOptions['currentPage'] - 1) * $pageOptions['perPage'];

            }

            if ($field) {
                if (is_array($field)) {
                    $field = join(',', $field);
                }
                $options['select'] = $field;
            }

            if ($order && strpos($order, $this->created_at) === false) {
                $order .=  ',' . $this->created_at . " DESC";
            } else {
                $order = $this->created_at . " DESC";
            }
            $options['order'] = $order;

            return static::find('all', $options);
        } catch (Exception $e) {
            throw new ActiveRecord\ModelException($e);
        }
    }

    public function countByCondition($conditions = array()) {
        try {

            $condition = array(static::$pk => $key);
            $options = array();
            $options['conditions'] = $condition;
            return static::count($options);
        } catch (Exception $e) {
            throw new ActiveRecord\ModelException($e);
        }
    }

    /**
     * 分库分表操作
     *
     */
    public static function toShard(){
        $shardConfig = static::$shardConfig;
        if (!$shardConfig) {
            throw new ActiveRecord\ModelException('shareConfig can not be emtpy');
        }

        if (!in_array($shardConfig['rule'], static::$rules)) {
            throw new ActiveRecord\ModelException('Invalid Shard rule:' . $shardConfig['rule']);
        }

        if (!is_array($shardConfig['key'])) {
            $shardConfig['key'] = array($shardConfig['key']);
        }

        $shardKey = static::$shardKey;
        foreach ($shardKey as $k => $v) {
            if (!in_array($k, $shardConfig['key'])) {
                throw new ActiveRecord\ModelException('Invalid Shard key:' . $k . '. Expected Shard key:' . implode(',', $shardConfig));
            }
        }

        $shardValue = array_values($shardKey);

        if ($result = static::_irregular($shardConfig, $shardValue)) {
            return $result;
        }

        $result = call_user_func_array(array(self, '_' . $shardConfig['rule']), array($shardConfig, $shardValue));
        return $result;

    }

    /**
     * _irregular
     * 首先处理例外情况
     *
     * @param mixed $shardConfig
     * @param mixed $shardValue
     * @static
     * @access private
     * @return array
     */
    private static function _irregular($shardConfig, $shardValue) {

        $result = array();

        if (!array_key_exists('irregulars', $shardConfig)) {
            return $result;
        }

        if (is_array($shardValue)) {
            $shardValue = $shardValue[0];
        }

        if (!array_key_exists($shardValue, $shardConfig['irregulars'])) {
            return $result;
        }

        $result['dsn'] = $shardConfig['irregulars'][$shardValue]['dsn'];
        $result['table'] = $shardConfig['irregulars'][$shardValue]['table'];

        return $result;
    }

    /**
     * _mod 
     * 按取模切分
     * 
     * @param mixed $shardConfig 
     * @param mixed $shardValue 
     * @static
     * @access private
     * @return void
     */
    private static function _mod($shardConfig, $shardValue) {

        $result = array();

        // 求出shardValue的crc32值
        if (is_array($shardValue)) {
            $shardValue = implode('_', $shardValue);
        }
        $shardValue = crc32($shardValue);

        $db = $shardValue % $shardConfig['dbnum'];
        $table = ($shardValue / $shardConfig['dbnum']) % $shardConfig['tblnum'];
        $hostNum = $shardValue % count($shardConfig['dbhosts']);
        $host = $shardConfig['dbhosts'][$hostNum];

        $shardConfig['dsn'] = sprintf($shardConfig['dsn'], $host, $db);
        $result['dsn'] = $shardConfig['dsn'];
        $result['table'] = sprintf($shardConfig['table'], $table);

        return $result;
    }

    /**
     * _range 
     * 按范围切分
     * 
     * @param mixed $shardConfig 
     * @param mixed $shardValue 
     * @static
     * @access private
     * @return void
     */
    private static function _range($shardConfig, $shardValue) {

        $result = array();

        if (is_array($shardValue)) {
            $shardValue = $shardValue[0];
        }

        foreach ($shardConfig['shards'] as $shard) {
            if ($shardValue >= $shard['min'] && $shardValue <= $shard['max']) {
                $result['dsn'] = $shard['dsn'];
                break;
            }
        }

        return $result;
    }

    /**
     * _direct 
     * 直接按值切分
     * 
     * @param mixed $shardConfig 
     * @param mixed $shardValue 
     * @static
     * @access private
     * @return array
     */
    private static function _direct($shardConfig, $shardValue) {

        $result = array();

        if (is_array($shardValue)) {
            $shardValue = $shardValue[0];
        }

        $hostNum = $shardValue % count($shardConfig['dbhosts']);
        $host = $shardConfig['dbhosts'][$hostNum];

        $shardConfig['dsn'] = sprintf($shardConfig['dsn'], $host);
        $result['dsn'] = $shardConfig['dsn'];
        $result['table'] = sprintf($shardConfig['table'], $shardValue);

        return $result;
    }

    /**
     * _distribute
     * 根据配置按cid分库，按cardid分表
     * 
     * @param mixed $shardConfig 
     * @param mixed $shardValue 
     * @static
     * @access private
     * @return void
     */
    private static function _distribute($shardConfig, $shardValue) {

        $result = array();

        if (count($shardValue) != 2) {
            throw new ActiveRecord\ModelException('Shard key error');
        }

        $dbShardValue = $shardValue[0];
        $tblShardValue = $shardValue[1];

        foreach($shardConfig['dbDistribution'] as $itemKey => $itemList){
            if(in_array($dbShardValue, $itemList)){
                $db = $itemKey;
                break;
            }
        }

        foreach($shardConfig['tblDistribution'] as $itemKey => $itemList){
            if(in_array($tblShardValue, $itemList)){
                $table = $itemKey;
                break;
            }
        }

        if(!isset($db)){
            $dbShardValue = crc32($dbShardValue);
            $dbDisNum = count($shardConfig['dbDistribution']);
            $db = ($dbShardValue % ($shardConfig['dbnum']-$dbDisNum))+$dbDisNum;
        }

        if(!isset($table)){
            $tblShardValue = crc32($tblShardValue);
            $tblDisNum = count($shardConfig['tblDistribution']);
            $table = ($tblShardValue % ($shardConfig['tblnum']-$tblDisNum))+$tblDisNum;
        }


        $hostNum = $shardValue % count($shardConfig['dbhosts']);
        $host = $shardConfig['dbhosts'][$hostNum];

        $shardConfig['dsn'] = sprintf($shardConfig['dsn'], $host, $db);
        $result['dsn'] = $shardConfig['dsn'];
        $result['table'] = sprintf($shardConfig['table'], $table);

        return $result;
    }
}
