import { ArrowBackIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, IconButton, Input, InputGroup, InputRightElement, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { SetStateAction, useEffect, useState } from "react";
import { appwrite } from "../../appwrite";
import { AWList } from "../../appwrite/types";

export default function List() {
    const router = useRouter();
    const { id } = router.query;

    const [error, setError] = useState<string | null>(null);
    const [listData, setList] = useState<AWList | null>();
    const [item, setItem] = useState('')

    async function fetchList() {
        await appwrite.database.getDocument<AWList>('62114ed22004848a2dcf', id as string).then((res) => {
            setList(res);
        }, (err) => {
            setList(null);
            setError(err.message);
        }
        )
    }

    async function addItem() {
        if (!item) {
            return;
        }
        await appwrite.database.updateDocument<AWList>('62114ed22004848a2dcf', id as string, {
            items: [...(listData?.items || []), item]
        }).then((res) => {
            setList(res);
        }, (err) => {
            setList(null);
            setError(err.message);
        }
        );
        setItem("");
    }

    const handleChange = (event: { target: { value: SetStateAction<string>; }; }) => setItem(event.target.value); // updates react state to match the input value

    async function removeItem(event: { currentTarget: { id: string | null | undefined; }; }) {
        const item = event.currentTarget.id;
        if (!item) {
            return;
        }
        await appwrite.database.updateDocument<AWList>('62114ed22004848a2dcf', id as string, {
            items: listData?.items?.filter((listItem) => listItem !== item)
        }).then((res) => {
            setList(res);
        }, (err) => {
            setList(null);
            setError(err.message);
        }
        );
    }

    useEffect(() => {
        if (!router.isReady) return;

        fetchList();

    }, [router.isReady]);

    function back() {
        router.back();
    }

    if (error) {
        return (
            <>
                <IconButton aria-label="Back" icon={<ArrowBackIcon />} onClick={back} />
                <Text>{error}</Text>
            </>
        )
    }

    if (!listData) {
        return (
            <>
                <IconButton aria-label="Back" icon={<ArrowBackIcon />} onClick={back} />
                <Text>Loading...</Text>
            </>
        )
    }

    return (
        <Box paddingX="5px">
            <div style={{ display: "flex", alignItems: "center", justifyItems: "left" }}>
                <IconButton aria-label="Back" icon={<ArrowBackIcon />} onClick={back} size="sm" style={{ marginRight: "15px" }} />
                <Text fontSize="2xl">{listData.name}</Text>
            </div>
            <Divider />
            <Box style={{ display: "flex", flexDirection: "column" }}>
                {
                    listData.items.map((item) => {
                        return (
                            <Text onClick={removeItem} key={item} id={item}>{item}</Text>
                        )
                    })
                }
            </Box>
            <Divider />
            <InputGroup size='md'>
                <Input variant="filled" placeholder="Add an item" value={item} onChange={handleChange} />
                <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={addItem} color="cyan.500">
                        Add item
                    </Button>
                </InputRightElement>
            </InputGroup>
        </Box>
    );
}