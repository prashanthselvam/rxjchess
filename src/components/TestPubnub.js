import React, { useState, useEffect } from "react";
import PubNub from "pubnub";
import { PubNubProvider, usePubNub } from "pubnub-react";

const pubnub = new PubNub({
  publishKey: "pub-c-d4a424e5-efde-498e-af55-ead4fe257bed",
  subscribeKey: "sub-c-9437e116-6e8b-11eb-889a-ee4206f2a398",
  uuid: "myUniqueUUID",
});

function App() {
  return (
    <PubNubProvider client={pubnub}>
      <Chat />
    </PubNubProvider>
  );
}

function Chat() {
  const pubnub = usePubNub();
  const [channels] = useState(["awesome-channel"]);
  const [messages, addMessage] = useState([]);
  const [message, setMessage] = useState("");

  const handleMessage = (event) => {
    const message = event.message;
    if (typeof message === "string" || message.hasOwnProperty("text")) {
      const text = message.text || message;
      addMessage((messages) => [...messages, text]);
    }
  };

  const sendMessage = (message) => {
    if (message) {
      pubnub
        .publish({ channel: channels[0], message })
        .then(() => setMessage(""));
    }
  };

  useEffect(() => {
    pubnub.addListener({ message: handleMessage });
    pubnub.subscribe({ channels });
  }, [pubnub, channels]);

  return (
    <div style={pageStyles}>
      <div style={chatStyles}>
        <div style={headerStyles}>React Chat Example</div>
        <div style={listStyles}>
          {messages.map((message, index) => {
            return (
              <div key={`message-${index}`} style={messageStyles}>
                {message}
              </div>
            );
          })}
        </div>
        <div style={footerStyles}>
          <input
            type="text"
            style={inputStyles}
            placeholder="Type your message"
            value={message}
            onKeyPress={(e) => {
              if (e.key !== "Enter") return;
              sendMessage(message);
            }}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            style={buttonStyles}
            onClick={(e) => {
              e.preventDefault();
              sendMessage(message);
            }}
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}

const pageStyles = {
  alignItems: "center",
  background: "#282c34",
  display: "flex",
  justifyContent: "center",
  minHeight: "100vh",
};

const chatStyles = {
  display: "flex",
  flexDirection: "column",
  height: "50vh",
  width: "50%",
};

const headerStyles = {
  background: "#323742",
  color: "white",
  fontSize: "1.4rem",
  padding: "10px 15px",
};

const listStyles = {
  alignItems: "flex-start",
  backgroundColor: "white",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  overflow: "auto",
  padding: "10px",
};

const messageStyles = {
  backgroundColor: "#eee",
  borderRadius: "5px",
  color: "#333",
  fontSize: "1.1rem",
  margin: "5px",
  padding: "8px 15px",
};

const footerStyles = {
  display: "flex",
};

const inputStyles = {
  flexGrow: 1,
  fontSize: "1.1rem",
  padding: "10px 15px",
};

const buttonStyles = {
  fontSize: "1.1rem",
  padding: "10px 15px",
};

export default App;
