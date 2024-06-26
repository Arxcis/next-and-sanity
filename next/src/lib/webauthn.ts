"use client"

type CreateCredentialParams = {
    challenge: string; // Get from randomUUID() on the server.
    userid: string;    // Get from randomUUID() on the client.
    username: string;  // Get from <input type="text">
}

export async function createCredential({challenge, userid, username}: CreateCredentialParams) {

    const options: CredentialCreateOptions = {
        challenge: Uint8Array.from(challenge, (c: string) => c.charCodeAt(0)),
        rp: {
            name: location.host
        },
        user: {
            id: Uint8Array.from(userid, (c: string) => c.charCodeAt(0)),
            name: username,
            displayName: username
        },
        pubKeyCredParams: [{alg: -7, type: "public-key"}],
        timeout: 60000,
        attestation: "direct"
    }

    const credential = await navigator.credentials.create({
        publicKey: options
    })

    return credential;
}

type CredentialCreateOptions = {
    challenge: Uint8Array; // randomUUID() on the server.
    rp: {
        name: string;      // location.host
    };
    user: {
        id: Uint8Array;      // randomUUID() generated by the client.
        name: string;        // Get <input type="text"> from user
        displayName: string; // Get <input type="text"> from user
    };
    pubKeyCredParams: [{alg: -7, type: "public-key"}] // ref: https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-pubkeycredparams
    timeout: 60000,                                   // 60 seconds
    attestation: "direct"
}
