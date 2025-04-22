import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import AvatarUpload from '@/components/auth/AvatarUpload';
import { updateProfileAction } from '@/app/actions';

export default async function ProfilePage() {
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
  
  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Profil Bilgilerim</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 mb-8">
          <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
          <TabsTrigger value="security">Güvenlik</TabsTrigger>
          <TabsTrigger value="activity">Hesap Etkinliği</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profil Fotoğrafı</CardTitle>
                <CardDescription>
                  Profil fotoğrafınızı değiştirmek için tıklayın
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <AvatarUpload 
                  userId={user.id} 
                  currentAvatar={profile.avatar} 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Kişisel Bilgiler</CardTitle>
                <CardDescription>
                  Kişisel bilgilerinizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={updateProfileAction} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      E-posta adresinizi değiştirmek için güvenlik sekmesine gidin.
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={profile.name || ''}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={profile.phone || ''}
                      placeholder="Telefon numarası"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-2">
                    <Label htmlFor="address">Adres</Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={profile.address || ''}
                      placeholder="Adres"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">Şehir</Label>
                      <Input
                        id="city"
                        name="city"
                        defaultValue={profile.city || ''}
                        placeholder="Şehir"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="postalCode">Posta Kodu</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        defaultValue={profile.postalCode || ''}
                        placeholder="Posta Kodu"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="country">Ülke</Label>
                    <Input
                      id="country"
                      name="country"
                      defaultValue={profile.country || ''}
                      placeholder="Ülke"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full sm:w-auto">Değişiklikleri Kaydet</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Güvenlik Ayarları</CardTitle>
              <CardDescription>
                Şifrenizi değiştirin ve hesap güvenliğinizi yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <h3 className="text-lg font-medium">Şifre Değiştirme</h3>
                <p className="text-sm text-muted-foreground">
                  Şifrenizi değiştirmek için aşağıdaki butona tıklayın. Size bir şifre sıfırlama bağlantısı gönderilecektir.
                </p>
                <Button variant="outline" className="w-full sm:w-auto">
                  Şifre Sıfırlama Bağlantısı Gönder
                </Button>
              </div>
              
              <Separator />
              
              <div className="grid gap-2">
                <h3 className="text-lg font-medium">İki Faktörlü Kimlik Doğrulama</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Durum:</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.twoFactorEnabled ? 'Etkin' : 'Devre Dışı'}
                    </p>
                  </div>
                  <Button variant="outline">
                    {profile.twoFactorEnabled ? 'Devre Dışı Bırak' : 'Etkinleştir'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Hesap Etkinliği</CardTitle>
              <CardDescription>
                Hesabınızla ilgili son etkinlikler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <h3 className="text-lg font-medium">Giriş Bilgileri</h3>
                <p className="text-sm">
                  <span className="font-medium">Son giriş:</span>{' '}
                  {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString('tr-TR') : 'Hiç giriş yapılmadı'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Hesap oluşturma tarihi:</span>{' '}
                  {new Date(profile.createdAt).toLocaleDateString('tr-TR')}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Son güncelleme:</span>{' '}
                  {new Date(profile.updatedAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
              
              <Separator />
              
              <div className="grid gap-2">
                <h3 className="text-lg font-medium">Hesap Durumu</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Mevcut durum:</p>
                    <p className="text-sm">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        profile.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : profile.status === 'INACTIVE' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {profile.status === 'ACTIVE' 
                          ? 'Aktif' 
                          : profile.status === 'INACTIVE' 
                            ? 'Pasif' 
                            : 'Yasaklı'
                        }
                      </span>
                    </p>
                  </div>
                  {profile.status === 'ACTIVE' && (
                    <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
                      Hesabımı Devre Dışı Bırak
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 