// ==UserScript==
// @name        AoPS Enhanced 6
// @namespace   https://gitlab.com/epiccakeking
// @match       https://artofproblemsolving.com/*
// @grant       none
// @version     6.1.0a1
// @author      epiccakeking
// @description AoPS Enhanced adds and improves various features of the AoPS website.
// @license     MIT
// @icon        https://artofproblemsolving.com/online-favicon.ico?v=2
// ==/UserScript==

// Functions for settings UI elements
let settings_ui = {
  toggle: label => (name, value, settings_manager) => {
    let checkbox_label = document.createElement('label');
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = name;
    checkbox.checked = value;
    checkbox.addEventListener('change', e => settings_manager.set(name, e.target.checked));
    checkbox_label.appendChild(checkbox);
    checkbox_label.appendChild(document.createTextNode(' ' + label));
    return checkbox_label;
  },
  select: (label, options) => (name, value, settings_manager) => {
    let select_label = document.createElement('label');
    select_label.innerText = label + ' ';
    let select = document.createElement('select');
    select.name = name;
    for (let option of options) {
      let option_element = document.createElement('option');
      option_element.value = option[0];
      option_element.innerText = option[1];
      select.appendChild(option_element);
    }
    select.value = value;
    select.addEventListener('change', e => settings_manager.set(name, e.target.value));
    select_label.appendChild(select);
    return select_label;
  },
}

let themes = {
  'None': '',
  'Mobile': `
.cmty-bbcode-buttons{
  display: block;
  height: auto;
  width: auto !important;
}
.cmty-posting-button-row{
  height: min-content !important;
  display: flow-root;
}
#feed-wrapper{
  display: inline;
}
#feed-topic{
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.cmty-no-tablet{
  display: inline !important;
}
#feed-topic .cmty-topic-jump{
  position: fixed;
  top: 32px;
  bottom: auto;
  left: auto;
  right: 10px;
  z-index: 1000;
  font-size: 24px;
}
#feed-topic .cmty-topic-jump-top{
  right: 40px;
}
.cmty-upload-modal{
  display: inline;
}
.aops-modal-body{
  width: 100% !important;
}

#feed-tabs .cmty-postbox-inner-box{
  width: 100% !important;
  max-width: none !important;
}

#feed-topic .cmty-topic-posts-outer-wrapper > .aops-scroll-outer > .aops-scroll-inner {
  left: 0;
  width: 100% !important;
}

#feed-topic .cmty-postbox-inner-box {
  max-width: 100% !important;
}
`,
  "Dark": `
.cmty-topic-jump{
color: #000;
}
*{
scrollbar-color: #04a3af #333533;
}
::-webkit-scrollbar-track{
background: #333533;
}
::-webkit-scrollbar-thumb{
background: #04a3af;
}
.cmty-topic-posts-top *:not(.cmty-item-tag){
color: black !important;
}
#page-wrapper img:not([class*='latex']):not([class*='asy']),
#feed-wrapper img:not([class*='latex']):not([class*='asy']){
filter: hue-rotate(180deg) invert(1);
}
.bbcode_smiley[src*='latex']{
filter: none !important;
}
.cmty-topic-posts-top,
.cmty-postbox-inner-box,
.cmty-topic-posts-bottom,
.aops-scroll-outer{
background: #ddd !important;
}
.aops-scroll-slider{
background: #222 !important;
}
iframe{
  filter: invert(1) hue-rotate(180deg);
}

#page-wrapper,
.aops-modal-wrapper,
#feed-wrapper > * > *{
filter: invert(1) hue-rotate(180deg);
}
body{
background: url('data:image/png;base64,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') !important;
}`,
}

