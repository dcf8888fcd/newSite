<?php

$conf['regex'][] = array(
    'match'=>"#^/test/([^/]+)#",
    'route'=>array(  'module'=>"index",
                    'controller' => "index",
                    'action' => "index"
            ),
    'map'=>array(1=>'param1'),
    );
