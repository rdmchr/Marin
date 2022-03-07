import { ArrowBackIcon, PlusSquareIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, FormControl, FormErrorMessage, FormLabel, IconButton, Input, InputGroup, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from "@chakra-ui/react";
import { Field, FieldInputProps, Form, Formik, FormikState } from "formik";
import { useRouter } from "next/router";
import { SetStateAction, useEffect, useState } from "react";
import { appwrite } from "../../appwrite";
import { APPWRITE_FUNCTION_INVITE_MEMBER } from "appwrite-data/constants";
import { AWList } from "appwrite-data/types/web";

interface FormValues {
    email: string;
}

export default function List() {
    const router = useRouter();
    const { id } = router.query;

    const [error, setError] = useState<string | null>(null);
    const [listData, setList] = useState<AWList | null>();
    const [item, setItem] = useState('')
    const { isOpen, onOpen, onClose } = useDisclosure()

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

    function validateEmail(value: string) {
        let error;
        if (!value) {
            error = 'Required';
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
        ) {
            error = 'Invalid email address';
        }
        return error;
    }

    async function inviteMember(values: FormValues, { setErrors }: any) {
        const { email } = values;
        await appwrite.functions.createExecution(APPWRITE_FUNCTION_INVITE_MEMBER, JSON.stringify({ list: id, email }));
        onClose();
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
                <IconButton aria-label="Add member" icon={<PlusSquareIcon />} size="sm" style={{ marginLeft: "15px" }} onClick={onOpen} />
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
                <Input variant="filled" placeholder="Add an item" value={item} onChange={handleChange} onSubmit={addItem} />
                <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={addItem} color="cyan.500">
                        Add item
                    </Button>
                </InputRightElement>
            </InputGroup>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Invite user to list</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Formik
                            initialValues={{ email: '' }}
                            onSubmit={inviteMember}
                        >{(props) => (
                            <Form>
                                <Field name='email' validate={validateEmail}>
                                    {({ field, form }: { field: FieldInputProps<any>, form: FormikState<any> }) => (
                                        <FormControl isInvalid={form.errors.email && (form.touched.email ? true : false)}>
                                            <FormLabel htmlFor='email'>User Email</FormLabel>
                                            <Input {...field} id='email' type="email" />
                                            <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                                        </FormControl>
                                    )}
                                </Field>
                                <Text color="red" fontSize='sm'>{error}</Text>
                                <ModalFooter>
                                    <Button colorScheme='red' mr={3} onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button variant='ghost' isLoading={props.isSubmitting} type='submit'>Invite User</Button>
                                </ModalFooter>
                            </Form>
                        )}
                        </Formik>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
}