<?php echo "<?php" . PHP_EOL; ?>
/**
 * <?php echo $table->EntityClassName . PHP_EOL; ?>
 *
 *     作者: <?php echo $this->getConfig('author.name'); ?> (<?php echo $this->getConfig('author.email'); ?>)
 * 创建时间: <?php echo date('Y-m-d H:i:s') . PHP_EOL; ?>
 * 修改记录:
 *
 * $Id$
 */

class <?= $table->EntityClassName; ?> extends WL_Entity {
    <?php foreach ($table->tableInfo as $f) {?>
    
    /**
     * <?= $f['Comment']?>  
     * <?= $f['Type']?>  
     */
    public $<?= $f['Field'] ?>;
    <?php } ?>
   
}
