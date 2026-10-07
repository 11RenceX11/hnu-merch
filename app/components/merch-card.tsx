type MerchCardProps = {
    name: string;
    description: string;
    salary: bigint;
}

export default function MerchCard({
    name,
    description,
    salary
}: MerchCardProps) {
    return (
        <div className="px-10 py-10">
            <div >{ name }</div>
            <div>{ salary }</div>
            <div>{ description }</div>
        </div>
    )
}