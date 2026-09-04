const frontendUrl = (import.meta.env.VITE_FRONTEND_URL || window.location.origin).replace(/\/$/, "");

export const getStoreUrl = (storeSlug) => storeSlug ? `${frontendUrl}/store/${encodeURIComponent(storeSlug)}` : "";