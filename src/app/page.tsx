import React from "react";
import {
  SignOutButton,
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";

const HomePage = () => {
  return (
    <div>
      HomePage
      <br />
      <br />
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <SignOutButton />
      </SignedIn>
    </div>
  );
};

export default HomePage;
