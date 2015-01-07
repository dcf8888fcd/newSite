<?php
/**
 * Skel_Inflector
 * 转换类
 *
 *     作者: 石瑞 (shirui@comsenz.com)
 * 创建时间: 2010-07-05 10:03:00
 * 修改记录:
 *
 * <code>
 *     echo Skel_Inflector::singularize('boxes');
 *     echo Skel_Inflector::pluralize('box');
 * </code>
 *
 * $Id: Inflector.php 2 2010-10-26 08:02:27Z zhouguoqiang $
 */

class Skel_Inflector {

    /**
     * _plural
     * 复数规则
     *
     * @var array
     * @access protected
     */
    protected $_plural = array(
        'rules' => array(
            '/(s)tatus$/i' => '\1\2tatuses',
            '/(quiz)$/i' => '\1zes',
            '/^(ox)$/i' => '\1\2en',
            '/([m|l])ouse$/i' => '\1ice',
            '/(matr|vert|ind)(ix|ex)$/i'  => '\1ices',
            '/(x|ch|ss|sh)$/i' => '\1es',
            '/([^aeiouy]|qu)y$/i' => '\1ies',
            '/(hive)$/i' => '\1s',
            '/(?:([^f])fe|([lr])f)$/i' => '\1\2ves',
            '/sis$/i' => 'ses',
            '/([ti])um$/i' => '\1a',
            '/(p)erson$/i' => '\1eople',
            '/(m)an$/i' => '\1en',
            '/(c)hild$/i' => '\1hildren',
            '/(buffal|tomat)o$/i' => '\1\2oes',
            '/(alumn|bacill|cact|foc|fung|nucle|radi|stimul|syllab|termin|vir)us$/i' => '\1i',
            '/us$/' => 'uses',
            '/(alias)$/i' => '\1es',
            '/(ax|cris|test)is$/i' => '\1es',
            '/s$/' => 's',
            '/^$/' => '',
            '/$/' => 's',
        ),
        'uninflected' => array(
            '.*[nrlm]ese', '.*deer', '.*fish', '.*measles', '.*ois', '.*pox', '.*sheep', 'people'
        ),
        'irregular' => array(
            'atlas' => 'atlases',
            'beef' => 'beefs',
            'brother' => 'brothers',
            'child' => 'children',
            'corpus' => 'corpuses',
            'cow' => 'cows',
            'ganglion' => 'ganglions',
            'genie' => 'genies',
            'genus' => 'genera',
            'graffito' => 'graffiti',
            'hoof' => 'hoofs',
            'loaf' => 'loaves',
            'man' => 'men',
            'money' => 'monies',
            'mongoose' => 'mongooses',
            'move' => 'moves',
            'mythos' => 'mythoi',
            'niche' => 'niches',
            'numen' => 'numina',
            'occiput' => 'occiputs',
            'octopus' => 'octopuses',
            'opus' => 'opuses',
            'ox' => 'oxen',
            'penis' => 'penises',
            'person' => 'people',
            'sex' => 'sexes',
            'soliloquy' => 'soliloquies',
            'testis' => 'testes',
            'trilby' => 'trilbys',
            'turf' => 'turfs'
        )
    );

    /**
     * Singular inflector rules
     * 单数规则
     *
     * @var array
     * @access protected
     */
    protected $_singular = array(
        'rules' => array(
            '/(s)tatuses$/i' => '\1\2tatus',
            '/^(.*)(menu)s$/i' => '\1\2',
            '/(quiz)zes$/i' => '\\1',
            '/(matr)ices$/i' => '\1ix',
            '/(vert|ind)ices$/i' => '\1ex',
            '/^(ox)en/i' => '\1',
            '/(alias)(es)*$/i' => '\1',
            '/(alumn|bacill|cact|foc|fung|nucle|radi|stimul|syllab|termin|viri?)i$/i' => '\1us',
            '/([ftw]ax)es/i' => '\1',
            '/(cris|ax|test)es$/i' => '\1is',
            '/(shoe|slave)s$/i' => '\1',
            '/(o)es$/i' => '\1',
            '/ouses$/' => 'ouse',
            '/([^a])uses$/' => '\1us',
            '/([m|l])ice$/i' => '\1ouse',
            '/(x|ch|ss|sh)es$/i' => '\1',
            '/(m)ovies$/i' => '\1\2ovie',
            '/(s)eries$/i' => '\1\2eries',
            '/([^aeiouy]|qu)ies$/i' => '\1y',
            '/([lr])ves$/i' => '\1f',
            '/(tive)s$/i' => '\1',
            '/(hive)s$/i' => '\1',
            '/(drive)s$/i' => '\1',
            '/([^fo])ves$/i' => '\1fe',
            '/(^analy)ses$/i' => '\1sis',
            '/(analy|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i' => '\1\2sis',
            '/([ti])a$/i' => '\1um',
            '/(p)eople$/i' => '\1\2erson',
            '/(m)en$/i' => '\1an',
            '/(c)hildren$/i' => '\1\2hild',
            '/(n)ews$/i' => '\1\2ews',
            '/eaus$/' => 'eau',
            '/^(.*us)$/' => '\\1',
            '/s$/i' => ''
        ),
        'uninflected' => array(
            '.*[nrlm]ese', '.*deer', '.*fish', '.*measles', '.*ois', '.*pox', '.*sheep', '.*ss'
        ),
        'irregular' => array(
            'waves' => 'wave'
        )
    );

