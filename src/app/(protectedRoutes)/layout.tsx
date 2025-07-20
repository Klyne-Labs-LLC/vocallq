import { onAuthenticateUser } from "@/action/auth";
import { getAllProductsFromStripe } from "@/action/stripe";
import Header from "@/components/ReusableComponent/LayoutComponents/Header";
import Sidebar from "@/components/ReusableComponent/LayoutComponents/Sidebar";
import Footer from "@/components/ReusableComponent/Footer";
import { UserWithAiAgent } from "@/lib/type";
import { redirect } from "next/navigation";
import type React from "react";

type Props = {
  children: React.ReactNode;
};

export const dynamic = 'force-dynamic';

const Layout = async ({ children }: Props) => {
  const userExist = await onAuthenticateUser();
  if (!userExist.user) {
    redirect("/sign-in");
  }
  const user = userExist.user as UserWithAiAgent;
  const stripeProducts = await getAllProductsFromStripe();


  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main content area with left margin for sidebar */}
      <div style={{ marginLeft: '6rem' }} className="sm:ml-32 flex-1">
        <div className="flex flex-col w-full min-h-screen px-4 scrollbar-hide container mx-auto">
          {/* Fixed header */}
          <Header
            assistants={user?.aiAgents || []}
            user={user}
            stripeProducts={stripeProducts.products || []}
          />
          {/* Scrollable content area with increased bottom padding */}
          <div className="flex-1 py-10">{children}</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ paddingLeft: '6rem' }} className="sm:pl-32">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
