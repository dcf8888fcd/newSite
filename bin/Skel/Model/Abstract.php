<?php
/**
 * Skel_Model_Abstract
 *
 *     作者: 石瑞 (shirui@comsenz.com)
 * 创建时间: 2010-07-05 10:03:00
 * 修改记录:
 *
 * $Id: Abstract.php 21 2010-11-29 02:07:09Z shirui $
 */

abstract class Skel_Model_Abstract {

    protected $_fp;

    protected $_params;

    public function __construct($params) {

        $this->_params = $params;
        $this->_fp = fopen('php://stdin', 'r');
    }

    public function template($tpl) {

        $template = $this->_getLongParams('template');
        if (!$template) {
            $skel = Skel::getInstance();
            $template = $skel->getConfig('template');
        }

        $dirs = array_map('basename', glob(BIN_PATH . '/Skel/templates/*', GLOB_ONLYDIR));
        if (!in_array($template, $dirs)) {
            throw new Skel_Exception("template '$template' is not exists!");
        }

        $tplFile = BIN_PATH . '/Skel/templates/' . $template . '/' . $tpl . '.php';
        if (!is_file($tplFile)) {
            throw new Skel_Exception("$tplFile is not exists");
        }

        return $tplFile;
    }

    public function getConfig($key = null) {

        return Skel::getConfig($key);
    }

    protected function _getModelName() {

        $params = $this->_params;
        $modelName = @array_shift($params);
        $modelName = trim($modelName, "\"'");

        if (substr($modelName, 0, 2) == '--') {
            return null;
        }

        return $modelName;
    }

    protected function _checkAppAvailable($appName) {

        if (!$appName) {
            throw new Skel_Exception('Application name is required: assign it with --app=[name]');
        }

        //$appPath = ROOT_PATH . '/apps/' . $appName;
        $appPath = ROOT_PATH . '/' . $appName;
        if (!is_dir($appPath)) {
            throw new Skel_Exception("Application $appName not found at: $appPath");
        }

        if (!is_writable($appPath)) {
            throw new Skel_Exception("Application directory $appPath is not writable");
        }

        return true;
    }

    protected function _getLongParams($key = null) {

        $params = $this->_params;
        if (!$params) {
            return false;
        }

        $result = array();
        foreach ($params as $value) {
            if (substr($value, 0, 2) == '--') {
                $value = substr($value, 2);
                if (strpos($value, '=') !== false) {
                    list($k, $v) = explode('=', $value);
                    $result[$k] = $v;
                }
            }
        }

        if (!$key) {
            return $result;
        }

        return $result[$key];
    }

    protected function _writeToFile($file, $content) {

        $directory = dirname($file);
        if (!is_dir($directory)) {
            mkdir($directory, 0777, true);
        }

        $indentUnit = $this->getConfig('format.indentUnit');
        if ($indentUnit != '    ') {
            $content = str_replace('    ', $indentUnit, $content);
        }
        file_put_contents($file, $content);
    }

    protected function _stdin($name, $required = false, $requireMessage = null) {

        $content = null;

        while(true) {

            echo "skel> $name: ";
            $content = trim(fgets($this->_fp));

            if ($content == 'quit') {
                exit;
            }

            if ($required && !$content) {
                if ($requireMessage) {
                    echo $requireMessage . PHP_EOL;
                }
                continue;
            }

            return $content;
        }

    }

    protected function _output($string) {

        $formats = array('default' => "\033[0m",
                         'desc' => "\033[49;32;1m",
                         'variable' => "\033[49;36;1m",
                         'title' => "\033[49;34;1m"
                         );

        $string = preg_replace('/{(\w+)}(.*?){\/\1}/e', '$formats[\1] . "\2" . $formats["default"]', $string);

        printf(stripslashes($string));
    }

    /**
     * _getTemplateFilePath
     * 根据类名和action名获取模板文件位置
     *
     * @param  string $controllerClassName Controller类名
     * @param  string $actionName Action名称
     * @param  boolean $fullPath 是否是全路径
     * @return string 返回模板路径
     */
    protected function _getTemplateFilePath($controllerClassName, $actionName, $fullPath = true) {

        if (substr($actionName, -6) == 'Action') {
            $actionName = substr($actionName, 0, -6);
        }

        $fragments = explode('_', $controllerClassName);
        $appName = array_shift($fragments);

        // shift 'Controller'
        array_shift($fragments);

        $fragments = array_map(array('Skel_Inflector', 'underscore'), $fragments);

        $file =  join('/', $fragments) . '/' . Skel_Inflector::underscore($actionName);

        if ($fullPath) {
            //$file = ROOT_PATH . '/apps/' . $appName . '/src/templates/' . $file . '.tpl';
            $file = ROOT_PATH . '/' . $appName . '/src/templates/' . $file . '.tpl';
        }

        return $file;
    }

}
