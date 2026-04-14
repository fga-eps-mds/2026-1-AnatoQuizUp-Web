export const Button = ({ children, ...props }) => (
  <button 
    className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
    {...props}
  >
    {children}
  </button>
);