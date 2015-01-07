<?php
/**
 * Skel_Model_Entity
 *
 *     作者: 石瑞 (shirui@comsenz.com)
 * 创建时间: 2010-07-05 10:03:00
 * 修改记录:
 *
 * $Id: Entity.php 2 2010-10-26 08:02:27Z zhouguoqiang $
 */

class Skel_Model_Entity extends Skel_Model_Abstract {

    /**
     * createAction
     * 创建一个Entity
     *
     * @param  array $params
     * @return void
     */
    public function createAction($params) {

        // 获取参数
        $tableName = $this->_getModelName();
        if (!$tableName) {
            $tableName = $this->_stdin('Table Name', true);
        }

        $appName = $this->_getLongParams('app');
        if (!$appName) {
            $appName = $this->_stdin('Application name', true);
        }
        $this->_checkAppAvailable($appName);

        // table对象
        $table = new Skel_Table($appName, $tableName);

        // 捕获输出
        ob_start();
        include($this->template('entity/create'));
        $content = ob_get_contents();
        ob_clean();

        // 写入文件
        $file = $table->getEntityFilePath();
        if (is_file($file)) {
            throw new Skel_Exception("$file is already exists.");
        }

        $this->_writeToFile($file, $content);

        $this->_output("{desc}Entity '$table->EntityClassName' created successfully at{/desc}" . PHP_EOL ."    $file" . PHP_EOL . PHP_EOL);
    }

}
