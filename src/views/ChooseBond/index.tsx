import { useSelector, useDispatch } from "react-redux";
import { Skeleton } from "@material-ui/lab";
import { Paper, Grid, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Zoom } from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { BondTableData, BondDataCard } from "./BondRow";
import { trim } from "../../helpers";
import useBonds from "../../hooks/bonds";
import {useApp} from "../../hooks/useApp";
import { IReduxState } from "../../store/slices/state.interface";
import Page from '../Page'
import { useMatchBreakpoints } from "../../../packages/uikit/src/hooks";
import { useCallback, useMemo, useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { AppDispatch, AppState } from '../../state'
import { calcBondDetails } from "../../store/slices/bond-slice";
import { loadAppDetails, IAppSlice } from "../../store/slices/app-slice";
import { calculateUserBondDetails, getBalances, loadAccountDetails } from '../../store/slices/account-slice'
import { useTranslation } from "contexts/Localization";

function ChooseBond() {
    const { bonds } = useBonds();
    const dispatch = useDispatch();
    const {t} = useTranslation();
    const { account, chainId, library } = useWeb3React()


    const { isMobile } = useMatchBreakpoints()
    const {loadApp, loadAccount} = useApp()
    const isAppLoading = useSelector<AppState, boolean>(state => state.app.loading);
    const marketPrice = useSelector<AppState, number>(state => {
        return state.app.marketPrice;
    });

    const treasuryBalance = useSelector<AppState, number>(state => {
        return state.app.treasuryBalance;
    });

    useEffect(() => {
        if (account) {
            loadApp()
            bonds.map(bond => {
                dispatch(calculateUserBondDetails({ address:account, bond, provider:library, networkID: chainId }));
            });
        }
    }, [account])
    return (
        <Page>
            <div className="ido-view" style={isMobile ? { margin: "unset" } : {}}>
                <Zoom in={true}>
                    <div className="ido-view-card">
                        <div className="ido-view-card-header">
                            <p className="ido-view-card-title"> Mint (🎩, 🎩)</p>
                        </div>

                        <Grid container item xs={12} spacing={2} className="ido-view-card-metrics">
                            <Grid item xs={12} sm={6}>
                                <Box textAlign="center">
                                    <p className="ido-view-card-metrics-title">{t("Treasury Balance")}</p>
                                    <p className="ido-view-card-metrics-value">
                                        {isAppLoading ? (
                                            <Skeleton width="180px" />
                                        ) : (
                                            new Intl.NumberFormat("en-US", {
                                                style: "currency",
                                                currency: "USD",
                                                maximumFractionDigits: 0,
                                                minimumFractionDigits: 0,
                                            }).format(treasuryBalance)
                                        )}
                                    </p>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box textAlign="center">
                                    <p className="ido-view-card-metrics-title">MLS Price</p>
                                    <p className="ido-view-card-metrics-value">{isAppLoading ? <Skeleton width="100px" /> : `$${trim(marketPrice, 2)}`}</p>
                                </Box>
                            </Grid>
                        </Grid>

                        {!isMobile && (
                            <Grid container item>
                                <TableContainer className="ido-view-card-table">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">
                                                    <p className="ido-view-card-table-title">{t("Mint")}</p>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <p className="ido-view-card-table-title">{t("Price")}</p>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <p className="ido-view-card-table-title">{t("ROI")}</p>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <p className="ido-view-card-table-title">{t("Purchased")}</p>
                                                </TableCell>
                                                <TableCell align="right"></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {bonds.map(bond => (
                                                <BondTableData key={bond.name} bond={bond} />
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        )}
                    </div>
                </Zoom>

                {isMobile && (
                    <div className="ido-view-card-container">
                        <Grid container item spacing={2}>
                            {bonds.map(bond => (
                                <Grid item xs={12} key={bond.name}>
                                    <BondDataCard key={bond.name} bond={bond} />
                                </Grid>
                            ))}
                        </Grid>
                    </div>
                )}
            </div>
        </Page>
    );
}

export default ChooseBond;
