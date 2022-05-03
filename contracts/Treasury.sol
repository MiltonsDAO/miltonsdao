pragma solidity 0.7.5;
library LowGasSafeMath {
    function add(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require((z = x + y) >= x);
    }

    function add32(uint32 x, uint32 y) internal pure returns (uint32 z) {
        require((z = x + y) >= x);
    }

    function sub(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require((z = x - y) <= x);
    }

    function sub32(uint32 x, uint32 y) internal pure returns (uint32 z) {
        require((z = x - y) <= x);
    }

    function mul(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(x == 0 || (z = x * y) / x == y);
    }

    function mul32(uint32 x, uint32 y) internal pure returns (uint32 z) {
        require(x == 0 || (z = x * y) / x == y);
    }

    function add(int256 x, int256 y) internal pure returns (int256 z) {
        require((z = x + y) >= x == (y >= 0));
    }

    function sub(int256 x, int256 y) internal pure returns (int256 z) {
        require((z = x - y) <= x == (y >= 0));
    }

    function div(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y > 0);
        z = x / y;
    }
}

library Address {
    function isContract(address account) internal view returns (bool) {
        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return _functionCallWithValue(target, data, 0, errorMessage);
    }

    function _functionCallWithValue(
        address target,
        bytes memory data,
        uint256 weiValue,
        string memory errorMessage
    ) private returns (bytes memory) {
        require(isContract(target), "Address: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.call{value: weiValue}(
            data
        );
        if (success) {
            return returndata;
        } else {
            if (returndata.length > 0) {
                // solhint-disable-next-line no-inline-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }

    function _verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) private pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            if (returndata.length > 0) {
                // solhint-disable-next-line no-inline-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}

contract OwnableData {
    address public owner;
    address public pendingOwner;
}

contract Ownable is OwnableData {
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function transferOwnership(
        address newOwner,
        bool direct,
        bool renounce
    ) public onlyOwner {
        if (direct) {
            require(
                newOwner != address(0) || renounce,
                "Ownable: zero address"
            );

            emit OwnershipTransferred(owner, newOwner);
            owner = newOwner;
            pendingOwner = address(0);
        } else {
            pendingOwner = newOwner;
        }
    }

    function claimOwnership() public {
        address _pendingOwner = pendingOwner;

        require(
            msg.sender == _pendingOwner,
            "Ownable: caller != pending owner"
        );

        emit OwnershipTransferred(owner, _pendingOwner);
        owner = _pendingOwner;
        pendingOwner = address(0);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }
}

interface IERC20 {
    function decimals() external view returns (uint8);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

    function totalSupply() external view returns (uint256);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

library SafeERC20 {
    using LowGasSafeMath for uint256;
    using Address for address;

    function safeTransfer(
        IERC20 token,
        address to,
        uint256 value
    ) internal {
        _callOptionalReturn(
            token,
            abi.encodeWithSelector(token.transfer.selector, to, value)
        );
    }

    function safeTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 value
    ) internal {
        _callOptionalReturn(
            token,
            abi.encodeWithSelector(token.transferFrom.selector, from, to, value)
        );
    }

    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        bytes memory returndata = address(token).functionCall(
            data,
            "SafeERC20: low-level call failed"
        );
        if (returndata.length > 0) {
            // Return data is optional
            // solhint-disable-next-line max-line-length
            require(
                abi.decode(returndata, (bool)),
                "SafeERC20: ERC20 operation did not succeed"
            );
        }
    }
}

interface IERC20Mintable {
    function mint(uint256 amount_) external;

    function mint(address account_, uint256 ammount_) external;
}

interface ITIMEERC20 is IERC20Mintable, IERC20 {
    function burnFrom(address account_, uint256 amount_) external;
}

interface IBondCalculator {
    function valuation(address pair_, uint256 amount_)
        external
        view
        returns (uint256 _value);
}

contract MlsTreasury is Ownable {
    using LowGasSafeMath for uint256;
    using LowGasSafeMath for uint32;
    using SafeERC20 for IERC20;

    event Deposit(address indexed token, uint256 amount, uint256 value);
    event Withdrawal(address indexed token, uint256 amount, uint256 value);
    event CreateDebt(
        address indexed debtor,
        address indexed token,
        uint256 amount,
        uint256 value
    );
    event RepayDebt(
        address indexed debtor,
        address indexed token,
        uint256 amount,
        uint256 value
    );
    event ReservesManaged(address indexed token, uint256 amount);
    event ReservesUpdated(uint256 indexed totalReserves);
    event ReservesAudited(uint256 indexed totalReserves);
    event RewardsMinted(
        address indexed caller,
        address indexed recipient,
        uint256 amount
    );
    event ChangeQueued(MANAGING indexed managing, address queued);
    event ChangeActivated(
        MANAGING indexed managing,
        address activated,
        bool result
    );
    event ChangeLimitAmount(uint256 amount);

    enum MANAGING {
        RESERVEDEPOSITOR,
        RESERVESPENDER,
        RESERVETOKEN,
        RESERVEMANAGER,
        LIQUIDITYDEPOSITOR,
        LIQUIDITYTOKEN,
        LIQUIDITYMANAGER,
        DEBTOR,
        REWARDMANAGER,
        SOHM
    }

    ITIMEERC20 public immutable Mls;
    uint32 public immutable secondsNeededForQueue;

    address[] public reserveTokens;
    mapping(address => bool) public isReserveToken;
    mapping(address => uint32) public reserveTokenQueue;

    address[] public reserveDepositors;
    mapping(address => bool) public isReserveDepositor;
    mapping(address => uint32) public reserveDepositorQueue;

    address[] public reserveSpenders;
    mapping(address => bool) public isReserveSpender;
    mapping(address => uint32) public reserveSpenderQueue;

    address[] public liquidityTokens;
    mapping(address => bool) public isLiquidityToken;
    mapping(address => uint32) public LiquidityTokenQueue;

    address[] public liquidityDepositors;
    mapping(address => bool) public isLiquidityDepositor;
    mapping(address => uint32) public LiquidityDepositorQueue;

    mapping(address => address) public bondCalculator;

    address[] public reserveManagers;
    mapping(address => bool) public isReserveManager;
    mapping(address => uint32) public ReserveManagerQueue;

    address[] public liquidityManagers;
    mapping(address => bool) public isLiquidityManager;
    mapping(address => uint32) public LiquidityManagerQueue;

    address[] public debtors;
    mapping(address => bool) public isDebtor;
    mapping(address => uint32) public debtorQueue;
    mapping(address => uint256) public debtorBalance;

    address[] public rewardManagers;
    mapping(address => bool) public isRewardManager;
    mapping(address => uint32) public rewardManagerQueue;

    mapping(address => uint256) public hourlyLimitAmounts;
    mapping(address => uint32) public hourlyLimitQueue;

    uint256 public limitAmount;

    IERC20 public MEMOries;
    uint256 public sOHMQueue;

    uint256 public totalReserves;
    uint256 public totalDebt;

    address[] public participants;
    mapping(address => address) public referrals;
    mapping(address => address[]) public partners;
    uint256 public selfReferralFee = 300;
    uint256 public referralFee = 300;

    constructor(
        address _Mls,
        address _USDT,
        address _MLSUSDT,
        uint32 _secondsNeededForQueue,
        address _calculator
    ) {
        require(_Mls != address(0));
        Mls = ITIMEERC20(_Mls);

        isReserveToken[_USDT] = true;
        reserveTokens.push(_USDT);

        isLiquidityToken[_MLSUSDT] = true;
        liquidityTokens.push(_MLSUSDT);
        bondCalculator[_MLSUSDT] = _calculator;

        secondsNeededForQueue = _secondsNeededForQueue;
    }

    function setLimitAmount(uint256 amount) external onlyOwner {
        limitAmount = amount;
        emit ChangeLimitAmount(limitAmount);
    }

    function setSelfReferralFee(uint256 fee) public onlyOwner {
        selfReferralFee = fee;
    }

    function setReferralFee(uint256 fee) public onlyOwner {
        referralFee = fee;
    }

    function isReferral(address _referral) public view returns (bool) {
        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i] == _referral) {
                return true;
            }
        }
        return false;
    }

    function setReferral(address ref) public {
        if (!isReferral(msg.sender)) {
            participants.push(msg.sender);
        }
        if (ref != address(0) && !isReferral(ref)) {
            participants.push(ref);
        }
        referrals[msg.sender] = ref;
        if (msg.sender != ref) {
            partners[ref].push(msg.sender);
        }
    }

    function deposit(
        uint256 _amount,
        address _token,
        uint256 _profit
    ) external returns (uint256 send_) {
        require(
            isReserveToken[_token] || isLiquidityToken[_token],
            "Not accepted"
        );

        if (isReserveToken[_token]) {
            require(isReserveDepositor[msg.sender], "Not approved");
        } else {
            require(isLiquidityDepositor[msg.sender], "Not approved");
        }

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        uint256 value = riskFreeValueOf(_token, _amount);
        // mint Mls needed and store amount of rewards for distribution
        send_ = value.sub(_profit);
        // limitRequirements(msg.sender, send_);
        Mls.mint(msg.sender, send_);

        totalReserves = totalReserves.add(value);

        emit ReservesUpdated(totalReserves);

        emit Deposit(_token, _amount, value);

    }

    function withdraw(uint256 _amount, address _token) external {
        require(isReserveToken[_token], "Not accepted"); // Only reserves can be used for redemptions
        require(isReserveSpender[msg.sender], "Not approved");

        uint256 value = riskFreeValueOf(_token, _amount);
        Mls.burnFrom(msg.sender, value);

        totalReserves = totalReserves.sub(value);
        emit ReservesUpdated(totalReserves);

        IERC20(_token).safeTransfer(msg.sender, _amount);

        emit Withdrawal(_token, _amount, value);
    }

    function incurDebt(uint256 _amount, address _token) external {
        require(isDebtor[msg.sender], "Not approved");
        require(isReserveToken[_token], "Not accepted");

        uint256 value = riskFreeValueOf(_token, _amount);

        uint256 maximumDebt = MEMOries.balanceOf(msg.sender); // Can only borrow against sOHM held
        uint256 balance = debtorBalance[msg.sender];
        uint256 availableDebt = maximumDebt.sub(balance);
        require(value <= availableDebt, "Exceeds debt limit");
        // limitRequirements(msg.sender, value);
        debtorBalance[msg.sender] = balance.add(value);
        totalDebt = totalDebt.add(value);

        totalReserves = totalReserves.sub(value);
        emit ReservesUpdated(totalReserves);

        IERC20(_token).safeTransfer(msg.sender, _amount);

        emit CreateDebt(msg.sender, _token, _amount, value);
    }

    function repayDebtWithReserve(uint256 _amount, address _token) external {
        require(isDebtor[msg.sender], "Not approved");
        require(isReserveToken[_token], "Not accepted");

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        uint256 value = riskFreeValueOf(_token, _amount);
        debtorBalance[msg.sender] = debtorBalance[msg.sender].sub(value);
        totalDebt = totalDebt.sub(value);

        totalReserves = totalReserves.add(value);
        emit ReservesUpdated(totalReserves);

        emit RepayDebt(msg.sender, _token, _amount, value);
    }

    function repayDebtWithTime(uint256 _amount) external {
        require(isDebtor[msg.sender], "Not approved as debtor");
        require(isReserveSpender[msg.sender], "Not approved as spender");

        Mls.burnFrom(msg.sender, _amount);

        debtorBalance[msg.sender] = debtorBalance[msg.sender].sub(_amount);
        totalDebt = totalDebt.sub(_amount);

        emit RepayDebt(msg.sender, address(Mls), _amount, _amount);
    }

    function manage(address _token, uint256 _amount) external {
        uint256 value = riskFreeValueOf(_token, _amount);
        if (isLiquidityToken[_token]) {
            require(isLiquidityManager[msg.sender], "Not approved");
            require(value <= excessReserves());
        } else {
            if (isReserveToken[_token]) require(value <= excessReserves());
            require(isReserveManager[msg.sender], "Not approved");
        }

        // limitRequirements(msg.sender, value);
        totalReserves = totalReserves.sub(value);
        emit ReservesUpdated(totalReserves);

        IERC20(_token).safeTransfer(msg.sender, _amount);

        emit ReservesManaged(_token, _amount);
    }

    function mintRewards(address _recipient, uint256 _amount) external {
        require(isRewardManager[msg.sender], "Not approved");
        require(_amount <= excessReserves(), "Insufficient reserves");
        // limitRequirements(msg.sender, _amount);
        Mls.mint(_recipient, _amount);

        emit RewardsMinted(msg.sender, _recipient, _amount);
    }

    function excessReserves() public view returns (uint256) {
        return totalReserves.sub(Mls.totalSupply().sub(totalDebt));
    }

    function auditReserves() external onlyOwner {
        uint256 reserves;
        for (uint256 i = 0; i < reserveTokens.length; i++) {
            reserves = reserves.add(
                riskFreeValueOf(
                    reserveTokens[i],
                    IERC20(reserveTokens[i]).balanceOf(address(this))
                )
            );
        }
        for (uint256 i = 0; i < liquidityTokens.length; i++) {
            reserves = reserves.add(
                riskFreeValueOf(
                    liquidityTokens[i],
                    IERC20(liquidityTokens[i]).balanceOf(address(this))
                )
            );
        }
        totalReserves = reserves;
        emit ReservesUpdated(reserves);
        emit ReservesAudited(reserves);
    }

    function riskFreeValueOf(address _token, uint256 _amount)
        public
        view
        returns (uint256 value_)
    {
        if (isReserveToken[_token]) {
            value_ = _amount.mul(10**Mls.decimals()).div(
                10**IERC20(_token).decimals()
            );
        } else if (isLiquidityToken[_token]) {
            value_ = IBondCalculator(bondCalculator[_token]).valuation(
                _token,
                _amount
            );
        }
    }

    function queue(MANAGING _managing, address _address)
        external
        onlyOwner
        returns (bool)
    {
        require(_address != address(0), "IA");
        if (_managing == MANAGING.RESERVEDEPOSITOR) {
            // 0
            reserveDepositorQueue[_address] = uint32(block.timestamp).add32(
                secondsNeededForQueue
            );
        } else if (_managing == MANAGING.RESERVESPENDER) {
            // 1
            reserveSpenderQueue[_address] = uint32(block.timestamp).add32(
                secondsNeededForQueue
            );
        } else if (_managing == MANAGING.RESERVETOKEN) {
            // 2
            reserveTokenQueue[_address] = uint32(block.timestamp).add32(
                secondsNeededForQueue
            );
        } else if (_managing == MANAGING.RESERVEMANAGER) {
            // 3
            ReserveManagerQueue[_address] = uint32(block.timestamp).add32(
                secondsNeededForQueue.mul32(2)
            );
        } else if (_managing == MANAGING.LIQUIDITYDEPOSITOR) {
            // 4
            LiquidityDepositorQueue[_address] = uint32(block.timestamp).add32(
                secondsNeededForQueue
            );
        } else if (_managing == MANAGING.LIQUIDITYTOKEN) {
            // 5
            LiquidityTokenQueue[_address] = uint32(block.timestamp).add32(
                secondsNeededForQueue
            );
        } else if (_managing == MANAGING.LIQUIDITYMANAGER) {
            // 6
            LiquidityManagerQueue[_address] = uint32(block.timestamp).add32(
                secondsNeededForQueue.mul32(2)
            );
        } else if (_managing == MANAGING.DEBTOR) {
            // 7
            debtorQueue[_address] = uint32(block.timestamp).add32(
                secondsNeededForQueue
            );
        } else if (_managing == MANAGING.REWARDMANAGER) {
            // 8
            rewardManagerQueue[_address] = uint32(block.timestamp).add32(
                secondsNeededForQueue
            );
        } else if (_managing == MANAGING.SOHM) {
            // 9
            sOHMQueue = uint32(block.timestamp).add32(secondsNeededForQueue);
        } else return false;

        emit ChangeQueued(_managing, _address);
        return true;
    }

    function toggle(
        MANAGING _managing,
        address _address,
        address _calculator
    ) external onlyOwner returns (bool) {
        require(_address != address(0), "IA");
        bool result;
        if (_managing == MANAGING.RESERVEDEPOSITOR) {
            // 0
            if (
                requirements(
                    reserveDepositorQueue,
                    isReserveDepositor,
                    _address
                )
            ) {
                reserveDepositorQueue[_address] = 0;
                if (!listContains(reserveDepositors, _address)) {
                    reserveDepositors.push(_address);
                }
            }
            result = !isReserveDepositor[_address];
            isReserveDepositor[_address] = result;
        } else if (_managing == MANAGING.RESERVESPENDER) {
            // 1
            if (requirements(reserveSpenderQueue, isReserveSpender, _address)) {
                reserveSpenderQueue[_address] = 0;
                if (!listContains(reserveSpenders, _address)) {
                    reserveSpenders.push(_address);
                }
            }
            result = !isReserveSpender[_address];
            isReserveSpender[_address] = result;
        } else if (_managing == MANAGING.RESERVETOKEN) {
            // 2
            if (requirements(reserveTokenQueue, isReserveToken, _address)) {
                reserveTokenQueue[_address] = 0;
                if (
                    !listContains(reserveTokens, _address) &&
                    !listContains(liquidityTokens, _address)
                ) {
                    reserveTokens.push(_address);
                }
            }
            result = !isReserveToken[_address];
            require(
                !result || !isLiquidityToken[_address],
                "Do not add to both types of token"
            );
            isReserveToken[_address] = result;
        } else if (_managing == MANAGING.RESERVEMANAGER) {
            // 3
            if (requirements(ReserveManagerQueue, isReserveManager, _address)) {
                reserveManagers.push(_address);
                ReserveManagerQueue[_address] = 0;
                if (!listContains(reserveManagers, _address)) {
                    reserveManagers.push(_address);
                }
            }
            result = !isReserveManager[_address];
            isReserveManager[_address] = result;
        } else if (_managing == MANAGING.LIQUIDITYDEPOSITOR) {
            // 4
            if (
                requirements(
                    LiquidityDepositorQueue,
                    isLiquidityDepositor,
                    _address
                )
            ) {
                liquidityDepositors.push(_address);
                LiquidityDepositorQueue[_address] = 0;
                if (!listContains(liquidityDepositors, _address)) {
                    liquidityDepositors.push(_address);
                }
            }
            result = !isLiquidityDepositor[_address];
            isLiquidityDepositor[_address] = result;
        } else if (_managing == MANAGING.LIQUIDITYTOKEN) {
            // 5
            if (requirements(LiquidityTokenQueue, isLiquidityToken, _address)) {
                LiquidityTokenQueue[_address] = 0;
                if (
                    !listContains(liquidityTokens, _address) &&
                    !listContains(reserveTokens, _address)
                ) {
                    liquidityTokens.push(_address);
                }
            }
            result = !isLiquidityToken[_address];
            require(
                !result || !isReserveToken[_address],
                "Do not add to both types of token"
            );
            isLiquidityToken[_address] = result;
            bondCalculator[_address] = _calculator;
        } else if (_managing == MANAGING.LIQUIDITYMANAGER) {
            // 6
            if (
                requirements(
                    LiquidityManagerQueue,
                    isLiquidityManager,
                    _address
                )
            ) {
                LiquidityManagerQueue[_address] = 0;
                if (!listContains(liquidityManagers, _address)) {
                    liquidityManagers.push(_address);
                }
            }
            result = !isLiquidityManager[_address];
            isLiquidityManager[_address] = result;
        } else if (_managing == MANAGING.DEBTOR) {
            // 7
            if (requirements(debtorQueue, isDebtor, _address)) {
                debtorQueue[_address] = 0;
                if (!listContains(debtors, _address)) {
                    debtors.push(_address);
                }
            }
            result = !isDebtor[_address];
            isDebtor[_address] = result;
        } else if (_managing == MANAGING.REWARDMANAGER) {
            // 8
            if (requirements(rewardManagerQueue, isRewardManager, _address)) {
                rewardManagerQueue[_address] = 0;
                if (!listContains(rewardManagers, _address)) {
                    rewardManagers.push(_address);
                }
            }
            result = !isRewardManager[_address];
            isRewardManager[_address] = result;
        } else if (_managing == MANAGING.SOHM) {
            // 9
            sOHMQueue = 0;
            MEMOries = IERC20(_address);
            result = true;
        } else return false;

        emit ChangeActivated(_managing, _address, result);
        return true;
    }

    function requirements(
        mapping(address => uint32) storage queue_,
        mapping(address => bool) storage status_,
        address _address
    ) internal view returns (bool) {
        if (!status_[_address]) {
            require(queue_[_address] != 0, "Must queue");
            require(
                queue_[_address] <= uint32(block.timestamp),
                "Queue not expired"
            );
            return true;
        }
        return false;
    }

    // function limitRequirements(address _address, uint256 value) internal {
    //     if (block.timestamp.sub(hourlyLimitQueue[_address]) >= 1 hours) {
    //         hourlyLimitAmounts[_address] = limitAmount;
    //         hourlyLimitQueue[_address] = uint32(block.timestamp);
    //     }
    //     hourlyLimitAmounts[_address] = hourlyLimitAmounts[_address].sub(value);
    // }

    function listContains(address[] storage _list, address _token)
        internal
        view
        returns (bool)
    {
        for (uint256 i = 0; i < _list.length; i++) {
            if (_list[i] == _token) {
                return true;
            }
        }
        return false;
    }
}
