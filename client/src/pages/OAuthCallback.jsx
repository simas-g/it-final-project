import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/loading-spinner";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      if (error) {
        auth.setError(error);
        navigate("/login");
        return;
      }

      if (token) {
        localStorage.setItem("token", token);
        
        try {
          await auth.loadUser();
          navigate("/dashboard");
        } catch (err) {
          console.error("Failed to load user:", err);
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    };

    handleCallback();
  }, [searchParams, navigate, auth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner message="Completing sign in..." />
    </div>
  );
};

export default OAuthCallback;

