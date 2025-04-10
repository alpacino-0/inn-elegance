import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    // Cookie'yi request üzerinden al
    const cookieHeader = req.headers.get("cookie") || ""
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map(c => {
        const [key, ...v] = c.split("=")
        return [key, v.join("=")]
      })
    )
    const token = cookies.authToken

    if (!token) {
      return NextResponse.json(
        { message: "Kimlik doğrulanmadı." },
        { status: 401 }
      )
    }

    // Token'ı doğrula
    try {
      const decoded = verify(token, process.env.JWT_SECRET || "gizli-anahtar") as {
        id: string;
        email: string;
        role: string;
      }

      // Kullanıcı bilgilerini getir
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          status: true,
          lastLogin: true,
        },
      })

      if (!user || user.status !== "ACTIVE") {
        return NextResponse.json(
          { message: "Kullanıcı bulunamadı veya hesap aktif değil." },
          { status: 401 }
        )
      }

      return NextResponse.json({
        user,
        isAuthenticated: true,
      })
    } catch {
      // Token geçersiz veya süresi dolmuş
      return NextResponse.json(
        { message: "Geçersiz veya süresi dolmuş oturum." },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Oturum kontrolü hatası:", error)
    return NextResponse.json(
      { message: "Sunucu hatası. Lütfen daha sonra tekrar deneyin." },
      { status: 500 }
    )
  }
} 