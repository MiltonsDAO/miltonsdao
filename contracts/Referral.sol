
pragma solidity 0.7.5;

interface IOwnable {
  function owner() external view returns (address);

  function renounceOwnership() external;

  function transferOwnership(address newOwner_) external;
}

contract Ownable is IOwnable {
  address internal _owner;
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );

  constructor() {
    _owner = msg.sender;
    emit OwnershipTransferred(address(0), _owner);
  }

  function owner() public view override returns (address) {
    return _owner;
  }

  modifier onlyOwner() {
    require(_owner == msg.sender, "Ownable: caller is not the owner");
    _;
  }

  function renounceOwnership() public virtual override onlyOwner {
    emit OwnershipTransferred(_owner, address(0));
    _owner = address(0);
  }

  function transferOwnership(address newOwner_)
    public
    virtual
    override
    onlyOwner
  {
    require(newOwner_ != address(0), "Ownable: new owner is the zero address");
    emit OwnershipTransferred(_owner, newOwner_);
    _owner = newOwner_;
  }
}

contract Referral is Ownable {
  constructor(uint256 selfFee, uint256 refFee) {
    _selfReferralFee = selfFee;
    _referralFee = refFee;
  }

  address[] public users;
  mapping(address => address) private _referrals;
  mapping(address => address[]) private _partners;
  mapping(address => uint256) public nfts;
  mapping(address => uint256) public totalProfit;
  uint256 private _selfReferralFee;
  uint256 private _referralFee;

  function addProfit(address user, uint256 profit) public {
    totalProfit[user] += profit;
  }

  function referral(address user) public view returns (address) {
    return _referrals[user];
  }

  function selfReferralFee(address user) public view returns (uint256) {
    return _selfReferralFee;
  }

  function referralFee(address user) public view returns (uint256) {
    return _referralFee;
  }

  function setSelfReferralFee(uint256 fee) public onlyOwner {
    _selfReferralFee = fee;
  }

  function setReferralFee(uint256 fee) public onlyOwner {
    _referralFee = fee;
  }

  function registered(address user) public view returns (bool) {
    for (uint256 i = 0; i < users.length; i++) {
      if (users[i] == user) {
        return true;
      }
    }
    return false;
  }

  function setReferral(address ref) public {
    require(
      _referrals[msg.sender] == address(0) ||
        _referrals[msg.sender] == msg.sender,
      "referral exists"
    );
    if (!registered(msg.sender)) {
      users.push(msg.sender);
    }
    _referrals[msg.sender] = ref;
    if (msg.sender != ref) {
      _partners[ref].push(msg.sender);
    }
  }

  function partners(address user) public view returns (address[] memory) {
    return _partners[user];
  }
}
