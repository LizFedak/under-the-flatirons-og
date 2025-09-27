(function () {
    const hash = new URLSearchParams(location.hash.slice(1));
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
  
    if (!access_token || !refresh_token) return;
  
    (async () => {
      try {
        await fetch("/api/auth/magic-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token, refresh_token }),
        });
      } catch (e) {
        console.error("magic-complete failed", e);
      } finally {
        // remove tokens from URL, then reload so server-side cookie state is reflected everywhere
        history.replaceState(null, "", location.pathname + location.search);
        location.reload();
      }
    })();
  })();
  