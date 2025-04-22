"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString();
  const phone = formData.get("phone")?.toString();
  
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email ve şifre zorunludur",
    );
  }

  // 1. Önce Supabase Auth kullanıcısı oluştur
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (authError) {
    console.error(`${authError.code} ${authError.message}`);
    return encodedRedirect("error", "/sign-up", authError.message);
  }
  
  // 2. Kullanıcı profil bilgilerini User tablosuna ekle
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('User')
      .insert({
        id: authData.user.id,
        email,
        password: null,
        name: name || null,
        phone: phone || null,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        notificationPrefs: {
          email: true,
          push: false,
          marketing: false,
          unread: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
    if (profileError) {
      console.error(`Profil oluşturma hatası: ${profileError.message}`);
      // Auth kullanıcısı oluşturuldu, profilde hata olsa bile devam et
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Kaydınız başarıyla oluşturuldu! Lütfen e-posta onay bağlantısını kontrol edin.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  // Kimlik doğrulama
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }
  
  // Giriş başarılı, kullanıcı bilgilerini alalım
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Son giriş zamanını güncelle
    await supabase
      .from('User')
      .update({ lastLogin: new Date().toISOString() })
      .eq('id', user.id);
      
    // Kullanıcı durumunu kontrol et
    const { data: userData } = await supabase
      .from('User')
      .select('status, role')
      .eq('id', user.id)
      .single();
      
    if (userData?.status === 'BANNED') {
      // Yasaklı kullanıcı, oturumu kapat
      await supabase.auth.signOut();
      return encodedRedirect("error", "/sign-in", "Hesabınız yasaklanmıştır. Lütfen yönetici ile iletişime geçin.");
    }
    
    // Role göre yönlendirme
    if (userData?.role === 'ADMIN') {
      return redirect("/protected/admin");
    }
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  return encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const updateProfileAction = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "Oturum süresi dolmuş. Lütfen tekrar giriş yapın.",
    );
  }
  
  const name = formData.get("name")?.toString();
  const phone = formData.get("phone")?.toString();
  const address = formData.get("address")?.toString();
  const city = formData.get("city")?.toString();
  const country = formData.get("country")?.toString();
  const postalCode = formData.get("postalCode")?.toString();
  
  const { error } = await supabase
    .from('User')
    .update({
      name,
      phone,
      address,
      city,
      country,
      postalCode,
      updatedAt: new Date().toISOString()
    })
    .eq('id', user.id);
    
  if (error) {
    return encodedRedirect(
      "error",
      "/protected/profile",
      `Profil güncellenemedi: ${error.message}`
    );
  }
  
  return encodedRedirect(
    "success",
    "/protected/profile",
    "Profil başarıyla güncellendi."
  );
};

export const updateEmailPreferencesAction = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "Oturum süresi dolmuş. Lütfen tekrar giriş yapın.",
    );
  }
  
  // Mevcut tercihler
  const { data: userData } = await supabase
    .from('User')
    .select('notificationPrefs')
    .eq('id', user.id)
    .single();
    
  const currentPrefs = userData?.notificationPrefs || {};
  
  // Form verilerinden tercihleri al
  const emailEnabled = formData.get("emailEnabled") === "on";
  const pushEnabled = formData.get("pushEnabled") === "on";
  const marketingEnabled = formData.get("marketingEnabled") === "on";
  
  // Tercihleri güncelle
  const updatedPrefs = {
    ...currentPrefs,
    email: emailEnabled,
    push: pushEnabled,
    marketing: marketingEnabled,
  };
  
  const { error } = await supabase
    .from('User')
    .update({
      notificationPrefs: updatedPrefs,
      updatedAt: new Date().toISOString()
    })
    .eq('id', user.id);
    
  if (error) {
    return encodedRedirect(
      "error",
      "/protected/settings",
      `Bildirim tercihleri güncellenemedi: ${error.message}`
    );
  }
  
  return encodedRedirect(
    "success",
    "/protected/settings",
    "Bildirim tercihleri başarıyla güncellendi."
  );
};
