import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { updateEmailPreferencesAction } from '@/app/actions';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing, Mail, Phone, SendToBack } from 'lucide-react';

export default async function NotificationSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  // Kullanıcı profil bilgilerini al
  const { data: profile } = await supabase
    .from('User')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (!profile) {
    redirect('/sign-in');
  }
  
  const notificationPrefs = profile.notificationPrefs || {};
  
  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Bildirim Ayarları</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Bildirim Tercihleri
          </CardTitle>
          <CardDescription>
            Hangi bildirim türlerini almak istediğinizi ayarlayın
          </CardDescription>
        </CardHeader>
        
        <form action={updateEmailPreferencesAction}>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="emailEnabled" 
                  name="emailEnabled" 
                  defaultChecked={notificationPrefs.email === true}
                />
                <div className="grid gap-1.5">
                  <Label htmlFor="emailEnabled" className="font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    E-posta Bildirimleri
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Rezervasyon onayları, önemli güncellemeler ve kampanyalar hakkında bildirim alın.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="pushEnabled" 
                  name="pushEnabled" 
                  defaultChecked={notificationPrefs.push === true}
                />
                <div className="grid gap-1.5">
                  <Label htmlFor="pushEnabled" className="font-medium flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Mobil Bildirimler
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Mobil cihazınıza anlık bildirimler alın.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="marketingEnabled" 
                  name="marketingEnabled" 
                  defaultChecked={notificationPrefs.marketing === true}
                />
                <div className="grid gap-1.5">
                  <Label htmlFor="marketingEnabled" className="font-medium flex items-center">
                    <SendToBack className="h-4 w-4 mr-2" />
                    Pazarlama İletileri
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Özel teklifler, indirimler ve yeni villa duyuruları hakkında bilgi alın.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit">Tercihleri Kaydet</Button>
          </CardFooter>
        </form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Bildirim Geçmişi</CardTitle>
          <CardDescription>
            Son 30 günde aldığınız bildirimler
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notificationPrefs.unread && notificationPrefs.unread > 0 ? (
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">{notificationPrefs.unread} okunmamış bildiriminiz var</p>
              <p className="text-sm text-muted-foreground mt-1">
                Okunmamış bildirimleri görüntülemek için bildirim merkezini ziyaret edin.
              </p>
              <Button variant="outline" className="mt-3" asChild>
                <a href="/protected/notifications">Bildirimleri Görüntüle</a>
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Hiç bildiriminiz bulunmuyor.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 