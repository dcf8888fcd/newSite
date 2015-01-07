<?php
/**
 * Skel_Table
 *
 *     作者: 石瑞 (shirui@comsenz.com)
 * 创建时间: 2010-07-05 10:03:00
 * 修改记录:
 *
 * $Id: Table.php 12 2010-11-22 04:18:08Z shirui $
 */

class Skel_Table {

    /**
     * table
     * 表名
     *
     * @var string
     */
    public $table;

    /**
     * tableRealName
     * 去掉了前缀的表名
     *
     * @var string
     */
    public $tableRealName;

    /**
     * DAOClassName
     * DAO类名
     *
     * @var string
     */
    public $DAOClassName;

    /**
     * serviceClassName
     * service类名
     *
     * @var string
     */
    public $serviceClassName;

    /**
     * tableInfo
     * 表信息
     *
     * @var array
     */
    public $tableInfo;

    /**
     * primaryKey
     * 主键
     *
     * @var tring
     */
    public $primaryKey;

    /**
     * fieldPrefix
     * 字段前缀
     *
     * @var string
     */
    public $fieldPrefix;

    /**
     * statusFieldName
     * 状态字段名
     *
     * @var string
     */
    public $statusFieldName;

    /**
     * createdField
     * 创建时间字段名
     *
     * @var string
     */
    public $createdField;

    /**
     * updatedFieldName
     * 更新时间字段名
     *
     * @var string
     */
    public $updatedFieldName;

    /**
     * deletedFieldName
     * 删除时间字段名
     *
     * @var string
     */
    public $deletedFieldName;

    /**
     * codeVarName
     * 代码中的变量名
     *
     * @var string
     */
    public $codeVarName;

    /**
     * serviceVarName
     * service变量名
     *
     * @var string
     */
    public $serviceVarName;

    /**
     * _dbh
     * dbh对象
     *
     * @var object
     */
    protected $_dbh;

    /**
     * _app
     * 当前app名称
     *
     * @var string
     */
    protected $_app;

    /**
     * _table
     * 当前表名
     *
     * @var string
     */
    protected $_table;

    /**
     * __construct
     * 构造方法
     *
     * @param  string $app
     * @param  string $table
     * @return void
     */
    public function __construct($app, $table) {

        Yaf_Registry::set('appName', $app);
        $this->table = $table;

        $app = ucfirst($app);
        $this->_app = $app;

        $table = strtolower($table);
        if (strpos($table, '_') === false) {
            throw new Skel_Exception('Unexcepted table name');
        }
        $this->_table = $app;

        if (!defined('APP_PATH')) {
            //define('APP_PATH', ROOT_PATH . '/apps/' . $app);
            define('APP_PATH', ROOT_PATH . '/' . $app);
        }
        $this->_dbh = new DB_Table($table);

        $this->tableRealName = $this->_getTableRealName($table);
        $this->DAOClassName = $this->_getDAOClassName($app, $table);
        $this->EntityClassName = $this->_getEntityClassName($app, $table);
        $this->serviceClassName = $this->_getServiceClassName($app, $table);

        $this->tableInfo = $this->_getTableInfo($table);
        $this->primaryKey = $this->_getPrimaryKey($this->tableInfo);
        $this->fieldPrefix = $this->_getFieldPrefix($this->tableInfo);

        // 时间、状态字段
        $this->statusFieldName = $this->fieldPrefix . '_status';
        $this->createdField = $this->fieldPrefix . '_created';
        $this->updatedFieldName = $this->fieldPrefix . '_updated';
        $this->deletedFieldName = $this->fieldPrefix . '_deleted';

        $this->codeVarName = $this->_getCodeVarName($this->serviceClassName);
        $this->serviceVarName = $this->_getCodeVarName($this->serviceClassName) . 'Model';
    }

    /**
     * _getTableRealName
     * 去掉了前缀的表名
     *
     * @param  string $table
     * @return string
     */
    protected function _getTableRealName($table) {

        $fragments = explode('_', $table);
        array_shift($fragments);
        $tableRealName = join('_', $fragments);
        return $tableRealName;
    }

