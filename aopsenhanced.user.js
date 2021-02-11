// ==UserScript==
// @name         AoPS Enhanced
// @namespace    http://tampermonkey.net/
// @version      5.14.1
// @description  try to take over the world!
// @author       happycupcake/epiccakeking
// @match        https://artofproblemsolving.com/*
// @grant        none
// @run-at document-start
// ==/UserScript==

(function() {
    'use strict';
    //Dark theme options
    var darkstart=Number(JSON.parse(localStorage.getItem('darkstart')));
    var darkend=Number(JSON.parse(localStorage.getItem('darkend')));
    var currdark=Number((new Date().getHours())>=12+darkstart || (new Date().getHours())<darkend)
    var darkontimer=JSON.parse(localStorage.getItem('darkontimer'));
    var darkinterval=Number(JSON.parse(localStorage.getItem('darkinterval'))) || 5;
    if(darkontimer){
        setInterval(function(){
            var newdark=Number((new Date().getHours())>=12+darkstart || (new Date().getHours())<darkend)
            if (currdark!=newdark){
                darkthemeupdate()
                currdark=newdark;
            }
        },darkinterval*1000);
    }
    function blockthreads(){
        var head=document.getElementsByTagName('head')[0];
        if (localStorage.getItem('blockedthreads')){
            if (document.getElementById("blockthread")==null){
                var blockthread=document.createElement('style');
                blockthread.id="blockthread"
                head.appendChild(blockthread);
            }else{
                head.appendChild(document.getElementById("blockthread"));
            }
            document.getElementById("blockthread").innerText='.cmty-topic-cell[title*="'+localStorage.getItem('blockedthreads').split("\n").join('"], .cmty-topic-cell[title*="')+`"]{
                display: none;
            }`;
        }
    }
    function darkthemeupdate(){
        if (JSON.parse(localStorage.getItem('darktheme'))){
            document.getElementsByClassName('head');
            var theme=(Number(JSON.parse(localStorage.getItem('darktheme')))+Number(JSON.parse(localStorage.getItem('darkthemecompat'))));
            if (darkontimer && !(Number((new Date().getHours())>=12+darkstart || (new Date().getHours())<darkend))){
                theme=0
            }
        }
        var persistdarkcode=`
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
}`
        var darks=[``,`:root{
mix-blend-mode: difference;
background: white;
}
#page-wrapper,
.aops-modal-wrapper,
#feed-wrapper > * > *{
filter: hue-rotate(180deg);
}`,`#page-wrapper,
.aops-modal-wrapper,
#feed-wrapper > * > *{
filter: invert(1) hue-rotate(180deg);
}
body{
background: url('data:image/png;base64,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') !important;
}`]
        var head=document.getElementsByTagName('head')[0];
        if (theme!=null){
            if (document.getElementById("theme")==null){
                var elmnttheme=document.createElement('style');
                elmnttheme.id="theme"
                head.appendChild(elmnttheme);
            }else{
                head.appendChild(document.getElementById("theme"));
            }
            if (theme!=0){
                document.getElementById("theme").innerHTML=darks[theme]+persistdarkcode;
            }else{
                document.getElementById("theme").innerHTML=''
            }
        }
    }
    /*Update dark theme*/
    try{darkthemeupdate();}catch(e){};
    document.addEventListener('DOMContentLoaded', function() {
        /*Ensure proper application of darkmode*/
        try{darkthemeupdate();}catch(e){};
        /*Safety first!*/
        if (AoPS.Community){
            //Enhanced quotes
            AoPS.Community.Views.Post.prototype.onClickQuote=function() {
                this.topic.appendToReply(`\n[hide=Post #${this.model.get("post_number")} by ${this.model.get("username")}][url=aops.com/community/user/${this.model.get("poster_id")}][b]${this.model.get("username")}[/b][/url] · ${this.model.get("date_rendered")} [url=aops.com/community/p${this.model.get("post_id")}](view)[/url][color=transparent]helo[/color]\n${this.model.get("post_canonical").trim()}\n\n-----------\n[color=#5b7083][aops]x[/aops] ${this.model.get("post_number")}[color=transparent]hellloolo[/color] [aops]Y[/aops] ${this.model.get("thanks_received")} [color=transparent]hellloolo[/color] [/hide]\n\n[tip=@${this.model.get("username")}][img]https:${this.model.get("avatar")}[/img]\nAoPS User[/tip] `);
            }
            //Copy links
            AoPS.Community.Views.Post.prototype.onClickDirectLink=function(e){
                var copytemp = document.createElement("input");
                copytemp.type="text";
                copytemp.style="position: fixed; top: -1000px;"; //May be unnecessary but it should keep the temporary element from briefly causing issues.
                copytemp.value='https://aops.com/community/p'+this.model.get("post_id");
                document.getElementsByTagName('body')[0].append(copytemp);
                copytemp.select();
                document.execCommand("copy");
                copytemp.remove();
                AoPS.Ui.Flyout.display("Url copied (https://aops.com/community/p"+this.model.get("post_id")+").");
            }
            //Notifications
            if (localStorage.getItem('enhancednotifications')=='true'){
              if (Notification.permission == "granted"){
                  AoPS.Ui.Flyout.display=function(x){
                      var textextract=document.createElement("div")
                      textextract.innerHTML=x.replace('<br>','\n');
                      var y=$(textextract).text()
                      var notification = new Notification("AoPS Enhanced", {body: y, icon: 'https://artofproblemsolving.com/online-favicon.ico',tag: y});
                      setTimeout(notification.close.bind(notification), 4000);
                  }
              }else{
                setTimeout(function(){
                  alert("Please grant permission to send notifications or turn off notifications at https://artofproblemsolving.com/enhancedsettings");
                  document.onclick=function(){
                      Notification.requestPermission();
                  }
                },1000);
              }
            }
            //Add custom stylesheet
            var sheet=document.createElement('style');
            sheet.innerHTML=`
#feed-topic .cmty-topic-moderate{
display: inline !Important;
}
#feed-wrapper .aops-scroll-inner{
overscroll-behavior: contain;
}
`
            document.getElementsByTagName('head')[0].appendChild(sheet);
            //Custom tag map
          if (localStorage.getItem('customautotags')!=null){
            function tagmapadd(triggertext,tag){
                AoPS.Community.term_tag_map[triggertext]= [
                    {
                        "text": tag,
                        "term_text": triggertext/*,
      "term_id": "id from tag url",
      "id": number?*/
                    }
                ]
            }
            var ctags=JSON.parse('[['+localStorage.getItem('customautotags').replace('\\n','],[')+']]');
            for (var tag in ctags){
                tagmapadd(ctags[tag][0],ctags[tag][1]);
            }
          }
            //Change post deleted action
            AoPS.Community.Views.Post.prototype.removePostFromTopic=AoPS.Community.Views.Post.prototype.setVisibility
            //Allow editing in locked topics
            //Since people seem to think this is a bug, removed .replace("highlight_report_button:", "highlight_report_button: s.is_reported ||") temporarily until a better solution can be found.
          AoPS.Community.Views.Post.prototype["render"]=new Function (
            "a",
            AoPS.Community.Views.Post.prototype["render"].toString().replace(/^function[^{]+{/i, "var e=AoPS.Community.Lang;").replace("can_edit:", "can_edit: this.topic.model.attributes.permissions.c_can_edit ||").replace(/}[^}]*$/i, "")
          );
          //Block threads
          blockthreads()
        }
        $(document).ready(function() {
            if (document.getElementById('enhancedsettings')==null){
                $($('.menubar-label.resources .dropdown-category')[0]).prepend('<a href="https://artofproblemsolving.com/enhancedsettings" id="enhancedsettings">AoPS Enhanced Settings</a>');
            }
        })
        if (window.location.href=='https://artofproblemsolving.com/enhancedsettings'){
            $('#main-column-standard')[0].innerHTML=`<h1>AoPS Enhanced Settings</h1><div class="aops-panel">
<h2>Custom Autotags</h2>
<p>Format your autotags as "Trigger text", "Tag name" and put each on a new line. USE DOUBLE QUOTES, otherwise errors may occur. Tags and triggers must be inputted all lowercase.</p>
<textarea id='enhancedcustomautotag'></textarea>
<button type='button' onclick="localStorage.setItem('customautotags',document.getElementById('enhancedcustomautotag').value);">Save</button>
</div>
<div class="aops-panel">
<h2>Dark mode settings</h2>
<p>Use these options to toggle dark mode. Try turning compatibility mode on or off if things are broken. Options autosave.</p>
<label><input type="checkbox" id="darktheme" onclick="localStorage.setItem('darktheme', JSON.stringify(this.checked));"/>Enable dark mode</label><br>
<label><input type="checkbox" id="darkthemecompat" onclick="localStorage.setItem('darkthemecompat', JSON.stringify(this.checked));"/>Dark mode compatibility mode (Use if things are still light)</label><br>
<h3>Scheduling options</h3>
<label><input type="checkbox" id="darkontimer" onclick="localStorage.setItem('darkontimer', JSON.stringify(this.checked));"/> Dark mode on schedule</label><br>
<label><input type="number" min='0' max='12' id="darkstart" onchange="localStorage.setItem('darkstart', JSON.stringify(this.value));"/> Starting hour (PM)</label><br>
<label><input type="number" min='0' max='12' id="darkend" onchange="localStorage.setItem('darkend', JSON.stringify(this.value));"/> Ending hour (AM)</label><br>
<label><input type="number" min='1' max='300' id="darkinterval" onchange="localStorage.setItem('darkinterval', JSON.stringify(this.value));"/> Checking interval (In seconds, default is 5). </label>
</div>
<div class="aops-panel">
<h2>Notifications</h2>
<label><input type="checkbox" id="enhancednotifications" onclick="localStorage.setItem('enhancednotifications', JSON.stringify(this.checked));"/> Use browser notifications instead of flyouts.</label><br>
</div>
<div class="aops-panel">
<h2>Blocked threads</h2>
<p>Type a list of terms to match, one per line.</p>
<textarea id='blockedthreads'></textarea>
<button type='button' onclick="localStorage.setItem('blockedthreads',document.getElementById('blockedthreads').value);">Save</button>
</div>`;
            document.getElementById('enhancedcustomautotag').value=localStorage.getItem('customautotags');
            document.getElementById('darktheme').checked=JSON.parse(localStorage.getItem('darktheme'));
            document.getElementById('darkthemecompat').checked=JSON.parse(localStorage.getItem('darkthemecompat'));
            document.getElementById('darkontimer').checked=JSON.parse(localStorage.getItem('darkontimer'));
            document.getElementById('darkstart').value=JSON.parse(localStorage.getItem('darkstart'));
            document.getElementById('darkend').value=JSON.parse(localStorage.getItem('darkend'));
            document.getElementById('darkinterval').value=JSON.parse(localStorage.getItem('darkinterval'));
            document.getElementById('blockedthreads').value=localStorage.getItem('blockedthreads');
            document.getElementById('enhancednotifications').checked=localStorage.getItem('enhancednotifications');
        }
    });
})();
