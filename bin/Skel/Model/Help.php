<?php
/**
 * Skel_Model_Help
 *
 *     作者: 石瑞 (shirui@comsenz.com)
 * 创建时间: 2010-07-05 10:03:00
 * 修改记录:
 *
 * $Id: Help.php 2 2010-10-26 08:02:27Z zhouguoqiang $
 */

class Skel_Model_Help extends Skel_Model_Abstract {

    public function indexAction() {

        $skelPath = dirname(dirname(dirname(__FILE__))) . '/skel.sh';
/*
        $string =  <<<EOS

{title}Hello user, welcome to skel tool! It will make you more happy in coding process, enjoy it!{/title}
{title}=========================================================================================={/title}

{desc}Create an application:{/desc}
    ./skel.sh app create {variable}AppName{/variable}

{desc}Create a DAO:{/desc}
    ./skel.sh dao create {variable}TableName{/variable} --app={variable}AppName{/variable}

{desc}Create a Entity:{/desc}
    ./skel.sh entity create {variable}TableName{/variable} --app={variable}AppName{/variable}

{desc}Create a service:{/desc}
    ./skel.sh service create {variable}TableName{/variable} --app={variable}AppName{/variable}

{desc}Create a controller:{/desc}
    ./skel.sh controller create {variable}ControllerName{/variable} --app={variable}AppName{/variable} [--module={variable}moduleName{/variable}]
        - when you give a moduleName, the contoller and template file will be created in a sub directory named by {variable}moduleName{/variable}

{desc}Create an action:{/desc}
    ./skel.sh action create {variable}actionType{/variable} --table={variable}table{/variable} --controller={variable}controllerClassName{/variable}
        - actionType can be one or some of these types: add, view, list, remove, update

{desc}Create a backend task:{/desc}
    ./skel.sh backend_task create {variable}taskName{/variable} --app={variable}AppName{/variable}

{desc}Create a backend tool:{/desc}
    ./skel.sh backend_tool create {variable}toolName{/variable} --app={variable}AppName{/variable}

{desc}Create a backend cron:{/desc}
    ./skel.sh backend_cron create {variable}cronName{/variable} --app={variable}AppName{/variable}

{desc}Create a scaffolding, that will create a Entity, DAO, service, controller and some useful action methods by one command:{/desc}
    ./skel.sh scaffolding create --app={variable}AppName{/variable} --table={variable}table{/variable} [--module={variable}moduleName{/variable}]
        - when you give a moduleName, the contoller and template file will be created in a sub directory named by {variable}moduleName{/variable}

{desc}Create a config:{/desc}
    ./skel.sh config create [ttc|ttcphp] --app={variable}AppName{/variable} --table={variable}table{/variable}

{desc}Create a dao testcase:{/desc}
    ./skel.sh testcase_dao create [ttc|mysql] --app={variable}AppName{/variable} --table={variable}table{/variable}

{desc}Create a service testcase:{/desc}
    ./skel.sh testcase_service create --app={variable}AppName{/variable} --table={variable}table{/variable}

{desc}Display help:{/desc}
    ./skel.sh help [app|dao|service|controller|action|scaffolding|backend_task|backend_tool|backend_cron]

-------------------------------
{desc}Following command allows you call the skel tool easier by 'skel' regardless of anytime and anywhere:{/desc}
    alias skel="bash $skelPath"


EOS;
 */

     $string =  <<<EOS

{title}Hello user, welcome to skel tool! It will make you more happy in coding process, enjoy it!{/title}
{title}=========================================================================================={/title}

{desc}Create an application:{/desc}
    ./skel.sh app create {variable}AppName{/variable}

{desc}Create a DAO:{/desc}
    ./skel.sh dao create {variable}TableName{/variable} --app={variable}AppName{/variable}

{desc}Create a Entity:{/desc}
    ./skel.sh entity create {variable}TableName{/variable} --app={variable}AppName{/variable}

{desc}Display help:{/desc}
    ./skel.sh help [app|dao|entity]

-------------------------------
{desc}Following command allows you call the skel tool easier by 'skel' regardless of anytime and anywhere:{/desc}
    alias skel="bash $skelPath"


EOS;
        $this->_output($string);
    }

    public function appAction() {
        $string = <<<EOS

DESCRIPTION
-----------
{desc}create a new application:{/desc}
    ./skel.sh app create {variable}AppName{/variable}

{desc}list all applications:{/desc}
    ./skel.sh app show

EXAMPLES
--------
{desc}create application 'UCHome':{/desc}
    ./skel.sh app create UCHome


EOS;
        $this->_output($string);
    }

    public function daoAction() {
        $string = <<<EOS

DESCRIPTION
-----------
{desc}Create a DAO:{/desc}
    ./skel.sh dao create {variable}TableName{/variable} --app={variable}AppName{/variable}

EXAMPLES
--------
{desc}create DAO 'TestApp_DAO_User' for table 'app_users' in application TestApp:{/desc}
    ./skel.sh dao create testapp_users --app=TestApp

NOTE
----
1. The database table must exist in application's database when you creating a DAO.
2. When you get a database connection error, check your db config file of your application.


EOS;
        $this->_output($string);
    }

