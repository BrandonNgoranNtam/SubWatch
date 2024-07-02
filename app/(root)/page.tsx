import HeaderBox from "@/components/HeaderBox";
import RightSidebar from "@/components/RightSidebar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import React from "react";


const Home = () => {
    const loggedIn = { firstName: "Brandon", lastName: "Ngoran Ntam", email: "brandonngoranntam@outlook.com" }
    return (
        <section className="home">
            <div className="home-content">
                <header className="home-header">
                    <HeaderBox
                        type="greeting"
                        title="Welcome"
                        user={loggedIn?.firstName + " " + loggedIn?.lastName || "Guest"}
                        subtext=" Access and manage your subscriptions efficiently" />
                    <TotalBalanceBox accounts={[]} totalBanks={3} totalCurrentBalance={452584.35} />

                </header>
                RECENT TRANSACTIONS
            </div>
            <RightSidebar user={loggedIn} transactions={[]} banks={[{currentBalance: 241553.50},{currentBalance: 50}]} />
        </section>
    )
};

export default Home;