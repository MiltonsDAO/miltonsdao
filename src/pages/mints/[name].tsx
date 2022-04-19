import { Bond } from 'views/Bond'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import useBonds, { IAllBondData } from 'hooks/bonds'
import { BondType, NetworkAddresses } from "helpers/bond/constants"
import { Networks } from 'constants/blockchain'

const BondPage = (props) => {
    const router = useRouter()
    const nameByRouter = router.query.name || ""
    const bonds = useBonds().bonds
    const bondProps: IAllBondData[] = bonds.filter((bond) => bond.name === nameByRouter)
    return <Bond bond={bondProps[0]} />
}

export default BondPage
