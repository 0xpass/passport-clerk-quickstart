"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function CallbackPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetch("/api/user-callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          emailAddress: user.emailAddresses[0].emailAddress,
        }),
      })
        .then((response) => response.json())
        .then(() => {
          router.push("/");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [isLoaded, isSignedIn, user, router]);

  return <div>Processing...</div>;
}
