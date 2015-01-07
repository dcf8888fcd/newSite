<?php echo "<?php" . PHP_EOL; ?>
/**
 * <?php echo $table->DAOClassName . PHP_EOL; ?>
 *
 *     作者: <?php echo $this->getConfig('author.name'); ?> (<?php echo $this->getConfig('author.email'); ?>)
 * 创建时间: <?php echo date('Y-m-d H:i:s') . PHP_EOL; ?>
 * 修改记录:
 *
 * $Id$
 */

class <?= $table->DAOClassName; ?> extends DAOAdapter {
     
    /**
     * 表示创建时间的属性名
     *
     * @var string
     */
    static $createdField = '';

    /**
     * 表示更新时间的属性名
     *
     * @var string
     */
    static $updatedField = '';

    /**
     * 表示记录状态的属性名
     *
     * @var string
     */
    static $statusField = '';

    /**
     * 表示删除时间的属性名
     *
     * @var string
     */
    static $deletedField = '';

    /**
     * 对应的表是否有缓存
     *
     * @var boolean
     */
    static $hasCache = false;

    /**
     * 要操作的表名
     *
     * @var string
     */
    static $table = '<?php echo $tableName; ?>';

    /**
     * 主键
     *
     * @var string
     */
    static $pk = '<?php echo $table->primaryKey; ?>';

    /**
     * 允许的字段
     *
     * @var array
     */
    static $allowed = <?php echo "array('" . join("', '", Util_Array::getCol($table->tableInfo, 'Field')) . "')"; ?>;

    /**
     * 必须的字段
     *
     * @var array
     */
    static $required = array();

    /**
     * generateConditions
     * 生成查询条件
     *
     * @param array $conditions
     * @return array
     */
    protected function generateConditions($conditions) {

        $result = parent::generateConditions($conditions);
        return $result;
    }

}
