import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Response oluştur
    const response = NextResponse.json({
      message: "Çıkış başarılı!",
    })
    
    // Response'a sona ermiş cookie ekle
    response.cookies.set({
      name: "authToken",
      value: "",
      expires: new Date(0),
      path: "/",
    })
    
    return response
  } catch (error) {
    console.error("Çıkış hatası:", error)
    return NextResponse.json(
      { message: "Çıkış yapılırken bir hata oluştu." },
      { status: 500 }
    )
  }
} 