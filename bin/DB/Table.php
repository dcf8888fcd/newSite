<?php
/**
 * 数据操作的类
 *
 *     作者：谢伯杰(xiebojie@comsenz.com)
 * 创建日期：2009-09-21
 * 修改记录：2009-11-17 周国强 转换成Manyou格式
 *           2010-04-22 周国强 findAll()方法增加排序参数
 *           2010-07-23 石瑞 根据connect规则分库分表
 *           2011-08-08 温达明 save方法的参数问题，将 $params = null修改为$params = array()
 *           2012-04-27 温达明 增加主从库的配置读取
 *           2013-01-28 温达明 增加charset，读取ttc表时可以区分不同的字符集
 *           2013-10-14 丁静   增加dbname，记录表对应的库名，查询时 库名.表名
 * 存在问题：1.应该增加数据库列名到memcache 数组键名  命名规则的转化
 *           2.增加一次插入多条语句的函数
 *           dingsitao@comsenz.com
 *           添加 truncate function
 *
 * $Id: Table.php 14039 2012-07-25 08:06:03Z wendaming $
 */

class DB_Table {

    /**
     * _dbh
     * DB对象的实例
     *
     * @var DB
     */
    private $_dbh;

    /**
     * _table
     * 当前操作的物理表名
     *
     * @var string
     */
    private $_table;

    /**
     * _dbname
     * 当前操作的表所在的库名
     *
     * @var string
     */
    private $_dbname;

    /**
     * _conf 
     * 数据库配置信息
     * 
     * @var mixed
     */
    private $_conf;

    /**
     * _charset 
     * 数据表字符集
     * 
     * @var mixed
     * @access private
     */
    private $_charset;

    /**
     * _forceMaster 
     * 是否强制读取主库
     * 
     * @var mixed
     */
    private $_forceMaster = false;

    /**
     * 构建数据操作实例
     *
     * - 由外部指定分表时(尚不支持)：
     *   $db = new DB_Table('table_name_1');
     *
     * - 由外部指定不分表时
     *   $db = new DB_Table('table_name');
     *
     * - 本程序负责分表时：
     *   $db = new DB_Table('table_name', array('s_id' => 1000));
     *
     * @param string $table
     * @param integer $shardKey 分库标志
     *  + key 数据库字段
     *  + value 与字段对应的值
     */
    public function __construct($table, $shardKey = array()) {

        $conf = self::shardTable($table, $shardKey);
        $this->_table = $conf['table'];
        $this->_charset = $conf['charset'];
        $this->_conf = $conf;

        $this->_dbname = $this->_getDBName($conf);
        //$hash = crc32($key);
        //$dsn = $dsns[$hash % count($dsns)];
    }

    private function _getDBName($conf) {
        
        $dsn = $conf['db']['dsn'] ? $conf['db']['dsn'] : $conf['db_slave']['dsn'];
        
        $dsnArr = explode(";", $dsn);
        $dbname = '';
        foreach ($dsnArr as $key => $val) {
            if (strpos(strtolower($val), 'dbname') !== false) {
                $dbname = substr($val, strpos($val, '=') + 1);
                break;
            }
        }

        return $dbname;
    }
    /**
     * getDbh
     * 获取DB对象
     *
     * @return object
     */
    public function getDbh($isMaster = true, $forceConnect = false) {

        if ($this->_forceMaster || $isMaster) {
            return DB::connect($this->_conf['db']['dsn'], $this->_conf['db']['user'], $this->_conf['db']['password'], $forceConnect, $this->_charset);
        } else {
            return DB::connect($this->_conf['db_slave']['dsn'], $this->_conf['db_slave']['user'], $this->_conf['db_slave']['password'], $forceConnect, $this->_charset);
        }
    }

