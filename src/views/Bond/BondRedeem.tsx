import { useSelector, useDispatch } from "react-redux";
import { Box, Slide } from "@material-ui/core";
import { useWeb3React } from '@web3-react/core'
import { Skeleton } from "@material-ui/lab";

import { IBondDetails, redeemBond } from "../../store/slices/bond-slice";
import { trim, prettifySeconds, prettyVestingPeriod } from "../../helpers";
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../store/slices/pending-txns-slice";
import { IReduxState } from "../../store/slices/state.interface";
import { IAllBondData } from "../../hooks/bonds";
import { IUserBondDetails } from "../../store/slices/account-slice";
import { messages } from "../../constants/messages";
import { warning } from "../../store/slices/messages-slice";
import { AppDispatch, AppState } from 'state'

interface IBondRedeem {
    bond: IAllBondData;
}

function BondRedeem({ bond }: IBondRedeem) {
    const dispatch = useDispatch();
    const {account, chainId, library } = useWeb3React()
    const address = account
    const provider = library
    const isBondLoading = useSelector<AppState, boolean>(state => state.bonding.loading ?? true);

    const currentBlockTime = useSelector<AppState, number>(state => {
        return state.app.currentBlockTime;
    });

    const pendingTransactions = useSelector<AppState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const bondingState = useSelector<AppState, IBondDetails>(state => {
        return state.bonding && state.bonding[bond.name];
    });

    const bondDetails = useSelector<AppState, IUserBondDetails>(state => {
        return state.account.bonds && state.account.bonds[bond.name];
    });

    async function onRedeem(autostake: boolean) {
        if (bond.interestDue === 0 || bond.pendingPayout === 0) {
            dispatch(warning({ text: messages.nothing_to_claim }));
            return;
        }

        await dispatch(redeemBond({ address, bond, networkID: chainId, provider, autostake }));
    }

    const vestingTime = () => {
        if (!bondDetails) {
            return "";
        }
        return prettyVestingPeriod(currentBlockTime, bondDetails.bondMaturationBlock);
    };

    const vestingPeriod = () => {
        return prettifySeconds(bondingState.vestingTerm, "day");
    };

    return (
        <Box display="flex" flexDirection="column">
            <Box display="flex" justifyContent="space-around" flexWrap="wrap">
                <div
                    className="transaction-button bond-approve-btn"
                    onClick={() => {
                        if (isPendingTxn(pendingTransactions, "redeem_bond_" + bond.name)) return;
                        onRedeem(false);
                    }}
                >
                    <p>{txnButtonText(pendingTransactions, "redeem_bond_" + bond.name, "Claim")}</p>
                </div>
                <div
                    className="transaction-button bond-approve-btn"
                    onClick={() => {
                        if (isPendingTxn(pendingTransactions, "redeem_bond_" + bond.name + "_autostake")) return;
                        onRedeem(true);
                    }}
                >
                    <p>{txnButtonText(pendingTransactions, "redeem_bond_" + bond.name + "_autostake", "Claim and Autostake")}</p>
                </div>
            </Box>

            <Slide direction="right" in={true} mountOnEnter unmountOnExit {...{ timeout: 533 }}>
                <Box className="bond-data">
                    <div className="data-row">
                        <p className="bond-balance-title">Pending Rewards</p>
                        <p className="price-data bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : `${bond.interestDue} MLS`}</p>
                    </div>
                    <div className="data-row">
                        <p className="bond-balance-title">Claimable Rewards</p>
                        <p className="price-data bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : `${bond.pendingPayout} MLS`}</p>
                    </div>
                    <div className="data-row">
                        <p className="bond-balance-title">Time until fully vested</p>
                        <p className="price-data bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : vestingTime()}</p>
                    </div>

                    <div className="data-row">
                        <p className="bond-balance-title">ROI</p>
                        <p className="bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.bondDiscount * 100, 2)}%`}</p>
                    </div>

                    <div className="data-row">
                        <p className="bond-balance-title">Vesting Term</p>
                        <p className="bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : vestingPeriod()}</p>
                    </div>
                </Box>
            </Slide>
        </Box>
    );
}

export default BondRedeem;
