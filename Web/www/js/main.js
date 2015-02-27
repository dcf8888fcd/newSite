(function (window, $) {

  "use strict";

  // 配置模块
  // ---------------------------------------------------------------------------

  var baseURL = (function () {
        var scripts = document.getElementsByTagName("script"),
            length = scripts.length,
            src,
            i;

        for (i = 0; i < length; i++) {
          src = scripts[i].src;

          if (src.indexOf("require.js") !== -1) {
            src = src.replace(/\/js\/require\.js.*$/, "");
            break;
          }
        }

        return src;
      })(),
      requireOptions = {
        baseUrl: baseURL,
        paths: {
          ZeroClipboard: "./js/ZeroClipboard.min",
          echarts: "./js/echarts"
        }
      };

  requireOptions.paths["echarts/chart/line"] = "./js/echarts";
  requireOptions.paths["echarts/chart/bar"] = "./js/echarts";
  requireOptions.paths["echarts/chart/pie"] = "./js/echarts";
  require.config(requireOptions);

  //
  // ---------------------------------------------------------------------------
  var we = {},
      options =  window._pageConfig;

  we.DEFAULTS = {
    name: "we",
    version: "0.0.1"
  };

  we.MESSAGES = {
    loading: "正在加载……",
    keyword: "请添加关键词",
    content: "内容不能为空",
    error: {
      loading: "加载失败"
    }
  };

  options && $.extend(we.DEFAULTS, options);

  we.base = function () {
    var _this = this,
        parts = this.moduleParts,
        level1 = parts.length > 0 ? parts[0] : false,
        level2 = parts.length > 1 ? parts.slice(0, 2).join(".") : false,
        level3 = parts.length > 2 ? parts.slice(0, 3).join(".") : false;

    if (level1) {

      // 模块映射
      switch (level1) {
        case "activity":
        case "coupon":
          level1 = "market";
          break;

        case "material":
          level1 = "message";
          break;
      }

      // 2级模块映射
      switch (level2) {
        case "message.manage":
          level2 = "message.home";
          break;
      }

      // 3级模块映射
      switch (level3) {
        case "message.sms.manage":
          level2 = "message.sms";
          break;

        case "message.sms.record":
        case "message.sms.balance":
        case "message.sms.invoice":
          level3 = "message.sms.recharge";
          break;
      }

      // Toggle menubar
      _this.$main.find(".sidebar > .nav > li").each(function () {
        var $this = $(this),
            module = $this.data("module"),
            active = false,
            $active;

        if (level3) {
          $active = $this.find("[data-module='" + level3 + "']");

          if ($active.length) {
            active = true;
            $this.addClass("open").find(".collapse").addClass("in");
            $active.addClass("active");
          }
        }

        if (!active && level2) {
          $active = $this.find("[data-module='" + level2 + "']");

          if ($active.length) {
            active = true;
            $this.addClass("open").find(".collapse").addClass("in");
            $active.addClass("active");
          }
        }

        if (!active && level1 === module) {
          $this.addClass("active");
        }

        $this.click(function () {
          $this.toggleClass("open");
        });
      });
    }

    // 开发环境不缓存
    if (window.location.host === "localhost") {
      console.log("No cache!");
      $.ajaxSetup({
        cache: false
      });
    }

    // Submitter Setup
    $.fn.submitter.setDefaults({
      ajaxOptions: {
        type: "post",
        cache: false,
        dataType: "json"
      },
      messages: {
        start: "提交开始",
        done: "提交成功",
        fail: "提交失败",
        end: "提交结束"
      },

      start: function () {
      },

      done: function () {
      },

      fail: function () {
        console.log(arguments);
        we.msg("网络连接超时或服务器没有响应，请稍候再试", 5);
      },

      end: function () {
      }
    });

    // 提示消息
    we.$body.message({
      toggle: false
    });

    we.msg = function (message, state, duration) {
      if (message === "hide") {
        we.$body.message("hide", state, duration);
      } else if (typeof message === "string" && message !== "") {
        we.$body.message("show", message, state, duration);
      }
    };

    // 翻页组件提交控制
    (function () {
      var $form = we.$main.find(".we-pagination-group form"),
          $page = $form.find("input[name='page']"),
          isPageNumber = function () {
            var page = parseInt($page.val(), 10) || 0,
                valid = false;

            if (page > 0) {
              valid = true;
            } else {
              page = "";
            }

            $page.val(page);
            return valid;
          };

      $page.on("change keyup", isPageNumber);

      $form.submit(function (e) {
        if (!isPageNumber()) {
           e.preventDefault();
          return false;
        }
      });

    })();
  };

  we.init = function () {
    var module,
        fn;

    this.$body = $("body");
    this.$main = this.$body.find(".main");
    module = this.$main.data("module");

    if (module) {
      module = module.replace("new", "_new_"); // "new" is a reserved word.
    }

    this.module = module;
    this.moduleParts = module ? module.split(".") : [];
    this.base();
    console.log("Current Module: " + this.module);

    // Active Current Page
    if (this.module) {
      fn = this;

      $.each(this.moduleParts, function (i, n) {
        fn = typeof fn[n] !== "undefined" ? fn[n] : {};
      });

      if ($.isFunction(fn)) {
        console.log(this.module + " is running...");
        fn();
      }
    }
  };

  window.WeLife = we;

  $(function () {
    // 导入模块/插件
    require([
      "checkbox",
      "radio",
      "timeinputer",
      "placeholder",
      "submitter",
      "message",
      "validate"
    ], function () {
      we.init();
    });
  });

})(window, jQuery);

(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as anonymous module.
    define("checkbox", ["jquery"], factory);
  } else {
    // Browser globals.
    factory(jQuery);
  }
})(function ($) {

  "use strict";

  var Checkbox = function (element, options) {
        this.$element = $(element);
        this.defaults = $.extend({}, Checkbox.defaults, $.isPlainObject(options) ? options : {});
        this.$checkbox = this.$element.find(":checkbox");

        if (this.defaults.toggle) {
          this.toggle();
        }
      };

  Checkbox.defaults = {
    toggle: true
  };

  Checkbox.prototype = {
    constructor: Checkbox,

    check: function () {
      var $this = this.$element,
          checkEvent;

      if ($this.hasClass("disabled") || $this.hasClass("readonly") || $this.hasClass("checked")) {
        return;
      }

      checkEvent = $.Event("check.we.checkbox");
      $this.trigger(checkEvent);

      if (checkEvent.isDefaultPrevented()) {
        return;
      }

      $this.addClass("checked");
      this.$checkbox.prop("checked", true);
      $this.trigger("checked.we.checkbox");
    },

    uncheck: function () {
      var $this = this.$element,
          uncheckEvent;

      if ($this.hasClass("disabled") || $this.hasClass("readonly") || !$this.hasClass("checked")) {
        return;
      }

      uncheckEvent = $.Event("uncheck.we.checkbox");
      $this.trigger(uncheckEvent);

      if (uncheckEvent.isDefaultPrevented()) {
        return;
      }

      $this.removeClass("checked");
      this.$checkbox.prop("checked", false);
      $this.trigger("unchecked.we.checkbox");
    },

    toggle: function () {
      this.$element.hasClass("checked") ? this.uncheck() : this.check();
    },

    enable: function () {
      this.$element.removeClass("disabled");
      this.$checkbox.prop("disabled", false);
    },

    disable: function () {
      this.$element.addClass("disabled");
      this.$checkbox.prop("disabled", true);
    }
  };

  $.fn.checkbox = function (options) {
    return this.each(function () {
      var $this = $(this),
          data = $this.data("we.checkbox");

      if (!data) {
        $this.data("we.checkbox", (data = new Checkbox(this, options)));
      }

      if (typeof options === "string" && $.isFunction(data[options])) {
        data[options]();
      }
    });
  };

  $.fn.checkbox.constructor = Checkbox;

  $(document).on("click.we.checkbox", "[data-toggle='checkbox']", function (e) {
    var $this = $(this),
        options = $this.data();

    if (e.target.type !== "checkbox") {
      e.preventDefault();
    }

    options = $this.data("we.checkbox") ? "toggle" : options;
    $this.checkbox(options);
  });

});

(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as anonymous module.
    define("message", ["jquery"], factory);
  } else {
    // Browser globals.
    factory(jQuery);
  }
})(function ($) {

  "use strict";

  var Message = function (element, options) {
        this.$element = $(element);
        this.defaults = $.extend({}, Message.defaults, $.isPlainObject(options) ? options : {});
        this.$message = $(Message.template);
        this.$message.appendTo("body");

        if (this.defaults.toggle) {
          this.toggle();
        }
      };

  Message.defaults = {
    toggle: true,
    message: "",
    duration: 2000,
    state: "default"
  };

  Message.states = ["default", "primary", "success", "info", "warning", "danger"];

  Message.template = '<div class="we-message fade"><span class="message"></span></div>';

  Message.prototype = {
    constructor: Message,

    show: function (message, state, duration, noTransition) {
      var $this = this.$message,
          defaults = this.defaults,
          showEvent;

      if (this.transitioning || $this.hasClass("in")) {
        return;
      }

      showEvent = $.Event("show.we.message");
      this.$element.trigger(showEvent);

      if (showEvent.isDefaultPrevented()) {
        return;
      }

      if ($.inArray(state, Message.states) === -1) {
        state = parseInt(state, 10) || 0;
        state = state > 0 && state < 6 ? Message.states[state] : defaults.state;
      }

      if (duration) {
        this.duration = duration;
      }

      $this.show().get(0).offsetHeight;
      $this.find(".message").attr("class", "message " + state).text(message);
      this.transitioning = true;

      if (!$.support.transition || noTransition) {
        this.shown();
        return;
      }

      $this.one($.support.transition.end, $.proxy(this.shown, this)).emulateTransitionEnd(150).addClass("in");
    },

    shown: function () {
      this.transitioning = false;
      this.$element.trigger("shown.we.message");

      setTimeout($.proxy(this.hide, this), this.duration || this.defaults.duration || 2000);
    },

    hide: function (noTransition) {
      var $this = this.$message,
          hideEvent;

      if (this.transitioning && !$this.hasClass("in")) {
        return;
      }

      hideEvent = $.Event("hide.we.message");
      this.$element.trigger(hideEvent);

      if (hideEvent.isDefaultPrevented()) {
        return;
      }

      $this.removeClass("in");
      this.transitioning = true;

      if (!$.support.transition || noTransition) {
        this.hidden();
        return;
      }

      $this.one($.support.transition.end, $.proxy(this.hidden, this)).emulateTransitionEnd(150);
    },

    hidden: function () {
      this.transitioning = false;
      this.$message.hide();
      this.$element.trigger("hidden.we.message");
    },

    toggle: function () {
      this.$message.hasClass("in") ? this.hide() : this.show();
    }
  };

  $.fn.message = function (options) {
    var args = [].slice.call(arguments, 1);

    return this.each(function () {
      var $this = $(this),
          data = $this.data("we.message");

      if (!data) {
        $this.data("we.message", (data = new Message(this, options)));
      }

      if (typeof options === "string" && $.isFunction(data[options])) {
        data[options].apply(data, args);
      }
    });
  };

  $.fn.message.constructor = Message;

});

(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as anonymous module.
    define("placeholder", ["jquery"], factory);
  } else {
    // Browser globals.
    factory(jQuery);
  }
})(function ($) {

  "use strict";

  var Placeholder = function (element) {
      this.$element = $(element);
      this.placeholder = this.$element.attr("placeholder");
      this.contenteditable = this.$element.prop("contenteditable") === "true" ? true : false;
      this.init();
    };

  Placeholder.prototype = {
    constructor: Placeholder,

    support: {
      placeholder: typeof $("<input type=\"text\">").prop("placeholder") !== "undefined"
    },

    init: function () {
      if ((!this.support.placeholder || this.contenteditable) && this.placeholder) {
        this.addListener();
        this.$element.trigger("blur");
      }
    },

    addListener: function () {
      this.$element.on({
        focus: $.proxy(this.focus, this),
        blur: $.proxy(this.blur, this)
      });
    },

    removeListener: function () {
      this.$element.off({
        focus: this.focus,
        blur: this.blur
      });
    },

    show: function () {
      var $this = this.$element,
          placeholder = this.placeholder;

      this.$element.addClass("placeholder");

      if (this.contenteditable) {
        $this.text(placeholder);
      } else {
        $this.val(placeholder);
      }
    },

    hide: function () {
      var $this = this.$element;

      this.$element.removeClass("placeholder");

      if (this.contenteditable) {
        $this.text("");
      } else {
        $this.val("");
      }
    },

    focus: function () {
      var $this = this.$element,
          val = this.contenteditable ? $this.text() : $this.val();

      if (val === this.placeholder) {
        this.hide();
      }
    },

    blur: function () {
      var $this = this.$element,
          val = this.contenteditable ? $this.text() : $this.val();

      if (val === "") {
        this.show();
      }
    },

    destory: function () {
      this.removeListener();
      this.$element.data("placeholder", null);
    }
  };

  $.fn.placeholder = function (options) {
    return this.each(function () {
      var $this = $(this),
        data = $this.data("placeholder");

      if (!data) {
        $this.data("placeholder", (data = new Placeholder(this, options)));
      }

      if (typeof options === "string" && $.isFunction(data[options])) {
        data[options]();
      }
    });
  };

  $.fn.placeholder.constructor = Placeholder;

  $(function () {
    $("input[placeholder], textarea[placeholder], [contenteditable][placeholder]").placeholder();
  });
});

(function (window, $, we) {

  "use strict";

  // 弹出提示框
  we.popoverNotice = function ($scope, destroy) {
    var $toggle = $scope ? $scope.find(".we-notice-toggle") : $(".we-notice-toggle");

    if (destroy) {
      $toggle.popover("destroy");
      return;
    }

    $toggle.each(function () {
      var $this = $(this);

      $this.popover({
        trigger: "hover",
        content: $this.find(".notice-template").text(),
        html: true,
        template: '<div class="popover we-popover-notice" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
      });
    });
  };

  // 弹出确认框
  we.popoverConfirm = function (options, destroy) {
    var defaults = $.isPlainObject(options) ? options : {},
        getTemplate = function () {
          return '<div class="popover we-popover-confirm" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>';
        },
        getContent = function (message) {
          var content = (
                '<div class="popover-message">' + message + '</div>' +
                '<div class="popover-buttons">' +
                  '<button class="btn we-btn-sm" type="button" data-toggle="popover.confirm.submit">确认</button>' +
                  '<button class="btn we-btn-sm" type="button" data-toggle="popover.confirm.cancel">取消</button>' +
                '</div>'
              );

          return content;
        },
        popoverOptions = {
          trigger: "click",
          content: getContent(defaults.message),
          html: true,
          placement: "bottom",
          template: getTemplate()
        },
        eventName = "click.bs.popover.confirm" + (defaults.namespace || ""),
        selector = "[data-toggle='popover.confirm" + (defaults.namespace || "") + "']";

    if (options === "destroy" || destroy) {
      $(document).off(eventName);
      return;
    }

    $(document).on(eventName, selector, function (e) {
      var $this = $(this),
          data,
          newOptions,
          newPopoverOptions;

      e.preventDefault();

      if ($this.hasClass("disabled")) {
        return;
      }

      if ($this.data("bs.popover")) {
        $this.popover();
      } else {
        data = $this.data();

        // 复制，确保每一个实例互不影响
        newOptions = $.extend({}, options); // 复制
        newPopoverOptions = $.extend({}, popoverOptions);

        if (data.message) {
          newPopoverOptions.content = getContent(data.message);
        }

        $this.popover(newPopoverOptions).popover("show");

        $this.on("hidden.bs.popover", function () {
          $this.data("bs.popover").$tip.off("click.popover.confirm").off("click.popover.cancel");
        }).on("shown.bs.popover", function () {
          $this.data("bs.popover").$tip.on("click.popover.confirm", "[data-toggle='popover.confirm.submit']", function () {
            if ($.isFunction(newOptions.confirm)) {
              $this.one("hidden.bs.popover", function () {
                newOptions.confirm.call(this);
              });
            }

            $this.popover("hide");
          }).on("click.popover.cancel", "[data-toggle='popover.confirm.cancel']", function () {
            if ($.isFunction(newOptions.cancel)) {
              $this.one("hidden.bs.popover", function () {
                newOptions.cancel.call(this);
              });
            }

            $this.popover("hide");
          });
        });
      }
    });
  };

})(window, jQuery, WeLife);

(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as anonymous module.
    define("radio", ["jquery"], factory);
  } else {
    // Browser globals.
    factory(jQuery);
  }
})(function ($) {

  "use strict";

  var $body = $("body"),
      Radio = function (element) {
        this.$element = $(element);
        this.$radio = this.$element.find(":radio");
      };

  Radio.prototype = {
    constructor: Radio,

    check: function (triggerEvent) {
      var $this = this.$element,
          checkEvent;

      if ($this.hasClass("disabled") || $this.hasClass("readonly") || $this.hasClass("checked")) {
        return;
      }

      checkEvent = $.Event("check.we.radio");
      $this.trigger(checkEvent);

      if (checkEvent.isDefaultPrevented()) {
        return;
      }

      $body.find("[data-name='" + $this.attr("data-name") + "']").radio("uncheck");

      $this.addClass("checked");
      this.$radio.prop("checked", true);

      if (triggerEvent !== false) {
        $this.trigger("checked.we.radio");
      }
    },

    uncheck: function (triggerEvent) {
      var $this = this.$element,
          uncheckEvent;

      if ($this.hasClass("disabled") || $this.hasClass("readonly") || !$this.hasClass("checked")) {
        return;
      }

      uncheckEvent = $.Event("uncheck.we.radio");
      $this.trigger(uncheckEvent);

      if (uncheckEvent.isDefaultPrevented()) {
        return;
      }

      $this.removeClass("checked");
      this.$radio.prop("checked", false);

      if (triggerEvent !== false) {
        $this.trigger("unchecked.we.radio");
      }
    },

    enable: function () {
      this.$element.removeClass("disabled");
      this.$radio.prop("disabled", false);
    },

    disable: function () {
      this.$element.addClass("disabled");
      this.$radio.prop("disabled", true);
    }
  };

  $.fn.radio = function (options) {
    return this.each(function () {
      var $this = $(this),
          data = $this.data("we.radio");

      if (!data) {
        $this.data("we.radio", (data = new Radio(this)));
      }

      if (typeof options === "string" && $.isFunction(data[options])) {
        data[options]();
      }
    });
  };

  $.fn.radio.constructor = Radio;

  $(document).on("click.we.radio", "[data-toggle='radio']", function (e) {
    if (e.target.type !== "radio") {
      e.preventDefault();
    }

    $(this).radio("check");
  });

});

(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as anonymous module.
    define("submitter", ["jquery"], factory);
  } else {
    // Browser globals.
    factory(jQuery);
  }
})(function ($) {

  "use strict";

  var Submitter = function (form, options) {
        options = $.isPlainObject(options) ? options : {};
        this.$form = $(form);
        this.defaults = $.extend(true, {}, Submitter.defaults, options);
        this.init();
      };

  Submitter.prototype = {
    constructor: Submitter,

    support: {
      formData: !!window.FormData
    },

    init: function () {
      var $this = this.$form,
          url = this.defaults.ajaxOptions.url || this.defaults.url || $this.attr("action") || "",
          settings,
          defaults,
          $reset;

      if (!url) {
        return;
      }

      this.action = this.url = url;

      defaults = {
        type: $this.attr("method") || "GET"
      };

      settings = {
        beforeSend: $.proxy(this.start, this),
        success: $.proxy(this.done, this),
        error: $.proxy(this.fail, this),
        complete: $.proxy(this.end, this)
      };

      this.ajaxOptions = $.extend({}, defaults, this.defaults.ajaxOptions, settings);

      if (!this.defaults.async) {
        this.initIframe();
      }

      if ($this.find(":file").length > 0 && !this.support.formData) {
        this.defaults.async = false;
        this.initIframe();
      }

      this.preSubmit = false;
      this.preventSubmit = false;

      if (this.defaults.resetAfterDone) {
        $reset = $this.find(":reset");

        if ($reset.length === 0) {
          $reset = $("<button type=\"reset\" style=\"display:none;\">Reset</button>");
          $this.append($reset);
        }

        this.$reset = $reset;
      }

      this.formTarget = $this.attr("target");

      this.enable();
    },

    setDefaults: function (options) {
      var defaults = this.defaults;

      if ($.isPlainObject(options)) {
        $.extend(defaults, options);
      } else if (typeof options === "string") {
        defaults[options] = arguments[1];
      }
    },

    enable: function () {
      this.$form.on("click", ":submit", $.proxy(this.click, this));
      this.$form.on("submit", $.proxy(this.submit, this));
    },

    disable: function () {
      this.$form.off("click", ":submit", this.click);
      this.$form.off("submit", this.submit).attr("target", this.formTarget);
      this.$form = null;

      if (this.$iframe) {
        this.$iframe.off("load").remove();
        this.$iframe = null;
      }

      this.$reset = null;
      this.ajaxOptions = null;
      this.defaults = null;
    },

    click: function (e) {
      var data = $(e.target).data(),
          url = this.$form.data(data.submit);

      this.preventSubmit = data.submit === "preview";

      if (typeof url === "string" && url !== "") {
        this.url = url;
        this.$form.attr("action", this.url);
        this.preSubmit = true;
      }
    },

    submit: function () {
      if (!this.defaults.isValidated() || this.preventSubmit) {
        return false;
      }

      if (!this.defaults.async) {
        this.start(null); // submit by iframe
      } else {
        this.ajaxSubmit(); // submit by ajax
        return false;
      }
    },

    start: function () {
      this.$form.find(":submit").prop("disabled", true);

      if ($.isFunction(this.defaults.start)) {
        this.defaults.start("submitStart");
      }

      if ($.isFunction(this.defaults.ajaxOptions.beforeSend)) {
        this.defaults.ajaxOptions.beforeSend(arguments);
      }
    },

    done: function (data) {
      if ($.isFunction(this.defaults.done)) {
        this.defaults.done(data, "submitSuccess");
      }

      if ($.isFunction(this.defaults.ajaxOptions.success)) {
        this.defaults.ajaxOptions.success(arguments);
      }

      if (this.defaults.resetAfterDone && this.$reset) {
        this.$reset.click();
      }
    },

    fail: function () {
      if ($.isFunction(this.defaults.fail)) {
        this.defaults.fail("submitError");
      }

      if ($.isFunction(this.defaults.ajaxOptions.error)) {
        this.defaults.ajaxOptions.error(arguments);
      }
    },

    end: function () {
      if (!this.defaults.disableAfterDone) {
        this.$form.find(":submit").prop("disabled", false);
      }

      if ($.isFunction(this.defaults.end)) {
        this.defaults.end("submitComplete");
      }

      if ($.isFunction(this.defaults.ajaxOptions.complete)) {
        this.defaults.ajaxOptions.complete(arguments);
      }

      if (this.preSubmit) {
        this.url = this.action;
        this.$form.attr("action", this.action);
        this.preSubmit = false;
      }
    },

    ajaxSubmit: function () {
      var ajaxOptions = $.extend({}, this.ajaxOptions);

      if (this.support.formData) {
        ajaxOptions.data = new FormData(this.$form[0]);
        ajaxOptions.type = "POST";
        ajaxOptions.processData = false;
        ajaxOptions.contentType = false;
      } else {
        ajaxOptions.data = this.$form.serialize();
      }

      $.ajax(this.url, ajaxOptions);
    },

    initIframe: function () {
      var iframeName = "submitter-" + Math.random().toString().replace("0.", ""),
          $iframe = $("<iframe name=\"" + iframeName + "\" style=\"display:none;\"></iframe>"),
          that = this;

      $iframe.on("load", function () {
        var data,
            win,
            doc;

        try {
          win = this.contentWindow;
          doc = this.contentDocument;

          doc = doc ? doc : win.document;
          data = doc ? doc.body.innerText : null;
          data = typeof data === "string" ? $.parseJSON(data) : data;
        } catch (e) {
          // throw new Error(e.message);
          that.fail(null, "submitError", e.message);
        }

        if (!data) {
          return;
        }

        if ($.isPlainObject(data)) {
          that.done(data, "submitSuccess", null);
        } else {
          that.fail(null, "submitError", "The response data must be JSON.");
        }

        that.end(null, "submitComplete");
      });

      if (this.defaults.ajaxOptions.type) {
        this.$form.attr("method", this.defaults.ajaxOptions.type);
      }

      this.$form.attr("target", iframeName).after($iframe);
      this.$iframe = $iframe;
    }
  };

  Submitter.defaults = {
    async: true,
    resetAfterDone: false,
    disableAfterDone: false,
    url: undefined,

    ajaxOptions: {
      dataType: "json"
    },

    messages: {
      start: "Submit start.",
      done: "Submit done.",
      fail: "Submit fail.",
      end: "Submit end."
    },

    isValidated: function () {
      // prevent to submit form, return "true" to submit and "false" to cancel
      return true;
    },

    start: function (/*textStatus*/) {
      // console.log(this.messages.start);
    },

    done: function (/*data, textStatus*/) {
      // console.log(this.messages.done);
    },

    fail: function (/*textStatus*/) {
      // console.log(this.messages.fail);
    },

    end: function (/*textStatus*/) {
      // console.log(this.messages.end);
    }
  };

  Submitter.setDefaults = function (options) {
    $.extend(Submitter.defaults, options);
  };

  // Register as jQuery plugin
  $.fn.submitter = function (options) {
    var args = [].slice.call(arguments, 1);

    return this.each(function () {
      var $this = $(this),
          data = $this.data("submitter");

      if (!data) {
        $this.data("submitter", (data = new Submitter(this, options)));
        }

      if (typeof options === "string" && $.isFunction(data[options])) {
        data[options].apply(data, args);
      }
    });
  };

  $.fn.submitter.Constructor = Submitter;
  $.fn.submitter.setDefaults = Submitter.setDefaults;

});

