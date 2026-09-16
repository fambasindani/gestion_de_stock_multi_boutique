// ============================================
// UTILITAIRES POUR LES COOKIES
// ============================================

export const Cookies = {
  /**
   * Définir un cookie
   */
  set(name: string, value: string, days: number = 7): void {
    if (typeof document === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    console.log(`✅ Cookie défini: ${name}=${value.substring(0, 20)}...`);
  },

  /**
   * Récupérer un cookie
   */
  get(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === name) {
        console.log(`✅ Cookie trouvé: ${name}`);
        return decodeURIComponent(value);
      }
    }
    console.log(`⚠️ Cookie non trouvé: ${name}`);
    return null;
  },

  /**
   * Supprimer un cookie
   */
  remove(name: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log(`🗑️ Cookie supprimé: ${name}`);
  },
};