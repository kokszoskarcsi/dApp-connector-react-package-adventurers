import { useState } from "react";
import { storiesOf } from "@storybook/react";
import { ErgoDappConnector } from "../components/Requirements";

const stories = storiesOf("App test", module);

stories.add("App test", () => {
  const [userNFTs, setUserNFTs] = useState([]);
  //API KEY REQUIRED

  return <ErgoDappConnector setUserNFTs={setUserNFTs} databaseKey={APIKey} />;
});