(function (window, $, we) {

  "use strict";

  // 文本编辑器
  we.textEditor = function ($scope, destroy) {
    var $editor = $scope ? $scope.find(".we-editor") : $(".we-editor"),
        $output = $editor.find(".editor-output"),
        $input = $editor.find(".editor-input"),
        regexpList = /<ul>.*<\/ul>/m,
        regexpLine = /[\r\n]+/g,
        syncContent = function () {
          $output.val($input.html().replace(/\s{2,}/g, "")).data("text", $.trim($input.text().replace(/\s{2,}/g, "")));
          $output.trigger("change");
        },
        setContent = function (editing) {
          var html = $input.html(),
              text = $.trim($input.text()),
              selection;

          if (!text.length) {
            $output.val("");
            $input.empty();
            return;
          }

          if (!regexpList.test(html)) {
            text = text.split(regexpLine);
            html = "<ul><li>" + text.join("</li><li>") + "</li></ul>";
            $input.html(html);

            // 移动光标位置到下一行
            if (editing && window.getSelection) {
              this.focus();
              selection = window.getSelection();
              selection.selectAllChildren(this);
              selection.collapseToEnd();
            }
          }

          syncContent();
        };

    if (destroy) {
      $input.off();
      return;
    }

    syncContent();

    $input.on({
      keyup: function (e) {
        var keyCode = e.which;

        if (keyCode === 13 || (e.ctrlKey && keyCode === 86)) {
          setContent.call(this, true);
        }
      },
      blur: function () {
        setContent.call(this);
      }
    });
  };

})(window, jQuery, WeLife);

(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as anonymous module.
    define("timeinputer", ["jquery"], factory);
  } else {
    // Browser globals.
    factory(jQuery);
  }
})(function ($) {

  "use strict";

  var TimeInputer = function (element, options) {
        this.$element = $(element);
        this.defaults = $.extend({}, TimeInputer.DEFAULTS, $.isPlainObject(options) ? options : {});
        this.init();
      },

      parseNumber = function (number) {
        return Math.abs(parseInt(number, 10));
      },

      prefixZero = function (number) {
        return number < 10 ? ("0" + number) : number;
      };

  TimeInputer.prototype = {
    constructor: TimeInputer,

    support: {
      timeInput: $('<input type="time">').prop("type") === "time"
    },

    init: function () {
      var $this = this.$element,
          $inputer;

      if (this.support.timeInput) {
        return;
      }

      this.$inputer = $inputer = $(TimeInputer.TEMPLATE);

      $this.hide().after($inputer);

      this.$hours = $inputer.find("[data-input='hh']");
      this.$minutes = $inputer.find("[data-input='mm']");
      this.$buttons = $inputer.find("[data-input='+'], [data-input='-']");
      this.$inputs = this.$hours.add(this.$minutes);
      this.activate(this.$hours, true);
      this.inputing = null;
      this.valid = false;
      this.addListeners();
      this.initTime();
      this.output();
    },

    initTime: function () {
      var defaults = this.defaults,
          time = defaults.time || this.$element.val(),
          valid,
          date,
          hours,
          minutes;

      if (/^\d{2}:\d{2}$/.test(time)) {
        time = time.match(/\d{2}/g);
        hours = parseNumber(time[0]);
        minutes = parseNumber(time[1]);

        if (!isNaN(hours) && !isNaN(minutes) && hours < 24 && minutes < 60) {
          valid = true;
          this.$hours.val(prefixZero(hours));
          this.$minutes.val(prefixZero(minutes));
        }
      }

      if (!valid && defaults.now) {
        date = new Date();
        this.$hours.val(prefixZero(date.getHours()));
        this.$minutes.val(prefixZero(date.getMinutes()));
      }
    },

    addListeners: function () {
      this.$inputer.on({
        mousedown: $.proxy(this.mousedown, this),
        mouseup: $.proxy(this.mouseup, this)
      });

      this.$inputs.on({
        keydown: $.proxy(this.keydown, this),
        keyup: $.proxy(this.keyup, this),
        blur: $.proxy(this.blur, this),
        paste: $.proxy(this.paste, this)
      });

      this.$buttons.on({
        mouseout: $.proxy(this.mouseout, this)
      });
    },

    removeListeners: function () {
      this.$inputer.off({
        mousedown: this.mousedown,
        mouseup: this.mouseup
      });

      this.$inputs.off({
        keydown: this.keydown,
        keyup: this.keyup,
        blur: this.blur,
        paste: this.paste
      });

      this.$buttons.off({
        mouseout: this.mouseout
      });
    },

    activate: function ($target, hidden) {
      var input;

      this.$inputs.removeClass("active");

      if (!hidden) {
        $target.addClass("active").focus();
      }

      this.$active = $target;
      this.active = (input = $target.data("input"));
      this.max = input === "hh" ? 24 : 60;
    },

    input: function (number, offset) {
      var val = this.getVal() || 0,
          max = this.max;

      if (offset) {
        val = (val + number + max) % max;
      } else {
        if (val < 10) {
          val = val * 10 + number;

          if (val > max) {
            val = number;
          }

          if (val === max) {
            val = 0; // 24 = 00, 60 = 00
          }
        } else {
          val = number;
        }
      }

      this.setVal(val);
      this.output();
    },

    keydown: function (e) {
      var which = e.which;

      if (which >= 48 && which <= 57) { // 0-9
        e.preventDefault();
        this.input(which - 48);
      } else if (which >= 37 && which <= 40) {
        e.preventDefault();

        switch (which) {
          case 37: // ←
            this.activate(this.$hours);
            break;

          case 38: // ↑
            this.input(1, true);
            break;

          case 39: // →
            this.activate(this.$minutes);
            break;

          case 40: // ↓
            this.input(-1, true);
            break;
        }
      } else if (which >= 65 && which <= 90 || which >= 186 && which <= 192 || which >= 219 && which <= 222) {

        /**
         * 65-90 a-z
         *
         * 186 ;
         * 187 =
         * 188 ,
         * 189 -
         * 190 .
         * 191 /
         * 192 `
         *
         * 219 [
         * 220 \
         * 221 ]
         * 222'
         */
        e.preventDefault();
      }
    },

    keyup: function () {
      this.validate();
    },

    blur: function () {
      this.validate();
    },

    paste: function (e) {
      e.preventDefault();
    },

    mousedown: function (e) {
      var input = $(e.target).data("input");

      switch (input) {
        case "hh":
        case "mm":
          this.valid = false;
          this.activate(input === "hh" ? this.$hours : this.$minutes);
          break;

        case "+":
        case "-":
          this.$active.addClass("active");
          this.inputing = setInterval($.proxy(function () {
            this.input(input === "+" ? 1 : -1, true);
          }, this), 50);
          break;
      }
    },

    mouseout: function () {
      clearInterval(this.inputing);
    },

    mouseup: function () {
      clearInterval(this.inputing);
    },

    getVal: function () {
      return parseNumber(this.$active.val());
    },

    setVal: function (val) {
      this.$active.val(!isNaN(val) ? prefixZero(val) : "");
    },

    output: function () {
      var hours = this.$hours.val(),
          minutes = this.$minutes.val(),
          time;

      if (hours && minutes) {
        time = (hours + ":" + minutes);
        this.$element.val(time);
      }
    },

    validate: function () {
      var val,
          max;

      if (this.valid) {
        return;
      }

      val = this.getVal();
      max = this.max;

      if (isNaN(val)) {
        this.setVal(val);
      } else if (val >= max) {
        this.setVal(val % max);
      }

      this.valid = true;
    },

    destroy: function () {
      this.$inputs.removeClass("active");
      this.removeListeners();
      this.$element.removeData("timeinputer");
    }
  };

  TimeInputer.DEFAULTS = {
    now: false,
    time: false
  };

  TimeInputer.TEMPLATE = ('<div class="timeinputer">' +
    '<input data-input="hh" type="text" name="hour" value="--" maxlength="2">' +
    '<span data-input=":">:</span>' +
    '<input data-input="mm" type="text" name="minute" value="--" maxlength="2">' +
    '<button data-input="+" type="button">+</button>' +
    '<button data-input="-" type="button">-</button>' +
  '</div>');

  TimeInputer.setDefaults = function (options) {
    $.extend(TimeInputer.DEFAULTS, options);
  };

  // Save the other timeinputer
  TimeInputer.other = $.fn.timeinputer;

  // Register as jQuery plugin
  $.fn.timeinputer = function (options) {
    var args = [].slice.call(arguments, 1),
        result;

    this.each(function () {
      var $this = $(this),
          data = $this.data("timeinputer"),
          fn;

      if (!data) {
        $this.data("timeinputer", (data = new TimeInputer(this, options)));
      }

      if (typeof options === "string" && $.isFunction((fn = data[options]))) {
        result = fn.apply(data, args);
      }
    });

    return (typeof result !== "undefined" ? result : this);
  };

  $.fn.timeinputer.constructor = TimeInputer;
  $.fn.timeinputer.setDefaults = TimeInputer.setDefaults;

  // No conflict
  $.fn.timeinputer.noConflict = function () {
    $.fn.timeinputer = TimeInputer.other;
    return this;
  };

  $(function () {
    $("input[type='time']").timeinputer();
  });
});

(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as anonymous module.
    define("validate", ["jquery"], factory);
  } else {
    // Browser globals.
    factory(jQuery);
  }
})(function ($) {

  "use strict";

  var Validate = function (element, options) {
        this.$element = $(element);
        this.options = $.isPlainObject(options) ? options : {};
        this.defaults = $.extend(true, {}, Validate.defaults);
        this.valid = false;
        this.init();
      };

  Validate.defaults = {
    rules: {},
    trim: false, // When change
    trimOverflow: false, // When it is invalid
    charCodeLength: false,
    filter: null,
    showErrors: null,
    hideErrors: null
  };

  Validate.regexps = {
    email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    nonempty: /\S+/,
    number: /^\d+$/,
    password: /^.{6,20}$/,

    chinese: /[\u4e00-\u9fa5]+/g,
    name: /^[a-zA-Z\u4e00-\u9fa5]+$/,
    phone: /^\d{11}$/
  };

  Validate.rules = [
    // Types
    "number",
    "email",
    "password",

    // Attrs
    "required",
    "minlength",
    "maxlength",
    "min",
    "max"
  ];

  Validate.messages = {
    required: "此项为必填项",
    email: "请输入有效的电子邮件",
    url: "请输入有效的网址",
    date: "请输入有效的日期",
    dateISO: "请输入有效的日期 (YYYY-MM-DD)",
    number: "请输入正确的数字",
    digits: "只可输入数字",
    creditcard: "请输入有效的信用卡号码",
    equalTo: "你的输入不相同",
    extension: "请输入有效的后缀",
    maxlength: "最多 %s 个字",
    minlength: "最少 %s 个字",
    rangelength: "请输入长度为 %s 至 %s 之間的字串",
    range: "请输入 %s 至 %s 之间的数值",
    max: "请输入不大于 %s 的数值",
    min: "请输入不小于 %s 的数值",

    name: "姓名只能包含汉字和字母",
    phone: "手机号码必须为11位数字"
  };

  Validate.prototype = {
    constructor: Validate,

    init: function () {
      this.update();
      this.addListener();
    },

    update: function (rules) {
      var $this = this.$element,
          type = $this.attr("type");

      rules = $.isPlainObject(rules) ? rules : {};

      $.each(Validate.rules, function (i, rule) {
        var attr = rule === type ? type : $this.attr(rule);

        if (attr) {
          if (/^\d+$/.test(attr)) {
             attr = parseFloat(attr);
          }

          rules[rule] = attr;
        }
      });

      $.extend(true, this.defaults, {
        rules: rules
      }, this.options);
    },

    addListener: function () {
      this.$element.on("keyup change", $.proxy(this.validate, this));

      if (this.defaults.trim) {
        this.$element.on("change", $.proxy(this.trim, this));
      }
    },

    trim: function () {
      var $this = this.$element;

      $this.val($.trim($this.val()));
    },

    validate: function (e) {
      var _this = this,
          defaults = this.defaults,
          $this = this.$element,
          element = $this.get(0),
          value = $this.val(),
          showErrors = defaults.showErrors,
          hideErrors = defaults.hideErrors,
          valid = true,
          message;

      if ($this.hasClass("disabled")) {
        return valid;
      }

      if ($.isFunction(defaults.filter)) {
        value = defaults.filter.call(element, value);
      }

      if (defaults.trim) {
        value = $.trim(value);
      }

      $.each(defaults.rules, function (rule, ruleValue) {
        var validator = _this[rule];

        if ($.isFunction(validator)) {
          valid = validator.call(_this, value, ruleValue);
        }

        if (!valid) {
          message = Validate.messages[rule];

          if (message && message.indexOf("%s") !== -1) {
            if (typeof ruleValue === "number") {
              if (defaults.charCodeLength) {
                 ruleValue /= 2;
              }

              message = message.replace("%s", ruleValue);
            } else if ($.isArray(ruleValue)) {
              $.each(ruleValue, function (i, value) {
                message = message.replace("%s", value);
              });
            }
          }

          if ($.isFunction(showErrors)) {
            showErrors(element, message);
          }

          return false;
        } else {
          if ($.isFunction(hideErrors)) {
            hideErrors(element);
          }
        }
      });

      this.valid = valid;

      if (!valid && defaults.preventInput) {
        e.preventDefault();
      }

      return valid;
    },

    required: function () {
      return Validate.regexps.nonempty.test(this.$element.val());
    },

    number: function () {
      return Validate.regexps.number.test(this.$element.val());
    },

    min: function (val, min) {
      val = parseFloat(val);
      return !isNaN(val) && val >= min;
    },

    max: function (val, max) {
      val = parseFloat(val);

      return !isNaN(val) && val <= max;
    },

    minlength: function (val, max) {
      var length = typeof val === "string" ? val.length : 0;

      return length >= max;
    },

    maxlength: function (val, max) {
      var defaults = this.defaults,
          length = typeof val === "string" ? val.length : 0,
          newLength = 0,
          newValue = "",
          i;

      // 将1个2字节字符替换为2个1字节字符
      if (length && defaults.charCodeLength) {
        for (i = 0; i < length; i++) {
          newLength += val.charCodeAt(i) > 255 ? 2 : 1;

          if (newLength <= max) {
            newValue += val.charAt(i);
          }
        }

        length = newLength;

        // 截取有效输入值
        if (newLength > max && defaults.trimOverflow) {
          length = max;
          this.$element.val(newValue);
        }
      }

      return length <= max;
    },

    name: function () {
      return Validate.regexps.name.test(this.$element.val());
    },

    phone: function () {
      return Validate.regexps.phone.test(this.$element.val());
    }
  };

  $.fn.validate = function (options) {
    var result;

    this.each(function () {
      var $this = $(this),
          data = $this.data("we.validate");

      if (!data) {
        $this.data("we.validate", (data = new Validate(this, options)));
      }

      if (typeof options === "string" && $.isFunction(data[options])) {
        result = data[options]();
      }
    });

    return typeof result !== "undefined" ? result : this;
  };

  $.fn.validate.constructor = Validate;
  $.fn.validate.setDefaults = function (options) {
    $.isPlainObject(options) && $.extend(true, Validate.defaults, options);
  };

});

(function (window, $, we) {

  "use strict";

  we.cardSelector = function ($scope) {
    var $selector = $scope ? $scope.find(".card-selector") : $(".card-selector"),
        $styleId = $selector.find(".card-style-id"),
        $styleName = $selector.find(".card-style-name"),
        $modal = $selector.find(".card-style"),
        $cardStyleList = $modal.find(".card-style-list"),
        cardStyleTemplate = $modal.find(".card-style-template").text();

    $selector.on("click", "[data-toggle^='card']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("card.", ""),
          $selected;

      if ($this.hasClass("disabled") || $this.hasClass("selected")) {
        return;
      }

      switch (toggle) {
        case "load":
          if (data.loaded) {
            $modal.modal("show");
          } else {
            $.ajax(data.url, {
              data: data,
              dataType: "json",
              beforeSend: function () {
                we.msg(we.MESSAGES.loading, 3);
                $this.addClass("disabled");
              },
              success: function (response) {
                var _template = _.template(cardStyleTemplate),
                    list = "";

                if (response.errcode === 0) {
                  we.msg("hide");
                  $this.data("loaded", true);
                  $modal.modal("show");

                  if ($.isArray(response.result)) {
                    $.each(response.result, function () {
                      list += _template(arguments[1]);
                    });

                    $cardStyleList.html(list).find("[data-id='" + $styleId.val() + "']").addClass("selected");
                  }
                } else {
                  we.msg(response.errmsg, 5);
                }
              },
              error: function () {
                we.msg(we.MESSAGES.error.loading, 5);
                console.log(arguments);
              },
              complete: function () {
                $this.removeClass("disabled");
              }
            });
          }

          break;

        case "select":
          $cardStyleList.find(".selected").removeClass("selected");
          $this.addClass("selected");
          break;

        case "selected":
          $selected = $cardStyleList.find(".selected");

          if ($selected.length) {
            data = $selected.data();
            $styleId.val(data.id);
            $styleName.text(data.name);
          }

          $modal.modal("hide");
          break;
      }

    });
  };

})(window, jQuery, WeLife);

(function (window, $) {

  "use strict";

  var Chart = function (element, options) {
        this.element = element;
        this.$element = $(element);
        this.defaults = $.extend({}, Chart.defaults, this.$element.data(), $.isPlainObject(options) ? options : {});

        this.caches = {};
        this.cacheId = 0;
        this.options = null;
        this.chart = null;
        this.charting = false;
        this.active = false;

        if (this.defaults.toggle) {
          this.toggle();
        }
      };

  Chart.defaults = {
    cacheId: 0, // 多组数据缓存编号
    type: "line",
    params: null,
    options: null,
    url: "",
    width: NaN,
    height: NaN,
    overview: "",
    toggle: true
  };

  Chart.prototype = {
    constructor: Chart,

    init: function () {
      var defaults = this.defaults;

      if ($.isPlainObject(defaults.options)) {
        this.options = defaults.options;
        this.cacheId = defaults.cacheId || 0;
        this.cache(this.cacheId, this.options);
      }

      if (typeof defaults.params === "string") {
        defaults.params = $.parseJSON(defaults.params);
      }

      this.$source = $(defaults.source);
      this.$category = $(defaults.category);
      this.$source.addClass("hide");
      this.$category.addClass("hide");
      this.addListeners();
      this.active = true;
    },

    addListeners: function () {
      this.$category.on("checked.we.radio", $.proxy(this.changeCategory, this));
    },

    removeListeners: function () {
      this.$category.off("checked.we.radio");
    },

    changeCategory: function (e) {
      var $this = $(e.target),
          $radio,
          data;

      // 多个图表，只在可见的图表中变化
      if (this.$element.hasClass("charted")) {
        $radio = $this.find(":radio");
        data = $.extend({}, $this.data(), $radio.data());

        data[$radio.attr("name")] = $radio.val();
        data["we.radio"] = null;
        this.load(data.url, data, function () {
          this.initChart();
        });
      }
    },

    cache: function (id, data) {
      var caches = this.caches;

      id = parseInt(id, 10) || this.cacheId;

      if ($.isPlainObject(data)) {
        caches[id] = data;
      } else {
        return caches[id];
      }
    },

    load: function (url, data, callback) {
      var _this = this,
          defaults = this.defaults,
          cached;

      if (!callback) {
        if ($.isFunction(url)) {
          callback = url;
          url = false;
        } else if ($.isFunction(data)) {
          callback = data;
          data = null;
        } else {
          callback = $.noop;
        }
      }

      url = url || defaults.url;
      data = $.isPlainObject(data) ? data : {};
      $.extend(data, defaults.params);

      // 检测是否已下载
      if (typeof data.cacheId !== "undefined") {
        cached = this.cache(data.cacheId);

        if (cached) {

          // 如果已下载已缓存，取出缓存，并返回
          this.options = cached;
          this.cacheId = data.cacheId;
          callback.call(this);
          return;
        } else if ($.isPlainObject(data.options)) {

          // 如果已下载未缓存，先缓存，再使用，并返回
          this.options = data.options;

          if (data.cacheId) {
            this.cacheId = data.cacheId
          }

          this.cache(this.cacheId, data.options);
          callback.call(this);
          return;
        }
      }

      // 异步请求下载数据
      if (typeof url === "string" && url) {
        $.ajax(url, {
          data: data,
          dataType: "json",
          success: function (response) {
            if (typeof response === "object") {
              _this.options = response;

              if (data.cacheId) {
                _this.cacheId = data.cacheId
              }

              _this.cache(_this.cacheId, response);
              callback.call(_this);
            }
          }
        });
      }
    },

    initChart: function () {
      require([
        "echarts",
        "echarts/chart/" + this.defaults.type
      ], $.proxy(function (echarts) {
        if (this.chart) {
          this.chart.clear();
          this.chart.dispose();
          this.chart = null;
        }

        this.chart = echarts.init(this.element);
        this.chart.setOption(this.options);

        this.shown();
      }, this));
    },

    setOptions: function (options) {
      if ($.isPlainObject(options)) {
        this.options = options;
        this.cache(this.cacheId, options);
        this.initChart();
      }
    },

    getOptions: function () {
      return this.options;
    },

    show: function () {
      var $this = this.$element;

      if (this.charting || $this.hasClass("charted")) {
        return;
      }

      if (!this.active) {
        this.init();
      }

      this.charting = true;
      $this.addClass("charted loading");

      if (this.options) {
        this.initChart();
      } else {
        this.load(function () {
          this.initChart();
        });
      }
    },

    shown: function () {
      var defaults = this.defaults,
          total = this.options ? (this.options.total || 0) : 0,
          overview = defaults.overview;

      total = ("<b>" + total + "</b>");

      if (typeof overview === "string") {
        overview = overview.replace("%s", total);
      } else {
        overview = total;
      }

      this.$element.removeClass("loading").closest(".we-chart").find(".chart-overview").html(overview);
      this.$source.removeClass("hide");
      this.$category.removeClass("hide");
      this.charting = false;
    },

    hide: function () {
      var $this = this.$element;

      if (!$this.hasClass("charted")) {
        return;
      }

      $this.removeClass("charted");
      this.hidden();
    },

    hidden: function () {
      if (this.cacheId > 0) {
        this.cacheId = this.defaults.cacheId;
        this.options = this.cache(this.cacheId);
        this.$category.radio("uncheck");
      }

      this.$source.addClass("hide");
      this.$category.addClass("hide");
    },

    toggle: function () {
      this.$element.hasClass("charted") ? this.hide() : this.show();
    }
  };

  $.fn.chart = function (options) {
    var args = [].slice.call(arguments, 1),
        result;

    this.each(function () {
      var $this = $(this),
          data = $this.data("we.chart");

      if (!data) {
        $this.data("we.chart", (data = new Chart(this, options)));
      }

      if (typeof options === "string" && $.isFunction(data[options])) {
        result = data[options].apply(data, args);
      }
    });

    return typeof result !== "undefined" ? result : this;
  };

  $.fn.chart.constructor = Chart;

  $(document).on("click.we.chart", "[data-toggle='chart']", function (e) {
    var $this = $(this),
        options = $this.data(),
        $target = $(options.target || $this.attr("href"));

    e.preventDefault();

    if (!$this.hasClass("active")) {
      $this.addClass("active").siblings(".active").removeClass("active");
      $target.addClass("active").siblings(".active").removeClass("active").chart("hide");
    }

    options = $target.data("we.chart") ? "toggle" : options;

    $target.chart(options);
  });

  $(function () {
    $(".active[data-toggle='chart']").click();
    $("[data-toggle='chart.render']").chart();
  });

})(window, jQuery, WeLife);

