"use client"

import { createCredential } from "@/lib/webauthn";
import { useSearchParams } from "next/navigation";
import { ChangeEvent, useMemo, useState } from "react";

export default function Signup() {
    // - useState
    const searchParams = useSearchParams()
    const [username, setUsername] = useState("")
    const challenge = useMemo(() => searchParams.get("challenge") ?? "",[]);
    const userid = useMemo(() => crypto.randomUUID(),[])

    // - onChange
    function onChangeUsername(e: ChangeEvent<HTMLInputElement>) {
        setUsername(e.target.value)
    }
    // - onClick
    async function onClickCreate(){
        if (challenge == ""){
            return console.error("Missing ?challenge=")
        }
        try {
            await createCredential({ challenge, userid, username })
        } catch (err) {
            console.error({err})
        }
    }

    if (challenge == "") {
        return <><h1>Missing ?challenge=</h1></>
    }

    return (
      <>
        <h1>New Account</h1>


        <p>challenge: {challenge}</p>
        <p>userid: {userid}</p>

        <label>Type your name</label>
        <input type="text" value={username} onChange={onChangeUsername} style={{color: "black"}}/>

        <button onClick={onClickCreate}>Create</button>
      </>
    );
  }

