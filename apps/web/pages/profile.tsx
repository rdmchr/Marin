import { Button, Center, Text } from "@chakra-ui/react";
import { Models } from "appwrite";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { appwrite } from "../appwrite";
import { AWAccount } from "../appwrite/types";

export default function Profile() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null)

    const [user, setUser] = useState<Models.User<AWAccount> | null>(null)

    useEffect(() => {
        fetchAccount();
    }, [])

    async function fetchAccount() {
        const account = await appwrite.account.get<AWAccount>().catch((err) => {
            console.log(err.message)
            setError(err.message);
        });
        if (!account) {
            return;
        }
        setUser(account);
    }

    async function logout() {
        await appwrite.account.deleteSession("current");
        router.push("/login");
    }

    if (error) {
        router.push('/login');
        return (<></>);
    }

    if (!user) {
        return (
            <>
                <Text>Loading...</Text>
            </>
        )
    }

    return (
        <>
            <Center>
                <Text fontSize="2xl">Hello, {user.name}</Text>
            </Center>
            <Text>Click here to log out</Text>
            <Button onClick={logout}>Logout</Button>

        </>
    )
}