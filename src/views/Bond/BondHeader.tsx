import { useState } from "react";
import { useHistory } from "react-router-dom";
import { IconButton, SvgIcon, Link } from "@material-ui/core";
import { NextLinkFromReactRouter } from 'components/NextLink'
import { useEscape } from "../../hooks";
import { IAllBondData } from "../../hooks/bonds";

interface IBondHeaderProps {
    bond: IAllBondData;
    slippage: number;
    onSlippageChange: (e: any) => void;
}

function BondHeader({ bond, slippage, onSlippageChange }: IBondHeaderProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    let history = useHistory();

    useEscape(() => {
        if (open) handleClose;
        else history.push("/mints");
    });

    return (
        <div className="bond-header">
            <NextLinkFromReactRouter to="/mints" className="cancel-bond">
                <SvgIcon color="primary" />
            </NextLinkFromReactRouter>

            <div className="bond-header-logo">
                <div className="bond-header-name">
                    <p>{bond ? bond.displayName : ""}</p>
                </div>
            </div>

        </div>
    );
}

export default BondHeader;