    /**
     * 根据表名和key分库(分表)
     *
     * 目前shardKey只支持一个字段
     *
     * 根据表名前缀(第一个_前面的部分)区分是哪个模块，进而读取相应模块的数据库配置文件，
     * 如果需要根据模块和$key分数据库，则返回相应的配置；否则使用默认的配置
     * 在配置文件conf/db.php中，指定$conf['MODULE.siteTables.TABLE.num']的值，可实现所有数据库上TABLE的分表
     *
     * @param string $table 表名
     * @param array $shardKey   切分关键字
     * @return array
     *           + db 数据库相关配置
     *           + table 物理表名
     */
    public static function shardTable($table, $shardKey = array()) {

        $appName = Bootstrap_Env::get('app_name');

        $result = array();
        $module = substr($table, 0, strpos($table, '_'));
        $modules = Config::get($appName . '.db.modules');
        $tables = Config::get($appName . '.db.' . $module . '.tables');
        $slaveTables = Config::get($appName . '.db.' . $module . '.slave_tables');

        if (!in_array($module, $modules)) {
            throw new DB_Exception('Can not find db config for table ' . $table);
        }

        $result = array();

        // 设置默认字符集
        $result['charset'] = $tables[$table]['charset'];
        if (!$result['charset']) {
            $result['charset'] = 'utf8';
        }

        // 不分库的情况
        if (!$shardKey || !array_key_exists($table, $tables)) {

            // DSN为多个数据源的数组，如果表没设置dsn，默认取第0个
            $dsnConfig = Config::get($appName . '.db.' . $module);

            // 主库的DSN配置
            $tableMasterDSN = intval($tables[$table]['dsn']);
            $result['db'] = $dsnConfig[$tableMasterDSN];

            if ($slaveTables && array_key_exists($table, $slaveTables)) {

                // 从库的DSN配置
                $tableSlaveDSN = intval($slaveTables[$table]['dsn']);
                $result['db_slave'] = $dsnConfig[$tableSlaveDSN];
            } else {
                $result['db_slave'] = $result['db'];
            }

            $result['table'] = $table;

            return $result;
        }

        // 分库分表
        $shardConfig = Config::get($appName . '.db.' . $module . '.' . $table . '.shard');

        if ($shardConfig) {
            $shardData = DB_Shard::getDB($shardConfig, $shardKey);
            if ($shardData) {
                $result['db'] = $result['db_slave'] = $shardData['db'];
                if ($shardData['table']) {
                    $result['table'] = $shardData['table'];
                } else {
                    $result['table'] = $table;
                }
            } else {
                throw new DB_Exception('Shard table error, check table config.');
            }
        } else {
            throw new DB_Exception('Can not find db config for table ' . $table);
        }

        return $result;

    }

    /**
     * 获取一条记录
     *
     * @param string $conditions 
     * @param array $param 
     * @param array columns 列
     * @return array || null
     */
    public function find($conditions = null, $params = array(), $columns = array('*')) {

        $columns = implode(',', $columns);
        $sql = "SELECT $columns FROM $this->_dbname.$this->_table";

        if ($conditions) {
            $sql .= ' WHERE ' . $conditions;
        }

        try {
            $data = self::getDbh(false)->fetchRow($sql, $params);
        } catch (PDOException $e) {
            try {
                $data = self::getDbh(false, true)->fetchAll($sql, $params);
            } catch (PDOException $e){
                throw new DB_Exception($e->getMessage());
            }
        }

        return $data;
    }

    /**
     * 取得所有的记录
     *
     * @param array $conditions
     * @param array $params
     * @param array $columns
     * @param integer $start
     * @param integer $limit
     * @param string $order
     *   fieldName1 => [ASC|DESC]
     *   fieldName2 => [ASC|DESC]
     * @return array
     */
    public function findAll($conditions = null, $params = array(), $columns = array('*'),
                            $start = 0, $limit = 0, $order = array()) {

        $columns = implode(',', $columns);
        $sql = "SELECT $columns FROM $this->_dbname.$this->_table ";

        if ($conditions) {
            $sql .= ' WHERE ' . $conditions;
        }

        if ($order && is_array($order)) {
            $orderClause = '';
            foreach ($order as $field => $orderBy) {
                $orderClause .= $field . ' ' . $orderBy . ',';
            }
            $sql .= ' ORDER BY ' . rtrim($orderClause, ',');
        } else if ($order && is_string($order)) {
            $sql .= ' ORDER BY ' . $order;
        }

        if ($limit) {
            $sql .= " LIMIT $start, $limit";
        }

        try {
            $rows = self::getDbh(false)->fetchAll($sql, $params);
        } catch (PDOException $e){
            try {
                $rows = self::getDbh(false, true)->fetchAll($sql, $params);
            } catch (PDOException $e){
                throw new DB_Exception($e->getMessage());
            }
        }
        return $rows;
    }

