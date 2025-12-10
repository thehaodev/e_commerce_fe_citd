import AppHeader from "./AppHeader";

const SellerLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default SellerLayout;
