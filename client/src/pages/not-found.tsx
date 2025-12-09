import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h1>
            <p className="text-muted-foreground mb-6">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
            </p>
            <Link href="/">
              <Button data-testid="button-go-home">
                <Home className="h-4 w-4 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