(function (window, $, we) {

  "use strict";

  we.colorSelector = function ($scope) {
    var $selector = $scope ? $scope.find(".color-selector") : $(".color-selector"),
        $styleId = $selector.find(".color-style-id"),
        $styleName = $selector.find(".color-style-name"),
        $modal = $selector.find(".color-style"),
        $colorStyleList = $modal.find(".color-style-list"),
        colorStyleTemplate = $modal.find(".color-style-template").text();

    $selector.on("click", "[data-toggle^='color']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("color.", ""),
          $selected;

      if ($this.hasClass("disabled") || $this.hasClass("selected")) {
        return;
      }

      switch (toggle) {
        case "load":
          if (data.loaded) {
            $modal.modal("show");
          } else {
            $.ajax(data.url, {
              data: data,
              dataType: "json",
              beforeSend: function () {
                we.msg(we.MESSAGES.loading, 3);
                $this.addClass("disabled");
              },
              success: function (response) {
                var _template = _.template(colorStyleTemplate),
                    list = "";

                if (response.errcode === 0) {
                  we.msg("hide");
                  $this.data("loaded", true);
                  $modal.modal("show");

                  if ($.isArray(response.result)) {
                    $.each(response.result, function () {
                      list += _template(arguments[1]);
                    });

                    $colorStyleList.html(list).find("[data-id='" + $styleId.val() + "']").addClass("selected");
                  }
                } else {
                  we.msg(response.errmsg, 5);
                }
              },
              error: function () {
                we.msg(we.MESSAGES.error.loading, 5);
                console.log(arguments);
              },
              complete: function () {
                $this.removeClass("disabled");
              }
            });
          }

          break;

        case "select":
          $colorStyleList.find(".selected").removeClass("selected");
          $this.addClass("selected");
          break;

        case "selected":
          $selected = $colorStyleList.find(".selected");

          if ($selected.length) {
            data = $selected.data();
            $styleId.val(data.id);
            $styleName.css("background-color", data.color);
          }

          $modal.modal("hide");
          break;
      }

    });
  };

})(window, jQuery, WeLife);

(function (window, $, we) {

  "use strict";

  we.couponEditor = function ($scope) {
    var $container = $scope ? $scope.find(".coupon-settings") : $(".coupon-settings"),
        $coupon = $container.find(".we-coupon"),
        $sandbox = $container.find(".we-sandbox"),
        $condition = $container.find(".coupon-condition"),
        $couponList = $coupon.find(".coupon-list"),
        existedCoupons = $couponList.data("existedCoupons"),
        _couponListTemplate = _.template($coupon.find(".coupon-list-template").text()),
        $couponToggle = $coupon.find(".coupon-toggle"),
        $couponMenu = $coupon.find(".coupon-menu"),
        $previewModal = $container.find(".preview-modal"),
        $previewModalBody = $previewModal.find(".modal-body"),
        _previewModalTemplate = _.template($previewModal.find(".modal-body-template").text());

    // 载入页面
    // -----------------------------------------------------------------------
    function loadPages(data) {
      var shown = $sandbox.hasClass("in");

      if (!shown) {
        $couponToggle.addClass("disabled").prop("disabled", true);
      }

      // 异步载入模板
      $.ajax(data.remote, {
        data: data,
        success: function (response) {
          if (!shown) {
            $sandbox.html(response).collapse("show");
          } else {
            $sandbox.empty().html(response);
          }

          if (data.page === "create") {
            createCoupon();
          }

          if (data.page === "search") {
            searchCoupon();
          }
        },
        error: function () {
          if (!shown) {
            $couponToggle.removeClass("disabled").prop("disabled", false);
          }

          console.log(arguments);
        }
      });
    }

    // 创建券
    // -----------------------------------------------------------------------
    function createCoupon() {
      var $scope = $sandbox.find(".coupon-create"),
          $form = $scope.find(".we-form"),
          $type = $form.find(".input-type"),
          $value = $form.find(".input-value"),
          $namePrefix = $form.find(".input-name-prefix"),
          $name = $form.find(".input-name"),
          $term = $form.find(".input-term"),
          $absolute = $form.find(".term-absolute"),
          $relative = $form.find(".term-relative"),
          $count = $relative.find(".input-term-count"),
          $shop = $form.find(".input-shop"),
          $restriction = $form.find(".input-restriction"),
          $detail = $scope.find(".voucher-detail"),
          _detailTemplate = _.template($scope.find("#voucher-detail-template").text()),
          couponData = {},
          validates = {
            count: function () {
              if ($relative.is(":visible")) {
                return $count.validate("validate");
              }

              return true;
            }
          };

      if ($relative.is(":visible")) {
        $relative.data("active", true);
        $count.validate();
      }

      // 激活日历控件
      if ($absolute.is(":visible")) {
        $absolute.data("active", true);
        we.date($scope, {
          startDate: new Date()
        });
      }

      $scope.on("click", "[data-toggle^='coupon']", function () {
        var $this = $(this),
            data = $this.data(),
            toggle = data.toggle.replace("coupon.", "");

        switch (toggle) {
          case "relative":
            $relative.removeClass("hide");
            $absolute.addClass("hide");

            if (!$relative.data("active")) {
              $relative.data("active", true);
              $count.validate();
            }

            $relative.parent().find(".highlight").addClass("hide");

            break;

          case "absolute":
            $relative.addClass("hide");
            $absolute.removeClass("hide");

            // 激活日历控件
            if (!$absolute.data("active")) {
              $absolute.data("active", true);
              we.date($scope, {
                startDate: new Date()
              });
            }

            $absolute.parent().find(".highlight").addClass("hide");

            break;

          case "create":
            if ($value.length && !$value.validate("validate")) {
              return;
            }

            if (!($name.validate("validate") && validates.count() && $restriction.validate("validate"))) {
              return;
            }

            // 转换有效期
            $term.val(function () {
              var term = $(this).val();

              if (!$relative.hasClass("hide")) {
                term = [
                  "relative",
                  $relative.find(".input-term-count").val(),
                  $relative.find(".input-term-unit").val()
                ];
              } else if (!$absolute.hasClass("hide")) {
                term = [
                  "absolute",
                  $absolute.find(".input-term-start").val(),
                  $absolute.find(".input-term-end").val()
                ];
              }

              return $.isArray(term) ? term.join() : term;
            });

            couponData.value = $value.val();
            couponData.name = $name.val();
            couponData.term = $term.val().split(/\s*\,\s*/);
            couponData.shop = $shop.closest(".form-group").hasClass("hide") ? "" : $shop.data("shop");
            couponData.restriction = $restriction.val();
            $detail.html(_detailTemplate(couponData));
            $form.addClass("hide");
            $detail.removeClass("hide");

            break;

          case "cancel":
            closeSandbox();
            break;

          case "apply":
            if ($value.length && !$value.validate("validate")) {
              return;
            }

            if (!($name.validate("validate") && validates.count() && $restriction.validate("validate"))) {
              return;
            }

            $term.val(function () {
              var term = $(this).val();

              if (!$relative.hasClass("hide")) {
                term = [
                  "relative",
                  $relative.find(".input-term-count").val(),
                  $relative.find(".input-term-unit").val()
                ];
              } else if (!$absolute.hasClass("hide")) {
                term = [
                  "absolute",
                  $absolute.find(".input-term-start").val(),
                  $absolute.find(".input-term-end").val()
                ];
              }

              return $.isArray(term) ? term.join() : term;
            });

            data[$type.attr("name")] = $type.val();
            data[$name.attr("name")] = $name.val();

            if ($value.length) {
              data[$value.attr("name")] = $value.val();
            } else {
              data.value = "";
            }

            data[$term.attr("name")] = $term.val();
            data[$shop.attr("name")] = $shop.val();
            data[$restriction.attr("name")] = $restriction.val();

            // 异步提交券设置
            $.ajax(data.url, {
              type: "POST",
              data: data,
              dataType: "json",
              success: function (response) {
                we.respond(response, {
                  success: function () {
                    applyCoupon(response.result);
                  }
                });
              }
            });

            break;

          case "modify":
            $form.removeClass("hide");
            $detail.addClass("hide");
            break;
        }
      });

      $value.validate();
      $value.on("keyup change", function () {
        var value = parseInt($(this).val(), 10);

        $namePrefix.text(value && value > 0 ? (value + "元") : "");
      });

      // 券名称验证
      $name.validate({
        charCodeLength: true,
        trimOverflow: true,
        trim: true
      });

      $relative.find(".input-term-count").validate();
      $restriction.validate({
        filter: function () {
          return $(this).data("text");
        }
      });

      // 礼品券名称弹出提示框
      we.popoverNotice($scope);

      // 激活门店选择
      we.shop($scope);

      // 文本编辑
      we.textEditor($scope);
    }

    // 搜索券
    // -----------------------------------------------------------------------
    function searchCoupon() {
      var $scope = $sandbox.find(".coupon-search"),
          $voucherList = $container.find(".voucher-list"),
          _voucherListTemplate = _.template($container.find(".voucher-list-template").text()),
          $load = $container.find(".voucher-load"),
          $loadToggle = $load.find("a"),
          $detailModal = $container.find(".detail-modal"),
          $detailModalBody = $detailModal.find(".modal-body"),
          _detailModalTemplate = _.template($detailModal.find(".modal-body-template").text());

      $loadToggle.data("originalText", $loadToggle.text());

      $scope.on("click", "[data-toggle^='coupon']", function (e) {
        var $this = $(this),
            data = $this.data(),
            toggle = data.toggle.replace("coupon.", "");

        if ($this.hasClass("disabled")) {
          return;
        }

        e.preventDefault();

        switch (toggle) {
          case "detail":
            $detailModal.data("coupon", (data = $this.closest("li").data()));

            data = $.extend({}, data); // 复制一份，避免改变原对象
            data.name = data.value ? data.name.replace(/^\d+\u5143/, "") : data.name, // 将名称中的“**元”删除
            data.term = data.term.split(/\s*\,\s*/);
            $detailModalBody.empty().html(_detailModalTemplate(data));

            $detailModal.modal("show");
            break;

          // 在弹出中的使用操作
          case "detailApply":
            $detailModal.one("hidden.bs.modal", function () {
              applyCoupon($detailModal.data("coupon"));
            }).modal("hide");
            break;

          case "cancel":
            closeSandbox();
            break;

          case "apply":
            applyCoupon($this.closest("li").data());
            break;

          case "load":
            // 异步加载更多券
            $.ajax(data.url, {
              data: data,
              dataType: "json",
              beforeSend: function () {
                $loadToggle.addClass("disabled").text($loadToggle.data("loading"));
              },
              success: function (response) {
                var html = "",
                    result;

                if (response.errcode === 0) {
                  $this.data("pageId", ++data.pageId);
                  result = response.result;

                  if (result.data.length > 0) {
                    $.each(result.data, function (i, n) {
                      n.name = n.value ? n.name.replace(/^\d+\u5143/, "") : n.name, // 将名称中的“**元”删除
                      n.term = n.term.split(/\s*\,\s*/);
                      html += _voucherListTemplate(n);
                    });

                    $voucherList.append(html);
                  }

                  if (!result.more) {
                    $load.addClass("hide");
                  }
                } else {
                  console.log(response.errmsg);
                }
              },
              complete: function () {
                $loadToggle.removeClass("disabled").text($loadToggle.data("originalText"));
              }
            });
            break;
        }
      });

      // 搜索
      $scope.on("keyup", ".input-search", function (e) {
        var $this = $(this),
            $submit = $this.next("button");

        $submit.data($this.attr("name"), $this.val());

        if (e.which === 13) {
          e.preventDefault();
          $submit.click();
        }
      });
    }

    // 使用券
    // -----------------------------------------------------------------------
    function applyCoupon(data) {
      data = $.extend({}, data);

      if (data.value) {
        data.name = data.name.replace(/^\d+\u5143/, ""); // 将名称中的“**元”删除
      }

      $couponList.append(_couponListTemplate(data));

      if ($sandbox.hasClass("in")) {
        closeSandbox();
      }

      if ($couponList.children().length >= 3) {
        $couponToggle.addClass("hide");
      }
    }

    // 关闭沙箱
    // -----------------------------------------------------------------------
    function closeSandbox() {
      $sandbox.one("hidden.bs.collapse", function () {
        $sandbox.empty();
        $couponToggle.removeClass("disabled").prop("disabled", false);
      }).collapse("hide");
    }

    // 初始化券列表
    // -----------------------------------------------------------------------
    if ($.isArray(existedCoupons) && existedCoupons.length) {
      $.each(existedCoupons, function (i, coupon) {
        applyCoupon(coupon);
      });
    }

    // 点击触发载入页面
    // -----------------------------------------------------------------------
    $couponMenu.add($sandbox).on("click", "[data-toggle='page']", function (e) {
      e.preventDefault();
      loadPages($(this).data());
    });

    $couponList.on("click", "[data-toggle='coupon.preview']", function (e) {
      var data = $(this).closest("li").data();

      e.preventDefault();
      data = $.extend({}, data);

      if (data.value) {
        data.name = data.name.replace(/^\d+\u5143/, ""); // 将名称中的“**元”删除
      }

      data.term = data.term.split(/\s*\,\s*/);
      $previewModalBody.empty().html(_previewModalTemplate(data));
      $previewModal.modal("show");
    });

    $condition.find(".condition-type").on("change", function () {
      $condition.find(".condition-unit").text($(this).find(":selected").data("unit"));
    });

    // 删除券确认框
    we.popoverConfirm({
      message: "确定要删除此券么？",
      confirm: function () {
        // 进行删除操作
        console.log("Yes");
        $(this).popover("destroy").closest("li").remove();

        if ($couponList.children().length < 3) {
          $couponToggle.removeClass("hide");
        }
      },
      cancel: function () {
        // 进行其他操作
        console.log("No");
      }
    });
  };

})(window, jQuery, WeLife);

(function (window, $, we) {

  "use strict";

  we.date = function ($scope, options) {
    var $container = $scope ? $scope.find(".we-date-group") : $(".we-date-group"),
        $start = $container.find(".date-start"),
        $end = $container.find(".date-end"),
        $time = $container.find(".date-time"),
        now = new Date(),
        defaults = {
          autoclose: true,
          format: "yyyy-mm-dd",
          language: "zh-CN",
          customDateRange: false,
          startViewDate: now,
          endViewDate: (function (now) {
            // 默认结束时间为下个月
            return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          })(new Date())
        },
        format = function ($elem, date) {
          date = [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
          ]

          date[1] = date[1] < 10 ? ("0" + date[1]) : date[1];
          date[2] = date[2] < 10 ? ("0" + date[2]) : date[2];
          $elem.val(date.join("-"));
        },
        timeValue;

    if ($.isPlainObject(options)) {
      $.extend(defaults, options);
    }

    if (defaults.endDate) {

      if (defaults.startViewDate > defaults.endDate) {
        defaults.startViewDate = defaults.endDate;
      }

      if (defaults.endViewDate > defaults.endDate) {
        defaults.endViewDate = defaults.endDate;
      }

      if (defaults.startViewDate === defaults.endViewDate) {
        // 开始时间往前推一个月
        defaults.startViewDate = (function (endDate) {
          var startViewDate;

          if (defaults.customDateRange) {
            startViewDate = new Date(endDate.valueOf() - defaults.customDateRange);
          } else {
            startViewDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, endDate.getDate());
          }

          return startViewDate;
        })(defaults.endDate);
      }
    }

    $start.datepicker(defaults);

    // 如果表单没有显示开始日期，且配置有开始日期，则赋值
    if (!$start.val() && defaults.startViewDate) {
      format($start, defaults.startViewDate);
      $start.datepicker("update");
    }

    if ($end.length) {
      $start.on("changeDate", function () {
        var startDate = $start.datepicker("getDate"),
            endDate = $end.datepicker("getDate"),
            newEndDate;

        if (endDate < startDate) {
          format($end, startDate);
        }

        if (defaults.customDateRange) {
          newEndDate = new Date(startDate.valueOf() + defaults.customDateRange);

          if (defaults.endDate) {
            newEndDate = newEndDate < defaults.endDate ? newEndDate : defaults.endDate;
          }

          if (newEndDate < endDate) {
            format($end, newEndDate);
          }

          $end.datepicker("setEndDate", newEndDate);
        }

        $end.datepicker("setStartDate", startDate);
      });

      $end.datepicker(defaults);

      // 如果表单没有显示结束日期，且配置有结束日期值，则赋值
      if (!$end.val() && defaults.endViewDate) {
        format($end, defaults.endViewDate);
        $end.datepicker("update");
      }

      $start.trigger("changeDate");
    }

    if ($time.length) {
      timeValue = $time.val();

      if (!timeValue || timeValue === "00:00") {
        $time.val(function () {
          var hours = now.getHours(),
              minutes = now.getMinutes();

          // hours += minutes < 30 ? 1 : 2;
          // hours %= 24;
          hours = hours < 10 ? ("0" + hours) : hours;
          minutes = minutes < 10 ? ("0" + minutes) : minutes;

          return (hours + ":" + minutes);
        });
      }
    }

    $container.find(".caret").click(function () {
      $(this).parent().find("input").focus();
    });
  };

})(window, jQuery, WeLife);

(function (window, $, we) {

  "use strict";

  we.exporter = function ($scope) {
    var $container = $scope ? $scope.find(".we-exporter") : $(".we-exporter"),
        $toggle = $container.find(".export-toggle"),
        $progress = $container.find(".export-progress"),
        $result = $container.find(".export-result"),
        $progressbar = $container.find(".progressbar"),
        $percentage = $container.find(".percentage"),
        $exportedName = $container.find(".exported-name"),
        $exportedUrl = $container.find(".exported-url");

    $toggle.on("click", function (e) {
      var data = $(this).data(),
          xhr = new XMLHttpRequest();

      e.preventDefault();

      xhr.onprogress = function (e) {
        var percentage;

        if (e.lengthComputable) {
          percentage = (e.loaded / e.total) * 100 + "%";
          $progressbar.width(percentage);
          $percentage.text(percentage);
        }
      };

      $.ajax(data.url, {
        type: "POST",
        data: data,
        dataType: "json",
        xhr: function () {
          return xhr;
        },
        beforeSend: function () {
          $toggle.addClass("hide");
          $progress.removeClass("hide");
        },
        success: function (response) {
          var result = response.result;

          if (response.errcode === 0) {
            $exportedName.text(result.name);
            $exportedUrl.attr("href", result.url);

            $progress.addClass("hide");
            $result.removeClass("hide");
          } else {
            we.msg(response.errmsg, 5);
            $toggle.removeClass("hide");
            $progress.addClass("hide");
          }
        }
      });
    });
  };

})(window, jQuery, WeLife);

(function (window, $, we) {

  "use strict";

  we.keywordEditor = function ($scope) {
    var $editor = $scope ? $scope.find(".keyword-editor") : $(".keyword-editor"),
        $list = $editor.find(".keyword-list"),
        _template = _.template($editor.find(".keyword-template").text()),
        $modal = $editor.find(".keyword-modal"),
        $content = $modal.find(".keyword-content"),
        $help = $modal.find(".keyword-help-text"),
        $matched = $modal.find(".we-checkbox"),
        _data = $content.data(),
        $active = null;

    function reset() {
      $content.val("");
      $help.text(_data.helpText.replace("%s", _data.maxlength));
      $matched.checkbox("uncheck");
    }

    function set(data) {
      data.keyword && $content.val(data.keyword);
      data.matched && $matched.checkbox("check");
    }

    _data.maxlength = $content.attr("maxlength");

    $modal.on("hidden.bs.modal", function () {
      $active = null;
      reset();
    }).on("shown.bs.modal", function () {
      $content.focus().trigger("keyup");
    });

    $content.on("keyup blur", function () {
      var length = $.trim($content.val()).length;

      if (length <= _data.maxlength) {
        $help.text(_data.helpText.replace("%s", _data.maxlength - length));
      }
    });

    $content.on("change blur", function () {
      $content.val($.trim($content.val()));
    });

    $editor.on("click", "[data-toggle^='keyword']", function () {
      var $this = $(this),
          toggle = $this.data("toggle").replace("keyword.", ""),
          keyword,
          matched,
          _item;

      if ($this.hasClass("disabled") || $this.hasClass("selected")) {
        return;
      }

      switch (toggle) {
        case "show":
          if ($list.children().length < $this.data("maxlength")) {
            $modal.modal("show");
          } else {
            we.msg($this.data("message"), 4);
          }

          break;

        case "add":
          keyword = $content.val();
          matched = $matched.hasClass("checked");

          if (keyword) {
            _item = _template({
              keyword: keyword,
              matched: matched
            });

            if ($active) {
              $active.replaceWith(_item);
              $active = null;
            } else {
              $list.removeClass("hide").append(_item);
            }

            $modal.modal("hide");
            reset();
          } else {
            // $help.html(_data.required);
            we.msg(_data.required, 4);
          }
          break;

        case "del":
          $this.parent().remove();
          break;

        case "edit":
          $active = $this.parent();
          set($active.data());
          $modal.modal("show");
          break;
      }

    });
  };

})(window, jQuery, WeLife);

