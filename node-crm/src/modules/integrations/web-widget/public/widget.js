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

    var styleEl = document.createElement("style");
    styleEl.textContent =
        ".crm-widget-btn{position:fixed;bottom:24px;right:24px;z-index:2147483000;" +
        "background:#1581b7;color:#fff;border:none;border-radius:999px;padding:14px 20px;" +
        "font-family:sans-serif;font-size:14px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.2);}" +
        ".crm-widget-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:2147483001;" +
        "display:none;align-items:center;justify-content:center;}" +
        ".crm-widget-overlay.open{display:flex;}" +
        ".crm-widget-panel{background:#fff;border-radius:8px;padding:24px;width:320px;" +
        "max-width:90vw;font-family:sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);}" +
        ".crm-widget-panel h3{margin:0 0 12px;font-size:16px;color:#111;}" +
        ".crm-widget-panel input,.crm-widget-panel textarea{width:100%;box-sizing:border-box;" +
        "margin-bottom:10px;padding:8px;border:1px solid #ccc;border-radius:4px;font-size:14px;}" +
        ".crm-widget-panel button[type=submit]{width:100%;background:#1581b7;color:#fff;border:none;" +
        "border-radius:4px;padding:10px;font-size:14px;cursor:pointer;}" +
        ".crm-widget-close{float:right;background:none;border:none;font-size:18px;cursor:pointer;color:#666;}" +
        ".crm-widget-feedback{font-size:13px;color:#2a7a2a;margin-top:8px;display:none;}" +
        ".crm-widget-website-field{position:absolute;left:-9999px;top:-9999px;}";
    document.head.appendChild(styleEl);

    var button = document.createElement("button");
    button.className = "crm-widget-btn";
    button.type = "button";
    button.textContent = currentScript.getAttribute("data-label") || "Fale conosco";

    var overlay = document.createElement("div");
    overlay.className = "crm-widget-overlay";
    overlay.innerHTML =
        '<div class="crm-widget-panel">' +
        '<button type="button" class="crm-widget-close" aria-label="Fechar">&times;</button>' +
        "<h3>Fale conosco</h3>" +
        '<form class="crm-widget-form">' +
        '<input type="text" name="name" placeholder="Nome" required />' +
        '<input type="email" name="email" placeholder="E-mail" />' +
        '<input type="tel" name="phone" placeholder="Telefone" />' +
        '<textarea name="message" placeholder="Mensagem" rows="3"></textarea>' +
        '<input type="text" name="website" class="crm-widget-website-field" tabindex="-1" autocomplete="off" />' +
        '<button type="submit">Enviar</button>' +
        '<div class="crm-widget-feedback"></div>' +
        "</form>" +
        "</div>";

    document.body.appendChild(button);
    document.body.appendChild(overlay);

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
