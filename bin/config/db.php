<?php
/**
 * 数据库配置文件 (正式环境)
 *
 * <code>
 *     Config::get('Meishi.host');
 * </code>
 *
 * $Id: db.php 11099 2013-10-14 08:50:46Z dingjing $
 */

//数据库表属性转换成小写
$conf['convert_to_lower'] = false;

// 支持的数据库前缀
$conf['modules'] = array( 'welife', "sms");

// 数据库配置
$conf['sms'] = array(
    array('dsn'  => 'mysql:dbname=sms;host=localhost;port=3306', 'user' => 'root', 'password' => 'comsenz'),
);
$conf['welife'] = array(
    array('dsn'  => 'mysql:dbname=welife;host=localhost;port=3306', 'user' => 'root', 'password' => 'comsenz'),
);


/**
 *  welife 数据表
 *  表对应的数据源位置，默认为0
 *  <code>
 *      $conf['welife.tables'] = array(
 *          'welife_area' => array(),
 *          'welife_account2coupons' => array('dsn' => 1),
 *      );
 *  </code>
 */
$conf['welife.tables'] = array(
        'welife_activities' => array('welife'),
);
