"use client"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export default function SignUp() {
    const{isLoaded, signUp, setActive} = useSignUp()
    const [emailAddress, setEmailAddress] = useState()
    const [password, setPassword] = useState()
    const[policyNumber, setPolicyNumber] = useState()
    const[pendingVerification, setPendingVerification] = useState(false)
    const[code, setCode] = useState("")
    const[error, setError] =  useState <string | undefined>()
    const[showPassword, setShowPassword] = useState()
    const router = useRouter()



  if(!isLoaded){
    return null;
  }

  async function SubmitEvent(e:React.FormEvent){
    e.preventDefault()
      if(!isLoaded){
        return null;
    }

    try {
        await signUp.create({
            emailAddress,
            password,
            unsafeMetadata:{
                policyNumber:policyNumber,
            }
        })

        await signUp.prepareEmailAddressVerification({
            strategy: "email_code"
        })

        setPendingVerification(true)
        
    } catch (error:any) {
        console.log(JSON.stringify(error, null, 2 ))
        setError(error.errors[0].message)
    }

  }

  async function handleVerification(e:React.FormEvent){
    e.preventDefault()
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        
        router.push("/pending-approval");
      } else {
        
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors[0]?.longMessage || "Verification failed.");
    }
  }

  return(
     <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your email below to create an account
        </CardDescription>
        <CardAction>
          <Button variant="link">Log in</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form className="justify-center text-center">
          <div className="flex flex-col gap-6 justify-center">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="emailAddress"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Policy Number</Label>
              <Input
                id="policyNumber"
                type="text"
                placeholder="123456"
                required
              />
            </div>

          </div>


        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Sign Up
        </Button>
        
      </CardFooter>
    </Card>
  )
}