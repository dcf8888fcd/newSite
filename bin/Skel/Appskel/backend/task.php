#!/usr/local/php/bin/php
<?php
/**
 * task后台程序入口
 *
 *      作者: 温达明 (wendaming@comsenz.com)
 * 创建时间: 2012-08-23
 * 修改记录:
 *
 * 执行某个程序的方法：
 *   $ php task.php -n [src/include/Backend/Tool/下的文件名] [args]
 * 例如：
 *   $ php task.php -n test
 *   $ php task.php -n test -f 10 -t 20
 *   其中，参数使用$this->_opts['key']获取
 *
 * $Id: task.php 2956 2012-12-27 04:26:20Z wendaming $
 */

define('CLI_CMD', 'Task');

require_once dirname(__FILE__) . '/cmd.php';
