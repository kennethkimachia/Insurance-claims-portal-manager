import React from 'react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { ModeToggle } from "@/components/mode-toggle";

const Navbar = () => {
  return (
          <nav className="flex justify-end items-center p-4 gap-4 h-16">
            
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <ModeToggle />
          </nav>
  )
}

export default Navbar