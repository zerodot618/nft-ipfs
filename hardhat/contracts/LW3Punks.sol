// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract LW3Punks is ERC721Enumerable, Ownable {
    using Strings for uint256;
    /**
     * @dev _baseTokenURI 用于计算 {tokenURI} 。如果设置，每个token的
     * 最终URI将是 baseURI 和 tokenId 的拼接
     */
    string _baseTokenURI;

    //  _price 一个 LW3Punks NFT 的价格
    uint256 public _price = 0.01 ether;

    // _paused 用来在紧急情况下暂停合约的
    bool public _paused;

    // LW3Punks 最大数量
    uint256 public maxTokenIds = 10;

    // 铸造的代币总数
    uint256 public tokenIds;

    modifier onlyWhenNotPaused() {
        require(!_paused, "Contract currently paused");
        _;
    }

    /**
     * @dev ERC721构造函数接收一个`名称'和一个`符号'到标记集合。
     * 在我们的例子中，名称是`LW3Punks`，符号是`LW3P`。
     * LW3P的构造函数接收baseURI，为集合设置_baseTokenURI。
     */
    constructor(string memory baseURI) ERC721("LW3Punks", "LW3P") {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev mint允许用户每笔交易铸造1个NFT。
     */
    function mint() public payable onlyWhenNotPaused {
        require(tokenIds < maxTokenIds, "Exceed maximum LW3Punks supply");
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    /**
     * @dev _baseURI 覆盖了Openzeppelin的ERC721实现，
     * 后者在默认情况下为baseURI返回一个空字符串
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev tokenURI覆盖了Openzeppelin的ERC721实现的tokenURI功能。
     * 该函数返回URI，我们可以从那里提取给定tokenId的元数据
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory baseURI = _baseURI();
        // 这里它检查baseURI的长度是否大于0，如果大于则返回
        // baseURI并附加tokenId和'。json '，以便它知道存储在IPFS上
        // 的给定tokenId的元数据json文件的位置
        // 如果baseURI为空，则返回一个空字符串
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
                : "";
    }

    /**
     * @dev setPaused使合约暂停或不暂停
     */
    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    /**
     * @dev withdraw 将合约中的所有以太发送给合约的所有者
     */
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    // 接收以太的功能，msg.data必须是空的
    receive() external payable {}

    // 当msg.data不为空时，会调用 fallback 函数
    fallback() external payable {}
}
