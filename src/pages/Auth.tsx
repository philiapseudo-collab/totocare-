import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/AuthForm";

const Auth = () => {
  const navigate = useNavigate();

  return (
    <AuthForm onSuccess={() => navigate("/profile-setup")} />
  );
};

export default Auth;
