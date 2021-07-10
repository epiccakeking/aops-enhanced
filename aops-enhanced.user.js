// ==UserScript==
// @name        AoPS Enhanced (WIP Rewrite)
// @namespace   https://gitlab.com/epiccakeking
// @match       https://artofproblemsolving.com/*
// @grant       none
// @version     5.99.15
// @author      epiccakeking
// @description Work in progress AoPS Enhanced rewrite
// @license     MIT
// ==/UserScript==

class EnhancedSettingsManager {
  /** Default settings */
  DEFAULTS = {
    notifications: true,
    post_links: true,
    feed_moderation: true,
    kill_top: false,
    quote_primary: 'enhanced',
    quote_secondary: 'enhanced',
    time_format: '',
  };

  /**
   *
   * @param {string} storage_variable
   */
  constructor(storage_variable) {
    this.storage_variable = storage_variable
    this._settings = (a => a === null ? {} : JSON.parse(a))(localStorage.getItem(this.storage_variable));
  }

  /**
   * Retrieves a setting.
   * @param {string} setting - Setting to retrieve
   */
  get(setting) {
    return setting in this._settings ? this._settings[setting] : this.DEFAULTS[setting];
  }

  /**
   * Sets a setting.
   * @param {string} setting - Setting to change
   * @param {*} value - Value to set
   */
  set(setting, value) {
    this._settings[setting] = value;
    localStorage.setItem(this.storage_variable, JSON.stringify(this._settings));
  }
}

let enhanced_settings = new EnhancedSettingsManager('enhanced_settings');

function show_enhanced_configurator() {
  // AoPS already has a decent HTML popup system, why reinvent the wheel.
  alert(`<form id='enhanced_settings'>
Some changes will not apply until the page is refreshed.<br>
<label><input name='notifications' type='checkbox'> Notifications</label><br>
<label><input name='post_links' type='checkbox'> Easy post links</label><br>
<label><input name='feed_moderation' type='checkbox'> Enable moderator buttons in feed</label><br>
<label><input name='kill_top' type='checkbox'> Simplify UI</label><br>
<label>Quote mode <select name='quote_primary'>
<option value='aops'>AoPS Default</option>
<option value='enhanced'>Enhanced</option>
<option value='link'>Link</option>
<option value='hide'>Hide</option>
</select></label><br>
<label>Ctrl Quote mode <select name='quote_secondary'>
<option value='aops'>AoPS Default</option>
<option value='enhanced'>Enhanced</option>
<option value='link'>Link</option>
<option value='hide'>Hide</option>
</select></label><br>
</form>`);
  for (element of document.getElementById('enhanced_settings').querySelectorAll('[name]')) {
    if (element.nodeName == 'INPUT' && element.getAttribute('type') == 'checkbox') {
      element.checked = enhanced_settings.get(element.getAttribute('name'));
      element.addEventListener('change', e => enhanced_settings.set(e.target.getAttribute('name'), e.target.checked));
    } else {
      element.value = enhanced_settings.get(element.getAttribute('name'));
      element.addEventListener('change', e => enhanced_settings.set(e.target.getAttribute('name'), e.target.value));
    }
  }
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

// Add CSS for feed moderation if enabled
if (enhanced_settings.get('feed_moderation')) {
  document.head.appendChild(document.createElement('style')).textContent = '#feed-topic .cmty-topic-moderate{ display: inline !important; }';
}
if (enhanced_settings.get('kill_top')) {
  const loginwrap = document.getElementsByClassName('menu-login-wrapper')[0];
  loginwrap.id = 'loginwrap';
  document.getElementById('header-wrapper').before(loginwrap);
  document.head.appendChild(document.createElement('style')).textContent = `
  #header-wrapper #header {
    margin-top: 0px;
    display: none !important;
    transition: none !important;
  }
  #header-wrapper #header.visible-faded {
    display: block !important;
    position: absolute;
    z-index: 5000;
    opacity: 0.7;
  }
  #header-wrapper #header.visible-bright {
    display: block !important;
    position: absolute;
    z-index: 5000;
  }
  #loginwrap {
    position: absolute;
    z-index: 10000;
    top: 0;
    right: 0;
  }
  .mediawiki .menu-login-item, .online .menu-login-item {
    color: #dedede;
  }
  #small-footer-wrapper {
    display: none !important;
  }
  `;
  const header = document.getElementById('header');
  loginwrap.onmouseenter = () => {
    header.classList.add('visible-faded');
  };
  loginwrap.onmouseleave = () => {
    window.setTimeout(() => { header.classList.remove('visible-faded'); }, 150);
  };
  header.onmouseenter = () => {
    header.classList.add('visible-bright');
  };
  header.onmouseleave = () => {
    window.setTimeout(() => { header.classList.remove('visible-bright'); }, 150);
  };
}

// Prevent errors when trying to modify AoPS Community on pages where it doesn't exist
if (AoPS.Community) {
  // Quotes
  const QUOTE_SCHEMES = {
    aops: AoPS.Community.Views.Post.prototype.onClickQuote,
    enhanced: function () { this.topic.appendToReply("[quote name=\"" + this.model.get("username") + "\" url=\"/community/p" + this.model.get("post_id") + "\"]\n" + this.model.get("post_canonical").trim() + "\n[/quote]\n\n") },
    link: function () { this.topic.appendToReply(`@[url=https://aops.com/community/p${this.model.get("post_id")}]${this.model.get("username")} (#${this.model.get("post_number")}):[/url]`); },
    hide: function () {
      this.topic.appendToReply(`[hide=Post #${this.model.get("post_number")} by ${this.model.get("username")}]
  [url=https://aops.com/user/${this.model.get("poster_id")}]${this.model.get('username')}[/url] [url=https://aops.com/community/p${this.model.get("post_id")}](view original)[/url]
  ${this.model.get('post_canonical').trim()}
  [/hide]

  `);
    },
  };
  AoPS.Community.Views.Post.prototype.onClickQuote = function (e) {
    QUOTE_SCHEMES[enhanced_settings.get(e.ctrlKey ? 'quote_secondary' : 'quote_primary')].call(this);
  };

  // Notifications
  if (enhanced_settings.get('notifications')) {
    if (Notification.permission == 'granted') {
      AoPS.Ui.Flyout.display = a => {
        var textextract = document.createElement("div");
        textextract.innerHTML = a.replace('<br>', '\n');
        var y = $(textextract).text()
        var notification = new Notification("AoPS Enhanced", { body: y, icon: 'https://artofproblemsolving.com/online-favicon.ico', tag: y });
        setTimeout(notification.close.bind(notification), 5000);
      }
    } else {
      setTimeout(() => alert("Please grant permission to send notifications or turn off notifications at https://artofproblemsolving.com/enhancedsettings"), 1000)
      document.onclick = () => Notification.requestPermission();
    }
  }

  // Direct linking
  if (enhanced_settings.get('post_links')) {
    AoPS.Community.Views.Post.prototype.onClickDirectLink = function (e) {
      let url = 'https://aops.com/community/p' + this.model.get("post_id");
      navigator.clipboard.writeText(url);
      AoPS.Ui.Flyout.display(`Url copied (${url})`);
    }
  }
}
