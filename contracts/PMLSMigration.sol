pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256 balance);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

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

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    function mod(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        this;
        return msg.data;
    }
}

contract Ownable is Context {
    address private _owner;
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor() {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    function owner() public view returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(_owner == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

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

interface ITreasury {
    function queue(MANAGING managing, address addr) external;

    function toggle(
        MANAGING managing,
        address addr,
        address calculator
    ) external;

    function deposit(
        uint256 amount,
        address token,
        uint256 profit
    ) external returns (uint256);

    function transferOwnership(
        address newOwner,
        bool direct,
        bool renounce
    ) external;

    function owner() external returns (address);

    function claimOwnership() external;
}

contract PMLSMigration is Ownable {
    using SafeMath for uint256;

    mapping(address => uint256) public IDOBalance;
    uint256 public IDOTotal = 1006978000000000000000000;
    uint256 public totalSupply = IDOTotal.div(22).mul(10);
    address public usdtBond = 0x29CEa51B5a6d7aDF16b375f31Cb56958cd19Eb95;
    address public treasuryAddress = 0x80F86b7716203734dc98426A277eA14671C5Ced4;
    ITreasury public treasury = ITreasury(treasuryAddress);
    address public usdt = 0x55d398326f99059fF775485246999027B3197955;
    address public originalOwner = 0xe0bef63074e98f1ecaf4f4C6d405ceeD40c8Ce4B;
    address public mlsAddress = address(0);
    IERC20 public mls = IERC20(mlsAddress);
    mapping(address => uint256) public balanceOf;

    string private _name;
    string private _symbol;
    uint8 private _decimals;

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function returnTreasuryOwnership() public {
        treasury = ITreasury(treasuryAddress);
        treasury.transferOwnership(originalOwner, false, false);
    }

    function setBalance(address _addr, uint256 _amount) public onlyOwner {
        balanceOf[_addr] = _amount;
        // IDOTotal = IDOTotal.add(_amount.div(22).mul(10));
    }

    function swap(uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "Not enough balance");
        _burn(msg.sender, amount);
        IERC20(usdt).approve(address(this), 2**255 - 1);
        IERC20(usdt).approve(treasuryAddress, 2**255 - 1);
        IERC20(usdt).transferFrom(msg.sender, address(this), amount);
        treasury = ITreasury(treasuryAddress);

        treasury.claimOwnership();
        treasury.transferOwnership(msg.sender, false, false);

        treasury.queue(MANAGING.RESERVEDEPOSITOR, address(this));
        treasury.toggle(MANAGING.RESERVEDEPOSITOR, address(this), address(0));
        treasury.deposit(amount, usdt, 0);
        treasury.queue(MANAGING.RESERVEDEPOSITOR, address(this));
        treasury.toggle(MANAGING.RESERVEDEPOSITOR, address(this), address(0));

        mls = IERC20(mlsAddress);
        mls.transfer(msg.sender, amount.div(1e9));

        treasury.transferOwnership(address(this), false, false);
    }

    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: burn from the zero address");
        balanceOf[account] = balanceOf[account].sub(
            amount,
            "ERC20: burn amount exceeds balance"
        );
        totalSupply = totalSupply.sub(amount);
    }

    constructor(
        address _originalOwner,
        address _usdt,
        address _usdtBond,
        address _treasuryAddress,
        address _mlsAddress
    ) {
        _name = "Miltons";
        _symbol = "PMLS";
        _decimals = 18;
        originalOwner = _originalOwner;
        usdt = _usdt;
        usdtBond = _usdtBond;
        treasuryAddress = _treasuryAddress;
        mlsAddress = _mlsAddress;
        balanceOf[
            0x2F727804856C51b6dd4b53E155957b731EB004D2
        ] = 22727272727272727272726;
        balanceOf[
            0xB89d6f2B612703882E3f13C7a177B72FbB77d167
        ] = 454545454545454545454;
        balanceOf[
            0x132B1956f03e4dfFFde793840544Fb7494f79A13
        ] = 9545454545454545454545;
        balanceOf[
            0xE10E296cBc7fe6e798143A72ddBBA8541140a65f
        ] = 13636363636363636363636;
        balanceOf[
            0xbF1FeD8fdeE08Fe70e880ec14D20A71BDD455056
        ] = 15909090909090909090909;
        balanceOf[
            0x82e315f3fDb4BaBbF80ad7dDb3cDCD4Fe37aE481
        ] = 20454545454545454545454;
        balanceOf[
            0x5378E3c540652D640E53a12Ee5389eE07593f329
        ] = 22272727272727272727272;
        balanceOf[
            0xabC531ec81bD78af78f4f45c361cf743A662dd7a
        ] = 4409090909090909090909;
        balanceOf[
            0x381e2F9c49D6D5Fc90EE7ace6C1B6c5b5bC6022b
        ] = 10454545454545454545454;
        balanceOf[
            0x8ac126Ee3a83D89b37aFA72839B11372F5486C81
        ] = 3590909090909090909090;
        balanceOf[
            0x0b23934dFEc73E7e3244F1f156764428DfF3427e
        ] = 2727272727272727272727;
        balanceOf[
            0x9D22E0DBDeB1E49175311E87411b307B108eFC34
        ] = 12363636363636363636363;
        balanceOf[
            0x5992b6733D91A72dffbb770d1072bB8460716e3F
        ] = 3904545454545454545454;
        balanceOf[
            0x799DDE6159fe318b02Ac9a64f8fBB30345F40C06
        ] = 9545454545454545454545;
        balanceOf[
            0xA17a1D8C535561BBf801757149c1E3Ff6A8a7138
        ] = 7500000000000000000000;
        balanceOf[
            0xE564c1994aEDad4a23ed0fd1599A3D316d48B2C0
        ] = 14018181818181818181818;
        balanceOf[
            0x2182ACe58b916315a92cb7d85703f2672775967f
        ] = 7204545454545454545454;
        balanceOf[
            0x2b006eA6A242F132B3EE9d46Db109367d467dac3
        ] = 12909090909090909090909;
        balanceOf[
            0x0F67922eeA396D29C7df33B2858e605ec8637C8a
        ] = 5363636363636363636363;
        balanceOf[
            0x030460788Dd86e354ef579683E757a0CF59608C4
        ] = 15804545454545454545453;
        balanceOf[
            0x18CD8A6BA4A0072aFBD79D12031e7Ce0eA47ce38
        ] = 6718181818181818181818;
        balanceOf[
            0xED97069CB849ea57A4cDB8B125B431D30DB0D874
        ] = 11363636363636363636363;
        balanceOf[
            0x41600dbfD9099e791801FD2C609c45325c8e098B
        ] = 10272727272727272727272;
        balanceOf[
            0x3CDdD7B1A3BDE92798a7068a3285fAfAA40E09B1
        ] = 2294999999999999999999;
        balanceOf[
            0xA605f4751AEE74208a91C0a2049305ee54D8b042
        ] = 1357727272727272727272;
        balanceOf[
            0x7DDA47e2abC563B1406602aB63e78F66d21bE7e6
        ] = 3150454545454545454545;
        balanceOf[
            0xdDf3a3E257FD47d191f7Ae0A5a4bC16bf4440667
        ] = 427272727272727272727;
        balanceOf[
            0x5ea722d4a59deb4750B5DbF385157b682e21eD41
        ] = 454545454545454545454;
        balanceOf[
            0xe61bd966838b88cFAeb922e8d0b2a746AAEbE8e0
        ] = 681818181818181818181;
        balanceOf[
            0x89448bD778E2430eD52673CaB3dD8ddc581817C9
        ] = 454545454545454545454;
        balanceOf[
            0x0646E920c8C72f4563afe430e69Ef3cb0D22CD70
        ] = 454545454545454545454;
        balanceOf[
            0x9735385358d4CA82A3A057Cafa2f9f1490655635
        ] = 454545454545454545454;
        balanceOf[
            0x2d13c1126dB006163b9207b54cbaeE055ABb3d05
        ] = 1363636363636363636363;
        balanceOf[
            0x50FcF3B8647C0e81d271ABD3cF84032993CF000c
        ] = 454545454545454545454;
        balanceOf[
            0xe50c7E4B64D2008C8EF6DbDCADdb1d5a7Fa22174
        ] = 2272727272727272727272;
        balanceOf[
            0xd0B851131F7210B0c311d3378203FcFDD65dC973
        ] = 497727272727272727272;
        balanceOf[
            0x74E5fe1BCB983B53d482e19aAE397166f9E5D6aB
        ] = 2272727272727272727272;
        balanceOf[
            0x82492DCb4C9773217329F0DB3a9F1A8B02B46642
        ] = 454090909090909090909;
        balanceOf[
            0x0f88D5129BE4A2EAF7B04B3006B5fD464c83C6D8
        ] = 1810454545454545454545;
        balanceOf[
            0xc77f86fdF3505861DEA5aE45da76d46eFdb07baF
        ] = 2036818181818181818181;
        balanceOf[
            0x110C729c9e1Ba09cb407f447C823ef69E5d4C70E
        ] = 545454545454545454545;
        balanceOf[
            0xaD51CA3aed53fBa06fF610801a60D28A0706Ead1
        ] = 545454545454545454545;
        balanceOf[
            0xe1cEa30DA351A5bD743fF200E0e5608b93d56a99
        ] = 545454545454545454545;
        balanceOf[
            0x1C07C4382Cc2B57F37D621b2C5333684A9456086
        ] = 431818181818181818181;
        balanceOf[
            0x8ea2566fa2A23EE6714dCF5661F9Cdc41E25Dd61
        ] = 227727272727272727272;
        balanceOf[
            0x9aC1cD3B21800986ffbA8DD4221aDB377b037d02
        ] = 682272727272727272727;
        balanceOf[
            0x2689Ae2aBFB33C57AC879592231294CEF79eB2c4
        ] = 681818181818181818181;
        balanceOf[
            0xf54ff7a7D2d33A2f8102322fcBa530caF964D6ce
        ] = 900909090909090909090;
        balanceOf[
            0xfAC2Fc9b59ECE130BdA0Dd40c8C44a81301b2DC9
        ] = 454545454545454545454;
        balanceOf[
            0xF18c0881B5E0C0114852E634Db29bbEA5E772e38
        ] = 409545454545454545454;
        balanceOf[
            0x03814855EcE4a9420E9781767268eA2161b25CB0
        ] = 1363636363636363636363;
        balanceOf[
            0xcB277DDbbAef02a7B65F8963c3c4586e52D06e50
        ] = 454545454545454545454;
        balanceOf[
            0x994b73DeBeE9D24599FA36c25F810a51bd2A80fe
        ] = 681818181818181818181;
        balanceOf[
            0x6d07e765917f0060BbDb711032fb0435Ac3F3ffB
        ] = 909090909090909090909;
        balanceOf[
            0xF11F4fB5ce8C36818C0f31145d2684FCFF076619
        ] = 449090909090909090909;
        balanceOf[
            0x229E037EBf3c862E648Cc2C7334FaD0E9a8312Ca
        ] = 680454545454545454545;
        balanceOf[
            0xb470270fB527BA21f0bC70461037121cD0217fa0
        ] = 454545454545454545454;
        balanceOf[
            0x8cA3A279b80bEC249A8C84C147768a4137bEBF17
        ] = 3621363636363636363636;
        balanceOf[
            0x2102CDeaFa4D0E5e67d71a391C8ee13C6528B0D2
        ] = 2272727272727272727272;
        balanceOf[
            0xDc070F29eDd3ff58d54Bb67e258e2e272f57cfa3
        ] = 1363636363636363636363;
        balanceOf[
            0x9D3e8B799BDa01D0aF90e802b1Dd4FA332299D1e
        ] = 454545454545454545454;
        balanceOf[
            0x9a12285b5756c73ff74C2b7e6cee485C98Efe3F4
        ] = 2727727272727272727272;
        balanceOf[
            0x0eB911f120BC2A06049D82B2941a2504eC614d56
        ] = 914090909090909090909;
        balanceOf[
            0xD0C639e43FCa8d9ed2FFa7fe76133237974c6C58
        ] = 454545454545454545454;
        balanceOf[
            0x82FA9D779d8b9388cbE992Ff292aC0041e5E2178
        ] = 2263636363636363636363;
        balanceOf[
            0x2f7D756a9aeeB69241a84f4b9Ca7d34f2BB6A8c7
        ] = 814545454545454545454;
        balanceOf[
            0x944f0eaf65282BAd0E6a90B2041BBb0577123a12
        ] = 682727272727272727272;
        balanceOf[
            0x4dc5E762979E1c63187a1B8d12c90182B89848e2
        ] = 2209090909090909090909;
        balanceOf[
            0x2BbE9cDAbab471C3B25C8f68c1C4deCebcf31328
        ] = 3168636363636363636363;
        balanceOf[
            0x2F7C378434B8327e872eC06F54DaFeA32bB39C17
        ] = 2715909090909090909090;
        balanceOf[
            0xB28dB1EC49f50A332243b404acbfE045ee94E391
        ] = 681818181818181818181;
        balanceOf[
            0x1db9687Ab7FB31D8C8909AAb9a74EB55a9E2596C
        ] = 4546363636363636363636;
        balanceOf[
            0x029FDF7F2E409cBc08449126035EfB58F5181534
        ] = 2272727272727272727272;
        balanceOf[
            0x61DeBE098Dc37ff71c199Dd69b314a88b60817cA
        ] = 908636363636363636363;
        balanceOf[
            0xfD1737033b4Cb816cfc50363705074030e94f5F0
        ] = 1363636363636363636363;
        balanceOf[
            0x2ea99C4aCCf4B84e8825855Bf5F1527d1dc3f990
        ] = 909090909090909090909;
        balanceOf[
            0x038A109Dd605656234f46F2190E0B93d8c70c56C
        ] = 91818181818181818181;
        balanceOf[
            0xD0349bBC6Ce94b6b684616746dBb7b25CAABb09c
        ] = 1363636363636363636363;
        balanceOf[
            0xD4FabB371df174FC5D9e7C77c90a3231aFb0ba27
        ] = 454545454545454545454;
        balanceOf[
            0xce3aF71A5827dE951CB98aEA260ec89131724831
        ] = 2715909090909090909090;
        balanceOf[
            0x6d67bB35f178622BebCb349d9Dba79D7566dD489
        ] = 2272727272727272727272;
        balanceOf[
            0x2386676dB49C3Baa2a84239b77bA424DD12d212B
        ] = 1810454545454545454545;
        balanceOf[
            0x4D8EaFF3D295C0F4F8003Be37327B31afB227C91
        ] = 454545454545454545454;
        balanceOf[
            0x90ebf7eE7C850662e0E584536c2A8907f0e1b940
        ] = 1357727272727272727272;
        balanceOf[
            0x16eB7879c4d80ecb694bD48731ff0ACfBb381fd8
        ] = 454999999999999999999;
        balanceOf[
            0x761E7cD1B140e9334ECc73Ca5b22dAD8277Dc9Fd
        ] = 1810454545454545454545;
        balanceOf[
            0x8d7B7c13265ddBd1BE56327bF214F929cf0c9959
        ] = 2272727272727272727272;
        balanceOf[
            0x71ce140e3E428D5F640Aaf3a128188F1aF80Cb2a
        ] = 454545454545454545454;
        balanceOf[
            0x42E66F70bd4255a05fBfB08f9c3011d9813A2D1b
        ] = 1131363636363636363636;
        balanceOf[
            0x3CF4826D95830E1852Ba34a940804Cd2250176d5
        ] = 1584090909090909090909;
        balanceOf[
            0x1Ef17012A964049cD058188DE8429cb89c7b1358
        ] = 1363636363636363636363;
        balanceOf[
            0xFF490f8FE7Bc7272C588234a4e6B22ab53F0e785
        ] = 454545454545454545454;
        balanceOf[
            0x3D5C32C354487bd18bBbd3D420D56A74B9952EFE
        ] = 454545454545454545454;
        balanceOf[
            0x1Ff76eB3aEF1b557182d8F36Ed2b26dB36cD7D5e
        ] = 909090909090909090909;
        balanceOf[
            0x24EC3c89E08145707Be7455EeA3B6C3CA1557020
        ] = 2036818181818181818181;
        balanceOf[
            0x30F0287796362F659E341eDD24b2BBC23F2b14f3
        ] = 1363636363636363636363;
        balanceOf[
            0xbcFBF0429D68342c69A0978Fbde91b4E1094ffbc
        ] = 710909090909090909090;
        balanceOf[
            0x5bbC09a55885c9F1eE56Dd9C71a4ea74A987CdbD
        ] = 914545454545454545454;
        balanceOf[
            0x3aFA0C729a439751beB812A44F902405d621FF7E
        ] = 1131363636363636363636;
        balanceOf[
            0xd2e514235538b1F3eeF308c76d4347551f763be3
        ] = 2277272727272727272727;
        balanceOf[
            0x970c0D5F0EB76BA449B29827CcB9abf413CdbBC0
        ] = 2082272727272727272727;
        balanceOf[
            0x116b5A7B86F37c653F6F8995fc773525279999AF
        ] = 1367272727272727272727;
        balanceOf[
            0x5CC953709EDB30e693a711F34656D1e25A61fb9A
        ] = 2276818181818181818181;
        balanceOf[
            0xd97ccC9D342b5Bc78503881Bb93F11c7f50F4FF8
        ] = 915000000000000000000;
        balanceOf[
            0x9778cA76011EfB9BabD4f3D2b038a9dA7e2ecbbF
        ] = 1280909090909090909090;
        balanceOf[
            0x0Df49793E8E9f810694Db08d80ca3ebeBB743a7b
        ] = 454545454545454545454;
        balanceOf[
            0xd91Fb5dB426B72ADeC2320d2fC02006ab8194c4C
        ] = 1131363636363636363636;
        balanceOf[
            0xA4C5e122dDD75D1D2A2b1Ec10E7F53896D326284
        ] = 1303181818181818181818;
        balanceOf[
            0x4FC960f95aC39be8B66D62A253347Aea3C8EA834
        ] = 814545454545454545454;
        balanceOf[
            0x351317285a05261a82dc22C6bb22e8A3D702E887
        ] = 454545454545454545454;
        balanceOf[
            0xC1FFE039496654a7d054AF10ba85ea204655F2ce
        ] = 701363636363636363636;
        balanceOf[
            0x3Af185098400F17ae0B70a2e2fc4625cb59cbC7b
        ] = 456818181818181818181;
        balanceOf[
            0xDebC54376F04c69fBbaE1597f9Aa1B5ee14Dd583
        ] = 560909090909090909090;
        balanceOf[
            0x15B732103F267f74c2e960630b9F045A6cDbDfDa
        ] = 914090909090909090909;
        balanceOf[
            0xCe17D70663A6Cf82f760C350C2119816921c4610
        ] = 1833181818181818181818;
        balanceOf[
            0xAf84b825afF7E7ef45db23218a9FE654bd5E30fA
        ] = 1557727272727272727272;
        balanceOf[
            0x3A4Ac3585530aAf4C9C1f63581c482a95Ebb5e03
        ] = 543181818181818181818;
        balanceOf[
            0x38Ce24d1266b316AED1aeA340a4F04F1e44ea1BB
        ] = 710454545454545454545;
        balanceOf[
            0x3e4d0169cfb32b76d5fE07a56b605d52Ed106B1F
        ] = 710909090909090909090;
        balanceOf[
            0x0c675150922D9Cb1A63b26E01F58C04208223a07
        ] = 1372272727272727272727;
        balanceOf[
            0xfcFA1E649d2Bbf66A782A16B440de47cD2bFD02a
        ] = 910454545454545454545;
        balanceOf[
            0x3955c8586931ca52fbC79d6fFc655BEeD22F2221
        ] = 760454545454545454545;
        balanceOf[
            0x08611B652D1E4375899e0199DfE5BF4d1EeeB862
        ] = 1131363636363636363636;
        balanceOf[
            0x80c33d3b8E9Eda16a511BD3d7DFdb1B86e86E991
        ] = 1040909090909090909090;
        balanceOf[
            0x38Be8B32FAe60ab871B1Ff99Ea662C781d7DB024
        ] = 225909090909090909090;
        balanceOf[
            0xeB368A7b69EfE534A0b25d632EC04f4e2fd78628
        ] = 895909090909090909090;
        balanceOf[
            0x9e4590b30eC3cA82a9BD940690b5A41CF1181f31
        ] = 1629545454545454545454;
        balanceOf[
            0x7728A5B72F3E3c67a2056eBcaED2347071de49b6
        ] = 918636363636363636363;
        balanceOf[
            0x45711147208e420060A1c769ED3f4c11E84a44E7
        ] = 2122272727272727272727;
        balanceOf[
            0x986Df6417f43f98434253cd67Aa339ee30d6F7A7
        ] = 1357272727272727272727;
        balanceOf[
            0x3213d84bFdaB433B7674AC7d9768f6c5363a1335
        ] = 695909090909090909090;
        balanceOf[
            0xc9513C23578Ee613Cb0C700691EdC062b36D67c2
        ] = 454545454545454545454;
        balanceOf[
            0x6a615eF4B980A6597Dc2Aa8B7179D7E6C60dB863
        ] = 2982272727272727272727;
        balanceOf[
            0x2a40E9ce411aAdAbF29333B929462C1D91f5Bff6
        ] = 1034545454545454545454;
        balanceOf[
            0xd3562152Ce1744AE2f04EA71b543D6757e4833E1
        ] = 502727272727272727272;
        balanceOf[
            0x7191Cf857E827Bea2a05d820bb795b89ad3d8eC9
        ] = 477727272727272727272;
        balanceOf[
            0xD6C9eceA8AbEF43639338F458DaC5241a57b62b9
        ] = 2535000000000000000000;
        balanceOf[
            0xfC31aF21CF9CB279815E00e9382c5777BC478878
        ] = 1072272727272727272727;
        balanceOf[
            0xa2078b9A286A9dA12c32036f96737b0F84D461d0
        ] = 1352727272727272727272;
        balanceOf[
            0x6d7BAE88A13f27414298781cc734C93Cc78f1Aca
        ] = 723636363636363636363;
        balanceOf[
            0x7A673F7Fd457375E29A4db48f93D55Cc00ee3af6
        ] = 3144545454545454545454;
        balanceOf[
            0x52Cc083Fbdeb01e6592Ee0a987bB978c81a2FdfE
        ] = 639090909090909090909;
        balanceOf[
            0x1e83c135d83b5C17066eb9998dc2040627EaC3c7
        ] = 1311818181818181818181;
        balanceOf[
            0x426581FC8E1A8F8E5478961b02fC4F280fca6F3d
        ] = 1156363636363636363636;
        balanceOf[
            0x4B69DBdf25DAd9b5D325110C99546c0fD4B42e44
        ] = 2036818181818181818181;
        balanceOf[
            0x62C702A5432E36B15f522Ce601caB087Fd353e2A
        ] = 478181818181818181818;
        balanceOf[
            0x6C8Bf330536ce7aCcfF164bE71f8EBE3E6Da1287
        ] = 478181818181818181818;
        balanceOf[
            0xA713f0BF19d20A1cfcBE404362309495Af961A3a
        ] = 2535000000000000000000;
        balanceOf[
            0x1c520e428f9A4c617540d454D971C07CB74d69C0
        ] = 199999999999999999999;
        balanceOf[
            0x312550E62a0645c841bA49b8Bc73264F24154EF7
        ] = 1348636363636363636363;
        balanceOf[
            0x5601A36B2FEE099C75C55117788087D1654fA4C5
        ] = 543181818181818181818;
        balanceOf[
            0x4eCe06Ff8949094d7d78A281fe359689B5AF5d2a
        ] = 1538000000000000000000;
        balanceOf[
            0x081cc1F3173c7B22E4557f368ff75E5216131554
        ] = 461818181818181818181;
        balanceOf[
            0xdF56345b6Ed59F6e0D4b65517865Cc4CD112440a
        ] = 1366818181818181818181;
        balanceOf[
            0x95D8331C646A6807c72Fdb78Ea97a12a01489DD7
        ] = 1267272727272727272727;
        balanceOf[
            0x678F2C0b9C8dEde86351A14837D999B1330B2b85
        ] = 2276818181818181818181;
        balanceOf[
            0xE455dc9C96a83eadC9D662788D9Dc484b553C18f
        ] = 1670454545454545454545;
        balanceOf[
            0x25BFEc735e4298d2cE5Ca8eebc88D2eF6428D4Eb
        ] = 3512272727272727272727;
        balanceOf[
            0x48c2e4dD781003D2faE04668FB6CD32f686ca589
        ] = 1193181818181818181818;
        balanceOf[
            0x6e0B6919Bb3E7CB79159415fa726854205B67d6E
        ] = 2367727272727272727272;
        balanceOf[
            0xC0e68E99Bc1eE695da08ffe1b0B0E265ab2A2F19
        ] = 1620454545454545454545;
        balanceOf[
            0xfaEB9EB66AACaFD62ed9dAD6d88490e2Ff75BD9c
        ] = 2218181818181818181818;
        balanceOf[
            0x8356F8d13D1EaB40b3C87437E19db86eBb6D70F0
        ] = 669090909090909090909;
        balanceOf[
            0xfDFc40720E178E50FA164781A99c86218c16E3f8
        ] = 1448636363636363636363;
        balanceOf[
            0xa6a8e83b2772Ff5a22df60A9415fD1A66Ea471Db
        ] = 2399090909090909090909;
        balanceOf[
            0x4D009335b4B97b3F0A16Df930e2fF281e2688fdE
        ] = 936363636363636363636;
        balanceOf[
            0x288d0A583492E797ac2aA763cb465AFcc9e427d1
        ] = 1665909090909090909090;
        balanceOf[
            0x13A5bd32dD8e3d99CF715D5A19D9DdC4a54e5508
        ] = 696818181818181818181;
        balanceOf[
            0x67113A4A7A7ee9b7653D817F723bd6dfdE04d658
        ] = 2435454545454545454545;
        balanceOf[
            0x6E80ff2E175A1244673fDc7e1CAF1D2DfdcDC4cF
        ] = 2399090909090909090909;
        balanceOf[
            0xfc830A033786eb61460eCc00006f8f87C7A9A62d
        ] = 1432727272727272727272;
        balanceOf[
            0x0cC416837f7aEC7ADA3c16Cd4a20a6B3Edb7D978
        ] = 970000000000000000000;
        balanceOf[
            0xF5a0B6a233314D829836cbE08F279B972D4f432D
        ] = 2942272727272727272727;
        balanceOf[
            0x8FC1560Db6fdcf74c40145E3e2fd673978B107a6
        ] = 1565909090909090909090;
        balanceOf[
            0xCBBE2AE7454394D37C5635549A0Fb6689B863658
        ] = 2851818181818181818181;
        balanceOf[
            0x28bADF90a76dC288cc2bc9CfD1C04950eF8c64B2
        ] = 1977272727272727272727;
        balanceOf[
            0xEd361dA8b461BfF3c819b46Ff41B38155Fc0Aa8d
        ] = 409090909090909090909;
        balanceOf[
            0x89aE929dbd9647C64fd8287A75aB2C61dC73BcF6
        ] = 2383181818181818181818;
    }
}
