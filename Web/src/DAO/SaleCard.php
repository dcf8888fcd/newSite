<?php
class DAO_SaleCard extends DAO_Base {

    /**
     *  已结算 
     */
    const STATUS_CALCED = 2;

    public static $table_name = 'web_saleCards';
    public static $pk = 'scid';

    /**
     * 售卡金额
     */
    const AMOUNT_100 = 100;
    const AMOUNT_200 = 200;
    const AMOUNT_500 = 500;
    const AMOUNT_1000 = 1000;
    const AMOUNT_2000 = 2000;
    const AMOUNT_5000 = 5000;
    const AMOUNT_10000 = 10000;
    const AMOUNT_20000 = 20000;
    const AMOUNT_50000 = 50000;

    public static function getAmounts(){
        return array(self::AMOUNT_100 => 100, self::AMOUNT_200 => 200, self::AMOUNT_500 => 500, self::AMOUNT_1000 => '1k', self::AMOUNT_2000 => '2k', self::AMOUNT_5000 => '5k', self::AMOUNT_10000 => '1w', self::AMOUNT_20000 => '2w', self::AMOUNT_50000 => '5w',);
    }
}
