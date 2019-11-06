// ==UserScript==
// @name         AoPS Enhanced
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       happycupcake/EpicCakeKing
// @match        https://artofproblemsolving.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    //Enhanced quotes
    AoPS.Community.Views.Post.prototype.onClickQuote=function() {
        if (!AoPS.session.logged_in) {
            AoPS.Ui.buildLoginConfirm(Lang["topic-full-unregistered-reply"]);
        } else if (AoPS.isUserLimited()) {
            Modal.showMessage(Lang["new-reply-no-permission-limited"], {
                width: "450px",
            });
        } else {
            if (this.topic.model.get("locked")) {
                Modal.showMessage(Lang["topic-full-reply-to-locked"]);
            } else if (this.topic.model.get("forum_locked")) {
                Modal.showMessage(Lang["topic-full-reply-to-forum-locked"]);
            } else {
                this.topic.appendToReply(
                    "[quote name=\"" +
                    this.model.get("username") +
                    "\" url=\"https://artofproblemsolving.com/community/p"+
                    this.model.get("post_id")+
                    "\"]\n" +
                    $.trim(this.model.get("post_canonical")) +
                    "\n[/quote]\n\n"
                );
            }
        }
    }
    //Copy links
    AoPS.Community.Views.Post.prototype.onClickDirectLink=function(){
        var copytemp = document.createElement("input");
        copytemp.type="text";
        copytemp.style="position: fixed; top: -1000px;"
        copytemp.value='https://artofproblemsolving.com/community/p'+this.model.get("post_id");
        document.getElementsByTagName('body')[0].append(copytemp)
        copytemp.select();
        document.execCommand("copy");
        copytemp.remove()
        AoPS.Ui.Flyout.display("Url copied (https://artofproblemsolving.com/community/p"+this.model.get("post_id")+").")
    }
    //Notifications
    if (Notification.permission == "default"){
        setTimeout(function(){
            alert("AoPS Enhanced can change flyouts into browser notifications. If you want this you should close this prompt, click anywhere, allow notifications, and refresh. Otherwise you can block notifications to disable this.");
            document.onclick=function(){
                Notification.requestPermission();
            }
        }, 1000);
    }else{
        AoPS.Ui.Flyout.display=function(x){
            var notification = new Notification("AoPS Enhanced", {body: x, icon: 'https://artofproblemsolving.com/online-favicon.ico',tag: x});
            setTimeout(notification.close.bind(notification), 4000);
        }
    }
    //Disable idle monitor
    AoPS.Community.Constants.idle_monitor_interval=0;
})();
