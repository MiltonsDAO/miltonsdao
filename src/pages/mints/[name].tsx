import { Bond } from 'views/Bond'
import { GetStaticPaths, GetStaticProps } from 'next'

const BondPage = (props) => {
    console.log("BondPage:", props)
    return <Bond bond={props} />
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
        props: {
            name,
        },
    }
}
