import styles from '../styles/Home.module.css'
import { Box, Button, Divider, FormControl, FormErrorMessage, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Text, useDisclosure } from '@chakra-ui/react'
import { appwrite } from '../appwrite'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Router, useRouter } from 'next/router';
import { APPWRITE_CREATE_LIST_FUNC, APPWRITE_LIST_COLLECTION } from '../appwrite/constants';
import { Field, FieldInputProps, Form, Formik, FormikState, FormikValues } from 'formik';

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [lists, setLists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure()

  async function getLists() {
    setIsLoading(true);
    appwrite.database.listDocuments(APPWRITE_LIST_COLLECTION).then((res) => {
      if (res.sum === 0) {
        setLists([]);
        setError('No lists found');
      }
      setLists(res.documents);
    }, (err) => {
      console.log(err.message)
      setLists([]);
    }
    )
    setIsLoading(false);
  }

  /**
   * sets up a listener for the database
   * once an update is made to the lists collection an update will be triggered
   */
  async function setupRealtime() {
    const unsubscribe = appwrite.subscribe(`collections.${APPWRITE_LIST_COLLECTION}.documents`, () => { getLists() });
    router.events.on("routeChangeStart", () => { // make sure to unscubscribe when the route changes
      unsubscribe();
      return true;
    });
  }

  async function createList(values: FormikValues) {
    onClose();
    appwrite.functions.createExecution(APPWRITE_CREATE_LIST_FUNC, JSON.stringify({ name: values.name }));
    setIsLoading(true);
  }

  function validateListName(value: string) {
    let error;
    if (!value) {
      error = 'Required';
    } else if (value.length > 20) {
      error = 'List name can not be longer than 20 characters';
    }
    return error;
  }

  useEffect(() => { getLists(); setupRealtime(); }, []);

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between" width="100vw" paddingX="5px">
        <Text fontSize='6xl'>Your lists</Text>
        <Box display="flex" alignItems="center" hidden={!isLoading} placeSelf="end"><Spinner size="xs" marginRight="2px" color="gray" /><Text color="gray">Loading list...</Text></Box>
      </Box>
      <Divider />
      {error ? <Text>{error}</Text> :
        lists.map((list) => {
          return (
            <Link href={`/list/${list.$id}`} passHref key={list.$id}>
              <Text>{list.name}</Text>
            </Link>
          )
        })
      }
      <Button onClick={onOpen}>Create new list</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a new list</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Formik
              initialValues={{ name: '' }}
              onSubmit={createList}
            >{(props) => (
              <Form>
                <Field name='name' validate={validateListName}>
                  {({ field, form }: { field: FieldInputProps<any>, form: FormikState<any> }) => (
                    <FormControl isInvalid={form.errors.name && (form.touched.name ? true : false)}>
                      <FormLabel htmlFor='name'>List name</FormLabel>
                      <Input {...field} id='name' type="name" />
                      <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Text color="red" fontSize='sm'>{error}</Text>
                <ModalFooter>
                  <Button colorScheme='red' mr={3} onClick={onClose}>
                    Cancel
                  </Button>
                  <Button variant='ghost' isLoading={props.isSubmitting} type='submit'>Create</Button>
                </ModalFooter>
              </Form>
            )}
            </Formik>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
