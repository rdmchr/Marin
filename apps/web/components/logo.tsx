import { AspectRatio, Center, Image, Text } from "@chakra-ui/react";

interface Props {
    size?: number;
}

const Logo = ({size = 250}: Props) => {
    return (
        <>
            <AspectRatio maxW={`${size}px`} ratio={1}>
                <Image src="/icon.svg" alt="Icon" boxSize={`${size}px`} objectFit='cover'/>
            </AspectRatio>
            <Text>Marin</Text>
        </>
    )
}

export default Logo;