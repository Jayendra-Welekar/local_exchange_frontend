import NextAuth, { RequestInternal } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
const client = new PrismaClient()

export const NEXT_AUTH = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: {Label: "Email", type: "text", placeholder: "admin@example.com"},
                password: {Lable: "Password", type: "text", placeholder: "adminPassword"}
            },
            async authorize(credentials:Record<"username" | "password", string> | undefined){
                if(!credentials){
                    return null
                }

                const {username, password} = credentials
                const user = await client.user.findFirst({where: {email: username}}).catch(err => console.log(err))

                if(!user){
                    const newUser = await client.user.create({data: {email: username, password: password, username: username.split("@")[0]}})
                    return {
                        id: newUser.id.toString(),
                        name: newUser.username,
                        email: newUser.email
                    }
                }

                if (user && user.password === password) {
                    return {
                        id: user.id.toString(),
                        name: user.username,
                        email: user.email,
                    }
                }

                return null
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }
        )
    ],
    secret: process.env.NEXAUTH_SECRET || "secret_key" ,
    callbacks: {
        async signIn({account, profile}: any){
            if(account.provider === "google"){
                const user = await client.user.findFirst({where: {email: profile.email}})
                if(!user){
                    const newUser = await client.user.create({
                        data: {
                            email: profile.email,
                            username: profile.name,
                            googleAuthenticated: true,
                            password: ""
                        }
                    }).catch(err => console.log(err))


                    if(newUser){
                        return true
                    }
                   
                } else {
                    return true
                }
            }
            return account
        },
        async session({ session, token } : any){
            if(session && session.user){
                session.user.id = token.sub
            }

            console.log(session)
            console.log(token)

            return session
        }
    }
}

const handler = NextAuth(NEXT_AUTH)

export const GET = handler
export const POST = handler