import { redirect } from "next/navigation";

/** There is no sign-up: the accounts are fixed. Old links go to the login page. */
export default function SignupPage() {
  redirect("/login");
}
