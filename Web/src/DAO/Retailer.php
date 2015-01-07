<?php
class DAO_Retailer extends DAO_Base {

    public static $table_name = 'web_retailers';
    public static $pk = 'rid';
    /**
     * 自营
     */
    const TYPE_PERSON = 1;

    /**
     * 合营
     */
    const TYPE_JOIN = 2;

    /**
     * 代理
     */
    const TYPE_AGENT = 3;

    /**
     * 比率的倍数 数据库中除以这个数为现实的值
     */
    const RATE_MULTIPLE = 100;

    static function getTypes(){
       return array(static::TYPE_PERSON => '自营', static::TYPE_JOIN => '合营', static::TYPE_AGENT=> '代理');
    }
}
