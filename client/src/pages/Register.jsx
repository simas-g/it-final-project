import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { registerUser } from "@/queries/api";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [searchParams] = useSearchParams();
  const auth = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      auth.setError(decodeURIComponent(urlError));
      navigate("/register", { replace: true });
    }
  }, [searchParams, auth, navigate]);
  const registerMutation = useMutation({
    mutationFn: registerUser,
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
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      auth.setError(errorMessage);
    }
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (password !== confirmPassword) {
      return;
    }
    auth.clearError();
    registerMutation.mutate({ email, password, name });
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md mx-auto gap-12 items-center">
        <div>
          <div className="text-center mb-6 flex flex-col gap-2">
            <Link to="/" className="flex items-center justify-center gap-2"> 
              <ArrowLeft className="h-4 w-4" />
              {t('home')}
            </Link>
            <h2 className="text-3xl font-bold tracking-tight mb-2">{t('createAccount')}</h2>
            <p className="text-muted-foreground">{t('getStarted')}</p>
          </div>
          <Card className="border-2 shadow-lg">
            <CardContent className="pt-8 pb-8 px-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {auth.error && (
                  <Alert variant="destructive" className="animate-in">
                    <AlertDescription>{auth.error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    {t('fullName')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-11 border-2"
                      required
                    />
                  </div>
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    {t('confirmPassword')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-11 border-2"
                      required
                    />
                  </div>
                </div>
                {password !== confirmPassword && confirmPassword && (
                  <Alert variant="destructive" className="animate-in">
                    <AlertDescription>{t('passwordsDoNotMatch')}</AlertDescription>
                  </Alert>
                )}
                <Button 
                  type="submit" 
                  className="w-full h-11 font-medium group mt-6" 
                  disabled={registerMutation.isPending || (password !== confirmPassword && confirmPassword)}
                >
                  {registerMutation.isPending ? (
                    <span className="flex items-center">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                      {t('creating')}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      {t('createAccount')}
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
                  {t('haveAccount')}{" "}
                  <Link
                    to="/login"
                    className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
                  >
                    {t('signIn')}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
export default Register