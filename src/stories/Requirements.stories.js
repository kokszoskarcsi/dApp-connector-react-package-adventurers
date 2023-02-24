import { useEffect, useState } from "react";
import { storiesOf } from "@storybook/react";
import { ErgoDappConnector } from "../components/Requirements";

const stories = storiesOf("App test", module);

stories.add("App test", () => {
  const [userNFTs, setUserNFTs] = useState([]);
  return <ErgoDappConnector color={"orange"} setUserNFTs={setUserNFTs} />;
});
