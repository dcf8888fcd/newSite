<?php
class Boss_BaseController extends BaseController {

    //忽略登陆操作的module.action
    protected $_ignoreLogins = array('index.index', 'index.login');
    protected $_cookieExpired = '+1 day';
    protected $_joinStr = '_';
    protected $_title = '首页';
    protected $_baseUri = '';


    public function init(){
        parent::init();
        $this->_baseUri = '/'. $this->_request->getModuleName();

        $manager = $this->_getCurrentManager(); 
        //判断登陆
        if (!in_array(strtolower($this->_request->getControllerName() . '.' . $this->_request->getActionName()), $this->_ignoreLogins) && !$manager) {
            return $this->_redirect($this->_baseUri .'/index/index');
        }

        if ($manager && !$this->_checkSign()) {
            $this->_logout();
            return $this->_sendErrorMessage('操作不合法');
        }

        if (!$this->_request->isXmlHttpRequest()) {
            $this->_assignCommon();
        }
    } 

    /**
     * 公共试图赋值
     */
    public function _assignCommon(){
        $navs = $this->_getNavs();
        $this->_view->assign('_navs', $navs);
        $this->_view->assign('_breadcrumb', $this->_getBreadCrumb($navs));
        $this->_view->assign('_title', $this->_title);
        $this->_view->assign('_baseUri', $this->_baseUri);
        $this->_view->assign('_user', $this->_getCurrentManager());
    }


    public function _getBreadCrumb($navs){
        $breadcrumb = array();
        $uri = $this->_request->getRequestUri();
        //获取面包屑
        $findBreadCrumb = false;
        foreach ($navs as $controller => $nav) {
            if ($nav['subnavs']) {
                foreach ($nav['subnavs'] as $action => $subNav) {
                    if ($uri == $subNav['url']) {
                        $breadcrumb[] = array('url' => $subNav['url'], 'text' => $subNav['text'], 'active' => true);
                        $findBreadCrumb = true;
                        break;
                    }
                }
                if ($findBreadCrumb) {
                    $breadcrumb[] = array('url' => $nav['url'], 'text' => $nav['text']);
                    break;
                }
            } else {
                if ($uri == $subNav['url']) {
                    $nav['active'] = true;
                    $breadcrumb[] = $nav;
                    $findBreadCrumb = true;
                    break;
                }
            }
        }
        $breadcrumb[] = array('url' => $this->_baseUri . '/index/index', 'text' => '首页');
        $breadcrumb = array_reverse($breadcrumb, true);

        return $breadcrumb;
    }

    /**
     * 菜单栏
     */
    public function _getNavs(){
    
        $config = new Yaf_Config_ini(APP_PATH .'/config/menu.ini', $_SERVER['RUN_MODE']);
        $menus = $config->get($this->_request->getModuleName()); 
        return $menus;
    }

    public function _getCurrentManager(){
        $manager = json_decode($this->_getCookie('manager'), 1);
        return $manager;
    }


    /**
     * 设置登陆状态
     */
    public function _setLogin($data) {
        if (!$data || !is_array($data)) {
            throw new Exception('不正确的设置');
        }
        
        foreach ($data as $name => &$value) {
            if (is_array($value) || is_object($value)) {
                $value = json_encode($value);
            }
            $this->_setCookie($name, $value);
        }

        $this->_setCookie('sign', $this->_generateSign($data));
    }

    /**
     * 生产加密字符串  用于前段cookie校验
     */
    public function _generateSign($cookieData) {
        $str = join($joinStr, $cookieData);
        $sign = md5($str . $this->_joinStr . md5($str));

        return $sign;
    }

    /**
     * 检测cookie中的数据是否被篡改
     */
    public function _checkSign() {

        $cookies = $this->_request->getCookie();
        $data = array();
        if ($cookies) {
            foreach ($cookies as $name => $value) {
                if (stripos($name, $this->_request->getModuleName()) === 0) {
                    $data[$name] = $value;
                }
            }
        }
        
        unset($data[$this->_request->getModuleName() . $this->_joinStr . 'sign']);
        $sign = $this->_generateSign($data);
        if ($sign == $this->_getCookie('sign')) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 退出登陆
     */
    public function _logout() {
        $cookies = $this->_request->getCookie();
        $this->_cookieExpired = '-1 day';
        $ignore = array('mid');

        if ($cookies) {
            foreach ($cookies as $name => $value) {
                if (in_array($name, $ignore)) {
                    continue;
                }
                
                $module = $this->_request->getModuleName();
                if (stripos($name, $module) === 0) {
                    $this->_setCookie(substr($name, strlen($module) + 1), '');
                }
            }
        }
    }


    /**
     * 设置cookie
     */
    public function _setCookie($name, $value) {
        $config = Yaf_Registry::get('application');
        $path = $config->get('application.cookie.'. $this->_request->getModuleName() .'.path'); 
        $domain = $config->get('application.cookie.'. $this->_request->getModuleName() .'.domain'); 

        if ($this->_cookieExpired) {
            setcookie($this->_request->getModuleName(). '_' . $name, $value, strtotime($this->_cookieExpired), $path, $domain);
        } else {
            setcookie($this->_request->getModuleName(). '_' . $name, $value, strtotime('+1 hour'), $path, $domain);
        }
    }

    /**
     * 获取cookie
     */
    public function _getCookie($name) {
        return $this->_request->getCookie($this->_request->getModuleName() . '_' . $name); 

    }
}
