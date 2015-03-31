<?php
/**
 *
 */
class Helper_Curl {
    
    public static $url = 'http://ecshop/user.php?act=api';
    public static $signStr = '123456';

    public static function get($url, $get = array(), $post = array(), $opt = array()) {

        if ($get) {
            if (strpos($url, '?') === false) {
                $url .= '?'. http_build_query($get);
            } else {
                $url .= '&'. http_build_query($get);
            }
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); // fix: dnscache's problem with https://
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        if ($opt) {
            curl_setopt_array($ch, $opt);
        }

        if ($post) {
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        }

        $result = curl_exec($ch);

        $errmsg = 'curl happed an error[' . curl_errno($ch) . ']:'. curl_error($ch);
        curl_close($ch);
        if ($result === false) {
            throw new Exception($errmsg);
        }

        $jsonArr = json_decode($result, 1);
        if ($jsonArr) {
            if ($jsonArr['errcode'] != 0) {
                throw new Exception($jsonArr['errmsg']);
            }
            $result = $jsonArr['result'];
        }

        return $result;
    }
}
