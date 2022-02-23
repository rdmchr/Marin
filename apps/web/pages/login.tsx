import { Box, Button, Center, Container, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, Text } from "@chakra-ui/react";
import { ErrorMessage, Field, FieldInputProps, Form, Formik, FormikErrors, FormikState } from "formik";
import { useRouter } from "next/router";
import { useState } from "react";
import { appwrite } from '../appwrite'
import Logo from '../components/logo'


interface FormValues {
    email: string;
    password: string;
}

export default function Login() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

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

    function validatePassword(value: string) {
        let error;
        if (!value) {
            error = 'Required';
        } else if (value.length < 8) {
            error = 'Password must be at least 8 characters';
        }
        return error;
    }

    async function submit(values: FormValues, { setErrors }: any) {
        const res = await appwrite.account.createSession(values.email, values.password).catch((err) => {
            console.log(err.message)
            setError(err.message);
        });
        console.log(res);
        if (res) {
            router.push('/');
        }
    }

    // FIXME: ugly workaroung for isInvalid check
    return (
        <Box paddingX="5px">
            <div style={{ marginTop: "10px" }} />
            <Logo />
            <Formik
                initialValues={{ email: '', password: '' }}
                onSubmit={submit}
            >{(props) => (
                <Form>
                    <Field name='email' validate={validateEmail}>
                        {({ field, form }: {field: FieldInputProps<any>, form: FormikState<any>}) => (
                            <FormControl isInvalid={(form.errors.email as string | undefined) && (form.touched.email as string | undefined) ? true : false}>
                                <FormLabel htmlFor='email'>Email address</FormLabel>
                                <Input {...field} id='email' type="email" />
                                <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                            </FormControl>
                        )}
                    </Field>
                    <Field name='password' validate={validatePassword}>
                        {({ field, form }: {field: FieldInputProps<any>, form: FormikState<any>}) => (
                            <FormControl isInvalid={(form.errors.password as string | undefined) && (form.touched.password as string | undefined) ? true : false}>
                                <FormLabel htmlFor='password'>Password</FormLabel>
                                <Input {...field} id='password' type="password" />
                                <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                            </FormControl>
                        )}
                    </Field>
                    <div style={{ marginTop: "10px" }} />
                    <Text color="red" fontSize='sm'>{error}</Text>
                    <Button
                        colorScheme='teal'
                        isLoading={props.isSubmitting}
                        type='submit'
                        float="right"
                    >
                        Submit
                    </Button>
                </Form>
            )}
            </Formik>
        </Box>
    )
}