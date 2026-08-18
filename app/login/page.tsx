import type { Metadata } from "next";
import { LoginExperience } from "../components/LoginExperience";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return <LoginExperience />;
}