(function (window, $, we) {

  "use strict";

  we.messageEditor = function ($scope) {
    var $container = $scope ? $scope.find(".message-editor") : $(".message-editor"),
        $menu = $container.find(".editor-menu"),
        $input = $container.find(".editor-input"),
        $output = $container.find(".editor-output"),
        $type = $container.find(".editor-type"),
        $help = $container.find(".editor-help"),
        $modal = $container.find(".editor-modal"),
        $buttons = $modal.find(".editor-modal-menu > li"),
        $list = $modal.find(".editor-material-list"),
        $columns = $list.children(),
        _template = _.template($modal.find(".editor-material-template").text()),
        $load = $modal.find(".editor-material-load > a"),
        $confirm = $modal.find("[data-toggle='material.selected']"),
        inputOptions = $input.data(),
        inputCache = {},
        loadData = $load.data(),
        ajaxData = {
          page: 1
        },
        $active,
        loadMaterial = function (data) {
          if ($.isPlainObject(data)) {
            $.extend(ajaxData, data);
          }

          $.ajax(loadData.url, {
            data: ajaxData,
            dataType: "json",
            beforeSend: function () {
              $load.addClass("disabled").text($load.data("loading"));
            },
            success: function (response) {
              var data = [],
                  result;

              if (response.errcode === 0) {

                result = response.result;

                if ($.isArray(result.data)) {
                  data = result.data;

                  $.each(data, function (i, n) {
                    appendMaterial(_template(n));
                  });
                }

                if (!result.more) {
                  // 没有下一页，隐藏加载按钮
                  $load.parent().addClass("hide");

                  if (ajaxData.page === 1 && data.length === 0) {
                    // 当前第1页且数据为空，则显示为空提示
                    $modal.find(".we-nothing").removeClass("hide");
                  }
                }

                ajaxData.page++;
              } else {
                we.msg(response.errmsg, 5);
              }
            },
            complete: function () {
              $load.removeClass("disabled").text($load.data("originalText"));
            }
          });
        },
        appendMaterial = function (html) {
          var minHeight = $list.height(),
              index = 0;

          $columns.each(function (i) {
            var height = $(this).height();

            if (height < minHeight) {
              minHeight = height;
              index = i;
            }
          });

          $columns.eq(index).append('<li>' + html + '</li>');
        },
        cacheContent = function () {
          var toggle = $menu.find(".active > a").data("toggle").replace("message.", "");

          if (toggle) {
            inputCache[toggle] = $input.html();
          }
        },
        filterContent = function (html) {
          return html.replace(/<(\/?\w+)?[^<]*>/img, function (tag, tagName) {
            var replacement = "";

            switch (tagName.toLowerCase()) {
              case "br":
              case "/h1":
              case "/h2":
              case "/h3":
              case "/h4":
              case "/h5":
              case "/h6":
              case "/p":
              case "/div":
                replacement = "<br>";
                break;
            }

            return replacement;
          }).replace(/&nbsp;/g, " ");
        },
        outputContent = function () {
          var data = $menu.find(".active > a").data(),
              content,
              materialId;

          $type.val(data.type).data("typeName", data.typeName);

          if ($input.prop("contenteditable") === "true") {
            syncTextContent(); // 同步文本消息
          } else {

            // 同步图文消息
            content = $input.html(); // 获取素材元素
            materialId = $input.find(".material").data("id"); // 获取素材ID
            $output.val(materialId).data("content", content).trigger("change");
          }
        },
        syncTextContent = function (keyCode) {
          var element = $input[0],
              valid = true,
              content,
              filtered,
              selection,
              length,
              text;

          if ($input.prop("contenteditable") === "false") {
            return;
          }

          content = $input.html();

          // 转换空格转义符，并剔除尾部空格（根据产品要求，保留头部空格）
          content = content.replace(/&nbsp;/g, " ").replace(/\s+$/, "");

          if (/<[^<]+>/.test(content)) {
            filtered = filterContent(content);

            if (filtered !== content) {
              content = filtered;
              $input.html(content);

              if (keyCode === 13 && window.getSelection) {
                selection = window.getSelection();
                selection.selectAllChildren(element);
                selection.collapseToEnd();
              }
            }
          }

          length = content.replace(/<br>/g, " ").length;

          if (length < inputOptions.minLength) {
            text = inputOptions.minText.replace("%s", inputOptions.minLength);
          } else if (length > inputOptions.maxLength) {
            valid = false;
            text = inputOptions.maxText.replace("%s", inputOptions.maxLength).replace("%s", length - inputOptions.maxLength);
          } else {
            if (inputOptions.required && length === 0) {
              valid = false;
              // text = inputOptions.required;
              text = inputOptions.helpText.replace("%s", inputOptions.maxLength);
            } else {
              text = inputOptions.helpText.replace("%s", (inputOptions.maxLength - length));
            }
          }

          $help.text(text);
          $input.data("valid", valid);
          $output.val(content).data("content", content).trigger("change");
        };

    // 如果已禁用，则重置编辑器
    if (typeof $input.attr("disabled") !== "undefined") {
      $menu.find("a").addClass("disabled");
      $input.prop("contenteditable", false).data("valid", true);
      $container.find(".editor-clear").addClass("hide");
      $container.find(".editor-btns").addClass("invisible");
      return;
    }

    if ($.trim($input.text()).length) {
      $input.data("valid", true);
    }

    outputContent();
    $load.data("originalText", $load.text());

    $menu.on("click", "[data-toggle^='message']", function (e) {
      var $this = $(this),
          $parent = $this.parent(),
          active = $parent.hasClass("active"),
          data = $this.data(),
          toggle = data.toggle.replace("message.", "");

      e.preventDefault();

      if ($this.hasClass("disabled")) {
        return;
      }

      $active = $parent;

      // 缓存
      cacheContent();

      switch (toggle) {
        case "text":
          if (!active) {
            $active.addClass("active").siblings().removeClass("active");
            $input.prop("contenteditable", true);
            $input.empty().html(inputCache[toggle]);
            outputContent();
          }
          break;

        case "single":
        case "multiple":
          if (!active) {
            $confirm.addClass("disabled"); // 默认禁用弹窗确认按钮
            $load.text($load.data("loading")).addClass("disabled");
          }

          $modal.one("shown.bs.modal", function () {
            if (!active) {
              ajaxData.page = 1;
              $columns.empty(); // 清空
              loadMaterial(data);
            } else if (ajaxData.page === 1) {
              loadMaterial(data);
            }
          }).one("hidden.bs.modal", function () {
            if ($active && !$active.hasClass("active")) {
              // 重置
              ajaxData.page = 1;
              $columns.empty();
            }
          });

          $buttons.removeClass("active");

          if (toggle === "single") {
            $buttons.first().addClass("active");
          } else {
            $buttons.last().addClass("active");
          }

          $modal.modal("show");
          break;
      }
    });

    // 检验输入并同步内容
    syncTextContent();

    $input.on("keyup blur", function (e) {
      syncTextContent(e.which);
    });

    $input.on("paste", function () {
      console.log("Pasted!");
      setTimeout(function () {
        syncTextContent();
      }, 50);
    });


    $modal.on("click", "[data-toggle^='material']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("material.", ""),
          $selected;

      if ($this.hasClass("disabled")) {
        return;
      }

      switch (toggle) {
        case "load":
          loadMaterial();
          break;

        case "select":
          if (!$this.hasClass("selected")) {
            $columns.find(".selected").removeClass("selected");
            $this.addClass("selected");
            $confirm.addClass("disabled");

            if ($confirm.hasClass("disabled")) {
              $confirm.removeClass("disabled");
            }
          }
          break;

        case "selected":
          $selected = $columns.find(".selected");

          if ($selected.length) {
            $selected = $selected.clone().removeClass("selected").removeAttr("data-toggle");
            $input.prop("contenteditable", false).empty().html($selected);
            $help.empty();

            if ($active && !$active.hasClass("active")) {
              $active.addClass("active").siblings().removeClass("active");
            }

            outputContent();
          }

          $modal.modal("hide");
          break;
      }
    });
  };

})(window, jQuery, WeLife);

(function (window, $, we) {

  "use strict";

  var $document = $(document);

  we.shop = function ($scope, noAutoCheckAll) {
    var $container = $scope ? $scope.find(".we-shop-container") : $(".we-shop-container"),
        $checkedIds = $container.find(".shop-checked-ids"),
        $toggle = $container.find(".shop-toggle"),
        $checkedList = $container.find(".shop-checked-list"),
        $shop = $container.find(".we-shop"),
        $checkAll = $shop.find(".shop-check-all"),
        autoCheckAll = true,
        radio = false,
        $list = $shop.find(".shop-list"),
        viewTemplate = $list.data("viewTemplate"),
        $template = viewTemplate ? $(viewTemplate) : $shop.find(".shop-list-template"),
        _template = _.template($template.text()),
        $confirm = $shop.find(".shop-confirm"),
        $cancel = $shop.find(".shop-cancel"),
        data = $toggle.data(),
        shopLoaded = false;

    function initShop() {
      var checkedIds = $checkedIds.val();

      if (checkedIds) {
        if (radio) {
          $list.filter("[data-shop-id='" + checkedIds + "']").radio("check");
          return;
        }

        if (checkedIds.toLowerCase() === "all") {
          $checkAll.checkbox("check");
          $list.checkbox("check");
        } else {
          checkedIds = checkedIds.match(/\d+/g);

          if (checkedIds && checkedIds.length) {
            $checkAll.checkbox("uncheck");
            $list.checkbox("uncheck");

            $.each(checkedIds, function (i, id) {
              $list.filter("[data-shop-id='" + id + "']").checkbox("check");
            });
          }
        }
      }
    }

    function listShop(data) {
      var items,
          length;

      if ($.isArray(data)) {
        items = _template({
          shops: data
        });

        $list.append(items);
        $list = $list.children();
        radio = $list.filter(".we-radio").length > 0;

        if (!radio) {
          $list.checkbox("enable");
          length = $list.length;

          // 不自动全选
          if (!noAutoCheckAll) {
            $list.on("checked.we.checkbox", function () {
              if ($list.filter(".checked").length === length) {
                autoCheckAll = false;
                $checkAll.checkbox("check");
              }
            });
          }

          // 自动取消全选
          $list.on("unchecked.we.checkbox", function () {
            if ($list.filter(".checked").length !== length) {
              autoCheckAll = false;
              $checkAll.checkbox("uncheck");
            }
          });
        }

        initShop();
        $shop.collapse("toggle");
      }
    }

    $toggle.click(function () {

      if (shopLoaded) {
        initShop();
        $shop.collapse("toggle");
      } else {
        if (we.shop.data) {
          shopLoaded = true;
          listShop(we.shop.data);
        } else {
          // 异步加载门店列表
          $.ajax(data.url, {
            data: data,
            dataType: "json",
            success: function (response) {
              if (response.errcode === 0) {
                shopLoaded = true;
                we.shop.data = response.result; // 缓存以备选择门店使用
                listShop(response.result);
              } else {
                console.log(response.errmsg);
              }
            }
          });
        }
      }
    });

    $checkAll.on({
      "checked.we.checkbox": function () {
        autoCheckAll && $list.checkbox("check");
        autoCheckAll = true;
      },
      "unchecked.we.checkbox": function () {
        autoCheckAll && $list.checkbox("uncheck");
        autoCheckAll = true;
      }
    });

    $confirm.click(function () {
      var checkedIds = [],
          checkedList = [];

      if ($checkAll.hasClass("checked")) {
        checkedList.push("全部门店");
        checkedIds.push("all");
      } else {
        $list.filter(".checked").each(function () {
          var $this = $(this);

          checkedList.push($this.text());
          checkedIds.push($this.data("shopId"));
        });
      }

      if (checkedList.length) {
        $checkedList.html("<li>" + checkedList.join("</li><li>") + "</li>");
        $checkedIds.val(checkedIds.join()).data("shop", checkedList.join("&nbsp;&nbsp;")).trigger("change.we.shop");
        $shop.collapse("hide");
        $toggle.text("更改");
      } else {
        we.msg("请选择门店", 4);
      }
    });

    $cancel.click(function () {
      $shop.collapse("hide");
    });

    $shop.on("shown.bs.collapse", function () {
      var _this = this;

      $document.on("click.we.shop", function (e) {
        var target = e.target,
            hide = true;

        while (target.tagName !== "BODY") {
          if (target === _this) {
            hide = false;
            break;
          }

          target = target.parentNode;
        }

        if (hide) {
          $shop.collapse("hide");
        }
      });
    }).on("hidden.bs.collapse", function () {
      $document.off("click.we.shop");
    });
  };

  // 全局门店数据
  we.shop.data = null;

})(window, jQuery, WeLife);

(function (window, $, we) {

  "use strict";

  we.timeRange = function () {
    var $container = $(".we-time-range-group"),
        $toggle = $container.find(".time-range-toggle"),
        template = $container.find("#time-range-template").text(),
        $range = $container.find(".time-range"),
        $help = $range.find(".time-range-help"),
        $note = $range.find(".time-range-note"),
        $hours = $note.find(".time-range-hours"),
        $confirm = $range.find(".time-range-confirm"),
        $cancel = $range.find(".time-range-cancel"),
        $timeList = $range.find(".time-table-list"),
        $timeItems = $timeList.children(),
        $list = $container.find(".time-range-list"),
        existedTimeRanges = $list.data("existedTimeRanges"),
        activeCount = 0,
        startIndex = 0,
        endIndex = 0,
        startTime,
        endTime,
        $val,
        val;

    function createTimeRange(range) {
      var length = $list.children().length,
          $item = $(template);

      if (length > 0) {
        $item.find(".time-range-title").addClass("hide");
      }

      if (length >= 3) {
        $item.find(".btn-plus").addClass("hide");
      } else if (range) {
        $list.find(".btn-plus").addClass("hide");
      }

      if (range) {
        $item.find(".time-range-item").val(range);
      }

      $list.append($item);
    }

    function resetTimeRange() {
      activeCount = 0;
      startIndex = 0;
      endIndex = 0;
      startTime = "";
      endTime = "";
      $timeItems.removeClass("active enable");
      $help.removeClass("hide");
      $note.removeClass("show");
      $hours.empty();
    }

    if ($.isArray(existedTimeRanges) && existedTimeRanges.length) {
      $toggle.addClass("hide");
      $list.addClass("show");
      $.each(existedTimeRanges, function (i, range) {
        createTimeRange(range);
      });
    }

    $toggle.click(function () {
      $toggle.addClass("hide");
      $list.addClass("show");
      createTimeRange();
    });

    $list.on("click", "[data-toggle^='time.range']", function () {
      var $this = $(this),
          toggle = $this.data("toggle"),
          $adds,
          $tits;

      $val = null;

      switch (toggle) {
        case "time.range.val":
          $val = $this;
          $this.after($range);
          resetTimeRange();
          $range.addClass("show");

          break;

        case "time.range.add":
          resetTimeRange();
          createTimeRange();
          $this.addClass("hide");

          break;

        case "time.range.del":
          $list.after($range);
          $this.parent().remove();

          $adds = $list.find(".btn-plus");
          $tits = $list.find(".time-range-title");

          $tits.addClass("hide");
          $tits.first().removeClass("hide");

          $adds.addClass("hide");
          $adds.last().removeClass("hide");

          if (!$list.children().length) {
            $toggle.removeClass("hide");
            $list.removeClass("show");
          }

          break;
      }
    });

    $timeItems.each(function (i) {
      $(this).attr("data-index", i);
    });

    $timeList.on("click", "li", function () {
      var $this = $(this),
          cancalIndex = endIndex,
          i;

      if ($this.hasClass("active")) {
        return;
      }

      i = $this.data("index");

      if (activeCount === 0) {
        activeCount++;
        startIndex = i;

        $help.addClass("hide");
        $note.addClass("show");
      } else if (activeCount === 1) {
        activeCount++;

        if (i < startIndex) {
          endIndex = startIndex;
          startIndex = i;
        } else {
          endIndex = i;
        }

        $timeItems.slice(startIndex + 1, endIndex).addClass("enable");
      } else if (activeCount === 2) {
        if (i < startIndex) {
          $timeItems.slice(i + 1, startIndex).addClass("enable");
          $timeItems.slice(startIndex + 1, endIndex).removeClass("enable");
          endIndex = startIndex;
          startIndex = i;
        } else if (i > endIndex) {
          $timeItems.slice(endIndex, i).addClass("enable");
          endIndex = i;
        } else {
          if (i < (startIndex + endIndex) / 2) {
            $timeItems.slice(startIndex + 1, i + 1).removeClass("enable");
            cancalIndex = startIndex;
            startIndex = i;
          } else {
            $timeItems.slice(i, endIndex).removeClass("enable");
            endIndex = i;
          }
        }

        $timeItems.eq(cancalIndex).removeClass("active");
      }

      $this.addClass("active");

      startTime = $timeItems.eq(startIndex).text();
      endTime = endIndex ? $timeItems.eq(endIndex).text() : "";
      val = startTime + " - " + endTime;
      $hours.text(val);
    });

    $confirm.click(function () {
      if (startTime && endTime) {
        $val.val(val);
      }

      $range.removeClass("show");
    });

    $cancel.click(function () {
      $range.removeClass("show");
    });
  };

})(window, jQuery, WeLife);

(function (window, $, we) {

  "use strict";

  we.uploader = function (options) {
    var $container = options && typeof options.selector !== "undefined" ? options : $(".we-uploader"),
        $stepOne = $container.find(".upload-step-one"),
        $stepTwo = $container.find(".upload-step-two"),
        $stepThree = $container.find(".upload-step-three"),
        $progressbar = $container.find(".progressbar"),
        $percentage = $container.find(".percentage"),
        $preview = $container.find(".upload-preview"),
        $view = $container.find(".upload-view"),
        $uploaded = $container.find(".js-uploaded"),
        $uploadedId = $container.find(".js-uploaded-id"),
        $file = $container.find(":file"),
        $help = $container.find(".help-block"),
        fileName = $file.attr("name"),
        data = $file.data(),
        supportFormData = !!window.FormData,
        update = function (e) {
          var percentage;

          if (e.lengthComputable) {
            percentage = (e.loaded / e.total) * 100 + "%";
            $progressbar.width(percentage);
            $percentage.text(percentage);
          }
        },
        upload = function (file) {
          var xhr = new XMLHttpRequest(),
              formData;

          if (supportFormData) {
            formData = new FormData();
            formData.append(fileName, file);

            // $.each(data, function (name, value) {
            //   formData.append(name, value);
            // });

            xhr.upload.onprogress = update;

            $.ajax(data.url, {
              type: "POST",
              data: formData,
              dataType: "json",
              processData: false,  // 告诉jQuery不要去处理发送的数据
              contentType: false,   // 告诉jQuery不要去设置Content-Type请求头
              xhr: function () {
                return xhr;
              },
              beforeSend: function () {
                $stepOne.addClass("hide");
                $stepTwo.removeClass("hide");
                $preview.html(file.name + " <span>" + (Math.round(file.size / 1024) + "KB") + "<span");
              },
              success: function (response) {
                var result;

                if (response.errcode === 0) {
                  result = response.result;

                  $uploaded.val(result.url).data("imageId", result.id);
                  $uploadedId.val(result.id);
                  $view.html('<img src="' + result.url + '" alt="' + file.name + '">');

                  $stepTwo.addClass("hide");
                  $stepThree.removeClass("hide");

                  if ($.isFunction(options.done)) {
                    options.done(result);
                  }
                } else {
                  we.msg(response.errmsg, 5);
                  $stepOne.removeClass("hide");
                  $stepTwo.addClass("hide");
                  $preview.empty();
                }
              },
              complete: function () {
                $file.val(null); // 清空表单，避免再次选择同一个文件时，不触发change事件
              }
            });
          }
        };

    if (options === "destroy") {
      $file.off();
      we.popoverConfirm("destroy");
      return;
    }

    if (options && typeof options.selector !== "undefined") {
      options = arguments[1];
    }

    options = $.isPlainObject(options) ? options : {};

    $file.on("change", function () {
      var files = this.files,
          file,
          size,
          text;

      if (files && files.length > 0) {
        file = files[0];
        size = file.size / 1024;

        if (/image\/(jpg|jpeg|png|gif)/.test(file.type)) {
          if (size <= data.maxsize) {
            upload(file);
          } else {
            text = $help.data("size").replace(/\d+/, data.maxsize);
          }
        } else {
          text = $help.data("type");
        }

        if (text) {
          $help.text(text);
          $file.val(null); // 清空表单，避免再次选择同一个文件时，不触发change事件
        } else {
          $help.text("");
        }
      }
    });

    // 删除图片确认框
    we.popoverConfirm({
      namespace: options.namespace,
      message: "确定要删除该图片吗？",
      confirm: function () {
        $uploaded.val("");
        $uploadedId.val("");
        $view.empty();
        $preview.empty();
        $help.text("");
        $stepOne.removeClass("hide");
        $stepTwo.addClass("hide");
        $stepThree.addClass("hide");

        if ($.isFunction(options.fail)) {
          options.fail();
        }
      }
    });

    if ($uploaded.val()) {
      $stepOne.addClass("hide");
      $stepTwo.addClass("hide");
      $stepThree.removeClass("hide");
      $view.html('<img src="' + $uploaded.val() + '" alt="">');
    }
  };

})(window, jQuery, WeLife);

