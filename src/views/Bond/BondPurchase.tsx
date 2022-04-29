import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useWeb3React } from '@web3-react/core'
import { Skeleton } from "@material-ui/lab";

import { Box, OutlinedInput, InputAdornment, Slide, FormControl } from "@material-ui/core";
import { shorten, trim, prettifySeconds } from "../../helpers";
import { changeApproval, bondAsset, calcBondDetails } from "../../store/slices/bond-slice";
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../store/slices/pending-txns-slice";
import { IReduxState } from "../../store/slices/state.interface";
import { IAllBondData } from "../../hooks/bonds";
import useDebounce from "../../hooks/debounce";
import { messages } from "../../constants/messages";
import { warning } from "../../store/slices/messages-slice";
import Zapin from "./Zapin";
import useToast from '../../hooks/useToast'
import { AppDispatch, AppState } from 'state'

interface IBondPurchaseProps {
    bond: IAllBondData;
    slippage: number;
}

const zeroAddress = "0x0000000000000000000000000000000000000000"
function BondPurchase({ bond, slippage }: IBondPurchaseProps) {
    const dispatch = useDispatch();
    const { toastSuccess, toastError, toastWarning, toastInfo } = useToast()

    const { account, chainId, library } = useWeb3React()
    const address = account
    const provider = library

    const [quantity, setQuantity] = useState("");
    const [useAvax, setUseAvax] = useState(false);
    const [referral, setReferral] = useState(zeroAddress);

    const isBondLoading = useSelector<AppState, boolean>(state => state.bonding.loading ?? true);
    const [zapinOpen, setZapinOpen] = useState(false);

    const pendingTransactions = useSelector<AppState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const vestingPeriod = () => {
        var result = prettifySeconds(bond.vestingTerm, "day");
        console.log("result:",result, bond.vestingTerm)
        return result;
    };


    const bondDetailsDebounce = useDebounce(quantity, 1000);

    useEffect(() => {
        console.log("quantity:",quantity)
        dispatch(calcBondDetails({ bond, value: quantity, provider, networkID: chainId }));
    }, [bondDetailsDebounce]);


    async function onBond() {
        if (quantity === "") {
            toastWarning("warning", messages.before_minting);
            //@ts-ignore
        } else if (isNaN(quantity)) {
            toastWarning("warning", messages.before_minting);
        } else if (bond.interestDue > 0 || bond.pendingPayout > 0) {
            const shouldProceed = window.confirm(messages.existing_mint);
            if (shouldProceed) {
                const trimBalance = trim(Number(quantity), 10);

                await dispatch(
                    bondAsset({
                        value: trimBalance,
                        slippage,
                        bond,
                        networkID: chainId,
                        provider,
                        address,
                        useAvax,
                        referral
                    }),
                );
                clearInput();
            }
        } else {
            const trimBalance = trim(Number(quantity), 10);
            console.log("trimBalance:", trimBalance)

            await dispatch(
                //@ts-ignore
                bondAsset({
                    value: trimBalance,
                    slippage,
                    bond,
                    networkID: chainId,
                    provider,
                    address,
                    useAvax,
                    referral
                }),
            );
            clearInput();
        }
    }

    const clearInput = () => {
        setQuantity("");
    };

    const hasAllowance = useCallback(() => {
        return bond.allowance > 0;
    }, [bond.allowance]);

    const setMax = () => {
        let amount: any = Math.min(bond.maxBondPriceToken * 0.9999, useAvax ? bond.avaxBalance * 0.99 : bond.balance);
        if (amount) {
            amount = trim(amount);
        }
        setQuantity((amount || "").toString());
    };


    const onSeekApproval = async () => {
        dispatch(changeApproval({ address, bond, provider, networkID: chainId }));
    };

    const handleZapinOpen = () => {
        dispatch(calcBondDetails({ bond, value: "0", provider, networkID: chainId }));
        setZapinOpen(true);
    };

    const handleZapinClose = () => {
        dispatch(calcBondDetails({ bond, value: quantity, provider, networkID: chainId }));
        setZapinOpen(false);
    };

    const displayUnits = useAvax ? "AVAX" : bond.displayUnits;

    return (
        <Box display="flex" flexDirection="column">
            <Box display="flex" justifyContent="space-around" flexWrap="wrap">
                {bond.name === "wavax" && (
                    <FormControl className="mls-input" variant="outlined" color="primary" fullWidth>
                        <div className="avax-checkbox">
                            <input type="checkbox" checked={useAvax} onClick={() => setUseAvax(!useAvax)} />
                            <p>Use AVAX</p>
                        </div>
                    </FormControl>
                )}
                <FormControl className="bond-input-wrap" variant="outlined" color="primary" fullWidth>
                    <OutlinedInput
                        placeholder="Referral"
                        value={referral}
                        onChange={e => setReferral(e.target.value)}
                        labelWidth={0}
                        className="bond-input"
                    />
                </FormControl>
                <FormControl className="bond-input-wrap" variant="outlined" color="primary" fullWidth>
                    <OutlinedInput
                        placeholder="Amount"
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        labelWidth={0}
                        className="bond-input"
                        endAdornment={
                            <InputAdornment position="end">
                                <div className="stake-input-btn" onClick={setMax}>
                                    <p>Max</p>
                                </div>
                            </InputAdornment>
                        }
                    />
                </FormControl>

                {hasAllowance() ? (
                    <div
                        className="transaction-button bond-approve-btn"
                        onClick={async () => {
                            if (isPendingTxn(pendingTransactions, "bond_" + bond.name)) return;
                            await onBond();
                        }}
                    >
                        <p>{txnButtonText(pendingTransactions, "bond_" + bond.name, "Mint")}</p>
                    </div>
                ) : (
                    <div
                        className="transaction-button bond-approve-btn"
                        onClick={async () => {
                            if (isPendingTxn(pendingTransactions, "approve_" + bond.name)) return;
                            await onSeekApproval();
                        }}
                    >
                        <p>{txnButtonText(pendingTransactions, "approve_" + bond.name, "Approve")}</p>
                    </div>
                )}

                {!hasAllowance() && !useAvax && (
                    <div className="help-text">
                        <p className="help-text-desc">
                            Note: The "Approve" transaction is only needed when minting for the first time; subsequent minting only requires you to perform the "Mint" transaction.
                        </p>
                    </div>
                )}
            </Box>

            <Slide direction="left" in={true} mountOnEnter unmountOnExit {...{ timeout: 533 }}>
                <Box className="bond-data">
                    <div className="data-row">
                        <p className="bond-balance-title">Your Balance</p>
                        <p className="bond-balance-title">
                            {isBondLoading ? (
                                <Skeleton width="100px" />
                            ) : (
                                <>
                                    {trim(useAvax ? bond.avaxBalance : bond.balance, 18)} {displayUnits}
                                </>
                            )}
                        </p>
                    </div>

                    <div className="data-row">
                        <p className="bond-balance-title">You Will Get</p>
                        <p className="price-data bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.bondQuote, 4)} MLS`}</p>
                    </div>

                    <div className={`data-row`}>
                        <p className="bond-balance-title">Max You Can Buy</p>
                        <p className="price-data bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.maxBondPrice, 4)} MLS`}</p>
                    </div>

                    <div className="data-row">
                        <p className="bond-balance-title">ROI</p>
                        <p className="bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.bondDiscount * 100, 2)}%`}</p>
                    </div>

                    <div className="data-row">
                        <p className="bond-balance-title">Vesting Term</p>
                        <p className="bond-balance-title">{ vestingPeriod()}</p>
                    </div>

                    <div className="data-row">
                        <p className="bond-balance-title">Minimum purchase</p>
                        <p className="bond-balance-title">0.01 MLS</p>
                    </div>
                </Box>
            </Slide>
            <Zapin open={zapinOpen} handleClose={handleZapinClose} bond={bond} />
        </Box>
    );
}

export default BondPurchase;
