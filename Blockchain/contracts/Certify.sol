// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Certify {
    address owner;

    // Mapping to store IPFS hashes
    mapping(address => mapping(string => string)) public certificates;

    constructor(){
        owner = msg.sender;
    }
    event CertificateStored(address indexed owner, string identifier, string concatenatedString);

    event getCertificate(string concatenatedString);


    // Function to store an IPFS hash
    function storeCertificate(string memory identifier, string memory _hash) external returns (string memory) {
        require(keccak256(bytes(certificates[msg.sender][identifier])) != keccak256(bytes(_hash)), "The certificate already exists");
        certificates[msg.sender][identifier] = _hash;

        // Convert address to string
        string memory senderAddressStr = addressToString(msg.sender);

        // Concatenate the strings
        string memory concatenatedString = string(abi.encodePacked(senderAddressStr, identifier, _hash));
        emit CertificateStored(msg.sender, identifier, concatenatedString);

        return concatenatedString;
    }

    // Function to convert address to string
    function addressToString(address _addr) internal pure returns(string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint(uint8(value[i + 12] >> 4))];
            str[3 + i * 2] = alphabet[uint(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }

    // Function to retrieve an IPFS hash
    function getIPFSHash(address certiOwner, string memory _identifier, string memory _hash) public returns (string memory _certi) {
                
        if ( keccak256(bytes(certificates[certiOwner][_identifier])) == keccak256(bytes(_hash))){
            string memory url = "https://gateway.pinata.cloud/ipfs/" ;
            bytes memory bytesA = bytes(url);
            bytes memory bytesB = bytes(_hash);
            bytes memory concatenatedString = new bytes(bytesA.length + bytesB.length);
            // bytes memory bytesConcatenated = bytes(concatenatedString);
            uint k = 0;
            for (uint i = 0; i < bytesA.length; i++) {
                concatenatedString[k++] = bytesA[i];
            }
            for (uint i = 0; i < bytesB.length; i++) {
                concatenatedString[k++] = bytesB[i];
            }
            string memory finalConcatenatedString = string(concatenatedString);

            emit getCertificate(finalConcatenatedString);

            return finalConcatenatedString;
        }else{
            revert("Certificate not found");
        }
    }
}