    /**
     * 获取游标方式查询
     *
     * @param array $conditions
     * @param array $params
     * @param array $columns
     * @param integer $start
     * @param integer $limit
     * @param string $order
     *   fieldName1 => [ASC|DESC]
     *   fieldName2 => [ASC|DESC]
     * @return Cursor
     */
    public function findCursor($conditions = null, $params = array(), $columns = array('*'),
                            $start = 0, $limit = 0, $order = array()) {

        $columns = implode(',', $columns);
        $sql = "SELECT $columns FROM $this->_dbname.$this->_table ";

        if ($conditions) {
            $sql .= ' WHERE ' . $conditions;
        }

        if ($order && is_array($order)) {
            $orderClause = '';
            foreach ($order as $field => $orderBy) {
                $orderClause .= $field . ' ' . $orderBy . ',';
            }
            $sql .= ' ORDER BY ' . rtrim($orderClause, ',');
        } else if ($order && is_string($order)) {
            $sql .= ' ORDER BY ' . $order;
        }

        if ($limit) {
            $sql .= " LIMIT $start, $limit";
        }

        $cursor = null;
        try {
            $cursor = self::getDbh(false)->cursor($sql, $params);
        } catch (PDOException $e){
            try {
                $cursor = self::getDbh(false, true)->cursor($sql, $params);
            } catch (PDOException $e){
                throw new DB_Exception($e->getMessage());
            }
        }
        return $cursor;
    }

    /**
     * findBySql
     *
     * @param  string $sql
     * @param  array $params
     * @return array
     */
    public function findBySql($sql, $params = array()) {

        try {
            $sql = $this->_rewriteSql($sql);
            $data = self::getDbh(false)->fetchAll($sql, $params);
        } catch (PDOException $e){
            try {
                $data = self::getDbh(false, true)->fetchAll($sql, $params);
            } catch (PDOException $e){
                throw new DB_Exception($e->getMessage());
            }
        }
        return $data;
    }

    /**
     * 删除记录
     *
     * @param string $conditions
     * @param array $param
     * @return int affect rows
     */
    public function remove($conditions, $params) {

        $sql = "DELETE FROM $this->_dbname.$this->_table WHERE $conditions ";
        try {
            return self::getDbh()->exec($sql, $params);
        } catch (PDOException $e){
            try {
                return self::getDbh(true, true)->exec($sql, $params);
            } catch (PDOException $e){
                throw new DB_Exception($e->getMessage());
            }
        }
    }

    /**
     * 插入一条记录 或更新表记录
     *
     * @param array $data
     * @param string $conditions
     * @param array $param
     * @return bool || int
     */
    public function save($data, $conditions = NULL, $params = array()) {

        $tempParams = array();
        $set = array();
        foreach ($data as $k => $v) {
            array_push($set, $k . '= ?');
            array_push($tempParams, $v);
        }

        if ($conditions) {
            // 更新
            $sql = "UPDATE $this->_dbname.$this->_table SET " . join(',',$set) . " WHERE $conditions";
            $params = array_merge($tempParams,$params);
        } else {
            // 插入
            $sql = "INSERT INTO  $this->_dbname.$this->_table SET ". join(',', $set);
            $params = $tempParams;
        }
        // 捕获PDOException后 抛出DB_Exception
        try{
            return self::getDbh()->exec($sql, $params);
        } catch (PDOException $e){
            try {
                return self::getDbh(true, true)->exec($sql, $params);
            } catch (PDOException $e){
                throw new DB_Exception($e->getMessage());
            }
        }
    }

    /**
     * replace
     * 根据主键替换或保存
     *
     * @param array $data
     * @return mixed
     */
    public function replace($data) {

        $tempParams = array();
        $set = array();
        foreach ($data as $k => $v) {
            array_push($set, $k . '= ?');
            array_push($tempParams, $v);
        }

        $sql = "REPLACE INTO $this->_dbname.$this->_table SET ". join(',', $set);

        try{
            return self::getDbh()->exec($sql, $tempParams);
        } catch (PDOException $e){
            try {
                return self::getDbh(true, true)->exec($sql, $params);
            } catch (PDOException $e){
                throw new DB_Exception($e->getMessage());
            }
        }
    }

    /**
     * 获取刚刚写入记录的ID
     *
     * @author 黄磊 <huanglei@comsenz.com>
     * @date 10/21/2009
     * @return int 
     */
    public function lastInsertId() {

        try{
            return self::getDbh()->lastInsertId();
        } catch (PDOException $e){
            try {
                return self::getDbh(true, true)->lastInsertId($sql, $params);
            } catch (PDOException $e){
                throw new DB_Exception($e->getMessage());
            }
        }
    }

