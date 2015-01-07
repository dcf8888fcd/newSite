<?php
class DAO_Goods extends DAO_Base {
    public static $table_name = 'web_goods';
    public static $pk = 'gid';

    /**
     *  商品类型:餐饮
     */
    const TYPE_FOOD = 1;

    /**
     *  商品类型:农产品
     */
    const TYPE_FARM = 2;

    /**
     *  商品类型:景区服务
     */
    const TYPE_SCENIC = 3;

    /**
     *  商品类型:其他
     */
    const TYPE_OTHER = 4;

    public static function getTypes(){
        return array(static::TYPE_FOOD => '餐饮', static::TYPE_FARM => '农产品', static::TYPE_SCENIC => '景区服务', static::TYPE_OTHER => '其他');
    }
}