    /**
     * _getEntityClassName
     * 获取Entity类名
     *
     * @param  string $app
     * @param  string $table
     * @return void
     */
    protected function _getEntityClassName($app, $table) {

        $table = $this->_getTableRealName($table);
        $fragments = explode('_', $table);

        $last = array_pop($fragments);
        $last = Skel_Inflector::singularize($last);
        array_push($fragments, $last);

        $table = join('_', $fragments);
        //$class = ucfirst($app) . '_DAO_' . ucfirst(Skel_Inflector::camelize($table));    //Entity类名定义--bhy
        $class = 'Entity_' . ucfirst(Skel_Inflector::camelize($table));

        return $class;
    }

    /**
     * getEntityFilePath
     * 获取Entity文件位置
     *
     * @return string
     */
    public function getEntityFilePath() {

        $EntityClassName = $this->EntityClassName;

        $fragments = explode('_', $EntityClassName);
        $app = Yaf_Registry::get('appName');
        $fileName = array_pop($fragments);

        $file = ROOT_PATH . '/' . $app . '/src/Entity/' . $fileName . '.php';
        return $file;
    }

    /**
     * _getDAOClassName
     * 获取DAO类名
     *
     * @param  string $app
     * @param  string $table
     * @return void
     */
    protected function _getDAOClassName($app, $table) {

        $table = $this->_getTableRealName($table);
        $fragments = explode('_', $table);

        $last = array_pop($fragments);
        $last = Skel_Inflector::singularize($last);
        array_push($fragments, $last);

        $table = join('_', $fragments);
        //$class = ucfirst($app) . '_DAO_' . ucfirst(Skel_Inflector::camelize($table));    //DAO类名定义--bhy
        $class = 'DAO_' . ucfirst(Skel_Inflector::camelize($table));

        return $class;
    }

    /**
     * getDAOFilePath
     * 获取DAO文件位置
     *
     * @return string
     */
    public function getDAOFilePath() {

        $DAOClassName = $this->DAOClassName;

        $fragments = explode('_', $DAOClassName);
        $app = Yaf_Registry::get('appName');
        $fileName = array_pop($fragments);

        $file = ROOT_PATH . '/' . $app . '/src/DAO/' . $fileName . '.php';
        return $file;
    }

    /**
     * _getServiceClassName
     * 获取Service类名
     *
     * @param  string $app
     * @param  string $table
     * @return string
     */
    protected function _getServiceClassName($app, $table) {

        $table = $this->_getTableRealName($table);
        $fragments = explode('_', $table);

        $last = array_pop($fragments);
        $last = Skel_Inflector::singularize($last);
        array_push($fragments, $last);

        $table = join('_', $fragments);
        //$class = ucfirst($app) . '_Service_' . ucfirst(Skel_Inflector::camelize($table));
        $class = ucfirst(Skel_Inflector::camelize($table)).'Model' ;

        return $class;
    }

    /**
     * getServiceFilePath
     * 获取Service文件位置
     *
     * @return string
     */
    public function getServiceFilePath() {

        $serviceClassName = $this->serviceClassName;

        $fragments = explode('_', $serviceClassName);
        //$app = array_shift($fragments);
        $app = Yaf_Registry::get('appName');
        $fileName = array_pop($fragments);

        $file = ROOT_PATH . '/' . $app . '/models/' . $fileName . '.php';
        return $file;
    }

    /**
     * _getPrimaryKey
     * 获取主键
     *
     * @param  array $tableInfo
     * @return string
     */
    protected function _getPrimaryKey($tableInfo) {

        foreach ($tableInfo as $fieldInfo) {
            if (strtoupper($fieldInfo['Key']) == 'PRI') {
                return $fieldInfo['Field'];
            }
        }
    }

    /**
     * _getFieldPrefix
     * 获取字段前缀
     *
     * @param  array $tableInfo
     * @return string
     */
    protected function _getFieldPrefix($tableInfo) {

        $count = count($tableInfo) - 1;
        list($fieldPrefix, ) = explode('_', $tableInfo[$count]['Field']);
        return $fieldPrefix;
    }

    /**
     * _getTableInfo
     * 获取表信息
     *
     * @param  string $table
     * @return array
     */
    protected function _getTableInfo($table) {

        return $this->_dbh->findBySql('SHOW FULL FIELDS FROM ' . $table);
    }

    /**
     * _getCodeVarName
     * 获取代码中的的变量名
     *
     * @param  string $serviceClassName
     * @return string
     */
    protected function _getCodeVarName($serviceClassName) {

        $fragments = explode('_', $serviceClassName);
        $varName = array_pop($fragments);

        return strtolower($varName{0}) . substr($varName, 1);
    }

}
