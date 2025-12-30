// public/js/app.js

const API_BASE = "/api/articles";

document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  setupTabs();
  setupForms();
  setupModal();
  loadLatestArticles();
});

/* ==== Onglets ==== */
function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const tabs = document.querySelectorAll(".tab");

  if (!buttons.length || !tabs.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      if (!target) return;

      buttons.forEach((b) => b.classList.remove("active"));
      tabs.forEach((t) => t.classList.remove("active"));

      btn.classList.add("active");
      const section = document.getElementById(`tab-${target}`);
      if (section) section.classList.add("active");

      if (target === "home") loadLatestArticles();
    });
  });
}

/* ==== Formulaires & filtres ==== */
function setupForms() {
  // Filtre par date : onchange
  const jourInput = document.getElementById("jour-input");
  if (jourInput) {
    jourInput.addEventListener("change", async () => {
      const jourValue = jourInput.value;
      if (!jourValue) return;

      const container = document.getElementById("date-articles");
      if (!container) return;
      container.innerHTML = '<p class="text-muted">Chargement...</p>';

      try {
        const res = await fetch(`${API_BASE}/by-date?jour=${jourValue}`);
        const data = await res.json();
        renderArticles(container, data);
      } catch (err) {
        console.error(err);
        container.innerHTML =
          '<p class="text-danger">Erreur de chargement.</p>';
      }
    });
  }

  // Filtre par pays : onchange
  const paysSelect = document.getElementById("pays-input");
  if (paysSelect) {
    paysSelect.addEventListener("change", async () => {
      const paysValue = paysSelect.value;
      if (!paysValue) return;

      const container = document.getElementById("country-articles");
      if (!container) return;
      container.innerHTML = '<p class="text-muted">Chargement...</p>';

      try {
        const res = await fetch(
          `${API_BASE}/by-country?pays=${encodeURIComponent(paysValue)}`
        );
        const data = await res.json();
        renderArticles(container, data);
      } catch (err) {
        console.error(err);
        container.innerHTML =
          '<p class="text-danger">Erreur de chargement.</p>';
      }
    });
  }

  // Conversion fichier -> base64
  const imageFileInput = document.getElementById("image-file");
  const imageBase64Input = document.getElementById("image-base64");

  if (imageFileInput && imageBase64Input) {
    imageFileInput.addEventListener("change", () => {
      const file = imageFileInput.files[0];
      if (!file) {
        imageBase64Input.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        imageBase64Input.value = e.target.result; // data:image/...;base64,...
      };
      reader.readAsDataURL(file);
    });
  }

  // Formulaire de publication
  const publishForm = document.getElementById("publish-form");
  const publishMessage = document.getElementById("publish-message");

  if (publishForm) {
    publishForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (publishMessage) {
        publishMessage.textContent = "";
        publishMessage.classList.remove("success");
      }

      const formData = new FormData(publishForm);

      const payload = {
        titre: formData.get("titre"),
        contenu: formData.get("contenu"),
        pays: formData.get("pays"),
        jour: formData.get("jour"),
        imageBase64: formData.get("imageBase64") || null,
      };

      try {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Erreur lors de la publication");
        }

        if (publishMessage) {
          publishMessage.textContent = "✅ Article publié !";
          publishMessage.classList.add("success");
        }

        publishForm.reset();
        const imgBase64 = document.getElementById("image-base64");
        const imgFile = document.getElementById("image-file");
        if (imgBase64) imgBase64.value = "";
        if (imgFile) imgFile.value = "";

        loadLatestArticles();
      } catch (err) {
        console.error(err);
        if (publishMessage) {
          publishMessage.textContent = "❌ " + err.message;
        }
      }
    });
  }
}

/* ==== Chargement des articles ==== */
async function loadLatestArticles() {
  const container = document.getElementById("home-articles");
  if (!container) return;
  container.innerHTML = '<p class="text-muted">Chargement...</p>';

  try {
    const res = await fetch(`${API_BASE}?limit=20`);
    const data = await res.json();
    renderArticles(container, data);
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p class="text-danger">Erreur de chargement.</p>';
  }
}

/* ==== Rendu des cartes d’articles ==== */
function renderArticles(container, articles) {
  if (!container) return;

  if (!articles || articles.length === 0) {
    container.innerHTML = '<p class="text-muted">Aucun article trouvé.</p>';
    return;
  }

  container.innerHTML = "";
  articles.forEach((article) => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    const card = document.createElement("article");
    card.className = "article-card card h-100 shadow-sm";

    const jour = article.jour ? new Date(article.jour) : null;
    const jourStr = jour ? jour.toLocaleDateString("fr-FR") : "Date inconnue";

    card.innerHTML = `
      ${
        article.imageBase64
          ? `<img src="${article.imageBase64}" class="card-img-top" alt="image article" />`
          : ""
      }
      <div class="card-body d-flex flex-column">
        <h2 class="card-title">${escapeHtml(article.titre || "")}</h2>
        <div class="meta mb-2">
          <span class="me-3"><strong>Pays :</strong> ${escapeHtml(
            article.pays || ""
          )}</span>
          <span><strong>Jour :</strong> ${jourStr}</span>
        </div>
        <p class="card-text article-content flex-grow-1">
          ${escapeHtml(article.contenu || "")}
        </p>
        <div class="mt-2 text-end">
          <span class="badge bg-secondary">Voir en grand</span>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      openArticleModal(article);
    });

    col.appendChild(card);
    container.appendChild(col);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ==== Modale article ==== */
let modal,
  modalImageContainer,
  modalTextContainer,
  modalCloseBtn,
  modalImageCol,
  modalTextCol;

function setupModal() {
  modal = document.getElementById("article-modal");
  if (!modal) return;

  modalImageContainer = modal.querySelector(".modal-image");
  modalTextContainer = modal.querySelector(".modal-text");
  modalCloseBtn = modal.querySelector(".modal-close");
  modalImageCol = document.getElementById("modal-image-col");
  modalTextCol = document.getElementById("modal-text-col");

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeArticleModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeArticleModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeArticleModal();
    }
  });
}

function openArticleModal(article) {
  if (!modal || !modalTextContainer || !modalImageContainer) return;

  // Gestion image
  if (article.imageBase64) {
    if (modalImageCol) {
      modalImageCol.style.display = "";
      modalImageCol.className = "col-md-5";
    }
    if (modalTextCol) {
      modalTextCol.className = "col-md-7";
    }

    modalImageContainer.innerHTML = `
      <img src="${article.imageBase64}" alt="image article zoomée" />
    `;
  } else {
    if (modalImageCol) {
      modalImageCol.style.display = "none";
    }
    if (modalTextCol) {
      modalTextCol.className = "col-12";
    }
    modalImageContainer.innerHTML = "";
  }

  const jour = article.jour ? new Date(article.jour) : null;
  const jourStr = jour ? jour.toLocaleDateString("fr-FR") : "Date inconnue";

  modalTextContainer.innerHTML = `
    <h2>${escapeHtml(article.titre || "")}</h2>
    <div class="meta">
      <span class="me-3"><strong>Pays :</strong> ${escapeHtml(
        article.pays || ""
      )}</span>
      <span><strong>Jour :</strong> ${jourStr}</span>
    </div>
    <div class="article-content-full">
      <p>${escapeHtml(article.contenu || "")}</p>
    </div>
  `;

  modal.classList.add("open");
}

function closeArticleModal() {
  if (!modal) return;
  modal.classList.remove("open");
}
