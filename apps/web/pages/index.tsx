import { Box, Button, Divider, FormControl, FormErrorMessage, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Text, useDisclosure } from '@chakra-ui/react'
import { appwrite } from '../appwrite'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { APPWRITE_INVITES_COLLECTION, APPWRITE_CREATE_LIST_FUNC, APPWRITE_LIST_COLLECTION, APPWRITE_USERS_COLLECTION } from '../appwrite/constants';
import { Field, FieldInputProps, Form, Formik, FormikState, FormikValues, setIn } from 'formik';
import { AWAccount, AWInvite, AWLedgerUser, AWList } from 'appwrite-data/types/web';

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [lists, setLists] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure(); // wether the list creation modal is open
  const [name, setName] = useState<string>(''); // the users name

  let userId = ''; // the users id

  // retrieves the users lists
  async function getLists() {
    appwrite.database.listDocuments(APPWRITE_LIST_COLLECTION).then((res) => {
      if (res.sum === 0) {
        setLists([]);
        setError('No lists found');
      }
      res.documents = res.documents.filter((doc) => doc.$write.includes(`user:${userId}`));
      setLists(res.documents);
    }, (err) => {
      console.log(err.message)
      setLists([]);
    }
    )
  }

  // retrieves all current ivnites for the user
  async function getInvites() {
    const { documents } = await appwrite.database.listDocuments<AWInvite>(APPWRITE_INVITES_COLLECTION);

    const invitations: AWInvite[] = [];
    for (const element of documents) {
      // fetch list name
      const listName = await getListName(element.list);

      // fetch sender name
      const { email } = await appwrite.database.getDocument<AWLedgerUser>(APPWRITE_USERS_COLLECTION, element.sender);
      invitations.push({
        ...element,
        listName,
        senderEmail: email,
      });
    }
    setInvites(invitations);
  }

  async function getData() {
    setIsLoading(true);
    await getLists();
    await getInvites();
    setIsLoading(false);
  }

  // initializes the component
  async function init() {
    setIsLoading(true);
    Promise.all([getAccount(), setupRealtime(), getData()]);
    setIsLoading(false);
  }
  useEffect(() => { init() }, []);

  // gets the name of a list using a given id
  function getListName(listId: string): Promise<string> {
    const listName = appwrite.database.getDocument<AWList>(APPWRITE_LIST_COLLECTION, listId).then((res) => {
      return res.name;
    }, (err) => {
      console.log(err)
      return '';
    }
    );
    return listName;
  }

  // retrieve user account
  async function getAccount() {
    const { $id, name } = await appwrite.account.get<AWAccount>();
    userId = $id;
    setName(name);
  }

  /**
   * sets up a listener for the database
   * once an update is made to the lists collection an update will be triggered
   */
  async function setupRealtime() {
    const unsubscribe = appwrite.subscribe([`collections.${APPWRITE_LIST_COLLECTION}.documents`, `collections.${APPWRITE_INVITES_COLLECTION}.documents`], () => { getData() });
    router.events.on("routeChangeStart", () => { // make sure to unscubscribe when the route changes
      unsubscribe();
      return true;
    });
  }

  // creates a new list
  async function createList(values: FormikValues) {
    onClose();
    appwrite.functions.createExecution(APPWRITE_CREATE_LIST_FUNC, JSON.stringify({ name: values.name }));
    setIsLoading(true);
  }

  // formik validator for the name field inside the create list modal
  function validateListName(value: string) {
    let error;
    if (!value) {
      error = 'Required';
    } else if (value.length > 20) {
      error = 'List name can not be longer than 20 characters';
    }
    return error;
  }

  return (
    <Box maxWidth="100vw" minHeight="100vh" overflowX="hidden">
      <Box marginX="5px">
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100vw">
          <Text fontSize='6xl'>Hey, {name}!</Text>
          <Box display="flex" alignItems="center" hidden={!isLoading} placeSelf="end"><Spinner size="xs" marginRight="2px" color="gray" /><Text color="gray">Loading list...</Text></Box>
        </Box>
        <Text fontSize="xl" fontWeight="medium">Your lists:</Text>
        {error ? <Text>{error}</Text> :
          lists.length === 0 ? <Text>No lists found</Text> :
            lists.map((list) => {
              return (
                <Link href={`/list/${list.$id}`} passHref key={list.$id}>
                  <Text>{list.name}</Text>
                </Link>
              )
            })
        }
        <Divider marginY="2px" />
        <Text fontSize="xl" fontWeight="medium">Your invitations:</Text>
        {invites.length === 0 ? <Text>No invitations found</Text> :
          invites.map((invite) => {
            return (
              <Box key={invite.$id}>
                <Text>Sender: {invite.senderEmail}</Text>
                <Text>List: {invite.listName}</Text>
              </Box>
            )
          }
          )
        }
        <Button onClick={onOpen} position="fixed" bottom="5px" right="5px">Create new list</Button>

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
      </Box>
    </Box>
  )
}
