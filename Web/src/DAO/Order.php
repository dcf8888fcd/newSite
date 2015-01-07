<?php
class DAO_Order extends DAO_Base {

    /**
     *  已结算 
     */
    const STATUS_CALCED = 2;


    public static $table_name = 'web_orders';
    public static $pk = 'oid';
}
