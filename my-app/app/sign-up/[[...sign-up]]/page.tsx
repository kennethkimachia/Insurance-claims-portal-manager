// app/sign-up/[[...sign-up]]/page.tsx

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        path="/sign-up"
        // After a user signs up, Clerk can automatically sign them in.
        // This prop controls where they go after that automatic sign-in.
        afterSignInUrl="/organization-profile"
        // This prop controls where they go if the sign-up flow completes
        // but doesn't automatically sign them in.
        afterSignUpUrl="/organization-profile"
      />
    </div>
  );
}