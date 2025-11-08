import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Mail, Lock, ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { loginUser } from "@/queries/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchParams] = useSearchParams();
  const auth = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      auth.setError(decodeURIComponent(error));
      navigate("/login", { replace: true });
    }
  }, [searchParams, auth, navigate]);
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const { user, token } = data;
      localStorage.setItem('token', token);
      auth.dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
      navigate("/dashboard");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      auth.setError(errorMessage);
    }
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    auth.clearError();
    loginMutation.mutate({ email, password });
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col gap-2">
          <Link to="/" className="flex items-center justify-center gap-2"> 
            <ArrowLeft className="h-4 w-4" />
            {t('home')}
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{t('welcomeBack')}</h1>
          <p className="text-muted-foreground">{t('loginDescription')}</p>
        </div>
        <Card className="border-2 shadow-lg">
          <CardContent className="pt-8 pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {auth.error && (
                <Alert variant="destructive" className="animate-in">
                  <AlertDescription>{auth.error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t('email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-2"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t('password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 border-2"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 font-medium group" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                    {t('signingIn')}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {t('signIn')}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>
            <div className="mt-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('orContinueWith') || 'Or continue with'}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => {
                  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
                  window.location.href = `${backendUrl}/api/auth/google`;
                }}
              >
                <FcGoogle className="mr-2 h-5 w-5" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => {
                  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
                  window.location.href = `${backendUrl}/api/auth/facebook`;
                }}
              >
                <FaFacebook className="mr-2 h-5 w-5 text-[#1877F2]" />
                Facebook
              </Button>
            </div>
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                {t('noAccount')}{" "}
                <Link
                  to="/register"
                  className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
                >
                  {t('createOne')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export default Login