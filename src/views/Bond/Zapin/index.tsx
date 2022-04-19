import React, { useState, useCallback, useEffect } from "react";
import { useWeb3React } from '@web3-react/core'
import { utils } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@material-ui/lab";
import { Box, Modal, Paper, SvgIcon, IconButton, OutlinedInput, InputAdornment } from "@material-ui/core";
import ChooseToken from "./ChooseToken";
import { IAllBondData } from "../../../hooks/bonds";
import useTokens, { IAllTokenData } from "../../../hooks/Tokens";
import { avax } from "../../../helpers/tokens";
import { shorten, trim } from "../../../helpers";
import { IReduxState } from "../../../store/slices/state.interface";
import { changeApproval, calcZapinDetails, ITokenZapinResponse, zapinMint } from "../../../store/slices/zapin-thunk";
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../../store/slices/pending-txns-slice";
import { warning } from "../../../store/slices/messages-slice";
import { messages } from "../../../constants/messages";
import { calcBondDetails } from "../../../store/slices/bond-slice";
import ArrowUpImg from "../../../assets/icons/arrow-down.svg";
import {AppState} from "state"

interface IZapinProps {
    open: boolean;
    handleClose: () => void;
    bond: IAllBondData;
}

function Zapin({ open, handleClose, bond }: IZapinProps) {
    const { tokens } = useTokens();
    const {account, chainId, library } = useWeb3React()
    const address = account
    const provider = library
    const dispatch = useDispatch();

    const isBondLoading = useSelector<AppState, boolean>(state => state.bonding.loading ?? true);
    const pendingTransactions = useSelector<AppState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    let defaultToken = tokens.find(token => token.name === avax.name);

    // if (bond.name === wavax.name) {
    //     defaultToken = tokens.find(token => token.name === dai.name);
    // }

    const [quantity, setQuantity] = useState<string>("");
    //@ts-ignore
    const [token, setToken] = useState<IAllTokenData>(defaultToken);
    const [chooseTokenOpen, setChooseTokenOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [slippage, setSlippage] = useState(2);
    const [swapInfo, setSwapInfo] = useState<ITokenZapinResponse>({ swapData: "", swapTarget: "", amount: "", value: "0" });
    const [priceToken, setPriceToken] = useState<number>(0);

    const [loading, setLoading] = useState(false);

    const hasAllowance = useCallback(() => {
        return token.allowance > 0;
    }, [token.allowance]);

    const onSeekApproval = async () => {

        dispatch(changeApproval({ address, token, provider, networkID: chainId }));
    };

    const onMint = async () => {

        if (!swapInfo.amount || !swapInfo.swapData || !swapInfo.swapTarget || swapInfo.value !== quantity) {
            return dispatch(warning({ text: messages.something_wrong }));
        }

        dispatch(
            zapinMint({
                provider,
                networkID: chainId,
                bond,
                token,
                value: quantity,
                minReturnAmount: swapInfo.amount,
                swapTarget: swapInfo.swapTarget,
                swapData: swapInfo.swapData,
                slippage,
                address,
            }),
        );
    };

    const onSlippageChange = (value: any) => {
        return setSlippage(value);
    };

    const setMax = () => {
        const maxBondPriceToken = bond.maxBondPriceToken / priceToken;
        let amount: any = Math.min(maxBondPriceToken, token.isAvax ? token.balance * 0.99 : token.balance);

        if (amount) {
            amount = trim(amount);
        }

        setQuantity((amount || "").toString());
    };

    useEffect(() => {
        let timeount: any = null;

        clearTimeout(timeount);

        if (Number(quantity) > 0) {
            setSwapInfo({ swapData: "", swapTarget: "", amount: "", value: "0" });
            setLoading(true);
            timeount = setTimeout(async () => {
                const info = await calcZapinDetails({ token, provider, networkID: chainId, bond, value: quantity, slippage, dispatch });
                if (info.amount) {
                    const amount = utils.formatEther(info.amount);
                    dispatch(calcBondDetails({ bond, value: amount, provider, networkID: chainId }));
                } else {
                    dispatch(calcBondDetails({ bond, value: "0", provider, networkID: chainId }));
                }
                setSwapInfo(info);
                setLoading(false);
            }, 1000);
        } else {
            setSwapInfo({ swapData: "", swapTarget: "", amount: "", value: "0" });
            dispatch(calcBondDetails({ bond, value: "0", provider, networkID: chainId }));
            setLoading(false);
        }
        return () => clearTimeout(timeount);
    }, [quantity, slippage]);

    // useEffect(() => {
    //     setTimeout(async () => {
    //         const { amount } = await calcZapinDetails({ token, provider, networkID: chainId, bond, value: "1", slippage, dispatch });
    //         if (amount) {
    //             const amountValue = utils.formatEther(amount);
    //             setPriceToken(Number(amountValue));
    //         }
    //     }, 500);
    // }, [token, slippage]);

    let minimumReceivedAmount = "0";

    if (swapInfo.amount) {
        const minimumReceivedAmountValue = utils.formatEther(swapInfo.amount);
        minimumReceivedAmount = trim(Number(minimumReceivedAmountValue), 6);
    }

    const handleChooseTokenOpen = () => {
        setChooseTokenOpen(true);
    };

    const handleChooseTokenClose = () => {
        setChooseTokenOpen(false);
    };

    const handleChooseTokenSelect = (token: IAllTokenData) => {
        setQuantity("");
        setToken(token);
        setChooseTokenOpen(false);
        setSwapInfo({ swapData: "", swapTarget: "", amount: "", value: "0" });
    };

    const handleSettingsOpen = () => {
        setSettingsOpen(true);
    };

    const handleSettingsClose = () => {
        setSettingsOpen(false);
    };

    const isLoading = isBondLoading || loading;

    return (
        <Modal id="hades" open={open} onClose={handleClose} hideBackdrop>
            <Paper className="mls-card mls-popover zapin-poper">
                <div className="cross-wrap">
                    <IconButton onClick={handleClose}>
                        <SvgIcon color="primary" />
                    </IconButton>
                    <IconButton style={{ marginLeft: "auto" }} onClick={handleSettingsOpen}>
                        <SvgIcon color="primary" />
                    </IconButton>
                </div>
                <Box className="card-content">
                    <div className="zapin-header">
                        <div className="zapin-header-token-select-wrap">
                            <p className="zapin-header-token-select-title">Zapin & Mint</p>
                            <OutlinedInput
                                type="number"
                                placeholder="Amount"
                                className="zapin-header-token-select-input"
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                labelWidth={0}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <div onClick={handleChooseTokenOpen} className="zapin-header-token-select-input-token-select">
                                            <img className="zapin-header-token-select-input-token-select-logo" src={token.img} alt="" />
                                            <p>{token.name}</p>
                                            <Box display="flex" alignItems="center" justifyContent="center" width={"16px"}>
                                                <img src={ArrowUpImg} style={{ height: "16px", width: "16px" }} />
                                            </Box>
                                        </div>
                                    </InputAdornment>
                                }
                                endAdornment={
                                    <InputAdornment position="end">
                                        <div className="zapin-header-token-select-input-btn" onClick={setMax}>
                                            <p>Max</p>
                                        </div>
                                    </InputAdornment>
                                }
                            />
                            {hasAllowance() || token.isAvax ? (
                                <div
                                    className="zapin-header-token-select-btn"
                                    onClick={async () => {
                                        if (isPendingTxn(pendingTransactions, "zapin_" + token.name + "_" + bond.name)) return;
                                        await onMint();
                                    }}
                                >
                                    <p>{txnButtonText(pendingTransactions, "zapin_" + token.name + "_" + bond.name, "Mint")}</p>
                                </div>
                            ) : (
                                <div
                                    className="zapin-header-token-select-btn"
                                    onClick={async () => {
                                        if (isPendingTxn(pendingTransactions, "approve_" + token.address)) return;
                                        await onSeekApproval();
                                    }}
                                >
                                    <p>{txnButtonText(pendingTransactions, "approve_" + token.address, "Approve")}</p>
                                </div>
                            )}
                        </div>
                        {!hasAllowance() && !token.isAvax && (
                            <div className="zapin-header-help-text">
                                <p>Note: The "Approve" transaction is only needed when bonding for the first time</p>
                                <p>for each token; subsequent bonding only requires you to perform the</p>
                                <p>"zapin&mint" transaction.</p>
                            </div>
                        )}
                    </div>
                    <div className="zapin-body">
                        <div className="zapin-body-header">
                            {/* <BondLogo bond={bond} /> */}
                            <div className="zapin-body-header-name">
                                <p>TX settings</p>
                            </div>
                        </div>
                        <div className="zapin-body-params">
                            <div className="data-row">
                                <p className="data-row-name">Destination token </p>
                                <p className="data-row-value">{bond.displayName}</p>
                            </div>
                            <div className="data-row">
                                <p className="data-row-name">Slippage Tolerance</p>
                                <p className="data-row-value">{trim(slippage)}%</p>
                            </div>
                            <div className="data-row">
                                <p className="data-row-name">Your Balance</p>
                                <p className="data-row-value">{`${trim(token.balance, 6)} ${token.name}`}</p>
                            </div>
                            <div className="data-row">
                                <p className="data-row-name">Minimum Received Amount</p>
                                <p className="data-row-value">{isLoading ? <Skeleton width="100px" /> : `${minimumReceivedAmount} ${bond.displayUnits}`}</p>
                            </div>
                            <div className="data-row">
                                <p className="data-row-name">Approximately you will get</p>
                                <p className="data-row-value">{isLoading ? <Skeleton width="100px" /> : `~ ${trim(bond.bondQuote, 4)} MLS`}</p>
                            </div>
                            <div className="data-row">
                                <p className="data-row-name">Max You Can Buy</p>
                                <p className="data-row-value">{isLoading ? <Skeleton width="100px" /> : `${trim(bond.maxBondPrice, 4)} MLS`}</p>
                            </div>
                            <div className="data-row">
                                <p className="data-row-name">ROI</p>
                                <p className="data-row-value">{isLoading ? <Skeleton width="100px" /> : `${trim(bond.bondDiscount * 100, 2)}%`}</p>
                            </div>
                            <div className="data-row">
                                <p className="data-row-name">Minimum purchase</p>
                                <p className="data-row-value">0.01 TIME</p>
                            </div>
                        </div>
                    </div>
                    <ChooseToken open={chooseTokenOpen} handleClose={handleChooseTokenClose} handleSelect={handleChooseTokenSelect} bond={bond} />
                </Box>
            </Paper>
        </Modal>
    );
}

export default Zapin;
