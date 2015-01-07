<?php
/**
 * library 列表生成工具
 *
 *     作者: 石瑞 (shirui@comsenz.com)
 * 创建时间: 2010-06-03 10:03:00
 * 修改记录:
 *
 * 此工具用于生成类库中的类名和文件的对应关系，以便自动加载功能使用
 *
 * 使用方法为：
 * <code>
 *     $ php createLibraryIndex.php
 * </code>
 *
 * $Id: createLibraryIndex.php 2 2010-10-26 08:02:27Z zhouguoqiang $
 */

$libraryPath = dirname(dirname(__FILE__)) . '/libraries/';
$map = array();

$iterator = new RecursiveDirectoryIterator($libraryPath);

foreach (new RecursiveIteratorIterator($iterator, RecursiveIteratorIterator::LEAVES_ONLY) as $file) {

    $filepath = $file->getPathname();

    if (strtolower(pathinfo($filepath, PATHINFO_EXTENSION)) != 'php') {
        continue;
    }

    $className = str_replace(array($libraryPath, '.php'), '', $filepath);
    $className = str_replace('/', '_', $className);

    $content = file_get_contents($filepath);
    $pattern = '/\s+class\s+' . $className . '/';
    if (preg_match($pattern, $content)) {
        $map[$className] = str_replace($libraryPath, '', $filepath);
    }

}

var_export($map);
