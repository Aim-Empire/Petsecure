(() => {
  function showPsModal(title, text) {
    const modal = document.getElementById("ps-modal");
    const titleEl = document.getElementById("ps-modal-title");
    const textEl = document.getElementById("ps-modal-text");

    if (!modal || !titleEl || !textEl) {
      alert(`${title}\n\n${text}`);
      return;
    }

    titleEl.textContent = title;
    textEl.textContent = text;
    modal.classList.add("show");

    const close = () => modal.classList.remove("show");

    const mainBtn = document.getElementById("ps-modal-close");
    const secondBtn = document.getElementById("ps-modal-close-secondary");

    if (mainBtn) mainBtn.addEventListener("click", close, { once: true });
    if (secondBtn) secondBtn.addEventListener("click", close, { once: true });

    setTimeout(close, 4000);
  }

  const successMessages = {
    "card-intent":
      "Thank you. Your card payment intent has been submitted. A Bsons PetSecure team member will review it and send you a secure checkout link or next steps.",
    "crypto-intent":
      "Thank you. We’ve received your crypto donation / payment request. The team will contact you shortly with a verified wallet address and exact amount to send.",
    "giftcard-intent":
      "Thank you. Your gift card details have been submitted securely. The PetSecure team will review the card and send you confirmation and redemption steps.",
    "adopt":
      "Thank you for your interest in adoption. A member of the Bsons PetSecure team will reach out soon.",
    "ngo":
      "Thank you. We’ve received your NGO / rescue enquiry and will follow up shortly.",
    "contact":
      "Your message has been received. Our team will contact you shortly."
  };

  function encodeFormData(formData) {
    const pairs = [];
    for (const [key, value] of formData.entries()) {
      pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(value)));
    }
    return pairs.join("&");
  }

  async function submitNetlifyForm(form, formType) {
    const formName = form.getAttribute("name") || "ps-form";
    const baseText = successMessages[formType] || successMessages["contact"];

    let title = "Message sent";
    if (formType === "card-intent") title = "Card payment intent sent";
    if (formType === "crypto-intent") title = "Crypto request received";
    if (formType === "giftcard-intent") title = "Gift card request received";

    const formData = new FormData(form);

    // Netlify uses this hidden field to know which form it is
    if (!formData.has("form-name")) {
      formData.append("form-name", formName);
    }

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeFormData(formData),
      });

      if (response.ok) {
        try {
          form.reset();
        } catch (_) {}
        showPsModal(title, baseText);
      } else {
        showPsModal(
          "Something went wrong",
          "We couldn’t complete your request right now. Please try again shortly or contact us on WhatsApp."
        );
      }
    } catch (err) {
      showPsModal(
        "Network problem",
        "Please check your internet connection and try again."
      );
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const forms = document.querySelectorAll("form[data-ps-form]");

    forms.forEach((form) => {
      const formType = form.dataset.psForm || "contact";

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await submitNetlifyForm(form, formType);
      });
    });
  });
})();