(function (window, $, we) {

  "use strict";

  we.assign = function (url, delay) {
    if (url && typeof url === "string") {
      delay = typeof delay === "number" ? delay : 2000;

      if (url === "reload") {
        we.reload(delay);
      } else {
        setTimeout(function () {
          window.location.assign(url);
        }, delay);
      }
    }
  };

  we.reload = function (delay) {
    delay = typeof delay === "number" ? delay : 2000;

    setTimeout(function () {
      window.location.reload();
    }, delay);
  };

  we.showError = function ($target, message) {
    var $container = $target.closest(".form-group").find(".control-label").next(),
        $highlight = $container.find(".highlight");

    if ($highlight.length) {
      if (message) {
        $target.focus();
        $highlight.text(message).removeClass("hide");
      } else {
        $highlight.empty().addClass("hide");
      }
    } else {
      $container.append('<p class="help-block highlight">' + (message || "") + '</p>');
    }
  };

  we.respond = function (response, options) {

    if (!$.isPlainObject(response)) {
      return;
    }

    switch (response.errcode) {
      case 0:
        we.msg(response.errmsg, 2);
        we.$main.find(".form-group .highlight").empty().addClass("hide");

        if (response.returnurl || response.redirect) {
          we.assign(response.returnurl || response.redirect);
        }

        if (options && $.isFunction(options.success)) {
          options.success();
        }

        break;

      case 1:
        we.msg(response.errmsg, 5);
        we.$main.find("form :submit").prop("disabled", false);
        break;

      case 100:
        we.msg(response.errmsg, 5);

        (function (messages) {
          var $form = we.$main.find("form");

          $.each(messages, function (name, message) {
            var $control = $form.find("[name^='" + name.replace("[]", "") + "']"),
                $modal;

            try {
              // 特殊规则：有冲突的活动，弹窗提示
              if (name === "activityExisted") {
                $modal = we.$main.find(".existed-modal");
                $modal.find(".modal-body").text(message.message);

                if (message.style === "continue") {
                  $modal.find(".btn-primary").removeClass("hide");
                  $modal.find(".btn-default").text("取消");
                } else if (message.style === "break") {
                  $modal.find(".btn-primary").addClass("hide");
                  $modal.find(".btn-default").text("确定");
                }

                $modal.modal("show");
                return;
              }
            } catch (e) {
              console.log(e.message);
            }

            if ($control.length) {
              we.showError($control, message);
            }
          });
        })(response.result);

        if (options && $.isFunction(options.error)) {
          options.error();
        }

        break;

      default:
        we.msg(response.errmsg, 5);
    }
  };

  require(["validate"], function () {
    $.fn.validate.setDefaults({
      showErrors: function (target, message) {
        we.showError($(target), message);
      },
      hideErrors: function (target) {
        we.showError($(target));
      }
    });
  });

  // WeLife Utilities
  // ---------------------------------------------------------------------------

  we.util = {
    back: function () {
      window.history.back();
    },

    // 验证码
    captcha: function () {
      var $this = $(this),
          originalSrc = $this.data("originalSrc");

      if (!$this.is("img")) {
        return;
      }

      if (!originalSrc) {
        $this.data("originalSrc", (originalSrc = $this.attr("src").replace(/\?.*?$/, "")));
      }

      $this.attr("src", (originalSrc + "?timestamp=" + (new Date()).getTime()));
    },

    toggle: function () {
      var data = $(this).data();

      if (data.target) {
        $(data.target).removeClass("hide");

        if (data.parent) {
          $(data.parent).addClass("hide");
        }
      }
    },

    formatNumber: function (number, decimal) {
      var digits = [],
          i;

      if (typeof decimal === "number") {
        decimal = number.toFixed(decimal).toString().substr(-(++decimal));
      } else {
        decimal = "";
      }

      number = parseInt(number, 10) || 0;
      number = number.toString().split("");

      for (i = number.length; i > 0; i -= 3) {
        digits.unshift(
          (number[i - 3] || "") +
          (number[i - 2] || "") +
          (number[i - 1] || "")
        );
      }

      return (digits.join() + decimal);
    }
  };

  $(document).on("click", "[data-click]", function () {
    var namespace = $(this).data("click"),
        controller = we[namespace] || we.util[namespace];

    if ($.isFunction(controller)) {
      controller.call(this);
    }
  });

})(window, jQuery, WeLife);

// 商家中心 -> 系统
// ===========================================================================

(function (window, $, we) {

  "use strict";

  we.user = {};

  // 登录
  // ---------------------------------------------------------------------------

  we.login = function () {
    var $scope = $(".user-login"),
        $form = $scope.find(".we-form");

    $form.submitter({
      done: function (response) {
        we.respond(response);
      }
    });
  };

  // 忘记密码 -> 验证身份
  // ---------------------------------------------------------------------------
  we.forgot = {};

  we.forgot.auth = function () {
    var $scope = $(".user-forgot-auth"),
        $form = $scope.find(".we-form"),
        $resend = $form.find(".we-resend > .btn"),
        $captcha = $form.find(".input-captcha"),
        originalText = $resend.text(),
        resendData = $resend.data(),
        resendSeconds = parseInt(originalText.replace(/\D+/, ""), 10),
        resendText = originalText.replace(/\d+/, ""),
        countdown = function () {
          var count = resendSeconds || 60,
              queue;

          $resend.addClass("disabled");

          queue = setInterval(function () {
            $resend.text((count--) + resendText);

            if (count <= 0) {
              clearInterval(queue);
              $resend.text(resendData.text).removeClass("disabled");
            }
          }, 1000);
        };

    countdown();

    $resend.click(function () {
      var $this = $(this);

      if ($this.hasClass("disabled")) {
        return;
      }

      $this.addClass("disabled");

      $.ajax(resendData.url, {
        type: "post",
        data: resendData,
        dataType: "json",
        success: function (response) {
          if (response.errcode === 0) {
            $captcha.focus();
            countdown();
          } else {
            we.msg(response.errmsg, 5);
          }
        }
      });
    });
  };

  // 修改密码
  // ---------------------------------------------------------------------------
  we.password = function () {
  };

})(window, jQuery, WeLife);

// 商家中心 -> 营销
// ===========================================================================

(function (window, $, we) {

  "use strict";

  var $scope = $(".mainbody"),
      $form = $scope.find(".we-form"),
      $name = $form.find(".input-name"),
      $coupon = $form.find(".coupon-list"),
      validates = {
        // 开卡消息非空验证
        name: function () {
          var value = $.trim($name.val()),
              $help = $name.closest(".form-group").find(".help-block");

          $name.val(value); // 去除首尾空格

          if (!value) {
            $help.removeClass("hide");
            $name.focus();
            return false;
          } else {
            $help.addClass("hide");
            return true;
          }
        },
        coupon: function () {
          if ($coupon.children().length === 0) {
            we.msg("请设置赠券", 4);
            return false;
          }

          return true;
        }
      };

  we.market = {};
  we.market._new_ = {};

  // 营销 -> 增加新顾客 -> 开卡关怀
  // ---------------------------------------------------------------------------

  we.market._new_.care = function () {
    var $scope = $(".market-new-care"),
        $step = $scope.find(".we-step"),
        $alert = $scope.find(".we-alert"),
        $form = $scope.find(".we-form"),
        $input = $form.find(".form-input"),
        $name = $input.find(".input-name"),
        $list = $input.find(".coupon-list"),
        $coupon = $input.find(".input-coupon"),
        $startDate = $input.find(".input-start-date"),
        $endDate = $input.find(".input-end-date"),
        $next = $form.find(".form-next"),
        $messageType = $next.find(".input-type"),
        $messageContent = $next.find(".input-content"),
        $output = $form.find(".form-output"),
        outputTemplate = $form.find(".form-output-template").text(),
        stepOneRequired = true,
        activityData = {},
        currentView;

    $scope.on("click", "[data-toggle^='activity']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("activity.", "");

      currentView = toggle;

      switch (toggle) {
        case "next":
          stepOneRequired = true;
          break;

        case "skip":
          stepOneRequired = false;
          $alert.addClass("hide");
          $step.find("li:eq(1)").addClass("active");
          $input.addClass("hide");
          $next.removeClass("hide");
          break;

        case "prev":
          $alert.removeClass("hide");
          $step.removeClass("hide").find("li:eq(1)").removeClass("active");
          $input.removeClass("hide");
          $next.addClass("hide");
          $output.addClass("hide");
          break;

        case "save":
          if (!validates.message()) {
            break;
          }

          if (stepOneRequired) {
            activityData.coupons = [];

            $coupon.val(function () {
              var result = [];

              $list.find("li").each(function () {
                var $this = $(this),
                    data = $(this).data();

                if (data.value) {
                  data = $.extend({}, data);
                  data.name = data.name.replace(/^\d+\u5143/, ""); // 将名称中的“**元”删除
                }

                activityData.coupons.push(data);
                data.count = $this.find(".coupon-input").val();
                result.push(data.id + "," + data.count);
              });

              return result.join(";");
            });

            activityData.name = $name.val();
            activityData.startDate = $startDate.val();
            activityData.endDate = $endDate.val();
          }

          activityData.messageType = $messageType.data("typeName");
          activityData.messageContent = $messageContent.data("content");

          $output.empty().html(_.template(outputTemplate, activityData));

          $step.addClass("hide");
          $next.addClass("hide");
          $output.removeClass("hide");
          break;

        case "confirm":
          $form.submitter("setDefaults", {
            disableAfterDone: true
          });

          break;

        case "modify":
          $step.removeClass("hide");
          $next.removeClass("hide");
          $output.addClass("hide");
          break;
      }
    });

    validates.message = function () {
      if (!$messageContent.val()) {
        we.msg("消息内容不能为空", 4);
        return false;
      }

      return true;
    }

    // 活动名称验证
    $name.validate({
      charCodeLength: true,
      trimOverflow: true,
      trim: true
    });

    we.popoverNotice($scope);
    we.couponEditor($scope);
    we.date($scope, {
      startDate: new Date(),
      endViewDate: (function (now) {
        // 默认显示的结束时间为下一年
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      })(new Date())
    });
    we.messageEditor($scope);

    $form.submitter({
      isValidated: function () {
        if (currentView === "next") {
          return validates.name() && $name.validate("validate") && validates.coupon();
        }

        return validates.message();
      },
      done: function (response) {
        we.respond(response, {
          success: function () {
            if (currentView === "next") {
              $alert.addClass("hide");
              $step.find("li:eq(1)").addClass("active");
              $input.addClass("hide");
              $next.removeClass("hide");
            }
          }
        });
      }
    });
  };

  // 营销 -> 增加新顾客 -> 填资料赠券
  // ---------------------------------------------------------------------------

  we.market._new_.fill = function () {
    var $scope = $(".market-new-fill"),
        $form = $scope.find(".we-form"),
        $input = $form.find(".form-input"),
        $name = $input.find(".input-name"),
        $list = $input.find(".coupon-list"),
        $coupon = $input.find(".input-coupon"),
        $restriction = $input.find(".input-restriction"),
        $output = $form.find(".form-output"),
        $existedModal = $scope.find(".existed-modal"),
        existed = $existedModal.data("existed"),
        outputTemplate = $form.find(".form-output-template").text(),
        activityData = {},
        currentView;

    if (existed) {
      $scope.find("button[data-toggle='activity.save']").attr("type", "button");
    }

    $scope.on("click", "[data-toggle^='activity']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("activity.", "");

      currentView = toggle;

      switch (toggle) {
        case "save":
          if (existed) {
            $existedModal.modal("show");
          }

          break;

        case "confirm":
          $form.submitter("setDefaults", {
            disableAfterDone: true
          });

          break;

        case "modify":
          $input.removeClass("hide");
          $output.addClass("hide");
          break;
      }
    });

    // 活动名称验证
    $name.validate({
      charCodeLength: true,
      trimOverflow: true,
      trim: true
    });

    we.popoverNotice($scope);
    we.couponEditor($scope);
    we.textEditor($scope);

    $form.submitter({
      isValidated: function () {
        if (existed) {
          return false;
        }

        return $name.validate("validate") && validates.coupon();
      },
      done: function (response) {
        we.respond(response, {
          success: function () {
            if (currentView === "save") {
              activityData.coupons = [];

              $coupon.val(function () {
                var result = [];

                $list.find("li").each(function () {
                  var $this = $(this),
                      data = $(this).data();

                  if (data.value) {
                    data = $.extend({}, data);
                    data.name = data.name.replace(/^\d+\u5143/, ""); // 将名称中的“**元”删除
                  }

                  activityData.coupons.push(data);
                  data.count = $this.find(".coupon-input").val();
                  result.push(data.id + "," + data.count);
                });

                return result.join(";");
              });

              activityData.name = $name.val();
              activityData.restriction = $restriction.val();

              $output.empty().html(_.template(outputTemplate, activityData));

              $input.addClass("hide");
              $output.removeClass("hide");
            }
          }
        });
      }
    });
  };

  // 营销 -> 增加新顾客 -> 给开卡未消费会员赠券
  // ---------------------------------------------------------------------------

  we.market._new_.remind = function () {
    var $scope = $(".market-new-remind"),
        $form = $scope.find(".we-form"),
        $input = $form.find(".form-input"),
        $name = $input.find(".input-name"),
        $list = $input.find(".coupon-list"),
        $coupon = $input.find(".input-coupon"),
        $date = $input.find(".input-date"),
        $time = $input.find(".input-time"),
        $output = $form.find(".form-output"),
        outputTemplate = $form.find(".form-output-template").text(),
        activityData = {},
        currentView;

    $scope.on("click", "[data-toggle^='activity']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("activity.", "");

      currentView = toggle;

      switch (toggle) {
        case "confirm":
          $form.submitter("setDefaults", {
            disableAfterDone: true
          });

          break;

        case "modify":
          $input.removeClass("hide");
          $output.addClass("hide");
          break;
      }
    });

    // 活动名称验证
    $name.validate({
      charCodeLength: true,
      trimOverflow: true,
      trim: true
    });

    we.couponEditor($scope);
    we.date($scope, {
      startDate: new Date()
    });
    we.shop($scope);

    $form.submitter({
      isValidated: function () {
        return $name.validate("validate") && validates.coupon();
      },
      done: function (response) {
        we.respond(response, {
          success: function () {
            if (currentView === "save") {
              activityData.coupons = [];

              $coupon.val(function () {
                var result = [];

                $list.find("li").each(function () {
                  var $this = $(this),
                      data = $(this).data();

                  if (data.value) {
                    data = $.extend({}, data);
                    data.name = data.name.replace(/^\d+\u5143/, ""); // 将名称中的“**元”删除
                  }

                  activityData.coupons.push(data);
                  data.count = $this.find(".coupon-input").val();
                  result.push(data.id + "," + data.count);
                });

                return result.join(";");
              });

              activityData.name = $name.val();
              activityData.date = $date.val();
              activityData.time = $time.val();

              $output.empty().html(_.template(outputTemplate, activityData));

              $input.addClass("hide");
              $output.removeClass("hide");
            }
          }
        });
      }
    });
  };

  // 营销 -> 增加新顾客 -> 给新会员赠券
  // ---------------------------------------------------------------------------

  we.market._new_.member = function ($otherScope) {
    var $scope = $otherScope || $(".market-new-member"),
        $form = $scope.find(".we-form"),
        $input = $form.find(".form-input"),
        $name = $input.find(".input-name"),
        $list = $input.find(".coupon-list"),
        $coupon = $input.find(".input-coupon"),
        $date = $input.find(".input-date"),
        $time = $input.find(".input-time"),
        $shop = $input.find(".input-shop"),
        $output = $form.find(".form-output"),
        outputTemplate = $form.find(".form-output-template").text(),
        activityData = {},
        currentView;

    $scope.on("click", "[data-toggle^='activity']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("activity.", "");

      currentView = toggle;

      switch (toggle) {
        case "confirm":
          $form.submitter("setDefaults", {
            disableAfterDone: true
          });

          break;

        case "modify":
          $input.removeClass("hide");
          $output.addClass("hide");
          break;
      }
    });

    // 活动名称验证
    $name.validate({
      charCodeLength: true,
      trimOverflow: true,
      trim: true
    });

    we.couponEditor($scope);
    we.date($scope, {
      startDate: new Date()
    });
    we.shop($scope);

    $form.submitter({
      isValidated: function () {
        return $name.validate("validate") && validates.coupon();
      },
      done: function (response) {
        we.respond(response, {
          success: function () {
            if (currentView === "save") {
              activityData.coupons = [];

              $coupon.val(function () {
                var result = [];

                $list.find("li").each(function () {
                  var $this = $(this),
                      data = $(this).data();

                  if (data.value) {
                    data = $.extend({}, data);
                    data.name = data.name.replace(/^\d+\u5143/, ""); // 将名称中的“**元”删除
                  }

                  activityData.coupons.push(data);
                  data.count = $this.find(".coupon-input").val();
                  result.push(data.id + "," + data.count);
                });

                return result.join(";");
              });

              activityData.name = $name.val();
              activityData.date = $date.val();
              activityData.time = $time.val();
              activityData.shop = $shop.closest(".form-group").hasClass("hide") ? "" : $shop.data("shop");

              $output.empty().html(_.template(outputTemplate, activityData));

              $input.addClass("hide");
              $output.removeClass("hide");
            }
          }
        });
      }
    });
  };

  we.market.old = {};

  // 营销 -> 稳定老顾客 -> 给活跃会员赠券
  // ---------------------------------------------------------------------------

  we.market.old.active = function () {
    we.market._new_.member($(".market-old-active")); // 与“给新会员赠券”相同
  };

  // 营销 -> 稳定老顾客 -> 给沉寂会员赠券
  // ---------------------------------------------------------------------------

  we.market.old.silent = function () {
    we.market._new_.member($(".market-old-silent")); // 与“给新会员赠券”相同
  };

  // 营销 -> 稳定老顾客 -> 给沉寂会员赠券
  // ---------------------------------------------------------------------------

  we.market.old.member = function () {
    we.market._new_.member($(".market-old-member")); // 与“给新会员赠券”相同
  };

  // 营销 -> 营销活动 -> 累计消费返券
  // ---------------------------------------------------------------------------
  we.market.sales = {};
  we.market.sales.count = function ($otherScope) {
    var $scope = $otherScope || $(".market-sales-count"),
        $alert = $scope.find(".we-alert"),
        $form = $scope.find(".we-form"),
        $input = $form.find(".form-input"),
        $name = $input.find(".input-name"),
        $type = $input.find(".input-type"),
        $amount = $input.find(".input-amount"),
        $list = $input.find(".coupon-list"),
        $coupon = $input.find(".input-coupon"),
        $timeRange = $input.find(".input-time-range"),
        $shop = $input.find(".input-shop"),
        $restriction = $input.find(".input-restriction"),
        $output = $form.find(".form-output"),
        outputTemplate = $form.find(".form-output-template").text(),
        activityData = {},
        currentView;

    $scope.on("click", "[data-toggle^='activity']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("activity.", "");

      currentView = toggle;

      switch (toggle) {
        case "confirm":
          $form.submitter("setDefaults", {
            disableAfterDone: true
          });

          break;

        case "modify":
          $input.removeClass("hide");
          $alert.removeClass("hide");
          $output.addClass("hide");
          break;
      }
    });

    // 活动名称验证
    $name.validate({
      charCodeLength: true,
      trimOverflow: true,
      trim: true
    });

    $amount.validate();
    $type.on("change", function () {
      if ($type.find(":selected").data("unit") === "次") {
        $amount.prop("max", 20).validate("update");
      } else {
        $amount.prop("max", 999999).validate("update");
      }
    });

    $restriction.validate({
      filter: function () {
        return $(this).data("text");
      }
    });

    we.popoverNotice($scope);
    we.couponEditor($scope);
    we.date($scope, {
      startDate: new Date(),
      endViewDate: (function (now) {
        // 默认显示的结束时间为下一年
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      })(new Date())
    });
    we.shop($scope, true); // true - 不自动选中全部门店
    we.textEditor($scope);

    $form.submitter({
      isValidated: function () {
        return $name.validate("validate") && $amount.validate("validate") && validates.coupon() && $restriction.validate("validate");
      },
      done: function (response) {
        we.respond(response, {
          success: function () {
            if (currentView === "save") {
              activityData.startDate = $input.find(".input-start-date").val();
              activityData.endDate = $input.find(".input-end-date").val();
              activityData.timeRange = "";

              if ($otherScope) {
                activityData.timeRange = (function () {
                  var timeRange = [];

                  $input.find(".time-range-item").each(function () {
                    timeRange.push($(this).val());
                  });

                  $timeRange.val(timeRange.join());

                  return timeRange.length ? timeRange.join(" / ") : "";
                })();
              }

              activityData.coupons = [];

              $coupon.val(function () {
                var result = [];

                $list.find("li").each(function () {
                  var $this = $(this),
                      data = $(this).data();

                  if (data.value) {
                    data = $.extend({}, data);
                    data.name = data.name.replace(/^\d+\u5143/, ""); // 将名称中的“**元”删除
                  }

                  activityData.coupons.push(data);
                  data.count = $this.find(".coupon-input").val();
                  result.push(data.id + "," + data.count);
                });

                return result.join(";");
              });

              activityData.name = $name.val();
              activityData.amount = $amount.val();

              if ($type.length) {
                activityData.amountUnit = $input.find(".condition-unit").text();
              }

              activityData.shop = $shop.closest(".form-group").hasClass("hide") ? "" : $shop.data("shop");
              activityData.restriction = $restriction.val();

              $output.empty().html(_.template(outputTemplate, activityData));

              $input.addClass("hide");
              $alert.addClass("hide");
              $output.removeClass("hide");
            }
          }
        });
      }
    });
  };

  // 营销 -> 营销活动 -> 消费返券
  // ---------------------------------------------------------------------------

  we.market.sales.spend = function () {
    we.market.sales.count($(".market-sales-spend")); // 与“累计消费返券”相同
    we.timeRange();
  };

  // 营销 -> 会员关怀 -> 会员赠券
  // ---------------------------------------------------------------------------
  we.market.member = {};

  we.market.member.all = function () {
    var $scope = $(".market-member-all"),
        $form = $scope.find(".we-form"),
        $input = $form.find(".form-input"),
        $name = $input.find(".input-name"),
        $list = $input.find(".coupon-list"),
        $coupon = $input.find(".input-coupon"),
        $date = $input.find(".input-date"),
        $time = $input.find(".input-time"),
        $shop = $input.find(".input-shop"),
        $output = $form.find(".form-output"),
        outputTemplate = $form.find(".form-output-template").text(),
        activityData = {},
        currentView;

    $scope.on("click", "[data-toggle^='activity']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("activity.", "");

      currentView = toggle;

      switch (toggle) {
        case "confirm":
          $form.submitter("setDefaults", {
            disableAfterDone: true
          });

          break;

        case "modify":
          $input.removeClass("hide");
          $output.addClass("hide");
          break;
      }
    });

    // 活动名称验证
    $name.validate({
      charCodeLength: true,
      trimOverflow: true,
      trim: true
    });

    we.couponEditor($scope);
    we.date($scope, {
      startDate: new Date()
    });
    we.shop($scope);

    $form.submitter({
      isValidated: function () {
        return $name.validate("validate") && validates.coupon();
      },
      done: function (response) {
        we.respond(response, {
          success: function () {
            if (currentView === "save") {
              activityData.coupons = [];

              $coupon.val(function () {
                var result = [];

                $list.find("li").each(function () {
                  var $this = $(this),
                      data = $(this).data();

                  if (data.value) {
                    data = $.extend({}, data);
                    data.name = data.name.replace(/^\d+\u5143/, ""); // 将名称中的“**元”删除
                  }

                  activityData.coupons.push(data);
                  data.count = $this.find(".coupon-input").val();
                  result.push(data.id + "," + data.count);
                });

                return result.join(";");
              });

              activityData.name = $name.val();
              activityData.date = $date.val();
              activityData.time = $time.val();
              activityData.shop = $shop.closest(".form-group").hasClass("hide") ? "" : $shop.data("shop");

              $output.empty().html(_.template(outputTemplate, activityData));

              $input.addClass("hide");
              $output.removeClass("hide");
            }
          }
        });
      }
    });
  };

  // 营销 -> 会员关怀 -> 生日赠券
  // ---------------------------------------------------------------------------

  we.market.member.birthday = function () {
    var $scope = $(".market-member-birthday"),
        $form = $scope.find(".we-form"),
        $input = $form.find(".form-input"),
        $name = $input.find(".input-name"),
        $list = $input.find(".coupon-list"),
        $coupon = $input.find(".input-coupon"),
        $restriction = $input.find(".input-restriction"),
        $output = $form.find(".form-output"),
        $existedModal = $scope.find(".existed-modal"),
        existed = $existedModal.data("existed"),
        outputTemplate = $form.find(".form-output-template").text(),
        activityData = {},
        currentView;

    if (existed) {
      $scope.find("button[data-toggle='activity.save']").attr("type", "button");
    }

    $scope.on("click", "[data-toggle^='activity']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("activity.", "");

      currentView = toggle;

      switch (toggle) {
        case "save":
          if (existed) {
            $existedModal.modal("show");
          }

          break;

        case "confirm":
          $form.submitter("setDefaults", {
            disableAfterDone: true
          });

          break;

        case "modify":
          $input.removeClass("hide");
          $output.addClass("hide");
          break;
      }
    });

    // 活动名称验证
    $name.validate({
      charCodeLength: true,
      trimOverflow: true,
      trim: true
    });

    we.popoverNotice($scope);
    we.couponEditor($scope);
    we.textEditor($scope);

    $form.submitter({
      isValidated: function () {
        if (existed) {
          return false;
        }

        return $name.validate("validate") && validates.coupon();
      },
      done: function (response) {
        we.respond(response, {
          success: function () {
            if (currentView === "save") {
              activityData.coupons = [];

              $coupon.val(function () {
                var result = [];

                $list.find("li").each(function () {
                  var $this = $(this),
                      data = $(this).data();

                  if (data.value) {
                    data = $.extend({}, data);
                    data.name = data.name.replace(/^\d+\u5143/, ""); // 将名称中的“**元”删除
                  }

                  activityData.coupons.push(data);
                  data.count = $this.find(".coupon-input").val();
                  result.push(data.id + "," + data.count);
                });

                return result.join(";");
              });

              activityData.name = $name.val();
              activityData.restriction = $restriction.val();

              $output.empty().html(_.template(outputTemplate, activityData));

              $input.addClass("hide");
              $output.removeClass("hide");
            }
          }
        });
      }
    });
  };

  // 营销 -> 券管理
  // ---------------------------------------------------------------------------
  we.coupon = {};

  we.coupon.manage = function () {
    var $scope = $(".coupon-manage"),
        $list = $scope.find(".voucher-list"),
        $modal = $scope.find(".voucher-modal"),
        $detail = $modal.find(".voucher-detail"),
        _template = _.template($modal.find("#voucher-detail-template").text());

    $list.on("click", "[data-toggle='voucher.detail']", function (e) {
      var data = $(this).closest("li").data();

      e.preventDefault();

      data = $.extend({}, data); // 复制一份，避免改变原对象
      data.name = data.value ? data.name.replace(/^\d+\u5143/, "") : data.name, // 将名称中的“**元”删除
      data.term = data.term.split(/\s*\,\s*/);

      $detail.html(_template(data));
      $modal.modal("show");
    });

    // 删除券确认框
    we.popoverConfirm({
      message: "确定要删除此券么？",
      confirm: function () {
        var $this = $(this),
            id = $this.data("id");

        // 进行删除操作
        $.ajax(we.DEFAULTS.ajaxDeleteUrl, {
          async: false,
          type: "POST",
          data: {
            id: id
          },
          dataType: "json",
          success: function (response) {
            we.respond(response, {
              success: function () {
                $this.closest("li").remove();
              }
            });
          }
        });
      }
    });
  };

  // 营销 -> 券管理 -> 创建券
  // ---------------------------------------------------------------------------

  we.coupon.create = function () {
    var $scope = $(".coupon-create"),
        $form = $scope.find(".we-form"),
        $input = $form.find(".form-input"),
        $value = $form.find(".input-value"),
        $namePrefix = $form.find(".input-name-prefix"),
        $name = $form.find(".input-name"),
        $term = $form.find(".input-term"),
        $absolute = $form.find(".term-absolute"),
        $relative = $form.find(".term-relative"),
        $count = $relative.find(".input-term-count"),
        $shop = $form.find(".input-shop"),
        $restriction = $form.find(".input-restriction"),
        $output = $form.find(".form-output"),
        outputTemplate = $form.find(".form-output-template").text(),
        couponData = {};

    validates.count = function () {
      if ($relative.is(":visible")) {
        return $count.validate("validate");
      }

      return true;
    };

    if ($relative.is(":visible")) {
      $relative.data("active", true);
      $count.validate();
    }

    // 激活日历控件
    if ($absolute.is(":visible")) {
      $absolute.data("active", true);
      we.date($scope, {
        startDate: new Date()
      });
    }

    $scope.on("click", "[data-toggle^='coupon']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("coupon.", "");

      switch (toggle) {
        case "relative":
          $relative.removeClass("hide");
          $absolute.addClass("hide");

          if (!$relative.data("active")) {
            $relative.data("active", true);
            $count.validate();
          }

          $relative.parent().find(".highlight").addClass("hide");

          break;

        case "absolute":
          $relative.addClass("hide");
          $absolute.removeClass("hide");

          // 激活日历控件
          if (!$absolute.data("active")) {
            $absolute.data("active", true);
            we.date($scope, {
              startDate: new Date()
            });
          }

          $absolute.parent().find(".highlight").addClass("hide");

          break;

        case "save":
          if ($value.length && !$value.validate("validate")) {
            return;
          }

          if (!($name.validate("validate") && validates.count() && $restriction.validate("validate"))) {
            return;
          }

          // 转换有效期
          $term.val(function () {
            var term = $(this).val();

            if (!$relative.hasClass("hide")) {
              term = [
                "relative",
                $relative.find(".input-term-count").val(),
                $relative.find(".input-term-unit").val()
              ];
            } else if (!$absolute.hasClass("hide")) {
              term = [
                "absolute",
                $absolute.find(".input-term-start").val(),
                $absolute.find(".input-term-end").val()
              ];
            }

            return $.isArray(term) ? term.join() : term;
          });

          couponData.value = $value.val();
          couponData.name = $name.val();
          couponData.term = $term.val().split(/\s*\,\s*/);
          couponData.shop = $shop.closest(".form-group").hasClass("hide") ? "" : $shop.data("shop");
          couponData.restriction = $restriction.val();
          $output.html(_.template(outputTemplate, couponData));
          $input.addClass("hide");
          $output.removeClass("hide");
          break;

        case "cancel":
          $input.removeClass("hide");
          $output.addClass("hide");
          break;
      }
    });

    $value.validate();
    $value.on("keyup change", function () {
      var value = parseInt($(this).val(), 10);

      $namePrefix.text(value && value > 0 ? (value + "元") : "");
    });

    // 券名称验证
    $name.validate({
      charCodeLength: true,
      trimOverflow: true,
      trim: true
    });

    $restriction.validate({
      filter: function () {
        return $(this).data("text");
      }
    });

    we.popoverNotice($scope);
    we.shop($scope);
    we.textEditor($scope);

    $form.submitter({
      disableAfterDone: true,
      isValidated: function () {
        return $name.validate("validate") && $restriction.validate("validate");
      },
      done: function (response) {
        we.respond(response, {
          error: function () {
            $scope.find("[data-toggle='coupon.cancel']").click();
          }
        });
      }
    });
  };

  // 营销 -> 活动管理
  // ---------------------------------------------------------------------------
  we.activity = {};

  we.activity.manage = function () {
    var $scope = $(".activity-manage"),
        $list = $scope.find(".activity-list"),
        $modal = $scope.find(".activity-modal"),
        $detail = $modal.find(".activity-detail"),
        template = _.template($modal.find("#activity-detail-template").text());

    $list.on("click", "[data-toggle='activity.detail']", function (e) {
      var data = $(this).closest("tr").data();

      e.preventDefault();

      data.message = data.message || "";
      data.shop = data.shop || "";
      $detail.html(template(data));
      $modal.modal("show");
    });

    // 删除活动确认框
    we.popoverConfirm({
      message: "确定删除该活动？",
      confirm: function () {
        var $this = $(this),
            id = $this.data("id");

        // 进行删除操作
        $.ajax(we.DEFAULTS.ajaxDeleteUrl, {
          async: false,
          type: "POST",
          data: {
            id: id
          },
          dataType: "json",
          success: function (response) {
            we.respond(response, {
              success: function () {
                $this.closest("tr").remove();
              }
            });
          }
        });
      }
    });

    // 终止活动确认框
    we.popoverConfirm({
      namespace: ".terminate", // 第二次调用，添加命名空间
      message: "确定终止该活动？",
      confirm: function () {
        var $this = $(this),
            id = $this.data("id");

        // 进行终止操作
        $.ajax(we.DEFAULTS.ajaxTerminateUrl, {
          async: false,
          type: "POST",
          data: {
            id: id
          },
          dataType: "json",
          success: function (response) {
            if (response.errcode === 0) {
              window.location.reload();
            } else {
              console.log(response.errmsg);
            }
          }
        });
      }
    });
  };

})(window, jQuery, WeLife);

