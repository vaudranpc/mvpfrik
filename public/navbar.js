async function chargerNavbar() {
  const res = await fetch("navbar.html");
  const html = await res.text();

  document.getElementById("navbar").innerHTML = html;
}

window.addEventListener("DOMContentLoaded", chargerNavbar);
