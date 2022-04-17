import React, { useState } from "react";
import { Box, Modal, Paper, SvgIcon, IconButton, OutlinedInput, InputAdornment } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";

import IconsSearch from "../../../../assets/icons/akar-icons_search.svg";
import useTokens, { IAllTokenData } from "../../../../hooks/Tokens";
import { trim } from "../../../../helpers";
import { IAllBondData } from "../../../../hooks/bonds";
// import { dai } from "../../../../helpers/bond";
// import { dai as mimToken } from "../../../../helpers/tokens";

interface IChooseTokenProps {
    open: boolean;
    handleClose: () => void;
    handleSelect: (token: IAllTokenData) => void;
    bond: IAllBondData;
}

function ChooseToken({ open, handleClose, handleSelect, bond }: IChooseTokenProps) {
    const { tokens, loading } = useTokens();

    const [quantity, setQuantity] = useState("");

    const filtredTokens = tokens.filter(({ name, address, isAvax }) => {
        let addressTest = true;

        if (quantity && quantity.length === 42) {
            addressTest = address.toLocaleLowerCase() === quantity.toLowerCase();
        }

        let nameTest = true;

        if (quantity && quantity.length < 10) {
            nameTest = name.toLowerCase().includes(quantity.toLowerCase());
        }

        let lpFilter = true;

        // if (bond.name === dai.name) {
        //     lpFilter = mimToken.address !== address;
        // }

        // if (bond.name === wavax.name) {
        //     lpFilter = isAvax ? false : wavaxToken.address !== address;
        // }

        return nameTest && addressTest && lpFilter;
    });

    return (
        <Modal id="hades" open={open} onClose={handleClose} hideBackdrop>
            <Paper className="mls-card mls-popover choose-token-poper">
                <div className="cross-wrap">
                    <IconButton onClick={handleClose}>
                        <SvgIcon color="primary"  />
                    </IconButton>
                </div>
                <Box>
                    <div className="choose-token-poper-header">
                        <p className="choose-token-poper-header-title">Choose token</p>
                        <OutlinedInput
                            placeholder="Search name or paste address"
                            className="choose-token-poper-header-input"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            labelWidth={0}
                            startAdornment={
                                <InputAdornment position="start">
                                    <Box display="flex" alignItems="center" justifyContent="center" width={"24px"}>
                                        <img src={IconsSearch} style={{ height: "24px", width: "24px" }} />
                                    </Box>
                                </InputAdornment>
                            }
                        />
                    </div>

                    <div className="choose-token-poper-body">
                        {filtredTokens.map(token => (
                            <div onClick={() => handleSelect(token)} key={token.address} className="choose-token-poper-body-item">
                                <img className="choose-token-poper-body-item-img" src={token.img} alt="" />
                                <div className="choose-token-poper-body-item-desc">
                                    <p className="choose-token-poper-body-item-name">{token.name}</p>
                                    <div className="choose-token-poper-body-item-balance">{loading ? <Skeleton width="50px" /> : <p>{trim(token.balance, 6)}</p>}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Box>
            </Paper>
        </Modal>
    );
}

export default ChooseToken;
