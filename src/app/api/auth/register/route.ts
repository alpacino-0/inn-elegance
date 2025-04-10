import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Kayıt olma şeması
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

// Edge Runtime ile uyumlu olmaması nedeniyle devre dışı bırakıyoruz
export const runtime = 'nodejs' // Bcrypt bu şekilde daha iyi çalışır

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Gelen veriyi doğrula
    const validatedData = registerSchema.parse(body)
    
    // E-posta adresinin daha önce kullanılıp kullanılmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: "E-posta adresi zaten kullanımda." },
        { status: 409 }
      )
    }
    
    // Şifreyi hashleme
    const hashedPassword = await hash(validatedData.password, 10)
    
    // Yeni kullanıcı oluştur
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: "CUSTOMER",
        status: "ACTIVE",
      },
    })
    
    // Hassas bilgileri kaldır (password değişkenini kullanmayacağız)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = newUser
    
    return NextResponse.json(
      {
        message: "Kayıt başarılı!",
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri.", errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Kayıt hatası:", error)
    return NextResponse.json(
      { message: "Sunucu hatası. Lütfen daha sonra tekrar deneyin." },
      { status: 500 }
    )
  }
} 