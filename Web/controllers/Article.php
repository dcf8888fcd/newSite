<?php
/**
 * ArticleController
 * 文章模块
 *
 * 创建时间：2014-12-09 13:45:29
 * 修改记录：
 *
 */
class ArticleController extends BaseController {

    private $_model = null;

    public function init() {
        parent::init();
        $this->_model = new ArticleModel(); 
    }

    /**
     * addAction
     * 角色权限分配
     *
     * @access public
     */
    public function addAction() {
        
        $articleEntity = new Entity_Article();
        $this->_view->assign('tags', $articleEntity->listTags());
        $this->_view->assign('modules', array(Entity_Article::MODULE_MULTIPLE => '综合', Entity_Article::MODULE_TREND => '业内动态', Entity_Article::MODULE_FAQ =>'FAQ'));
        // 表单提交
        if ($this->_request->isPost()) {

            // 获取数据
            $data = $this->_request->getPost();
            $data['waPic'] = $_FILES['waPic'];
            $user = $this->_getCurrentUser();
            $data['bmName'] = $user['bmName'];
            $data['waContent'] = htmlentities($data['waContent']);
            $preview = $data['preview'];
            //如果是预览
            if ($preview) {
                $this->_view->assign('article', $data);
                $this->_display('article/preview.phtml');
            }
            unset($data['preview']);

            try {
                $result = $this->_model->add($data); 
            } catch (Exception $e) {
                return $this->_errorMessage($e->getMessage());
            }

            if ($result) {
                return $this->_successMessage('创建成功', array('redirect' => $this->_urlPrefix . '/article/list'));
            } else {
            
                return $this->_errorMessage('创建失败！');
            }
        }        
        
        $this->_view->assign('recommends', array(Entity_Article::RECOMMEND_NO_NEED => '不需要推荐', Entity_Article::RECOMMEND_FIRST => '热门推荐1', Entity_Article::RECOMMEND_SECOND => '热门推荐2', Entity_Article::RECOMMEND_THIRD =>'热门推荐3'));

    }

    /**
     * listAction
     * 角色列表
     *
     * @access public
     */
    public function listAction() {
       
        $page = $this->_request->get('page', 1);
        $modules = array(Entity_Article::MODULE_MULTIPLE => '综合', Entity_Article::MODULE_TREND => '业内动态', Entity_Article::MODULE_FAQ =>'FAQ');
        $waTitle = $this->_request->get('waTitle');
        $conditions = array();
        if ($waTitle) {
            $conditions['waTitle'] = array('LIKE' => $waTitle . '%');
        }

        $pageOptions = array(
            'perPage' => 10,
            'curPageClass' => 'active',
            'fileName' => $this->_urlPrefix . substr($_SERVER['REQUEST_URI'], 0, strpos($_SERVER['REQUEST_URI'], '?')),
            'currentPage' => $page,
        );
        try {
            $list = $this->_model->listByConditions($conditions, $pageOptions, array('waUpdated' => 'DESC'), array('waid', 'waTitle', 'waModule', 'bmName', 'waUpdated')); 
        } catch (Exception $e) {
            return $this->_errorMessage($e->getMessage());
        }
 
        // 调用模板
        $this->_view->assign('list', $list);
        $this->_view->assign('waTitle', $waTitle);
        $this->_view->assign('modules', $modules);
        $this->_view->assign('page', Pager::makeLinks($pageOptions));
        $this->_view->assign('totalItems', $pageOptions['totalItems']);
    }

    /**
     * editAction
     * 修改角色权限分配
     *
     * @access public
     */
    public function editAction() {
        $waid = $this->_request->get('waid');
        
        // 表单提交
        if ($this->_request->isPost()) {

            // 获取数据
            $data = $this->_request->getPost();
            $newPic = false;
            if (!empty($_FILES['waPic']['name'])) {
                $data['waPic'] = $_FILES['waPic'];
                $newPic = true;
            } else {
                $newPic = false;
            }

            $user = $this->_getCurrentUser();
            $data['bmName'] = $user['bmName'];
            $data['waContent'] = htmlentities($data['waContent']);

            try {
                //更新数据
                $result = $this->_model->update($waid, $data, $newPic);
            } catch (Exception $e) {
                return $this->_errorMessage($e->getMessage()); 
            }
            
            return $this->_successMessage('修改成功', array('redirect' => $this->_urlPrefix . '/article/list'));
        }

        try {
            $article = $this->_model->get($waid);
        } catch (Exception $e) {
            $this->_errorMessage($e->getMessage()); 
        }

        $articleEntity = new Entity_Article();
        $this->_view->assign('tags', $articleEntity->listTags());
        $this->_view->assign('recommends', array(Entity_Article::RECOMMEND_NO_NEED => '不需要推荐', Entity_Article::RECOMMEND_FIRST => '热门推荐1', Entity_Article::RECOMMEND_SECOND => '热门推荐2', Entity_Article::RECOMMEND_THIRD =>'热门推荐3'));

        $this->_view->assign('modules', array(Entity_Article::MODULE_MULTIPLE => '综合', Entity_Article::MODULE_TREND => '业内动态', Entity_Article::MODULE_FAQ =>'FAQ'));
        $this->_view->assign('article', $article);
    }

    /**
     * 删除文章
     */
    public function removeAction(){
          
        $waid = $this->_request->get('waid');
    
        try {
            $this->_model->remove($waid);
        } catch (Exception $e) {
            $this->_errorMessage($e->getMessage()); 
        }

        return $this->_successMessage('删除成功', array('redirect' => $this->_urlPrefix . '/article/list'));
    }

    public function uploadImageAction(){
        $action = $this->_request->get('action');
        $callback = $this->_request->get('callback');

        switch($action){
            case 'config':
                $result = array(
                    "imageActionName" => "uploadimage",
                    "imageUrl"=> $this->_urlPrefix."/article/uploadImage",
                    "imageFieldName"=> "file",
                    "imageMaxSize"=> 2048000,
                    "imageUrlPrefix" => "",
                    "imageAllowFiles"=> array(".png", ".jpg", ".jpeg"),
                    "imageInsertAlign"=> "none",

                );
                break;
            case 'uploadimage':
                $path = $this->getUploadPath();
                $folder = $this->_uploadcontentfolder.$path;
                $allowedExtensions = array("jpg","jpeg","gif","png");
                $sizeLimit = 2000 * 1024;

                $uploader = new WL_FileUploader($allowedExtensions, $sizeLimit);
                $response = $uploader->handleUploadFTP($this->_ftpconfig, $folder);
                if($response['errcode']==1){
                    $result = array(
                        'state'=>$response['errmsg'],
                    );
                }else{
                    //处理图片路径，加上cdn的路径
                    $filename = $response['result']['url'];
                    $filesize = $response['result']['size'];
                    $result = array(
                        'state'=>'SUCCESS',
                        'url'=>$this->_imgcdn.$filename,
                        'title'=>$filename,
                        'original'=>$filename,
                        'type'=>strtolower(strrchr($filename, '.')),
                        'size'=>$filesize,
                    );
                }

                break;
            default:
                $result = array(
                    'state'=> '请求地址出错'
                );
                break;
        }

        if (isset($callback)) {
            if (preg_match("/^[\w_]+$/", $callback)) {
                echo htmlspecialchars($callback) . '(' . $result . ')';
            } else {
                echo json_encode(array(
                    'state'=> 'callback参数不合法'
                ));
            }
        } else {
            echo json_encode($result);
        }


        Yaf_Dispatcher::getInstance()->disableView();
    }

}

