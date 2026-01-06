async function charger() {
  const res = await fetch("/api/forms");
  const data = await res.json();

  afficher(data);
}

function afficher(forms) {
  const filtre = document.getElementById("filtreCategorie").value.toLowerCase();

  let html = "";

  forms.forEach((form) => {
    if (filtre !== "tous" && form.categorie.toLowerCase() !== filtre) return;

    html += `
      <div class="card shadow-sm">
        <div class="card-body">

          <h5 class="card-title">${form.titre}</h5>

          <span class="badge bg-secondary">${form.categorie}</span>

          <p class="card-text mt-2">${form.message}</p>

          <p class="text-muted">${form.datePublication}</p>

          <button class="btn btn-danger btn-sm" onclick="archiver('${form._id}')">
            Archiver
          </button>

        </div>
      </div>
    `;
  });

  document.getElementById("liste").innerHTML = html;
}

async function archiver(id) {
  const res = await fetch("/api/forms/" + id, {
    method: "DELETE",
  });

  const result = await res.json();

  if (result.success) {
    alert("Message archivé (supprimé) !");
    charger();
  } else {
    alert("Erreur lors de l'archivage");
  }
}

document.getElementById("filtreCategorie").addEventListener("change", charger);

window.onload = charger;