    /**
     * 单复数一样的单词
     *
     * @var array
     * @access protected
     */
    protected $_uninflected = array(
        'Amoyese', 'bison', 'Borghese', 'bream', 'breeches', 'britches', 'buffalo', 'cantus',
        'carp', 'chassis', 'clippers', 'cod', 'coitus', 'Congoese', 'contretemps', 'corps',
        'debris', 'diabetes', 'djinn', 'eland', 'elk', 'equipment', 'Faroese', 'flounder',
        'Foochowese', 'gallows', 'Genevese', 'Genoese', 'Gilbertese', 'graffiti',
        'headquarters', 'herpes', 'hijinks', 'Hottentotese', 'information', 'innings',
        'jackanapes', 'Kiplingese', 'Kongoese', 'Lucchese', 'mackerel', 'Maltese', 'media',
        'mews', 'moose', 'mumps', 'Nankingese', 'news', 'nexus', 'Niasese',
        'Pekingese', 'Piedmontese', 'pincers', 'Pistoiese', 'pliers', 'Portuguese',
        'proceedings', 'rabies', 'rice', 'rhinoceros', 'salmon', 'Sarawakese', 'scissors',
        'sea[- ]bass', 'series', 'Shavese', 'shears', 'siemens', 'species', 'swine', 'testes',
        'trousers', 'trout','tuna', 'Vermontese', 'Wenchowese', 'whiting', 'wildebeest',
        'Yengeese'
    );

    /**
     * 复数cache
     *
     * @var array
     * @access protected
     */
    protected $_pluralized = array();

    /**
     * 单数Cache
     *
     * @var array
     * @access protected
     */
    protected $_singularized = array();

    /**
     * 实例
     *
     * @var Inflection
     */
    protected static $_instance;

