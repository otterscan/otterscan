const TabGroup: React.FC = ({ children }) => (
  <div className="flex space-x-2 border-l border-r border-t rounded-t-lg bg-white">
    {children}
  </div>
);

export default TabGroup;
