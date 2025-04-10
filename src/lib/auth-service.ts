/**
 * Kimlik doğrulama işlemlerini yöneten servis
 */

// Giriş yap
export async function login(email: string, password: string, rememberMe: boolean = false) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, rememberMe }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Giriş başarısız")
    }

    return data
  } catch (error) {
    console.error("Giriş hatası:", error)
    throw error
  }
}

// Kayıt ol
export async function register(name: string, email: string, password: string) {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Kayıt başarısız")
    }

    return data
  } catch (error) {
    console.error("Kayıt hatası:", error)
    throw error
  }
}

// Çıkış yap
export async function logout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Çıkış başarısız")
    }

    return data
  } catch (error) {
    console.error("Çıkış hatası:", error)
    throw error
  }
}

// Mevcut oturumu kontrol et
export async function checkSession() {
  try {
    const response = await fetch("/api/auth/session", {
      method: "GET",
    })

    const data = await response.json()

    if (!response.ok) {
      return null
    }

    return data.user
  } catch (error) {
    console.error("Oturum kontrolü hatası:", error)
    return null
  }
} 