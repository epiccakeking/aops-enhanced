// ==UserScript==
// @name         AoPS Enhanced
// @namespace    http://tampermonkey.net/
// @version      0.5.1
// @description  try to take over the world!
// @author       happycupcake/EpicCakeKing
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
    function darkthemeupdate(){
        if (JSON.parse(localStorage.getItem('darktheme'))){
            document.getElementsByClassName('head');
            var theme=(Number(JSON.parse(localStorage.getItem('darktheme')))+Number(JSON.parse(localStorage.getItem('darkthemecompat'))));
            if (darkontimer && !(Number((new Date().getHours())>=12+darkstart || (new Date().getHours())<darkend))){
                theme=0
            }
        }
        var persistdarkcode=`*{
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
background: url('https://i.imgur.com/eklsU6V.png') !important;
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
                document.getElementById("theme").innerHTML=persistdarkcode+darks[theme];
            }else{
                document.getElementById("theme").innerHTML=''
            }
        }
    }
    /*Update dark theme*/
    darkthemeupdate()
    document.addEventListener('DOMContentLoaded', function() {
        /*Ensure proper application of darkmode*/
        darkthemeupdate()
        /*Safety first!*/
        if (AoPS.Community){
            //Enhanced quotes
            AoPS.Community.Views.Post.prototype.onClickQuote=function() {
                this.topic.appendToReply("[quote name=\"" +this.model.get("username") +"\" url=\"https://artofproblemsolving.com/community/p"+this.model.get("post_id")+"\"]\n" +this.model.get("post_canonical").trim()+"\n[/quote]\n\n");
            }
            //Copy links
            AoPS.Community.Views.Post.prototype.onClickDirectLink=function(){
                var copytemp = document.createElement("input");
                copytemp.type="text";
                copytemp.style="position: fixed; top: -1000px;"; //May be unnecessary but it should keep the temporary element from briefly causing issues.
                copytemp.value='https://artofproblemsolving.com/community/p'+this.model.get("post_id");
                document.getElementsByTagName('body')[0].append(copytemp);
                copytemp.select();
                document.execCommand("copy");
                copytemp.remove();
                AoPS.Ui.Flyout.display("Url copied (https://artofproblemsolving.com/community/p"+this.model.get("post_id")+").");
            }
            //Notifications
            if (Notification.permission == "default"){
                setTimeout(function(){
                    alert("AoPS Enhanced can change flyouts into browser notifications. Grant the permission and refresh the page to enable, block notifications to disable.");
                    document.onclick=function(){
                        Notification.requestPermission();
                    }
                }, 1000);
            }else{
                AoPS.Ui.Flyout.display=function(x){
                    var textextract=document.createElement("div")
                    textextract.innerHTML=x.replace('<br>','\n');
                    var y=$(textextract).text()
                    var notification = new Notification("AoPS Enhanced", {body: y, icon: 'https://artofproblemsolving.com/online-favicon.ico',tag: y});
                    setTimeout(notification.close.bind(notification), 4000);
                }
            }
            //Disable idle monitor
            AoPS.Community.Constants.idle_monitor_interval=0;
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
            //Change post deleted action
            AoPS.Community.Views.Post.prototype.removePostFromTopic=AoPS.Community.Views.Post.prototype.setVisibility

        }
        $(document).ready(function() {
            if (document.getElementById('enhancedsettings')==null){
                $($('.menubar-label.resources .dropdown-category')[0]).prepend('<a href="https://artofproblemsolving.com/enhancedsettings" id="enhancedsettings">AoPS Enhanced Settings</a>');
            }
        })
        if (window.location.href=='https://artofproblemsolving.com/enhancedsettings'){
            $('#main-column-standard')[0].innerHTML=`<div class="aops-panel">
<h2>Custom Autotag</h2>
<p>Format your autotags as "Trigger text", "Tag name". USE DOUBLE QUOTES, otherwise errors may occur. Tags and triggers must be inputted all lowercase.</p>
<textarea id='enhancedcustomautotag'></textarea>
<button type='button' onclick="localStorage.setItem('customautotags',document.getElementById('enhancedcustomautotag').value);">Save</button>
</div>
<div class="aops-panel">
<h2>Dark mode settings</h2>
<p>Use these options to toggle dark mode. Try turning compatibility mode on or off if things are broken. Options autosave.</p>
<label><input type="checkbox" id="darktheme" onclick="localStorage.setItem('darktheme', JSON.stringify(this.checked));"/> Dark mode</label><br>
<label><input type="checkbox" id="darkthemecompat" onclick="localStorage.setItem('darkthemecompat', JSON.stringify(this.checked));"/> Dark mode compatibility mode (Loads a background image from imgur)</label><br>
<h3>Scheduling options</h3>
<label><input type="checkbox" id="darkontimer" onclick="localStorage.setItem('darkontimer', JSON.stringify(this.checked));"/> Dark mode on schedule</label><br>
<label><input type="number" min='0' max='12' id="darkstart" onchange="localStorage.setItem('darkstart', JSON.stringify(this.value));"/> Starting hour (PM)</label><br>
<label><input type="number" min='0' max='12' id="darkend" onchange="localStorage.setItem('darkend', JSON.stringify(this.value));"/> Ending hour (AM)</label><br>
<label><input type="number" min='1' max='300' id="darkinterval" onchange="localStorage.setItem('darkinterval', JSON.stringify(this.value));"/> Checking interval (In seconds, default is 5). </label>
</div>`;
            document.getElementById('enhancedcustomautotag').value=localStorage.getItem('customautotags');
            document.getElementById('darktheme').checked=JSON.parse(localStorage.getItem('darktheme'));
            document.getElementById('darkthemecompat').checked=JSON.parse(localStorage.getItem('darkthemecompat'));
            document.getElementById('darkontimer').checked=JSON.parse(localStorage.getItem('darkontimer'));
            document.getElementById('darkstart').value=JSON.parse(localStorage.getItem('darkstart'));
            document.getElementById('darkend').value=JSON.parse(localStorage.getItem('darkend'));
            document.getElementById('darkinterval').value=JSON.parse(localStorage.getItem('darkinterval'));
        }
    });
})();
