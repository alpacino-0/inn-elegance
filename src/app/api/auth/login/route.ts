import { NextResponse } from "next/server"
import { compare } from "bcrypt"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import { sign } from "jsonwebtoken"

const prisma = new PrismaClient()

// JWT için gizli anahtar
const JWT_SECRET = process.env.JWT_SECRET || "jwt-secret-key-vila-rezervasyon-2024-secure"

// Giriş yapma şeması
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
})

// Edge Runtime ile uyumlu olmaması nedeniyle devre dışı bırakıyoruz
export const runtime = 'nodejs' // JWT bu şekilde daha iyi çalışır

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Gelen veriyi doğrula
    const validatedData = loginSchema.parse(body)
    
    // Kullanıcıyı e-posta adresine göre bul
    const user = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    })
    
    // Kullanıcı yoksa veya hesap aktif değilse
    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "Geçersiz kimlik bilgileri." },
        { status: 401 }
      )
    }
    
    // Şifre doğrulaması
    const passwordValid = await compare(validatedData.password, user.password)
    
    if (!passwordValid) {
      return NextResponse.json(
        { message: "Geçersiz kimlik bilgileri." },
        { status: 401 }
      )
    }
    
    // JWT token oluştur
    const tokenExpiration = validatedData.rememberMe ? "30d" : "1d"
    const token = sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: tokenExpiration }
    )
    
    // Son giriş zamanını güncelle
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLogin: new Date(),
      },
    })
    
    // Hassas bilgileri kaldır (password değişkenini kullanmayacağız)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user
    
    // Response oluştur
    const response = NextResponse.json({
      message: "Giriş başarılı!",
      user: userWithoutPassword,
    })
    
    // Cookie'yi Response'a ekle
    response.cookies.set({
      name: "authToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: validatedData.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
      path: "/",
    })
    
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri.", errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Giriş hatası:", error)
    return NextResponse.json(
      { message: "Sunucu hatası. Lütfen daha sonra tekrar deneyin." },
      { status: 500 }
    )
  }
} 