    /**
     * 获取一个实例
     *
     * @return object
     * @access public
     */
    public static function &getInstance() {

        if (!(self::$_instance instanceof self)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * __construct
     *
     * @return void
     */
    private function __construct() {

        return ;
    }

    /**
     * 缓存结果
     *
     * @param string $type Inflection type
     * @param string $key Original value
     * @param string $value Inflected value
     * @return string Inflected value, from cache
     * @access protected
     */
    protected function _cache($type, $key, $value = false) {

        $key = '_' . $key;
        $type = '_' . $type;
        if ($value !== false) {
            $this->{$type}[$key] = $value;
            return $value;
        }

        if (!isset($this->{$type}[$key])) {
            return false;
        }
        return $this->{$type}[$key];
    }

    /**
     * 添加自定义的转换规则，需要指定转换方向(type)
     *
     * ### 例如:
     *
     * {{{
     * Skel_Inflector::rules('plural', array('/^(inflect)or$/i' => '\1ables'));
     * Skel_Inflector::rules('plural', array(
     *     'rules' => array('/^(inflect)ors$/i' => '\1ables'),
     *     'uninflected' => array('dontinflectme'),
     *     'irregular' => array('red' => 'redlings')
     * ));
     * }}}
     *
     * @param string $type 类型 'plural' 或 'singular'
     * @param array $rules 规则
     * @param boolean $reset 是否覆盖默认规则
     * @access public
     * @return void
     * @static
     */
    public static function rules($type, $rules, $reset = false) {

        $_this =& self::getInstance();
        $var = '_'.$type;

        foreach ($rules as $rule => $pattern) {
            if (is_array($pattern)) {
                if ($reset) {
                    $_this->{$var}[$rule] = $pattern;
                } else {
                    $_this->{$var}[$rule] = array_merge($pattern, $_this->{$var}[$rule]);
                }
                unset($rules[$rule], $_this->{$var}['cache' . ucfirst($rule)]);
                if (isset($_this->{$var}['merged'][$rule])) {
                    unset($_this->{$var}['merged'][$rule]);
                }
                if ($type === 'plural') {
                    $_this->_pluralized = array();
                } elseif ($type === 'singular') {
                    $_this->_singularized = array();
                }
            }
        }
        $_this->{$var}['rules'] = array_merge($rules, $_this->{$var}['rules']);
    }

    /**
     * 单数转换复数
     *
     * @param string $word 单数形式的单词
     * @return string
     * @access public
     * @static
     */
    public static function pluralize($word) {

        $_this =& self::getInstance();

        if (isset($_this->_pluralized[$word])) {
            return $_this->_pluralized[$word];
        }

        if (!isset($_this->_plural['merged']['irregular'])) {
            $_this->_plural['merged']['irregular'] = $_this->_plural['irregular'];
        }

        if (!isset($_this->plural['merged']['uninflected'])) {
            $_this->_plural['merged']['uninflected'] = array_merge($_this->_plural['uninflected'], $_this->_uninflected);
        }

        if (!isset($_this->_plural['cacheUninflected']) || !isset($_this->_plural['cacheIrregular'])) {
            $_this->_plural['cacheUninflected'] = '(?:' . implode('|', $_this->_plural['merged']['uninflected']) . ')';
            $_this->_plural['cacheIrregular'] = '(?:' . implode('|', array_keys($_this->_plural['merged']['irregular'])) . ')';
        }

        if (preg_match('/(.*)\\b(' . $_this->_plural['cacheIrregular'] . ')$/i', $word, $regs)) {
            $_this->_pluralized[$word] = $regs[1] . substr($word, 0, 1) . substr($_this->_plural['merged']['irregular'][strtolower($regs[2])], 1);
            return $_this->_pluralized[$word];
        }

        if (preg_match('/^(' . $_this->_plural['cacheUninflected'] . ')$/i', $word, $regs)) {
            $_this->_pluralized[$word] = $word;
            return $word;
        }

        foreach ($_this->_plural['rules'] as $rule => $replacement) {
            if (preg_match($rule, $word)) {
                $_this->_pluralized[$word] = preg_replace($rule, $replacement, $word);
                return $_this->_pluralized[$word];
            }
        }
    }

    /**
     * 复数转单数
     *
     * @param string $word 单词的复数形式
     * @return string 
     * @access public
     * @static
     */
    public static function singularize($word) {

        $_this =& self::getInstance();

        if (isset($_this->_singularized[$word])) {
            return $_this->_singularized[$word];
        }

        if (!isset($_this->_singular['merged']['uninflected'])) {
            $_this->_singular['merged']['uninflected'] = array_merge($_this->_singular['uninflected'], $_this->_uninflected);
        }

        if (!isset($_this->_singular['merged']['irregular'])) {
            $_this->_singular['merged']['irregular'] = array_merge($_this->_singular['irregular'], array_flip($_this->_plural['irregular']));
        }

        if (!isset($_this->_singular['cacheUninflected']) || !isset($_this->_singular['cacheIrregular'])) {
            $_this->_singular['cacheUninflected'] = '(?:' . join( '|', $_this->_singular['merged']['uninflected']) . ')';
            $_this->_singular['cacheIrregular'] = '(?:' . join( '|', array_keys($_this->_singular['merged']['irregular'])) . ')';
        }

        if (preg_match('/(.*)\\b(' . $_this->_singular['cacheIrregular'] . ')$/i', $word, $regs)) {
            $_this->_singularized[$word] = $regs[1] . substr($word, 0, 1) . substr($_this->_singular['merged']['irregular'][strtolower($regs[2])], 1);
            return $_this->_singularized[$word];
        }

        if (preg_match('/^(' . $_this->_singular['cacheUninflected'] . ')$/i', $word, $regs)) {
            $_this->_singularized[$word] = $word;
            return $word;
        }

        foreach ($_this->_singular['rules'] as $rule => $replacement) {
            if (preg_match($rule, $word)) {
                $_this->_singularized[$word] = preg_replace($rule, $replacement, $word);
                return $_this->_singularized[$word];
            }
        }
        $_this->_singularized[$word] = $word;
        return $word;
    }

    /**
     * camelize
     * 字段名转为骆驼形式
     *
     * @param  string $name
     * @return string
     */
    public static function camelize($name) {

        $nameArr = explode('_', $name);
        $prefix  = $nameArr[0];
        $nameArr = array_map('ucwords', $nameArr);
        $nameArr[0] = $prefix;
        return join('', $nameArr);
    }

    /**
     * underscore
     * 骆驼法的反转换
     *
     * @param  string $name
     * @return string
     */
    public static function underscore($name) {

        $firstLetter = strtolower($name{0});
        $name = $firstLetter . substr($name, 1);

        $nKey = preg_replace('/([A-Z])([a-z]+)/', '_\1\2', $name);
        $nKey = strtolower($nKey);

        return $nKey;
    }

}
