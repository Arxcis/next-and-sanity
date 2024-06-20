import { SubmitButton } from "@/components/SubmitButton";
import { fetchPage } from "@/lib/sanity";

export default async function Home() {
  const {heading, subheading} = await fetchPage("home");
  
  return (
    <>
      <h1>{heading}</h1>
      <h2>{subheading}</h2>
      <form action={signup}><SubmitButton>Signup</SubmitButton></form>
    </>
  );
}



import { randomBytes, randomUUID } from 'crypto'
import { redirect } from "next/navigation";
async function signup() {
  "use server"

  const uuid = randomUUID()
  const challenge = randomUUID()

  redirect(`/signup?challenge=${challenge}`)
}