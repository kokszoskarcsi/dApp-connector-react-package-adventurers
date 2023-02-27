import { useState, useEffect, Fragment, useRef } from "react";
import { getDatabase, ref, child, get } from "firebase/database";
import { initializeApp } from "firebase/app";
import { deleteUser, getAuth, signInAnonymously } from "firebase/auth";
import React from "react";
import { Menu, Transition } from "@headlessui/react";
import wallet_black from "../../assets/ergo-wallet-black.png";
import wallet_white from "../../assets/ergo-wallet-white.png";
import WalletHover from "../WalletHover/WalletHover";
import "../../styles.css";
import NautilusLogo from "../../assets/NautilusLogo.png";

// Initialize Firebase

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const GET_USER_NFT_INTERVAL_DELAY = 10000;

export const ErgoDappConnector = ({
  buttonColor = "orange",
  setUserNFTs,
  databaseKey,
}) => {
  const app = initializeApp(databaseKey);
  const dbRef = ref(getDatabase(app));
  const auth = getAuth(app);

  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(true);
  const [ergoWallet, setErgoWallet] = useState();

  const [walletConnected, setWalletConnected] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [walletHover, setWalletHover] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState();

  var userNFTInterval = useRef();

  window.addEventListener("ergo_wallet_disconnected", () => {
    disconnectWallet();
  });

  useEffect(() => {
    const checkWallet = localStorage.getItem("walletConnected");
    if (checkWallet === "true") {
      setDefaultAddress();
      window.ergoConnector.nautilus.connect().then((access_granted) => {
        if (access_granted) {
          setWalletConnected(true);
          window.ergoConnector.nautilus.getContext().then((context) => {
            setErgoWallet(context);
          });
        } else {
          setWalletConnected(false);
        }
      });
      setDefaultAddress(localStorage.getItem("walletAddress"));
      setWalletConnected(true);
    }
  }, []);

  // const connectSafew = () => {
  // 	if(!window.ergoConnector){
  // 		return;
  // 	}
  // 	if (!window.ergoConnector.safew.isConnected()) {
  // 		// we aren't connected
  // 		window.ergoConnector.safew.connect().then((access_granted) => {
  // 			if (access_granted) {
  // 				setWalletConnected(true);
  // 				window.ergoConnector.safew.getContext().then((context) => {
  // 					setErgoWallet(context);
  // 					console.log(`safew is connected`);
  // 				});
  // 			} else {
  // 				setWalletConnected(false);
  // 				console.log("Wallet access denied");
  // 			}
  // 		});
  // 	}
  // 	toggleSelector();
  // };

  useEffect(() => {
    if (typeof ergoWallet !== "undefined") {
      //sign in anonymously
      if (user === null) {
        signInAnonymously(auth)
          .then((userCredential) => {
            // Signed in
            setUser(userCredential.user);
            getUserNFTs();
            userNFTInterval.current = setInterval(
              () => getUserNFTs(),
              GET_USER_NFT_INTERVAL_DELAY
            );
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
          });
      }
      //get Address and evaluate all NFT-s the user has
      ergoWallet.get_change_address().then(function (address) {
        localStorage.setItem("walletAddress", address);
        setDefaultAddress(truncate(address, 14, "..."));
        localStorage.setItem("walletConnected", "true");
      });
    }
  }, [ergoWallet]);

  const colorStylingArray = {
    orange: ["#ff5e18", "black"],
    white: ["white", "black"],
    black: ["black", "white"],
    green: ["#00b300", "white"],
    purple: ["#8c00ff", "white"],
    blue: ["#00b3ff", "white"],
    red: ["#ff0000", "white"],
    yellow: ["#ffd800", "black"],
    brown: ["#964B00", "white"],
    pink: ["#ff00ff", "white"],
    teal: ["#00b3b3", "white"],
    cyan: ["#00b3ff", "white"],
    coral: ["#FF6F61", "white"],
    emerald: ["#009B77", "white"],
    darkred: ["#9B2335", "white"],
    inkwell: ["#363945", "white"],
    darkgreen: ["#006400", "white"],
    darkblue: ["#00008B", "white"],
    darkpurple: ["#301934", "white"],
    darkorange: ["#ff8c00", "white"],
  };

  const getUserNFTs = () => {
    //Get all NFT ids from database and push them to localstorage
    get(child(dbRef, `adventurerNFTs`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const allNFTs = snapshot.val();
          let mid = [];
          for (let key in allNFTs) {
            ergoWallet.get_balance(key).then((balance) => {
              if (parseInt(balance) === 1) {
                mid.push(key);
                //localStorage.setItem("userNFTs", JSON.stringify(mid));
              }
            });
          }
          setUserNFTs(mid);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const truncate = (str, len, sep) => {
    if (str.length < len) {
      return str;
    } else {
      return (
        str.substring(0, parseInt(len / 2)) +
        sep +
        str.substring(str.length - parseInt(len / 2), str.length)
      );
    }
  };

  function disconnectWallet() {
    if (typeof window.ergo_request_read_access === "undefined") {
    } else {
      if (walletConnected) {
        setWalletConnected(false);
        setErgoWallet();
        setDefaultAddress("");
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("walletConnected");
        localStorage.removeItem("userNFTs");
        clearInterval(userNFTInterval.current);
        deleteUser(auth.currentUser);
        setUser(null);
        window.ergoConnector.nautilus.disconnect();
      }
    }
  }

  const toggleSelector = () => {
    if (!walletConnected) setShowSelector(!showSelector);
  };

  const handleWalletTrue = () => {
    if (walletConnected) setWalletHover((prev) => !prev);
    else {
      setShowSelector((prev) => !prev);
    }
  };

  const connectNautilus = () => {
    if (!window.ergoConnector) {
      return;
    }
    window.ergoConnector.nautilus.isConnected().then((connected) => {
      if (!walletConnected) {
        window.ergoConnector.nautilus.connect().then((access_granted) => {
          if (access_granted) {
            setWalletConnected(true);
            window.ergoConnector.nautilus.getContext().then((context) => {
              setErgoWallet(context);
            });
          } else {
            setWalletConnected(false);
          }
        });
        toggleSelector();
      } else {
        // Already connected
        toggleSelector();
        return;
      }
    });
  };

  return (
    <div className="package-container">
      {showSelector && (
        <Menu as="div" className="mainDiv">
          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="mainMenuItem" style={{ marginTop: "48px" }}>
              <div style={{ padding: "4px 0 4px", marginBottom: "1px" }}>
                <Menu.Item onClick={connectNautilus}>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "item1" : "item2",
                        "item3"
                      )}
                    >
                      <img
                        src={NautilusLogo}
                        style={{
                          height: "30px",
                          marginRight: "48px",
                          marginLeft: "8px",
                        }}
                      />
                      Nautilus
                    </a>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      )}

      <div id="header-wallet-wrapper" onClick={handleWalletTrue}>
        <div
          id="header-wallet"
          style={{
            backgroundColor: colorStylingArray[buttonColor][0],
            color: colorStylingArray[buttonColor][1],
            flexDirection: walletConnected ? "column" : "row",
            border: buttonColor == "white" ? "1px solid black" : "",
          }}
        >
          {!walletConnected && (
            <img
              src={
                colorStylingArray[buttonColor][1] == "white"
                  ? wallet_white
                  : wallet_black
              }
              id="header-wallet-image"
            />
          )}
          <div id="wallet-connect">
            <span>
              {walletConnected ? (
                <span
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <img
                      src={NautilusLogo}
                      style={{ height: "20px", marginLeft: "20px" }}
                    />
                    <p
                      style={{
                        color: colorStylingArray[buttonColor][1],
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        width: "150px",
                        marginLeft: "8px",
                      }}
                    >
                      {defaultAddress}
                    </p>
                  </span>
                </span>
              ) : (
                "Connect Wallet"
              )}
            </span>
          </div>
          {walletHover && walletConnected && (
            <WalletHover disconnect={disconnectWallet} />
          )}
        </div>
      </div>
    </div>
  );
};
