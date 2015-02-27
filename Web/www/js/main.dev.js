(function () {

  "use strict";

  var requireOptions = {
        urlArgs: "bust=" + (new Date()).getTime(),
        paths: {
          // Plugins
          checkbox: "plugins/checkbox",
          radio: "plugins/radio",
          timeinputer: "plugins/timeinputer",
          placeholder: "plugins/placeholder",
          submitter: "plugins/submitter",
          msg: "plugins/msg",
          validate: "plugins/validate",

          // Libraries
          // jquery: "jquery.min",
          // underscore: "underscore.min",
          // bootstrap: "bootstrap.min",
          // ZeroClipboard: "ZeroClipboard.min",
          datepicker: "bootstrap-datepicker.min",
          ueditorConfig: "../ueditor/ueditor.config",
          ueditor: "../ueditor/ueditor.all.min"
        }
      };

  requireOptions.paths["echarts/chart/line"] = "echarts";
  requireOptions.paths["echarts/chart/bar"] = "echarts";
  requireOptions.paths["echarts/chart/pie"] = "echarts";
  require.config(requireOptions);

  require([
    "jquery",
    "underscore"
  ], function ($) {
    require([
      "welife",
      "bootstrap",
      "checkbox",
      "radio",
      "timeinputer",
      "placeholder",
      "submitter",
      "msg",
      "validate"
    ], function (WeLife) {
      $(function () {
        var $main = $(".main");

        $main.data("welife", new WeLife($main[0], $main.data("module")));
      });
    });
  });

})();
