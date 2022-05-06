import { Bond } from 'views/Bond'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import useBonds, { IAllBondData } from 'hooks/bonds'
import { BondType, NetworkAddresses } from "helpers/bond/constants"
import { Networks } from 'constants/blockchain'

const BondPage = ({ name }: { name: string }) => {
    const router = useRouter()
    const nameByRouter = router.query.name || ""
    const bonds = useBonds().bonds
    const bondProps: IAllBondData[] = bonds.filter((bond) => bond.name === name)
    return <Bond bond={bondProps[0]} />
}

export default BondPage

export const getStaticPaths: GetStaticPaths = () => {
    return {
      paths: [],
      fallback: true,
    }
  }
  
  export const getStaticProps: GetStaticProps = async ({ params }) => {
    const name = params?.name
    return {
      props: {name},
    }
  }