type ChainInfoItemProps = {
  title: React.ReactNode,
  data: React.ReactNode,
};

const ChainInfoItem: React.FC<ChainInfoItemProps> = ({ title, data }) => {

  return (
    <span className="">
      <span className="px-2 py-1 font-bold text-gray-500">
      {title}
      </span>
      <br/>
      <span className="px-2 py-1">
      {data}
      </span>
    </span>
  );
};

export default ChainInfoItem;
