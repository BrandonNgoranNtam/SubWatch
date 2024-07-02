import HeaderBox from "@/components/HeaderBox";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import React from "react";


const Home = () => {
    const loggedIn = { firstName: "Brandon", lastName: "Ngoran Ntam" }
    return (
        <section className="home">
            <div className="home-content">
                <header className="home-header">
                    <HeaderBox
                        type="greeting"
                        title="Welcome"
                        user={loggedIn?.firstName + " " + loggedIn?.lastName || "Guest"}
                        subtext=" Access and manage your subscriptions efficiently" />
                        <TotalBalanceBox accounts={[]} totalBanks={0} totalCurrentBalance={1250.35} />

                </header>
            </div>
        </section>
    )
};

export default Home;