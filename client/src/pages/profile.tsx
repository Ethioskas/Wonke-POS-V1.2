import React from 'react';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle } from 'lucide-react';

export default function Profile() {
  const { currentUser, t, language, setLanguage, logout } = useApp();

  if (!currentUser) return null;

  const user = currentUser;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('profile')}</h1>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="" />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">{user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <p className="text-muted-foreground capitalize">{user.role}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-2">
            <Label className="text-base font-semibold">{t('language')}</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant={language === 'en' ? 'default' : 'outline'} 
                className="h-12 text-lg"
                onClick={() => setLanguage('en')}
              >
                🇺🇸 English
              </Button>
              <Button 
                variant={language === 'am' ? 'default' : 'outline'} 
                className="h-12 text-lg font-sans"
                onClick={() => setLanguage('am')}
              >
                🇪🇹 አማርኛ
              </Button>
            </div>
          </div>

          <div className="pt-6 border-t">
             <Button variant="destructive" className="w-full" onClick={logout}>
               {t('logout')}
             </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