let quote_schemes = {
  'AoPS': AoPS.Community.Views.Post.prototype.onClickQuote,
  'Enhanced': function () { this.topic.appendToReply("[quote name=\"" + this.model.get("username") + "\" url=\"/community/p" + this.model.get("post_id") + "\"]\n" + this.model.get("post_canonical").trim() + "\n[/quote]\n\n") },
  'Link': function () { this.topic.appendToReply(`@[url=https://aops.com/community/p${this.model.get("post_id")}]${this.model.get("username")} (#${this.model.get("post_number")}):[/url]`); },
  'Hide': function () {
    this.topic.appendToReply(`[hide=Post #${this.model.get("post_number")} by ${this.model.get("username")}]
[url=https://aops.com/community/user/${this.model.get("poster_id")}]${this.model.get('username')}[/url] [url=https://aops.com/community/p${this.model.get("post_id")}](view original)[/url]
${this.model.get('post_canonical').trim()}
[/hide]

`);
  },
};

class EnhancedSettingsManager {
  /** Default settings */
  DEFAULTS = {
    notifications: true,
    post_links: true,
    feed_moderation: true,
    kill_top: false,
    quote_primary: 'Enhanced',
    quote_secondary: 'Enhanced',
    theme: 'None',
  };

  /**
   * Constructor
   * @param {string} storage_variable - Variable to use when reading or writing settings
   */
  constructor(storage_variable) {
    this.storage_variable = storage_variable;
    this._settings = JSON.parse(localStorage.getItem(this.storage_variable) || '{}');
    this.hooks = {};
  }

  /**
   * Retrieves a setting.
   * @param {string} setting - Setting to retrieve
   */
  get = setting => (setting in this._settings ? this._settings : this.DEFAULTS)[setting];

  /**
   * Sets a setting.
   * @param {string} setting - Setting to change
   * @param {*} value - Value to set
   */
  set(setting, value) {
    this._settings[setting] = value;
    localStorage.setItem(this.storage_variable, JSON.stringify(this._settings));
    // Run hooks
    if (setting in this.hooks) for (let hook of this.hooks[setting]) hook(value);
  }

  /**
   * Add a hook that will be called when the associated setting is changed.
   * @param {string} setting - Setting to add a hook to
   * @param {function} callback - Callback to run when the setting is changed
   * @param {boolean} run_on_add - Whether to immediately run the hook
   */
  add_hook(setting, callback, run_on_add = false) {
    setting in this.hooks ? this.hooks[setting].push(callback) : this.hooks[setting] = [callback];
    if (run_on_add) callback(this.get(setting));
  }

  // No functions for removing hooks, do it manually by modifying the hooks attribute.
}

let enhanced_settings = new EnhancedSettingsManager('enhanced_settings');
// Old settings adapter
for (let setting of ['quote_primary', 'quote_secondary']) {
  let setting_value = enhanced_settings.get(setting);
  if (setting_value.toLowerCase() == setting_value) enhanced_settings.set(setting, setting_value[0].toUpperCase() + setting_value.slice(1));
}

// Themes
enhanced_settings.add_hook('theme', (() => {
  let theme_element = document.createElement('style');
  return value => {
    theme_element.textContent = themes[value];
    if (value != 'None') {
      document.head.appendChild(theme_element);
    } else if (theme_element.parentNode) theme_element.parentNode.removeChild(theme_element);
    window.dispatchEvent(new Event('resize')); // Recalculate sizes of elements
  };
})(), true);

// Themes
enhanced_settings.add_hook('theme', (() => {
  let theme_element = document.createElement('style');
  return value => {
    theme_element.textContent = themes[value];
    if (value != 'None') {
      document.head.appendChild(theme_element);
    } else if (theme_element.parentNode) theme_element.parentNode.removeChild(theme_element);
    window.dispatchEvent(new Event('resize')); // Recalculate sizes of elements
  };
})(), true);

