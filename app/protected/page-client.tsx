"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ProtectedPageClient() {
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    async function getUserData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/sign-in');
        return;
      }
      
      const { data: userData } = await supabase
        .from('User')
        .select('name')
        .eq('id', user.id)
        .single();
        
      setUserName(userData?.name || user.email);
    }
    
    getUserData();
  }, [router]);
  
  return (
    <div className="container mx-auto py-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Hoş Geldiniz{userName ? `, ${userName}` : ''}</CardTitle>
          <CardDescription>
            Inn Elegance korumalı sayfasına erişim sağladınız.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <p>Bu alana sadece giriş yapmış kullanıcılar erişebilir.</p>
            {userName && (
              <p className="text-muted-foreground">
                Oturum açmış kullanıcı: <strong>{userName}</strong>
              </p>
            )}
            <Button asChild variant="outline">
              <Link href="/">
                Ana Sayfaya Dön
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 