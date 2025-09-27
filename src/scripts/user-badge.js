(async function () {
    const root = document.getElementById("user-badge");
    if (!root) return;
  
    const signinRow = root.querySelector("#signin-row");
    const signinLink = root.querySelector("#signin-link");
    const userRow   = root.querySelector("#user-row");
    const avatarEl  = root.querySelector("#avatar");
    const emailEl   = root.querySelector("#auth-email");
  
    // Allow per-page override via prop/data attribute
    const signinHref = root.dataset.signinHref || "/signin";
    if (signinLink) signinLink.href = signinHref;
  
    const showSignedOut = () => {
      if (userRow)   userRow.style.display = "none";
      if (signinRow) signinRow.style.display = "inline-flex";
      root.classList.add("show");
    };
  
    const initialsFrom = (user) => {
      const email = user?.email || "";
      const name  = (user?.user_metadata?.full_name || user?.user_metadata?.name || "").trim();
      if (name) {
        const parts = name.split(/\s+/).slice(0, 2);
        return parts.map((p) => p?.[0]?.toUpperCase() || "").join("");
      }
      const local = email.split("@")[0] || "";
      const picks = (local.match(/(^[a-zA-Z])|[^a-zA-Z0-9]([a-zA-Z])/g) || []).map((m) => m.slice(-1));
      return (picks[0] || local[0] || "?").toUpperCase() + (picks[1]?.toUpperCase() || "");
    };
  
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
      if (!res.ok) {
        showSignedOut();
        return;
      }
      const { user } = await res.json();
  
      // Signed in: fill UI and show
      if (emailEl) emailEl.textContent = user?.email || "";
      if (avatarEl) avatarEl.textContent = initialsFrom(user);
  
      if (signinRow) signinRow.style.display = "none";
      if (userRow)   userRow.style.display = "inline-flex";
      root.classList.add("show");
    } catch {
      // Treat network errors as signed-out
      showSignedOut();
    }
  })();
  