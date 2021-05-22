// ==UserScript==
// @name        AoPS Enhanced (WIP Rewrite)
// @namespace   https://gitlab.com/epiccakeking
// @match       https://artofproblemsolving.com/*
// @grant       none
// @version     5.99.3
// @author      epiccakeking
// @description Work in progress AoPS Enhanced rewrite
// @license     MIT
// ==/UserScript==

const QUOTE_SCHEMES = {
  'aops': AoPS.Community.Views.Post.prototype.onClickQuote,
  'enhanced': function () { this.topic.appendToReply("[quote name=\"" + this.model.get("username") + "\" url=\"/community/p" + this.model.get("post_id") + "\"]\n" + this.model.get("post_canonical").trim() + "\n[/quote]\n\n") },
  'link': function () { this.topic.appendToReply(`@[url=https://aops.com/community/p${this.model.get("post_id")}]${this.model.get("username")} (#${this.model.get("post_number")}):[/url]`); },
};

function get_enhanced_setting(setting) {
  let ENHANCED_DEFAULTS = {
    'enhanced_notifications': true,
    'enhanced_quote': 'enhanced',
  };
  let value = localStorage.getItem(setting);
  if (value === null) return ENHANCED_DEFAULTS[setting];
  return JSON.parse(value);
}

function set_enhanced_setting(setting, value) {
  localStorage.setItem(setting, JSON.stringify(value))
}

function show_enhanced_configurator() {
  // AoPS already has a decent HTML popup system, why reinvent the wheel.
  alert(`<form id='enhanced_settings'>
<label><input name='enhanced_notifications' type='checkbox'> Notifications</label><br>
<label>Quote mode <select name='enhanced_quote'>
<option value='aops'>AoPS Default/option>
<option value='enhanced'>Enhanced</option>
<option value='link'>Link</option>
</select></label><br>
</form>`);
  for (element of document.getElementById('enhanced_settings').querySelectorAll('[name^=enhanced_]')) {
    if (element.nodeName == 'INPUT' && element.getAttribute('type') == 'checkbox') {
      element.checked = get_enhanced_setting(element.getAttribute('name'));
      element.addEventListener('change', e => set_enhanced_setting(e.target.getAttribute('name'), e.target.checked));
    } else {
      element.value = get_enhanced_setting(element.getAttribute('name'));
      element.addEventListener('change', e => set_enhanced_setting(e.target.getAttribute('name'), e.target.value));
    }
  }
}

let enhanced_settings_element = document.createElement('a');
enhanced_settings_element.classList.add('menu-item');
enhanced_settings_element.innerText = 'Enhanced';
enhanced_settings_element.addEventListener('click', e => { e.preventDefault(); show_enhanced_configurator(); });
document.getElementsByClassName('login-dropdown-content')[0].appendChild(enhanced_settings_element);


AoPS.Community.Views.Post.prototype.onClickQuote = QUOTE_SCHEMES[get_enhanced_setting('enhanced_quote')];

// Direct linking
AoPS.Community.Views.Post.prototype.onClickDirectLink = function (e) {
  let url = 'https://aops.com/community/p' + this.model.get("post_id");
  navigator.clipboard.writeText(url);
  AoPS.Ui.Flyout.display(`Url copied (${url})`);
}