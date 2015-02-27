<?php

/**
 * 基类
 *
 */

class BaseController extends Yaf_Controller_Abstract {

    protected $_viewExt = null;

    /**
     * 初始化操作
     */
    public function init() {

        $this->_response->setHeader("Content-type","text/html; charset=utf-8");

        if (!$this->_request->isXmlHttpRequest()) {
            $config =  Yaf_Registry::get('application');
            $appPath = $config->get('application.directory');
            $moduleName = $this->_request->getModuleName();
            if ($moduleName == 'Index') {
                $this->_view->setScriptPath($appPath . '/views');
            } else {
                $this->_view->setScriptPath($appPath . '/modules/'.$moduleName.'/views');
            }

            $this->_viewExt = "." . $config->get('application.view.ext');
        }
    }

    /**
     * ajaxMessage
     */
    function _ajaxMessage($code, $message = '', $result = array(), $returnurl = '') {
        Yaf_Dispatcher::getInstance()->disableView();
        $json = json_encode(array('errcode' => $code, 'errmsg' => $message, 'result' => $result, 'returnurl' => $returnurl));
        echo $json;
        exit();
    }

    /**
     * 发送错误消息
     */
    public function _sendErrorMessage($errMsg, $code = 1, $returnurl = ''){
        if ($this->_request->isXmlHttpRequest()) {
            return $this->_ajaxMessage($code, $errMsg, $returnurl);
        } else {
            return $this->_errorMessage($errMsg, $returnurl);
        }
    }

    /**
     * 发送成功消息
     */
    public function _sendSuccessMessage($result, $returnurl = ''){
        if ($this->_request->isXmlHttpRequest()) {
            return $this->_ajaxMessage(0, '', $result, $returnurl);
        } else {
            return $this->_successMessage($result);
        }
    }

    /**
     * 错误提示页面
     */
    public function _errorMessage($errMsg){

        $this->_view->assign('errMsg', $errMsg);
        $this->_view->display('base/error' . $this->_viewExt);
        exit;  
    }

    protected function _successMessage($message = '', $extra = array(), $tpl = 'success') {
        $extra['title'] || $extra['title'] = '成功';

        $message || $message = '成功提交';

        $this->_view->assign('title', $extra['title']);
        $this->_view->assign('redirect', $extra['redirect']);
        $this->_view->assign('message', $message);
        $this->_view->assign('extra', $extra);

        $this->_view->display('base/success' . $this->_viewExt);

        exit;
    }
    
    /**
     * 输出模板并退出
     */
    public function _display($tpl){
        $tpl = strtolower($tpl);
        $config =  Yaf_Registry::get('application');
        echo $this->_view->render($tpl . "." . $config->get('application.view.ext'));
        exit;
    }

    public function _redirect($url){

        $this->redirect($url);
        exit; 
    
    }

    
}
