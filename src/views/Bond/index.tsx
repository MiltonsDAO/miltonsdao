import { useState } from "react";
import { useSelector } from "react-redux";
import { useWeb3React } from '@web3-react/core'
import classnames from "classnames";
import { Skeleton } from "@material-ui/lab";
import { Grid, Backdrop, Box, Fade } from "@material-ui/core";

import { trim } from "../../helpers";
import BondHeader from "./BondHeader";
import BondRedeem from "./BondRedeem";
import BondPurchase from "./BondPurchase";
import { IReduxState } from "../../store/slices/state.interface";
import { IAllBondData } from "../../hooks/bonds";
import Page from '../Page'
import { GetStaticPaths, GetStaticProps } from 'next'
import { AppState } from 'state'

function TabPanel(props: any) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other} style={{ overflow: "hidden" }}>
            {value === index && <Box p={3}>{children}</Box>}
        </div>
    );
}

export interface IBondProps {
    bond: IAllBondData;
}

export function Bond({ bond }: IBondProps) {
    const [slippage, setSlippage] = useState(0.5);

    const [view, setView] = useState(0);

    const isBondLoading = useSelector<AppState, boolean>(state => state.bonding.loading ?? true);

    const onSlippageChange = (value: any) => {
        return setSlippage(value);
    };

    const changeView = (newView: number) => () => {
        setView(newView);
    };

    return (
        <Page>
            <Fade in={true} mountOnEnter unmountOnExit>
                <Grid className="bond-view">
                    <Backdrop open={true}>
                        <Fade in={true}>
                            <div className="bond-card">
                                <BondHeader bond={bond} slippage={slippage} onSlippageChange={onSlippageChange} />
                                {/* @ts-ignore */}
                                <Box direction="row" className="bond-price-data-row">
                                    <div className="bond-price-data">
                                        <p className="bond-price-data-title">Mint Price</p>
                                        <p className="bond-price-data-value">
                                            {isBondLoading ? <Skeleton /> : bond.isLP || bond.name === "wavax" ? `$${trim(bond.bondPrice, 2)}` : `${trim(bond.bondPrice, 2)} USDT`}
                                        </p>
                                    </div>
                                    <div className="bond-price-data">
                                        <p className="bond-price-data-title">MLS Price</p>
                                        <p className="bond-price-data-value">{isBondLoading ? <Skeleton /> : `$${trim(bond.marketPrice, 2)}`}</p>
                                    </div>
                                </Box>

                                <div className="bond-one-table">
                                    <div className={classnames("bond-one-table-btn", { active: !view })} onClick={changeView(0)}>
                                        <p>Mint</p>
                                    </div>
                                    <div className={classnames("bond-one-table-btn", { active: view })} onClick={changeView(1)}>
                                        <p>Redeem</p>
                                    </div>
                                </div>

                                <TabPanel value={view} index={0}>
                                    <BondPurchase bond={bond} slippage={slippage} />
                                </TabPanel>

                                <TabPanel value={view} index={1}>
                                    <BondRedeem bond={bond} />
                                </TabPanel>
                            </div>
                        </Fade>
                    </Backdrop>
                </Grid>
            </Fade>
        </Page>
    );
}