// 商家中心 -> 群发消息
// ===========================================================================

(function (window, $, we) {

  "use strict";

  // 群发消息 -> 微信群发
  // ---------------------------------------------------------------------------

  we.message = {};

  we.message.home = function () {
    var $scope = $(".message-home"),
        $form = $scope.find("form"),
        $input = $form.find(".form-input"),
        $date = $form.find(".input-date"),
        $time = $form.find(".input-time"),
        $content = $form.find(".input-content"),
        $editable = $form.find(".editor-input"),
        $remainMessageNumber = $form.find(".send-remain-note > b"),
        $save = $form.find("[data-toggle='message.save']"),
        $output = $form.find(".form-output"),
        _template = _.template($form.find(".form-output-template").text()),
        outputData = {};

    function isValidContent() {
      console.log($content.val());

      if (!$content.val()) {
        we.msg("消息内容不能为空", 4);
        return false;
      }

      if ($editable.prop("contenteditable") === "true" && !$editable.data("valid")) {
        we.msg("消息内容字数超出限制", 4);
        return false;
      }

      return true;
    }

    $scope.on("click", "[data-toggle^='message']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("message.", "");

      if ($this.hasClass("disabled") || $this.prop("disabled")) {
        return;
      }

      switch (toggle) {
        case "save":
          if (!isValidContent()) {
            break;
          }

          outputData.date = $date.val();
          outputData.time = $time.val();
          outputData.content = $content.data("content");
          $output.empty().html(_template(outputData));

          $input.addClass("hide");
          $output.removeClass("hide");
          break;

        case "cancel":
          $input.removeClass("hide");
          $output.addClass("hide");
          break;
      }
    });

    we.messageEditor($scope);
    we.date($scope, {
      startDate: new Date()
    });

    // 实时判断当前月份剩余可发送消息数量
    // "changeDate"为jQuery日历插件事件
    $date.on("changeDate", function () {
      var $this = $(this);

      $.ajax($this.data("url"), {
        type: "POST",
        data: {
          date: $this.val(),
          oldDate: $this.data("oldDate")
        },
        dataType: "json",
        success: function (response) {
          var number;

          if (response.errcode === 0) {
            number = response.result.number;

            if (number && number > 0) {
              $save.removeClass("disabled").prop("disabled", false);
            } else {
              if (response.result.savable) {
                $save.removeClass("disabled").prop("disabled", false);
              } else {
                $save.addClass("disabled").prop("disabled", true);
                number = 0;
              }
            }

            $remainMessageNumber.text(number);
          } else {
            console.log(response.errmsg);
          }
        }
      });
    });

    $form.submitter({
      disableAfterDone: true,
      isValidated: function () {
        return isValidContent();
      },
      done: function (response) {
        we.respond(response);
      }
    });
  };

  // 群发消息 -> 微信群发 -> 消息管理
  // ---------------------------------------------------------------------------

  we.message.manage = function () {
    var $scope = $(".message-manage"),
        $modal = $scope.find(".message-modal"),
        $detail = $modal.find(".message-detail"),
        _template = _.template($modal.find(".message-detail-template").text());

    $scope.on("click", "[data-toggle^='message']", function (e) {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("message.", ""),
          $parent;

      e.preventDefault();

      switch (toggle) {
        case "detail":
          $parent = $this.closest("tr");
          data = $parent.data();

          if (data.type > 0) {
            data.content = $parent.find(".message-content").html();
          }

          $detail.empty().html(_template(data));
          $modal.modal("show");
          break;
      }
    });

    // 删除消息确认框
    we.popoverConfirm({
      message: "确定删除该消息？",
      confirm: function () {
        var $this = $(this),
            data = $this.data();

        // 进行删除操作
        $.ajax(data.url, {
          async: false,
          type: "POST",
          data: {
            id: data.id
          },
          dataType: "json",
          success: function (response) {
            if (response.errcode === 0) {
              window.location.reload();
            } else {
              console.log(response.errmsg);
            }
          }
        });
      }
    });
  };

  // 群发消息 -> 短信群发
  // ---------------------------------------------------------------------------

  we.message.sms = function () {
    var $scope = $(".message-sms"),
        $form = $scope.find("form"),
        $radios = $form.find(".radio-group > .we-radio"),
        $dateGroup = $form.find(".we-date-group"),
        $date = $form.find(".input-date"),
        $time = $form.find(".input-time"),
        $shop = $form.find(".input-shop"),
        $content = $form.find(".input-content"),
        $charge = $form.find(".sms-charge"),
        $expectedRate = $charge.find("[data-expicted='rate']"),
        $expectedBalance = $charge.find("[data-expicted='balance']"),
        $expectedPeople = $charge.find("[data-expicted='people']"),
        $expectedCount = $charge.find("[data-expicted='count']"),
        $expectedTotal = $charge.find("[data-expicted='total']"),
        $expectedCharge = $charge.find("[data-expicted='charge']"),
        expected = {
          totalMembers: $expectedPeople.data("totalMembers") || 0,
          rate: parseFloat($expectedRate.text()) || 0,
          balance: parseFloat($expectedBalance.text()) || 0,
          people: parseInt($expectedPeople.text(), 10) || 0,
          count: 0,
          total: 0,
          charge: 0
        },
        $notice = $form.find(".sms-notice"),
        $save = $form.find("[data-toggle='message.save']"),
        $modal = $scope.find(".message-modal"),
        $detail = $modal.find(".message-detail"),
        detail = $modal.find("#message-detail-template").text();

    function updateCount(count) {
      if (count) {
        expected.count = count;
      } else {
        count = expected.count;
      }

      expected.total = expected.people * count;
      expected.charge = (expected.total * expected.rate).toFixed(2); // 保留2位小数

      $expectedCount.text(count);
      $expectedTotal.text(expected.total);
      $expectedCharge.text(expected.charge);

      if (expected.charge > expected.balance) {
        $save.addClass("disabled");
        $notice.removeClass("hide");
      } else {
        $save.removeClass("disabled");
        $notice.addClass("hide");
      }
    }

    function getShopMembers(shopIds) {
      var data;

      if (shopIds) {
        $expectedPeople.data("value", shopIds);
      }

      data = $expectedPeople.data();
      data[data.name] = data.value;

      $.ajax(data.url, {
        async: false,
        type: "POST",
        data: data,
        dataType: "json",
        success: function (response) {
          var members;

          try {
            members = response.result.members || 0;
            expected.people = members;
            $expectedPeople.text(members);
            updateCount();
          } catch (e) {
            console.log(e.message);
          }
        }
      });
    }

    we.date($scope, {
      startDate: new Date()
    });

    we.shop($scope);

    getShopMembers();
    $shop.on("change.we.shop", function () {
      getShopMembers($shop.val());
    });

    $radios.on("checked.we.radio", function () {
      if ($(this).data("value") === 1) {
        $dateGroup.removeClass("hide");
      } else {
        $dateGroup.addClass("hide");
      }
    });

    // 短信内容编辑框
    (function () {
      var $smsbox = $(".smsbox"),
          $input = $smsbox.find(".smsbox-input"),
          $inputCounter = $smsbox.find("[data-counter='input']"),
          maxlength = parseInt($input.attr("maxlength"), 10),
          inputText = $inputCounter.data("text"),
          $msgCounter = $smsbox.find("[data-counter='msg']"),
          msgText = $msgCounter.data("text"),
          msgLength = $msgCounter.data("msgLength");

      if (!isNaN(maxlength)) {
        $input.on("keyup blur", function () {
          var val = $input.val(),
              length = val.length,
              count;

          if (length > maxlength) {
            $input.val(val.substr(0, maxlength));
            return;
          }

          $input.data("count", (count = Math.ceil(length / msgLength)));
          $inputCounter.text(inputText.replace("%s", (maxlength - length)));
          $msgCounter.text(msgText.replace("%s", count));

          updateCount(count);
        });
      }
    })();

    $scope.on("click", "[data-toggle^='message']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("message.", "");

      switch (toggle) {
        case "save":
          if (!$content.validate("validate")) {
            break;
          }

          data = {
            content: $content.val(),
            people: expected.people,
            count: expected.count
          };

          data.total = data.people * data.count;
          data.charge = data.total * 0.1;

          if ($radios.filter(".checked").data("value") === 0) {
            data.time = "立即发送";
          } else {
            data.time = [$date.val(), $time.val()].join(" ");
          }

          $detail.html(_.template(detail, data));
          $modal.modal("show");
          break;
      }
    });

    $form.submitter({
      isValidated: function () {
        return true;
      },
      done: function (response) {
        we.respond(response, {
          success: function () {
            $modal.modal("hide");
          }
        });
      }
    });
  };

  // 群发消息 -> 短信群发 -> 消息管理
  // ---------------------------------------------------------------------------

  we.message.sms.manage = function () {
    var $scope = $(".message-sms-manage"),
        $modal = $scope.find(".message-modal"),
        $detail = $modal.find(".message-detail"),
        detail = $modal.find("#message-detail-template").text();


     $scope.on("click", "[data-toggle^='message']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("message.", "");

      switch (toggle) {
        case "detail":
          $detail.html(_.template(detail, $this.closest("tr").data()));
          $modal.modal("show");
          break;
      }
    });

    // 删除消息确认框
    we.popoverConfirm({
      message: "确定要删除么？",
      confirm: function () {
        var $this = $(this),
            data = $this.data();

        // 进行删除操作
        $.ajax(data.url, {
          async: false,
          type: "POST",
          data: {
            id: data.id
          },
          dataType: "json",
          success: function (response) {
            we.respond(response, {
              success: function () {
                $this.closest("tr").remove();
              }
            });
          }
        });
      }
    });
  };

  // 群发消息 -> 短信充值
  // ---------------------------------------------------------------------------

  we.message.sms.recharge = function () {
    var $scope = $(".message-sms-recharge"),
        $form = $scope.find("form"),
        $amount = $form.find(".input-amount"),
        $payments = $form.find(".input-payment"),
        $modal = $form.find(".recharge-modal"),
        $detail = $modal.find(".recharge-detail"),
        detail = $modal.find("#recharge-detail-template").text();

    $amount.validate();

    $scope.on("click", "[data-toggle^='recharge']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("recharge.", "");

      switch (toggle) {
        case "preview":
          if (!$amount.validate("validate")) {
            break;
          }

          data = {
            amount: $amount.val(),
            payment: $payments.filter(".checked").data("payment")
          }

          $detail.html(_.template(detail, data));
          $modal.modal("show");
          break;
      }
    });

    $form.submitter({
      isValidated: function () {
        return $amount.validate("validate");
      },
      done: function (response) {
        we.respond(response, {
          success: function () {
            $modal.modal("hide");
          }
        });
      }
    });
  };

  // 群发消息 -> 短信充值
  // ---------------------------------------------------------------------------

  we.message.sms.invoice = function () {
    var $scope = $(".message-sms-invoice"),
        $form = $scope.find("form");

    $form.submitter({
      done: function (response) {
        we.respond(response);
      }
    });
  };

  // 群发消息 -> 素材管理
  // ---------------------------------------------------------------------------
  we.material = {};
  we.material.manage = function () {
    // var $scope = $(".material-manage");

    we.popoverConfirm({
      message: "确定删除该素材？",
      confirm: function () {
        var $this = $(this),
            data = $this.data();

        // 进行删除操作
        $.ajax(data.url, {
          async: false,
          type: "POST",
          data: {
            id: data.id
          },
          dataType: "json",
          success: function (response) {
            if (response.errcode === 0) {
              window.location.reload();
            } else {
              console.log(response.errmsg);
            }
          }
        });
      }
    });

    // 编辑已被使用素材确认框
    we.popoverConfirm({
      namespace: ".edit", // 第二次调用，添加命名空间
      message: "确定编辑该素材？",
      confirm: function () {
        var $this = $(this),
            url = $this.data("url") || $this.attr("href");

        if (url) {
          window.location.assign(url);
        }
      }
    });
  };

  // 群发消息 -> 创建图文消息
  // ---------------------------------------------------------------------------

  we.material.create = function () {
    var $scope = $(".material-create"),
        $view = $scope.find(".material"),
        _data = $view.data(),
        baseOffsetTop = $view.offset().top,
        // 图文消息类型：5为单条图文，6为多条图文
        materialType = $view.find(".material-item").length > 0 ? 5 : 6,
        materialMiniTemplate = $view.find(".material-mini-template").text(),
        $form = $scope.find("form"),
        $materialEditor = $form.find(".material-editor"),
        $title = $form.find("#inputTitle"),
        $image = $form.find("#inputImage"),
        $imageId = $form.find("#inputImageId"),
        $imageFile = $form.find(".we-file > :file"),
        $imageTitle = $form.find(".image-title"),
        $thumbTitle = $form.find(".thumb-title"),
        $uploadStepOne = $form.find(".upload-step-one"),
        $uploadStepThree = $form.find(".upload-step-three"),
        $visible = $form.find("#inputVisible"),
        $materialSummaryToggle = $form.find(".material-summary-toggle"),
        $materialSummary = $form.find(".material-summary"),
        $summary = $form.find("#inputSummary"),
        $content = $form.find("#inputContent"),
        $autoSaveInfo = $form.find(".auto-save-info"),
        $materialLinkToggle = $form.find(".material-link-toggle"),
        $materialLink = $form.find(".material-link"),
        $link = $form.find("#inputLink"),
        materialSaved = false,
        materialChanged = false,
        params = {
          title: $title.attr("name"),
          image: $image.attr("name"),
          imageId: $imageId.attr("name"),
          visible: $visible.attr("name"),
          summary: $summary.attr("name"),
          content: $content.attr("name"),
          link: $link.attr("name")
        },
        $active = $view.find(".active"),
        ueditor,
        renderView = function () {
          var toString = function (s) {
                if (typeof s === "number" || typeof s === "boolean") {
                  s = String(s); // 例如：0 -> "0", false -> "false"
                } else if (typeof s === "object" && s !== null) {
                  s = $.isFunction(s.toString) ? s.toString() : s;
                }

                return s || "";
              };

          // 将当前编辑中的素材元素上的数据渲染视图中
          $view.find(".material-unit").each(function () {
            var $this = $(this),
                data = $this.data();

            $this.find("[data-view='title']").text(function () {
              var title = toString(data[params.title]);

              return title ? title : $(this).attr("placeholder");
            });

            $this.find("[data-view='summary']").html(function () {
              var summary = toString(data[params.summary]);

              return summary ? summary.replace(/[\r\n]+/img, "<br>") : "";
            });

            $this.find("[data-view='image']").html(function () {
              var url = toString(data[params.image]);

              return url ? '<img src="' + url + '">' : "";
            });
          });
        },
        renderForm = function () {
          // 将当前编辑中的素材元素上的数据渲染表单中
          var data = $active.data(),
              title = data[params.title],
              image = data[params.image],
              imageId = data[params.imageId],
              visible = data[params.visible],
              summary = data[params.summary],
              content = data[params.content],
              link = data[params.link],
              thumbnail = $active.hasClass("material-mini"),
              img = '<img src="' + image + '" alt="">';

          if (!data) {
            return;
          }

          $materialEditor.css("marginTop", $active.offset().top - baseOffsetTop);

          $title.val(title);

          $imageTitle.toggleClass("hide", thumbnail);
          $thumbTitle.toggleClass("hide", !thumbnail);

          $uploadStepOne.toggleClass("hide", !!image);
          $uploadStepThree.toggleClass("hide", !image);
          $image.val(image);
          $imageId.val(imageId);

          if (image) {
            $uploadStepThree.find(".upload-view").html(img);
          } else {
            $uploadStepOne.find(".help-block").empty();
            $uploadStepThree.find(".upload-view").empty();
          }

          if (thumbnail) {
            $imageFile.data("maxsize", 20);
          } else {
            $imageFile.data("maxsize", 50);
          }

          $visible.parent().toggleClass("checked", visible);
          $visible.prop("checked", visible);

          $materialSummaryToggle.toggleClass("hide", !!summary);
          $materialSummary.toggleClass("hide", !summary);
          $summary.val(summary);

          $content.val(content);
          ueditor.setContent(content); // 更新编辑器内容

          $materialLinkToggle.toggleClass("hide", !!link);
          $materialLink.toggleClass("hide", !link);
          $link.val(link);
        },
        updateData = function () {
          // 同步表单内容到当前编辑中的素材元素上
          var formData = $form.serializeArray();

          $.each(formData, function (i, field) {
            if (field.value === "on") {
              field.value = true;
            }

            $active.data(field.name, field.value);
          });

          $active.data(params.visible, !!$visible.prop("checked"));
        },
        storage = {
          localStorage: window.localStorage || {
            getItem: $.noop,
            setItem: $.noop,
            removeItem: $.noop
          },
          token: we.DEFAULTS.token || "com.dianping.welife",
          formatDate: function (date) {
            var now = new Date(date),
                time = [
                  now.getHours(),
                  now.getMinutes(),
                  now.getSeconds()
                ];

            date = [
              now.getFullYear(),
              now.getMonth() + 1,
              now.getDate()
            ];

            date[1] = date[1] < 10 ? ("0" + date[1]) : date[1];
            date[2] = date[2] < 10 ? ("0" + date[2]) : date[2];
            time[0] = time[0] < 10 ? ("0" + time[0]) : time[0];
            time[1] = time[1] < 10 ? ("0" + time[1]) : time[1];
            time[2] = time[2] < 10 ? ("0" + time[2]) : time[2];

            return date.join("/") + " " + time.join(":");
          },
          getData: function () {
            var data = this.localStorage.getItem("localMaterial");

            try {
              if (typeof data === "string") {
                data = JSON.parse(data);
              }
            } catch (e) {
              console.log(e.message);
            }

            data = $.isPlainObject(data) ? data : {};

            console.log("Get: ", data);

            return data;
          },
          setData: function (data) {
            console.log("Set: ", data);

            try {
              // TODO：清空旧版本数据
              if (data.single.messages || data.multiple.messages) {
                data = {};
              }

              if (typeof data !== "string") {
                data = JSON.stringify(data);
              }
            } catch (e) {
              console.log(e.message);
            }

            this.localStorage.setItem("localMaterial", data);
          },
          getOriginalMaterial: function () {
            var originalMaterial;

            if (materialType === 5) {
              originalMaterial = {
                messages: [
                  {
                    link: "",
                    content: "",
                    visible: true,
                    image: "",
                    title: "",
                    imageId: "",
                    summary: ""
                  }
                ]
              }
            } else {
              originalMaterial = {
                messages: [
                  {
                    link: "",
                    content: "",
                    visible: true,
                    image: "",
                    title: "",
                    imageId: ""
                  },
                  {
                    link: "",
                    content: "",
                    visible: true,
                    image: "",
                    title: "",
                    imageId: ""
                  }
                ]
              }
            }

            return originalMaterial;
          },
          setMaterial: function () {
            var $material = $view.find(".material-unit"),
                localMaterial = this.getData(),
                now = new Date(),
                formatedDate = this.formatDate(now),
                localData,
                type,
                mode,
                message;

            // 如果为空（undefined），或者不是同一个用户，则设置为默认值
            if (localMaterial.token !== this.token) {
              localMaterial = {
                // 用户独立令牌，由后台根据用户ID输出
                token: this.token,
                // 单条图文
                single: {
                  // 新建图文
                  create: this.getOriginalMaterial(),
                  // 编辑图文
                  modify: this.getOriginalMaterial()
                },
                // 多条图文
                multiple: {
                  create: this.getOriginalMaterial(),
                  modify: this.getOriginalMaterial()
                }
              }
            }

            // 先同步数据
            updateData();

            // 默认没有更改
            materialChanged = false;

            if (materialType === 5) {
              type = "single";
            } else {
              type = "multiple";
            }

            if (_data.id) {
              mode = "modify";
            } else {
              mode = "create";
            }

            localData = localMaterial[type];

            if ($.isPlainObject(localData)) {
              localData = localData[mode];
            } else {
              localMaterial[type] = {
                create: this.getOriginalMaterial(),
                modify: this.getOriginalMaterial()
              }

              localData = localMaterial[type][mode];
            }

            if (!$.isPlainObject(localData)) {
              localData = localMaterial[type][mode] = {
                messages: []
              }
            }

            $material.each(function (i) {
              var data = $(this).data();

              if (!_.isEqual(data, localData.messages[i])) {
                materialChanged = true;
                localData.id = _data.id;
                localData.date = now;
                localData.messages[i] = data;
              }
            });

            // 当素材条数与缓存条数不一致时，也是有修改（删除了）
            if ($material.length < localData.messages.length) {
              materialChanged = true;

              // 仅保留有效素材，剔除历史遗留素材
              localData.messages = localData.messages.slice(0, $material.length);
            }

            // 总是缓存
            this.setData(localMaterial);

            if (materialChanged) {
              message = "（自动保存：" + formatedDate + "）";
              $autoSaveInfo.text(message);
            }

            return message;
          },
          removeMaterial: function () {
            var localMaterial = this.getData(),
                type,
                mode;

            if (localMaterial.token === this.token) {
              if (materialType === 5) {
                type = "single";
              } else {
                type = "multiple";
              }

              if (_data.id) {
                mode = "modify";
              } else {
                mode = "create";
              }

              if ($.isPlainObject(localMaterial[type])) {
                localMaterial[type][mode] = this.getOriginalMaterial();
              }

              this.setData(localMaterial);
              $autoSaveInfo.empty();
            }
          },
          restoreMaterial: function () {
            var localMaterial = this.getData(),
                newMiniMaterial = "",
                localData,
                storedDate,
                restored,
                length,
                type,
                mode;

            if (localMaterial.token === this.token) {
              if (materialType === 5) {
                type = "single";
              } else {
                type = "multiple";
              }

              if (_data.id) {
                mode = "modify";
              } else {
                mode = "create";
              }

              localData = localMaterial[type];

              if ($.isPlainObject(localData)) {
                localData = localData[mode];
              }

              if (!$.isPlainObject(localData)) {
                localData = {
                  messages: []
                }
              }

              // 仅在新建或者编辑同一个素材时恢复(无id或id相等)
              if (!_data.id || _data.id === localData.id) {

                // 多条图文，补全素材
                if (materialType === 6) {
                  length = localData.messages.length;

                  if (length > 8) {
                    length = 8; // 过滤历史遗留的缓存
                  }

                  if (length === 8) {
                    // 存在8条消息，则隐藏新增按钮
                    $view.find(".material-add").addClass("hide");
                  }

                  // 重要：减去已经存在的素材数量
                  length -= $view.find(".material-unit").length;

                  while (length > 0) {
                    newMiniMaterial += materialMiniTemplate;
                    length--;
                  }

                  $view.find(".material-add").before(newMiniMaterial);
                }

                $view.find(".material-unit").each(function (i) {
                  var $this = $(this),
                      data = localData.messages[i];

                  if ($.isPlainObject(data)) {
                    restored = true;
                    storedDate = localData.date;

                    $.each(data, function (name, value) {
                      $this.data(name, value);
                    });
                  }
                });
              }

              if (restored && storedDate) {
                storedDate = this.formatDate(storedDate);

                $autoSaveInfo.html(function () {
                  return "<span>（已载入 " + storedDate + " 的草稿）</span><a href=\"javascript:void(0);\" data-toggle=\"material.reset\">取消</a>";
                });
              }
            }
          },
          autoSaveMaterial: function () {
            this.autoSave = setInterval(function () {
              storage.setMaterial();
            }, 120000);
          },
          destroy: function () {
            if (this.autoSave) {
              clearInterval(this.autoSave);
            }
          }
        };

    // 自动恢复
    storage.restoreMaterial();

    // 自动保存
    storage.autoSaveMaterial();

    // 百度编辑器：http://ueditor.baidu.com/
    ueditor = UE.getEditor("inputContent", {
      toolbars: [
        ["bold", "italic", "underline", "|", "insertorderedlist", "insertunorderedlist", "|", "simpleupload", "|", "removeformat", "forecolor", "backcolor"]
      ],
      initialFrameWidth: 500,
      initialFrameHeight: 200,
      // 是否自动长高（默认true）
      autoHeightEnabled: false,
      // 是否保持toolbar的位置不动（默认true）
      autoFloatEnabled: false,
      // 启用自动保存（默认true）
      enableAutoSave: false,
      // 是否开启字数统计（默认true）
      // wordCount: false,
      // 允许的最大字符数
      maximumWords: 20000,
      // 是否启用元素路径（默认true）
      elementPathEnabled: false
    });

    ueditor.ready(function () {
      // 编辑器初始化完成后自动渲染
      renderView();
      renderForm();
    });

    $title.on("keyup blur", function () {
      var $this = $(this),
          $viewTitle = $active.find("[data-view='title']"),
          val = $.trim($this.val());

      if (val) {
        $viewTitle.text(val);
      } else {
        $viewTitle.text($viewTitle.data("placeholder"));
      }

      $this.val(val);
    });

    $summary.on("keyup blur", function () {
      var summary = $(this).val();

      summary = summary.replace(/[\r\n]+/img, "<br>");
      $active.find("[data-view='summary']").html(summary);
    });

    we.uploader({
      done: function (data) {
        $active.find("[data-view='image']").html('<img src="' + data.url + '">');
      },
      fail: function () {
        // 删除图片后
        $active.find("[data-view='image']").empty();
      }
    });

    // 多条图文，切换按钮
    if (materialType === 6 && $view.find(".material-unit").length > 2) {
      // 之前已有2条消息时，允许删除第2条消息
      $view.find(".material-mini").find(".icon-remove").removeClass("disabled");
    }

    $scope.on("click", "[data-toggle^='material']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("material.", ""),
          valid = true,
          $units,
          $parent;

      if ($this.prop("disabled") || $this.hasClass("disabled")) {
        return;
      }

      switch (toggle) {
        case "summary":
          $materialSummaryToggle.addClass("hide");
          $materialSummary.removeClass("hide");
          break;

        case "link":
          $materialLinkToggle.addClass("hide");
          $materialLink.removeClass("hide");
          break;

        case "modify":
          updateData();
          $parent = $this.closest(".material-unit");
          $this.addClass("disabled");
          $view.find(".active").removeClass("active").find(".icon-modify").removeClass("disabled");
          $active = $parent;
          $active.addClass("active");
          renderForm();
          break;

        case "remove":
          $parent = $this.closest(".material-unit");

          // 激活并渲染前一条消息
          updateData();
          $active = $parent.prev();
          $active.addClass("active");
          renderForm();

          // 直接删除整条消息，不管是新建还是编辑素材
          // 后台保存的是整条素材的JSON
          $parent.remove();

          $units = $view.find(".material-unit");

          if ($units.length <= 2) {
            // 仅剩2条消息时，不允许再删除
            $units.find(".icon-remove").addClass("disabled");
          }

          if ($units.length < 8) {
            // 小于8条消息时，允许添加消息
            $view.find(".material-add").removeClass("hide");
          }

          break;

        case "add":
          updateData();
          $units = $view.find(".material-unit");
          $parent = $this.parent();

          if ($units.length >= 2) {
            // 之前已有2条消息时，允许删除第2条消息
            $units.filter(".material-mini").find(".icon-remove").removeClass("disabled");
          }

          if ($units.length >= 7) {
            // 最多8条，隐藏添加按钮
            $parent.addClass("hide");
          }

          $units.filter(".active").removeClass("active").find(".icon-modify").removeClass("disabled");
          $active = $(materialMiniTemplate);
          $active.addClass("active");
          $parent.before($active);
          renderForm();
          break;

        case "save":
          updateData();

          $.extend(data, _data);

          data.type = data.type || materialType;
          data.messages = [];
          $units = $view.find(".material-unit");
          $units.each(function (i) {
            var message = $(this).data(),
                error;

            console.log(i)

            if (!message.title) {
              error = "%s标题不能为空";
            } else if (!message.image) {
              error = "%s封面图片不能为空";

              if (materialType === 6 && i > 0) {
                error = "%s缩略图不能为空";
              }
            } else if (!message.content) {
              error = "%s正文不能为空";
            }

            if (!error) {
              data.messages.push(message);
            } else {
              valid = false;
              error = error.replace("%s", (materialType === 5 ? "" : ("第" + (i + 1) + "条消息的")));
              we.msg(error, 4);
              return false;
            }
          });

          if (valid) {
            $.ajax(data.url, {
              type: "POST",
              data: data,
              dataType: "json",
              beforeSend: function () {
                $this.prop("disabled", true).addClass("disabled");
              },
              success: function (response) {
                if (response.errcode === 0) {
                  we.msg(response.errmsg, 2);
                  materialSaved = true;

                  // 提交成功，清除本地草稿
                  storage.removeMaterial();
                  storage.destroy();

                  we.assign(response.returnurl || response.redirect);
                } else {
                  we.msg(response.errmsg, 5);
                  $this.prop("disabled", false).removeClass("disabled");
                }
              },
              complete: function () {
                // $this.prop("disabled", false).removeClass("disabled");
              }
            });
          }

          break;
        case "reset":
          // 用户重置表单，清除本地草稿
          storage.removeMaterial();
          materialSaved = true;
          window.location.reload();
          break;
      }
    });

    // 离开提示
    $(window).on("beforeunload", function () {
      var message;

      if (!materialSaved) {
        message = storage.setMaterial();

        if (materialChanged) {
          return message || "页面即将跳转……";
        }
      }
    });
  };

})(window, jQuery, WeLife);

