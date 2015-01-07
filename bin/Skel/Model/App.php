<?php
/**
 * Skel_Model_App
 *
 *     作者: 石瑞 (shirui@comsenz.com)
 * 创建时间: 2010-07-05 10:03:00
 * 修改记录:
 *
 * $Id: App.php 2 2010-10-26 08:02:27Z zhouguoqiang $
 */

class Skel_Model_App extends Skel_Model_Abstract {

    /**
     * createAction
     * 创建一个App
     *
     * @param  array $params
     * @return void
     */
    public function createAction($params) {

        $appName = $this->_getModelName();
        if (!$appName) {
            $appName = $this->_stdin('application name', true);
        }

        if (!$appName) {
            throw new Skel_Exception('Missing app name');
        }

        if (!preg_match('/[A-Z]+\w*/', $appName)) {
            throw new Skel_Exception("'$appName' is not a invalid application name. A good application name often start with at least one capitalletter and then follow with some other letters. Digits are not suggested. Type 'skel help app' to see more information.");
        }

        //$appPath = ROOT_PATH . '/apps/' . $appName;
        $appPath = ROOT_PATH . '/' . $appName;
        if (is_dir($appPath)) {
            throw new Skel_Exception("$appPath already exists");
        }

        // 开始创建
        if (!mkdir($appPath)) {
            throw new Skel_Exception('Can not create directory: ' . $appPath);
        }

        $appskelPath = BIN_PATH . '/Skel/Appskel';

        $iterator = new RecursiveDirectoryIterator($appskelPath);
        foreach (new RecursiveIteratorIterator($iterator, RecursiveIteratorIterator::SELF_FIRST) as $file) {

            $sourcePath = $file->getPathname();
            $skelDirPath = dirname(__FILE__);
            $skelName = basename($appskelPath);

            // 替换为新路径
            $desPath = str_replace($appskelPath, $appPath, $sourcePath);
            $desPath = str_replace($skelName, $appName, $desPath);

            if (strpos($sourcePath, '.svn') !== false) {
                continue;
            }

            if ($file->isDir()) {
                mkdir($desPath);
            } else {
                copy($sourcePath, $desPath);

                // 替换文件内容
                $content = file_get_contents($desPath);
                $content = str_replace('S__' . $skelName, strtolower($appName), $content);
                $content = str_replace($skelName, $appName, $content);
                $this->_writeToFile($desPath, $content);
            }

        }

        $domain = strtolower($appName) . '.' . $this->getConfig('domain');
        $serverIp = gethostbyname($_SERVER['HOSTNAME']);
        $request_filename = '$request_filename';

        echo <<<EOS

Application '$appName' has been created successfully.
You can find it at: $appPath

Now, you have to finish following steps in order to your application worked:

Step 0, change the direcotry of APP_PATH in file www/index.php 
Step 1, setting up your HTTP Server and add the virtual host by following commands:
----------------------------------------------------------------------------------
server {
    listen       80;
    server_name  $domain;
    index index.html index.htm index.php;
    root  $appPath/www;
    autoindex on;
    charset utf-8;

    if (!-e $request_filename) {
        rewrite ^/(.*)  /index.php last;
    }

    location ~ .*\.(php|php5)?$
    {
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
            include        fastcgi.conf;
    }

    location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$
    {
        expires      30d;
    }

    access_log  logs/$domain.log  main;
}


Step 2, adding an entry in your hosts file corresponding to the value you place in your ServerName directive:
-------------------------------------------------------------------------------------------------------------
$serverIp $domain

Step 3, start your webserver (or restart it), and you should be ready to go. Visit your website with:
-------------------------------------------------------------------------------------------------------------
http://$domain


EOS;

    }

    /**
     * showAction
     * 列出Appp
     *
     * @return void
     */
    public function showAction() {

        $dirs = glob(ROOT_PATH . '/apps/*');

        if (!$dirs) {
            throw new Skel_Exception('No application found.');
        }

        foreach ($dirs as $dir) {
            if (is_dir($dir)) {
                echo basename($dir) . PHP_EOL;
            }
        }
    }

}
