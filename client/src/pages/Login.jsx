import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chrome, Facebook } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add authentication logic here
    console.log("Login attempt:", { email, password });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Or{" "}
            <Link
              to="/register"
              className="text-primary hover:underline font-medium"
            >
              create a new account
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Social Auth Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  // TODO: Add Google OAuth logic
                  console.log("Google login clicked");
                }}
              >
                <Chrome className="w-5 h-5" />
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  // TODO: Add Facebook OAuth logic
                  console.log("Facebook login clicked");
                }}
              >
                <Facebook className="w-5 h-5" />
                Continue with Facebook
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Traditional Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
