import { Button } from "@nextui-org/react";
import { useState } from "react";
import { MetaMaskService } from "../services/MetamaskService";
import { Card, CardBody } from "@nextui-org/react";
import { Chip } from "@nextui-org/react";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import * as firebase from "../firebaseConfig";
import { convertWeiToEth } from "../../utils";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { Input } from "@nextui-org/react";

const MetaMaskIcon = () => {
  return <img src="/images/Metamask.png" />;
};

const MetaMask = () => {
  firebase.app;
  const db = getFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [metaAccount, setMetaAccount] = useState(undefined);
  const [metaBalance, setMetaBalance] = useState(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transData, setTransData] = useState({
    fromAccId: "",
    toAccId: "",
    amount: "",
  });
  const [loadingTransaction, setLoadingTransaction] = useState(false);
  const [transactionError, setTransactionError] = useState("");
  const [transactionConfirmed, setTransactionConfirmed] = useState("");
  const [error, setError] = useState("");

  const addMetamaskDataToDb = async ({ accountId, balance }) => {
    try {
      await addDoc(collection(db, "metaMaskCollection"), {
        accountId,
        balance,
      });
    } catch (err) {
      console.log("error->", err);
      // setError(err);
    }
  };

  const connectMetaMask = async () => {
    setIsLoading(true);
    try {
      const res = await MetaMaskService.connectAllAccounts();
      if (res.length > 0) {
        setMetaAccount(res[0]);
        setTransData({ ...transData, fromAccId: res[0] });

        try {
          const balRes = await MetaMaskService.getAccountBalance(res[0]);
          setMetaBalance(convertWeiToEth(balRes));
          await addMetamaskDataToDb({ accountId: res[0], balance: balRes });
        } catch (balanceError) {
          console.error("Error getting account balance:", balanceError);
          setError("Failed to retrieve account balance.");
        }
      }
    } catch (err) {
      console.error("connect err->", err);
      setError("An error occurred while connecting to MetaMask.");
    } finally {
      setIsLoading(false);
    }
  };

  const metaMaskLogin = () => (
    <div>
      {error && (
        <div className="px-9 py-2" style={{ color: "red" }}>
          ! {error}
        </div>
      )}
      <Button
        color="primary"
        className="text-xl"
        variant="bordered"
        onClick={connectMetaMask}
        isLoading={isLoading}
      >
        {metaAccount ? "Refresh MetaMask" : "Connect with MetaMask"}
      </Button>
    </div>
  );

  const displayAccountData = () => (
    <>
      <Card>
        <CardBody className="gap-5">
          <div className="flex justify-between	">
            <div>
              <h1 className="bold text-xl">Account Id:</h1>
              <p>{metaAccount}</p>
              <h1 className="bold text-xl">Account Balance:</h1>
              <p>{metaBalance}</p>
            </div>
            <Chip color="success" variant="dot">
              <div className="text-lg">Connected</div>
            </Chip>
          </div>
          {transactionSection()}
        </CardBody>
      </Card>
    </>
  );

  const transactionSection = () => (
    <div>
      <Button
        color="warning"
        variant="shadow"
        className="text-xl"
        onClick={() => setIsModalOpen(true)}
        isLoading={isModalOpen}
      >
        Create new transaction
      </Button>
    </div>
  );

  const submitTransaction = async () => {
    setLoadingTransaction(true);
    await MetaMaskService.sendTransaction({
      fromAccountId: transData.fromAccId,
      toAccountId: transData.toAccId,
      amount: transData.amount,
    })
      .then((res) => {
        setTransactionConfirmed(res);
        setLoadingTransaction(false);
      })
      .catch((err) => {
        setTransactionError(err.message);
        setLoadingTransaction(false);
      });
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-9">
        <MetaMaskIcon />
        {metaAccount && displayAccountData()}
        {metaMaskLogin()}

        <Modal
          size={"md"}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setLoadingTransaction(false);
            setTransactionError("");
            setTransactionConfirmed("");
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Transaction
                </ModalHeader>
                <ModalBody>
                  <Input
                    type="text"
                    label="From Transaction Address"
                    placeholder="Enter sender account address"
                    value={transData.fromAccId}
                    onValueChange={(val) =>
                      setTransData({ ...transData, fromAccId: val })
                    }
                  />
                  <Input
                    type="text"
                    label="To Transaction Address"
                    placeholder="Enter receiver account address"
                    value={transData.toAccId}
                    onValueChange={(val) =>
                      setTransData({ ...transData, toAccId: val })
                    }
                  />
                  <Input
                    type="text"
                    label="Amount"
                    placeholder="Enter amount to transact"
                    value={transData.amount}
                    onValueChange={(val) =>
                      setTransData({ ...transData, amount: val })
                    }
                  />
                </ModalBody>
                {transactionError && (
                  <div className="px-9 py-2" style={{ color: "red" }}>
                    ! {transactionError}
                  </div>
                )}
                {transactionConfirmed && (
                  <div className="px-9 py-2" style={{ color: "green" }}>
                    Transaction completed Successfully
                    <br />
                    Transaction Id: {transactionConfirmed}
                  </div>
                )}
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onPress={submitTransaction}
                    isLoading={loadingTransaction}
                    isDisabled={transactionConfirmed}
                  >
                    Transact
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
};

export default MetaMask;
