import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
// import { ethers } from "ethers";
import { ethers } from "ethers";
import abi from "../../contractJson/Certify.json";
import "../../css/dashboard.css";
import metamaskLogo from "../../assets/metamask-logo.png";
import certifiLogo from "../../assets/certifi-logo.png";
import userProfileImage from "../../assets/user-profile.png";
import "@fortawesome/fontawesome-free/css/all.css";
import {
  FaCodepen,
  FaSearch,
  FaPlusCircle,
  FaHome,
  FaFileAlt,
  FaCog,
} from "react-icons/fa";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import LoadingAnimation from "../../component/LoadingAnimation";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const Dashboard = ({ state }) => {
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [certificates, setCertificates] = useState([]); // State to store fetched certificates
  const [hash, setHash] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [mail, setMail] = useState("");
  const [name, setUserName] = useState("");
  const [profilepic, setProfilePic] = useState("");
  const [userid, setUserId] = useState("");

  const contractAddress = "0x63C39cF4D4bC1D5b4A4caC191Ff80a72Fa6dcb19";
  // "0xF2D99d629e640E9a936e90C9ce84aeC9800f6f78";
  const contractABI = abi.abi;

  const [results, setResults] = useState([]); // State to store search results
  const [query, setQuery] = useState("");

  const [renameModalIsOpen, setRenameModalIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [metamaskPopupIsOpen, setMetamaskPopupIsOpen] = useState(false);
  const [metamaskPopupPendingIsOpen, setMetamaskPopupPendingIsOpen] =
    useState(false);

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [currentVerifyCertificateId, setCurrentVerifyCertificateId] =
    useState(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (!window.ethereum) {
        console.error("Please install MetaMask!");
        return;
      }

      // Create a provider instance
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const accounts = await provider.send("eth_requestAccounts", []);

      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setContract(contract);
      // Create a contract instance
      // Request account access
      if (accounts.length === 0) {
        console.error("No accounts found!");
        return;
      }

      // Check if MetaMask is installed
    };
    connectWallet();
  }, []);

  const Logout = () => {
    window.localStorage.setItem("userLoggedIn", "false");
    window.localStorage.removeItem("email");
    window.localStorage.removeItem("userLoggedIn");

    navigate("/");
    window.location.reload();
  };
  useEffect(() => {
    if (localStorage.getItem("userLoggedIn") === "false") {
      navigate("/login");
    }
    const mail = localStorage.getItem("email");
    setMail(mail);
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `https://prj-certifi-backend.onrender.com/api/auth/getuserbyemail/${mail}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const responseData = await response.json();
        setMail(responseData.data.email);
        setProfilePic(responseData.data.photo);
        setUserName(responseData.data.name);
        setUserId(responseData.data._id);
        localStorage.setItem("userid", responseData._id);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchData = async () => {
      try {
        const func = await fetch(
          `https://prj-certifi-backend.onrender.com/api/certificate/getallcertificates/${mail}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await func.json();
        if (data.status === "success") {
          // Update certificates state with fetched data
          setCertificates(data.data);
          console.log(certificates);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
    fetchData();
  }, []);

  useEffect(() => {
    if (localStorage.getItem("documentId")) {
      localStorage.removeItem("documentId"); // Replace 'yourItemKey' with the actual key you want to remove
    }
  }, []);
  // verify modal
  const [verifyModalIsOpen, setVerifyModalIsOpen] = useState(false);

  const closeVerifyModal = () => {
    setVerifyModalIsOpen(false);
    // handleNotValid(certificateId);
  };

  useEffect(() => {
    const searchCertificates = (query) => {
      // Filter certificates array based on the query
      const filteredCertificates = certificates.filter((certificate) =>
        certificate.courseName.toLowerCase().includes(query.toLowerCase())
      );
      // Update results state with filtered certificates
      setResults(filteredCertificates);
    };

    // Debounce to limit search calls
    const debounceTimeout = setTimeout(() => {
      if (query.trim() !== "") {
        searchCertificates(query);
      } else {
        setResults([]); // If query is empty, reset results to show all certificates
      }
    }, 300); // Adjust delay as needed

    return () => clearTimeout(debounceTimeout);
  }, [query, certificates]); // Effect runs on every query or certificates change

  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

  const toggleCreateDropdown = () => {
    setShowCreateDropdown(!showCreateDropdown);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const openMetamaskPopup = () => {
    setMetamaskPopupIsOpen(true);
  };

  // Function to close Metamask popup
  const closeMetamaskPopup = () => {
    setMetamaskPopupIsOpen(false);
  };

  const openMetamaskPopupPending = () => {
    setMetamaskPopupPendingIsOpen(true);
  };

  // Function to close Metamask popup
  const closeMetamaskPopupPending = () => {
    setMetamaskPopupPendingIsOpen(false);
  };

  const openRenameModal = () => {
    setRenameModalIsOpen(true);
  };

  const closeRenameModal = () => {
    setRenameModalIsOpen(false);
    setNewName("");
  };

  // const handleNameChange = (e) => {
  //   setNewName(e.target.value);
  // };

  // const handleSubmit = () => {
  //   // Handle the renaming logic here
  //   console.log("New name:", newName);
  //   closeRenameModal();
  // };

  const openDeleteModal = () => {
    setDeleteModalIsOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
  };

  const handleDelete = () => {
    // Implement delete account logic here
    console.log("Account deleted");
    closeDeleteModal();
  };

  const invokeConnection = (event) => {
    event.preventDefault();
    return;
  };

  // Add event handlers for Accept and Reject buttons
  const handleAccept = (certificateID) => {
    // for accepting the certificate here
    openVerifyModal(certificateID);
    console.log("Certificate accepted");
    fetch(
      `https://prj-certifi-backend.onrender.com/api/certificate/get/${certificateID}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Response data:", data);

        console.log("Response data:", data.data.ipfsHash);
        setHash(data.data.ipfsHash);
      })
      .catch((error) => {
        console.error("Error fetching community data:", error);
      });
    // Add your logic
  };

  const openVerifyModal = (certificateID) => {
    setCurrentVerifyCertificateId(certificateID);
    // handleVerify();
    setVerifyModalIsOpen(true);
  };

  const handleVerify = async () => {
    setVerifyModalIsOpen(false);
    setIsLoading(true);

    try {
      const identifier = String(currentVerifyCertificateId);
      console.log("signer", signer);
      console.log("scasc", identifier, hash);
      console.log("hash", hash);

      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);

        const signer = provider.getSigner();
        setSigner(signer);

        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        console.log("contractBefore", contract);

        setContract(contract);

        const transaction = await contract.storeCertificate(identifier, hash);
        console.log("Waiting for transaction...");
        const receipt = await transaction.wait();
        console.log("Transaction receipt:", receipt);

        const event = receipt.events;
        console.log("Event object:", event);

        // Access the concatenatedString from the args array
        const documentIdentification = event[0].args[2];
        console.log("Concatenated String:", documentIdentification);

        // Send the documentIdentification to the backend
        fetch(
          `https://prj-certifi-backend.onrender.com/api/certificate/uploadCertificate/${identifier}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              documentIdentification,
            }),
          }
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success") {
              console.log(data.data);
              Toastify({
                text: "Document uploaded successfully!",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                backgroundColor: "green",
                stopOnFocus: true,
              }).showToast();
              setIsLoading(false);
            } else {
              console.log(data);
              Toastify({
                text: "Document uploading failed. Please try again!",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                backgroundColor: "green",
                stopOnFocus: true,
              }).showToast();
              setIsLoading(false);
            }
          });
      } else {
        console.error("Please install MetaMask!");
        Toastify({
          text: "Please install MetaMask!",
          duration: 3000,
          close: true,
          gravity: "top",
          position: "right",
          backgroundColor: "green",
          stopOnFocus: true,
        }).showToast();
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      Toastify({
        text: `Transaction failed: ${error.message}`,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "red",
        stopOnFocus: true,
      }).showToast();
      setIsLoading(false);
    }
  };
  // const handleVerify = async () => {
  //   setVerifyModalIsOpen(false);
  //   setIsLoading(true);

  //   // currentVerifyCertificateId;
  //   const identifier = String(currentVerifyCertificateId);
  //   console.log("signer", signer);
  //   console.log("scasc", identifier, hash);
  //   console.log("hash", hash);
  //   if (window.ethereum) {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     setProvider(provider);

  //     const accounts = await provider.send("eth_requestAccounts", []);
  //     setAccount(accounts[0]);

  //     const signer = provider.getSigner();
  //     setSigner(signer);

  //     const contract = new ethers.Contract(
  //       contractAddress,
  //       contractABI,
  //       signer
  //     );
  //     console.log("contractBefore", contract);

  //     setContract(contract);
  //   } else {
  //     console.error("Please install MetaMask!");
  //   }
  //   console.log("contractBefore", contract);

  //   const transaction = await contract.storeCertificate(identifier, hash);
  //   console.log("Waiting for transaction...");
  //   const receipt = await transaction.wait();
  //   console.log(" object:", receipt);

  //   const event = receipt.events;
  //   console.log("Event object:", event);

  //   // Access the concatenatedString from the args array
  //   const documentIdentification = event[0].args[2];
  //   console.log("Concatenated String:", documentIdentification);
  //   // alert("Transaction is Successful!");
  //   fetch(
  //     `https://prj-certifi-backend.onrender.com/api/certificate/uploadCertificate/${identifier}`,
  //     {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         documentIdentification,
  //       }),
  //     }
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data.status === "success") {
  //         console.log(data.data);
  //         Toastify({
  //           text: "Document uploaded successfully!",
  //           duration: 3000,
  //           close: true,
  //           gravity: "top",
  //           position: "right",
  //           backgroundColor: "green",
  //           stopOnFocus: true,
  //         }).showToast();
  //         setIsLoading(false);
  //       } else {
  //         console.log(data);
  //         Toastify({
  //           text: "Document uploading failed. Please try again!",
  //           duration: 3000,
  //           close: true,
  //           gravity: "top",
  //           position: "right",
  //           backgroundColor: "green",
  //           stopOnFocus: true,
  //         }).showToast();
  //         setIsLoading(false);
  //       }
  //     });
  // };

  const toCertificateForm = (Id) => (event) => {
    event.preventDefault();
    localStorage.setItem("documentId", Id);
    navigate("/cvalid");
  };

  return isLoading === true ? (
    <LoadingAnimation />
  ) : (
    <div className="dashboard-wrapper">
      <Modal
        isOpen={metamaskPopupIsOpen}
        onRequestClose={closeMetamaskPopup}
        contentLabel="Metamask Connection Modal"
        className="modal-overlay"
        overlayClassName="modal-overlay"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Metamask Connection Required</h2>
          </div>
          <p className="modal-message">
            Please connect your Metamask account to upload documents.
          </p>

          <div className="modal-buttons">
            <button className="metamask-logo-container">
              <img
                src={metamaskLogo}
                alt="Metamask Logo"
                className="metamask-logo"
                onClick={invokeConnection}
              />
              Connect Wallet
            </button>
            <button className="modal-button" onClick={closeMetamaskPopup}>
              Close
            </button>
            {/* <button className="modal-button connect-wallet-button">
        <img src={metamaskLogo} alt="Metamask Logo" className="connect-wallet-logo" />
        Connect Wallet
      </button> */}
          </div>
        </div>
      </Modal>
      {/* popup pending */}
      <Modal
        isOpen={metamaskPopupPendingIsOpen}
        onRequestClose={closeMetamaskPopupPending}
        contentLabel="Metamask Connection Modal"
        className="modal-overlay"
        overlayClassName="modal-overlay"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Document Pending</h2>
          </div>
          <p className="modal-message">
            You cannot upload the document since it has not been varified.
          </p>

          <div className="modal-buttons">
            <button
              className="modal-button"
              onClick={closeMetamaskPopupPending}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <div className="sidebar">
        <div className="logo-container">
          <div className="logo-circle">
            <img src={certifiLogo} alt="CertiFi Logo" className="logo" />
          </div>
          <span className="company-name">CertiFi</span>
        </div>

        <div className="create-btn-container">
          <button className="create-btn" onClick={toggleCreateDropdown}>
            <FaPlusCircle className="icon" /> Create
            {showCreateDropdown && (
              <div className="create-dropdown">
                <Link to="/cform" className="create-dropdown-link">
                  <div className="create-dropdown-header">
                    <FaFileAlt className="file-icon" />
                    <span className="certificate-text">Certificate</span>
                  </div>
                  <div className="create-dropdown-description">
                    Choose a template, create a certificate and manage ownership
                    and validity
                  </div>
                </Link>
              </div>
            )}
          </button>
        </div>

        <div className="home">
          <FaHome className="icon" /> Home
        </div>
      </div>
      <div className="main-content">
        {/* Rest of the code remains the same */}
        <div className="search-bar">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search Document or Folder"
              value={query}
              onChange={(e) => setQuery(e.target.value)} // Update query on every keystroke
              className="w-[100%]"
            />
          </div>
          <div className="user-info">
            <div
              className="profile-image-container"
              onClick={toggleUserDropdown}
            >
              <img
                src={profilepic}
                alt="User Profile"
                className="profile-image"
              />
              <span className="username cursor-pointer">{name}</span>
              {showUserDropdown && (
                <div className="user-dropdown">
                  <Link to="/accountsetting" className="user-dropdown-content">
                    <FaCog className="settings-icon" />
                    <span>Settings</span>
                  </Link>
                </div>
              )}
            </div>
            <Link to="/">
              <button
                class="group flex items-center justify-start w-10 h-10 bg-red-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-lg active:translate-x-1 active:translate-y-1"
                onClick={Logout}
              >
                <div class="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3">
                  <svg class="w-4 h-4" viewBox="0 0 512 512" fill="white">
                    <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                  </svg>
                </div>
                <div class="absolute right-5 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  Logout
                </div>
              </button>
            </Link>
          </div>
        </div>
        {/* verify Modal */}
        <Modal
          isOpen={verifyModalIsOpen}
          onRequestClose={closeVerifyModal}
          contentLabel="Verify Account Modal"
          className="modal-overlay"
          overlayClassName="modal-overlay"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Confirmation </h2>
            </div>
            <p className="modal-message">
              Are you sure you want to upload the document to the Blockchain?
            </p>
            <div className="modal-buttons">
              <button className="modal-button verify" onClick={handleVerify}>
                Yes
              </button>
              <button
                className="modal-button cancel"
                onClick={closeVerifyModal}
              >
                No
              </button>
            </div>
          </div>
        </Modal>
        {/* Rest of the code remains the same */}
        <Card>
          <CardContent>
            <div className="documents-header">
              <Typography variant="h5" component="div">
                Documents
              </Typography>
              {/* 
             
              {/* Delete Modal */}
              <Modal
                isOpen={deleteModalIsOpen}
                onRequestClose={closeDeleteModal}
                contentLabel="Delete Account Modal"
                className="modal-overlay"
                overlayClassName="modal-overlay"
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h2 className="modal-title">Delete Document</h2>
                  </div>
                  <p className="modal-message">
                    Are you sure want to delete this document ? you will loose
                    this data and it will be permanently be deleted.
                  </p>
                  <div className="modal-buttons">
                    <button
                      className="modal-button delete"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                    <button
                      className="modal-button cancel"
                      onClick={closeDeleteModal}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Modal>
            </div>
            <div className="documents-table">
              <div className="table-header table-headers">
                <div>Course Name</div>
                <div>Status</div>
                <div>Signer</div>
                <div>Update date</div>
                <div>View</div>
                <div>Upload</div>
              </div>
              {results.length === 0
                ? certificates.map((certificate) => (
                    <div
                      className="table-rows table-rowss"
                      key={certificate._id}
                    >
                      <div>{certificate.courseName}</div>
                      <div
                        className={`status ${
                          certificate.verified === "pending"
                            ? "pending"
                            : certificate.verified === "true"
                            ? "approved"
                            : "rejected"
                        }`}
                      >
                        {certificate.verified === "pending"
                          ? "Pending"
                          : certificate.verified === "true"
                          ? "Approved"
                          : "Rejected"}
                      </div>
                      <div>{certificate.signer}</div>
                      <div>
                        {
                          new Date(certificate.createdAt)
                            .toISOString()
                            .split("T")[0]
                        }
                      </div>

                      <Link
                        onClick={toCertificateForm(certificate._id)}
                        className="view-icon"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      {/* onClick={storeHash(certificate._id)} */}
                      <div className="view-icon ">
                        {certificate.verified === "pending" ? (
                          <i onClick={() => handleAccept(certificate._id)}></i>
                        ) : certificate.verified === "true" ? (
                          certificate.documentIdentification === "" ? (
                            <i onClick={() => handleAccept(certificate._id)}>
                              <FaCodepen />
                            </i>
                          ) : (
                            <p>Uploaded to BlockChain</p>
                          )
                        ) : (
                          <i onClick={() => handleAccept(certificate._id)}></i>
                        )}
                      </div>
                    </div>
                  ))
                : results.map((certificate) => (
                    <div
                      className="table-rows table-rowss"
                      key={certificate._id}
                    >
                      <div>{certificate.courseName}</div>
                      <div
                        className={`status ${
                          certificate.verified === "pending"
                            ? "pending"
                            : certificate.verified === "true"
                            ? "approved"
                            : "rejected"
                        }`}
                      >
                        {certificate.verified === "pending"
                          ? "Pending"
                          : certificate.verified === "true"
                          ? "Approved"
                          : "Rejected"}
                      </div>
                      <div>{certificate.name}</div>
                      <div>
                        {
                          new Date(certificate.createdAt)
                            .toISOString()
                            .split("T")[0]
                        }
                      </div>

                      <Link
                        onClick={toCertificateForm(certificate._id)}
                        className="view-icon"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      {/* onClick={storeHash(certificate._id)}  */}
                      <div className="view-icon ">
                        {certificate.verified === "pending" ? (
                          <i onClick={() => handleAccept(certificate._id)}></i>
                        ) : certificate.verified === "true" ? (
                          certificate.documentIdentification === "" ? (
                            <i onClick={() => handleAccept(certificate._id)}>
                              <FaCodepen />
                            </i>
                          ) : (
                            <p>Uploaded to BlockChain</p>
                          )
                        ) : (
                          <i onClick={() => handleAccept(certificate._id)}></i>
                        )}
                      </div>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
