(function () {
    var script = document.currentScript;
    var businessId = script.getAttribute("data-business") || "";
    var origin = new URL(script.src).origin;
  
    function init() {
      var frame = document.createElement("iframe");
      frame.title = "Chat";
      frame.style.cssText =
        "position:fixed;bottom:80px;right:20px;width:380px;max-width:calc(100vw - 40px);" +
        "height:560px;max-height:calc(100vh - 100px);border:0;border-radius:16px;" +
        "box-shadow:0 8px 30px rgba(0,0,0,.3);z-index:2147483647;display:none;background:#fff";
  
      var btn = document.createElement("button");
      btn.textContent = "Chat";
      btn.setAttribute("aria-label", "Open chat");
      btn.style.cssText =
        "position:fixed;bottom:20px;right:20px;z-index:2147483647;background:#0c4a6e;" +
        "color:#fff;border:0;border-radius:9999px;padding:14px 22px;" +
        "font:600 15px system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25)";
  
      var open = false;
      btn.onclick = function () {
        open = !open;
        if (open && !frame.src) {
          frame.src = origin + "/embed/" + encodeURIComponent(businessId);
        }
        frame.style.display = open ? "block" : "none";
        btn.textContent = open ? "Close" : "Chat";
      };
  
      document.body.appendChild(frame);
      document.body.appendChild(btn);
    }
  
    if (document.body) init();
    else document.addEventListener("DOMContentLoaded", init);
  })();