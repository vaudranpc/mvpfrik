document
  .getElementById("formAdmin")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      titre: document.getElementById("titre").value,
      categorie: document.getElementById("categorie").value,
      message: document.getElementById("message").value,
      datePublication: document.getElementById("datePublication").value,
    };

    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (result.success) {
      alert("Formulaire sauvegardé !");
      this.reset();
    } else {
      alert("Erreur lors de la sauvegarde");
    }
  });