// 商家中心 -> 储值
// ===========================================================================

(function (window, $, we) {

  "use strict";

  // 储值 -> 首页
  // ---------------------------------------------------------------------------
  we.prepaid = {};

  we.prepaid.home = function () {
    var $scope = $(".prepaid-home"),
        $form = $scope.find(".we-form"),
        $start = $form.find(".form-start"),
        $state = $form.find(".prepaid-state"),
        prepaidState = $state.data("prepaidState"),
        $open = $state.find(".prepaid-open"),
        $close = $state.find(".prepaid-close"),
        $popover = $form.find(".prepaid-popover"),
        $input = $form.find(".form-input"),
        $ruleList = $form.find(".prepaid-rule-list"),
        ruleTemplate = $form.find(".prepaid-rule-template").text(),
        $term = $form.find(".prepaid-term"),
        $restriction = $form.find(".prepaid-restriction"),
        $output = $form.find(".form-output"),
        outputTemplate = $form.find(".form-output-template").text(),
        outputData = {},
        checkRuleValue = function () {
          var valid = true;

          $ruleList.find("input[type='number']").each(function () {
            var $this = $(this),
                val = $.trim($this.val()),
                num = parseFloat(val, 10) || 0,
                error;

            if (!val) {
              error = "请输入正整数金额";
            } else if (num < 1) {
              error = "请输入大于1的整数";
            } else if (val%1 > 0) {
              error = "请输入整数";
            }

            if (error) {
              this.focus();
              we.msg(error, 4);
              return (valid = false);
            }
          });

          return valid;
        },
        checkRuleList = function () {
          var ruleList = [],
              valid = true;

          $ruleList.find(".prepaid-note").addClass("hide");
          $ruleList.find(".prepaid-value").each(function (i) {
            var $this = $(this),
                val = parseInt($this.val(), 10);

            if (i > 0) {
              $.each(ruleList, function (i, rule) {
                if (val == rule) {
                  valid = false;
                  $this.parent().find(".prepaid-note").removeClass("hide");
                }
              });
            }

            ruleList.push(val);
          });

          return valid;
        },
        disable = function () {
          // 禁用表单
          $ruleList.find("input").prop("disabled", true);
          $ruleList.find("button").prop("disabled", true).addClass("disabled");
          $term.find(".we-radio").addClass("disabled");
          $term.find(".form-control").prop("disabled", true);
          $form.find(".editor-input").prop("contenteditable", false).addClass("disabled");
          $form.find("button[data-toggle='prepaid.save']").data("disabled", true).text("修改");
        },
        enable = function () {
          // 启用表单
          $ruleList.find("input").prop("disabled", false);
          $ruleList.find("button").prop("disabled", false).removeClass("disabled");
          $term.find(".we-radio").removeClass("disabled");
          $term.find(".form-control").prop("disabled", false);
          $form.find(".editor-input").prop("contenteditable", true).removeClass("disabled");
          $form.find("button[data-toggle='prepaid.save']").data("disabled", false).text("保存");
        };

    if (prepaidState === "open") {
      $open.find(".we-radio").radio("check");
      $close.removeClass("disabled").find(".we-radio").radio("uncheck").addClass("disabled");
      $popover.removeClass("in");
      $input.removeClass("hide");
      $restriction.validate();
    } else {
      // 避免弹出确认框
      $close.addClass("disabled");
    }

    $state.find(".we-radio").on("checked.we.radio", function (e) {
      var $this = $(this),
          state = $this.data("state");

      if (state === "open") {
        $popover.collapse("hide");
        $input.removeClass("hide");
      } else if (state === "close") {

        if (!$this.parent().hasClass("disabled")) {
          e.preventDefault();
          return;
        }

        $popover.collapse("show");
        $input.addClass("hide");
        $output.addClass("hide");
      }
    });

    $ruleList.find(".prepaid-value").on("change", checkRuleList);

    $ruleList.on("click", "[data-toggle^='rule']", function (e) {
      var $this = $(this),
          set = $this.data("toggle").replace("rule.", ""),
          $item,
          $parent,
          $children,
          $prev,
          $next;

      e.preventDefault();

      if ($this.hasClass("disabled")) {
        return;
      }

      if (set === "add") {
        $item = $(ruleTemplate);
        $item.find(".prepaid-value").on("change", checkRuleList);
        $ruleList.append($item);
        $this.addClass("hide");
        $this.siblings(".prepaid-del").removeClass("hide");

        $children = $ruleList.children();

        if ($children.length >= 10) {
          $children.last().find(".prepaid-add").addClass("hide");
        }
      } else if (set === "del") {
        $parent = $this.closest("li");
        $prev = $parent.prev();
        $next = $parent.next();

        $parent.empty().remove();

        if (!$next.length) {
          $prev.find(".prepaid-add").removeClass("hide");
        }

        $children = $ruleList.children();

        if ($children.length < 2) {
          $children.first().find(".prepaid-del").addClass("hide");
        }

        if ($children.length < 10) {
          $children.last().find(".prepaid-add").removeClass("hide");
        }
      }
    });

    $scope.on("click", "[data-toggle^='prepaid']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("prepaid.", "");

      if ($this.hasClass("disabled")) {
        return;
      }

      switch (toggle) {
        case "save":
          if ($this.data("disabled")) {
            enable();
            break;
          }

          if (!(checkRuleList() && checkRuleValue() && $restriction.validate("validate"))) {
            return;
          }

          outputData.rules = [];
          $ruleList.children().each(function () {
            var $this = $(this);

            outputData.rules.push({
              prepaid: $this.find(".prepaid-value").val(),
              present: $this.find(".present-value").val()
            })
          });

          outputData.term = (function () {
            var $termType = $term.find(":radio:checked"),
                termType = Number($termType.val()),
                term = [];

            if (termType === 0) {
              term.push(0);
            } else if (termType === 1) {
              term.push(1);
              term.push($termType.siblings(".prepaid-term-count").val());
              term.push($termType.siblings(".prepaid-term-unit").find(":selected").text());
            }

            return term;
          })();

          outputData.restriction = $restriction.val();

          $output.empty().html(_.template(outputTemplate, outputData));

          $start.addClass("hide");
          $input.addClass("hide");
          $output.removeClass("hide");
          break;

        case "cancel":
          $start.removeClass("hide");
          $input.removeClass("hide");
          $output.addClass("hide");
          break;
      }
    });

    we.textEditor($scope);

    // 关闭储值功能确认框
    we.popoverConfirm({
      message: "确定关闭储值功能？",
      confirm: function () {
        var $this = $(this),
            data = $this.data();

        // 进行删除操作
        $.ajax(data.url, {
          async: false,
          type: "POST",
          data: {
            close: true
          },
          dataType: "json",
          success: function (response) {
            if (response.errcode === 0) {
              location.reload();
            } else {
              console.log(response.errmsg);
            }
          }
        });
      }
    });

    if (prepaidState === "open") {
      disable();
    }
  };

})(window, jQuery, WeLife);

// 商家中心 -> 统计
// ===========================================================================

