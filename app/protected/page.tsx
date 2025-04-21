import { createClient } from "@/utils/supabase/server";
import { InfoIcon, UserIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-montserrat flex items-center gap-2">
            <UserIcon size={24} className="text-primary" />
            Korumalı Sayfa
          </CardTitle>
          <CardDescription className="font-nunito">
            Hoş geldiniz! Bu sayfayı sadece oturum açmış kullanıcılar görebilir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-accent text-foreground">
            <InfoIcon size={16} strokeWidth={2} className="mr-2" />
            <AlertDescription className="font-nunito">
              Bu, yalnızca kimliği doğrulanmış bir kullanıcı olarak görebileceğiniz korumalı bir sayfadır.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <h2 className="font-bold text-2xl mb-2 font-montserrat">Kullanıcı Bilgileriniz</h2>
            <pre className="text-xs font-mono p-4 rounded-md border bg-muted/30 max-h-60 overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