    /**
     * 一次插入多条记录
     *
     * @param  $data
     */
    public function multiInsert($data) {

        $count = count($data);
        $getKeys = array_keys($data[0]);
        $countKeys = count($getKeys);
        $columns = implode(',', $getKeys);

        // 构造问号表达式
        $tmpArr = array();
        for($i=0;$i< $countKeys;$i++) {
            $tmpArr[] = '?';
        }
        $tmpStr = implode(',', $tmpArr);
        $tmpStr = '(' . $tmpStr. ')';
        $tmpArr2 = array();
        $mergeArr = array();
        for ($i=0;$i < $count; $i++){
            $tmpArr2[] = $tmpStr;
            $mergeArr = array_merge($mergeArr, array_values($data[$i]));
        }

        $tmpStr2 = implode(',', $tmpArr2);
        $conditions = "INSERT INTO $this->_dbname.$this->_table ($columns) VALUES $tmpStr2";
        try {
            return  self::getDbh()->exec($conditions,$mergeArr);
        } catch (PDOException  $e) {
            try {
                return self::getDbh(true, true)->exec($conditions, $mergeArr);
            } catch (PDOException $e){
                throw new DB_Exception($e->getMessage());
            }
        }
    }

    /**
     * 数据表列名到缓存列名的转换
     *
     * @param array $array
     */
    public function keyMap($array){

        $outArray = array();
        foreach ($array as $key => $value) {
            $keyArr = explode('_',$key);
            $outKey = ucfirst($keyArr[1]) . ucfirst(@$keyArr[2]) . ucfirst(@$keyArr[3]);
            $outArray[$outKey] = $value;
        }
        return $outArray;
    }

    /**
     * count
     * 计算行数
     *
     * @param  string $conditions
     * @param  array $params
     * @return integer
     */
    public function count($conditions = NULL, $params = array()) {

        $sql = 'SELECT COUNT(*) FROM ' . $this->_dbname . '.' . $this->_table ;
        try {
            if ($conditions) {
                $sql .= ' WHERE ' . $conditions;
            }
            return  self::getDbh(false)->fetchOne($sql, $params);

        } catch (PDOException  $e) {
            try {
                return self::getDbh(true, true)->fetchOne($sql, $params);
            } catch (PDOException $e){
                throw new DB_Exception($e->getMessage());
            }
        }
    }

    /**
     * exec
     * 执行sql语句
     *
     * @param  string $sql
     * @param  string $params
     * @return void
     */
    public function exec($sql, $params = array()) {

        try {
            $sql = $this->_rewriteSql($sql);
            $result = self::getDbh()->exec($sql, $params);
        } catch (PDOException $e) {
            throw new DB_Exception($e);
        }

        return $result;
    }

    public function incr($field, $conditions = null, $params = array(),  $unit = 1) {

        $sql = 'UPDATE ' . $this->_dbname . '.' . $this->_table . " SET `$field` = `$field` + $unit";
        if ($conditions) {
            $sql .= ' WHERE ' . $conditions;
        }
        try {
            $result = self::getDbh()->exec($sql, $params);
        } catch (PDOException $e) {
            throw new DB_Exception($e->getMessage, $e->getCode());
        }
        return $result;
    }

    public function decr($field , $conditions = null, $params = array(), $unit = 1) {

        $sql = 'UPDATE ' . $this->_dbname . '.' . $this->_table . " SET $field = IF($field > $unit,  $field - $unit, 0)";
        if ($conditions) {
            $sql .= ' WHERE ' . $conditions;
        }

        try {
            $result = self::getDbh()->exec($sql, $params);
        } catch (PDOException $e) {
            throw new DB_Exception($e->getMessage);
        }
        return $result;
    }

    public function truncate() {

        $sql = "TRUNCATE  $this->_dbname.$this->_table  ";
        //echo "$sql \n";
        $params = array();
        try {
            return self::getDbh()->exec($sql, $params);
        } catch (PDOException $e) {
            throw new DB_Exception($e->getMessage());
        }
    }

    public function beginTransaction() {

        $this->_forceMaster = true;
        return self::getDbh()->begin();
    }

    public function commitTransaction() {

        $this->_forceMaster = false;
        return self::getDbh()->commit();
    }

    public function rollBackTransaction() {

        $this->_forceMaster = false;
        return self::getDbh()->rollBack();
    }

    protected function _rewriteSql($sql) {

        $pattern = '/((?:select.*?from|insert into|delete from|update|replace into|truncate table|describe|alter table)\s+)`?(\w+)`?/i';
        return preg_replace($pattern, '\1' . $this->_dbname . '.' . $this->_table, $sql);
    }

}
