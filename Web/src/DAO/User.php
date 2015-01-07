<?php
class DAO_User extends DAO_Base {
    public static $table_name = 'web_users';
    public static $pk = 'uid';

    /**
     * 会员等级： 默认
     */
    const LEVEL_DEFAULT = 0;

    /**
     * 会员等级： 1级
     */
    const LEVEL_ONE = 1;

    /**
     * 会员等级：2级
     */
    const LEVEL_TWO = 2;

    /**
     * 性别：不知道
     */
    const SEX_UNKNOW = 0;

    /**
     * 性别：男性
     */
    const SEX_MALE = 1;

    /**
     * 性别：女性
     */
    const SEX_FEMALE = 2;


    public static function getLevels(){
        return array(static::LEVEL_DEFAULT => '默认', static::LEVEL_ONE => '1级', static::LEVEL_TWO => '2级');
    }

    public static function getSexes(){
        return array(static::SEX_UNKNOW => '不知道', static::SEX_MALE => '男' , static::SEX_FEMALE => '女');
    }
}
