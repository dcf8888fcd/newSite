<?php
/**
 * Helper_Key
 * 修改时间:
 *
 */
class Helper_Key {
   
    /**
     * 生成手机验证 短信码
     *
     */
    public static function generateSMSKey($uid, $bid, $type) { 

        return md5($uid . '_' . $bid . '_' . $type);
    } 
    
    /**
     * 生成找回密码的Key
     * 通过手机号找回
     *
     */
    public static function generateBackPwdKey($mobile, $type) { 

        return md5($mobile . '_' . $type);
    }

    /**
     * generateCardKey
     * 生成会员卡的KEY
     *
     * @param string $brandName
     * @param string $name 联系人姓名
     * @param string $phone  电话
     * @return string
     */
    public static function generateCardKey($brandName, $name, $phone) {

        return self::_generateInt10Key();
    }
    
    /**
     * _generateInt10Key
     * 生成长度为10的整数KEY
     *
     * @return integer
     */
    private static function _generateInt10Key() {

        $res = uniqid('', false);

        $ret = '';
        for ($i = 5; $i < 14; $i ++ ) {
            $ret = $res{$i} . $res{++ $i} . $ret;
        }

        return str_pad(bcmod(self::bchexdec($ret), 4200000000), 10, '1', STR_PAD_LEFT);
    }

    
    /**
     * bchexdec
     * 十六进制转换成十进制（高精度）
     *
     * @param  string $hex 十六进制
     * @return integer
     */
    private static function bchexdec($hex) {

        if(strlen($hex) == 1) {

            return hexdec($hex);
        } else {

            $remain = substr($hex, 0, -1);
            $last = substr($hex, -1);
            return bcadd(bcmul(16, self::bchexdec($remain)), hexdec($last));
        }
    }

    public static function encrypt($str, $key = 'p3&w@UY(nq}mv') {

        $block = mcrypt_get_block_size('des', 'ecb');
        $pad = $block - (strlen($str) % $block);
        $str .= str_repeat(chr($pad), $pad);

        return base64_encode(mcrypt_encrypt(MCRYPT_DES, $key, $str, MCRYPT_MODE_ECB));
    }

    public static function decrypt($str, $key = 'p3&w@UY(nq}mv') {

        $str = base64_decode($str);
        $str = mcrypt_decrypt(MCRYPT_DES, $key, $str, MCRYPT_MODE_ECB);
        $block = mcrypt_get_block_size('des', 'ecb');
        $pad = ord($str[($len = strlen($str)) - 1]);

        return substr($str, 0, strlen($str) - $pad);
    }

    /**
     * 生成短信充值订单号，16位
     * @return string
     */
    public static function generateOSn() {

        $partTime = date('ymd');

        $partRandom = self::_generateInt10Key();

        return $partTime . $partRandom;
    }
    
    /**
     * 生成微信Token
     * generateWxToken
     * @param string $bid
     *
     */
    public static function generateWxToken($bid) {

       return md5($bid + time()); 
    }
}