(function (window, $, we) {

  "use strict";

  // 统计模块全部可用搜索日期为今天之前的日期
  var now = new Date(),
      yesterday = (function () {
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      })(),
      oneMonth = (function () {
        return yesterday.valueOf() - new Date(now.getFullYear(), now.getMonth() - 1, now.getDate() - 1).valueOf();
      })(),
      threeMonth = (function () {
        return yesterday.valueOf() - new Date(now.getFullYear(), now.getMonth() - 3, now.getDate() - 1).valueOf();
      })();

  we.statistic = {};

  // 统计 -> 日常统计
  // ---------------------------------------------------------------------------
  we.statistic.common = function () {
    var $scope = $(".statistic-common");

    we.date($scope, {
      customDateRange: oneMonth,
      endDate: yesterday
    });

    we.popoverNotice($scope);
  };

  we.statistic.common.member = function () {
    var $scope = $(".statistic-common-member");

    we.date($scope, {
      customDateRange: oneMonth,
      endDate: yesterday
    });

    we.popoverNotice($scope);
  };

  we.statistic.common.spend = function () {
    var $scope = $(".statistic-common-spend");

    we.date($scope, {
      customDateRange: oneMonth,
      endDate: yesterday
    });

    we.popoverNotice($scope);
  };

  we.statistic.common.recharge = function () {
    var $scope = $(".statistic-common-recharge");

    we.date($scope, {
      customDateRange: oneMonth,
      endDate: yesterday
    });

    we.popoverNotice($scope);
  };


  // 统计 -> 营销统计
  // ---------------------------------------------------------------------------

  we.statistic.market = function () {
    var $scope = $(".statistic-market"),
        $costPercentage = $scope.find(".cost-percentage"),
        $percentageInput = $costPercentage.find(".percentage-input"),
        $percentageSubmit = $costPercentage.find(".percentage-submit"),
        $percentageOutput = $scope.find(".percentage-output"),
        $percentageReserve = $scope.find(".percentage-reserve"),
        $totalMarketingEarning = $scope.find(".total-marketing-earning"),
        $chartCouponUsage = $scope.find(".chart-coupon-usage"),
        $chartMarketingEarning = $scope.find(".chart-marketing-earning"),
        $table = $scope.find(".table"),
        $items = $table.find("tbody > tr"),
        $checkboxes = $table.find(".we-checkbox"),
        $compareBtn = $scope.find("#compare-btn"),
        chartUpdating = false,
        checkPercentage = function () {
          var val = Math.abs(parseInt($percentageInput.val(), 10)) || 0;

          if (val > 100) {
            val = val.toString().substr(0,2);
          }

          $percentageInput.val(val);
          $percentageOutput.text(val);
          $percentageReserve.text(100 - val);
        },
        computeMarketingEarnings = function () {
          var percentage = Math.abs(parseInt($percentageInput.val(), 10) / 100) || 0;

          // 会员营销收益 =（带动现金消费 + 带动储值消费）* 60% - 券使用量 * 券面额 * 40%
          $items.each(function () {
            var $this = $(this),
                data = $this.data();

            if ($.isEmptyObject(data)) {
              return;
            }

            // 计算收益
            data.marketingEarning = parseInt(((data.spendValue + data.rechargeValue) * (1 - percentage) - data.couponUsed * data.couponValue * percentage), 10);

            // 更新表格
            $this.data("marketingEarning", data.marketingEarning).find("[data-name='marketing-earning']").text(data.marketingEarning);
          });

          // 更新图表
          clearTimeout(chartUpdating);
          chartUpdating = setTimeout(function () {
            compareCheckedItems({
              couponUsage: false
            });
          }, 200);

          // 计算总收益
          $totalMarketingEarning.text(function () {
            var data = $(this).data();

            return we.util.formatNumber(((data.spendValue + data.rechargeValue) * 0.6 - data.couponUsed * data.couponValue * percentage), 2);
          });
        },
        computeCheckedLength = function (e) {
          var disabled = $checkboxes.filter(".checked").length < 2;

          $compareBtn.prop("disabled", disabled);

          if (disabled && e) {
            we.msg("最少选2个", 4);
          }
        },
        compareCheckedItems = function (options) {
          var defatuls = {
                couponUsage: true,
                marketingEarnings: true
              },
              $checked = $checkboxes.filter(".checked"),
              checkedLength = $checked.length,
              couponUsageOptions,
              marketingEarningsOptions;

          if (checkedLength < 2 || checkedLength > 5) {
            return;
          }

          options = $.extend(defatuls, options);

          if (options.couponUsage) {
            couponUsageOptions = $chartCouponUsage.chart("getOptions");
            couponUsageOptions.xAxis[0].data = [];
            couponUsageOptions.series[0].data = [];

            $checked.each(function () {
              var data = $(this).closest("tr").data();

              couponUsageOptions.xAxis[0].data.push(data.name);
              couponUsageOptions.series[0].data.push(parseFloat(data.couponUsage) || 0);
            });

            $chartCouponUsage.chart("setOptions", couponUsageOptions);
          }

          if (options.marketingEarnings) {
            marketingEarningsOptions = $chartMarketingEarning.chart("getOptions");
            marketingEarningsOptions.xAxis[0].data = [];
            marketingEarningsOptions.series[0].data = [];

            $checked.each(function () {
              var data = $(this).closest("tr").data();

              marketingEarningsOptions.xAxis[0].data.push(data.name);
              marketingEarningsOptions.series[0].data.push(data.marketingEarning);
            });

            $chartMarketingEarning.chart("setOptions", marketingEarningsOptions);
          }
        };

    we.date($scope, {
      customDateRange: threeMonth,
      endDate: yesterday
    });

    computeCheckedLength();

    $checkboxes.on("check.we.checkbox", function (e) {
      if ($checkboxes.filter(".checked").length >= 5) {
        we.msg("最多选5个", 4);
        e.preventDefault();
      }
    });

    $checkboxes.on("checked.we.checkbox unchecked.we.checkbox", computeCheckedLength);

    $compareBtn.on("click", function () {
      if ($compareBtn.prop("disabled") || $compareBtn.hasClass("disabled")) {
        return;
      }

      compareCheckedItems();
    });

    $percentageInput.on("keyup blur", checkPercentage);

    $percentageInput.on("change", checkPercentage);

    $percentageInput.on("paste", function () {
      setTimeout(function () {
        checkPercentage();
      }, 50);
    });

    $percentageSubmit.on("click", computeMarketingEarnings);
  };

  we.statistic.market.detail = function () {
    var $scope = $(".statistic-market-detail");

    we.date($scope, {
      customDateRange: threeMonth,
      endDate: yesterday
    });

  };

  // 统计 -> 交易流水
  // ---------------------------------------------------------------------------

  we.statistic.trade = {};

  // 交易流水 -> 消费流水
  // ---------------------------------------------------------------------------
  we.statistic.trade.spend = function () {
    var $scope = $(".statistic-trade-spend");

    we.date($scope, {
      customDateRange: oneMonth,
      endDate: yesterday
    });

    we.exporter($scope);
    we.popoverNotice($scope);
  };

  // 交易流水 -> 充值流水
  // ---------------------------------------------------------------------------
  we.statistic.trade.recharge = function () {
    var $scope = $(".statistic-trade-recharge");

    we.date($scope, {
      customDateRange: oneMonth,
      endDate: yesterday
    });

    we.exporter($scope);
  };

})(window, jQuery, WeLife);

// 商家中心 -> 设置
// ===========================================================================

(function (window, $, we) {

  "use strict";

  we.setting = {};

  // 帐号设置 -> 首页
  // ---------------------------------------------------------------------------

  we.setting.account = function () {
    var $scope = $(".setting-account"),
        $accountDisableModal = $scope.find(".account-disable-modal"),
        $accountResetModal = $scope.find(".account-reset-modal"),
        $accountResetSuccessModal = $scope.find(".account-reset-success-modal"),
        $accountConflictModal = $scope.find(".account-conflict-modal");

    if ($accountConflictModal.data("conflicted")) {
      $accountConflictModal.modal({
        backdrop: false,
        keyboard: false
      });
    }

    $scope.on("click", "[data-toggle^='account']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("account.", "");

      if ($this.hasClass("disabled")) {
        return;
      }

      switch (toggle) {
        case "disable":
          $accountDisableModal.data("ajaxData", data).modal();
          break;

        case "disable.confirm":
          data = $accountDisableModal.data("ajaxData");

          $.ajax(data.url, {
            type: "POST",
            data: {
              id: data.id
            },
            dataType: "json",
            success: function (response) {
              if (response.errcode === 0) {
                $accountDisableModal.modal("hide");
                window.location.reload();
              } else {
                we.msg(response.errmsg, 5);
              }
            }
          });
          break;

        case "reset":
          $accountResetModal.data("ajaxData", data).modal();
          break;

        case "reset.confirm":
          data = $accountResetModal.data("ajaxData");

          $.ajax(data.url, {
            type: "POST",
            data: {
              id: data.id
            },
            dataType: "json",
            success: function (response) {
              if (response.errcode === 0) {
                $accountResetModal.modal("hide");
                $accountResetSuccessModal.modal();
              } else {
                we.msg(response.errmsg, 5);
              }
            }
          });
          break;
      }
    });

    // 复制链接到剪贴板
    // ZeroClipboard: https://github.com/zeroclipboard/zeroclipboard
    require(["ZeroClipboard"], function (ZeroClipboard) {
      var $button = $scope.find("#copyToClipboard"),
          data = $button.data(),
          client;

      client = new ZeroClipboard($button.get(0));
      client.on("ready", function (/*readyEvent*/) {
        // console.log("ZeroClipboard SWF is ready!");
        client.on("aftercopy", function (/*event*/) {
          // `this` === `client`
          // `event.target` === the element that was clicked
          we.msg(data.copiedMessage, 2);
        });
      });
    });
  };

  // 帐号设置 -> 创建帐号
  // ---------------------------------------------------------------------------

  we.setting.account.create = function () {
    var $scope = $(".setting-account-create"),
        $form = $scope.find(".we-form"),
        $role = $form.find("[data-section='role']"),
        $roles = $role.find(".we-radio"),
        $name = $form.find("#inputName"),
        $phone = $form.find("#inputPhone"),
        $shop = $form.find("[data-section='shop']"),
        $right = $form.find("[data-section='right']"),
        $shopToggle = $shop.find(".shop-toggle"),
        $shopCheckedIds = $shop.find(".shop-checked-ids"),
        $shopCheckedList = $shop.find(".shop-checked-list"),
        shopData = ((function () {
          var id = $shopCheckedIds.val(),
              name = $shopCheckedIds.data("shop");

          if (/all/i.test(id)) {
            id = "";
            name = "";
          }

          return [id, name];
        })()),
        resetShop = function (deep) {
          if ($shop.is(":hidden")) {
            return;
          }

          if (deep) {
            $shopToggle.addClass("hide").text("");
            $shopCheckedIds.val("all").data("shop", "全部门店");
            $shopCheckedList.html("<li>全部门店</li>");
          } else {
            $shopToggle.removeClass("hide").text("选择门店");
            $shopCheckedIds.val(shopData[0]).data("shop", shopData[1]);
            $shopCheckedList.html(shopData[1] ? ("<li>" + shopData[1] + "</li>") : "");
          }
        },
        changeRole = function () {
          var role = $roles.filter(".checked").data("role");

          switch (role) {
            case 1:
              resetShop(true);
              $right.addClass("hide");
              break;

            case 2:
              resetShop();
              $right.addClass("hide");
              break;

            case 3:
              resetShop();
              $right.removeClass("hide");
              break;
          }
        };

    changeRole();
    $roles.on("checked.we.radio", changeRole);

    $name.validate({
      rules: {
        name: ""
      }
    });

    $phone.validate({
      rules: {
        phone: ""
      }
    });

    we.shop($scope);

    $form.submitter({
      disableAfterDone: true,
      isValidated: function () {
        if ($shop.is(":visible") && !$shop.find(".shop-checked-ids").val()) {
          we.msg("请选择门店", 4);
          return false;
        }

        return $name.validate("validate") && $phone.validate("validate");
      },
      done: function (response) {
        we.respond(response);
      }
    });
  };

  // 设置 -> 会员卡样式
  // ---------------------------------------------------------------------------

  we.setting.membercard = function () {};

  // 设置 -> 会员卡样式 -> 编辑
  // ---------------------------------------------------------------------------

  we.setting.membercard.modify = function () {
    var $scope = $(".setting-membercard-modify"),
        $form = $scope.find(".we-form"),
        $type = $form.find("[data-section='type']"),
        $typeRadios = $type.find(".we-radio"),
        $cardStyleToggle = $type.find(".card-style-toggle"),
        $loadCardTemplate = $type.find(".load-card-template"),
        $style = $form.find("[data-section='style']"),
        $name = $form.find("[data-section='name']"),
        $nameRadios = $name.find(".we-radio"),
        $logoFace = $form.find("[data-section='logo.face']"),
        $logoBase = $form.find("[data-section='logo.base']"),
        $face = $form.find("[data-section='face']"),
        $back = $form.find("[data-section='back']"),
        $logo = $form.find("[data-section='logo']"),
        $color = $form.find("[data-section='color']"),
        cardType,
        nameType,
        changeCardType = function () {
          cardType = $typeRadios.filter(".checked").data("type");

          switch (cardType) {
            case 1:
              $cardStyleToggle.removeClass("hide");
              $loadCardTemplate.addClass("hide");
              $style.removeClass("hide");
              $name.removeClass("hide");
              $face.addClass("hide");
              $back.addClass("hide");
              $logo.addClass("hide");
              $color.addClass("hide");
              changeNameType();
              break;

            case 2:
              $cardStyleToggle.addClass("hide");
              $loadCardTemplate.removeClass("hide");
              $style.addClass("hide");
              $name.addClass("hide");
              $logoFace.addClass("hide");
              $logoBase.addClass("hide");
              $face.removeClass("hide");
              $back.removeClass("hide");
              $logo.removeClass("hide");
              $color.removeClass("hide");
              break;
          }
        },
        changeNameType = function () {
          nameType = $nameRadios.filter(".checked").data("type");

          switch (nameType) {
            case 1:
              $logoFace.addClass("hide");
              $logoBase.addClass("hide");
              break;

            case 2:
              $logoFace.removeClass("hide");
              $logoBase.removeClass("hide");
              break;
          }
        };

    function hasLogoFace() {
      if (!$logoFace.find(".js-uploaded-id").val()) {
        we.showError($logoFace, "请上传卡面 logo");
        return false;
      }

      return true;
    }

    function hasLogoBase() {
      if (!$logoBase.find(".js-uploaded-id").val()) {
        we.showError($logoBase, "请上传通用 logo");
        return false;
      }

      return true;
    }

    function hasFace() {
      if (!$face.find(".js-uploaded-id").val()) {
        we.showError($face, "请上传自定义卡");
        return false;
      }

      return true;
    }

    function hasBack() {
      if (!$back.find(".js-uploaded-id").val()) {
        we.showError($back, "请上传自定义卡背景图");
        return false;
      }

      return true;
    }

    function hasLogo() {
      if (!$logo.find(".js-uploaded-id").val()) {
        we.showError($logo, "请上传自定义卡通用 logo");
        return false;
      }

      return true;
    }

    changeCardType();
    $typeRadios.on("checked.we.radio", changeCardType);

    $nameRadios.on("checked.we.radio", changeNameType);

    we.cardSelector($scope);
    we.colorSelector($scope);

    $scope.find(".we-uploader").each(function () {
      var $this = $(this),
          $field = $this.closest(".form-group");

      we.uploader($this, {
        namespace: "." + $field.data("section")
      });

      we.popoverNotice($field);
    });

    $form.submitter({
      disableAfterDone: true,
      isValidated: function () {
        var valid = true;

        if (cardType === 2) {
          valid = hasFace() && hasBack() && hasLogo();
        } else if (nameType === 2) {
          valid = hasLogoFace() && hasLogoBase();
        }

        return valid;
      },
      done: function (response) {
        we.respond(response);
      }
    });
  };

  // 设置 -> 关键词自动回复
  // ---------------------------------------------------------------------------

  we.setting.autoreply = function () {
    // var $scope = $(".setting-autoreply");

    // 删除确认框
    we.popoverConfirm({
      message: "确定删除该关键词？",
      confirm: function () {
        var $this = $(this),
            data = $this.data();

        // 进行删除操作
        $.ajax(data.url, {
          async: false,
          type: "POST",
          data: {
            id: data.id
          },
          dataType: "json",
          success: function (response) {
            if (response.errcode === 0) {
              $this.closest("tr").addClass("hide");
            } else {
              we.msg(response.errmsg, 5);
            }
          }
        });
      }
    });
  };

  we.setting.autoreply.create = function () {
    var $scope = $(".setting-autoreply-create"),
        $form = $scope.find("form"),
        $name = $form.find("#inputName"),
        $content = $form.find(".input-content"),
        $editable = $form.find(".editor-input"),
        $keywordList = $form.find(".keyword-list");

    function isValidContent() {
      if (!$content.val()) {
        we.msg("回复内容不能为空", 4);
        return false;
      }

      if ($editable.prop("contenteditable") === "true" && !$editable.data("valid")) {
        we.msg("回复内容字数超出限制", 4);
        return false;
      }

      return true;
    }

    we.keywordEditor($scope);
    we.messageEditor($scope);

    $name.on("change blur", function () {
      $name.val($.trim($name.val()));
    });

    $form.submitter({
      disableAfterDone: true,
      isValidated: function () {
        if (!$keywordList.find("li").length) {
          we.msg(we.MESSAGES.keyword, 4);
          return false;
        }

        return isValidContent();
      },
      done: function (response) {
        we.respond(response);
      }
    });
  };

  // 设置 -> 二维码管理
  // ---------------------------------------------------------------------------

  we.setting.code2d = function () {
    var $scope = $(".setting-code2d"),
        $deleteModal = $scope.find(".code-delete-modal");

    $scope.on("click", "[data-toggle^='code']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("code.", "");

      if ($this.hasClass("disabled")) {
        return;
      }

      switch (toggle) {
        case "delete":
          $deleteModal.find("[data-toggle='code.delete.confirm']").data("code", data);
          $deleteModal.modal("show");
          break;

        case "delete.confirm":
          data = $this.data("code");

          // 进行删除操作
          $.ajax(data.url, {
            async: false,
            type: "POST",
            data: {
              id: data.id
            },
            dataType: "json",
            success: function (response) {
              we.respond(response, {
                success: function () {
                  $deleteModal.modal("hide");
                  we.reload();
                }
              });
            }
          });

          break;
      }
    });
  };

  we.setting.code2d.create = function () {
    var $scope = $(".setting-code2d-create"),
        $form = $scope.find("form"),
        $codeData = $form.find(".code-data"),
        $codeList = $form.find(".code-list"),
        baseData = {
          code: "",
          shopOnly: false,
          shopId: "",
          shopName: "",
          readonly: false
        },
        codeData = $codeData.val(),
        compiled = _.template($form.find(".code-list-template").text()),
        render = function (data) {
          var items = "",
              $items,
              length;

          if ($.isArray(data)) {
            length = data.length;

            $.each(data, function (index, d) {
              d.index = index;
              d.length = length;
              items += compiled(d);
            });
          } else if ($.isPlainObject(data)) {
            length = $codeList.children().length;

            data.index = length;
            data.length = length + 1;
            items = compiled(data);
          }

          $items = $(items);

          $items.each(function () {
            var $this = $(this);

            $this.find(".we-checkbox").on("checked.we.checkbox", function () {
              $(this).siblings(".we-shop-container").removeClass("hide");
            }).on("unchecked.we.checkbox", function () {
              $(this).siblings(".we-shop-container").addClass("hide");
            });

            we.shop($this);
          });

          $codeList.append($items);

          length = $codeList.children().length;

          if (length > 1) {
            $codeList.find(".input-code-del").first().removeClass("hide");
          }

          // if (length > 10) {
          //   $codeList.addClass("responsive");
          // }
        },
        bulkShopCode = function (shops) {
          var data = [];

          if ($.isArray(shops)) {
            $.each(shops, function (i, shop) {
              data.push({
                code: shop.name,
                shopOnly: true,
                shopId: shop.id,
                shopName: shop.name,
                readonly: true
              });
            });

            render(data);
          }
        },
        isValidCodeName = function () {
          var $names = $codeList.find("> li > .input-code-name"),
              valid = true,
              error;

          $names.each(function (i, that) {
            var $this = $(this),
                name = $this.val(),
                repeated = false;

            if (!$this.prop("readonly")) {
              $names.each(function (j) {
                var $this = $(this);

                if (this !== that && $this.val() === name) {
                  repeated = true;
                  error = ("第 " + (j + 1) + " 条二维码的名称与第 " + (i + 1) + " 条二维码的名称重复，请修改后重试！");
                  $this.focus();
                  return false;
                }
              });

              if (repeated) {
                // $this.focus();
                return false;
              }
            }
          });

          if (error) {
            valid = false;
            we.msg(error, 4);
          }

          return valid;
        },
        syncCodeData = function () {
          var data = [];

          $codeList.children().each(function () {
            var $this = $(this),
                $name = $this.find(".input-code-name"),
                $shopOnly = $this.find(".input-code-shop-only"),
                $shopId = $this.find(".input-code-shop-id");

            data.push({
              code: $name.val(),
              shopOnly: $shopOnly.prop("checked"),
              shopId: $shopId.val(),
              shopName: $shopId.data("shop"),
              readonly: $name.prop("readonly")
            });
          });

          try {
            $codeData.val(JSON.stringify(data));
          } catch (e) {
            console.log(e.message);
          }
        };

    render((function (data) {
      try {
        data = $.parseJSON(data);
      } catch (e) {
        data = null;
        console.log(e);
      }

      if (!data) {
        data = $.extend({}, baseData);
      }

      return data;
    })(codeData));

    $scope.on("click", "[data-toggle^='code']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("code.", "");

      if ($this.hasClass("disabled")) {
        return;
      }

      switch (toggle) {
        case "add":
          $this.addClass("hide");
          data = $.extend({}, baseData);
          render(data);
          break;

        case "bulk":
          $this.addClass("hide");
          $codeList.find(".input-code-add").last().addClass("hide");

          if (we.shop.data) {
            bulkShopCode(we.shop.data);
          } else {
            // 异步加载门店列表
            $.ajax(data.url, {
              data: data,
              dataType: "json",
              success: function (response) {
                if (response.errcode === 0) {
                  we.shop.data = response.result; // 缓存以备选择门店使用
                  bulkShopCode(response.result);
                } else {
                  console.log(response.errmsg);
                }
              }
            });
          }

          break;
      }
    });

    // 删除二维码确认框
    we.popoverConfirm({
      message: "确定要删除么？",
      confirm: function () {
        $(this).closest(".code-item").empty().remove();
        $codeList.find(".input-code-add").last().removeClass("hide");

        if ($codeList.children().length === 1) {
          $codeList.find(".input-code-del").first().addClass("hide");
        }
      }
    });

    $form.submitter({
      isValidated: function () {
        if (!isValidCodeName()) {
          return false;
        }

        syncCodeData();

        return true;
      },
      done: function (response) {
        we.respond(response);
      }
    });
  };

  we.setting.code2d.detail = function () {
    var $scope = $(".setting-code2d-detail"),
        $modal = $scope.find(".download-modal"),
        $deleteModal = $scope.find(".code-delete-modal"),
        $codes = $modal.find("table a");

    $scope.on("click", "[data-toggle^='code']", function () {
      var $this = $(this),
          data = $this.data(),
          toggle = data.toggle.replace("code.", "");

      if ($this.hasClass("disabled")) {
        return;
      }

      switch (toggle) {
        case "more":
          $codes.each(function () {
            var $this = $(this),
                params = [];

            $.each($this.data(), function (name, value) {
              params.push(name + "=" + value);
            });

            $this.attr("href", data.url + (params.length ? ("?" + params.join("&")) : ""));
          });

          $modal.modal("show");
          break;

        case "delete":
          $deleteModal.find("[data-toggle='code.delete.confirm']").data("code", data);
          $deleteModal.modal("show");
          break;

        case "delete.confirm":
          data = $this.data("code");

          // 进行删除操作
          $.ajax(data.url, {
            async: false,
            type: "POST",
            data: {
              id: data.id
            },
            dataType: "json",
            success: function (response) {
              we.respond(response, {
                success: function () {
                  $deleteModal.modal("hide");
                  we.reload();
                }
              });
            }
          });

          break;
      }
    });
  };

  // 设置 -> 模板消息
  // ---------------------------------------------------------------------------

  we.setting.template = function () {
    var $scope = $(".setting-template"),
        $form = $scope.find("form");

    $form.submitter({
      done: function (response) {
        we.respond(response);
      }
    });
  };

  // 设置 -> 微信参数
  // ---------------------------------------------------------------------------

  we.setting.wechat = function () {
    var $scope = $(".setting-wechat"),
        $form = $scope.find("form");

    $form.submitter({
      disableAfterDone: true,
      done: function (response) {
        we.respond(response, {
          success: function () {
            we.reload();
          }
        });
      }
    });

    // 复制链接到剪贴板
    // ZeroClipboard: https://github.com/zeroclipboard/zeroclipboard
    require(["ZeroClipboard"], function (ZeroClipboard) {
      $scope.find(".copy-to-clipboard").each(function () {
        var data = $(this).data(),
            client = new ZeroClipboard(this);

        client.on("ready", function (/*readyEvent*/) {
          // console.log("ZeroClipboard SWF is ready!");
          client.on("aftercopy", function (/*event*/) {
            // `this` === `client`
            // `event.target` === the element that was clicked
            we.msg(data.copiedMessage, 2);
          });
        });
      });
    });
  };

})(window, jQuery, WeLife);

//# sourceMappingURL=main.js.map