    public function serviceAction() {
        $string = <<<EOS

DESCRIPTION
-----------
{desc}Create a Service:{/desc}
    ./skel.sh service create {variable}TableName{/variable} --app={variable}AppName{/variable}

EXAMPLES
--------
{desc}create Service 'TestApp_Service_User' for table 'app_users' in application TestApp:{/desc}
    ./skel.sh service create testapp_users --app=TestApp

NOTE
----
1. The database table must exist in application's database when you creating a Service.
2. When you get a database connection error, check your db config file of your application.


EOS;
        $this->_output($string);
    }

    public function controllerAction() {

        $string = <<<EOS

DESCRIPTION
-----------
{desc}Create a Controller:{/desc}
    ./skel.sh controller create {variable}ControllerName{/variable} --app={variable}AppName{/variable} [--module={variable}moduleName{/variable}]
        - when you give a moduleName, the contoller and template file will be created in a sub directory named by {variable}moduleName{/variable}

EXAMPLES
--------
{desc}create controller 'TestApp_Controller_User':{/desc}
    ./skel.sh controller create User --app=TestApp

{desc}create controller 'TestApp_Controller_User_Info':{/desc}
    ./skel.sh controller create info --app=TestApp --module=user

NOTE
----
This command will create a template named 'index.tpl' for the 'index' action method by the way.


EOS;
        $this->_output($string);
    }

    public function actionAction() {

        $string = <<<EOS

DESCRIPTION
-----------
{desc}Create an Action Method:{/desc}
    ./skel.sh action create {variable}actionType{/variable} --table={variable}table{/variable} --controller={variable}controllerClassName{/variable}
        - {variable}actionType{/variable} can be one or some of these types: add, view, list, remove, update

EXAMPLES
--------
{desc}create 'listAction' in controller 'TestApp_Controller_Application':{/desc}
    ./skel.sh action create list --table=manyou_applications --controller=TestApp_Controller_Application

{desc}create 'addAction' in controller 'TestApp_Controller_Application':{/desc}
    ./skel.sh action create add --table=manyou_applications --controller=TestApp_Controller_Application

{desc}create 'addAction' add 'removeAction' in controller 'TestApp_Controller_User_Info':{/desc}
    ./skel.sh action create add,remove --table=manyou_applications --controller=TestApp_Controller_Application

NOTE
----
This command will create corresponding template file of 'action methods' by the way.


EOS;
        $this->_output($string);
    }

    public function scaffoldingAction() {

        $string = <<<EOS

DESCRIPTION
-----------
{desc}Create a scaffolding, that will create a Entity, DAO, service, controller and some useful action methods by one command:{/desc}
    ./skel.sh scaffolding create --app={variable}AppName{/variable} --table={variable}table{/variable} [--module={variable}moduleName{/variable}]
        - when you give a moduleName, the contoller and template file will be created in a sub directory named by {variable}moduleName{/variable}

EXAMPLES
--------
{desc}Create a Entity, DAO, service, controller and some useful action methods for table 'uchome_users' in TestApp:{/desc}
    ./skel.sh scaffolding create --app=TestApp --table=uchome_users


EOS;
        $this->_output($string);

    }

    public function configAction() {

        $string = <<<EOS

DESCRIPTION
-----------
{desc}Create config:{/desc}
    ./skel.sh config create [ttc|ttcphp] --app={variable}AppName{/variable} --table={variable}table{/variable}

EXAMPLES
--------
    ./skel.sh config create ttc --app=TestApp --table=uchome_users


EOS;
        $this->_output($string);

    }

    public function backendTaskAction() {

        $string = <<<EOS

DESCRIPTION
-----------
{desc}Create a backend task:{/desc}
    ./skel.sh backend_task create {variable}taskName{/variable} --app={variable}AppName{/variable}

EXAMPLES
--------
{desc}create backend task 'TestApp_Backend_Task_Poster':{/desc}
    ./skel.sh backend_task create Poster --app=TestApp


EOS;
        $this->_output($string);

    }

    public function backendToolAction() {

        $string = <<<EOS

DESCRIPTION
-----------
{desc}Create a backend tool:{/desc}
    ./skel.sh backend_tool create {variable}toolName{/variable} --app={variable}AppName{/variable}

EXAMPLES
--------
{desc}create backend tool 'TestApp_Backend_Tool_Poster':{/desc}
    ./skel.sh backend_tool create Poster --app=TestApp


EOS;
        $this->_output($string);

    }

    public function backendCronAction() {

        $string = <<<EOS

DESCRIPTION
-----------
{desc}Create a backend cron:{/desc}
    ./skel.sh backend_cron create {variable}cronName{variable} --app={variable}AppName{/variable}

EXAMPLES
--------
{desc}create backend cron 'TestApp_Backend_Cron_Poster':{/desc}
    ./skel.sh backend_cron create Poster --app=TestApp


EOS;
        $this->_output($string);


    }

}