// Simplified header
enhanced_settings.add_hook('kill_top', (() => {
  const menubar_wrapper = document.querySelector('.menubar-links-outer');
  if (!menubar_wrapper) return _ => null;
  let kill_element = document.createElement('style');
  menubar_wrapper_normal_position = menubar_wrapper.nextSibling;
  kill_element.textContent = `
#header {
  display: none !important;
}
.menubar-links-outer {
  position: absolute;
  z-index: 1000;
  top: 0;
  right: 0;
  flex-direction: row-reverse;
}

.menubar-labels{
  line-height: 10px;
  margin-right: 10px;
}

.menubar-label-link.selected{
  color: #fff !important;
}

.menu-login-item {
  color: #fff !important;
}
#small-footer-wrapper {
  display: none !important;
}
.login-dropdown-divider {
  display:none !important;
}
.login-dropdown-content {
  padding: 12px 12px 12px !important;
  border-top: 2.4px #009fad solid;
}
`;
  return value => {
    if (value) {
      document.getElementById('header-wrapper').before(menubar_wrapper);
      document.head.appendChild(kill_element);
    } else {
      menubar_wrapper_normal_position.before(menubar_wrapper);
      if (kill_element.parentNode) kill_element.parentNode.removeChild(kill_element);
    }
    window.dispatchEvent(new Event('resize')); // Recalculate sizes of elements
  };
})(), true);

// Feed moderator icon
enhanced_settings.add_hook('feed_moderation', (() => {
  let style = document.createElement('style');
  style.textContent = '#feed-topic .cmty-topic-moderate{ display: inline !important; }';
  return value => {
    if (value) {
      document.head.appendChild(style);
    } else {
      if (style.parentNode) style.parentNode.removeChild(style);
    }
  };
})(), true);

// Notifications
enhanced_settings.add_hook('notifications', (() => {
  let notify_functions = [
    AoPS.Ui.Flyout.display,
    a => {
      var textextract = document.createElement("div");
      textextract.innerHTML = a.replace('<br>', '\n');
      var y = $(textextract).text()
      var notification = new Notification("AoPS Enhanced", { body: y, icon: 'https://artofproblemsolving.com/online-favicon.ico', tag: y });
      setTimeout(notification.close.bind(notification), 5000);
    }
  ];
  return value => {
    if (value && Notification.permission != "granted") Notification.requestPermission();
    AoPS.Ui.Flyout.display = notify_functions[+value];
  };
})(), true);

function show_enhanced_configurator() {
  UI_ELEMENTS = {
    notifications: settings_ui.toggle('Notifications'),
    post_links: settings_ui.toggle('Post links'),
    feed_moderation: settings_ui.toggle('Feed moderate icon'),
    kill_top: settings_ui.toggle('Simplify UI'),
    quote_primary: settings_ui.select('Primary quote', Object.keys(quote_schemes).map(k => [k, k])),
    quote_secondary: settings_ui.select('Ctrl quote', Object.keys(quote_schemes).map(k => [k, k])),
    theme: settings_ui.select('Theme', Object.keys(themes).map(k => [k, k])),
  }
  let settings_modal = document.createElement('div');
  for (let key in UI_ELEMENTS) {
    settings_modal.appendChild(UI_ELEMENTS[key](key, enhanced_settings.get(key), enhanced_settings));
    settings_modal.appendChild(document.createElement('br'));
  }
  alert(settings_modal);
}

// Add "Enhanced" option to login dropdown
(el => {
  if (el === null) return;
  let enhanced_settings_element = document.createElement('a');
  enhanced_settings_element.classList.add('menu-item');
  enhanced_settings_element.innerText = 'Enhanced';
  enhanced_settings_element.addEventListener('click', e => { e.preventDefault(); show_enhanced_configurator(); });
  el.appendChild(enhanced_settings_element);
})(document.querySelector('.login-dropdown-content'));

// Prevent errors when trying to modify AoPS Community on pages where it doesn't exist
if (AoPS.Community) {
  AoPS.Community.Views.Post.prototype.onClickQuote = function (e) {
    quote_schemes[enhanced_settings.get(e.ctrlKey ? 'quote_secondary' : 'quote_primary')].call(this);
  };

  // Direct links
  (() => {
    let real_onClickDirectLink = AoPS.Community.Views.Post.prototype.onClickDirectLink;
    function direct_link_function(e) {
      let url = 'https://aops.com/community/p' + this.model.get("post_id");
      navigator.clipboard.writeText(url);
      AoPS.Ui.Flyout.display(`URL copied: ${url}`);
    }
    AoPS.Community.Views.Post.prototype.onClickDirectLink = function (e) {
      (enhanced_settings.get('post_links') ? direct_link_function : real_onClickDirectLink).call(this, e);
    }
  })();
}
