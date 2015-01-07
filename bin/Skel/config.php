<?php
/**
 * skel 配置文件
 *
 *     作者: 石瑞 (shirui@comsenz.com)
 * 创建时间: 2010-07-05 10:03:00
 * 修改记录:
 *
 * $Id: config.php 21 2010-11-29 02:07:09Z shirui $
 */

/**
 * 作者配置
 * 用于生成文件头部的注释部分
 */
$conf['author.name'] = 'houguoquan';
$conf['author.email'] = 'houguoquan@tencentwsh.com';

/**
 * 缩进符号
 * 使用4个空格、\t、还是其他
 */
$conf['format.indentUnit'] = '    ';

/**
 * 域名
 * 用户生成App时
 */
$conf['domain'] = 'welife.com';

/**
 * 代码模板，对于templates目录下的文件夹名称
 */
$conf['template'] = 'default';

return $conf;
