import styles from '../styles/Home.module.css'
import { Divider, Text } from '@chakra-ui/react'
import { appwrite } from '../appwrite'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [lists, setLists] = useState<any[]>([]);

  async function getLists() {
    appwrite.database.listDocuments('62114ed22004848a2dcf').then((res) => {
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
  }

  useEffect(() => { getLists() }, []);

  //getLists(); //TODO: only run on initial render                                                                                                     

  return (
    <>
      <Text fontSize='6xl'>Your lists</Text>
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
    </>
  )
}
