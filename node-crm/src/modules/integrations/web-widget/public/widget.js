(function () {
    "use strict";

    var currentScript = document.currentScript;
    if (!currentScript) {
        return;
    }

    var publicKey = currentScript.getAttribute("data-key");
    if (!publicKey) {
        console.error("[crm-widget] atributo data-key ausente no <script>.");
        return;
    }

    var apiOrigin = currentScript.src.split("/api/v1/")[0];
    var submitUrl = apiOrigin + "/api/v1/webhooks/web-widget/leads";
    var storageKey = "crmWidgetUtm";

    var buttonLabel = currentScript.getAttribute("data-label") || "Fale conosco";
    var buttonColor = currentScript.getAttribute("data-color") || "#FF9521";
    var contentType = currentScript.getAttribute("data-content-type") || "TEXT";
    var buttonIcon = currentScript.getAttribute("data-icon") || "";
    var showEmail = currentScript.getAttribute("data-show-email") !== "false";
    var showPhone = currentScript.getAttribute("data-show-phone") !== "false";
    var showMessage = currentScript.getAttribute("data-show-message") !== "false";

    // Conjunto fixo de ícones embutido aqui — não é upload nem URL livre (mesmo espírito
    // de "sem bundler, arquivo único", ver CLAUDE.md). currentColor herda a cor do texto
    // do botão (branco), então não precisa mudar o SVG ao trocar buttonColor.
    var ICONS = {
        chat: '<path d="M4 4h16v12H7l-3 3V4z"/>',
        message:
            '<path d="M2 4h20v14H6l-4 4V4z" fill="none" stroke="currentColor" stroke-width="2"/>',
        whatsapp:
            '<path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .9.9-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1a6.6 6.6 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4a.5.5 0 0 0 0-.5c-.1-.1-.5-1.3-.7-1.8s-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.9 2 4.7 4.7 0 0 0 1 2.5 10.7 10.7 0 0 0 4.1 3.6c.6.2 1 .4 1.4.5a3.3 3.3 0 0 0 1.5.1 2.5 2.5 0 0 0 1.6-1.1 2 2 0 0 0 .1-1.1c-.1-.1-.2-.2-.4-.3z"/>',
        help: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.9 15.5h-1.8v-1.8h1.8zm1.9-6.9c-.4.5-.9.9-1.3 1.3-.4.3-.6.7-.6 1.3v.4h-1.8v-.5c0-.9.4-1.5 1-2s1.1-.9 1.4-1.3a1.5 1.5 0 0 0 .3-.9 1.7 1.7 0 0 0-1.9-1.7 1.9 1.9 0 0 0-2 1.6l-1.8-.3A3.6 3.6 0 0 1 12 6.1a3.4 3.4 0 0 1 3.7 3.4 2.9 2.9 0 0 1-.9 2.1z"/>',
        phone:
            '<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2 11 11 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.4a1 1 0 0 1 1 1 11 11 0 0 0 .6 3.6 1 1 0 0 1-.2 1z"/>',
        cart: '<path d="M7 4h-2l-1 2h2l3.6 7.6-1.4 2.4a2 2 0 0 0 1.8 3h9v-2h-9l1.1-2h6.5a2 2 0 0 0 1.8-1.1l3-6a1 1 0 0 0-.9-1.5H6.2zM7 20a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm9 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z"/>',
    };

    var captureUtm = function () {
        var params = new URLSearchParams(window.location.search);
        var utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
        var hasUtm = utmKeys.some(function (key) {
            return params.has(key);
        });

        if (hasUtm) {
            var utm = {};
            utmKeys.forEach(function (key) {
                utm[key] = params.get(key) || "";
            });
            try {
                window.sessionStorage.setItem(storageKey, JSON.stringify(utm));
            } catch (e) {
                /* sessionStorage indisponível (modo privado etc.) — segue sem persistir */
            }
            return utm;
        }

        try {
            var stored = window.sessionStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    };

    var utm = captureUtm();

    // Shadow DOM (mode "open") isola o widget do CSS do site do cliente nos dois
    // sentidos — sem isso, qualquer regra global do site (ex.: "button { background:
    // red; padding: 20px 40px; border-radius: 50px }", comum em templates prontos)
    // vaza pro nosso botão/ícone e vice-versa. Confirmado em produção: sem Shadow DOM,
    // o botão flutuante saía com o vermelho e o padding do próprio site, escondendo o
    // ícone. "all:initial" no host zera qualquer propriedade herdada (fonte, line-height
    // etc. do body do site) antes de aplicar nosso próprio CSS por cima.
    var host = document.createElement("div");
    host.id = "crm-widget-host";
    host.style.all = "initial";
    document.body.appendChild(host);
    var root = host.attachShadow({ mode: "open" });

    var styleEl = document.createElement("style");
    styleEl.textContent =
        ":host{all:initial;}" +
        "*{box-sizing:border-box;}" +
        ".crm-widget-btn{position:fixed;bottom:24px;right:24px;z-index:2147483000;" +
        "background:" + buttonColor + ";color:#fff;border:none;border-radius:999px;" +
        "font-family:sans-serif;font-size:14px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.2);" +
        "display:flex;align-items:center;justify-content:center;margin:0;line-height:normal;}" +
        ".crm-widget-btn--text{padding:14px 20px;}" +
        ".crm-widget-btn--icon{width:64px;height:64px;padding:0;}" +
        ".crm-widget-btn--icon svg{width:32px;height:32px;fill:currentColor;flex-shrink:0;}" +
        ".crm-widget-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:2147483001;" +
        "display:none;align-items:center;justify-content:center;}" +
        ".crm-widget-overlay.open{display:flex;}" +
        ".crm-widget-panel{background:#fff;border-radius:8px;padding:24px;width:320px;" +
        "max-width:90vw;font-family:sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);}" +
        ".crm-widget-panel h3{margin:0 0 12px;font-size:16px;color:#111;font-weight:600;}" +
        ".crm-widget-panel input,.crm-widget-panel textarea{width:100%;box-sizing:border-box;" +
        "margin:0 0 10px;padding:8px;border:1px solid #ccc;border-radius:4px;font-size:14px;" +
        "font-family:sans-serif;color:#111;background:#fff;}" +
        ".crm-widget-panel button[type=submit]{width:100%;background:" + buttonColor + ";color:#fff;" +
        "border:none;border-radius:4px;padding:10px;font-size:14px;cursor:pointer;margin:0;}" +
        ".crm-widget-close{float:right;background:none;border:none;font-size:18px;line-height:1;" +
        "padding:0;margin:0;cursor:pointer;color:#666;}" +
        ".crm-widget-feedback{font-size:13px;color:#2a7a2a;margin-top:8px;display:none;}" +
        ".crm-widget-website-field{position:absolute;left:-9999px;top:-9999px;}";
    root.appendChild(styleEl);

    var button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", buttonLabel);

    if (contentType === "ICON" && ICONS[buttonIcon]) {
        button.className = "crm-widget-btn crm-widget-btn--icon";
        button.innerHTML = '<svg viewBox="0 0 24 24">' + ICONS[buttonIcon] + "</svg>";
    } else {
        button.className = "crm-widget-btn crm-widget-btn--text";
        button.textContent = buttonLabel;
    }

    var fieldsHtml =
        '<input type="text" name="name" placeholder="Nome" required />' +
        (showEmail ? '<input type="email" name="email" placeholder="E-mail" />' : "") +
        (showPhone ? '<input type="tel" name="phone" placeholder="Telefone" />' : "") +
        (showMessage ? '<textarea name="message" placeholder="Mensagem" rows="3"></textarea>' : "");

    var overlay = document.createElement("div");
    overlay.className = "crm-widget-overlay";
    overlay.innerHTML =
        '<div class="crm-widget-panel">' +
        '<button type="button" class="crm-widget-close" aria-label="Fechar">&times;</button>' +
        "<h3>Fale conosco</h3>" +
        '<form class="crm-widget-form">' +
        fieldsHtml +
        '<input type="text" name="website" class="crm-widget-website-field" tabindex="-1" autocomplete="off" />' +
        '<button type="submit">Enviar</button>' +
        '<div class="crm-widget-feedback"></div>' +
        "</form>" +
        "</div>";

    root.appendChild(button);
    root.appendChild(overlay);

    var closeBtn = overlay.querySelector(".crm-widget-close");
    var form = overlay.querySelector(".crm-widget-form");
    var feedback = overlay.querySelector(".crm-widget-feedback");

    button.addEventListener("click", function () {
        overlay.classList.add("open");
    });
    closeBtn.addEventListener("click", function () {
        overlay.classList.remove("open");
    });
    overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
            overlay.classList.remove("open");
        }
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        var formData = new FormData(form);
        var payload = {
            publicKey: publicKey,
            name: formData.get("name"),
            email: formData.get("email") || undefined,
            phone: formData.get("phone") || undefined,
            message: formData.get("message") || undefined,
            website: formData.get("website") || undefined,
            utmSource: utm.utm_source || undefined,
            utmMedium: utm.utm_medium || undefined,
            utmCampaign: utm.utm_campaign || undefined,
            utmTerm: utm.utm_term || undefined,
            utmContent: utm.utm_content || undefined,
            pageUrl: window.location.href,
            referrer: document.referrer || undefined,
        };

        fetch(submitUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then(function () {
                form.reset();
                feedback.textContent = "Recebemos sua mensagem, obrigado!";
                feedback.style.display = "block";
                setTimeout(function () {
                    overlay.classList.remove("open");
                    feedback.style.display = "none";
                }, 2000);
            })
            .catch(function () {
                feedback.textContent = "Não foi possível enviar agora. Tente novamente.";
                feedback.style.display = "block";
            });
    });
})();
