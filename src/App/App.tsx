import React, { useEffect, useState } from "react";
import {
  ChakraProvider,
  Flex,
  Text,
  Input,
  InputGroup,
  Button,
  InputRightElement,
} from "@chakra-ui/react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

const Room: React.FC<{
  roomName: string;
  handleClick: (roomName: string) => void;
}> = ({ roomName, handleClick }) => {
  return (
    <Flex
      onClick={() => handleClick(roomName)}
      cursor="pointer"
      height="28"
      width="100%"
      justifyContent="center"
      alignItems="center"
      borderBottom="1px"
      borderColor="black"
      _hover={{
        backgroundColor: "blue.500",
        color: "white",
      }}
    >
      <Text fontSize="xl">{roomName}</Text>
    </Flex>
  );
};

const App: React.FC = () => {
  const rooms = ["typescript", "javascript", "react"];
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messageList, setMessageList] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
    });

    socket.on("roomMessagesList", (messages: string[]) => {
      setMessageList(messages);
    });

    socket.on("newMessage", (message: string) => {
      console.log({ mensaje: message });
      addMessageToList(message);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("roomMessagesList");
      socket.off("newMessage");
    };
  }, []);

  const handleActiveRoom = (roomName: string): void => {
    if (activeRoom !== null) {
      socket.emit("roomDisconnect", activeRoom);
      setMessageList([]);
    }
    setActiveRoom(roomName);
    socket.emit("roomConnection", roomName);
  };

  const onChangeMessage = (message: string): void => {
    setInputMessage(message);
  };

  const handleSubmit = (): void => {
    socket.emit("roomMessage", { message: inputMessage, room: activeRoom });
    setInputMessage("");
  };

  const addMessageToList = (message: string): void => {
    setMessageList((prevState) => [...prevState, message]);
  };

  return (
    <ChakraProvider resetCSS>
      <Flex width="100%" height="100vh">
        <Flex width="30%" flexDirection={"column"}>
          {rooms.map((room) => (
            <Room roomName={room} key={room} handleClick={handleActiveRoom} />
          ))}
        </Flex>
        <Flex width="70%" bg="gray.50" flexDirection="column">
          {activeRoom !== null && (
            <>
              <Flex
                height="20"
                bg="gray.200"
                justifyContent="center"
                alignItems="center"
              >
                <Text fontWeight="bold" fontSize="xl">
                  Room: {activeRoom}
                </Text>
              </Flex>
              <Flex height="100%" flexDirection="column">
                {messageList.map((messageItem) => (
                  <Text key={messageItem} fontSize="2xl">
                    {messageItem}
                  </Text>
                ))}
              </Flex>
              <InputGroup>
                <Input
                  size="lg"
                  placeholder="Message"
                  value={inputMessage}
                  onChange={(event) => onChangeMessage(event.target.value)}
                />
                <InputRightElement width="4.5rem">
                  <Button colorScheme="blue" size="sm" onClick={handleSubmit}>
                    Enviar
                  </Button>
                </InputRightElement>
              </InputGroup>
            </>
          )}
        </Flex>
      </Flex>
    </ChakraProvider>
  );
};

export default App;
